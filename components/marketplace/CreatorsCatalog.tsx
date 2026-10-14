'use client';

import { trPlural } from '@/lib/i18n/active';
import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { CreatorCard } from '@/components/CreatorCard';
import { ServiceProviderFilterPills } from '@/components/marketplace/ServiceProviderFilterPills';
import { ContentPostDialogShell } from '@/components/creator/ContentPostDialogShell';
import {
  PROVIDER_FRAME_CLASS,
  PROVIDER_INK_CLASS,
  PROVIDER_MUTED_CLASS,
  ProviderTextAction,
} from '@/components/marketplace/ProviderDirectoryPrimitives';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import {
  ProviderRailSwitch,
  ProviderRefineBox,
  ProviderSpecialtyBox,
  ProviderSpecialtyChips,
} from '@/components/marketplace/ProviderDiscoverRail';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import {
  ProviderCardListSkeleton,
  ProvidersCatalogSkeleton,
} from '@/components/marketplace/ProvidersCatalogSkeleton';
import { BackToTopButton, useBackToTop } from '@/components/ui/ScrollUpStickyBar';
import { normalizeCreatorSummary } from '@/lib/marketplace-api';
import { geolocationAlreadyGranted, resolveViewerLocation, type ViewerLocation } from '@/lib/viewer-location';
import { useAuth } from '@/context/AuthContext';
import { ClosestFirstNote } from '@/components/marketplace/ClosestFirstNote';
import { nationalityLabel, normalizeNationalityCode } from '@/lib/countries';
import { SERVICE_PROVIDER_CATEGORY_GROUPS, SERVICE_PROVIDER_POPULAR_TAGS } from '@/lib/service-provider-categories';
import type { MarketplaceCreatorsPage, MarketplaceCreatorSummary } from '@/types/marketplace';
import { ListSectionHeading } from '@/components/ui/ListSectionHeading';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m2.2-4.8a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a8 8 0 1114.5 4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4.5V9h4.5" />
    </svg>
  );
}

function SlidersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" aria-hidden>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const MENU_ITEM_CLASS =
  'flex w-full min-w-0 items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[14px] leading-5 transition-colors hover:bg-[rgba(15,20,25,0.06)] focus-visible:outline-none focus-visible:bg-[rgba(15,20,25,0.06)] dark:hover:bg-[rgba(231,233,234,0.1)] dark:focus-visible:bg-[rgba(231,233,234,0.1)]';

/**
 * The filter sheet's specialties: the page's chips (card tone, the selected one solid ink), wrapped
 * on several lines with room between them — "All" + the popular fields, then, on demand, each
 * category group under a small-caps title.
 */
function SheetSpecialtyChips({
  value,
  onPick,
  more,
}: {
  value: string;
  onPick: (next: string | undefined) => void;
  more: boolean;
}) {
  const t = useT();
  const chip = (label: string, next: string | undefined) => {
    const active = (value || undefined) === next;
    return (
      <li key={label}>
        <button
          type="button"
          aria-pressed={active}
          onClick={() => onPick(active && next ? undefined : next)}
          data-pf-no-color-transition
          className={`inline-flex h-9 items-center rounded-full px-4 text-[14px] font-semibold leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
            active
              ? 'bg-[color:var(--gn-ink)] text-[color:var(--gn-surface)]'
              : 'bg-[color:var(--gn-surface)] text-[color:var(--gn-ink)] active:bg-[color:var(--gn-hover-strong,var(--gn-hover))]'
          }`}
        >
          {t(label)}
        </button>
      </li>
    );
  };
  return (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-wrap gap-2">
        {chip('All', undefined)}
        {SERVICE_PROVIDER_POPULAR_TAGS.map((label) => chip(label, label))}
      </ul>
      {more
        ? SERVICE_PROVIDER_CATEGORY_GROUPS.map((group) => (
            <div key={group.id}>
              <p className="gn-kicker pb-2">{t(group.title)}</p>
              <ul className="flex flex-wrap gap-2">{group.items.map((label) => chip(label, label))}</ul>
            </div>
          ))
        : null}
    </div>
  );
}

type ProviderSort = '' | 'rate' | 'stars';

const SORT_OPTIONS: { value: ProviderSort; label: string }[] = [
  { value: '', label: msg('Recommended') },
  { value: 'rate', label: msg('Lowest rate') },
  { value: 'stars', label: msg('Most stars') },
];

