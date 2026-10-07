'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faCrown, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { collectProductLabels, formatPrice, formatVideoDuration, isFreeProduct } from '@/lib/marketplace-api';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { useAuth } from '@/context/AuthContext';
import { setPendingProductDraft } from '@/lib/chat-product-draft';
import { ProductCardEngagementStrip } from '@/components/marketplace/ProductCardEngagementStrip';
import { ProductFavoriteButton } from '@/components/marketplace/ProductFavoriteButton';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import type { MarketplaceProductSummary } from '@/types/marketplace';

/** Responsive product grid — max 3 columns so cards stay airy and titles readable. */
export const marketplaceProductGridClassName =
  'grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';

type ProductCardProps = {
  product: MarketplaceProductSummary;
  href?: string;
  showCreator?: boolean;
  initialFavorited?: boolean;
  onFavoritedChange?: (productId: string, favorited: boolean) => void;
  initialLiked?: boolean;
  onLikedChange?: (productId: string, liked: boolean) => void;
  /** Square, side-border-free card that runs edge to edge on phones. */
  flushOnMobile?: boolean;
};

const OVERLAY_CHIP = 'rounded-md bg-black/60 px-2 py-1 text-[13px] font-medium text-white backdrop-blur-sm';

export function ProductCard({
  product,
  href,
  showCreator = true,
  initialFavorited,
  onFavoritedChange,
  initialLiked,
  onLikedChange,
  flushOnMobile = false,
}: ProductCardProps) {
  const { user } = useAuth();
  const targetHref = href ?? `/marketplace/products/${product.id}`;
  const isVideo = product.type === 'VIDEO';
  const hasVideoThumbnail = isVideoThumbnailUrl(product.thumbnailUrl);
  const { genre, tags } = collectProductLabels(product);
  const labels = [...(genre ? [genre] : []), ...tags];
  const shopName = product.shopName?.trim() || null;
  const authorName = product.creatorName?.trim() || null;

  const isOwnProduct = Boolean(user?.id && user.id === product.creatorId);
  const discussionPath = `/messages?user=${encodeURIComponent(product.creatorId)}&product=${encodeURIComponent(product.id)}`;
  const messageHref = user ? discussionPath : `/login?redirect=${encodeURIComponent(discussionPath)}`;
  const messageLabel = authorName ? `Message ${authorName}` : 'Message creator';

  const hasDiscount =
    !isFreeProduct(product.priceCents) &&
    product.compareAtPriceCents != null &&
    product.compareAtPriceCents > product.priceCents;

  const showDuration =
    (isVideo || hasVideoThumbnail) &&
    product.videoDurationSeconds != null &&
    product.videoDurationSeconds > 0;

  return (
    <article
      className={`group flex w-full flex-col overflow-hidden rounded-lg border border-black/[0.06] bg-white transition-colors duration-300 hover:border-black/[0.12] dark:border-white/[0.08] dark:bg-[#111111] dark:hover:border-white/[0.16] ${
        flushOnMobile ? 'max-sm:rounded-none max-sm:border-x-0 max-sm:!border-[#DADDE1] max-sm:!bg-transparent dark:max-sm:!border-white/[0.16]' : ''
      }`}
    >
      <Link
        href={targetHref}
        className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden bg-black/[0.04] dark:bg-white/[0.04]"
      >
        {product.thumbnailUrl ? (
          <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105">
            <ProductThumbnailMedia
              url={product.thumbnailUrl}
              autoPlay={hasVideoThumbnail}
              fit="cover"
              className="h-full w-full"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-[14px] text-neutral-400 dark:text-neutral-500">Preview unavailable</span>
          </div>
        )}

        {product.videoResolution ? (
          <div className="absolute left-3 top-3">
            <span className={OVERLAY_CHIP}>{product.videoResolution}</span>
          </div>
        ) : null}

        <div className="absolute right-3 top-3 flex items-start gap-1.5" onClick={(e) => e.preventDefault()}>
          {product.isPinned ? (
            <span
              title="Pinned"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#FF5722] shadow-sm dark:bg-[#111111]/95"
            >
              <FontAwesomeIcon icon={faThumbtack} className="h-3 w-3" />
            </span>
          ) : null}
          {product.isBestseller ? (
            <span
              title="Bestseller"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-amber-500 shadow-sm dark:bg-[#111111]/95"
            >
              <FontAwesomeIcon icon={faCrown} className="h-3 w-3" />
            </span>
          ) : null}
          <ProductFavoriteButton
            productId={product.id}
            initialFavorited={initialFavorited}
            onFavoritedChange={(favorited) => onFavoritedChange?.(product.id, favorited)}
            variant="bookmark"
            size="sm"
          />
        </div>

        {showDuration ? (
          <div className="absolute bottom-3 left-3">
            <span className={`${OVERLAY_CHIP} inline-flex items-center gap-1`}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatVideoDuration(product.videoDurationSeconds!)}
            </span>
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link
          href={targetHref}
          className="line-clamp-2 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-[#111111] transition-colors duration-200 group-hover:text-[#FF5722] dark:text-white"
          title={product.title}
        >
          {product.title}
        </Link>

        {showCreator && (authorName || shopName) ? (
          <p className="flex min-w-0 items-center gap-1.5 text-[14px] text-neutral-500 dark:text-neutral-400">
            {authorName ? (
              <Link
                href={`/providers/${product.creatorId}`}
                className="truncate font-medium text-neutral-700 transition-colors hover:text-[#FF5722] dark:text-neutral-200"
                onClick={(e) => e.stopPropagation()}
              >
                {authorName}
              </Link>
            ) : null}
            {authorName && shopName ? <span aria-hidden>·</span> : null}
            {shopName ? (
              <span className="truncate" title={shopName}>
                {shopName}
              </span>
            ) : null}
          </p>
        ) : null}

        {labels.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {labels.map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="rounded-full border border-black/[0.08] px-2.5 py-0.5 text-[13px] text-neutral-600 dark:border-white/[0.1] dark:text-neutral-300"
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-black/[0.06] pt-4 dark:border-white/[0.06]">
          <div className="min-w-0">
            {hasDiscount && (
              <p className="text-[14px] text-neutral-400 line-through dark:text-neutral-500">
                {formatPrice(product.compareAtPriceCents!, product.currency)}
              </p>
            )}
            <p className="text-base font-semibold text-[#111111] dark:text-white">
              {formatPrice(product.priceCents, product.currency)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <ProductCardEngagementStrip
              productId={product.id}
              initialLikes={product.likes ?? 0}
              initialLiked={initialLiked}
              onLikedChange={(liked) => onLikedChange?.(product.id, liked)}
              views={product.views ?? 0}
            />
            {!isOwnProduct && (
              <Link
                href={messageHref}
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingProductDraft(product.creatorId, product.id);
                }}
                title={messageLabel}
                aria-label={messageLabel}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.12] text-[#111111] transition-colors hover:border-[#111111] hover:bg-[#111111] hover:text-white dark:border-white/[0.12] dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-[#111111]"
              >
                <FontAwesomeIcon icon={faComment} className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
