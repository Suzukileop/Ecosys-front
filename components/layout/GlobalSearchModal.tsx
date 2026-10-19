'use client';

import { msg } from '@/lib/i18n/config';
import { tr, trPlural } from '@/lib/i18n/active';
import '@/app/(app)/search/x-search.css';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  addRecentSearch,
  clearRecentSearches,
  removeRecentSearch,
  useRecentSearches,
} from '@/components/search/recentSearches';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { buildGlobalSearchPageUrl, GLOBAL_SEARCH_MIN_LENGTH, isServiceProvider, type GlobalSearchTab } from '@/lib/global-search';
import { searchMarketplaceCreators } from '@/lib/marketplace-api';
import { formatHourlyRateAmount } from '@/lib/profile-services';
import type { MarketplaceCreatorSummary } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

/**
 * The search overlay — a compact command panel under the navbar.
 *
 *  - From sm: a panel on the navbar's frame (1240px), just under the bar, on a plain darkening veil:
 *    the field across the top (with an ESC hint), then "What are you looking for?" and a row of pills
 *    — Portfolios, Storefronts, Providers — that scope everything below them. On an empty field the
 *    pills pick which suggestion chips show (plus your recent searches); while typing they filter the
 *    result rows and carry their counts.
 *  - Phones: the whole screen; the field with "Cancel", the same pills as a swipeable row.
 *
 * What it suggests: people only — portfolios (profiles), storefronts (a creator's shop) and service
 * providers — from one creator search. Posts are left to the full results page.
 *
 * Keyboard: the field is a combobox. Up / Down walk the rows (Left / Right too, on an empty field,
 * where the rows are chips), Enter opens the highlighted row (the first, "Search for …", by default:
 * the full results page), Tab / Shift+Tab switch pills, Escape closes.
 *
 * Portalled to <body>, outside the page's token scope, so the root re-opens it.
 */

type GlobalSearchModalProps = {
  open: boolean;
  onClose: () => void;
  /** Pre-fills the field (the current query on /search), selected so typing replaces it. */
  initialQuery?: string;
};

const DEBOUNCE_MS = 280;
/** How many creators the quick search fetches — enough for the three views. */
const QUICK_LIMIT = 12;

type ViewId = 'profiles' | 'shops' | 'providers';

const VIEWS: ViewId[] = ['profiles', 'shops', 'providers'];

const VIEW_LABELS: Record<ViewId, string> = {
  profiles: msg('Portfolios'),
  shops: msg('Storefronts'),
  providers: msg('Providers'),
};

/** Suggestions for an empty field, per pill: real specialties that fill the field. */
const POPULAR_TERMS: Record<ViewId, string[]> = {
  profiles: ['product designer', 'art direction', 'illustration', 'web development', 'photography', 'motion design', 'brand identity'],
  shops: ['presets', 'templates', 'fonts', 'mockups', 'icons', 'ebooks', 'courses'],
  providers: ['video editor', 'developer', 'ui / ux', 'marketing', 'copywriting', '3d modeling', 'photography'],
};

/** The results page tab a view's "Search for …" row opens. */
const VIEW_TAB: Record<ViewId, GlobalSearchTab> = {
  profiles: 'creators',
  shops: 'creators',
  providers: 'serviceProviders',
};

/** One row of the open view. */
type Row =
  | { kind: 'all' }
  | { kind: 'term'; term: string; recent: boolean }
  | { kind: 'person'; creator: MarketplaceCreatorSummary };

const subscribeNoop = () => () => {};