function parseProviderSort(raw: string | null): ProviderSort {
  return raw === 'rate' || raw === 'stars' ? raw : '';
}

/**
 * "Sort by: Recommended ▾" at the right of the section line — a quiet text control, not a pill.
 * "Closest first" is one of its orders (distance): picking it turns on `near`, picking another
 * order turns it off.
 */
function SortMenu({
  value,
  closestFirst,
  onChange,
  onClosestFirst,
}: {
  value: ProviderSort;
  closestFirst: boolean;
  onChange: (next: ProviderSort) => void;
  onClosestFirst: () => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const current = closestFirst
    ? t('Closest first')
    : t(SORT_OPTIONS.find((option) => option.value === value)?.label ?? 'Recommended');

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((next) => !next)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('Sort by: {current}', { current })}
        className={`inline-flex h-8 items-center gap-1.5 rounded-full text-[13px] leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1419]/30 dark:focus-visible:ring-white/30 ${PROVIDER_INK_CLASS}`}
      >
        <span className={`hidden sm:inline ${PROVIDER_MUTED_CLASS}`}>{t('Sort by')}</span>
        <span className="font-semibold">{current}</span>
        <ChevronIcon className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={t('Sort providers')}
          className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl bg-[#FEFEFE] p-1.5 shadow-[0_0_0_1px_#E1E8ED,0_8px_20px_-14px_rgba(15,20,25,0.18)] dark:bg-[#000000] dark:shadow-[0_0_0_1px_#2F3336]"
        >
          {SORT_OPTIONS.map((option) => {
            const active = !closestFirst && option.value === value;
            return (
              <li key={option.value || 'recommended'} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`${MENU_ITEM_CLASS} py-2 ${active ? 'font-semibold' : ''} ${PROVIDER_INK_CLASS}`}
                >
                  <span className="truncate">{t(option.label)}</span>
                  {active ? <CheckIcon className="h-4 w-4 shrink-0" /> : null}
                </button>
              </li>
            );
          })}
          <li role="option" aria-selected={closestFirst}>
            <button
              type="button"
              onClick={() => {
                onClosestFirst();
                setOpen(false);
              }}
              className={`${MENU_ITEM_CLASS} py-2 ${closestFirst ? 'font-semibold' : ''} ${PROVIDER_INK_CLASS}`}
            >
              <span className="truncate">{t('Closest first')}</span>
              {closestFirst ? <CheckIcon className="h-4 w-4 shrink-0" /> : null}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}

const PHONE_QUERY = '(max-width: 639px)';

