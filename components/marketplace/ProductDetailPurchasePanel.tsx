'use client';

import { msg } from '@/lib/i18n/config';
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
import { getStockStatus, LOW_STOCK_THRESHOLD } from '@/lib/product-stock';
import { PurchaseAccessActions } from '@/components/marketplace/PurchaseAccessButton';
import { ShareMenu } from '@/components/marketplace/ShareButtons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { DeliveryMode, ProductOwnership, ProductType, SocialTargetType } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

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

const LABEL = 'text-[13px] leading-[18px] text-[color:var(--gn-ink2)]';
/** X secondary button: 1px #CFD9DE / #536471 outline, ink text — a pill, like every action. */
const OUTLINE_BUTTON =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#CFD9DE] px-5 text-[15px] font-bold text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover)] focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--gn-ink)] disabled:opacity-60 dark:border-[#536471]';
const PRIMARY_BUTTON =
  'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--gn-primary)] px-4 text-[15px] font-bold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--gn-surface)]';

const DELIVERY_LABELS: Record<DeliveryMode, string> = {
  STREAM_ONLY: msg('Instant streaming'),
  DOWNLOAD: msg('Instant download'),
  BOTH: msg('Instant delivery'),
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
  const t = useT();
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
      setError(getApiErrorMessage(e, t('Unable to update like.')));
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
      setError(getApiErrorMessage(e, t('Unable to update favorite.')));
    } finally {
      setBusy(false);
    }
  };

  const signInHref = `/login?redirect=${encodeURIComponent(loginRedirect)}`;
  const discussionPath = `/messages?user=${encodeURIComponent(creatorId)}&product=${encodeURIComponent(productId)}`;
  const messageHref = isAuthenticated ? discussionPath : `/login?redirect=${encodeURIComponent(discussionPath)}`;
  const creatorLabel = creatorName?.trim() || t('the creator');
  const messageLabel = t('Discuss this product with {creator}', { creator: creatorLabel });

  const availability = isPhysical
    ? stock.tone === 'out'
      ? t('Out of stock')
      : stock.quantity != null && stock.quantity > 1 && stock.quantity <= LOW_STOCK_THRESHOLD
        ? t('Only {count} left', { count: stock.quantity })
        : t('In stock')
    : `${t('Unlimited')} · ${t(DELIVERY_LABELS[deliveryMode] ?? 'Instant delivery')}`;
  // Black & white only: no dot when stock is fine, an ink dot when low, the error red when out.
  const availabilityDot = isPhysical
    ? stock.tone === 'out'
      ? 'bg-[#F4212E]'
      : stock.tone === 'low' && (stock.quantity ?? 0) > 1
        ? 'bg-[color:var(--gn-ink)]'
        : null
    : null;

  return (
    <>
    {/* The page's rail: an outlined box (News's `.gn-rail-box`), not a filled card. */}
    <aside className="gn-rail-box p-6">
      <div>
        <p className={LABEL}>{t('Price')}</p>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <p className="text-[32px] font-extrabold leading-9 tracking-[-0.02em] text-[color:var(--gn-ink)] tabular-nums">
            {priceLabel}
          </p>
          {comparePriceLabel && (
            <p className="text-[15px] text-[color:var(--gn-ink3)] line-through tabular-nums">{comparePriceLabel}</p>
          )}
        </div>
        {discountPercent != null && discountPercent > 0 && (
          <p className="mt-1 text-[13px] font-semibold leading-[18px] text-[color:var(--gn-ink)]">
            {t('{discountPercent}% off', { discountPercent })}
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className={LABEL}>{t('Availability')}</p>
        <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[color:var(--gn-ink)]">
          {availabilityDot && <span className={`h-2 w-2 rounded-full ${availabilityDot}`} aria-hidden />}
          {availability}
        </span>
      </div>

      {owned && ownership?.purchaseId ? (
        <div className="mt-5 space-y-2.5">
          <p className="bg-[color:var(--gn-inset)] px-4 py-3 text-[14px] leading-5 text-[color:var(--gn-ink)]">
            {t('You own this product. Download it anytime from here.')}
          </p>
          <PurchaseAccessActions purchaseId={ownership.purchaseId} deliveryMode={deliveryMode} />
        </div>
      ) : null}

      {isOwner ? null : (
        <div className="mt-6">
          <Link
            href={messageHref}
            onClick={() => setPendingProductDraft(creatorId, productId)}
            title={messageLabel}
            aria-label={messageLabel}
            className={PRIMARY_BUTTON}
          >
            <FontAwesomeIcon icon={faComment} className="h-3.5 w-3.5" />
            {isPhysical && stock.tone === 'out' ? t('Ask about restock') : `Message ${creatorName?.trim() ? creatorLabel.split(' ')[0] : 'the creator'}`}
          </Link>
          <p className="mt-2 text-center text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
            {t('Questions before you buy? The product is attached to your message.')}
          </p>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-2">
            <LoadingSpinner size="sm" />
          </div>
        ) : !isAuthenticated ? (
          <Link
            href={signInHref}
            className="flex h-10 items-center justify-center text-[14px] font-semibold text-[color:var(--gn-ink)] underline-offset-4 hover:underline"
          >
            {t('Sign in to like or save')}
          </Link>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onLike()}
              aria-pressed={userLiked}
              aria-label={userLiked ? t('Unlike') : t('Like')}
              className={`${OUTLINE_BUTTON} ${userLiked ? '!text-[#F91880]' : ''}`}
            >
              <HeartIcon filled={userLiked} />
              <span className="tabular-nums">{likes > 0 ? likes : t('Like')}</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onFavorite()}
              aria-pressed={favorited}
              className={OUTLINE_BUTTON}
            >
              <BookmarkIcon filled={favorited} />
              <span>{favorited ? t('Saved') : t('Save')}</span>
            </button>
          </div>
        )}

        <div className="mt-2">
          <ShareMenu
            targetType={targetType}
            targetId={productId}
            shareUrl={shareUrl}
            shareTitle={shareTitle}
            isAuthenticated={isAuthenticated}
            buttonClassName={`${OUTLINE_BUTTON} !justify-between`}
          />
        </div>

        <Link
          href={`/providers/${encodeURIComponent(creatorId)}/shop`}
          className={`group mt-2 ${OUTLINE_BUTTON} !justify-between`}
        >
          <span>{t('Visit the shop')}</span>
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
        {error && <p className="mt-3 text-[13px] text-[#F4212E]">{error}</p>}
      </div>
    </aside>
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
