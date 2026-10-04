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
import { setPendingProductDraft } from '@/lib/chat-product-draft';
import { emitProductLikesUpdated } from '@/lib/productLikesBus';
import { getStockStatus, LOW_STOCK_THRESHOLD, STOCK_TONE_DOT } from '@/lib/product-stock';
import { PurchaseAccessActions } from '@/components/marketplace/PurchaseAccessButton';
import { ShareMenu } from '@/components/marketplace/ShareButtons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { DeliveryMode, ProductOwnership, ProductType, SocialTargetType } from '@/types/marketplace';

type ProductDetailPurchasePanelProps = {
  productId: string;
  productType: ProductType;
  stockQuantity?: number | null;
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

const LABEL = 'text-[13px] font-medium text-neutral-500 dark:text-neutral-400';
const DIVIDER = 'border-t border-black/[0.06] dark:border-white/[0.08]';
const OUTLINE_BUTTON =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-black/[0.1] px-4 text-[15px] font-medium text-[#111111] transition hover:border-black/[0.25] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722] disabled:opacity-60 dark:border-white/[0.14] dark:text-white dark:hover:border-white/[0.3]';

const DELIVERY_LABELS: Record<DeliveryMode, string> = {
  STREAM_ONLY: 'Instant streaming',
  DOWNLOAD: 'Instant download',
  BOTH: 'Instant delivery',
};

export function ProductDetailPurchasePanel({
  productId,
  productType,
  stockQuantity,
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
  const isPhysical = productType === 'PHYSICAL';
  const stock = getStockStatus({ type: productType, stockQuantity });

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
  const discussionPath = `/dashboard/discussions?user=${encodeURIComponent(creatorId)}&product=${encodeURIComponent(productId)}`;
  const messageHref = isAuthenticated ? discussionPath : `/login?redirect=${encodeURIComponent(discussionPath)}`;
  const creatorLabel = creatorName?.trim() || 'the creator';
  const messageLabel = `Discuss this product with ${creatorLabel}`;

  const availability = isPhysical
    ? stock.tone === 'out'
      ? 'Out of stock'
      : stock.quantity != null && stock.quantity > 1 && stock.quantity <= LOW_STOCK_THRESHOLD
        ? `Only ${stock.quantity} left`
        : 'In stock'
    : `Unlimited · ${DELIVERY_LABELS[deliveryMode] ?? 'Instant delivery'}`;
  const availabilityDot = isPhysical
    ? STOCK_TONE_DOT[stock.tone === 'out' ? 'out' : stock.tone === 'low' && (stock.quantity ?? 0) > 1 ? 'low' : 'ok']
    : null;

  return (
    <>
    <aside className="rounded-lg border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#111111]">
      <div className="px-6 pb-6 pt-6">
        <p className={LABEL}>Price</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <p className="text-[34px] font-semibold leading-none tracking-[-0.03em] text-[#111111] tabular-nums dark:text-white">
            {priceLabel}
          </p>
          {comparePriceLabel && (
            <p className="text-[15px] text-neutral-400 line-through tabular-nums dark:text-neutral-500">
              {comparePriceLabel}
            </p>
          )}
        </div>
        {discountPercent != null && discountPercent > 0 && (
          <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Save {discountPercent}% today
          </p>
        )}
      </div>

      <div className={`${DIVIDER} flex items-center justify-between gap-3 px-6 py-4`}>
        <p className={LABEL}>Availability</p>
        <span className="inline-flex items-center gap-2 text-[15px] font-medium text-[#111111] dark:text-white">
          {availabilityDot && <span className={`h-2 w-2 rounded-full ${availabilityDot}`} aria-hidden />}
          {availability}
        </span>
      </div>

      {owned && ownership?.purchaseId ? (
        <div className={`${DIVIDER} space-y-2.5 p-6`}>
          <p className="rounded-md bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-800 dark:text-emerald-300">
            You own this product. Download it anytime from here or your library.
          </p>
          <PurchaseAccessActions purchaseId={ownership.purchaseId} deliveryMode={deliveryMode} />
          <Link href="/marketplace/purchases" className={OUTLINE_BUTTON}>
            View in my library
          </Link>
        </div>
      ) : null}

      <div className={`${DIVIDER} p-6`}>
        {loading ? (
          <div className="flex justify-center py-2">
            <LoadingSpinner size="sm" />
          </div>
        ) : !isAuthenticated ? (
          <Link
            href={signInHref}
            className="block text-center text-sm font-medium text-[#111111] underline-offset-4 hover:underline dark:text-white"
          >
            Sign in to like or save
          </Link>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onLike()}
              aria-pressed={userLiked}
              className={`${OUTLINE_BUTTON} ${userLiked ? '!border-[#FF5722]/50 !text-[#FF5722]' : ''}`}
            >
              <HeartIcon filled={userLiked} />
              <span className="tabular-nums">{likes}</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onFavorite()}
              aria-pressed={favorited}
              className={`${OUTLINE_BUTTON} ${favorited ? '!border-[#FF5722]/50 !text-[#FF5722]' : ''}`}
            >
              <BookmarkIcon filled={favorited} />
              <span>{favorited ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        )}

        <div className="mt-2.5">
          <ShareMenu
            targetType={targetType}
            targetId={productId}
            shareUrl={shareUrl}
            shareTitle={shareTitle}
            isAuthenticated={isAuthenticated}
            buttonClassName={`${OUTLINE_BUTTON} !justify-between`}
          />
        </div>
      </div>

      <div className={`${DIVIDER} p-6`}>
        <Link
          href={`/marketplace/${encodeURIComponent(creatorId)}/shop`}
          className={`group ${OUTLINE_BUTTON} !justify-between`}
        >
          <span>Visit the shop</span>
          <svg
            className="h-4 w-4 shrink-0 opacity-60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </Link>
        {error && <p className="mt-3 text-sm text-[#E0431A] dark:text-[#FF7A52]">{error}</p>}
      </div>
    </aside>

    {isOwner ? null : (
      <div className="mt-4 rounded-lg border border-black/[0.06] bg-white p-5 dark:border-white/[0.08] dark:bg-[#111111]">
        <p className="text-[15px] font-semibold text-[#111111] dark:text-white">Questions before you buy?</p>
        <p className="mt-1 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          Chat with {creatorLabel}. This product is attached to your message.
        </p>
        <Link
          href={messageHref}
          onClick={() => setPendingProductDraft(creatorId, productId)}
          title={messageLabel}
          aria-label={messageLabel}
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#FF5722] px-4 text-[15px] font-medium text-white transition hover:bg-[#F4511E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#111111]"
        >
          <FontAwesomeIcon icon={faComment} className="h-3.5 w-3.5" />
          {isPhysical && stock.tone === 'out' ? 'Ask about restock' : 'Discuss'}
        </Link>
      </div>
    )}
    </>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-4 w-4 ${filled ? 'fill-current' : 'fill-none'}`}
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
      className={`h-4 w-4 ${filled ? 'fill-current' : 'fill-none'}`}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  );
}