function Glyph({ children, className = 'h-[18px] w-[18px]' }: { children: ReactNode; className?: string }) {
  return (
    <svg className={`shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

const creatorId = (creator: MarketplaceCreatorSummary) => (creator.userId ?? creator.id ?? '').trim();

/** A shop: a creator with products in their storefront. */
function hasShop(creator: MarketplaceCreatorSummary) {
  return (creator.productCount ?? 0) > 0;
}

/** The row's right-hand meta, per view. */
function personMeta(view: ViewId, creator: MarketplaceCreatorSummary) {
  if (view === 'shops') return trPlural(creator.productCount ?? 0, '{count} product', '{count} products');
  if (view === 'providers') {
    const rate = formatHourlyRateAmount(creator.hourlyRateCents, creator.hourlyRateCurrency);
    if (rate) return tr('{amount} / hour', { amount: rate });
    if ((creator.serviceCount ?? 0) > 0) return trPlural(creator.serviceCount ?? 0, '{count} service', '{count} services');
  }
  return '';
}

function personHref(view: ViewId, creator: MarketplaceCreatorSummary) {
  const id = encodeURIComponent(creatorId(creator));
  return view === 'shops' ? `/providers/${id}/shop` : `/providers/${id}`;
}

export function GlobalSearchModal({ open, onClose, initialQuery = '' }: GlobalSearchModalProps) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  if (!open || !mounted) return null;
  /* Mounted on every open, so the field, the results and the highlight start fresh each time. */
  return createPortal(<GlobalSearchPanel onClose={onClose} initialQuery={initialQuery} />, document.body);
}

function GlobalSearchPanel({ onClose, initialQuery }: { onClose: () => void; initialQuery: string }) {
  const t = useT();
  const router = useRouter();
  const recent = useRecentSearches();
  const [query, setQuery] = useState(initialQuery);
  const [creators, setCreators] = useState<MarketplaceCreatorSummary[]>([]);
  const [resultsFor, setResultsFor] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewId>('profiles');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedQuery = query.trim();
  const searching = trimmedQuery.length >= GLOBAL_SEARCH_MIN_LENGTH;
  const settled = !loading && resultsFor === trimmedQuery;

  useEffect(() => {
    const input = inputRef.current;
    input?.focus();
    input?.select();
  }, []);

  /* Lock the page behind; Escape closes. */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  /* The debounced creator search — one call feeds Portfolios, Storefronts and Providers. */
  useEffect(() => {
    if (!searching) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      void (async () => {
        try {
          const page = await searchMarketplaceCreators(trimmedQuery, 0, QUICK_LIMIT);
          if (!cancelled) {
            setCreators((page.content ?? []).filter((creator) => creatorId(creator)));
            setResultsFor(trimmedQuery);
            setSelectedIndex(0);
          }
        } catch {
          if (!cancelled) {
            setCreators([]);
            setResultsFor(trimmedQuery);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searching, trimmedQuery]);

  const lists = useMemo<Record<ViewId, MarketplaceCreatorSummary[]>>(() => {
    const shown = searching ? creators : [];
    return { profiles: shown, shops: shown.filter(hasShop), providers: shown.filter(isServiceProvider) };
  }, [creators, searching]);

  /* Empty field: recent searches, then the pill's suggestions. Typing: "Search for …", then people. */
  const rows: Row[] = useMemo(() => {
    if (!searching) {
      return [
        ...recent.map((term) => ({ kind: 'term' as const, term, recent: true })),
        ...POPULAR_TERMS[view].map((term) => ({ kind: 'term' as const, term, recent: false })),
      ];
    }
    return [{ kind: 'all' as const }, ...lists[view].map((creator) => ({ kind: 'person' as const, creator }))];
  }, [lists, recent, searching, view]);

  const activeIndex = rows.length === 0 ? -1 : Math.min(Math.max(selectedIndex, searching ? 0 : -1), rows.length - 1);
  const optionId = (index: number) => `gsm-option-${index}`;

  useEffect(() => {
    if (activeIndex < 0) return;
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const goToSearchPage = useCallback(
    (tab: GlobalSearchTab = 'all', term: string = trimmedQuery) => {
      if (term.trim().length < GLOBAL_SEARCH_MIN_LENGTH) return;
      addRecentSearch(term.trim());
      onClose();
      router.push(buildGlobalSearchPageUrl(term.trim(), tab));
    },
    [onClose, router, trimmedQuery]
  );

  const fillField = (term: string) => {
    setQuery(term);
    setSelectedIndex(0);
    inputRef.current?.focus();
  };

  const activateRow = (row: Row) => {
    if (row.kind === 'all') goToSearchPage(VIEW_TAB[view]);
    else if (row.kind === 'term') {
      if (row.recent) goToSearchPage('all', row.term);
      else fillField(row.term);
    } else {
      addRecentSearch(trimmedQuery);
      onClose();
      router.push(personHref(view, row.creator));
    }
  };

  const switchView = (next: ViewId) => {
    setView(next);
    setSelectedIndex(searching ? 0 : -1);
    inputRef.current?.focus();
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    /* On an empty field the rows are chips laid out in a line, so Left / Right walk them too. */
    const forward = event.key === 'ArrowDown' || (!searching && query.length === 0 && event.key === 'ArrowRight');
    const backward = event.key === 'ArrowUp' || (!searching && query.length === 0 && event.key === 'ArrowLeft');
    if (forward) {
      event.preventDefault();
      if (rows.length > 0) setSelectedIndex((activeIndex + 1) % rows.length);
    } else if (backward) {
      event.preventDefault();
      if (rows.length > 0) setSelectedIndex(activeIndex <= 0 ? rows.length - 1 : activeIndex - 1);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      const index = VIEWS.indexOf(view);
      switchView(VIEWS[(index + (event.shiftKey ? VIEWS.length - 1 : 1)) % VIEWS.length]);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const row = activeIndex >= 0 ? rows[activeIndex] : undefined;
      if (row) activateRow(row);
      else goToSearchPage('all');
    }
  };

  const listboxId = 'gsm-listbox';
  const peopleCount = rows.filter((row) => row.kind === 'person').length;
  const recentCount = searching ? 0 : recent.length;

  const chip = (row: Extract<Row, { kind: 'term' }>, index: number) => {
    const selected = index === activeIndex;
    return (
      <span
        key={`${row.recent ? 'recent' : 'popular'}-${row.term}`}
        onMouseEnter={() => setSelectedIndex(index)}
        className={`group/chip inline-flex h-8 max-w-full items-center rounded-lg text-[13px] leading-5 transition-colors duration-100 ${
          selected
            ? 'bg-[color:var(--gn-hover)] text-[color:var(--gn-ink)]'
            : 'text-[color:var(--gn-ink2)] hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)]'
        }`}
      >
        <button
          type="button"
          id={optionId(index)}
          role="option"
          aria-selected={selected}
          tabIndex={-1}
          onClick={() => activateRow(row)}
          className={`inline-flex h-full min-w-0 items-center gap-1.5 truncate ${row.recent ? 'pl-3 pr-1' : 'px-3'}`}
        >
          {row.recent ? (
            <Glyph className="h-3.5 w-3.5">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5V12l3 2" />
            </Glyph>
          ) : null}
          <span className="truncate">{row.term}</span>
        </button>
        {row.recent ? (
          <button
            type="button"
            onClick={() => removeRecentSearch(row.term)}
            aria-label={t('Remove “{term}” from recent searches', { term: row.term })}
            title={t('Remove')}
            className="mr-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[color:var(--gn-ink2)] opacity-60 transition hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)] hover:opacity-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
          >
            <Glyph className="h-3 w-3">
              <path d="M6 6l12 12M18 6 6 18" />
            </Glyph>
          </button>
        ) : null}
      </span>
    );
  };

  return (
    <div className="x-search-overlay news-theme news-feed news-mono fixed inset-0 z-[220] flex justify-center sm:items-start sm:px-8 sm:pt-3 md:px-12 lg:px-16">
      <button
        type="button"
        tabIndex={-1}
        aria-label={t('Close search')}
        onClick={onClose}
        className="xs-veil fixed inset-0 h-[100dvh] w-full cursor-default bg-black/40 dark:bg-black/60"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('Search')}
        className="xs-panel relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[color:var(--gn-surface)] sm:h-auto sm:max-h-[min(620px,86dvh)] sm:max-w-[1240px] sm:rounded-2xl sm:shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35),0_0_0_1px_rgba(15,20,25,0.06)] sm:dark:shadow-[0_0_0_1px_#2F3336,0_24px_80px_-24px_rgba(0,0,0,0.6)]"
      >
        {/* The field, across the panel. */}
        <form
          role="search"
          className="flex shrink-0 items-center gap-2 px-4 pb-1 pt-[max(env(safe-area-inset-top),0.75rem)] sm:px-3 sm:pb-1 sm:pt-3"
          onSubmit={(event) => {
            event.preventDefault();
            goToSearchPage('all');
          }}
        >
          <div className="relative h-11 min-w-0 flex-1 rounded-xl bg-[color:var(--gn-inset)] transition-[box-shadow] focus-within:shadow-[inset_0_0_0_1px_var(--gn-ink2)]">
            <Glyph className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--gn-ink2)]">
              <circle cx="10.75" cy="10.75" r="6.75" />
              <path d="m15.6 15.6 4.4 4.4" />
            </Glyph>
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-expanded={rows.length > 0}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
              aria-label={t('Search Skraft')}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder={t('Search anything…')}
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="h-full w-full rounded-xl border-0 bg-transparent p-0 pl-10 pr-24 text-[16px] text-[color:var(--gn-ink)] outline-hidden placeholder:text-[color:var(--gn-ink2)] focus:outline-hidden focus:ring-0 sm:text-[14px]"
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {searching && loading ? (
                <span className="px-1.5 text-[color:var(--gn-ink2)]">
                  <LoadingSpinner size="sm" />
                </span>
              ) : null}
              {query.length > 0 ? (
                <button
                  type="button"
                  onClick={() => fillField('')}
                  aria-label={t('Clear search')}
                  title={t('Clear')}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
                >
                  <Glyph className="h-3.5 w-3.5">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </Glyph>
                </button>
              ) : null}
              <kbd className="hidden h-5 items-center rounded px-1.5 font-sans text-[10px] font-semibold tracking-wider text-[color:var(--gn-ink2)] sm:inline-flex">
                {t('ESC')}
              </kbd>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 shrink-0 items-center px-2 text-[15px] font-semibold text-[color:var(--gn-ink)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] sm:hidden"
          >
            {t('Cancel')}
          </button>
        </form>

        {/* What to look through: one row of pills, the open one inverted (ink fill, ground text). */}
        <div className="shrink-0 px-4 pt-4 sm:px-4">
          <p className="text-[13px] leading-5 text-[color:var(--gn-ink2)]">{t('What are you looking for?')}</p>
          <nav
            aria-label={t('Search in')}
            className="-mx-1 mt-2.5 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {VIEWS.map((id) => {
              const active = id === view;
              const count = searching && settled ? lists[id].length : null;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => switchView(id)}
                  data-pf-no-color-transition
                  className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium leading-5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
                    active
                      ? 'bg-[color:var(--gn-ink)] text-[color:var(--xs-ground)]'
                      : 'text-[color:var(--gn-ink)] hover:bg-[color:var(--gn-hover)]'
                  }`}
                >
                  {t(VIEW_LABELS[id])}
                  {count != null ? (
                    <span className={`tabular-nums ${active ? 'opacity-70' : 'text-[color:var(--gn-ink2)]'}`}>{count}</span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* The rows of the open pill: chips on an empty field, people while typing. */}
        <div
          id={listboxId}
          role="listbox"
          aria-label={searching ? t('{label} for {query}', { label: t(VIEW_LABELS[view]), query: trimmedQuery }) : t('{label} suggestions', { label: t(VIEW_LABELS[view]) })}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 sm:pb-4"
        >
          {!searching ? (
            <>
              {recentCount > 0 ? (
                <div className="mb-2">
                  <div className="flex h-7 items-center justify-between px-1">
                    <p className="text-[12px] leading-4 text-[color:var(--gn-ink2)]">{t('Recent')}</p>
                    <button
                      type="button"
                      onClick={() => clearRecentSearches()}
                      className="inline-flex h-7 items-center rounded-md px-2 text-[12px] font-semibold text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
                    >
                      {t('Clear')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rows.slice(0, recentCount).map((row, index) => chip(row as Extract<Row, { kind: 'term' }>, index))}
                  </div>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-1">
                {rows.slice(recentCount).map((row, offset) => chip(row as Extract<Row, { kind: 'term' }>, recentCount + offset))}
              </div>
            </>
          ) : (
            <>
              {rows.map((row, index) => {
                const selected = index === activeIndex;
                const rowClass = `flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left transition-colors duration-100 ${
                  selected ? 'bg-[color:var(--gn-hover)]' : 'hover:bg-[color:var(--gn-hover)]'
                }`;

                if (row.kind === 'all') {
                  return (
                    <button
                      key="all"
                      type="button"
                      id={optionId(index)}
                      role="option"
                      aria-selected={selected}
                      tabIndex={-1}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => activateRow(row)}
                      className={rowClass}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--gn-inset)] text-[color:var(--gn-ink)]">
                        <Glyph className="h-4 w-4">
                          <circle cx="10.75" cy="10.75" r="6.75" />
                          <path d="m15.6 15.6 4.4 4.4" />
                        </Glyph>
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14px] leading-5 text-[color:var(--gn-ink)]">
                        {t('Search for')} <span className="font-semibold">“{trimmedQuery}”</span>
                      </span>
                      <span className="shrink-0 text-[12px] text-[color:var(--gn-ink2)]">
                        {t('All {toLowerCase}', { toLowerCase: t(VIEW_LABELS[view]).toLowerCase() })}
                      </span>
                    </button>
                  );
                }

                if (row.kind !== 'person') return null;
                const { creator } = row;
                const meta = personMeta(view, creator);

                /* Storefronts: the shop itself — its cover as a square tile, its name and what it sells. */
                if (view === 'shops') {
                  const shopName = creator.shopName || `${creator.fullName}'s shop`;
                  const shopLine = creator.shopSellingFocus || creator.shopDescription || '';
                  return (
                    <button
                      key={`${view}-${creatorId(creator)}`}
                      type="button"
                      id={optionId(index)}
                      role="option"
                      aria-selected={selected}
                      tabIndex={-1}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => activateRow(row)}
                      className={rowClass}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[color:var(--gn-inset)] text-[color:var(--gn-ink2)]">
                        {creator.shopCoverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={creator.shopCoverUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Glyph className="h-4 w-4">
                            <path d="M4 9h16l-1 11H5z" />
                            <path d="M9 9V7a3 3 0 0 1 6 0v2" />
                          </Glyph>
                        )}
                      </span>
                      <span className="flex min-w-0 flex-1 items-baseline gap-2">
                        <span className="truncate text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)]">{shopName}</span>
                        {shopLine ? <span className="hidden truncate text-[13px] text-[color:var(--gn-ink2)] sm:inline">{shopLine}</span> : null}
                      </span>
                      {meta ? <span className="shrink-0 text-[12px] tabular-nums text-[color:var(--gn-ink2)]">{meta}</span> : null}
                    </button>
                  );
                }
                const subtitle = [creator.specialite, creator.locationCity].filter(Boolean).join(' · ');
                return (
                  <button
                    key={`${view}-${creatorId(creator)}`}
                    type="button"
                    id={optionId(index)}
                    role="option"
                    aria-selected={selected}
                    tabIndex={-1}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => activateRow(row)}
                    className={rowClass}
                  >
                    <Avatar name={creator.fullName} avatarUrl={creator.avatarUrl} size="sm" tone="muted" />
                    <span className="flex min-w-0 flex-1 items-baseline gap-2">
                      <span className="truncate text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)]">{creator.fullName}</span>
                      {subtitle ? <span className="hidden truncate text-[13px] text-[color:var(--gn-ink2)] sm:inline">{subtitle}</span> : null}
                    </span>
                    {meta ? <span className="shrink-0 text-[12px] tabular-nums text-[color:var(--gn-ink2)]">{meta}</span> : null}
                  </button>
                );
              })}

              {/* No people for this query (once it has answered), or the first load holding the room. */}
              {peopleCount === 0 ? (
                settled ? (
                  <div className="px-3 py-6">
                    <p className="text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)] [overflow-wrap:anywhere]">
                      {view === 'shops'
                        ? `No storefront matches “${trimmedQuery}”`
                        : view === 'providers'
                          ? `No provider matches “${trimmedQuery}”`
                          : `No portfolio matches “${trimmedQuery}”`}
                    </p>
                    <p className="mt-1 text-[13px] leading-5 text-[color:var(--gn-ink2)]">
                      {t('Search everything (posts and products too) with the first row, or try another spelling.')}
                    </p>
                  </div>
                ) : (
                  <div aria-hidden>
                    {[0, 1, 2].map((item) => (
                      <div key={item} className="xs-skeleton flex min-h-12 items-center gap-3 px-3 py-1.5">
                        <span className="h-8 w-8 shrink-0 rounded-full bg-[color:var(--gn-inset)]" />
                        <span className="h-3 w-1/3 rounded-full bg-[color:var(--gn-inset)]" />
                        <span className="ml-auto h-2.5 w-16 rounded-full bg-[color:var(--gn-inset)]" />
                      </div>
                    ))}
                  </div>
                )
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
