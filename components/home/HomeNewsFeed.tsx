'use client';

import { localeTag } from '@/lib/i18n/active';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreatorContentPublishModal } from '@/components/creator/CreatorContentPublishModal';
import {
  NewsComposerRow,
  NewsDiscoverRail,
  NewsInterestChips,
  NewsQuickBar,
  PortfolioCta,
} from '@/components/home/NewsDiscoverRail';
import { NewsFeedPostCard } from '@/components/home/NewsFeedPostCard';
import { NEWS_OPEN_PUBLISH_EVENT } from '@/components/home/NewsPublishHeaderCta';
import { HomeNewsFeedSkeleton } from '@/components/home/HomeNewsSkeleton';
import { ALL_SAVED, SavedCollectionsStrip, SavedShelf } from '@/components/settings/SavedPostsSettingsSection';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { getApiErrorMessage } from '@/lib/api-error';
import { getPublicContentFeedItem, listPublicContentFeed } from '@/lib/marketplace-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { useAuth } from '@/context/AuthContext';
import type { PublicContentFeedItem } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

/** Today's date for the feed's section line, set after mount (server and client clocks differ). */
function TodayLabel() {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const id = window.setTimeout(() => {
      setLabel(new Date().toLocaleDateString(localeTag(), { weekday: 'short', month: 'short', day: 'numeric' }));
    }, 0);
    return () => window.clearTimeout(id);
  }, []);
  return <span className="shrink-0 text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">{label}</span>;
}

