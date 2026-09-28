'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import {
  collectProductLabels,
  formatPrice,
  formatVideoDuration,
  isFreeProduct,
  PRODUCT_TYPE_LABELS,
} from '@/lib/marketplace-api';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
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
  onToggleBestseller?: (product: MarketplaceProductSummary) => void;
};

export const creatorProductGridClassName =
  'grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';

const OVERLAY_CHIP = 'rounded-md bg-black/60 px-2 py-1 text-[13px] font-medium text-white backdrop-blur-sm';
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
  onToggleBestseller,
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
  const canManageFlags = !readOnly && (onTogglePin || onToggleBestseller);

  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-lg border border-black/[0.06] bg-white transition-colors duration-300 hover:border-black/[0.12] dark:border-white/[0.08] dark:bg-[#111111] dark:hover:border-white/[0.16]">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-black/[0.04] dark:bg-white/[0.04]">
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
            {onToggleBestseller ? (
              <button
                type="button"
                disabled={isFlagBusy}
                title={product.isBestseller ? 'Remove bestseller' : 'Mark as bestseller'}
                aria-label={product.isBestseller ? 'Remove bestseller' : 'Mark as bestseller'}
                aria-pressed={Boolean(product.isBestseller)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleBestseller(product);
                }}
                className={`${FLAG_BUTTON} ${
                  product.isBestseller
                    ? 'text-amber-500 opacity-100'
                    : 'text-neutral-600 opacity-0 hover:text-amber-500 group-hover:opacity-100 dark:text-neutral-300'
                }`}
              >
                <FontAwesomeIcon icon={faCrown} className="h-3 w-3" />
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
              <span className={`${FLAG_BUTTON} text-amber-500`}>
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
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3 text-[14px] text-neutral-500 dark:text-neutral-400">
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${product.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`}
            />
            {product.isPublished ? 'Published' : 'Draft'}
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
          className="line-clamp-2 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-[#111111] transition-colors duration-200 group-hover:text-[#FF5722] dark:text-white"
          title={product.title}
        >
          {product.title}
        </Link>

        {labels.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {labels.map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="rounded-full border border-black/[0.08] px-2.5 py-0.5 text-[13px] lowercase text-neutral-600 dark:border-white/[0.1] dark:text-neutral-300"
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-black/[0.06] pt-4 dark:border-white/[0.06]">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
            {hasDiscount ? (
              <span className="text-[14px] text-neutral-400 line-through dark:text-neutral-500">
                {formatPrice(product.compareAtPriceCents!, product.currency)}
              </span>
            ) : null}
            <span className="text-base font-semibold text-[#111111] dark:text-white">
              {formatPrice(product.priceCents, product.currency)}
            </span>
          </div>
          {!readOnly && onTogglePublish ? (
            <button
              type="button"
              disabled={isPublishing}
              onClick={() => onTogglePublish(product)}
              className={`shrink-0 rounded-lg px-3.5 py-2 text-[14px] font-medium transition disabled:opacity-60 ${
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
