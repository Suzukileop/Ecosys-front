'use client';

import { localeTag } from '@/lib/i18n/active';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faEye, faHeart, faStar, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { formatPrice } from '@/lib/marketplace-api';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { CreatorProductActionsMenu } from '@/components/creator/CreatorProductActionsMenu';
import {
  CREATOR_EYEBROW,
  CreatorProductStatus,
  creatorProductMeta,
  stockDotClass,
  stockLabel,
} from '@/components/creator/CreatorProductCard';
import { creatorProductViewPath } from '@/lib/creator-product-nav';
import type { MarketplaceProductSummary } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

const PUBLISH_PILL =
  'inline-flex h-9 shrink-0 items-center rounded-full bg-[color:var(--gn-primary)] px-4 text-[14px] font-semibold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] disabled:opacity-50';

/** One figure of the row's numbers column: an icon, the value, tabular. */
function Figure({ icon, value, label }: { icon: typeof faHeart; value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1" title={label}>
      <FontAwesomeIcon icon={icon} className="h-3 w-3" aria-hidden />
      <span className="tabular-nums">{value.toLocaleString(localeTag())}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * My products' "List" view — the seller's working view: one product per row, every number that
 * matters at a glance (status, stock, sold, likes, views, rating), the price on a right rail, then
 * the row's one action (Publish, on a draft) and ⋮. It reads like a My services row: media left, a
 * small-caps eyebrow over the title, the fixed price column. Phones: a compact row, figures wrap.
 */
export function CreatorProductListRow({
  product,
  publishingId = null,
  flagBusyId = null,
  onTogglePublish,
  onTogglePin,
  onToggleProfileVisibility,
}: {
  product: MarketplaceProductSummary;
  publishingId?: string | null;
  flagBusyId?: string | null;
  onTogglePublish?: (product: MarketplaceProductSummary) => void;
  onTogglePin?: (product: MarketplaceProductSummary) => void;
  onToggleProfileVisibility?: (product: MarketplaceProductSummary) => void;
}) {
  const t = useT();
  const viewHref = creatorProductViewPath(product.id, 'products');
  const { eyebrow, rankLabels, stock, hasDiscount, rating, hiddenFromProfile } = creatorProductMeta(product);
  const isPublishing = publishingId === product.id;
  const sold = product.salesCount ?? 0;

  return (
    <article
      // `!` on the fills: the theme's `.news-theme article` rule paints articles itself.
      className="group relative flex items-start gap-3 !rounded-none !bg-[color:var(--gn-surface)] p-3 transition-colors duration-200 hover:!bg-[color:var(--gn-hover-strong,var(--gn-hover))] sm:items-center sm:gap-5 sm:p-4"
    >
      <Link
        href={viewHref}
        tabIndex={-1}
        aria-hidden
        className="relative block aspect-square w-20 shrink-0 overflow-hidden bg-[#EFF3F4] dark:bg-[#202327] sm:aspect-[4/3] sm:w-36 md:w-44"
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
        {product.isPinned ? (
          <span title={t('Pinned')} className="absolute left-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-[#0F1419] dark:bg-black/80 dark:text-[#E7E9EA]">
            <FontAwesomeIcon icon={faThumbtack} className="h-2.5 w-2.5" />
          </span>
        ) : null}
      </Link>

      <div className="min-w-0 flex-1">
        {eyebrow ? <p className={CREATOR_EYEBROW}>{eyebrow}</p> : null}
        <h3 className="mt-0.5 line-clamp-2 text-[16px] font-bold leading-[22px] tracking-[-0.01em] text-[color:var(--gn-ink)] sm:line-clamp-1 sm:text-[17px]">
          <Link
            href={viewHref}
            className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-[color:var(--gn-ring)]"
          >
            {product.title}
          </Link>
        </h3>
        {rankLabels.length > 0 ? (
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[13px] font-semibold leading-[18px] text-[color:var(--gn-ink)]">
            <FontAwesomeIcon icon={faCrown} className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">{rankLabels.join(' · ')}</span>
          </p>
        ) : null}

        {/* Phones: the price under the title. */}
        <p className="mt-1.5 flex items-baseline gap-2 sm:hidden">
          <span className="text-[16px] font-extrabold tabular-nums text-[color:var(--gn-ink)]">
            {formatPrice(product.priceCents, product.currency)}
          </span>
          {hasDiscount ? (
            <span className="text-[13px] tabular-nums text-[color:var(--gn-ink3)] line-through">
              {formatPrice(product.compareAtPriceCents!, product.currency)}
            </span>
          ) : null}
        </p>

        <p className="relative z-10 mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
          <CreatorProductStatus product={product} hiddenFromProfile={hiddenFromProfile} />
          {stock != null ? (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${stockDotClass(stock)}`} />
              {stockLabel(stock)}
            </span>
          ) : null}
          {sold > 0 ? <span className="tabular-nums">{t('{toLocaleString} sold', { toLocaleString: sold.toLocaleString(localeTag()) })}</span> : null}
          <Figure icon={faHeart} value={product.likes ?? 0} label="likes" />
          <Figure icon={faEye} value={product.views ?? 0} label="views" />
          {rating ? (
            <span className="inline-flex items-center gap-1">
              <FontAwesomeIcon icon={faStar} className="h-3 w-3 text-[#FFB400]" aria-hidden />
              <span className="font-semibold tabular-nums text-[color:var(--gn-ink)]">{rating.value.toFixed(1)}</span>
              <span className="tabular-nums">({rating.count})</span>
            </span>
          ) : null}
        </p>
      </div>

      {/* From sm: the price on one right rail (fixed width, as on My services). */}
      <div className="hidden w-32 shrink-0 flex-col items-end gap-0.5 text-right sm:flex">
        <span className={CREATOR_EYEBROW}>{t('Price')}</span>
        <span className="max-w-full truncate text-[17px] font-extrabold leading-[22px] tabular-nums text-[color:var(--gn-ink)]">
          {formatPrice(product.priceCents, product.currency)}
        </span>
        {hasDiscount ? (
          <span className="text-[13px] tabular-nums text-[color:var(--gn-ink3)] line-through">
            {formatPrice(product.compareAtPriceCents!, product.currency)}
          </span>
        ) : null}
      </div>

      <div className="relative z-10 -mr-1 flex shrink-0 items-center gap-1 sm:mr-0">
        {!product.isPublished && onTogglePublish ? (
          <button
            type="button"
            disabled={isPublishing}
            onClick={() => onTogglePublish(product)}
            className={`${PUBLISH_PILL} hidden sm:inline-flex`}
          >
            {isPublishing ? t('Publishing…') : t('Publish')}
          </button>
        ) : null}
        <CreatorProductActionsMenu
          product={product}
          busy={isPublishing || flagBusyId === product.id}
          onTogglePublish={onTogglePublish}
          onTogglePin={onTogglePin}
          onToggleProfileVisibility={onToggleProfileVisibility}
        />
      </div>
    </article>
  );
}
