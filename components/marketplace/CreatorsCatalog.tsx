'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { CreatorCard } from '@/components/CreatorCard';
import {
  ServiceProviderCategoriesButton,
  ServiceProviderCategoriesPanel,
  ServiceProviderCategoriesShell,
  useServiceProviderCategoriesMenuId,
} from '@/components/marketplace/ServiceProviderCategoriesMenu';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { normalizeCreatorSummary } from '@/lib/marketplace-api';
import { detectUserCoordinates } from '@/lib/geolocation';
import { NATIONALITY_SELECT_OPTIONS, normalizeNationalityCode } from '@/lib/countries';
import {
  findServiceProviderCategoryLabel,
  SERVICE_PROVIDER_POPULAR_TAGS,
} from '@/lib/service-provider-categories';
import type { MarketplaceCreatorsPage, MarketplaceCreatorSummary } from '@/types/marketplace';

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function FilterToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 whitespace-nowrap">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-orange-500' : 'bg-gray-200 dark:bg-neutral-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
}

function popularChipTone(active: boolean) {
  return active
    ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
    : 'border-neutral-300 bg-transparent text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-500';
}

const MIN_YEARS_OPTIONS = [
  { value: '', label: 'Any experience' },
  { value: '1', label: '1+ years' },
  { value: '3', label: '3+ years' },
  { value: '5', label: '5+ years' },
  { value: '10', label: '10+ years' },
  { value: '15', label: '15+ years' },
] as const;

function parseMinYearsExperience(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(n, 80);
}

function CreatorsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const genre = searchParams.get('genre') ?? '';
  const verifiedOnly = searchParams.get('verified') === '1';
  const availableOnly = searchParams.get('available') === '1';
  const closestFirst = searchParams.get('near') === '1';
  const nationality = normalizeNationalityCode(searchParams.get('nationality')) ?? '';
  const minYearsExperience = parseMinYearsExperience(searchParams.get('minYears'));
  const page = Math.max(0, Number(searchParams.get('page') ?? '0') || 0);

  const [localQ, setLocalQ] = useState(q);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<MarketplaceCreatorsPage | null>(null);
  const [viewerCoords, setViewerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  useEffect(() => {
    setLocalQ(q);
  }, [q]);

  useEffect(() => {
    if (!closestFirst) {
      setGeoLoading(false);
      return;
    }
    if (viewerCoords) return;

    let cancelled = false;
    setGeoLoading(true);
    setGeoError(null);
    void detectUserCoordinates()
      .then((coords) => {
        if (cancelled) return;
        setViewerCoords(coords);
        setGeoError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setViewerCoords(null);
        setGeoError(e instanceof Error ? e.message : 'Unable to detect your location.');
      })
      .finally(() => {
        if (!cancelled) setGeoLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [closestFirst, viewerCoords]);

  const pushParams = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === '') params.delete(k);
      else params.set(k, v);
    });
    const qs = params.toString();
    router.push(qs ? `/marketplace/creators?${qs}` : '/marketplace/creators');
  };

  const load = useCallback(async () => {
    if (closestFirst && !viewerCoords && !geoError) {
      setLoading(true);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const trimmed = q.trim();
      const proximity =
        closestFirst && viewerCoords
          ? { lat: viewerCoords.lat, lng: viewerCoords.lng, sort: 'distance' }
          : {};
      const res = trimmed
        ? await api.get<MarketplaceCreatorsPage>('/api/marketplace/creators/search', {
            params: {
              q: trimmed,
              page,
              size: 12,
              ...(genre ? { specialite: genre } : {}),
              ...(availableOnly ? { available: true } : {}),
              ...(nationality ? { nationality } : {}),
              ...(minYearsExperience != null ? { minYearsExperience } : {}),
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
              ...proximity,
            },
          });
      setPageData({
        ...res.data,
        content: (res.data.content ?? []).map((row) =>
          normalizeCreatorSummary(row as unknown as Record<string, unknown>)
        ),
      });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load service providers.'));
      setPageData(null);
    } finally {
      setLoading(false);
    }
  }, [q, genre, verifiedOnly, availableOnly, nationality, minYearsExperience, closestFirst, viewerCoords, geoError, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const creators: MarketplaceCreatorSummary[] = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const currentPage = page + 1;
  const pageCount = totalPages > 0 ? totalPages : 1;

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushParams({ q: localQ.trim() || undefined, page: '0' });
  };

  const hasActiveFilters = Boolean(
    q.trim() ||
      genre ||
      verifiedOnly ||
      availableOnly ||
      closestFirst ||
      nationality ||
      minYearsExperience != null ||
      page > 0 ||
      localQ.trim()
  );

  const resetSearchAndFilters = () => {
    setLocalQ('');
    setCategoriesOpen(false);
    setGeoError(null);
    router.push('/marketplace/creators');
  };

  const emptyState = (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">No service providers found</h2>
      <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
        Try a different keyword or broaden your filters.
      </p>
      <button
        type="button"
        onClick={resetSearchAndFilters}
        title="Refresh"
        aria-label="Refresh"
        className="mt-8 inline-flex h-16 w-16 items-center justify-center rounded-full text-orange-500 transition hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
      >
        <FontAwesomeIcon icon={faArrowRotateLeft} className="h-10 w-10" />
      </button>
    </div>
  );

  const selectedPopular = (SERVICE_PROVIDER_POPULAR_TAGS as readonly string[]).includes(genre)
    ? genre
    : null;
  const selectedCategory = findServiceProviderCategoryLabel(genre);
  const categoriesMenuId = useServiceProviderCategoriesMenuId();

  return (
    <div className="w-full max-w-none px-2 py-8 sm:px-4 sm:py-10">
      <main className="flex flex-col">
        <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Discover Top-Tier Experts
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Discover professionals who offer services, explore their profiles, and contact them for custom work.
          </p>
        </div>

        <form
          onSubmit={onSearchSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-white bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:flex-row lg:items-center"
        >
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="cq"
              value={localQ}
              onChange={(e) => setLocalQ(e.target.value)}
              placeholder="Search by name, specialty, or keywords…"
              className="w-full rounded-xl border-0 bg-transparent py-2.5 pr-12 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={resetSearchAndFilters}
              disabled={!hasActiveFilters}
              title="Reset search and filters"
              aria-label="Reset search and filters"
              className="absolute top-1/2 right-1.5 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <FontAwesomeIcon icon={faArrowRotateLeft} className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="hidden h-8 w-px shrink-0 bg-gray-200 lg:block dark:bg-neutral-700" aria-hidden />

          <div className="flex flex-wrap items-center gap-4 lg:gap-5">
            <FilterToggle
              checked={verifiedOnly}
              onChange={(next) => pushParams({ verified: next ? '1' : undefined, page: '0' })}
              label="Verified only"
            />

            <FilterToggle
              checked={availableOnly}
              onChange={(next) => pushParams({ available: next ? '1' : undefined, page: '0' })}
              label="Available only"
            />

            <select
              value={minYearsExperience != null ? String(minYearsExperience) : ''}
              onChange={(event) =>
                pushParams({ minYears: event.target.value || undefined, page: '0' })
              }
              aria-label="Years of experience"
              className="h-9 min-w-[9.5rem] rounded-xl border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 outline-none transition focus:border-orange-400 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:[color-scheme:dark]"
            >
              {MIN_YEARS_OPTIONS.map((option) => (
                <option
                  key={option.value || 'any'}
                  value={option.value}
                  className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100"
                >
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full shrink-0 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 lg:w-auto"
            >
              Search
            </button>
          </div>
        </form>
        </div>

        <section className="relative z-20 mt-8 pb-4">
          <ServiceProviderCategoriesShell open={categoriesOpen} onOpenChange={setCategoriesOpen}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
              <p className="shrink-0 pt-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                Popular :
              </p>
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                {SERVICE_PROVIDER_POPULAR_TAGS.map((label) => {
                  const active = selectedPopular === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        const next = active ? undefined : label;
                        setCategoriesOpen(false);
                        pushParams({ genre: next, page: '0' });
                      }}
                      aria-pressed={active}
                      title={label}
                      className={`inline-flex h-9 shrink-0 items-center rounded-xl border px-3.5 text-xs font-semibold transition sm:text-sm ${popularChipTone(active)}`}
                    >
                      {label}
                    </button>
                  );
                })}
                <ServiceProviderCategoriesButton
                  open={categoriesOpen}
                  onOpenChange={setCategoriesOpen}
                  hasActiveCategory={Boolean(selectedCategory)}
                  menuId={categoriesMenuId}
                />
              </div>
            </div>
            <ServiceProviderCategoriesPanel
              open={categoriesOpen}
              menuId={categoriesMenuId}
              selectedLabel={selectedCategory}
              onClose={() => setCategoriesOpen(false)}
              onSelect={(label) => {
                const next = selectedCategory === label ? undefined : label;
                pushParams({ genre: next, page: '0' });
              }}
            />
          </ServiceProviderCategoriesShell>
        </section>

        <div className="mt-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3">
          <FilterToggle
            checked={closestFirst}
            onChange={(next) => {
              if (!next) {
                setGeoError(null);
                pushParams({ near: undefined, page: '0' });
                return;
              }
              pushParams({ near: '1', page: '0' });
            }}
            label="Closest first"
          />
          <label className="flex min-w-0 items-center gap-2.5">
            <span className="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
              Nationality
            </span>
            <select
              value={nationality}
              onChange={(event) =>
                pushParams({ nationality: event.target.value || undefined, page: '0' })
              }
              className="h-10 min-w-[12rem] rounded-xl border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 outline-none transition focus:border-orange-400 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:[color-scheme:dark]"
            >
              <option value="" className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
                All nationalities
              </option>
              {NATIONALITY_SELECT_OPTIONS.map((option) => (
                <option
                  key={option.code}
                  value={option.code}
                  className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {/* Future: Localisation / rayon for home services — complement or replace Nationality. */}
        </div>
        {closestFirst && geoError ? <ErrorAlert message={geoError} onDismiss={() => setGeoError(null)} /> : null}

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {loading || (closestFirst && geoLoading) ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : creators.length === 0 ? (
          emptyState
        ) : (
          <>
            <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
              {creators.map((c) => (
                <CreatorCard
                  key={c.id ?? c.userId ?? c.fullName}
                  id={c.id}
                  userId={c.userId}
                  fullName={c.fullName}
                  avatarUrl={c.avatarUrl}
                  specialite={c.specialite}
                  specialties={c.specialties}
                  specialtyTags={c.specialtyTags}
                  bio={c.bio}
                  isVerified={c.isVerified}
                  isAvailable={c.isAvailable}
                  serviceCount={c.serviceCount}
                  averageRating={c.averageRating}
                  nationality={c.nationality}
                  yearsOfExperience={c.yearsOfExperience}
                  distanceKm={c.distanceKm}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {pageCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => pushParams({ page: String(page - 1) })}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:text-white"
                >
                  Previous
                </button>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
                  {currentPage}
                </span>
                <button
                  type="button"
                  disabled={totalPages > 0 && page >= totalPages - 1}
                  onClick={() => pushParams({ page: String(page + 1) })}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-300 dark:hover:bg-neutral-800"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
        </div>
      </main>
    </div>
  );
}

export function CreatorsCatalog() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center px-4 py-20">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <CreatorsCatalogContent />
    </Suspense>
  );
}
