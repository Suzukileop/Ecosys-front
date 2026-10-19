'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchContentCard, searchContentGridClassName } from '@/components/search/SearchContentCard';
import { SearchCreatorRow } from '@/components/search/SearchCreatorRow';
import { SearchServiceProviderGrid } from '@/components/search/SearchServiceProviderGrid';
import { SearchServiceProviderRow } from '@/components/search/SearchServiceProviderRow';
import { GlobalSearchFilterModal } from '@/components/search/GlobalSearchFilterModal';
import {
  describeActiveGlobalSearchFilters,
  GlobalSearchRefineGroups,
  isPeopleTab,
} from '@/components/search/GlobalSearchCategoryQuickFilters';
import { SortMenu } from '@/components/marketplace/CatalogRailKit';
import { ProviderRefineBox } from '@/components/marketplace/ProviderDiscoverRail';
import { SearchProductCard, searchProductGridClassName } from '@/components/search/SearchProductCard';
import { useRecentSearches } from '@/components/search/recentSearches';
import { OPEN_GLOBAL_SEARCH_EVENT } from '@/components/layout/DashboardHeaderSearch';
import { ALL_ICON, RailGlyph } from '@/components/home/NewsDiscoverRail';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BackToTopButton, useBackToTop } from '@/components/ui/ScrollUpStickyBar';
import { useAuth } from '@/context/AuthContext';
import {
  buildGlobalSearchPageUrl,
  fetchGlobalSearchPageData,
  getCategoriesForTab,
  GLOBAL_SEARCH_ALL_TAB_SECTION_SIZE,
  GLOBAL_SEARCH_FULL_PAGE_SIZE,
  GLOBAL_SEARCH_MIN_LENGTH,
  GLOBAL_SEARCH_TABS,
  type GlobalSearchCategory,
  type GlobalSearchPageData,
  type GlobalSearchTab,
} from '@/lib/global-search';
import {
  applyGlobalSearchFilters,
  countActiveGlobalSearchFilters,
  createDefaultGlobalSearchFilters,
  GLOBAL_SEARCH_SORT_OPTIONS,
  isGlobalSearchFiltersActive,
  type GlobalSearchFilters,
} from '@/lib/global-search-filters';
import { geolocationAlreadyGranted, resolveViewerLocation, type ViewerLocation } from '@/lib/viewer-location';
import { ClosestFirstNote } from '@/components/marketplace/ClosestFirstNote';
import { getApiErrorMessage } from '@/lib/api-error';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';
import { useT } from '@/lib/i18n/I18nProvider';

/*
 * The /search results page, laid out like News and Providers:
 *  - the navbar's frame (32 / 48 / 64px gutters, 1240px cap); below lg one 600px column, edge to edge
 *    on phones with 20px text gutters; from lg the results and a sticky 340px rail (400px from xl);
 *  - the rail holds two outlined `.gn-rail-box` boxes — "Results" (the result types, 48px rows with
 *    the News glyphs, the open one bold with a check) and "Refine" (the open type's filters, as the
 *    Products / Providers Refine rows); the order is a "Sort by ▾" menu on the results line;
 *  - below lg the types are the News interest chips and every filter sits behind one Filters button
 *    (a bottom sheet with a sticky "Show N results").
 *
 * Above the results, one sentence-case line ("Results for “logo”"), then "Filtered by: … · Clear"
 * while filters narrow them. Each block of results opens on the News section line — "■ PROFILES" in
 * small caps — with "See all" on the All tab.
 *
 * What it fixes: the All tab listed the same people twice ("Profiles" and "Service Provider" are one
 * search), the filters modal could not be opened at all, the type tabs used an underline nobody else
 * on the site uses, the six product and six post previews became twelve full-screen blocks on a phone
 * (they are now one swipeable row each), and a lone spinner stood in for the page while it loaded.
 *
 * Data flow is unchanged: the URL carries `q` and `tab`, the filters live in state and reset with
 * the query, and the fetch / client-side filtering are the same calls as before.
 */

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

