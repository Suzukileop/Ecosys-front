'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  followCreator,
  getCreatorFollowStats,
  unfollowCreator,
} from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuth } from '@/context/AuthContext';

type CreatorFollowButtonProps = {
  creatorId: string;
  initialFollowing?: boolean;
  initialFollowerCount?: number;
  onFollowingChange?: (following: boolean, followerCount: number) => void;
  size?: 'default' | 'sm';
};

function formatCount(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

/** Secondary action — social follow, never competes with Discuss. */
const secondaryIdleClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800';

const secondaryFollowingClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 font-semibold text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-300 dark:hover:bg-neutral-800';

export function CreatorFollowButton({
  creatorId,
  initialFollowing,
  initialFollowerCount,
  onFollowingChange,
  size = 'default',
}: CreatorFollowButtonProps) {
  const { user, isLoading, sessionStatus } = useAuth();
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount ?? 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const touchedRef = useRef(false);

  const isSelf = Boolean(user?.id && user.id === creatorId);
  const sessionReady = !isLoading && sessionStatus !== 'loading';
  const canFollow = Boolean(user) && sessionReady && !isSelf;
  const compact = size === 'sm';
  const sizeClass = compact ? 'px-4 py-2 text-sm' : 'px-5 py-2.5 text-sm';

  useEffect(() => {
    if (touchedRef.current) return;
    if (initialFollowing !== undefined) setFollowing(initialFollowing);
  }, [initialFollowing, creatorId]);

  useEffect(() => {
    if (touchedRef.current) return;
    if (initialFollowerCount !== undefined) setFollowerCount(initialFollowerCount);
  }, [initialFollowerCount, creatorId]);

  useEffect(() => {
    if (initialFollowing !== undefined && initialFollowerCount !== undefined) return;

    let cancelled = false;
    void getCreatorFollowStats(creatorId)
      .then((stats) => {
        if (cancelled || touchedRef.current) return;
        if (initialFollowing === undefined) setFollowing(stats.isFollowing);
        if (initialFollowerCount === undefined) setFollowerCount(stats.followerCount);
      })
      .catch(() => {
        // keep defaults
      });

    return () => {
      cancelled = true;
    };
  }, [creatorId, initialFollowerCount, initialFollowing]);

  const applyState = useCallback(
    (nextFollowing: boolean, nextCount: number) => {
      setFollowing(nextFollowing);
      setFollowerCount(nextCount);
      onFollowingChange?.(nextFollowing, nextCount);
    },
    [onFollowingChange]
  );

  const toggle = useCallback(async () => {
    if (!canFollow || busy) return;
    setBusy(true);
    setError(null);
    touchedRef.current = true;

    const prevFollowing = following;
    const prevCount = followerCount;
    const nextFollowing = !following;
    const nextCount = nextFollowing ? followerCount + 1 : Math.max(0, followerCount - 1);
    applyState(nextFollowing, nextCount);

    try {
      const stats = nextFollowing
        ? await followCreator(creatorId)
        : await unfollowCreator(creatorId);
      if (stats) applyState(stats.isFollowing, stats.followerCount);
    } catch (err) {
      applyState(prevFollowing, prevCount);
      setError(getApiErrorMessage(err, 'Unable to update follow status.'));
    } finally {
      setBusy(false);
    }
  }, [applyState, busy, canFollow, creatorId, followerCount, following]);

  const countBadge =
    followerCount > 0 ? (
      <span className="text-xs font-medium opacity-70">({formatCount(followerCount)})</span>
    ) : null;

  if (isSelf) {
    if (followerCount <= 0) return null;
    return (
      <span className={`${secondaryFollowingClass} ${sizeClass}`}>
        {formatCount(followerCount)} subscriber{followerCount !== 1 ? 's' : ''}
      </span>
    );
  }

  // Avoid a fake "Follow → /login" bounce while the session is still restoring.
  if (!sessionReady) {
    return (
      <button type="button" disabled className={`${secondaryIdleClass} ${sizeClass} opacity-60`}>
        Follow
        {countBadge}
      </button>
    );
  }

  if (!user) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(`/marketplace/${creatorId}`)}`}
        className={`${secondaryIdleClass} ${sizeClass}`}
      >
        Follow
        {countBadge}
      </Link>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={busy || !canFollow}
        aria-pressed={following}
        className={`${following ? secondaryFollowingClass : secondaryIdleClass} ${sizeClass} disabled:opacity-60`}
      >
        {busy ? '…' : following ? 'Following' : 'Follow'}
        {countBadge}
      </button>
      {error ? <p className="max-w-[14rem] text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
