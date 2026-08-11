'use client';

import { useCallback, useEffect, useState } from 'react';
import { getReactionCounts, removeReaction, setReaction } from '@/lib/marketplace-api';
import { emitProductLikesUpdated } from '@/lib/productLikesBus';
import { useAuth } from '@/context/AuthContext';

type ProductLikeButtonProps = {
  productId: string;
  initialLikes: number;
  initialLiked?: boolean;
  onLikedChange?: (liked: boolean) => void;
  variant?: 'default' | 'compact';
  tone?: 'default' | 'light';
};

function formatCount(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function ProductLikeButton({
  productId,
  initialLikes,
  initialLiked,
  onLikedChange,
  variant = 'default',
  tone = 'default',
}: ProductLikeButtonProps) {
  const compact = variant === 'compact';
  const light = tone === 'light';
  const { user, isLoading } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked ?? false);
  const [busy, setBusy] = useState(false);

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

      setBusy(true);
      try {
        if (liked) {
          await removeReaction('PRODUCT', productId);
          setLikedState(false);
          setLikes((prev) => {
            const nextLikes = Math.max(0, prev - 1);
            emitProductLikesUpdated({ productId, likes: nextLikes, userLiked: false });
            return nextLikes;
          });
        } else {
          await setReaction('PRODUCT', productId, 'LIKE');
          setLikedState(true);
          setLikes((prev) => {
            const nextLikes = prev + 1;
            emitProductLikesUpdated({ productId, likes: nextLikes, userLiked: true });
            return nextLikes;
          });
        }
      } finally {
        setBusy(false);
      }
    },
    [busy, canLike, liked, productId, setLikedState]
  );

  const label = compact ? formatCount(likes) : `${formatCount(likes)} ${likes <= 1 ? 'like' : 'likes'}`;

  const heartIcon = (
    <svg
      className={`${compact ? 'h-4 w-4' : 'h-4 w-4'} ${
        liked
          ? light
            ? 'fill-white text-white'
            : 'fill-gray-500 text-gray-500 dark:fill-gray-400 dark:text-gray-400'
          : light
            ? 'text-white/70'
            : 'text-gray-400 dark:text-gray-500'
      }`}
      fill={liked ? 'currentColor' : 'none'}
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
  );

  const contentClass = compact
    ? `inline-flex items-center gap-1.5 text-sm font-medium ${
        light ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'
      }`
    : `inline-flex items-center gap-1.5 text-sm ${
        light ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'
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
      disabled={busy}
      className={`${contentClass} transition disabled:opacity-60 ${
        liked || light ? '' : 'hover:text-gray-600 dark:hover:text-gray-300'
      }`}
      aria-label={liked ? 'Unlike' : 'Like this product'}
      aria-pressed={liked}
    >
      {heartIcon}
      {label}
    </button>
  );
}
