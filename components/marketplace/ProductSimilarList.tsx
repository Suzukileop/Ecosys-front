'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice, listSimilarProducts } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import type { MarketplaceProductSummary } from '@/types/marketplace';

type ProductSimilarListProps = {
  productId: string;
  genre?: string | null;
};

const SKELETON = 'animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]';

function SimilarProductSkeleton() {
  return (
    <div className="flex items-start gap-5 px-5 py-5">
      <div className={`h-[76px] w-[76px] shrink-0 rounded-md ${SKELETON}`} />
      <div className="min-w-0 flex-1 space-y-2.5 pt-1">
        <div className={`h-4 w-3/4 ${SKELETON}`} />
        <div className={`h-3.5 w-1/2 ${SKELETON}`} />
        <div className={`h-4 w-1/3 ${SKELETON}`} />
      </div>
    </div>
  );
}

export function ProductSimilarList({ productId, genre }: ProductSimilarListProps) {
  const [products, setProducts] = useState<MarketplaceProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await listSimilarProducts(productId, 6);
        if (!cancelled) {
          setProducts(items);
        }
      } catch (e) {
        if (!cancelled) {
          setError(getApiErrorMessage(e, 'Unable to load similar products.'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const browseHref = genre
    ? `/marketplace/products?genre=${encodeURIComponent(genre)}`
    : '/marketplace/products';

  return (
    <aside>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-[-0.01em] text-[#111111] dark:text-white">Similar products</h2>
        <Link
          href={browseHref}
          className="group inline-flex items-center gap-1 text-sm font-medium text-[#111111] underline-offset-4 hover:underline dark:text-white"
        >
          See all
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>

      {loading ? (
        <div className="mt-5 divide-y divide-black/[0.06] overflow-hidden rounded-lg border border-black/[0.06] bg-white dark:divide-white/[0.08] dark:border-white/[0.08] dark:bg-[#111111]">
          {Array.from({ length: 4 }, (_, index) => (
            <SimilarProductSkeleton key={index} />
          ))}
        </div>
      ) : error || products.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-black/[0.12] px-4 py-10 text-center text-[15px] text-neutral-500 dark:border-white/[0.14] dark:text-neutral-400">
          {error ?? 'No similar products found yet.'}
        </p>
      ) : (
        <div className="mt-6 divide-y divide-black/[0.06] overflow-hidden rounded-lg border border-black/[0.06] bg-white dark:divide-white/[0.08] dark:border-white/[0.08] dark:bg-[#111111]">
          {products.map((product) => (
            <SimilarProductRow key={product.id} product={product} />
          ))}
        </div>
      )}
    </aside>
  );
}

function SimilarProductRow({ product }: { product: MarketplaceProductSummary }) {
  const reviewCount = product.reviewCount ?? 0;
  const averageRating = product.averageRating;

  return (
    <Link
      href={`/marketplace/products/${product.id}`}
      className="group flex items-start gap-5 px-5 py-5 transition hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
    >
      <div className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-md bg-black/[0.04] dark:bg-white/[0.06]">
        {product.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-400">No image</div>
        )}
      </div>

      <div className="flex min-h-[76px] min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="min-w-0">
          <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#111111] transition-colors group-hover:text-[#FF5722] dark:text-white">
            {product.title}
          </p>
          {product.creatorName && (
            <p className="mt-1 truncate text-[13px] text-neutral-500 dark:text-neutral-400">
              by {product.creatorName}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          {product.priceCents != null ? (
            <p className="text-[15px] font-semibold tabular-nums text-[#111111] dark:text-white">
              {formatPrice(product.priceCents, product.currency)}
            </p>
          ) : (
            <span />
          )}
          {reviewCount > 0 && averageRating != null ? (
            <span className="shrink-0 text-[13px] font-medium tabular-nums text-[#111111] dark:text-white">
              <span className="text-amber-400">★</span> {averageRating.toFixed(1)}
              <span className="font-normal text-neutral-500 dark:text-neutral-400"> ({reviewCount})</span>
            </span>
          ) : (
            <span className="shrink-0 text-[13px] text-neutral-400 dark:text-neutral-500">No ratings yet</span>
          )}
        </div>
      </div>
    </Link>
  );
}
