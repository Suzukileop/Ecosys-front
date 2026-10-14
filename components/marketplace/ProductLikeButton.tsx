'use client';

import { localeTag } from '@/lib/i18n/active';
import { useCallback, useEffect, useState } from 'react';
import { getReactionCounts, removeReaction, setReaction } from '@/lib/marketplace-api';
import { emitProductLikesUpdated } from '@/lib/productLikesBus';
import { useAuth } from '@/context/AuthContext';
import { LikeBurst } from '@/components/ui/LikeBurst';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { useT } from '@/lib/i18n/I18nProvider';

type ProductLikeButtonProps = {
  productId: string;
  initialLikes: number;
  initialLiked?: boolean;
  onLikedChange?: (liked: boolean) => void;
  variant?: 'default' | 'compact';
  tone?: 'default' | 'light';
};

function formatCount(value: number) {
  return new Intl.NumberFormat(localeTag()).format(value);
}

export function ProductLikeButton({
  productId,
  initialLikes,
  initialLiked,
  onLikedChange,
  variant = 'default',
  tone = 'default',
}: ProductLikeButtonProps) {
  const t = useT();
  const compact = variant === 'compact';
  const light = tone === 'light';
  const { user, isLoading } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked ?? false);
  const [busy, setBusy] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  const canLike = Boolean(user);

  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes, productId]);

  useEffect(() => {
    if (initialLiked !== undefined) {
      setLiked(initialLiked);
    }
  }, [initialLiked, productId]);

  useEffect(() => {
    if (!canLike || isLoading || initialLiked !== undefined) {
      if (!canLike || isLoading) {
        setLiked(false);
      }
      return;
    }

    let cancelled = false;
    void getReactionCounts('PRODUCT', productId)
      .then((counts) => {
        if (!cancelled) {
          setLikes(counts.likes);
          setLiked(counts.userReaction === 'LIKE');
          emitProductLikesUpdated({
            productId,
            likes: counts.likes,
            userLiked: counts.userReaction === 'LIKE',
          });
        }
      })
      .catch(() => {
        // keep initial likes from catalog
      });

    return () => {
      cancelled = true;
    };
  }, [canLike, isLoading, initialLiked, productId]);

  const setLikedState = useCallback(
    (next: boolean) => {
      setLiked(next);
      onLikedChange?.(next);
    },
    [onLikedChange]
  );

  const toggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!canLike || busy) return;

      const wasLiked = liked;
      const optimisticLikes = wasLiked ? Math.max(0, likes - 1) : likes + 1;
      setBusy(true);
      setLikedState(!wasLiked);
      setLikes(optimisticLikes);
      if (!wasLiked) setBurstKey((k) => k + 1);
      try {
        if (wasLiked) await removeReaction('PRODUCT', productId);
        else await setReaction('PRODUCT', productId, 'LIKE');
        emitProductLikesUpdated({ productId, likes: optimisticLikes, userLiked: !wasLiked });
      } catch {
        setLikedState(wasLiked);
        setLikes(likes);
        pushFlashFeedback({
          variant: 'error',
          title: wasLiked ? t('Unable to remove your like') : t('Unable to like this product'),
        });
      } finally {
        setBusy(false);
      }
    },
    [busy, canLike, liked, likes, productId, setLikedState, t]
  );

  // Zero counts stay hidden on the compact (card) variant, like the News action bar.
  const countLabel = compact && likes <= 0 ? '' : formatCount(likes);
  const suffix = compact ? '' : ` ${likes <= 1 ? 'like' : 'likes'}`;
  const animate = liked && burstKey > 0;

  const heartIcon = (
    <span className="relative inline-flex h-4 w-4 items-center justify-center">
      {animate ? <LikeBurst key={burstKey} burstKey={burstKey} /> : null}
      <svg
        key={liked ? `on-${burstKey}` : 'off'}
        className={`relative h-4 w-4 transition-transform duration-150 group-active/like:scale-90 ${
          animate ? 'motion-safe:animate-like-pop' : ''
        } ${
          liked
            ? 'text-[#F91880]'
            : light
              ? 'text-white/70 group-hover/like:text-[#F91880]'
              : 'text-[#536471] group-hover/like:text-[#F91880] dark:text-[#71767B]'
        }`}
        fill={liked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </span>
  );

  const label = (
    <span className="inline-flex overflow-hidden tabular-nums">
      <span key={`count-${likes}`} className={`inline-block ${burstKey > 0 ? 'motion-safe:animate-like-count' : ''}`}>
        {countLabel}
      </span>
      {suffix}
    </span>
  );

  const contentClass = compact
    ? `inline-flex items-center gap-1.5 text-[13px] font-medium ${
        light ? 'text-white/90' : 'text-[#536471] dark:text-[#71767B]'
      }`
    : `inline-flex items-center gap-1.5 text-sm ${
        light ? 'text-white/90' : 'text-[#536471] dark:text-[#71767B]'
      }`;

  if (!canLike) {
    return (
      <span className={contentClass}>
        {heartIcon}
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => void toggle(e)}
      className={`group/like ${contentClass} transition-colors ${
        liked ? '!text-[#F91880]' : ''
      } ${liked || light ? '' : 'hover:text-[#F91880]'}`}
      aria-label={liked ? t('Unlike') : t('Like this product')}
      aria-pressed={liked}
    >
      {heartIcon}
      {label}
    </button>
  );
}
