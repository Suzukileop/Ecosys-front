'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CreatorContentPublishModal } from '@/components/creator/CreatorContentPublishModal';
import { NewsDiscoverRail } from '@/components/home/NewsDiscoverRail';
import { NEWS_OPEN_PUBLISH_EVENT } from '@/components/home/NewsPublishHeaderCta';
import { PublicContentPostCard } from '@/components/home/PublicContentPostCard';
import { HomeNewsFeedSkeleton } from '@/components/home/HomeNewsSkeleton';
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
  const [railExpanded, setRailExpanded] = useState(true);
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
        setError(getApiErrorMessage(e, 'Impossible de charger les actualités.'));
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
    setSearchDraft(value ?? '');
    setSearchQuery(value ?? '');
    setPage(0);
    setHasMore(false);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchDraft(value);
    setInterest(null);
    setPage(0);
    setHasMore(false);
  }, []);

  const publishModal = canPublish ? (
    <CreatorContentPublishModal
      open={publishOpen}
      onClose={() => setPublishOpen(false)}
      onPublished={handlePublished}
    />
  ) : null;

  const feedBody = loading ? (
    <HomeNewsFeedSkeleton split={!railExpanded} />
  ) : error ? (
    <ErrorAlert message={error} onDismiss={() => setError(null)} />
  ) : items.length === 0 ? (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-white/[0.08] dark:bg-[#141416]">
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        {activeQuery
          ? `No publications for “${activeQuery}” right now.`
          : 'Aucune publication pour le moment. Revenez bientôt !'}
      </p>
    </div>
  ) : (
    <>
      <div className="snap-y snap-proximity">
        {items.map((post) => (
          <section
            key={post.id}
            className="flex min-h-0 snap-center snap-always scroll-mt-6 items-center justify-center pb-8 pt-2"
          >
            <PublicContentPostCard
              post={post}
              className="w-full"
              layout={railExpanded ? 'stack' : 'split'}
            />
          </section>
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-8" aria-hidden />}
      {loadingMore && (
        <section className="pb-8 pt-2">
          <HomeNewsFeedSkeleton count={1} split={!railExpanded} />
        </section>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:gap-5">
      {publishModal}

      <div className="min-w-0 flex-1 space-y-2">{feedBody}</div>

      <NewsDiscoverRail
        selected={interest}
        onSelect={handleInterestSelect}
        search={searchDraft}
        onSearchChange={handleSearchChange}
        expanded={railExpanded}
        onExpandedChange={setRailExpanded}
        className="order-first xl:order-none xl:sticky xl:top-[4.75rem]"
      />
    </div>
  );
}
