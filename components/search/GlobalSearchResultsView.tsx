'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PublicContentPostCard } from '@/components/home/PublicContentPostCard';
import { SearchCreatorRow } from '@/components/search/SearchCreatorRow';
import { SearchServiceProviderGrid } from '@/components/search/SearchServiceProviderGrid';
import { SearchServiceProviderRow } from '@/components/search/SearchServiceProviderRow';
import { GlobalSearchFilterModal } from '@/components/search/GlobalSearchFilterModal';

const RESULT_FRAME_CLASS =
  'rounded-2xl border border-black/[0.06] bg-white px-6 dark:border-white/[0.08] dark:bg-[#111111] sm:px-8';
import { GlobalSearchCategoryQuickFilters } from '@/components/search/GlobalSearchCategoryQuickFilters';
import { SearchProductCard, searchProductGridClassName } from '@/components/search/SearchProductCard';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import {
  buildGlobalSearchPageUrl,
  fetchGlobalSearchPageData,
  getCategoriesForTab,
  GLOBAL_SEARCH_ALL_TAB_SECTION_SIZE,
  GLOBAL_SEARCH_CATEGORY_LABELS,
  GLOBAL_SEARCH_FULL_PAGE_SIZE,
  GLOBAL_SEARCH_MIN_LENGTH,
  GLOBAL_SEARCH_TABS,
  GLOBAL_SEARCH_TAB_LABELS,
  type GlobalSearchCategory,
  type GlobalSearchPageData,
  type GlobalSearchTab,
} from '@/lib/global-search';
import {
  applyGlobalSearchFilters,
  createDefaultGlobalSearchFilters,
  isGlobalSearchFiltersActive,
  type GlobalSearchFilters,
} from '@/lib/global-search-filters';
import { detectUserCoordinates, type ViewerCoordinates } from '@/lib/geolocation';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';

const EMPTY_DATA: GlobalSearchPageData = {
  users: [],
  creators: [],
  serviceProviders: [],
  products: [],
  content: [],
};

const CATEGORY_ORDER: GlobalSearchCategory[] = [
  'creators',
  'serviceProviders',
  'products',
  'content',
];

