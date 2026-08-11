'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PublicContentPostCard } from '@/components/home/PublicContentPostCard';
import { SearchCreatorRow } from '@/components/search/SearchCreatorRow';
import {
  GlobalSearchFilterButton,
  GlobalSearchFilterModal,
} from '@/components/search/GlobalSearchFilterModal';
import { SearchProductCard, searchProductGridClassName } from '@/components/search/SearchProductCard';
import { Avatar } from '@/components/ui/Avatar';
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
import { createOrGetConversation } from '@/lib/messaging';
import {
  applyGlobalSearchFilters,
  createDefaultGlobalSearchFilters,
  isGlobalSearchFiltersActive,
  type GlobalSearchFilters,
} from '@/lib/global-search-filters';
import type { MessagingUserSummary } from '@/types/messaging';

const EMPTY_DATA: GlobalSearchPageData = {
  users: [],
  creators: [],
  products: [],
  content: [],
};

const CATEGORY_ORDER: GlobalSearchCategory[] = ['users', 'creators', 'products', 'content'];

function SearchUserCard({
  user,
  onOpen,
  busy,
}: {
  user: MessagingUserSummary;
  onOpen: () => void;
  busy: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={busy}
      className="group flex w-full items-center gap-5 rounded-2xl border border-neutral-200 bg-white p-6 text-left shadow-sm transition hover:border-neutral-300 hover:shadow-md disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
    >
      <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="lg" tone="muted" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-bold text-neutral-900 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
          {user.fullName}
        </p>
        <p className="mt-1 text-base text-neutral-600 dark:text-neutral-300">Open conversation</p>
      </div>
      <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
        Message
      </span>
    </button>
  );
}

