'use client';

import { localeTag, tr } from '@/lib/i18n/active';
import { ProductStatusBadges } from '@/components/marketplace/ProductStatusBadges';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faEyeSlash, faStar, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import {
  collectProductLabels,
  formatPrice,
  formatVideoDuration,
  isFreeProduct,
  productTypeName,
} from '@/lib/marketplace-api';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { DEFAULT_PHYSICAL_STOCK, LOW_STOCK_THRESHOLD, physicalStockQuantity } from '@/lib/product-stock';
import { ProductCardEngagementStrip } from '@/components/marketplace/ProductCardEngagementStrip';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { CreatorProductActionsMenu } from '@/components/creator/CreatorProductActionsMenu';
import type { MarketplaceProductSummary } from '@/types/marketplace';
import { creatorProductViewPath, type CreatorProductNavFrom } from '@/lib/creator-product-nav';
import { useT } from '@/lib/i18n/I18nProvider';

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
  /** Kept for callers: cards are square, tone-only blocks everywhere now (edge to edge on phones). */
  flushOnMobile?: boolean;
};

/** The creator's grid: News / Products' rhythm — 8px apart on phones, 20px from sm. */
export const creatorProductGridClassName =
  'grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3';

const OVERLAY_CHIP = 'rounded-md bg-black/60 px-2 py-1 text-[13px] font-medium text-white backdrop-blur-sm';
const OVERLAY_ROUND =
  'inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#0F1419] dark:bg-black/80 dark:text-[#E7E9EA]';
export const CREATOR_EYEBROW = 'truncate text-[13px] leading-[18px] text-[color:var(--gn-ink2)]';
const PUBLISH_PILL =
  'inline-flex h-9 shrink-0 items-center rounded-full bg-[color:var(--gn-primary)] px-4 text-[14px] font-semibold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] disabled:opacity-50';

/** What a creator card / row shows besides the title — shared by the grid card and the list row. */
export function creatorProductMeta(product: MarketplaceProductSummary) {
  const { genre } = collectProductLabels(product);
  const eyebrow = genre || (product.type !== 'PHYSICAL' ? productTypeName(product.type, product.typeLabel) : null);
  const shopRankLabel = product.bestsellerRank ? tr('#{rank} best seller', { rank: product.bestsellerRank }) : null;
  const rankLabels = [
    ...(shopRankLabel ? [shopRankLabel] : []),
    ...(product.catalogueBestsellers ?? []).map((entry) => tr('#{rank} in {catalogue}', { rank: entry.rank, catalogue: entry.catalogueName })),
  ];
  const stockQuantity = physicalStockQuantity(product);
  const stock = stockQuantity != null && stockQuantity !== DEFAULT_PHYSICAL_STOCK ? stockQuantity : null;
  const hasDiscount =
    !isFreeProduct(product.priceCents) &&
    product.compareAtPriceCents != null &&
    product.compareAtPriceCents > product.priceCents;
  const rating =
    product.averageRating != null && product.reviewCount != null && product.reviewCount > 0
      ? { value: product.averageRating, count: product.reviewCount }
      : null;
  return {
    eyebrow,
    shopRankLabel,
    rankLabels,
    stock,
    hasDiscount,
    rating,
    hiddenFromProfile: product.showOnProfile === false,
  };
}

/** Stock as a dot + words: green in stock, amber low, red out — the status dots' semantics. */
export function stockDotClass(stock: number) {
  return stock === 0 ? 'bg-[#F4212E]' : stock <= LOW_STOCK_THRESHOLD ? 'bg-[#FFAD1F]' : 'bg-[#00BA7C]';
}

export function stockLabel(stock: number) {
  return stock === 0 ? tr('Out of stock') : tr('{count} in stock', { count: stock.toLocaleString(localeTag()) });
}

