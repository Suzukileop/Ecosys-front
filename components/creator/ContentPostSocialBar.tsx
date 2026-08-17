'use client';

import { useCallback, useEffect, useState } from 'react';
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
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? 'bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
          : 'bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800'
      } ${className}`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      {active ? 'Hide comments' : 'View comments'}
      <span className="tabular-nums text-neutral-400">({formatCount(commentCount ?? 0)})</span>
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

  const buttonClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium transition disabled:opacity-60 ${
      active
        ? 'text-orange-600 dark:text-orange-400'
        : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
    }`;

  return (
    <div
      className="flex items-center justify-between gap-3 border-t border-neutral-200 pt-3 dark:border-neutral-800"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap items-center gap-1">
        {canInteract ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void toggleLike()}
            className={buttonClass(userReaction === 'LIKE')}
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
          <span className="inline-flex items-center gap-1.5 px-2 py-1 text-sm text-neutral-500">
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
            className={buttonClass(commentsOpen)}
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

      <time className="shrink-0 text-xs text-neutral-400" dateTime={createdAt}>
        {new Date(createdAt).toLocaleDateString()}
      </time>
    </div>
  );
}
