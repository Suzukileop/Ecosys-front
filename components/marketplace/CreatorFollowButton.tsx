'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  followCreator,
  getCreatorFollowStats,
  unfollowCreator,
} from '@/lib/marketplace-api';
import { useAuth } from '@/context/AuthContext';

type CreatorFollowButtonProps = {
  creatorId: string;
  initialFollowing?: boolean;
  initialFollowerCount?: number;
  onFollowingChange?: (following: boolean, followerCount: number) => void;
  size?: 'default' | 'sm';
};

function formatCount(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value);
}

export function CreatorFollowButton({
  creatorId,
  initialFollowing,
  initialFollowerCount,
  onFollowingChange,
  size = 'default',
}: CreatorFollowButtonProps) {
  const { user, isLoading } = useAuth();
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount ?? 0);
  const [busy, setBusy] = useState(false);

  const isSelf = Boolean(user?.id && user.id === creatorId);
  const canFollow = Boolean(user) && !isLoading && !isSelf;

  useEffect(() => {
    if (initialFollowing !== undefined) setFollowing(initialFollowing);
  }, [initialFollowing, creatorId]);

  useEffect(() => {
    if (initialFollowerCount !== undefined) setFollowerCount(initialFollowerCount);
  }, [initialFollowerCount, creatorId]);

  useEffect(() => {
    if (initialFollowing !== undefined && initialFollowerCount !== undefined) return;

    let cancelled = false;
    void getCreatorFollowStats(creatorId)
      .then((stats) => {
        if (!cancelled) {
          if (initialFollowing === undefined) setFollowing(stats.isFollowing);
          if (initialFollowerCount === undefined) setFollowerCount(stats.followerCount);
        }
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
    try {
      if (following) {
        await unfollowCreator(creatorId);
        applyState(false, Math.max(0, followerCount - 1));
      } else {
        await followCreator(creatorId);
        applyState(true, followerCount + 1);
      }
    } finally {
      setBusy(false);
    }
  }, [applyState, busy, canFollow, creatorId, followerCount, following]);

  const compact = size === 'sm';

  if (isSelf) {
    return (
      <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
        {formatCount(followerCount)} abonné{followerCount !== 1 ? 's' : ''}
      </span>
    );
  }

  if (!user) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(`/marketplace/${creatorId}`)}`}
        className={`inline-flex items-center justify-center rounded-full border border-orange-200 bg-orange-50 font-semibold text-orange-700 transition hover:bg-orange-100 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300 ${
          compact ? 'px-4 py-2 text-sm' : 'px-5 py-2.5 text-sm'
        }`}
      >
        Suivre
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={busy || !canFollow}
      aria-pressed={following}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:opacity-60 ${
        following
          ? 'border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800'
          : 'bg-orange-500 text-white hover:bg-orange-600'
      } ${compact ? 'px-4 py-2 text-sm' : 'px-5 py-2.5 text-sm'}`}
    >
      {following ? 'Abonné' : 'Suivre'}
      <span className="text-xs font-medium opacity-80">({formatCount(followerCount)})</span>
    </button>
  );
}
