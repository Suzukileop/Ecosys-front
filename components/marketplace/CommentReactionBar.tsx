'use client';

import { useCallback, useState } from 'react';
import { getReactionCounts, removeReaction, setReaction } from '@/lib/marketplace-api';
import type { ReactionType } from '@/types/marketplace';

function formatCount(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value);
}

type CommentReactionBarProps = {
  commentId: string;
  initialLikes?: number;
  initialDislikes?: number;
  initialUserReaction?: ReactionType | null;
  isAuthenticated: boolean;
  onReactionChange?: (likes: number, dislikes: number, userReaction: ReactionType | null) => void;
  compact?: boolean;
};

export function CommentReactionBar({
  commentId,
  initialLikes = 0,
  initialDislikes = 0,
  initialUserReaction = null,
  isAuthenticated,
  onReactionChange,
  compact = false,
}: CommentReactionBarProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(initialUserReaction);
  const [busy, setBusy] = useState(false);

  const applyReaction = useCallback(
    async (type: ReactionType) => {
      if (!isAuthenticated || busy) return;

      setBusy(true);
      try {
        if (userReaction === type) {
          await removeReaction('COMMENT', commentId);
          const nextLikes = type === 'LIKE' ? Math.max(0, likes - 1) : likes;
          const nextDislikes = type === 'DISLIKE' ? Math.max(0, dislikes - 1) : dislikes;
          setLikes(nextLikes);
          setDislikes(nextDislikes);
          setUserReaction(null);
          onReactionChange?.(nextLikes, nextDislikes, null);
          return;
        }

        await setReaction('COMMENT', commentId, type);
        let nextLikes = likes;
        let nextDislikes = dislikes;
        if (userReaction === 'LIKE') nextLikes = Math.max(0, likes - 1);
        if (userReaction === 'DISLIKE') nextDislikes = Math.max(0, dislikes - 1);
        if (type === 'LIKE') nextLikes += 1;
        if (type === 'DISLIKE') nextDislikes += 1;
        setLikes(nextLikes);
        setDislikes(nextDislikes);
        setUserReaction(type);
        onReactionChange?.(nextLikes, nextDislikes, type);
      } catch {
        const counts = await getReactionCounts('COMMENT', commentId).catch(() => null);
        if (counts) {
          setLikes(counts.likes);
          setDislikes(counts.dislikes);
          setUserReaction(counts.userReaction);
          onReactionChange?.(counts.likes, counts.dislikes, counts.userReaction);
        }
      } finally {
        setBusy(false);
      }
    },
    [busy, commentId, dislikes, isAuthenticated, likes, onReactionChange, userReaction]
  );

  const buttonClass = (active: boolean) =>
    `inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium transition ${
      active
        ? 'text-orange-600 dark:text-orange-400'
        : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
    }`;

  if (!isAuthenticated) {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${compact ? '' : 'mt-2'}`}>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-neutral-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {formatCount(likes)}
        </span>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-neutral-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
            />
          </svg>
          {formatCount(dislikes)}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-1 ${compact ? '' : 'mt-2'}`}>
      <button
        type="button"
        disabled={busy}
        onClick={() => void applyReaction('LIKE')}
        className={buttonClass(userReaction === 'LIKE')}
        aria-pressed={userReaction === 'LIKE'}
        aria-label="J'aime"
      >
        <svg
          className="h-3.5 w-3.5"
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
      <button
        type="button"
        disabled={busy}
        onClick={() => void applyReaction('DISLIKE')}
        className={buttonClass(userReaction === 'DISLIKE')}
        aria-pressed={userReaction === 'DISLIKE'}
        aria-label="Je n'aime pas"
      >
        <svg
          className="h-3.5 w-3.5"
          fill={userReaction === 'DISLIKE' ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
          />
        </svg>
        {formatCount(dislikes)}
      </button>
    </div>
  );
}