function subscribePhone(onChange: () => void) {
  const media = window.matchMedia(PHONE_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function useIsPhone() {
  return useSyncExternalStore(
    subscribePhone,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  );
}

function parseMinYearsExperience(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(n, 80);
}

function CreatorsCatalogContent() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const genre = searchParams.get('genre') ?? '';
  const verifiedOnly = searchParams.get('verified') === '1';
  const availableOnly = searchParams.get('available') === '1';
  const closestFirst = searchParams.get('near') === '1';
  const sort = parseProviderSort(searchParams.get('sort'));
  const nationality = normalizeNationalityCode(searchParams.get('nationality')) ?? '';
  const minYearsExperience = parseMinYearsExperience(searchParams.get('minYears'));
  const page = Math.max(0, Number(searchParams.get('page') ?? '0') || 0);

  const [localQ, setLocalQ] = useState(q);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<MarketplaceCreatorsPage | null>(null);
  const { hasRole, isLoading: authLoading } = useAuth();
  const [viewerCoords, setViewerCoords] = useState<ViewerLocation | null>(null);
  const [geoAttempt, setGeoAttempt] = useState(0);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const isPhone = useIsPhone();
  /* Phones: all filters live in one bottom sheet. */
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMore, setSheetMore] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const searchRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const backToTop = useBackToTop(searchRef);

  useEffect(() => {
    if (!searchActive) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setSearchActive(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSearchActive(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [searchActive]);

  useEffect(() => {
    setLocalQ(q);
  }, [q]);

  /* Location is asked for only when it is needed — "Closest first" is on — or when the browser
     already allows it silently (then cards can show distances). Never a prompt on page load, never a
     red banner: a failed device fix falls back to the creator's profile location (viewer-location). */
  const isCreator = hasRole('ROLE_CREATOR');
  useEffect(() => {
    if (authLoading || viewerCoords) return undefined;
    let cancelled = false;
    void (async () => {
      if (!closestFirst && !(await geolocationAlreadyGranted())) return;
      if (cancelled) return;
      setGeoLoading(true);
      setGeoError(null);
      try {
        const location = await resolveViewerLocation({ profileFallback: isCreator });
        if (!cancelled) setViewerCoords(location);
      } catch (e) {
        if (!cancelled) setGeoError(getApiErrorMessage(e, t('Unable to detect your location.')));
      } finally {
        if (!cancelled) setGeoLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, closestFirst, geoAttempt, isCreator, viewerCoords, t]);

  const pushParams = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === '') params.delete(k);
      else params.set(k, v);
    });
    const qs = params.toString();
    router.push(qs ? `/providers?${qs}` : '/providers');
  };

  const load = useCallback(async () => {
    // Only block the list while waiting for geo when sorting by distance.
    if (closestFirst && !viewerCoords && !geoError) {
      setLoading(true);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const trimmed = q.trim();
      const proximity = viewerCoords
        ? {
            lat: viewerCoords.lat,
            lng: viewerCoords.lng,
            ...('accuracyM' in viewerCoords && viewerCoords.accuracyM != null
              ? { accuracyM: viewerCoords.accuracyM }
              : {}),
            ...(closestFirst ? { sort: 'distance' } : {}),
          }
        : {};
      /* The chosen list order ("Lowest rate", "Most stars"); "Closest first" (distance) replaces it. */
      const order = !closestFirst && sort ? { sort } : {};
      const res = trimmed
        ? await api.get<MarketplaceCreatorsPage>('/api/marketplace/creators/search', {
            params: {
              q: trimmed,
              page,
              size: 12,
              ...(genre ? { specialite: genre } : {}),
              ...(verifiedOnly ? { verified: true } : {}),
              ...(availableOnly ? { available: true } : {}),
              ...(nationality ? { nationality } : {}),
              ...(minYearsExperience != null ? { minYearsExperience } : {}),
              ...order,
              ...proximity,
            },
          })
        : await api.get<MarketplaceCreatorsPage>('/api/marketplace/creators', {
            params: {
              page,
              size: 12,
              ...(genre ? { specialite: genre } : {}),
              ...(verifiedOnly ? { verified: true } : {}),
              ...(availableOnly ? { available: true } : {}),
              ...(nationality ? { nationality } : {}),
              ...(minYearsExperience != null ? { minYearsExperience } : {}),
              ...order,
              ...proximity,
            },
          });
      setPageData({
        ...res.data,
        content: (res.data.content ?? []).map((row) =>
          normalizeCreatorSummary(row as unknown as Record<string, unknown>),
        ),
      });
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to load service providers.')));
      setPageData(null);
    } finally {
      setLoading(false);
    }
  }, [
    q,
    genre,
    verifiedOnly,
    availableOnly,
    nationality,
    minYearsExperience,
    closestFirst,
    sort,
    viewerCoords,
    geoError,
    page,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const creators: MarketplaceCreatorSummary[] = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const currentPage = page + 1;
  const pageCount = totalPages > 0 ? totalPages : 1;

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchInputRef.current?.blur();
    setSearchActive(false);
    pushParams({ q: localQ.trim() || undefined, page: '0' });
  };

  const resetSearchAndFilters = () => {
    setLocalQ('');
    setGeoError(null);
    router.push('/providers');
  };

  const emptyState = (
    <div className={`flex flex-col items-center justify-center ${PROVIDER_FRAME_CLASS} px-6 py-20 text-center`}>
      <h3 className={`text-[20px] font-extrabold tracking-[-0.015em] ${PROVIDER_INK_CLASS}`}>
        {t('No provider matches this search')}
      </h3>
      <p className={`mt-2 max-w-md text-[15px] leading-5 ${PROVIDER_MUTED_CLASS}`}>
        {t('Try a different keyword, or widen the filters.')}
      </p>
      <div className="mt-6">
        <ProviderTextAction
          variant="secondary"
          onClick={resetSearchAndFilters}
          icon={<ResetIcon className="h-4 w-4" />}
          iconPlacement="leading"
        >
          {t('Reset everything')}
        </ProviderTextAction>
      </div>
    </div>
  );

  const totalCount = pageData?.totalElements ?? creators.length;
  const setClosestFirst = (enabled: boolean) => {
    setGeoError(null);
    pushParams(enabled ? { near: '1', sort: undefined, page: '0' } : { near: undefined, page: '0' });
  };
  const sortControl = (
    <SortMenu
      value={sort}
      closestFirst={closestFirst}
      onChange={(next) => {
        setGeoError(null);
        pushParams({ sort: next || undefined, near: undefined, page: '0' });
      }}
      onClosestFirst={() => setClosestFirst(true)}
    />
  );

  /* Every active filter, for the "Filtered by" line and the Filters button badge. "Closest first" is
     an order (the sort control reads it), so it is not listed. */
  const activeFilters: string[] = [];
  if (genre) activeFilters.push(t(genre));
  if (verifiedOnly) activeFilters.push(t('Verified'));
  if (availableOnly) activeFilters.push(t('Available'));
  if (minYearsExperience != null) activeFilters.push(t('{count}+ yrs exp.', { count: minYearsExperience }));
  if (nationality) activeFilters.push(nationalityLabel(nationality) || nationality);
  const filtered = activeFilters.length > 0 || Boolean(q.trim());
  const filteredBy = [q.trim() ? `“${q.trim()}”` : '', ...activeFilters].filter(Boolean).join(' · ');

  const onSpecialty = (next: string | undefined) => pushParams({ genre: next, page: '0' });
  const onYears = (years: number | null) => pushParams({ minYears: years != null ? String(years) : undefined, page: '0' });
  const onNationality = (code: string) => pushParams({ nationality: code || undefined, page: '0' });

  /* The provider search: a pill on the card tone, an ink ring when focused — News's rail pill. */
  const searchField = (id: string, inputRef?: React.RefObject<HTMLInputElement | null>) => (
    <form onSubmit={onSearchSubmit} data-surface-tray className="min-w-0 flex-1">
      <div className="relative h-11 w-full min-w-0 rounded-full bg-[color:var(--gn-surface)] transition-[background-color,box-shadow] focus-within:bg-[color:var(--gn-inset)] focus-within:shadow-[inset_0_0_0_2px_var(--gn-ink)]">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-[color:var(--gn-ink2)]" />
        <label htmlFor={id} className="sr-only">
          {t('Search providers')}
        </label>
        <input
          ref={inputRef}
          id={id}
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          onFocus={() => setSearchActive(true)}
          enterKeyHint="search"
          autoComplete="off"
          placeholder={isPhone ? t('Search providers') : t('Search by name, specialty, keyword')}
          className="h-full w-full rounded-full border-0 bg-transparent p-0 pl-11 pr-12 text-[16px] text-[color:var(--gn-ink)] placeholder:text-[color:var(--gn-ink2)] focus:outline-none focus:ring-0 sm:text-[15px]"
        />
        {localQ.trim() || q ? (
          <button
            type="button"
            onClick={() => {
              setLocalQ('');
              pushParams({ q: undefined, page: '0' });
            }}
            title={t('Clear search')}
            aria-label={t('Clear search')}
            className="absolute top-1/2 right-1.5 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)]"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </form>
  );

  const clearAllButton = (
    <button
      type="button"
      onClick={resetSearchAndFilters}
      className="font-semibold text-[color:var(--gn-ink)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
    >
      {t('Clear all filters')}
    </button>
  );

  const refineRows = (idPrefix: string) => (
    <>
      <ProviderRailSwitch
        label={t('Verified only')}
        checked={verifiedOnly}
        onChange={(next) => pushParams({ verified: next ? '1' : undefined, page: '0' })}
      />
      <ProviderRailSwitch
        label={t('Available only')}
        checked={availableOnly}
        onChange={(next) => pushParams({ available: next ? '1' : undefined, page: '0' })}
      />
      <ServiceProviderFilterPills
        idPrefix={idPrefix}
        variant="rail"
        minYearsExperience={minYearsExperience}
        nationality={nationality}
        closestFirst={closestFirst}
        onYearsChange={onYears}
        onNationalityChange={onNationality}
        onClosestFirstChange={setClosestFirst}
      />
    </>
  );

  /*
   * Layout — the News page's palette and rail, on the navbar's frame (32 / 48 / 64px gutters, 1240px
   * cap): below lg the list alone (600px); from lg the list fills the frame from the wordmark's edge,
   * then a sticky 340px rail (400px from xl) whose right edge sits under the avatar. Cards are
   * separated from the page by tone only; the rail's tools are outlined boxes.
   */
  return (
    <div
      className="providers-x news-theme news-feed news-mono w-full pb-24 pt-2 sm:px-8 sm:pt-4 md:px-12 lg:px-16 lg:pt-3"
      style={STUDIO_FLOAT_IN_STYLE}
    >
      <h1 className="sr-only">{t('Find a service provider')}</h1>

      {/* Phones / tablets: every filter in one bottom sheet. The shell is portalled to <body>, outside
          this page's token scope, so the content re-opens the News scope. Choices apply at once (the
          list behind updates); the sticky footer says what that gives and closes the sheet. */}
      <ContentPostDialogShell open={sheetOpen} title={t('Filters')} onClose={() => setSheetOpen(false)}>
        <div className="news-theme news-feed news-mono">
          <div className="space-y-7 pb-4 pt-1">
            <section className="px-5">
              <div className="flex items-center justify-between pb-3">
                <p className="gn-kicker">{t('Specialty')}</p>
                <button
                  type="button"
                  onClick={() => setSheetMore((current) => !current)}
                  aria-expanded={sheetMore}
                  className="inline-flex h-8 items-center gap-1 text-[13px] font-semibold text-[color:var(--gn-ink)]"
                >
                  {sheetMore ? t('Fewer') : t('All specialties')}
                  <ChevronIcon className={`h-3.5 w-3.5 transition-transform duration-300 ${sheetMore ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <SheetSpecialtyChips value={genre} onPick={onSpecialty} more={sheetMore} />
            </section>
            <section>
              <p className="gn-kicker px-6 pb-1">{t('Refine')}</p>
              {refineRows('sheet-sp')}
            </section>
          </div>
          <div className="sticky bottom-0 flex items-center justify-between gap-4 bg-[#fff] px-5 pb-5 pt-3 dark:bg-[#000]">
            {filtered ? (
              <span className="text-[14px]">{clearAllButton}</span>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--gn-primary)] px-6 text-[15px] font-semibold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
            >
              {pageData
                ? trPlural(totalCount, 'Show {count} provider', 'Show {count} providers')
                : t('Show providers')}
            </button>
          </div>
        </div>
      </ContentPostDialogShell>

      <div className="mx-auto grid w-full max-w-[600px] items-start gap-8 lg:max-w-[1240px] lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
        <main className="min-w-0">
          <div className="flex w-full min-w-0 flex-col gap-3">
            {/* Below lg (no rail): the search with one Filters button (a bottom sheet), then the
                specialties as the News interest chips. */}
            <div className="flex items-center gap-2 px-5 pt-1 sm:px-0 lg:hidden">
              {searchField('cq', searchInputRef)}
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                aria-label={activeFilters.length > 0 ? t('Filters ({activeFiltersLength} active)', { activeFiltersLength: activeFilters.length }) : t('Filters')}
                className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--gn-surface)] text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
              >
                <SlidersIcon className="h-[18px] w-[18px]" />
                {activeFilters.length > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[color:var(--gn-ink)] px-1 text-[10px] font-bold tabular-nums text-[color:var(--gn-surface)] ring-2 ring-[#FFFFFF] dark:ring-[#000000]">
                    {activeFilters.length}
                  </span>
                ) : null}
              </button>
            </div>
            <div className="lg:hidden">
              <ProviderSpecialtyChips value={genre} onChange={onSpecialty} />
            </div>

            {/* Section line above the list, like News's "■ Latest · Professionals": a small-caps kicker
                with the count, the sort at the right. While filters narrow the list, a plain
                sentence-case "Filtered by: … · Clear" line follows. */}
            <header ref={searchRef} className="flex scroll-mt-24 flex-col gap-1 px-5 pt-3 sm:px-1 lg:pt-0">
              <div className="flex min-h-8 items-center justify-between gap-4">
                <ListSectionHeading
                  id="providers-heading"
                  title={t('Providers')}
                  count={pageData ? totalCount : null}
                  details={[genre]}
                />
                {sortControl}
              </div>
              {filtered ? (
                <p className="flex min-w-0 items-center gap-1.5 text-[14px] leading-5 text-[color:var(--gn-ink2)]">
                  <span className="shrink-0">{t('Filtered by:')}</span>
                  <span className="truncate font-semibold text-[color:var(--gn-ink)]">{filteredBy}</span>
                  <span aria-hidden className="shrink-0 text-[color:var(--gn-ink3)]">·</span>
                  <button
                    type="button"
                    onClick={resetSearchAndFilters}
                    className="shrink-0 font-medium text-[color:var(--gn-ink)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
                  >
                    {t('Clear')}
                  </button>
                </p>
              ) : null}
            </header>

            {closestFirst && !geoLoading && (geoError || viewerCoords?.source === 'profile') ? (
              <div className="px-5 sm:px-0">
                <ClosestFirstNote
                  profilePlace={viewerCoords?.source === 'profile' ? viewerCoords.placeLabel ?? 'your profile location' : null}
                  onRetry={() => {
                    setViewerCoords(null);
                    setGeoAttempt((n) => n + 1);
                  }}
                />
              </div>
            ) : null}
            {error ? (
              <div className="px-5 sm:px-0">
                <ErrorAlert message={error} onDismiss={() => setError(null)} />
              </div>
            ) : null}

            <section aria-labelledby="providers-heading">
              {loading || (closestFirst && geoLoading) ? (
                <ProviderCardListSkeleton />
              ) : creators.length === 0 ? (
                emptyState
              ) : (
                <>
                  {/* One provider per card; edge to edge 8px apart on phones, 20px apart from sm — the
                      News feed's rhythm. */}
                  <div className="flex flex-col gap-2 sm:gap-5">
                    {creators.map((c) => (
                      <CreatorCard
                        key={c.id ?? c.userId ?? c.fullName}
                        id={c.id}
                        userId={c.userId}
                        username={c.username}
                        fullName={c.fullName}
                        avatarUrl={c.avatarUrl}
                        specialite={c.specialite}
                        specialties={c.specialties}
                        specialtyTags={c.specialtyTags}
                        bio={c.bio}
                        isVerified={c.isVerified}
                        isAvailable={c.isAvailable}
                        serviceCount={c.serviceCount}
                        starCount={c.starCount}
                        nationality={c.nationality}
                        yearsOfExperience={c.yearsOfExperience}
                        distanceKm={c.distanceKm}
                        locationCity={c.locationCity}
                        locationCountry={c.locationCountry}
                        services={c.profileServices}
                        hourlyRateCents={c.hourlyRateCents}
                        hourlyRateCurrency={c.hourlyRateCurrency}
                        flushOnMobile
                      />
                    ))}
                  </div>

                  {pageCount > 1 ? (
                    <div className="flex flex-wrap items-center justify-between gap-4 px-5 pt-6 sm:px-1">
                      <p className={`text-[14px] tabular-nums ${PROVIDER_MUTED_CLASS}`}>
                        {t('Page')} <span className={`font-medium ${PROVIDER_INK_CLASS}`}>{currentPage}</span> {t('of')} {pageCount}
                      </p>
                      <div className="flex items-center gap-3">
                        <ProviderTextAction
                          variant="secondary"
                          onClick={() => pushParams({ page: String(page - 1) })}
                          disabled={page <= 0}
                        >
                          {t('Previous')}
                        </ProviderTextAction>
                        <ProviderTextAction
                          variant="secondary"
                          onClick={() => pushParams({ page: String(page + 1) })}
                          disabled={totalPages > 0 && page >= totalPages - 1}
                          icon={<ArrowIcon className="h-4 w-4" />}
                        >
                          {t('Next')}
                        </ProviderTextAction>
                      </div>
                    </div>
                  ) : (
                    <p className="gn-kicker pt-10 text-center">{t('That’s everyone')}</p>
                  )}
                </>
              )}
            </section>
          </div>
        </main>

        {/* The rail (from lg), sticky under the navbar like News's: the search pill on the page, then
            two outlined boxes — Specialty, Refine. */}
        <div className="hidden self-start lg:block">
          <ProfileSectionStickyAside className="w-full" surfaceClassName="flex w-full max-w-full min-w-0 flex-col gap-6">
            {searchField('cq-side')}
            <ProviderSpecialtyBox value={genre} onChange={onSpecialty} />
            <ProviderRefineBox
              footer={filtered ? <div className="px-6 pb-2 pt-3 text-[14px]">{clearAllButton}</div> : null}
            >
              {refineRows('side-sp')}
            </ProviderRefineBox>
          </ProfileSectionStickyAside>
        </div>
      </div>

      <BackToTopButton visible={backToTop.visible} onClick={backToTop.backToTop} />
    </div>
  );
}

export function CreatorsCatalog() {
  return (
    <Suspense fallback={<ProvidersCatalogSkeleton />}>
      <CreatorsCatalogContent />
    </Suspense>
  );
}
