'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CreatorContentPublishModal } from '@/components/creator/CreatorContentPublishModal';
import { NewsDiscoverRail, NEWS_TOP_ROW_CLASS } from '@/components/home/NewsDiscoverRail';
import { PublicContentPostCard } from '@/components/home/PublicContentPostCard';
import { HomeNewsFeedSkeleton } from '@/components/home/HomeNewsSkeleton';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { getApiErrorMessage } from '@/lib/api-error';
import { listPublicContentFeed } from '@/lib/marketplace-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { useAuth } from '@/context/AuthContext';
import type { PublicContentFeedItem } from '@/types/marketplace';

function getScrollY() {
  const content = document.querySelector('[data-dashboard-content]');
  const contentScroll = content instanceof HTMLElement ? content.scrollTop : 0;
  return Math.max(window.scrollY, contentScroll);
}

function NewsHeader({
  canPublish,
  onPublishClick,
  layout = 'stack',
}: {
  canPublish: boolean;
  onPublishClick: () => void;
  /** Match post card width so the CTA starts flush with content below. */
  layout?: 'stack' | 'split';
}) {
  const [visible, setVisible] = useState(true);
  const lastYRef = useRef(0);

  useEffect(() => {
    lastYRef.current = getScrollY();

    const onScroll = () => {
      const y = getScrollY();
      const delta = y - lastYRef.current;

      if (y < 32) {
        setVisible(true);
      } else if (delta > 6) {
        setVisible(false);
      } else if (delta < -6) {
        setVisible(true);
      }

      lastYRef.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    const content = document.querySelector('[data-dashboard-content]');
    content?.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      content?.removeEventListener('scroll', onScroll);
    };
  }, []);

  const publishClassName =
    'inline-flex shrink-0 items-center justify-center rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600';

  // Same width/centering as PublicContentPostCard so the bar sits on the content left edge.
  const alignShell =
    layout === 'split'
      ? 'mx-auto w-full max-w-[min(100%,88rem)] px-1 sm:px-2'
      : 'mx-auto w-full max-w-xl xl:max-w-2xl';

  return (
    <div
      className={`sticky top-[4.75rem] z-30 transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-[calc(100%+0.75rem)] opacity-0'
      }`}
    >
      <div className={`${NEWS_TOP_ROW_CLASS} ${alignShell}`}>
        <div className="inline-flex max-w-full flex-col items-start gap-3 rounded-2xl border border-neutral-200/70 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-md dark:border-neutral-800/70 dark:bg-neutral-950/90 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
          <p className="text-left text-sm font-semibold tracking-tight text-neutral-900 sm:text-base dark:text-white">
            Don&apos;t stay a spectator.
          </p>
          {canPublish ? (
            <button type="button" onClick={onPublishClick} className={publishClassName}>
              + Publish content
            </button>
          ) : (
            <Link href="/dashboard/creator" className={publishClassName}>
              + Publish content
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
      <p className="text-neutral-600 dark:text-neutral-400">
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
            className="flex min-h-0 snap-center snap-always scroll-mt-6 items-center justify-center pb-10 pt-2"
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
        <section className="pb-10 pt-2">
          <HomeNewsFeedSkeleton count={1} split={!railExpanded} />
        </section>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-4 2xl:gap-6">
      {publishModal}

      <div className="min-w-0 flex-1 space-y-3 transition-[max-width] duration-300">
        <NewsHeader
          canPublish={canPublish}
          onPublishClick={() => setPublishOpen(true)}
          layout={railExpanded ? 'stack' : 'split'}
        />
        {feedBody}
      </div>

      <NewsDiscoverRail
        selected={interest}
        onSelect={handleInterestSelect}
        search={searchDraft}
        onSearchChange={handleSearchChange}
        expanded={railExpanded}
        onExpandedChange={setRailExpanded}
        className={
          railExpanded
            ? 'xl:sticky xl:top-[4.75rem] xl:h-[calc(100vh-5.25rem)] xl:max-h-[calc(100vh-5.25rem)]'
            : 'xl:sticky xl:top-[4.75rem]'
        }
      />
    </div>
  );
}
