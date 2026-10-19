'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faCrown, faStar, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { collectProductLabels, formatPrice, isFreeProduct, productTypeName } from '@/lib/marketplace-api';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { useAuth } from '@/context/AuthContext';
import { setPendingProductDraft } from '@/lib/chat-product-draft';
import { ProductCardEngagementStrip } from '@/components/marketplace/ProductCardEngagementStrip';
import { ProductFavoriteButton } from '@/components/marketplace/ProductFavoriteButton';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import type { MarketplaceProductSummary } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

/** Physical stock at or under this shows "Only N left". */
const LOW_STOCK = 5;

const EYEBROW = 'truncate text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-[color:var(--gn-ink2)]';
const ICON_BUTTON =
  'inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)]';

/**
 * The Products page's "List" view — one product per row, to compare rather than browse. It reads
 * like a My services row (media left, a small-caps eyebrow over the title, a fixed price column on
 * a right rail, actions last) and shows what a grid card has no room for: the description, the
 * rating, units sold, low stock and the discount. Phones: a compact row — a square thumbnail, the
 * title and price beside it.
 */
export function ProductListRow({
  product,
  initialFavorited,
  onFavoritedChange,
  initialLiked,
  onLikedChange,
}: {
  product: MarketplaceProductSummary;
  initialFavorited?: boolean;
  onFavoritedChange?: (productId: string, favorited: boolean) => void;
  initialLiked?: boolean;
  onLikedChange?: (productId: string, liked: boolean) => void;
}) {
  const t = useT();
  const { user } = useAuth();
  const href = `/marketplace/products/${product.id}`;
  const { genre } = collectProductLabels(product);
  const eyebrow = genre || (product.type && product.type !== 'PHYSICAL' ? productTypeName(product.type, product.typeLabel) : null);
  const authorName = product.creatorName?.trim() || null;
  const shopName = product.shopName?.trim() || null;
  const description = product.description?.trim() || null;

  const free = isFreeProduct(product.priceCents);
  const hasDiscount = !free && product.compareAtPriceCents != null && product.compareAtPriceCents > product.priceCents;
  const discountPct = hasDiscount
    ? Math.round((1 - product.priceCents / (product.compareAtPriceCents as number)) * 100)
    : 0;
  const priceEyebrow = free ? t('Free') : hasDiscount ? `−${discountPct}%` : t('Price');

  const rating = product.reviewCount && product.averageRating ? product.averageRating : null;
  const sold = product.salesCount && product.salesCount > 0 ? product.salesCount : null;
  const stock = product.type === 'PHYSICAL' && product.stockQuantity != null ? product.stockQuantity : null;
  const stockNote = stock == null ? null : stock <= 0 ? t('Out of stock') : stock <= LOW_STOCK ? `Only ${stock} left` : null;

  const isOwnProduct = Boolean(user?.id && user.id === product.creatorId);
  const discussionPath = `/messages?user=${encodeURIComponent(product.creatorId)}&product=${encodeURIComponent(product.id)}`;
  const messageHref = user ? discussionPath : `/login?redirect=${encodeURIComponent(discussionPath)}`;
  const messageLabel = authorName ? `Message ${authorName}` : t('Message creator');

  return (
    <article
      // `!` on the fills: the theme's `.news-theme article` rule paints articles itself.
      className="group relative flex items-start gap-3 !rounded-none !bg-[color:var(--gn-surface)] p-3 transition-colors duration-200 hover:!bg-[color:var(--gn-hover-strong,var(--gn-hover))] sm:items-center sm:gap-5 sm:p-4"
    >
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className="relative block aspect-square w-24 shrink-0 overflow-hidden bg-[#EFF3F4] dark:bg-[#202327] sm:aspect-[4/3] sm:w-44 md:w-52"
      >
        {product.thumbnailUrl ? (
          <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]">
            <ProductThumbnailMedia
              url={product.thumbnailUrl}
              autoPlay={isVideoThumbnailUrl(product.thumbnailUrl)}
              fit="cover"
              className="h-full w-full"
            />
          </div>
        ) : (
          <span className="flex h-full items-center justify-center text-[12px] text-[color:var(--gn-ink2)]">{t('No preview')}</span>
        )}
        {product.isBestseller || product.isPinned ? (
          <span className="absolute left-2 top-2 flex gap-1">
            {product.isPinned ? (
              <span title={t('Pinned')} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-[#0F1419] dark:bg-black/80 dark:text-[#E7E9EA]">
                <FontAwesomeIcon icon={faThumbtack} className="h-2.5 w-2.5" />
              </span>
            ) : null}
            {product.isBestseller ? (
              <span title={t('Bestseller')} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-[#0F1419] dark:bg-black/80 dark:text-[#E7E9EA]">
                <FontAwesomeIcon icon={faCrown} className="h-2.5 w-2.5" />
              </span>
            ) : null}
          </span>
        ) : null}
      </Link>

      <div className="min-w-0 flex-1">
        {eyebrow ? <p className={EYEBROW}>{eyebrow}</p> : null}
        <h3 className="mt-0.5 line-clamp-2 text-[16px] font-bold leading-[22px] tracking-[-0.01em] text-[color:var(--gn-ink)] sm:line-clamp-1 sm:text-[17px]">
          {/* The title is the row's link; it stretches over the whole row. */}
          <Link
            href={href}
            className="outline-hidden after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-[color:var(--gn-ring)]"
          >
            {product.title}
          </Link>
        </h3>
        {authorName || shopName ? (
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
            {authorName ? (
              <Link
                href={`/providers/${product.creatorId}`}
                className="relative z-10 truncate font-medium underline-offset-2 hover:text-[color:var(--gn-ink)] hover:underline"
              >
                {authorName}
              </Link>
            ) : null}
            {authorName && shopName ? <span aria-hidden>·</span> : null}
            {shopName ? <span className="truncate">{shopName}</span> : null}
          </p>
        ) : null}
        {description ? (
          <div className="mt-1.5 hidden sm:block">
            <p className="line-clamp-2 text-[14px] leading-5 text-[color:var(--gn-ink2)]">{description}</p>
          </div>
        ) : null}

        {/* Phones: the price under the title (no room for a price column). */}
        <p className="mt-2 flex items-baseline gap-2 sm:hidden">
          <span className="text-[16px] font-extrabold tabular-nums text-[color:var(--gn-ink)]">
            {formatPrice(product.priceCents, product.currency)}
          </span>
          {hasDiscount ? (
            <span className="text-[13px] tabular-nums text-[color:var(--gn-ink3)] line-through">
              {formatPrice(product.compareAtPriceCents as number, product.currency)}
            </span>
          ) : null}
        </p>

        <div className="relative z-10 mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
          {rating != null ? (
            <span className="inline-flex items-center gap-1">
              <FontAwesomeIcon icon={faStar} className="h-3 w-3 text-[#FFB400]" />
              <span className="font-semibold tabular-nums text-[color:var(--gn-ink)]">{rating.toFixed(1)}</span>
              <span className="tabular-nums">({product.reviewCount})</span>
            </span>
          ) : null}
          {sold != null ? <span className="tabular-nums">{t('{sold} sold', { sold })}</span> : null}
          {stockNote ? <span className="font-semibold text-[color:var(--gn-ink)]">{stockNote}</span> : null}
          <ProductCardEngagementStrip
            productId={product.id}
            initialLikes={product.likes ?? 0}
            initialLiked={initialLiked}
            onLikedChange={(liked) => onLikedChange?.(product.id, liked)}
            views={product.views ?? 0}
          />
        </div>
      </div>

      {/* From sm: the price column on one right rail (a fixed width, as on My services). */}
      <div className="hidden w-36 shrink-0 flex-col items-end gap-0.5 text-right sm:flex">
        <span className={EYEBROW}>{priceEyebrow}</span>
        <span className="max-w-full truncate text-[17px] font-extrabold leading-[22px] tabular-nums text-[color:var(--gn-ink)]">
          {formatPrice(product.priceCents, product.currency)}
        </span>
        {hasDiscount ? (
          <span className="text-[13px] tabular-nums text-[color:var(--gn-ink3)] line-through">
            {formatPrice(product.compareAtPriceCents as number, product.currency)}
          </span>
        ) : null}
      </div>

      <div className="relative z-10 -mr-1 flex shrink-0 flex-col items-center gap-0.5 sm:mr-0">
        <ProductFavoriteButton
          productId={product.id}
          initialFavorited={initialFavorited}
          onFavoritedChange={(favorited) => onFavoritedChange?.(product.id, favorited)}
          variant="bookmark"
          size="sm"
          tone="plain"
        />
        {!isOwnProduct ? (
          <Link
            href={messageHref}
            onClick={() => setPendingProductDraft(product.creatorId, product.id)}
            title={messageLabel}
            aria-label={messageLabel}
            className={ICON_BUTTON}
          >
            <FontAwesomeIcon icon={faComment} className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
