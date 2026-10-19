'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  followCreator,
  getCreatorFollowStats,
  unfollowCreator,
} from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { PROFILE_MOBILE_SOFT_BUTTON } from '@/components/creator/creator-profile-header-types';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/lib/i18n/I18nProvider';

type CreatorFollowButtonProps = {
  creatorId: string;
  initialFollowing?: boolean;
  initialFollowerCount?: number;
  onFollowingChange?: (following: boolean, followerCount: number) => void;
  size?: 'default' | 'sm';
  /** `soft`: the phone profile header (filled grey, 40px, rounded, full width of its cell). */
  appearance?: 'default' | 'soft';
};

/** Secondary action — social follow, never competes with Discuss. */
const secondaryBaseClass =
  'inline-flex items-center justify-center gap-2 rounded-none border font-semibold transition-colors duration-200 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black/15 disabled:pointer-events-none dark:focus-visible:ring-white/25';

/* X secondary button: 1px outline, ink text. Following = the same outline on a soft tone. */
const secondaryIdleClass = `${secondaryBaseClass} border-[#CFD9DE] bg-transparent text-[#0F1419] hover:bg-[rgba(15,20,25,0.06)] dark:border-[#536471] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)]`;

const secondaryFollowingClass = `${secondaryBaseClass} border-[#CFD9DE] bg-[rgba(15,20,25,0.06)] text-[#0F1419] hover:bg-[rgba(15,20,25,0.1)] dark:border-[#536471] dark:bg-[rgba(231,233,234,0.1)] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.16)]`;

export function CreatorFollowButton({
  creatorId,
  initialFollowing,
  initialFollowerCount,
  onFollowingChange,
  size = 'default',
  appearance = 'default',
}: CreatorFollowButtonProps) {
  const t = useT();
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
  const soft = appearance === 'soft';
  const sizeClass = soft ? '' : compact ? 'h-9 px-4 text-sm' : 'h-11 px-5 text-[15px]';
  const idleClass = soft ? `${PROFILE_MOBILE_SOFT_BUTTON} w-full` : secondaryIdleClass;
  const followingClass = soft ? `${PROFILE_MOBILE_SOFT_BUTTON} w-full` : secondaryFollowingClass;

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
      setError(getApiErrorMessage(err, t('Unable to update follow status.')));
    } finally {
      setBusy(false);
    }
  }, [applyState, busy, canFollow, creatorId, followerCount, following, triggerPop, t]);

  const label = following ? t('Following') : t('Follow');
  const buttonClass = `${following ? followingClass : idleClass} ${sizeClass} ${
    pop ? 'follow-btn-pop' : ''
  } ${busy ? 'opacity-75' : ''}`;

  // On your own profile there is nothing to follow, and the subscriber count already sits in the
  // header's stats column — repeating it as a pill was a duplicate.
  if (isSelf) return null;

  // Avoid a fake "Follow → /login" bounce while the session is still restoring.
  if (!sessionReady) {
    return (
      <button type="button" disabled className={`${idleClass} ${sizeClass} opacity-60`}>
        {t('Follow')}
      </button>
    );
  }

  if (!user) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(`/providers/${creatorId}`)}`}
        className={`${idleClass} ${sizeClass}`}
      >
        {t('Follow')}
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
      {error ? <p className="max-w-[14rem] text-xs text-[#F4212E]">{error}</p> : null}
    </div>
  );
}
