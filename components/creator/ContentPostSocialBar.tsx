'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { getReactionCounts, listComments, removeReaction, setReaction } from '@/lib/marketplace-api';
import { useAuth } from '@/context/AuthContext';
import type { ReactionType } from '@/types/marketplace';

type ContentPostSocialBarProps = {
  postId: string;
  initialLikes: number;
  createdAt: string;
  onCommentsToggle?: (open: boolean) => void;
  commentsOpen?: boolean;
  commentCount?: number;
  hideCommentsButton?: boolean;
  /** Timeline: bare icon actions (like, comment) without the date chip. */
  variant?: 'default' | 'timeline';
  commentsDisabled?: boolean;
  trailing?: ReactNode;
};

function formatCount(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function ContentPostCommentsButton({
  commentCount = 0,
  commentsOpen = false,
  onToggle,
  className = '',
}: {
  commentCount?: number;
  commentsOpen?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
}) {
  const active = commentsOpen;

  return (
    <button
      type="button"
      onClick={() => onToggle?.(!commentsOpen)}
      aria-expanded={commentsOpen}
      className={`inline-flex w-full items-center justify-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
        active
          ? 'border-neutral-400 bg-neutral-100 text-neutral-700 dark:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-200'
          : 'border-neutral-300 bg-transparent text-neutral-500 hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
      } ${className}`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      {active ? 'Masquer les commentaires' : 'Voir les commentaires'}
      <span className="tabular-nums">({formatCount(commentCount ?? 0)})</span>
    </button>
  );
}

export function ContentPostSocialBar({
  postId,
  initialLikes,
  createdAt,
  onCommentsToggle,
  commentsOpen = false,
  commentCount: commentCountProp,
  hideCommentsButton = false,
  variant = 'default',
  commentsDisabled = false,
  trailing,
}: ContentPostSocialBarProps) {
  const { user, isLoading } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [busy, setBusy] = useState(false);

  const canInteract = Boolean(user) && !isLoading;

  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes, postId]);

  useEffect(() => {
    let cancelled = false;

    void getReactionCounts('POST', postId)
      .then((counts) => {
        if (!cancelled) {
          setLikes(counts.likes);
          setUserReaction(counts.userReaction === 'LIKE' ? 'LIKE' : null);
        }
      })
      .catch(() => {
        // keep initial values
      });

    void listComments('POST', postId, 0, 1)
      .then((page) => {
        if (!cancelled) setCommentCount(page.totalElements);
      })
      .catch(() => {
        // ignore
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const toggleLike = useCallback(async () => {
    if (!canInteract || busy) return;

    setBusy(true);
    try {
      if (userReaction === 'LIKE') {
        await removeReaction('POST', postId);
        setLikes((c) => Math.max(0, c - 1));
        setUserReaction(null);
        return;
      }

      await setReaction('POST', postId, 'LIKE');
      if (userReaction === 'DISLIKE') {
        // Switching from a legacy dislike to like — counts already exclude dislike in UI.
      }
      setLikes((c) => c + 1);
      setUserReaction('LIKE');
    } finally {
      setBusy(false);
    }
  }, [busy, canInteract, postId, userReaction]);

  const displayCommentCount = commentCountProp ?? commentCount;

  if (variant === 'timeline') {
    const liked = userReaction === 'LIKE';
    const actionClass =
      'group/action -ml-2 inline-flex items-center gap-1.5 rounded-full py-1.5 pl-2 pr-3 text-[14px] tabular-nums transition-colors disabled:opacity-60';
    return (
      <div className="flex items-center gap-7" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          disabled={!canInteract || busy}
          onClick={() => void toggleLike()}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike' : 'Like'}
          className={`${actionClass} ${
            liked ? 'text-[#FF5722]' : 'text-neutral-500 hover:text-[#FF5722] dark:text-neutral-400'
          }`}
        >
          <svg
            className="h-[18px] w-[18px] transition-transform duration-200 group-active/action:scale-90"
            fill={liked ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.6}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>
            {likes > 0 ? `${formatCount(likes)} ` : ''}
            {likes === 1 ? 'Like' : 'Likes'}
          </span>
        </button>
        {!hideCommentsButton ? (
          <button
            type="button"
            disabled={commentsDisabled}
            onClick={() => onCommentsToggle?.(!commentsOpen)}
            aria-expanded={commentsOpen}
            aria-label={commentsDisabled ? 'Comments disabled' : commentsOpen ? 'Hide comments' : 'Show comments'}
            title={commentsDisabled ? 'Comments are disabled' : undefined}
            className={`${actionClass} ${
              commentsOpen
                ? 'text-[#111111] dark:text-white'
                : 'text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white'
            } disabled:cursor-not-allowed disabled:hover:text-neutral-500`}
          >
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
              />
            </svg>
            <span>
              {displayCommentCount > 0 ? `${formatCount(displayCommentCount)} ` : ''}
              {displayCommentCount === 1 ? 'Comment' : 'Comments'}
            </span>
          </button>
        ) : null}
        {trailing ? <div className="ml-auto flex items-center">{trailing}</div> : null}
      </div>
    );
  }

  const pillClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium transition disabled:opacity-60 dark:bg-neutral-800 ${
      active
        ? 'text-orange-600 dark:text-orange-400'
        : 'text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700'
    }`;

  return (
    <div
      className="flex items-center justify-between gap-3 pt-1"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap items-center gap-2">
        {canInteract ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void toggleLike()}
            className={pillClass(userReaction === 'LIKE')}
            aria-pressed={userReaction === 'LIKE'}
            aria-label="Like"
          >
            <svg
              className="h-4 w-4"
              fill={userReaction === 'LIKE' ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {formatCount(likes)}
          </button>
        ) : (
          <span className={pillClass(false)}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {formatCount(likes)}
          </span>
        )}

        {!hideCommentsButton && (
          <button
            type="button"
            onClick={() => onCommentsToggle?.(!commentsOpen)}
            className={pillClass(commentsOpen)}
            aria-expanded={commentsOpen}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {formatCount(displayCommentCount)}
          </button>
        )}
      </div>

      <time
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
        dateTime={createdAt}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 6.75h15a1.5 1.5 0 011.5 1.5v11.25a1.5 1.5 0 01-1.5 1.5h-15a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5z"
          />
        </svg>
        {new Date(createdAt).toLocaleDateString()}
      </time>
    </div>
  );
}
