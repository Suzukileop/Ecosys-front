'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faCrown, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { collectProductLabels, formatPrice, formatVideoDuration, isFreeProduct } from '@/lib/marketplace-api';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { useAuth } from '@/context/AuthContext';
import { ProductCardEngagementStrip } from '@/components/marketplace/ProductCardEngagementStrip';
import { ProductFavoriteButton } from '@/components/marketplace/ProductFavoriteButton';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import type { MarketplaceProductSummary } from '@/types/marketplace';

/** Responsive product grid — max 4 columns on large screens so titles stay readable. */
export const marketplaceProductGridClassName =
  'grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

type ProductCardProps = {
  product: MarketplaceProductSummary;
  href?: string;
  showCreator?: boolean;
  initialFavorited?: boolean;
  onFavoritedChange?: (productId: string, favorited: boolean) => void;
  initialLiked?: boolean;
  onLikedChange?: (productId: string, liked: boolean) => void;
};

export function ProductCard({
  product,
  href,
  showCreator = true,
  initialFavorited,
  onFavoritedChange,
  initialLiked,
  onLikedChange,
}: ProductCardProps) {
  const { user } = useAuth();
  const targetHref = href ?? `/marketplace/products/${product.id}`;
  const isVideo = product.type === 'VIDEO';
  const hasVideoThumbnail = isVideoThumbnailUrl(product.thumbnailUrl);
  const { genre, tags } = collectProductLabels(product);
  const hasLabels = Boolean(genre) || tags.length > 0;
  const shopName = product.shopName?.trim() || null;
  const authorName = product.creatorName?.trim() || null;

  const messageHref = user
    ? `/dashboard/discussions?user=${encodeURIComponent(product.creatorId)}`
    : `/login?redirect=${encodeURIComponent(`/dashboard/discussions?user=${encodeURIComponent(product.creatorId)}`)}`;
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
    <article className="group flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-[#1F1F1F] dark:hover:shadow-neutral-900/50">
      <Link href={targetHref} className="relative block h-52 w-full shrink-0 overflow-hidden bg-gray-100 dark:bg-neutral-800">
          {product.thumbnailUrl ? (
            <ProductThumbnailMedia
              url={product.thumbnailUrl}
              autoPlay={hasVideoThumbnail}
              fit="cover"
              zoomOnHover
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-neutral-800">
              <span className="text-sm text-gray-400 dark:text-gray-500">Preview unavailable</span>
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.videoResolution && (
              <span className="rounded-md bg-gray-900/80 px-2.5 py-1 text-xs font-semibold text-white">
                {product.videoResolution}
              </span>
            )}
          </div>

          <div className="absolute right-3 top-3 flex items-start gap-1.5" onClick={(e) => e.preventDefault()}>
            {(product.isPinned || product.isBestseller) && (
              <div className="flex flex-row items-center gap-1.5">
                {product.isPinned ? (
                  <span
                    title="Pinned"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm"
                  >
                    <FontAwesomeIcon icon={faThumbtack} className="h-3 w-3" />
                  </span>
                ) : null}
                {product.isBestseller ? (
                  <span
                    title="Bestseller"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm"
                  >
                    <FontAwesomeIcon icon={faCrown} className="h-3 w-3" />
                  </span>
                ) : null}
              </div>
            )}
            <ProductFavoriteButton
              productId={product.id}
              initialFavorited={initialFavorited}
              onFavoritedChange={(favorited) => onFavoritedChange?.(product.id, favorited)}
              variant="bookmark"
              size="sm"
            />
          </div>

          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {showDuration && (
              <span className="flex items-center gap-1 rounded-md bg-gray-900/80 px-2.5 py-1 text-xs font-medium text-white">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatVideoDuration(product.videoDurationSeconds!)}
              </span>
            )}
          </div>
      </Link>

      <div className="flex justify-end px-4 py-2">
        <ProductCardEngagementStrip
          productId={product.id}
          initialLikes={product.likes ?? 0}
          initialLiked={initialLiked}
          onLikedChange={(liked) => onLikedChange?.(product.id, liked)}
          views={product.views ?? 0}
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 pt-2">
        <div className="space-y-3">
          <Link
            href={targetHref}
            className="mt-1 line-clamp-2 text-base font-bold leading-snug text-gray-900 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400 xl:line-clamp-1 xl:text-lg"
            title={product.title}
          >
            {product.title}
          </Link>

          {showCreator && (authorName || shopName) ? (
            <div className="space-y-1">
              {authorName ? (
                <Link
                  href={`/marketplace/${product.creatorId}`}
                  className="block truncate text-sm font-medium text-gray-800 hover:text-orange-600 dark:text-gray-200 dark:hover:text-orange-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  {authorName}
                </Link>
              ) : null}
              {shopName ? (
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400" title={shopName}>
                  {shopName}
                </p>
              ) : null}
            </div>
          ) : null}

          {hasLabels && (
            <div className="flex flex-wrap gap-2 pt-1">
              {genre && (
                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium lowercase text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200">
                  {genre}
                </span>
              )}
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs lowercase text-gray-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-gray-200 pt-4 dark:border-neutral-700">
          <div className="min-w-0">
            {hasDiscount && (
              <p className="text-sm text-gray-400 line-through dark:text-gray-500">
                {formatPrice(product.compareAtPriceCents!, product.currency)}
              </p>
            )}
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatPrice(product.priceCents, product.currency)}
            </p>
          </div>
          <Link
            href={messageHref}
            onClick={(e) => e.stopPropagation()}
            title={messageLabel}
            aria-label={messageLabel}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faComment} className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
