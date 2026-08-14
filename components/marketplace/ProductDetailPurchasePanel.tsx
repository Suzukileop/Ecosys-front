'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  addFavorite,
  getProductInit,
  removeFavorite,
  removeReaction,
  setReaction,
} from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { emitProductLikesUpdated } from '@/lib/productLikesBus';
import { PurchaseAccessActions } from '@/components/marketplace/PurchaseAccessButton';
import { ShareButtons } from '@/components/marketplace/ShareButtons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { DeliveryMode, ProductOwnership, SocialTargetType } from '@/types/marketplace';

type ProductDetailPurchasePanelProps = {
  productId: string;
  creatorId: string;
  creatorName?: string | null;
  priceLabel: string;
  comparePriceLabel?: string | null;
  discountPercent?: number | null;
  deliveryMode: DeliveryMode;
  isAuthenticated: boolean;
  loginRedirect: string;
  shareUrl: string;
  shareTitle: string;
  targetType: SocialTargetType;
};

export function ProductDetailPurchasePanel({
  productId,
  creatorId,
  creatorName,
  priceLabel,
  comparePriceLabel,
  discountPercent,
  deliveryMode,
  isAuthenticated,
  loginRedirect,
  shareUrl,
  shareTitle,
  targetType,
}: ProductDetailPurchasePanelProps) {
  const { user } = useAuth();
  const isOwner = Boolean(user?.id && user.id === creatorId);

  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [ownership, setOwnership] = useState<ProductOwnership | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const owned = ownership?.owned ?? false;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const init = await getProductInit(productId).catch(() => null);
      if (init) {
        const counts = init.reactionCounts;
        setLikes(counts.likes);
        setUserLiked(counts.userReaction === 'LIKE');
        setFavorited(counts.favorited);
        emitProductLikesUpdated({
          productId,
          likes: counts.likes,
          userLiked: counts.userReaction === 'LIKE',
        });
        if (init.ownership) {
          setOwnership(init.ownership);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onLike = async () => {
    if (!isAuthenticated) return;
    setBusy(true);
    setError(null);
    try {
      if (userLiked) {
        await removeReaction(targetType, productId);
        const nextLikes = Math.max(0, likes - 1);
        setUserLiked(false);
        setLikes(nextLikes);
        emitProductLikesUpdated({ productId, likes: nextLikes, userLiked: false });
      } else {
        await setReaction(targetType, productId, 'LIKE');
        const nextLikes = likes + 1;
        setUserLiked(true);
        setLikes(nextLikes);
        emitProductLikesUpdated({ productId, likes: nextLikes, userLiked: true });
      }
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to update like.'));
    } finally {
      setBusy(false);
    }
  };

  const onFavorite = async () => {
    if (!isAuthenticated) return;
    setBusy(true);
    setError(null);
    try {
      if (favorited) {
        await removeFavorite(targetType, productId);
        setFavorited(false);
      } else {
        await addFavorite(targetType, productId);
        setFavorited(true);
      }
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to update favorite.'));
    } finally {
      setBusy(false);
    }
  };

  const signInHref = `/login?redirect=${encodeURIComponent(loginRedirect)}`;
  const messageHref = isAuthenticated
    ? `/dashboard/discussions?user=${encodeURIComponent(creatorId)}`
    : `/login?redirect=${encodeURIComponent(`/dashboard/discussions?user=${encodeURIComponent(creatorId)}`)}`;
  const messageLabel = creatorName?.trim() ? `Message ${creatorName.trim()}` : 'Message creator';

  return (
    <aside className="rounded-2xl bg-white p-5 dark:bg-[#0F0F0F]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{priceLabel}</p>
          {comparePriceLabel && (
            <p className="text-sm text-gray-400 line-through dark:text-gray-500">was: {comparePriceLabel}</p>
          )}
        </div>
        {discountPercent != null && discountPercent > 0 && (
          <span className="inline-flex shrink-0 rounded-md bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            -{discountPercent}%
          </span>
        )}
      </div>

      {owned && ownership?.purchaseId ? (
        <div className="mt-5 space-y-3">
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
            You own this product. Download it anytime from here or your library.
          </p>
          <PurchaseAccessActions
            purchaseId={ownership.purchaseId}
            deliveryMode={deliveryMode}
          />
          <Link
            href="/marketplace/purchases"
            className="flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-orange-800 transition hover:bg-orange-50 dark:bg-neutral-800 dark:text-orange-200 dark:hover:bg-orange-500/10"
          >
            View in my library
          </Link>
        </div>
      ) : !isOwner ? (
        <Link
          href={messageHref}
          title={messageLabel}
          aria-label={messageLabel}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          <FontAwesomeIcon icon={faComment} className="h-3.5 w-3.5" />
          Discuss
        </Link>
      ) : null}

      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center py-2">
            <LoadingSpinner size="sm" />
          </div>
        ) : !isAuthenticated ? (
          <Link
            href={signInHref}
            className="block text-center text-sm font-medium text-orange-700 hover:text-orange-800 dark:text-orange-400"
          >
            Sign in to like or save
          </Link>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onLike()}
              className={`flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-sm font-medium transition dark:bg-neutral-800 ${
                userLiked
                  ? 'text-orange-800 dark:text-orange-200'
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              <HeartIcon filled={userLiked} />
              <span>{likes}</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onFavorite()}
              className={`flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-sm font-medium transition dark:bg-neutral-800 ${
                favorited
                  ? 'text-amber-900 dark:text-amber-200'
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              <BookmarkIcon filled={favorited} />
              <span>{favorited ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Share</p>
        <ShareButtons
          targetType={targetType}
          targetId={productId}
          shareUrl={shareUrl}
          shareTitle={shareTitle}
          isAuthenticated={isAuthenticated}
          size="lg"
        />
      </div>

      <Link
        href={`/marketplace/${encodeURIComponent(creatorId)}/shop`}
        className="mt-5 flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:border-orange-500/40 dark:hover:bg-orange-500/10 dark:hover:text-orange-200"
      >
        Visit my shop
      </Link>

      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </aside>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-4 w-4 ${filled ? 'fill-orange-500 text-orange-500' : 'fill-none text-current'}`}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-4 w-4 ${filled ? 'fill-amber-500 text-amber-500' : 'fill-none text-current'}`}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  );
}
