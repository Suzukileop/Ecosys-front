'use client';

import { useCallback, useState } from 'react';
import { getReactionCounts, removeReaction, setReaction } from '@/lib/marketplace-api';
import type { ReactionType } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

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
  const t = useT();
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

  /*
   * One reaction on a comment, X style: a like only (a dislike has no place in a professional
   * thread — counts are still read from the API, the control is simply not offered), the count
   * only above zero, and the liked state a filled heart in full ink — no accent colour.
   */
  const heart = (filled: boolean) => (
    <svg className="h-4 w-4" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
  const count = likes > 0 ? <span className="tabular-nums">{formatCount(likes)}</span> : null;

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center ${compact ? '' : 'mt-2'}`}>
        <span className="inline-flex h-8 items-center gap-1 px-1.5 text-[13px] text-[#536471] dark:text-[#71767B]">
          {heart(false)}
          {count}
        </span>
      </div>
    );
  }

  const liked = userReaction === 'LIKE';
  return (
    <div className={`flex items-center ${compact ? '' : 'mt-2'}`}>
      <button
        type="button"
        disabled={busy}
        onClick={() => void applyReaction('LIKE')}
        className={`-ml-1.5 inline-flex h-8 items-center gap-1 rounded-full px-1.5 text-[13px] font-medium transition-colors ${
          liked
            ? 'text-[#0F1419] dark:text-[#E7E9EA]'
            : 'text-[#536471] hover:text-[#0F1419] dark:text-[#71767B] dark:hover:text-[#E7E9EA]'
        }`}
        aria-pressed={liked}
        aria-label={liked ? t('Unlike') : t('Like')}
      >
        {heart(liked)}
        {count}
      </button>
    </div>
  );
}
