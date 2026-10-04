'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CreatorContentPublishModal } from '@/components/creator/CreatorContentPublishModal';
import { NewsComposer } from '@/components/home/NewsComposer';
import { NewsDiscoverRail, PortfolioCta } from '@/components/home/NewsDiscoverRail';
import { NewsFeedPostCard } from '@/components/home/NewsFeedPostCard';
import { NEWS_OPEN_PUBLISH_EVENT } from '@/components/home/NewsPublishHeaderCta';
import { HomeNewsFeedSkeleton } from '@/components/home/HomeNewsSkeleton';
import { PORTFOLIO_FRAME_CLASS } from '@/components/portfolio/portfolioFrame';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { getApiErrorMessage } from '@/lib/api-error';
import { listPublicContentFeed } from '@/lib/marketplace-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { useAuth } from '@/context/AuthContext';
import type { PublicContentFeedItem } from '@/types/marketplace';

export function HomeNewsFeed() {
  const { hasRole } = useAuth();
  const canPublish = hasRole('ROLE_CREATOR');
  const [items, setItems] = useState<PublicContentFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [interest, setInterest] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const sentinelRef = useRef<HTMLDivElement>(null);

  const activeQuery = searchQuery.trim() || interest;

  const loadPage = useCallback(
    async (pageIndex: number, append: boolean, query?: string | null) => {
      try {
        setError(null);
        if (append) setLoadingMore(true);
        else setLoading(true);

        const result = await listPublicContentFeed({
          page: pageIndex,
          size: 10,
          ...(query?.trim() ? { q: query.trim() } : {}),
        });
        setItems((prev) => (append ? [...prev, ...result.content] : result.content));
        setPage(pageIndex);
        setHasMore(!result.last);
      } catch (e) {
        setError(getApiErrorMessage(e, 'Unable to load the news feed.'));
        if (!append) setItems([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearchQuery(searchDraft.trim());
    }, 320);
    return () => window.clearTimeout(t);
  }, [searchDraft]);

  useEffect(() => {
    void loadPage(0, false, activeQuery);
  }, [loadPage, activeQuery]);

  useEffect(() => {
    if (!canPublish) return;
    const onOpenPublish = () => setPublishOpen(true);
    window.addEventListener(NEWS_OPEN_PUBLISH_EVENT, onOpenPublish);
    return () => window.removeEventListener(NEWS_OPEN_PUBLISH_EVENT, onOpenPublish);
  }, [canPublish]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadPage(page + 1, true, activeQuery);
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadPage, page, activeQuery]);

  const handlePublished = useCallback(() => {
    pushFlashFeedback({
      variant: 'success',
      title: 'Content published',
    });
    void loadPage(0, false, activeQuery);
  }, [loadPage, activeQuery]);

  const handleInterestSelect = useCallback((value: string | null) => {
    setInterest(value);
    setSearchDraft('');
    setSearchQuery('');
    setPage(0);
    setHasMore(false);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchDraft(value);
    setInterest(null);
    setPage(0);
    setHasMore(false);
  }, []);

  const clearFilters = () => {
    setInterest(null);
    setSearchDraft('');
    setSearchQuery('');
  };

  const discoverProps = {
    selected: interest,
    onSelect: handleInterestSelect,
    search: searchDraft,
    onSearchChange: handleSearchChange,
  };

  const feedBody = loading ? (
    <HomeNewsFeedSkeleton />
  ) : error ? (
    <div className="px-4 sm:px-8 md:px-0">
      <ErrorAlert message={error} onDismiss={() => setError(null)} />
    </div>
  ) : items.length === 0 ? (
    <div className="mx-4 rounded-lg border sm:mx-8 md:mx-0 border-dashed border-black/[0.12] px-6 py-16 text-center dark:border-white/[0.12]">
      <p className="text-[17px] font-semibold text-[#111111] dark:text-white">
        {activeQuery ? `Nothing for “${activeQuery}” yet` : 'No publications yet'}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-[16px] leading-relaxed text-neutral-500 dark:text-neutral-400">
        {activeQuery
          ? 'Try another interest or a different search.'
          : 'New work from creators will show up here. Check back soon.'}
      </p>
      {activeQuery ? (
        <button
          type="button"
          onClick={clearFilters}
          className="mt-6 inline-flex items-center rounded-lg border border-black/[0.12] px-5 py-2.5 text-[15px] font-medium text-[#111111] transition-colors hover:bg-black/[0.04] dark:border-white/[0.12] dark:text-white dark:hover:bg-white/[0.06]"
        >
          Show everything
        </button>
      ) : null}
    </div>
  ) : (
    <>
      <div className="space-y-8">
        {items.map((post, index) => (
          <NewsFeedPostCard key={post.id} post={post} priority={index === 0} />
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-8" aria-hidden />}
      {loadingMore && (
        <div className="pt-8">
          <HomeNewsFeedSkeleton count={1} />
        </div>
      )}
      {!hasMore && !loadingMore ? (
        <p className="pt-12 text-center text-[15px] text-neutral-400 dark:text-neutral-500">You&apos;re all caught up.</p>
      ) : null}
    </>
  );

  return (
    <div className={`${PORTFOLIO_FRAME_CLASS} pb-24 pt-1 sm:pt-3 lg:pt-12`}>
      {canPublish ? (
        <CreatorContentPublishModal
          open={publishOpen}
          onClose={() => setPublishOpen(false)}
          onPublished={handlePublished}
        />
      ) : null}

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] xl:gap-16">
        <div className="-mx-4 min-w-0 max-w-[760px] sm:-mx-8 md:mx-auto md:w-full">
          <h1 className="sr-only">News</h1>
          <div className="mb-6 lg:hidden">
            <PortfolioCta />
          </div>

          <NewsComposer canPublish={canPublish} onCompose={() => setPublishOpen(true)} />

          {activeQuery && !loading ? (
            <div className="mx-4 mt-8 flex items-center justify-between gap-4 border-b sm:mx-8 md:mx-0 border-black/[0.06] pb-4 dark:border-white/[0.08]">
              <p className="min-w-0 truncate text-[15px] text-neutral-500 dark:text-neutral-400">
                Showing <span className="font-medium text-[#111111] dark:text-white">{activeQuery}</span>
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="shrink-0 text-[15px] font-medium text-[#111111] transition-colors hover:text-neutral-500 dark:text-white dark:hover:text-neutral-300"
              >
                Clear
              </button>
            </div>
          ) : null}

          <div className="mt-8">{feedBody}</div>
        </div>

        <div className="hidden self-start lg:block">
          <NewsDiscoverRail {...discoverProps} />
        </div>
      </div>
    </div>
  );
}
