'use client';

import Link from 'next/link';
import { collectProductLabels, formatPrice, isFreeProduct } from '@/lib/marketplace-api';
import { ProductFavoriteButton } from '@/components/marketplace/ProductFavoriteButton';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import type { MarketplaceProductSummary } from '@/types/marketplace';

type SearchProductCardProps = {
  product: MarketplaceProductSummary;
};

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

export function SearchProductCard({ product }: SearchProductCardProps) {
  const href = `/marketplace/products/${product.id}`;
  const { genre, tags } = collectProductLabels(product);
  const displayTags = tags.slice(0, 2);
  const isFree = isFreeProduct(product.priceCents);
  const priceLabel = isFree ? 'FREE' : formatPrice(product.priceCents, product.currency);
  const ctaLabel = isFree ? 'Get product' : 'Buy product';

  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <Link href={href} className="block h-full w-full">
          {product.thumbnailUrl ? (
            <ProductThumbnailMedia
              url={product.thumbnailUrl}
              fit="cover"
              zoomOnHover
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-neutral-100 text-base text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              Preview unavailable
            </div>
          )}
        </Link>

        <div className="absolute right-3 top-3" onClick={(e) => e.preventDefault()}>
          <ProductFavoriteButton productId={product.id} variant="bookmark" size="sm" />
        </div>

        <span
          className={`absolute bottom-3 left-3 rounded-lg px-3 py-1.5 text-sm font-bold text-white ${
            isFree ? 'bg-emerald-600' : 'bg-neutral-900'
          }`}
        >
          {priceLabel}
        </span>

        <Link
          href={href}
          aria-label={ctaLabel}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white transition hover:bg-orange-600"
        >
          <CartIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="min-h-14">
          <Link
            href={href}
            className="line-clamp-2 text-lg font-bold leading-snug text-neutral-900 dark:text-white"
            title={product.title}
          >
            {product.title}
          </Link>
        </div>

        {product.creatorName ? (
          <Link
            href={product.creatorId ? `/marketplace/${product.creatorId}` : href}
            className="truncate text-sm font-medium text-neutral-600 dark:text-neutral-300"
          >
            {product.creatorName}
          </Link>
        ) : null}

        {(genre || displayTags.length > 0) && (
          <div className="mt-0.5 flex flex-wrap gap-2">
            {genre ? (
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600 dark:bg-neutral-800 dark:text-orange-400">
                {genre}
              </span>
            ) : null}
            {displayTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
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

/** Max 3 columns on large screens for readability. */
export const searchProductGridClassName =
  'grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';