/** "● Published · Hidden from profile" — My services' status line. */
export function CreatorProductStatus({
  product,
  hiddenFromProfile,
  showHidden = true,
}: {
  product: MarketplaceProductSummary;
  hiddenFromProfile: boolean;
  showHidden?: boolean;
}) {
  const t = useT();
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${product.isPublished ? 'bg-[#00BA7C]' : 'bg-[#FFAD1F]'}`} />
      {product.isPublished ? t('Published') : t('Draft')}
      {showHidden && hiddenFromProfile ? (
        <>
          <span aria-hidden>·</span>
          <FontAwesomeIcon icon={faEyeSlash} className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{t('Hidden')}</span>
        </>
      ) : null}
    </span>
  );
}

/**
 * A creator's product card — the public product card's anatomy (4:3 media, small-caps eyebrow,
 * title, price then the struck-through one) plus what managing needs: the status line, stock on
 * the media, the best-seller rank in ink (no gold), and one action. A draft shows "Publish"; every
 * other action (Edit, Pin, profile visibility, Unpublish) sits behind ⋮.
 */
export function CreatorProductCard({
  product,
  readOnly = false,
  from = 'products',
  publishingId = null,
  flagBusyId = null,
  onTogglePublish,
  onTogglePin,
  onToggleProfileVisibility,
}: CreatorProductCardProps) {
  const t = useT();
  const isVideo = product.type === 'VIDEO';
  const hasVideoThumbnail = isVideoThumbnailUrl(product.thumbnailUrl);
  const isPublishing = publishingId === product.id;
  const isFlagBusy = flagBusyId === product.id;
  const viewHref = creatorProductViewPath(product.id, from);
  const showDuration =
    (isVideo || hasVideoThumbnail) && product.videoDurationSeconds != null && product.videoDurationSeconds > 0;
  const { eyebrow, shopRankLabel, rankLabels, stock, hasDiscount, rating, hiddenFromProfile } = creatorProductMeta(product);
  const manageable = !readOnly && Boolean(onTogglePublish || onTogglePin || onToggleProfileVisibility);

  return (
    <article
      // `!` on the fills: the theme's `.news-theme article` rule paints articles itself.
      className="group relative flex w-full flex-col overflow-visible !rounded-none !bg-[color:var(--gn-surface)] transition-colors duration-200"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#EFF3F4] dark:bg-[#202327]">
        <Link href={viewHref} className="block h-full w-full" tabIndex={-1} aria-hidden>
          {product.thumbnailUrl ? (
            <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105">
              <ProductThumbnailMedia url={product.thumbnailUrl} autoPlay={hasVideoThumbnail} fit="cover" className="h-full w-full" />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-[13px] text-[color:var(--gn-ink2)]">{t('No preview')}</div>
          )}
        </Link>

        {(product.statusLabels?.length ?? 0) > 0 || product.videoResolution ? (
          <div className="pointer-events-none absolute left-3 right-24 top-3 flex flex-wrap gap-1.5">
            <ProductStatusBadges labels={product.statusLabels} />
            {product.videoResolution ? <span className={OVERLAY_CHIP}>{product.videoResolution}</span> : null}
          </div>
        ) : null}

        {product.isPinned || product.isBestseller ? (
          <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5">
            {product.isPinned ? (
              <span title={t('Pinned')} className={OVERLAY_ROUND}>
                <FontAwesomeIcon icon={faThumbtack} className="h-3 w-3" />
              </span>
            ) : null}
            {product.isBestseller ? (
              <span title={shopRankLabel ?? t('Best seller')} className={OVERLAY_ROUND}>
                <FontAwesomeIcon icon={faCrown} className="h-3 w-3" />
              </span>
            ) : null}
          </div>
        ) : null}

        {stock != null || showDuration ? (
          <div className="pointer-events-none absolute bottom-3 left-3 flex gap-1.5">
            {stock != null ? (
              <span className={`${OVERLAY_CHIP} inline-flex items-center gap-1.5`}>
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${stockDotClass(stock)}`} />
                {stockLabel(stock)}
              </span>
            ) : null}
            {showDuration ? (
              <span className={OVERLAY_CHIP}>{formatVideoDuration(product.videoDurationSeconds!)}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4 sm:p-5">
        {eyebrow ? <p className={CREATOR_EYEBROW}>{eyebrow}</p> : null}
        <Link
          href={viewHref}
          className="line-clamp-2 text-[16px] font-semibold leading-[22px] tracking-[-0.01em] text-[color:var(--gn-ink)] decoration-[1.5px] underline-offset-4 hover:underline"
          title={product.title}
        >
          {product.title}
        </Link>

        <div className="flex min-w-0 items-center justify-between gap-3 text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
          <CreatorProductStatus product={product} hiddenFromProfile={!readOnly && hiddenFromProfile} />
          <span className="flex shrink-0 items-center gap-3">
            <ProductCardEngagementStrip
              productId={product.id}
              initialLikes={product.likes ?? 0}
              views={product.views ?? 0}
              showLikeButton={false}
            />
            {rating ? (
              <span className="inline-flex items-center gap-1">
                <FontAwesomeIcon icon={faStar} className="h-3 w-3 text-[#FFB400]" />
                <span className="font-semibold tabular-nums text-[color:var(--gn-ink)]">{rating.value.toFixed(1)}</span>
                <span className="tabular-nums">({rating.count})</span>
              </span>
            ) : null}
          </span>
        </div>

        {rankLabels.length > 0 ? (
          <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-semibold leading-[18px] text-[color:var(--gn-ink)]">
            <FontAwesomeIcon icon={faCrown} className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">{rankLabels.join(' · ')}</span>
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <p className="flex min-w-0 items-baseline gap-2">
            <span className="text-[17px] font-bold leading-[22px] tabular-nums text-[color:var(--gn-ink)]">
              {formatPrice(product.priceCents, product.currency)}
            </span>
            {hasDiscount ? (
              <span className="text-[13px] tabular-nums text-[color:var(--gn-ink3)] line-through">
                {formatPrice(product.compareAtPriceCents!, product.currency)}
              </span>
            ) : null}
          </p>
          {manageable ? (
            <div className="-mr-1.5 flex shrink-0 items-center gap-1">
              {!product.isPublished && onTogglePublish ? (
                <button type="button" disabled={isPublishing} onClick={() => onTogglePublish(product)} className={PUBLISH_PILL}>
                  {isPublishing ? t('Publishing…') : t('Publish')}
                </button>
              ) : null}
              <CreatorProductActionsMenu
                product={product}
                from={from}
                busy={isPublishing || isFlagBusy}
                onTogglePublish={onTogglePublish}
                onTogglePin={onTogglePin}
                onToggleProfileVisibility={onToggleProfileVisibility}
              />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