/** The type names as the page shows them (sentence case, plural). */
const TYPE_LABELS: Record<GlobalSearchTab, string> = {
  all: 'All',
  users: 'Users',
  creators: 'Profiles',
  serviceProviders: 'Service providers',
  products: 'Products',
  content: 'Content',
};

/** Rail glyphs for the types, on the News rail's 24-unit grid (RailGlyph). */
const TYPE_ICONS: Record<GlobalSearchTab, ReactNode> = {
  all: ALL_ICON,
  users: null,
  /* A person. */
  creators: (
    <>
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  /* A briefcase. */
  serviceProviders: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M3 12.5h18" />
    </>
  ),
  /* A shopping bag. */
  products: (
    <>
      <path d="M5 8h14l-1 12.5H6z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  /* A picture. */
  content: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.75" />
      <path d="m21 15.5-5-5L5 20" />
    </>
  ),
};

function SlidersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" aria-hidden>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

const RAIL_BOX_TITLE = 'px-6 pb-2 pt-1 text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]';

const RAIL_ROW =
  'flex w-full items-center gap-3 px-6 py-3.5 text-left text-[15px] leading-5 text-[color:var(--gn-ink)] transition-colors duration-150 hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)]';

const PRIMARY_PILL =
  'inline-flex h-10 items-center justify-center rounded-full bg-[color:var(--gn-primary)] px-5 text-[15px] font-semibold leading-5 text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';

const SECONDARY_PILL =
  'inline-flex h-10 items-center justify-center rounded-full px-5 text-[15px] font-semibold leading-5 text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[color:var(--gn-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] dark:shadow-[inset_0_0_0_1px_#536471]';

/** Below lg: the result types as the News interest chips, one swipeable row. */
function TypeChips({ tab, onSelect }: { tab: GlobalSearchTab; onSelect: (next: GlobalSearchTab) => void }) {
  const t = useT();
  return (
    <nav
      aria-label={t('Result types')}
      className="flex gap-2 overflow-x-auto scroll-px-5 px-5 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {GLOBAL_SEARCH_TABS.map((item) => {
        const active = tab === item;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            aria-current={active ? 'page' : undefined}
            data-pf-no-color-transition
            className={`inline-flex h-10 shrink-0 items-center rounded-full px-4 text-[14px] font-semibold leading-5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] sm:h-9 ${
              active
                ? 'bg-[color:var(--gn-ink)] text-[color:var(--gn-surface)]'
                : 'bg-[color:var(--gn-surface)] text-[color:var(--gn-ink)] active:bg-[color:var(--gn-hover-strong,var(--gn-hover))]'
            }`}
          >
            {TYPE_LABELS[item]}
          </button>
        );
      })}
    </nav>
  );
}

/** From lg: the result types as the News rail's trend rows. */
function TypeBox({ tab, onSelect }: { tab: GlobalSearchTab; onSelect: (next: GlobalSearchTab) => void }) {
  const t = useT();
  return (
    <section className="gn-rail-box flex min-h-0 flex-col px-px pb-2 pt-5" aria-labelledby="search-types-title">
      <h2 id="search-types-title" className={RAIL_BOX_TITLE}>
        {t('Results')}
      </h2>
      <nav aria-label={t('Result types')} className="flex w-full flex-col">
        {GLOBAL_SEARCH_TABS.map((item) => {
          const active = tab === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              aria-current={active ? 'page' : undefined}
              data-pf-no-color-transition
              className={`${RAIL_ROW} ${active ? 'font-bold' : 'font-normal'}`}
            >
              <RailGlyph active={active}>{TYPE_ICONS[item]}</RailGlyph>
              <span className="min-w-0 flex-1 truncate">{TYPE_LABELS[item]}</span>
              {active ? <CheckMark /> : null}
            </button>
          );
        })}
      </nav>
    </section>
  );
}

