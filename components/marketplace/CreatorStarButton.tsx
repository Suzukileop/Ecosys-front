'use client';

import { localeTag } from '@/lib/i18n/active';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getCreatorStars, starCreator, unstarCreator } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/lib/i18n/I18nProvider';

type CreatorStarButtonProps = {
  creatorId: string;
  initialStarred?: boolean;
  initialStarCount?: number;
  onStarChange?: (starred: boolean, starCount: number) => void;
  size?: 'default' | 'sm';
  /** `onDark` renders a glass pill for use over cover images. */
  tone?: 'default' | 'onDark';
  showCount?: boolean;
  /** `pill` rounds the default tone into the X pill (beside other pills, e.g. the shop header). */
  shape?: 'square' | 'pill';
  loginRedirect?: string;
};

function formatCount(value: number) {
  return new Intl.NumberFormat(localeTag()).format(value);
}

export function StarGlyph({ filled, className = 'h-4 w-4' }: { filled: boolean; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11.48 3.5a.56.56 0 011.04 0l2.13 5.11c.08.2.27.33.48.35l5.52.44c.5.04.7.66.32.99l-4.2 3.6a.56.56 0 00-.18.56l1.28 5.39a.56.56 0 01-.84.61l-4.73-2.89a.56.56 0 00-.59 0l-4.73 2.89a.56.56 0 01-.84-.61l1.28-5.39a.56.56 0 00-.18-.56l-4.2-3.6a.56.56 0 01.32-.99l5.52-.44a.56.56 0 00.47-.35L11.48 3.5z" />
    </svg>
  );
}

const baseClass =
  'inline-flex items-center justify-center gap-2 rounded-none border font-semibold tabular-nums transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 disabled:pointer-events-none dark:focus-visible:ring-white/25';
/* X secondary button (1px outline, ink text); starred = the same outline on a soft tone, filled ink star. */
const idleClass = `${baseClass} border-[#CFD9DE] bg-transparent text-[#0F1419] hover:bg-[rgba(15,20,25,0.06)] dark:border-[#536471] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)]`;
const starredClass = `${baseClass} border-[#CFD9DE] bg-[rgba(15,20,25,0.06)] text-[#0F1419] hover:bg-[rgba(15,20,25,0.1)] dark:border-[#536471] dark:bg-[rgba(231,233,234,0.1)] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.16)]`;
const onDarkBaseClass =
  'inline-flex items-center justify-center gap-2 rounded-full border font-medium tabular-nums backdrop-blur-md transition-[background-color,border-color,color,transform] duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:pointer-events-none';
const onDarkIdleClass = `${onDarkBaseClass} border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/20`;
const onDarkStarredClass = `${onDarkBaseClass} border-transparent bg-white text-[#111111] hover:bg-white/90`;

/** Trust star: one per member per account, toggled like a GitHub star. */
export function CreatorStarButton({
  creatorId,
  initialStarred,
  initialStarCount,
  onStarChange,
  size = 'default',
  tone = 'default',
  showCount = true,
  loginRedirect,
  shape = 'square',
}: CreatorStarButtonProps) {
  const t = useT();
  const pill = shape === 'pill' ? ' !rounded-full' : '';
  const idle = tone === 'onDark' ? onDarkIdleClass : `${idleClass}${pill}`;
  const active = tone === 'onDark' ? onDarkStarredClass : `${starredClass}${pill}`;
  /* Black & white: the filled star is the ink of its button (white on the dark cover glass). */
  const filledStarClass = tone === 'onDark' ? 'text-[#0F1419]' : 'text-current';
  const { user, isLoading, sessionStatus } = useAuth();
  const [starred, setStarred] = useState(initialStarred ?? false);
  const [starCount, setStarCount] = useState(initialStarCount ?? 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const touchedRef = useRef(false);
  const onStarChangeRef = useRef(onStarChange);
  onStarChangeRef.current = onStarChange;

  const isSelf = Boolean(user?.id && user.id === creatorId);
  const sessionReady = !isLoading && sessionStatus !== 'loading';
  const canStar = Boolean(user) && sessionReady && !isSelf;
  const sizeClass = size === 'sm' ? 'h-9 px-4 text-sm' : 'h-11 px-5 text-[15px]';

  useEffect(() => {
    touchedRef.current = false;
  }, [creatorId]);

  useEffect(() => {
    if (touchedRef.current) return;
    if (initialStarred !== undefined) setStarred(initialStarred);
    if (initialStarCount !== undefined) setStarCount(initialStarCount);
  }, [initialStarred, initialStarCount, creatorId]);

  useEffect(() => {
    if (!sessionReady || !user || isSelf) return;
    let cancelled = false;
    void getCreatorStars(creatorId)
      .then((stats) => {
        if (cancelled || touchedRef.current) return;
        setStarred(stats.starred);
        setStarCount(stats.starCount);
        onStarChangeRef.current?.(stats.starred, stats.starCount);
      })
      .catch(() => {
        // keep SSR defaults
      });
    return () => {
      cancelled = true;
    };
  }, [creatorId, sessionReady, user, isSelf]);

  const applyState = useCallback((nextStarred: boolean, nextCount: number) => {
    setStarred(nextStarred);
    setStarCount(nextCount);
    onStarChangeRef.current?.(nextStarred, nextCount);
  }, []);

  const toggle = useCallback(async () => {
    if (!canStar || busy) return;
    setBusy(true);
    setError(null);
    touchedRef.current = true;

    const prevStarred = starred;
    const prevCount = starCount;
    const nextStarred = !starred;
    applyState(nextStarred, nextStarred ? starCount + 1 : Math.max(0, starCount - 1));

    try {
      const stats = nextStarred ? await starCreator(creatorId) : await unstarCreator(creatorId);
      applyState(stats.starred, stats.starCount);
    } catch (err) {
      applyState(prevStarred, prevCount);
      setError(getApiErrorMessage(err, t('Unable to update your star.')));
    } finally {
      setBusy(false);
    }
  }, [applyState, busy, canStar, creatorId, starCount, starred, t]);

  const content = (filled: boolean, label: string) => (
    <>
      <StarGlyph filled={filled} className={`h-4 w-4 ${filled ? filledStarClass : ''}`} />
      <span>{label}</span>
      {showCount && starCount > 0 ? (
        <span className="font-normal text-[#536471] dark:text-[#71767B]">{formatCount(starCount)}</span>
      ) : null}
    </>
  );

  if (isSelf) return null;

  if (!sessionReady) {
    return (
      <button type="button" disabled className={`${idle} ${sizeClass} opacity-60`}>
        {content(false, 'Star')}
      </button>
    );
  }

  if (!user) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(loginRedirect ?? `/providers/${creatorId}`)}`}
        className={`${idle} ${sizeClass}`}
      >
        {content(false, 'Star')}
      </Link>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={busy}
        aria-pressed={starred}
        aria-busy={busy}
        title={starred ? t('Remove your trust star') : t('Give a trust star')}
        className={`${starred ? active : idle} ${sizeClass} ${busy ? 'opacity-75' : ''}`}
      >
        {content(starred, starred ? 'Starred' : 'Star')}
      </button>
      {error ? (
        <p className={`max-w-[14rem] text-xs ${tone === 'onDark' ? 'text-white' : 'text-[#F4212E]'}`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
