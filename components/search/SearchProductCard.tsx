'use client';

import Link from 'next/link';
import { collectProductLabels, formatPrice, isFreeProduct } from '@/lib/marketplace-api';
import { ProductFavoriteButton } from '@/components/marketplace/ProductFavoriteButton';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import type { MarketplaceProductSummary } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

type SearchProductCardProps = {
  product: MarketplaceProductSummary;
};

export function SearchProductCard({ product }: SearchProductCardProps) {
  const t = useT();
  const href = `/marketplace/products/${product.id}`;
  const { genre, tags } = collectProductLabels(product);
  const displayTags = tags.slice(0, 2);
  const isFree = isFreeProduct(product.priceCents);
  const priceLabel = isFree ? t('Free') : formatPrice(product.priceCents, product.currency);

  return (
    /* A News block: square, tone only; the price is the one solid ink label, tags are plain meta. */
    <article className="gn-card group flex w-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#EFF3F4] dark:bg-[#202327]">
        <Link href={href} className="block h-full w-full">
          {product.thumbnailUrl ? (
            <ProductThumbnailMedia
              url={product.thumbnailUrl}
              fit="cover"
              zoomOnHover
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[14px] text-[#536471] dark:text-[#8B98A5]">
              {t('Preview unavailable')}
            </div>
          )}
        </Link>

        <div className="absolute right-3 top-3" onClick={(e) => e.preventDefault()}>
          <ProductFavoriteButton productId={product.id} variant="bookmark" size="sm" />
        </div>

        <span className="pointer-events-none absolute bottom-3 left-3 bg-[#0F1419] px-2.5 py-1 text-[13px] font-bold leading-[18px] text-white">
          {priceLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-5 pb-5 pt-4">
        <Link
          href={href}
          className="line-clamp-2 text-[16px] font-bold leading-[22px] text-[color:var(--gn-ink)] underline-offset-2 hover:underline"
          title={product.title}
        >
          {product.title}
        </Link>

        {product.creatorName ? (
          <Link
            href={product.creatorId ? `/providers/${product.creatorId}` : href}
            className="truncate text-[14px] leading-5 text-[color:var(--gn-ink2)] hover:text-[color:var(--gn-ink)]"
          >
            {product.creatorName}
          </Link>
        ) : null}

        {(genre || displayTags.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[genre, ...displayTags].filter(Boolean).map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className="bg-[color:var(--gn-inset)] px-2 py-0.5 text-[13px] leading-[18px] text-[color:var(--gn-ink2)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/** One column on phones (edge to edge, 8px apart), two from sm, three from xl — beside the 340 / 400px
    rail the main column is too narrow for three before xl. */
export const searchProductGridClassName =
  'grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3';
