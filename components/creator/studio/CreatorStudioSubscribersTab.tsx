'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CREATOR_PROFILE_SUBSCRIBERS_LABEL } from '@/components/creator/creator-profile-header-types';
import { AvatarImage } from '@/components/ui/PersonAvatar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import { listCreatorProfileFollowers, type CreatorProfileFollowerItem } from '@/lib/creator-profile-followers-api';

const PAGE_SIZE = 20;

function formatFollowDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function followerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function SubscriberRow({ follower }: { follower: CreatorProfileFollowerItem }) {
  const displayName = follower.followerFullName ?? 'User';

  const identity = (
    <div className="flex min-w-0 items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-[15px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
        <AvatarImage
          src={follower.followerAvatarUrl}
          fallback={followerInitials(displayName)}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[17px] font-semibold leading-snug text-neutral-900 dark:text-white">{displayName}</p>
        <p className="mt-0.5 text-[14px] text-neutral-500 dark:text-neutral-400">Registered user</p>
      </div>
    </div>
  );

  return (
    <li className="flex flex-col gap-3 border-b border-neutral-200 px-5 py-5 last:border-b-0 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <Link href={`/providers/${follower.followerUserId}`} className="min-w-0 transition hover:opacity-80">
        {identity}
      </Link>
      <p className="shrink-0 text-[15px] text-neutral-500 dark:text-neutral-400">{formatFollowDate(follower.followedAt)}</p>
    </li>
  );
}

export function CreatorStudioSubscribersTab() {
  const [followers, setFollowers] = useState<CreatorProfileFollowerItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (pageIndex: number, append: boolean) => {
    try {
      setError(null);
      if (append) setLoadingMore(true);
      else setLoading(true);

      const data = await listCreatorProfileFollowers(pageIndex, PAGE_SIZE);
      setFollowers((current) => (append ? [...current, ...data.content] : data.content));
      setPage(data.page);
      setTotalElements(data.totalElements);
      setLast(data.last);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load subscribers.'));
      if (!append) setFollowers([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(0, false);
  }, [loadPage]);

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[1.5rem] font-bold tracking-[-0.01em] text-neutral-900 dark:text-white">{CREATOR_PROFILE_SUBSCRIBERS_LABEL}</h2>
        <p className="mt-1.5 text-[16px] text-neutral-500 dark:text-neutral-400">
          {totalElements.toLocaleString()} subscriber{totalElements !== 1 ? 's' : ''} recorded.
        </p>
      </div>

      {error ? <ErrorAlert message={error} onDismiss={() => setError(null)} /> : null}

      {followers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-14 text-center text-[16px] leading-relaxed text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-400">
          No subscribers yet. Users who follow your profile will appear here.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <ul>{followers.map((follower) => <SubscriberRow key={follower.id} follower={follower} />)}</ul>
        </div>
      )}

      {!last && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => void loadPage(page + 1, true)}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-[15px] font-semibold text-[#111111] transition hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
          >
            {loadingMore ? <LoadingSpinner /> : null}
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
