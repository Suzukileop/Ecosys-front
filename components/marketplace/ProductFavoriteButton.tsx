'use client';

import { useCallback, useEffect, useState } from 'react';
import { addFavorite, getReactionCounts, removeFavorite } from '@/lib/marketplace-api';
import { useAuth } from '@/context/AuthContext';

type ProductFavoriteButtonProps = {
  productId: string;
  initialFavorited?: boolean;
  onFavoritedChange?: (favorited: boolean) => void;
  variant?: 'heart' | 'bookmark';
  size?: 'default' | 'sm';
};

export function ProductFavoriteButton({
  productId,
  initialFavorited,
  onFavoritedChange,
  variant = 'heart',
  size = 'default',
}: ProductFavoriteButtonProps) {
  const compact = size === 'sm';
  const { user, hasRole, isLoading } = useAuth();
  const [favorited, setFavorited] = useState(initialFavorited ?? false);
  const [busy, setBusy] = useState(false);

  const canFavorite = Boolean(user && hasRole('ROLE_CREATOR'));

  useEffect(() => {
    if (initialFavorited !== undefined) {
      setFavorited(initialFavorited);
    }
  }, [initialFavorited, productId]);

  useEffect(() => {
    if (!canFavorite || isLoading || initialFavorited !== undefined) return;

    let cancelled = false;
    void getReactionCounts('PRODUCT', productId)
      .then((counts) => {
        if (!cancelled) {
          setFavorited(counts.favorited);
        }
      })
      .catch(() => {
        // ignore — button stays unfavorited
      });

    return () => {
      cancelled = true;
    };
  }, [canFavorite, isLoading, initialFavorited, productId]);

  const setFavoriteState = useCallback(
    (next: boolean) => {
      setFavorited(next);
      onFavoritedChange?.(next);
    },
    [onFavoritedChange]
  );

  const toggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!canFavorite || busy) return;
      setBusy(true);
      try {
        if (favorited) {
          await removeFavorite('PRODUCT', productId);
          setFavoriteState(false);
        } else {
          await addFavorite('PRODUCT', productId);
          setFavoriteState(true);
        }
      } finally {
        setBusy(false);
      }
    },
    [canFavorite, busy, favorited, productId, setFavoriteState]
  );

  if (!canFavorite) return null;

  return (
    <button
      type="button"
      onClick={(e) => void toggle(e)}
      disabled={busy}
      className={`flex items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:bg-white disabled:opacity-60 dark:bg-neutral-900/95 dark:hover:bg-neutral-900 ${
        compact ? 'h-8 w-8' : 'h-10 w-10'
      }`}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={favorited}
    >
      {variant === 'bookmark' ? (
        <svg
          className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} ${favorited ? 'fill-gray-900 text-gray-900 dark:fill-white dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}
          fill={favorited ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ) : (
        <svg
          className={`h-5 w-5 ${favorited ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
          fill={favorited ? 'currentColor' : 'none'}
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
      )}
    </button>
  );
}
