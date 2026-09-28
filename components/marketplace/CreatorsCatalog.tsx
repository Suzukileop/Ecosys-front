'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { CreatorCard } from '@/components/CreatorCard';
import {
  ServiceProviderCategoriesButton,
  ServiceProviderCategoriesPanel,
  ServiceProviderCategoriesShell,
  useServiceProviderCategoriesMenuId,
} from '@/components/marketplace/ServiceProviderCategoriesMenu';
import { ServiceProviderFilterPills } from '@/components/marketplace/ServiceProviderFilterPills';
import {
  PROVIDER_FRAME_CLASS,
  PROVIDER_INK_CLASS,
  PROVIDER_MUTED_CLASS,
  ProviderChip,
  ProviderSwitch,
  ProviderTextAction,
} from '@/components/marketplace/ProviderDirectoryPrimitives';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { normalizeCreatorSummary } from '@/lib/marketplace-api';
import { detectUserCoordinates, type ViewerCoordinates } from '@/lib/geolocation';
import { normalizeNationalityCode } from '@/lib/countries';
import {
  findServiceProviderCategoryLabel,
  SERVICE_PROVIDER_POPULAR_TAGS,
} from '@/lib/service-provider-categories';
import type { MarketplaceCreatorsPage, MarketplaceCreatorSummary } from '@/types/marketplace';

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

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

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
  const [viewerCoords, setViewerCoords] = useState<ViewerCoordinates | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  useEffect(() => {
    setLocalQ(q);
  }, [q]);

  useEffect(() => {
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
  }, []);

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
    <div className={`flex flex-col items-center justify-center ${PROVIDER_FRAME_CLASS} px-6 py-24 text-center`}>
      <h3 className={`text-xl font-bold tracking-tight ${PROVIDER_INK_CLASS}`}>No provider matches this search</h3>
      <p className={`mt-3 max-w-md text-[15px] leading-relaxed ${PROVIDER_MUTED_CLASS}`}>
        Try a different keyword, or widen the filters.
      </p>
      <div className="mt-8">
        <ProviderTextAction
          variant="secondary"
          onClick={resetSearchAndFilters}
          icon={<ResetIcon className="h-4 w-4" />}
          iconPlacement="leading"
        >
          Reset everything
        </ProviderTextAction>
      </div>
    </div>
  );

  const selectedPopular = (SERVICE_PROVIDER_POPULAR_TAGS as readonly string[]).includes(genre)
    ? genre
    : null;
  const selectedCategory = findServiceProviderCategoryLabel(genre);
  const categoriesMenuId = useServiceProviderCategoriesMenuId();

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-6 sm:py-16 2xl:px-0" style={STUDIO_FLOAT_IN_STYLE}>
      <main className="flex flex-col gap-12 sm:gap-16">
        <header className="max-w-3xl">
          <h1 className={`text-4xl font-bold tracking-tight sm:text-5xl ${PROVIDER_INK_CLASS}`}>
            Discover Top-Tier Experts
          </h1>
          <p className={`mt-4 max-w-2xl text-base leading-relaxed sm:text-lg ${PROVIDER_MUTED_CLASS}`}>
            Professionals who offer services on the platform. Explore a profile, read the work, and
            start the conversation.
          </p>
        </header>

        <section className="relative z-20 space-y-6" aria-label="Search providers">
          <form
            onSubmit={onSearchSubmit}
            className={`flex flex-col gap-4 ${PROVIDER_FRAME_CLASS} p-3 lg:flex-row lg:items-center lg:gap-3`}
          >
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <label htmlFor="cq" className="sr-only">
                Search providers
              </label>
              <input
                id="cq"
                value={localQ}
                onChange={(e) => setLocalQ(e.target.value)}
                placeholder="Search by name, specialty, or keyword"
                className={`h-11 w-full border-0 bg-transparent pr-11 pl-11 text-[15px] ${PROVIDER_INK_CLASS} placeholder:text-neutral-400 focus:outline-none focus:ring-0`}
              />
              <button
                type="button"
                onClick={resetSearchAndFilters}
                disabled={!hasActiveFilters}
                title="Reset search and filters"
                aria-label="Reset search and filters"
                className="absolute top-1/2 right-2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 transition-colors duration-200 hover:text-[#FF5722] disabled:pointer-events-none disabled:opacity-0 focus-visible:outline-none"
              >
                <ResetIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-black/[0.06] px-1 pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-3 dark:border-white/[0.06]">
              <ProviderSwitch
                checked={verifiedOnly}
                onChange={(next) => pushParams({ verified: next ? '1' : undefined, page: '0' })}
                label="Verified only"
              />
              <ProviderSwitch
                checked={availableOnly}
                onChange={(next) => pushParams({ available: next ? '1' : undefined, page: '0' })}
                label="Available only"
              />
              <ProviderTextAction
                type="submit"
                variant="primary"
                icon={<ArrowIcon className="h-4 w-4" />}
                className="ml-auto lg:ml-1"
              >
                Search
              </ProviderTextAction>
            </div>
          </form>

          <ServiceProviderCategoriesShell open={categoriesOpen} onOpenChange={setCategoriesOpen}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <p className={`shrink-0 text-[15px] font-medium ${PROVIDER_MUTED_CLASS}`}>Popular</p>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {SERVICE_PROVIDER_POPULAR_TAGS.map((label) => (
                  <ProviderChip
                    key={label}
                    title={label}
                    active={selectedPopular === label}
                    onClick={() => {
                      const next = selectedPopular === label ? undefined : label;
                      setCategoriesOpen(false);
                      pushParams({ genre: next, page: '0' });
                    }}
                  >
                    {label}
                  </ProviderChip>
                ))}
                {selectedCategory && !selectedPopular ? (
                  <ProviderChip
                    active
                    title="Clear category"
                    onClick={() => pushParams({ genre: undefined, page: '0' })}
                  >
                    {selectedCategory}
                    <span aria-hidden className="opacity-60">
                      ×
                    </span>
                  </ProviderChip>
                ) : null}
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

        <section className="space-y-8" aria-labelledby="providers-heading">
          <div className="flex flex-col gap-4 border-b border-black/[0.06] pb-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.06]">
            <h2 id="providers-heading" className={`text-lg font-bold tracking-[-0.01em] ${PROVIDER_INK_CLASS}`}>
              Service providers
              {pageData ? ` · ${String(pageData.totalElements ?? creators.length).padStart(2, '0')}` : null}
            </h2>
            <ServiceProviderFilterPills
              idPrefix="catalog-sp"
              minYearsExperience={minYearsExperience}
              nationality={nationality}
              closestFirst={closestFirst}
              onYearsChange={(years) =>
                pushParams({ minYears: years != null ? String(years) : undefined, page: '0' })
              }
              onNationalityChange={(code) => pushParams({ nationality: code || undefined, page: '0' })}
              onClosestFirstChange={(enabled) => {
                if (!enabled) {
                  setGeoError(null);
                  pushParams({ near: undefined, page: '0' });
                  return;
                }
                pushParams({ near: '1', page: '0' });
              }}
            />
          </div>

          {geoError ? <ErrorAlert message={geoError} onDismiss={() => setGeoError(null)} /> : null}
          {error ? <ErrorAlert message={error} onDismiss={() => setError(null)} /> : null}

          {loading || (closestFirst && geoLoading) ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : creators.length === 0 ? (
            emptyState
          ) : (
            <>
              <div className="provider-spotlight-grid grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2">
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
                    averageRating={c.averageRating}
                    nationality={c.nationality}
                    yearsOfExperience={c.yearsOfExperience}
                    distanceKm={c.distanceKm}
                    locationCity={c.locationCity}
                    locationCountry={c.locationCountry}
                  />
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-6 border-t border-black/[0.06] pt-8 dark:border-white/[0.06]">
                <p className={`text-[15px] tabular-nums ${PROVIDER_MUTED_CLASS}`}>
                  Page <span className={`font-semibold ${PROVIDER_INK_CLASS}`}>{currentPage}</span> of {pageCount}
                </p>
                <div className="flex items-center gap-3">
                  <ProviderTextAction
                    variant="secondary"
                    onClick={() => pushParams({ page: String(page - 1) })}
                    disabled={page <= 0}
                  >
                    Previous
                  </ProviderTextAction>
                  <ProviderTextAction
                    variant="secondary"
                    onClick={() => pushParams({ page: String(page + 1) })}
                    disabled={totalPages > 0 && page >= totalPages - 1}
                    icon={<ArrowIcon className="h-4 w-4" />}
                  >
                    Next
                  </ProviderTextAction>
                </div>
              </div>
            </>
          )}
        </section>
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
