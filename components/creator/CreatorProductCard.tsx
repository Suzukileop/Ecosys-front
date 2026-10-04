'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faEye, faEyeSlash, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import {
  collectProductLabels,
  formatPrice,
  formatVideoDuration,
  isFreeProduct,
  PRODUCT_TYPE_LABELS,
} from '@/lib/marketplace-api';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { DEFAULT_PHYSICAL_STOCK, LOW_STOCK_THRESHOLD, physicalStockQuantity } from '@/lib/product-stock';
import { ProductCardEngagementStrip } from '@/components/marketplace/ProductCardEngagementStrip';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import type { MarketplaceProductSummary } from '@/types/marketplace';
import {
  creatorProductViewPath,
  type CreatorProductNavFrom,
} from '@/lib/creator-product-nav';

type CreatorProductCardProps = {
  product: MarketplaceProductSummary;
  /** When true, hide publish controls — profile preview only. */
  readOnly?: boolean;
  /** Controls back-navigation target on the product detail page. */
  from?: CreatorProductNavFrom;
  publishingId?: string | null;
  flagBusyId?: string | null;
  onTogglePublish?: (product: MarketplaceProductSummary) => void;
  onTogglePin?: (product: MarketplaceProductSummary) => void;
  onToggleProfileVisibility?: (product: MarketplaceProductSummary) => void;
  /** Square, side-border-free card that runs edge to edge on phones. */
  flushOnMobile?: boolean;
};

export const creatorProductGridClassName =
  'grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';

const OVERLAY_CHIP = 'rounded-md bg-black/60 px-2.5 py-1 text-[14px] font-medium text-white backdrop-blur-sm';
const FLAG_BUTTON =
  'inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition disabled:opacity-60 dark:bg-[#111111]/95';

