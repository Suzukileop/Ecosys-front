'use client';

import { ProductStatusBadges } from '@/components/marketplace/ProductStatusBadges';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faCrown, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { collectProductLabels, formatPrice, formatVideoDuration, isFreeProduct, productTypeName } from '@/lib/marketplace-api';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { useAuth } from '@/context/AuthContext';
import { setPendingProductDraft } from '@/lib/chat-product-draft';
import { ProductCardEngagementStrip } from '@/components/marketplace/ProductCardEngagementStrip';
import { ProductFavoriteButton } from '@/components/marketplace/ProductFavoriteButton';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import type { MarketplaceProductSummary } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

/** Responsive product grid — max 3 columns so cards stay airy and titles readable. */
export const marketplaceProductGridClassName =
  'grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3';

/**
 * The Products page's grid, in the column beside its rail: two columns from sm, three once that
 * column passes ~820px (1400px viewports) so a card never drops under ~250px. Cards 8px apart on
 * phones, 20px from sm — the News / Providers rhythm.
 */
export const marketplaceRailProductGridClassName =
  'grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-5 min-[1400px]:grid-cols-3';

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

const OVERLAY_CHIP = 'rounded-md bg-black/60 px-2 py-1 text-[13px] font-medium text-white backdrop-blur-xs';

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
  const t = useT();
  const { user } = useAuth();
  const targetHref = href ?? `/marketplace/products/${product.id}`;
  const isVideo = product.type === 'VIDEO';
  const hasVideoThumbnail = isVideoThumbnailUrl(product.thumbnailUrl);
  /* One eyebrow over the title — the genre, else the digital format ("Course", "Preset") — in the
     small-caps of My services' specialty line. Tags stay for search; on the card they were noise. */
  const { genre } = collectProductLabels(product);
  const eyebrow = genre || (product.type && product.type !== 'PHYSICAL' ? productTypeName(product.type, product.typeLabel) : null);
  const shopName = product.shopName?.trim() || null;
  const authorName = product.creatorName?.trim() || null;

  const isOwnProduct = Boolean(user?.id && user.id === product.creatorId);
  const discussionPath = `/messages?user=${encodeURIComponent(product.creatorId)}&product=${encodeURIComponent(product.id)}`;
  const messageHref = user ? discussionPath : `/login?redirect=${encodeURIComponent(discussionPath)}`;
  const messageLabel = authorName ? `Message ${authorName}` : t('Message creator');

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
      data-flush={flushOnMobile ? '' : undefined}
      className="group flex w-full flex-col overflow-hidden !rounded-none border-0 bg-[color:var(--gn-surface,#F7F9F9)] dark:bg-[color:var(--gn-surface,#16181C)]"
    >
      <Link
        href={targetHref}
        className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#EFF3F4] dark:bg-[#202327]"
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
            <span className="text-[13px] text-[#536471] dark:text-[#71767B]">{t('No preview')}</span>
          </div>
        )}

        {product.videoResolution || (product.statusLabels?.length ?? 0) > 0 ? (
          <div className="pointer-events-none absolute left-3 right-28 top-3 flex flex-wrap gap-1.5">
            <ProductStatusBadges labels={product.statusLabels} />
            {product.videoResolution ? <span className={OVERLAY_CHIP}>{product.videoResolution}</span> : null}
          </div>
        ) : null}

        <div className="absolute right-3 top-3 flex items-start gap-1.5" onClick={(e) => e.preventDefault()}>
          {product.isPinned ? (
            <span
              title={t('Pinned')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fff]/95 text-[#0F1419] dark:bg-black/80 dark:text-[#E7E9EA]"
            >
              <FontAwesomeIcon icon={faThumbtack} className="h-3 w-3" />
            </span>
          ) : null}
          {product.isBestseller ? (
            <span
              title={t('Bestseller')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fff]/95 text-[#0F1419] dark:bg-black/80 dark:text-[#E7E9EA]"
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

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        {eyebrow ? (
          <p className="-mb-1.5 truncate text-[13px] leading-[18px] text-[color:var(--gn-ink2,#536471)]">
            {eyebrow}
          </p>
        ) : null}
        <Link
          href={targetHref}
          className="line-clamp-2 text-[16px] font-semibold leading-[22px] tracking-[-0.01em] text-[color:var(--gn-ink,#0F1419)] decoration-[1.5px] underline-offset-4 hover:underline"
          title={product.title}
        >
          {product.title}
        </Link>

        {showCreator && (authorName || shopName) ? (
          <p className="-mt-1 flex min-w-0 items-center gap-1.5 text-[13px] leading-[18px] text-[color:var(--gn-ink2,#536471)]">
            {authorName ? (
              <Link
                href={`/providers/${product.creatorId}`}
                className="truncate font-medium text-[color:var(--gn-ink2,#536471)] underline-offset-2 transition-colors hover:text-[color:var(--gn-ink,#0F1419)] hover:underline"
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

        <div className="mt-auto flex items-center justify-between gap-4 pt-2">
          <p className="flex min-w-0 items-baseline gap-2">
            <span className="text-[17px] font-bold leading-[22px] text-[color:var(--gn-ink,#0F1419)]">
              {formatPrice(product.priceCents, product.currency)}
            </span>
            {hasDiscount && (
              <span className="text-[13px] text-[color:var(--gn-ink3,#8B98A5)] line-through">
                {formatPrice(product.compareAtPriceCents!, product.currency)}
              </span>
            )}
          </p>
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
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--gn-ink2,#536471)] transition-colors hover:bg-[color:var(--gn-hover,rgba(15,20,25,0.06))] hover:text-[color:var(--gn-ink,#0F1419)]"
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