export function HomeNewsFeed() {
  const t = useT();
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
  const sentinelRef = useRef<HTMLDivElement>(null);

  /* A notification deep link (/feed?post=…&comment=…): that post goes first with its comments open
     and the comment highlighted, wherever it sits in the feed. */
  const searchParams = useSearchParams();
  const focusPostId = searchParams.get('post');
  const focusCommentId = searchParams.get('comment');
  const [fetchedFocus, setFetchedFocus] = useState<PublicContentFeedItem | null>(null);
  const focusedPost = focusPostId && fetchedFocus?.id === focusPostId ? fetchedFocus : null;
  const activeQuery = interest;

  /* The Saved view (/feed?view=saved[&collection=…]) takes the feed column's place: the collections
     strip on top, the open collection's posts below. In the URL so Back returns to the feed. */
  const router = useRouter();
  const savedView = searchParams.get('view') === 'saved';
  const savedCollection = searchParams.get('collection') || ALL_SAVED;
  /** Bumped by the quick bar's refresh while Saved is open: remounts the strip and the shelf. */
  const [savedReload, setSavedReload] = useState(0);

  const openSavedCollection = useCallback(
    (collection: string) => {
      const query = collection === ALL_SAVED ? 'view=saved' : `view=saved&collection=${encodeURIComponent(collection)}`;
      router.push(`/feed?${query}`, { scroll: false });
    },
    [router]
  );

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
        setError(getApiErrorMessage(e, t('Unable to load the news feed.')));
        if (!append) setItems([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (!focusPostId) return undefined;
    let cancelled = false;
    void getPublicContentFeedItem(focusPostId).then((post) => {
      if (cancelled) return;
      if (post) {
        setFetchedFocus(post);
      } else {
        pushFlashFeedback({
          variant: 'info',
          title: t('This post is no longer available'),
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [focusPostId, t]);

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
      title: t('Content published'),
    });
    void loadPage(0, false, activeQuery);
  }, [loadPage, activeQuery, t]);

  /** The quick bar's refresh: back to the top, then the first page again (same filter or shelf). */
  const refreshFeed = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (savedView) setSavedReload((k) => k + 1);
    else void loadPage(0, false, activeQuery);
  }, [loadPage, activeQuery, savedView]);

  /** A repost the viewer just made lands at the top of the feed, like any other new post. */
  const handleReposted = useCallback((repost: PublicContentFeedItem) => {
    setItems((prev) => [
      { ...repost, commentCount: 0, viewerReaction: null, viewerSaved: false, viewerReposted: true },
      ...prev,
    ]);
  }, []);

  /** An interest picked in the rail while Saved is open also leaves Saved: filters apply to the feed. */
  const handleInterestSelect = useCallback(
    (value: string | null) => {
      setInterest(value);
      setPage(0);
      setHasMore(false);
      if (savedView) router.push('/feed', { scroll: false });
    },
    [router, savedView]
  );

  const clearFilters = () => {
    setInterest(null);
  };

  const discoverProps = {
    selected: interest,
    onSelect: handleInterestSelect,
    canPublish,
    onCompose: () => setPublishOpen(true),
  };

  const feedBody = loading ? (
    <HomeNewsFeedSkeleton />
  ) : error ? (
    <div className="px-4 sm:px-0">
      <ErrorAlert message={error} onDismiss={() => setError(null)} />
    </div>
  ) : items.length === 0 ? (
    <div className="gn-card px-6 py-12 text-center">
      <p className="text-[17px] font-bold leading-[22px] tracking-[-0.01em] text-[color:var(--gn-ink)]">
        {activeQuery ? `Nothing for “${activeQuery}” yet` : t('No publications yet')}
      </p>
      <p className="mx-auto mt-1.5 max-w-sm text-[14px] leading-5 text-[color:var(--gn-ink2)]">
        {activeQuery
          ? t('Try another interest.')
          : t('New work from creators will show up here. Check back soon.')}
      </p>
      {activeQuery ? (
        <button
          type="button"
          onClick={clearFilters}
          className="mt-5 inline-flex h-9 items-center rounded-full bg-[color:var(--gn-ink)] px-4 text-[14px] font-semibold leading-5 text-[color:var(--gn-surface)] transition-opacity hover:opacity-85"
        >
          {t('Show everything')}
        </button>
      ) : null}
    </div>
  ) : (
    <>
      <div className="space-y-2 sm:space-y-5">
        {focusedPost ? (
          <NewsFeedPostCard
            key={`focus-${focusedPost.id}`}
            post={focusedPost}
            priority
            autoOpenComments
            focusCommentId={focusCommentId}
            onReposted={handleReposted}
          />
        ) : null}
        {items
          .filter((post) => post.id !== focusedPost?.id)
          .map((post, index) => (
            <NewsFeedPostCard
              key={post.id}
              post={post}
              priority={index === 0 && !focusedPost}
              onReposted={handleReposted}
            />
          ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-8" aria-hidden />}
      {loadingMore && (
        <div className="pt-2 sm:pt-5">
          <HomeNewsFeedSkeleton count={1} />
        </div>
      )}
      {!hasMore && !loadingMore ? (
        <p className="gn-kicker pt-10 text-center">{t('You’re all caught up')}</p>
      ) : null}
    </>
  );

  /*
   * The Saved view, in the feed column: a title line (the way back, then "Saved"), the collections
   * strip, then the open shelf's posts — the same cards as the feed, the same 680px.
   */
  const savedSection = (
    <section aria-labelledby="news-saved-title" className="flex flex-col gap-4">
      <div className="flex min-h-9 items-center gap-2 px-4 sm:px-1">
        <Link
          href="/feed"
          aria-label={t('Back to News')}
          title={t('Back to News')}
          className="-ml-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5" />
            <path d="m11 6-6 6 6 6" />
          </svg>
        </Link>
        <h2 id="news-saved-title" className="text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]">
          {t('Saved')}
        </h2>
      </div>
      <SavedCollectionsStrip key={`strip-${savedReload}`} selected={savedCollection} onSelect={openSavedCollection} />
      <SavedShelf
        key={`${savedCollection}-${savedReload}`}
        shelfId={savedCollection}
        embedded
        onBack={() => openSavedCollection(ALL_SAVED)}
      />
    </section>
  );

  /*
   * Layout. The navbar's frame — the same 32 / 48 / 64px gutters and the same 1240px cap
   * (DashboardTopHeader) — so the rail's right edge sits under the avatar:
   *  - below lg: the feed alone, at most 600px;
   *  - lg: the feed area and a 340px sticky rail, 32px apart;
   *  - xl: the feed area and a 400px rail, flush.
   * The feed itself is at most 680px — a social-feed measure, like Facebook's — and centred in its
   * area, so from 1368px wide it has 80px on either side: the same air before it as between it and
   * the rail. From 1360px wide (gutter ≥ 64px) the quick bar (NewsQuickBar, 40px) sits in the left
   * gutter, its edge under the wordmark's.
   * Below 640px the cards run edge to edge; blocks are 8px apart on phones, 20px from sm. Cards are
   * set apart from the page by tone only — no outlines.
   */
  return (
    <div className="news-theme news-feed news-mono w-full pb-24 pt-2 sm:px-8 sm:pt-4 md:px-12 lg:px-16 lg:pt-3">
      {canPublish ? (
        <CreatorContentPublishModal
          open={publishOpen}
          onClose={() => setPublishOpen(false)}
          onPublished={handlePublished}
        />
      ) : null}

      <div className="mx-auto grid w-full max-w-[600px] items-start gap-8 lg:max-w-[1240px] lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-0">
        <div className="relative min-w-0">
          <div className="absolute left-0 top-0 hidden h-full min-[1360px]:block">
            <NewsQuickBar onRefresh={refreshFeed} savedActive={savedView} />
          </div>
          <div className="mx-auto flex w-full min-w-0 max-w-[680px] flex-col gap-3">
            <h1 className="sr-only">News</h1>
            {savedView ? (
              savedSection
            ) : (
              <>
                {/* Below lg (no rail), top of the feed: the portfolio promo, the composer line, the interest
                    pills, then the posts. From lg all three live in the rail (the composer as its publish
                    button), and the feed opens straight on the section line. */}
                <div className="lg:hidden">
                  <PortfolioCta />
                </div>

                <div className="px-4 pt-1 sm:px-0 lg:hidden">
                  <NewsComposerRow canPublish={canPublish} onCompose={() => setPublishOpen(true)} />
                </div>

                <div className="lg:hidden">
                  <NewsInterestChips selected={interest} onSelect={handleInterestSelect} />
                </div>

                {/* Section line above the posts. Unfiltered: a small-caps kicker and today's date. While an
                    interest narrows the feed: a plain sentence-case breadcrumb instead —
                    "Filtered by: Developer · Clear" — no caps, no marker. */}
                {activeQuery ? (
                  <p className="flex min-h-8 min-w-0 items-center gap-1.5 px-4 pt-2 text-[14px] leading-5 text-[color:var(--gn-ink2)] sm:px-1 sm:pt-3 lg:min-h-0 lg:pt-0">
                    <span className="shrink-0">{t('Filtered by:')}</span>
                    <span className="truncate font-semibold text-[color:var(--gn-ink)]">{activeQuery}</span>
                    <span aria-hidden className="shrink-0 text-[color:var(--gn-ink3)]">·</span>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="shrink-0 font-medium text-[color:var(--gn-ink)] underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
                    >
                      {t('Clear')}
                    </button>
                  </p>
                ) : (
                  /* The feed's heading, set like My Profile's section headings: 17px bold, its scope in
                     15px regular secondary ink, today's date in 13px at the right. */
                  <div className="hidden min-h-10 items-center justify-between gap-4 px-1 pt-3 sm:flex lg:pt-0">
                    <h2 className="flex min-w-0 items-baseline gap-2 text-[17px] font-bold leading-[22px] tracking-[-0.01em] text-[color:var(--gn-ink)]">
                      <span className="truncate">{t('Latest')}</span>
                      <span className="truncate text-[15px] font-normal tracking-normal text-[color:var(--gn-ink2)]">{t('Professionals')}</span>
                    </h2>
                    <TodayLabel />
                  </div>
                )}

                <div>{feedBody}</div>
              </>
            )}
          </div>
        </div>

        <div className="hidden self-start lg:block">
          <NewsDiscoverRail {...discoverProps} />
        </div>
      </div>
    </div>
  );
}