export function CreatorProductCard({
  product,
  readOnly = false,
  from = 'products',
  publishingId = null,
  flagBusyId = null,
  onTogglePublish,
  onTogglePin,
  onToggleProfileVisibility,
  flushOnMobile = false,
}: CreatorProductCardProps) {
  const isVideo = product.type === 'VIDEO';
  const hasVideoThumbnail = isVideoThumbnailUrl(product.thumbnailUrl);
  const { genre, tags } = collectProductLabels(product);
  const labels = [...(genre ? [genre] : []), ...tags];
  const isPublishing = publishingId === product.id;
  const isFlagBusy = flagBusyId === product.id;
  const viewHref = creatorProductViewPath(product.id, from);
  const showDuration =
    (isVideo || hasVideoThumbnail) &&
    product.videoDurationSeconds != null &&
    product.videoDurationSeconds > 0;
  const hasDiscount =
    !isFreeProduct(product.priceCents) &&
    product.compareAtPriceCents != null &&
    product.compareAtPriceCents > product.priceCents;
  const canManageFlags = !readOnly && (onTogglePin || onToggleProfileVisibility);
  const hiddenFromProfile = product.showOnProfile === false;
  const shopRankLabel = product.bestsellerRank ? `#${product.bestsellerRank} best seller` : null;
  const rankLabels = [
    ...(shopRankLabel ? [shopRankLabel] : []),
    ...(product.catalogueBestsellers ?? []).map((entry) => `#${entry.rank} in ${entry.catalogueName}`),
  ];
  const stockQuantity = physicalStockQuantity(product);
  const stock = stockQuantity != null && stockQuantity !== DEFAULT_PHYSICAL_STOCK ? stockQuantity : null;

  return (
    <article
      className={`group flex w-full flex-col overflow-hidden rounded-lg border border-black/[0.06] bg-white transition-colors duration-300 hover:border-black/[0.12] dark:border-white/[0.08] dark:bg-[#111111] dark:hover:border-white/[0.16] ${
        flushOnMobile ? 'max-sm:rounded-none max-sm:border-x-0 max-sm:!border-[#DADDE1] max-sm:!bg-transparent dark:max-sm:!border-white/[0.16]' : ''
      }`}
    >
      <div className="relative aspect-[5/4] w-full shrink-0 overflow-hidden bg-black/[0.04] dark:bg-white/[0.04]">
        <Link href={viewHref} className="block h-full w-full">
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
            <div className="flex h-full items-center justify-center text-[14px] text-neutral-400 dark:text-neutral-500">
              Preview unavailable
            </div>
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.type !== 'PHYSICAL' ? (
            <span className={OVERLAY_CHIP}>{PRODUCT_TYPE_LABELS[product.type] ?? product.type}</span>
          ) : null}
          {product.videoResolution ? <span className={OVERLAY_CHIP}>{product.videoResolution}</span> : null}
        </div>

        {canManageFlags ? (
          <div className="absolute right-3 top-3 z-10 flex flex-row items-center gap-1.5">
            {onTogglePin ? (
              <button
                type="button"
                disabled={isFlagBusy}
                title={product.isPinned ? 'Unpin' : 'Pin to top'}
                aria-label={product.isPinned ? 'Unpin product' : 'Pin product to top'}
                aria-pressed={Boolean(product.isPinned)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTogglePin(product);
                }}
                className={`${FLAG_BUTTON} ${
                  product.isPinned
                    ? 'text-[#FF5722] opacity-100'
                    : 'text-neutral-600 opacity-0 hover:text-[#FF5722] group-hover:opacity-100 dark:text-neutral-300'
                }`}
              >
                <FontAwesomeIcon icon={faThumbtack} className="h-3 w-3" />
              </button>
            ) : null}
            {product.isBestseller ? (
              <span title={shopRankLabel ?? undefined} className={`${FLAG_BUTTON} text-amber-500`}>
                <FontAwesomeIcon icon={faCrown} className="h-3 w-3" />
              </span>
            ) : null}
            {onToggleProfileVisibility ? (
              <button
                type="button"
                disabled={isFlagBusy}
                title={hiddenFromProfile ? 'Show on profile' : 'Hide from profile'}
                aria-label={hiddenFromProfile ? 'Show product on profile' : 'Hide product from profile'}
                aria-pressed={hiddenFromProfile}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleProfileVisibility(product);
                }}
                className={`${FLAG_BUTTON} ${
                  hiddenFromProfile
                    ? 'text-[#111111] opacity-100 dark:text-white'
                    : 'text-neutral-600 opacity-0 hover:text-[#FF5722] group-hover:opacity-100 dark:text-neutral-300'
                }`}
              >
                <FontAwesomeIcon icon={hiddenFromProfile ? faEyeSlash : faEye} className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        ) : product.isPinned || product.isBestseller ? (
          <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-row items-center gap-1.5">
            {product.isPinned ? (
              <span className={`${FLAG_BUTTON} text-[#FF5722]`}>
                <FontAwesomeIcon icon={faThumbtack} className="h-3 w-3" />
              </span>
            ) : null}
            {product.isBestseller ? (
              <span title={shopRankLabel ?? undefined} className={`${FLAG_BUTTON} text-amber-500`}>
                <FontAwesomeIcon icon={faCrown} className="h-3 w-3" />
              </span>
            ) : null}
          </div>
        ) : null}

        {showDuration ? (
          <div className="pointer-events-none absolute bottom-3 left-3">
            <span className={`${OVERLAY_CHIP} inline-flex items-center gap-1`}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatVideoDuration(product.videoDurationSeconds!)}
            </span>
          </div>
        ) : null}

        {stock != null ? (
          <div className="pointer-events-none absolute bottom-3 left-3">
            <span className={`${OVERLAY_CHIP} inline-flex items-center gap-1.5`}>
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${
                  stock === 0 ? 'bg-red-400' : stock <= LOW_STOCK_THRESHOLD ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              {stock === 0 ? 'Out of stock' : `${stock.toLocaleString('en-US')} in stock`}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 text-[15px] text-neutral-500 dark:text-neutral-400">
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${product.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`}
            />
            {product.isPublished ? 'Published' : 'Draft'}
            {!readOnly && hiddenFromProfile ? (
              <span className="inline-flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500">
                <span aria-hidden>·</span>
                <FontAwesomeIcon icon={faEyeSlash} className="h-3 w-3" aria-hidden />
                Hidden from profile
              </span>
            ) : null}
          </span>
          <div className="flex shrink-0 items-center gap-3">
            <ProductCardEngagementStrip
              productId={product.id}
              initialLikes={product.likes ?? 0}
              views={product.views ?? 0}
              showLikeButton={false}
            />
            {product.averageRating != null && product.reviewCount != null && product.reviewCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-medium">
                <svg className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.176 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.047 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                </svg>
                {product.averageRating.toFixed(1)} ({product.reviewCount})
              </span>
            ) : null}
          </div>
        </div>

        <Link
          href={viewHref}
          className="line-clamp-2 text-[19px] font-semibold leading-snug tracking-[-0.01em] text-[#111111] transition-colors duration-200 group-hover:text-[#FF5722] dark:text-white"
          title={product.title}
        >
          {product.title}
        </Link>

        {rankLabels.length > 0 ? (
          <p className="-mt-1.5 flex flex-wrap items-center gap-x-2 text-[14px] font-medium text-amber-600 dark:text-amber-400">
            <FontAwesomeIcon icon={faCrown} className="h-3 w-3" aria-hidden />
            {rankLabels.join(' · ')}
          </p>
        ) : null}

        {labels.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {labels.map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="rounded-full border border-black/[0.08] px-2.5 py-0.5 text-[14px] lowercase text-neutral-600 dark:border-white/[0.1] dark:text-neutral-300"
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-black/[0.06] pt-4 dark:border-white/[0.06]">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
            {hasDiscount ? (
              <span className="text-[15px] text-neutral-400 line-through dark:text-neutral-500">
                {formatPrice(product.compareAtPriceCents!, product.currency)}
              </span>
            ) : null}
            <span className="text-[18px] font-semibold text-[#111111] dark:text-white">
              {formatPrice(product.priceCents, product.currency)}
            </span>
          </div>
          {!readOnly && onTogglePublish ? (
            <button
              type="button"
              disabled={isPublishing}
              onClick={() => onTogglePublish(product)}
              className={`shrink-0 rounded-lg px-4 py-2 text-[15px] font-medium transition disabled:opacity-60 ${
                product.isPublished
                  ? 'border border-black/[0.12] text-[#111111] hover:border-black/25 dark:border-white/[0.12] dark:text-white dark:hover:border-white/25'
                  : 'bg-[#111111] text-white hover:opacity-85 dark:bg-white dark:text-[#111111]'
              }`}
            >
              {isPublishing ? 'Updating…' : product.isPublished ? 'Unpublish' : 'Publish'}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
