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
  'grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3';

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
    <article className="group flex w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-[#1F1F1F]">
      <div className="relative h-52 w-full shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <Link href={viewHref} className="block h-full w-full">
          {product.thumbnailUrl ? (
            <ProductThumbnailMedia
              url={product.thumbnailUrl}
              autoPlay={hasVideoThumbnail}
              fit="cover"
              zoomOnHover
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
              Preview unavailable
            </div>
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.type !== 'PHYSICAL' ? (
            <span className="rounded-md bg-neutral-900/85 px-2.5 py-1 text-xs font-semibold text-white">
              {PRODUCT_TYPE_LABELS[product.type] ?? product.type}
            </span>
          ) : null}
          {product.videoResolution && (
            <span className="rounded-md bg-neutral-900/85 px-2.5 py-1 text-xs font-semibold text-white">
              {product.videoResolution}
            </span>
          )}
          {readOnly && (
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                product.isPublished
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-amber-500/90 text-white'
              }`}
            >
              {product.isPublished ? 'Published' : 'Draft'}
            </span>
          )}
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
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition disabled:opacity-60 ${
                  product.isPinned
                    ? 'bg-orange-500 text-white opacity-100'
                    : 'bg-white/95 text-neutral-700 opacity-0 shadow-md group-hover:opacity-100 hover:bg-white dark:bg-neutral-900/95 dark:text-neutral-100'
                }`}
              >
                <FontAwesomeIcon icon={faThumbtack} className="h-3.5 w-3.5" />
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
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition disabled:opacity-60 ${
                  product.isBestseller
                    ? 'bg-amber-500 text-white opacity-100'
                    : 'bg-white/95 text-neutral-700 opacity-0 shadow-md group-hover:opacity-100 hover:bg-white dark:bg-neutral-900/95 dark:text-neutral-100'
                }`}
              >
                <FontAwesomeIcon icon={faCrown} className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        ) : product.isPinned || product.isBestseller ? (
          <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-row items-center gap-1.5">
            {product.isPinned ? (
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm">
                <FontAwesomeIcon icon={faThumbtack} className="h-3.5 w-3.5" />
              </span>
            ) : null}
            {product.isBestseller ? (
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
                <FontAwesomeIcon icon={faCrown} className="h-3.5 w-3.5" />
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {showDuration && (
            <span className="flex items-center gap-1 rounded-md bg-neutral-900/85 px-2.5 py-1 text-xs font-medium text-white">
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
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-2 dark:border-neutral-800">
        <ProductCardEngagementStrip
          productId={product.id}
          initialLikes={product.likes ?? 0}
          views={product.views ?? 0}
          showLikeButton={false}
        />
        {product.averageRating != null && product.reviewCount != null && product.reviewCount > 0 && (
          <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <svg className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.176 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.047 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
            </svg>
            {product.averageRating.toFixed(1)} ({product.reviewCount})
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-2">
          <Link
            href={viewHref}
            className="line-clamp-2 text-base font-bold leading-snug text-neutral-900 transition group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400"
            title={product.title}
          >
            {product.title}
          </Link>

          {(genre || tags.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {genre && (
                <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold lowercase text-orange-800 dark:border-orange-400/40 dark:bg-orange-500/20 dark:text-orange-100">
                  {genre}
                </span>
              )}
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-xs font-medium lowercase text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-700">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {hasDiscount && (
              <span className="text-base font-medium text-neutral-500 line-through dark:text-neutral-400">
                {formatPrice(product.compareAtPriceCents!, product.currency)}
              </span>
            )}
            <span className="text-xl font-bold text-neutral-900 dark:text-white">
              {formatPrice(product.priceCents, product.currency)}
            </span>
          </div>
          {!readOnly && onTogglePublish ? (
            <button
              type="button"
              disabled={isPublishing}
              onClick={() => onTogglePublish(product)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                product.isPublished
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/35 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
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
