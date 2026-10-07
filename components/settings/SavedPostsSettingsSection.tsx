'use client';

import { useCallback, useEffect, useState } from 'react';
import { NewsFeedPostCard } from '@/components/home/NewsFeedPostCard';
import { getApiErrorMessage } from '@/lib/api-error';
import { listSavedContent } from '@/lib/marketplace-api';
import type { PublicContentFeedItem } from '@/types/marketplace';
import { SECONDARY_BUTTON_CLASS, SettingsSectionHeader, Spinner } from './settingsUi';

const PAGE_SIZE = 10;

/**
 * Settings → Saved posts: everything the member bookmarked from the News feed. It lived behind a
 * "Saved" tab above the feed; it is a personal library rather than a way to browse, so it now sits
 * with the rest of the account. Cards are the feed's own, inside the same `.news-theme` scope.
 */
export function SavedPostsSettingsSection() {
  const [items, setItems] = useState<PublicContentFeedItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (pageIndex: number, append: boolean) => {
    try {
      setError(null);
      if (append) setLoadingMore(true);
      else setLoading(true);
      const result = await listSavedContent({ page: pageIndex, size: PAGE_SIZE });
      setItems((prev) => (append ? [...prev, ...result.content] : result.content));
      setPage(pageIndex);
      setHasMore(!result.last);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load your saved posts.'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // First page: the promise callbacks set state, never the effect body itself.
  useEffect(() => {
    let cancelled = false;
    listSavedContent({ page: 0, size: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setItems(result.content);
        setHasMore(!result.last);
      })
      .catch((e) => {
        if (!cancelled) setError(getApiErrorMessage(e, 'Unable to load your saved posts.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="news-theme">
      <SettingsSectionHeader
        title="Saved posts"
        description="The posts you bookmarked from News. Tap the bookmark on a post to remove it."
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-5 w-5" />
        </div>
      ) : error ? (
        <div className="gn-card flex flex-col items-start gap-4 px-6 py-8">
          <p className="text-[14px] text-[#666666] dark:text-neutral-400">{error}</p>
          <button type="button" onClick={() => void load(0, false)} className={SECONDARY_BUTTON_CLASS}>
            Try again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="gn-card px-6 py-14 text-center">
          <p className="text-[16px] font-semibold text-[#111111] dark:text-white">Nothing saved yet</p>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            Tap the bookmark on any post in News to keep it here.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((post) => (
              <NewsFeedPostCard key={post.id} post={post} onReposted={() => {}} />
            ))}
          </div>
          {hasMore ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => void load(page + 1, true)}
                className={SECONDARY_BUTTON_CLASS}
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