/** "■ PROFILES · 6" — the News section line, with "See all" at the right on the All tab. */
function SectionLine({ id, title, count, seeAllHref }: { id: string; title: string; count?: number; seeAllHref?: string }) {
  const t = useT();
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 px-5 pb-2 sm:px-1">
      <h2 id={id} className="gn-kicker flex min-w-0 items-center gap-2.5">
        <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-[color:var(--gn-ink)]" />
        <span className="truncate">
          {title}
          {count != null && count > 0 ? <span className="tabular-nums"> · {count}</span> : null}
        </span>
      </h2>
      {seeAllHref ? (
        <Link
          href={seeAllHref}
          data-pf-no-color-transition
          aria-label={t('See all {toLowerCase}', { toLowerCase: title.toLowerCase() })}
          className="-mr-3 inline-flex h-10 shrink-0 items-center rounded-full px-3 text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
        >
          {t('See all')}
        </Link>
      ) : null}
    </div>
  );
}

function ResultSection({
  id,
  title,
  count,
  seeAllHref,
  children,
}: {
  id: string;
  title: string;
  count?: number;
  seeAllHref?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} style={STUDIO_FLOAT_IN_STYLE}>
      <SectionLine id={id} title={title} count={count} seeAllHref={seeAllHref} />
      {children}
    </section>
  );
}

