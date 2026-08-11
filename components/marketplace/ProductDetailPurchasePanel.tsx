'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  addFavorite,
  getProductInit,
  isFreeProduct,
  removeFavorite,
  removeReaction,
  setReaction,
  simulateProductPurchase,
} from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { emitProductLikesUpdated } from '@/lib/productLikesBus';
import { PurchaseAccessActions } from '@/components/marketplace/PurchaseAccessButton';
import { ShareButtons } from '@/components/marketplace/ShareButtons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import type { DeliveryMode, ProductOwnership, SocialTargetType } from '@/types/marketplace';

type ProductDetailPurchasePanelProps = {
  productId: string;
  priceCents: number;
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
  priceCents,
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
  const router = useRouter();
  const free = isFreeProduct(priceCents);

  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [ownership, setOwnership] = useState<ProductOwnership | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
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

  const onPurchase = async () => {
    if (!isAuthenticated) return;
    setPurchasing(true);
    setError(null);
    try {
      const result = await simulateProductPurchase(productId);
      setPurchaseSuccess(true);
      setOwnership({
        owned: true,
        purchaseId: result.id,
        downloadCount: result.downloadCount,
        maxDownloads: null,
      });
      router.refresh();
    } catch (e) {
      setError(
        getApiErrorMessage(e, free ? 'Unable to claim this product.' : 'Purchase failed. Please try again.')
      );
    } finally {
      setPurchasing(false);
    }
  };

  const buyLabel = free ? `Get for free — ${priceLabel}` : `Buy — ${priceLabel}`;
  const signInHref = `/login?redirect=${encodeURIComponent(loginRedirect)}`;

  return (
    <aside className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
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

      <dl className="mt-4 flex justify-between gap-4 text-sm">
        <dt className="text-gray-500 dark:text-gray-400">Access</dt>
        <dd className="font-semibold text-gray-900 dark:text-white">
          {owned ? 'In your library' : 'Instant download'}
        </dd>
      </dl>

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
            href="/marketplace?tab=purchases"
            className="flex w-full items-center justify-center rounded-xl border border-orange-300 bg-white px-4 py-3 text-sm font-semibold text-orange-800 transition hover:bg-orange-50 dark:border-orange-500/40 dark:bg-neutral-800 dark:text-orange-200 dark:hover:bg-orange-500/10"
          >
            View in my library
          </Link>
        </div>
      ) : purchaseSuccess && ownership?.purchaseId ? (
        <div className="mt-5 space-y-3">
          <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-500/10 dark:text-green-200">
            {free
              ? 'Added to your library! You can download it right away.'
              : 'Purchase complete! Your download is ready.'}
          </p>
          <PurchaseAccessActions
            purchaseId={ownership.purchaseId}
            deliveryMode={deliveryMode}
          />
          <Link
            href="/marketplace?tab=purchases"
            className="flex w-full items-center justify-center rounded-xl border border-orange-300 bg-white px-4 py-3 text-sm font-semibold text-orange-800 hover:bg-orange-50 dark:border-orange-500/40 dark:bg-neutral-800 dark:text-orange-200"
          >
            View my library
          </Link>
        </div>
      ) : !isAuthenticated ? (
        <Link
          href={signInHref}
          className="mt-5 flex w-full items-center justify-center rounded-xl bg-orange-200 px-4 py-3.5 text-sm font-bold text-orange-950 transition hover:bg-orange-300 dark:bg-orange-500 dark:text-white dark:hover:bg-orange-600"
        >
          {free ? `Sign in to get — ${priceLabel}` : `Sign in to buy — ${priceLabel}`}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => void onPurchase()}
          disabled={purchasing}
          className="mt-5 flex w-full items-center justify-center rounded-xl bg-orange-200 px-4 py-3.5 text-sm font-bold text-orange-950 transition hover:bg-orange-300 disabled:opacity-60 dark:bg-orange-500 dark:text-white dark:hover:bg-orange-600"
        >
          {purchasing ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Processing…</span>
            </>
          ) : (
            buyLabel
          )}
        </button>
      )}

      {!owned && !purchaseSuccess && (
        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
          {free ? 'Simulated claim — no payment required.' : 'Simulated purchase — no real payment charged.'}
        </p>
      )}

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
              className={`flex items-center justify-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 text-sm font-medium transition dark:bg-neutral-800 ${
                userLiked
                  ? 'border-orange-200 text-orange-800 dark:border-orange-500/30 dark:text-orange-200'
                  : 'border-stone-200 text-gray-700 hover:border-orange-200 dark:border-neutral-600 dark:text-gray-200'
              }`}
            >
              <HeartIcon filled={userLiked} />
              <span>{likes}</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onFavorite()}
              className={`flex items-center justify-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 text-sm font-medium transition dark:bg-neutral-800 ${
                favorited
                  ? 'border-amber-200 text-amber-900 dark:border-amber-500/30 dark:text-amber-200'
                  : 'border-stone-200 text-gray-700 hover:border-orange-200 dark:border-neutral-600 dark:text-gray-200'
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
        />
      </div>

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