function SearchSectionBox({
  title,
  seeMoreHref,
  children,
}: {
  title: string;
  seeMoreHref?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900/60">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
          {title}
        </p>
        {seeMoreHref ? (
          <Link
            href={seeMoreHref}
            className="shrink-0 text-sm font-medium text-neutral-600 transition hover:text-neutral-800 dark:text-white dark:hover:text-neutral-200"
          >
            See more →
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
  const tab: GlobalSearchTab = GLOBAL_SEARCH_TABS.includes(rawTab as GlobalSearchTab)
    ? (rawTab as GlobalSearchTab)
    : 'all';

  const [data, setData] = useState<GlobalSearchPageData>(EMPTY_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openingUserId, setOpeningUserId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<GlobalSearchFilters>(() =>
    createDefaultGlobalSearchFilters(Boolean(user))
  );

  const trimmedQ = q.trim();
  const isAuthenticated = Boolean(user);
  const prevTrimmedQRef = useRef(trimmedQ);

  useEffect(() => {
    if (prevTrimmedQRef.current === trimmedQ) return;
    prevTrimmedQRef.current = trimmedQ;
    setFilters(createDefaultGlobalSearchFilters(isAuthenticated));
    setFiltersOpen(false);
  }, [trimmedQ, isAuthenticated]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.filter(
        (category) => category !== 'users' || isAuthenticated
      ),
    }));
  }, [isAuthenticated]);

  const filterCategories = filters.categories;
  const filterProductType = filters.productType;
  const filterSort = filters.sort;

  useEffect(() => {
    if (trimmedQ.length < GLOBAL_SEARCH_MIN_LENGTH) {
      setData(EMPTY_DATA);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const limit = tab === 'all' ? GLOBAL_SEARCH_ALL_TAB_SECTION_SIZE : GLOBAL_SEARCH_FULL_PAGE_SIZE;
    const tabCategories =
      getCategoriesForTab(tab) ??
      CATEGORY_ORDER.filter((category) => category !== 'users' || isAuthenticated);
    const categories = tabCategories.filter((category) => filterCategories.includes(category));

    void (async () => {
      try {
        const next = await fetchGlobalSearchPageData(trimmedQ, isAuthenticated, {
          limit,
          categories,
          filters: {
            categories: filterCategories,
            dateRange: 'any',
            sort: filterSort,
            productType: filterProductType,
            contentMedia: 'all',
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
  }, [trimmedQ, tab, isAuthenticated, filterCategories, filterProductType, filterSort]);

  const openUser = useCallback(
    async (member: MessagingUserSummary) => {
      if (openingUserId) return;
      setOpeningUserId(member.id);
      try {
        const conversation = await createOrGetConversation(member.id);
        router.push(`/dashboard/discussions?conversation=${encodeURIComponent(conversation.id)}`);
      } finally {
        setOpeningUserId(null);
      }
    },
    [openingUserId, router]
  );

  const setTab = (next: GlobalSearchTab) => {
    if (trimmedQ.length < GLOBAL_SEARCH_MIN_LENGTH) return;
    router.replace(buildGlobalSearchPageUrl(trimmedQ, next));
  };

  const visibleCategories = useMemo(
    () =>
      tab === 'all'
        ? CATEGORY_ORDER.filter(
            (category) =>
              filters.categories.includes(category) && (category !== 'users' || isAuthenticated)
          )
        : CATEGORY_ORDER.filter(
            (category) =>
              category === tab &&
              filters.categories.includes(category) &&
              (category !== 'users' || isAuthenticated)
          ),
    [tab, isAuthenticated, filters.categories]
  );

  const filteredData = useMemo(() => applyGlobalSearchFilters(data, filters), [data, filters]);

  const rawResultCount =
    data.users.length + data.creators.length + data.products.length + data.content.length;

  const displayedCount = useMemo(() => {
    if (tab === 'all') {
      return (
        filteredData.creators.length +
        filteredData.products.length +
        filteredData.content.length +
        (isAuthenticated ? filteredData.users.length : 0)
      );
    }
    return filteredData[tab].length;
  }, [filteredData, tab, isAuthenticated]);

  const filtersActive = isGlobalSearchFiltersActive(filters, isAuthenticated);

  if (trimmedQ.length < GLOBAL_SEARCH_MIN_LENGTH) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-200 bg-white/80 px-8 py-16 text-center dark:border-neutral-700 dark:bg-neutral-900/80">
        <p className="text-neutral-600 dark:text-neutral-400">
          Use the search bar at the top or press <kbd className="rounded border px-1.5 py-0.5 text-xs">⌘K</kbd> to
          start a search.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {GLOBAL_SEARCH_TABS.filter((item) => item !== 'users' || isAuthenticated).map((item) => {
            const isActive = tab === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`rounded-full px-5 py-2.5 text-base font-semibold transition ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'bg-transparent text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white'
                }`}
              >
                {GLOBAL_SEARCH_TAB_LABELS[item]}
              </button>
            );
          })}
        </div>
        <GlobalSearchFilterButton onClick={() => setFiltersOpen(true)} />
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

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : displayedCount === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-200 bg-white px-8 py-16 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-base text-neutral-600 dark:text-neutral-300">
            {filtersActive && rawResultCount > 0
              ? 'No results match your filters. Try adjusting or clearing them.'
              : `No results for “${trimmedQ}”. Try different keywords.`}
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {visibleCategories.includes('users') && filteredData.users.length > 0 ? (
            <SearchSectionBox
              title={GLOBAL_SEARCH_CATEGORY_LABELS.users}
              seeMoreHref={tab === 'all' ? buildGlobalSearchPageUrl(trimmedQ, 'users') : undefined}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                {filteredData.users.map((member) => (
                  <SearchUserCard
                    key={member.id}
                    user={member}
                    busy={openingUserId != null}
                    onOpen={() => void openUser(member)}
                  />
                ))}
              </div>
            </SearchSectionBox>
          ) : null}

          {visibleCategories.includes('creators') && filteredData.creators.length > 0 ? (
            <SearchSectionBox
              title={GLOBAL_SEARCH_CATEGORY_LABELS.creators}
              seeMoreHref={tab === 'all' ? buildGlobalSearchPageUrl(trimmedQ, 'creators') : undefined}
            >
              <div className="space-y-4">
                {filteredData.creators.map((creator) => (
                  <SearchCreatorRow key={creator.userId ?? creator.id} creator={creator} />
                ))}
              </div>
            </SearchSectionBox>
          ) : null}

          {visibleCategories.includes('products') && filteredData.products.length > 0 ? (
            <SearchSectionBox
              title={GLOBAL_SEARCH_CATEGORY_LABELS.products}
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