function SearchSectionBox({
  title,
  count,
  seeMoreHref,
  children,
}: {
  title: string;
  count: number;
  seeMoreHref?: string;
  children: ReactNode;
}) {
  return (
    <section style={STUDIO_FLOAT_IN_STYLE}>
      <div className="mb-3 flex min-h-8 items-center justify-between gap-4">
        <h2 className="text-lg font-bold tracking-[-0.01em] text-[#111111] dark:text-neutral-100">
          {title} · {String(count).padStart(2, '0')}
        </h2>
        {seeMoreHref ? (
          <Link
            href={seeMoreHref}
            className="group inline-flex shrink-0 items-center gap-1.5 text-[15px] font-medium text-neutral-600 transition-colors hover:text-[#FF5722] dark:text-neutral-300"
          >
            See all
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function GlobalSearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const q = searchParams.get('q') ?? '';
  const rawTab = searchParams.get('tab') ?? 'all';
  const tab: GlobalSearchTab =
    rawTab === 'users'
      ? 'creators'
      : GLOBAL_SEARCH_TABS.includes(rawTab as GlobalSearchTab)
        ? (rawTab as GlobalSearchTab)
        : 'all';

  const [data, setData] = useState<GlobalSearchPageData>(EMPTY_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<GlobalSearchFilters>(() =>
    createDefaultGlobalSearchFilters(Boolean(user))
  );
  const [viewerCoords, setViewerCoords] = useState<ViewerCoordinates | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const trimmedQ = q.trim();
  const isAuthenticated = Boolean(user);
  const prevTrimmedQRef = useRef(trimmedQ);

  useEffect(() => {
    if (rawTab !== 'users') return;
    router.replace(buildGlobalSearchPageUrl(trimmedQ, 'creators'));
  }, [rawTab, router, trimmedQ]);

  useEffect(() => {
    if (prevTrimmedQRef.current === trimmedQ) return;
    prevTrimmedQRef.current = trimmedQ;
    setFilters(createDefaultGlobalSearchFilters(isAuthenticated));
    setFiltersOpen(false);
  }, [trimmedQ, isAuthenticated]);

  useEffect(() => {
    let cancelled = false;
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
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filterCategories = filters.categories;
  const filterProductType = filters.productType;
  const filterSort = filters.sort;
  const filterMinYears = filters.minYearsExperience;
  const filterNationality = filters.nationality;
  const filterClosest = filters.closestFirst;

  useEffect(() => {
    if (trimmedQ.length < GLOBAL_SEARCH_MIN_LENGTH) {
      setData(EMPTY_DATA);
      setLoading(false);
      return;
    }

    if (filterClosest && !viewerCoords && !geoError) {
      setLoading(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const limit = tab === 'all' ? GLOBAL_SEARCH_ALL_TAB_SECTION_SIZE : GLOBAL_SEARCH_FULL_PAGE_SIZE;
    const tabCategories = getCategoriesForTab(tab) ?? CATEGORY_ORDER;
    const categories = tabCategories.filter((category) => filterCategories.includes(category));

    void (async () => {
      try {
        const next = await fetchGlobalSearchPageData(trimmedQ, isAuthenticated, {
          limit,
          categories,
          viewerCoords,
          filters: {
            categories: filterCategories,
            dateRange: 'any',
            sort: filterSort,
            productType: filterProductType,
            contentMedia: 'all',
            minYearsExperience: filterMinYears,
            nationality: filterNationality,
            closestFirst: filterClosest,
          },
        });
        if (!cancelled) {
          setData(next);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Unable to load search results.');
          setData(EMPTY_DATA);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    trimmedQ,
    tab,
    isAuthenticated,
    filterCategories,
    filterProductType,
    filterSort,
    filterMinYears,
    filterNationality,
    filterClosest,
    viewerCoords,
    geoError,
  ]);

  const setTab = (next: GlobalSearchTab) => {
    if (trimmedQ.length < GLOBAL_SEARCH_MIN_LENGTH) return;
    router.replace(buildGlobalSearchPageUrl(trimmedQ, next));
  };

  const visibleCategories = useMemo(
    () =>
      tab === 'all'
        ? CATEGORY_ORDER.filter((category) => filters.categories.includes(category))
        : CATEGORY_ORDER.filter(
            (category) => category === tab && filters.categories.includes(category)
          ),
    [tab, filters.categories]
  );

  const filteredData = useMemo(
    () => applyGlobalSearchFilters(data, filters, trimmedQ),
    [data, filters, trimmedQ]
  );

  const peopleCount = Math.max(
    filteredData.creators.length,
    filteredData.serviceProviders.length
  );

  const rawResultCount =
    peopleCount + filteredData.products.length + filteredData.content.length;

  const displayedCount = useMemo(() => {
    if (tab === 'all') {
      return (
        Math.max(filteredData.creators.length, filteredData.serviceProviders.length) +
        filteredData.products.length +
        filteredData.content.length
      );
    }
    if (tab === 'users') return 0;
    return filteredData[tab].length;
  }, [filteredData, tab]);

  const filtersActive = isGlobalSearchFiltersActive(filters, isAuthenticated);

  if (trimmedQ.length < GLOBAL_SEARCH_MIN_LENGTH) {
    return (
      <div className="py-20 text-center">
        <p className="text-base text-neutral-400 dark:text-neutral-500">
          Use the search bar at the top or press <kbd className="rounded border px-1.5 py-0.5 text-xs">⌘K</kbd> to
          start a search.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-end gap-4 border-b border-black/[0.06] dark:border-white/[0.06]">
          <nav
            className="pf-scrollbar-hide flex min-w-0 flex-1 items-stretch gap-6 overflow-x-auto"
            aria-label="Search categories"
          >
            {GLOBAL_SEARCH_TABS.map((item) => {
              const isActive = tab === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative shrink-0 py-3.5 text-base transition-colors duration-200 ${
                    isActive
                      ? 'font-semibold text-[#0A0A0A] dark:text-white'
                      : 'font-medium text-neutral-600 hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  {GLOBAL_SEARCH_TAB_LABELS[item]}
                  {isActive ? (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#FF5722]" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
        <GlobalSearchCategoryQuickFilters tab={tab} filters={filters} onChange={setFilters} />
      </div>

      <GlobalSearchFilterModal
        open={filtersOpen}
        filters={filters}
        isAuthenticated={isAuthenticated}
        resultCount={displayedCount}
        onClose={() => setFiltersOpen(false)}
        onApply={setFilters}
      />

      {error ? <ErrorAlert message={error} onDismiss={() => setError(null)} /> : null}
      {geoError ? <ErrorAlert message={geoError} onDismiss={() => setGeoError(null)} /> : null}

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : displayedCount === 0 ? (
        <div className="py-20 text-center">
          <p className="text-base text-neutral-400 dark:text-neutral-500">
            {filtersActive && rawResultCount > 0
              ? 'No results match your filters. Try adjusting or clearing them.'
              : `No results for “${trimmedQ}”. Try different keywords.`}
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {visibleCategories.includes('creators') && filteredData.creators.length > 0 ? (
            <SearchSectionBox
              title={GLOBAL_SEARCH_CATEGORY_LABELS.creators}
              count={filteredData.creators.length}
              seeMoreHref={tab === 'all' ? buildGlobalSearchPageUrl(trimmedQ, 'creators') : undefined}
            >
              <div className={RESULT_FRAME_CLASS}>
                {filteredData.creators.map((creator) => (
                  <SearchCreatorRow key={creator.userId ?? creator.id} creator={creator} />
                ))}
              </div>
            </SearchSectionBox>
          ) : null}

          {visibleCategories.includes('serviceProviders') &&
          filteredData.serviceProviders.length > 0 ? (
            <SearchSectionBox
              title={GLOBAL_SEARCH_CATEGORY_LABELS.serviceProviders}
              count={filteredData.serviceProviders.length}
              seeMoreHref={
                tab === 'all' ? buildGlobalSearchPageUrl(trimmedQ, 'serviceProviders') : undefined
              }
            >
              {tab === 'all' ? (
                <div className={RESULT_FRAME_CLASS}>
                  {filteredData.serviceProviders.map((creator) => (
                    <SearchServiceProviderRow
                      key={creator.id ?? creator.userId ?? creator.fullName}
                      creator={creator}
                    />
                  ))}
                </div>
              ) : (
                <SearchServiceProviderGrid creators={filteredData.serviceProviders} />
              )}
            </SearchSectionBox>
          ) : null}

          {visibleCategories.includes('products') && filteredData.products.length > 0 ? (
            <SearchSectionBox
              title={GLOBAL_SEARCH_CATEGORY_LABELS.products}
              count={filteredData.products.length}
              seeMoreHref={tab === 'all' ? buildGlobalSearchPageUrl(trimmedQ, 'products') : undefined}
            >
              <div className={searchProductGridClassName}>
                {filteredData.products.map((product) => (
                  <SearchProductCard key={product.id} product={product} />
                ))}
              </div>
            </SearchSectionBox>
          ) : null}

          {visibleCategories.includes('content') && filteredData.content.length > 0 ? (
            <SearchSectionBox
              title={GLOBAL_SEARCH_CATEGORY_LABELS.content}
              count={filteredData.content.length}
              seeMoreHref={tab === 'all' ? buildGlobalSearchPageUrl(trimmedQ, 'content') : undefined}
            >
              <div className="snap-y snap-proximity">
                {filteredData.content.map((post) => (
                  <section
                    key={post.id}
                    className="flex min-h-0 snap-center snap-always scroll-mt-6 items-center justify-center pb-10 pt-2 lg:h-[80vh] lg:min-h-[80vh]"
                  >
                    <PublicContentPostCard post={post} className="w-full" />
                  </section>
                ))}
              </div>
            </SearchSectionBox>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function GlobalSearchResultsView() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      }
    >
      <GlobalSearchResultsContent />
    </Suspense>
  );
}