/** Loading: the shapes of what is coming (a people block, two cards) in the card tone. */
function ResultsSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-8">
      <div>
        <div className="px-5 pb-3 pt-3 sm:px-1">
          <span className="xs-skeleton block h-2.5 w-24 bg-[color:var(--gn-surface)]" />
        </div>
        <div className="gn-card py-2">
          {[0, 1, 2].map((row) => (
            <div key={row} className="xs-skeleton flex items-center gap-3 px-5 py-3 sm:gap-4 sm:px-6">
              <span className="h-12 w-12 shrink-0 rounded-full bg-[color:var(--gn-inset)]" />
              <span className="flex-1 space-y-2">
                <span className="block h-3 w-2/5 rounded-full bg-[color:var(--gn-inset)]" />
                <span className="block h-2.5 w-3/5 rounded-full bg-[color:var(--gn-inset)]" />
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-5">
        {[0, 1].map((card) => (
          <div key={card} className={`gn-card xs-skeleton ${card === 1 ? 'hidden sm:block' : ''}`}>
            <div className="aspect-[4/3] bg-[color:var(--gn-inset)]" />
            <div className="space-y-2 px-5 py-4">
              <span className="block h-3 w-3/5 rounded-full bg-[color:var(--gn-inset)]" />
              <span className="block h-2.5 w-2/5 rounded-full bg-[color:var(--gn-inset)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** No query yet: an invitation, the viewer's recent searches, and a way into the overlay. */
function SearchLanding() {
  const t = useT();
  const recent = useRecentSearches();
  return (
    <div className="mx-auto w-full max-w-[600px]">
      <div className="gn-card px-6 py-12 text-center">
        <p className="text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]">{t('Search Skraft')}</p>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-5 text-[color:var(--gn-ink2)]">
          {t('Find people, products and posts.')}
          <span className="hidden lg:inline">
            {' '}
            {t('Press')}{' '}
            <kbd className="bg-[color:var(--gn-inset)] px-1.5 py-0.5 font-sans text-[12px] font-semibold text-[color:var(--gn-ink)]">
              {t('⌘K')}
            </kbd>{' '}
            {t('anywhere.')}
          </span>
        </p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(OPEN_GLOBAL_SEARCH_EVENT))}
          className={`${PRIMARY_PILL} mt-6`}
        >
          {t('Start a search')}
        </button>
      </div>
      {recent.length > 0 ? (
        <section aria-labelledby="search-recent-title" className="pt-8">
          <SectionLine id="search-recent-title" title={t('Recent searches')} />
          <ul className="flex flex-wrap gap-2 px-5 sm:px-1">
            {recent.map((term) => (
              <li key={term}>
                <Link
                  href={buildGlobalSearchPageUrl(term)}
                  className="inline-flex h-10 items-center rounded-full bg-[color:var(--gn-surface)] px-4 text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] sm:h-9"
                >
                  {term}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function GlobalSearchResultsContent() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, hasRole, isLoading: authLoading } = useAuth();

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
  const [viewerCoords, setViewerCoords] = useState<ViewerLocation | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoAttempt, setGeoAttempt] = useState(0);
  const topRef = useRef<HTMLElement>(null);
  const backToTop = useBackToTop(topRef);

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

  /* Asked for only when "Closest first" is on or the browser already allows it silently; a failed
     device fix falls back to the creator's profile location (see viewer-location). */
  const wantsClosest = filters.closestFirst;
  const isCreator = hasRole('ROLE_CREATOR');
  useEffect(() => {
    if (authLoading || viewerCoords) return undefined;
    let cancelled = false;
    void (async () => {
      if (!wantsClosest && !(await geolocationAlreadyGranted())) return;
      if (cancelled) return;
      setGeoError(null);
      try {
        const location = await resolveViewerLocation({ profileFallback: isCreator });
        if (!cancelled) setViewerCoords(location);
      } catch (e) {
        if (!cancelled) setGeoError(getApiErrorMessage(e, t('Unable to detect your location.')));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, geoAttempt, isCreator, viewerCoords, wantsClosest, t]);

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
          setError(getApiErrorMessage(e, t('Unable to load search results. Please try again.')));
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
  const activeFilterCount = countActiveGlobalSearchFilters(filters, isAuthenticated);
  const activeFilterLabels = describeActiveGlobalSearchFilters(filters, isAuthenticated);
  const clearFilters = () => setFilters(createDefaultGlobalSearchFilters(isAuthenticated));

  if (trimmedQ.length < GLOBAL_SEARCH_MIN_LENGTH) {
    return (
      <div className="x-search news-theme news-feed news-mono w-full pb-24 pt-2 sm:px-8 sm:pt-4 md:px-12 lg:px-16 lg:pt-3">
        <h1 className="sr-only">{t('Search')}</h1>
        <SearchLanding />
      </div>
    );
  }

  /* On the All tab, both people blocks: Profiles (everyone who matches) and Service providers (those
     of them who offer services) — a provider can appear in both, as on their own tabs. */
  const allProfiles = visibleCategories.includes('creators') ? filteredData.creators : [];
  const allProviders = visibleCategories.includes('serviceProviders') ? filteredData.serviceProviders : [];

  const results =
    tab === 'all' ? (
      <div className="flex flex-col gap-8 sm:gap-10">
        {allProfiles.length > 0 ? (
          <ResultSection
            id="search-section-people"
            title={TYPE_LABELS.creators}
            seeAllHref={buildGlobalSearchPageUrl(trimmedQ, 'creators')}
          >
            <div className="gn-card py-2">
              {allProfiles.map((creator) => (
                <SearchCreatorRow key={creator.userId ?? creator.id} creator={creator} />
              ))}
            </div>
          </ResultSection>
        ) : null}

        {allProviders.length > 0 ? (
          <ResultSection
            id="search-section-providers"
            title={TYPE_LABELS.serviceProviders}
            seeAllHref={buildGlobalSearchPageUrl(trimmedQ, 'serviceProviders')}
          >
            <div className="gn-card py-2">
              {allProviders.map((creator) => (
                <SearchServiceProviderRow key={creator.id ?? creator.userId ?? creator.fullName} creator={creator} />
              ))}
            </div>
          </ResultSection>
        ) : null}

        {visibleCategories.includes('products') && filteredData.products.length > 0 ? (
          <ResultSection
            id="search-section-products"
            title={TYPE_LABELS.products}
            seeAllHref={buildGlobalSearchPageUrl(trimmedQ, 'products')}
          >
            <div className="xs-swipe">
              {filteredData.products.map((product) => (
                <div key={product.id} className="flex">
                  <SearchProductCard product={product} />
                </div>
              ))}
            </div>
          </ResultSection>
        ) : null}

        {visibleCategories.includes('content') && filteredData.content.length > 0 ? (
          <ResultSection
            id="search-section-content"
            title={TYPE_LABELS.content}
            seeAllHref={buildGlobalSearchPageUrl(trimmedQ, 'content')}
          >
            {/* Posts two per row at every width from sm — their cards carry a title and text. */}
            <div className="xs-swipe xs-swipe--pairs">
              {filteredData.content.map((post) => (
                <div key={post.id} className="flex">
                  <SearchContentCard post={post} />
                </div>
              ))}
            </div>
          </ResultSection>
        ) : null}
      </div>
    ) : (
      <>
        {tab === 'creators' && visibleCategories.includes('creators') ? (
          <ResultSection id="search-section-creators" title={TYPE_LABELS.creators} count={filteredData.creators.length}>
            <div className="gn-card py-2">
              {filteredData.creators.map((creator) => (
                <SearchCreatorRow key={creator.userId ?? creator.id} creator={creator} />
              ))}
            </div>
          </ResultSection>
        ) : null}

        {tab === 'serviceProviders' && visibleCategories.includes('serviceProviders') ? (
          <ResultSection
            id="search-section-providers"
            title={TYPE_LABELS.serviceProviders}
            count={filteredData.serviceProviders.length}
          >
            <SearchServiceProviderGrid creators={filteredData.serviceProviders} />
          </ResultSection>
        ) : null}

        {tab === 'products' && visibleCategories.includes('products') ? (
          <ResultSection id="search-section-products" title={TYPE_LABELS.products} count={filteredData.products.length}>
            <div className={searchProductGridClassName}>
              {filteredData.products.map((product) => (
                <SearchProductCard key={product.id} product={product} />
              ))}
            </div>
          </ResultSection>
        ) : null}

        {tab === 'content' && visibleCategories.includes('content') ? (
          <ResultSection id="search-section-content" title={TYPE_LABELS.content} count={filteredData.content.length}>
            <div className={searchContentGridClassName}>
              {filteredData.content.map((post) => (
                <SearchContentCard key={post.id} post={post} />
              ))}
            </div>
          </ResultSection>
        ) : null}
      </>
    );

  const narrowedByFilters = filtersActive && rawResultCount > 0;
  const emptyState = (
    <div className="gn-card flex flex-col items-center px-6 py-14 text-center">
      <p className="text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)] [overflow-wrap:anywhere]">
        {narrowedByFilters ? t('No results match your filters') : `No results for “${trimmedQ}”`}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-[15px] leading-5 text-[color:var(--gn-ink2)]">
        {narrowedByFilters
          ? t('Try adjusting or clearing them.')
          : tab !== 'all'
            ? `Nothing in ${TYPE_LABELS[tab].toLowerCase()} — the other types may have something.`
            : t('Try different keywords or check the spelling.')}
      </p>
      {filtersActive || tab !== 'all' ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {filtersActive ? (
            <button type="button" onClick={clearFilters} className={PRIMARY_PILL}>
              {t('Clear filters')}
            </button>
          ) : null}
          {tab !== 'all' ? (
            <button type="button" onClick={() => setTab('all')} className={filtersActive ? SECONDARY_PILL : PRIMARY_PILL}>
              {t('Search all types')}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className="x-search providers-x news-theme news-feed news-mono w-full pb-24 pt-2 sm:px-8 sm:pt-4 md:px-12 lg:px-16 lg:pt-3"
      style={STUDIO_FLOAT_IN_STYLE}
    >
      <h1 className="sr-only">{t('Search results for “{trimmedQ}”', { trimmedQ })}</h1>

      {/* Below lg: every filter of the open type in one bottom sheet. */}
      <GlobalSearchFilterModal
        open={filtersOpen}
        tab={tab}
        filters={filters}
        isAuthenticated={isAuthenticated}
        resultCount={displayedCount}
        loading={loading}
        onClose={() => setFiltersOpen(false)}
        onApply={setFilters}
      />

      <div className="mx-auto grid w-full max-w-[600px] items-start gap-8 lg:max-w-[1240px] lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
        <div className="min-w-0">
          <div className="flex w-full min-w-0 flex-col gap-3">
            <div className="pt-1 lg:hidden">
              <TypeChips tab={tab} onSelect={setTab} />
            </div>

            {/* The page's line: what was searched, the Filters button (below lg), then what narrows
                the results — plain sentence case, like News's "Filtered by: … · Clear". */}
            <header ref={topRef} className="flex scroll-mt-24 flex-col gap-1 px-5 pt-2 sm:px-1 lg:pt-0">
              <div className="flex min-h-10 items-center justify-between gap-4">
                <p className="min-w-0 truncate text-[15px] leading-5 text-[color:var(--gn-ink2)]">
                  {t('Results for')} <span className="font-semibold text-[color:var(--gn-ink)]">“{trimmedQ}”</span>
                </p>
                {/* From lg, the order sits here as on Products — "Sort by: Newest first ▾" — not in Refine. */}
                {!isPeopleTab(tab) ? (
                  <div className="hidden lg:block">
                    <SortMenu
                      value={filters.sort}
                      options={GLOBAL_SEARCH_SORT_OPTIONS}
                      menuLabel={t('Sort results')}
                      onChange={(sort) => setFilters({ ...filters, sort })}
                    />
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  aria-haspopup="dialog"
                  aria-label={activeFilterCount > 0 ? t('Filters ({activeFilterCount} active)', { activeFilterCount }) : t('Filters')}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[color:var(--gn-surface)] pl-3.5 pr-4 text-[14px] font-semibold text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] lg:hidden"
                >
                  <SlidersIcon className="h-[18px] w-[18px]" />
                  {t('Filters')}
                  {activeFilterCount > 0 ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--gn-ink)] px-1.5 text-[11px] font-bold tabular-nums text-[color:var(--gn-surface)]">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </button>
              </div>
              {activeFilterLabels.length > 0 ? (
                <p className="flex min-w-0 items-center gap-1.5 text-[14px] leading-5 text-[color:var(--gn-ink2)]">
                  <span className="shrink-0">{t('Filtered by:')}</span>
                  <span className="truncate font-semibold text-[color:var(--gn-ink)]">{activeFilterLabels.join(' · ')}</span>
                  <span aria-hidden className="shrink-0 text-[color:var(--gn-ink3)]">·</span>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex min-h-10 shrink-0 items-center font-medium text-[color:var(--gn-ink)] underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
                  >
                    {t('Clear')}
                  </button>
                </p>
              ) : null}
            </header>

            {error ? (
              <div className="px-5 sm:px-0">
                <ErrorAlert message={error} onDismiss={() => setError(null)} />
              </div>
            ) : null}
            {filters.closestFirst && (geoError || viewerCoords?.source === 'profile') ? (
              <div className="px-5 sm:px-1">
                <ClosestFirstNote
                  profilePlace={viewerCoords?.source === 'profile' ? viewerCoords.placeLabel ?? 'your profile location' : null}
                  onRetry={() => {
                    setGeoError(null);
                    setViewerCoords(null);
                    setGeoAttempt((n) => n + 1);
                  }}
                />
              </div>
            ) : null}

            <div className="pt-2" aria-busy={loading}>
              {loading ? <ResultsSkeleton /> : displayedCount === 0 ? emptyState : results}
            </div>
          </div>
        </div>

        {/* The rail (from lg), sticky under the navbar like News's. Re-mounted when the open type or
            the filtered state changes, so the pinned rail re-measures a Refine box that grew. */}
        <div className="hidden self-start lg:block">
          <ProfileSectionStickyAside
            key={`${tab}-${filtersActive ? 'filtered' : 'all'}`}
            className="w-full"
            surfaceClassName="flex w-full max-w-full min-w-0 flex-col gap-6"
            overflowVisible
          >
            <TypeBox tab={tab} onSelect={setTab} />
            <ProviderRefineBox
              footer={
                filtersActive ? (
                  <div className="px-6 pb-2 pt-3 text-[14px]">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="font-semibold text-[color:var(--gn-ink)] underline underline-offset-4 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
                    >
                      {t('Clear all filters')}
                    </button>
                  </div>
                ) : null
              }
            >
              <GlobalSearchRefineGroups tab={tab} filters={filters} onChange={setFilters} idPrefix="search-rail" inset="rail" />
            </ProviderRefineBox>
          </ProfileSectionStickyAside>
        </div>
      </div>

      <BackToTopButton visible={backToTop.visible} onClick={backToTop.backToTop} />
    </div>
  );
}

export function GlobalSearchResultsView() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20 text-[#536471] dark:text-[#8B98A5]">
          <LoadingSpinner />
        </div>
      }
    >
      <GlobalSearchResultsContent />
    </Suspense>
  );
}
