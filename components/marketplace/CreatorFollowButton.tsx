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
const secondaryBaseClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 disabled:pointer-events-none dark:focus-visible:ring-white/25';

const secondaryIdleClass = `${secondaryBaseClass} border-black/10 bg-transparent text-[#111111] hover:border-black/25 dark:border-white/15 dark:text-neutral-100 dark:hover:border-white/30`;

const secondaryFollowingClass = `${secondaryBaseClass} border-transparent bg-black/[0.05] text-[#111111] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:text-neutral-100 dark:hover:bg-white/[0.12]`;

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
  const [pop, setPop] = useState(false);
  const touchedRef = useRef(false);
  const popTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFollowingChangeRef = useRef(onFollowingChange);
  onFollowingChangeRef.current = onFollowingChange;

  const isSelf = Boolean(user?.id && user.id === creatorId);
  const sessionReady = !isLoading && sessionStatus !== 'loading';
  const canFollow = Boolean(user) && sessionReady && !isSelf;
  const compact = size === 'sm';
  const sizeClass = compact ? 'h-9 px-4 text-sm' : 'h-11 px-5 text-[15px]';

  useEffect(() => {
    touchedRef.current = false;
  }, [creatorId]);

  useEffect(() => {
    if (touchedRef.current) return;
    if (initialFollowing !== undefined) setFollowing(initialFollowing);
  }, [initialFollowing, creatorId]);

  useEffect(() => {
    if (touchedRef.current) return;
    if (initialFollowerCount !== undefined) setFollowerCount(initialFollowerCount);
  }, [initialFollowerCount, creatorId]);

  // SSR profile may miss isFollowing — always refresh when the session is ready.
  useEffect(() => {
    if (!sessionReady || !user || isSelf) return;

    let cancelled = false;
    void getCreatorFollowStats(creatorId)
      .then((stats) => {
        if (cancelled || touchedRef.current) return;
        setFollowing(stats.isFollowing);
        setFollowerCount(stats.followerCount);
        onFollowingChangeRef.current?.(stats.isFollowing, stats.followerCount);
      })
      .catch(() => {
        // keep SSR defaults
      });

    return () => {
      cancelled = true;
    };
  }, [creatorId, sessionReady, user, isSelf]);

  const applyState = useCallback(
    (nextFollowing: boolean, nextCount: number) => {
      setFollowing(nextFollowing);
      setFollowerCount(nextCount);
      onFollowingChange?.(nextFollowing, nextCount);
    },
    [onFollowingChange]
  );

  const triggerPop = useCallback(() => {
    if (popTimerRef.current) clearTimeout(popTimerRef.current);
    setPop(false);
    requestAnimationFrame(() => {
      setPop(true);
      popTimerRef.current = setTimeout(() => setPop(false), 320);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (popTimerRef.current) clearTimeout(popTimerRef.current);
    };
  }, []);

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
    triggerPop();

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
  }, [applyState, busy, canFollow, creatorId, followerCount, following, triggerPop]);

  const label = following ? 'Following' : 'Follow';
  const buttonClass = `${following ? secondaryFollowingClass : secondaryIdleClass} ${sizeClass} ${
    pop ? 'follow-btn-pop' : ''
  } ${busy ? 'opacity-75' : ''}`;

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
      </button>
    );
  }

  if (!user) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(`/providers/${creatorId}`)}`}
        className={`${secondaryIdleClass} ${sizeClass}`}
      >
        Follow
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
        aria-busy={busy}
        className={buttonClass}
      >
        <span key={label} className="follow-label-in">
          {label}
        </span>
      </button>
      {error ? <p className="max-w-[14rem] text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
