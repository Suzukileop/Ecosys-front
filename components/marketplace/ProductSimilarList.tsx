'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listSimilarProducts } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import type { MarketplaceProductSummary } from '@/types/marketplace';

type ProductSimilarListProps = {
  productId: string;
  genre?: string | null;
};

function SimilarProductSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl p-2.5">
      <div className="h-[4.5rem] w-[4.5rem] shrink-0 animate-pulse rounded-xl bg-gray-200 dark:bg-neutral-700" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
        <div className="h-3.5 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
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
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Similar products</h2>
        <Link
          href={browseHref}
          className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          aria-label="Browse more similar products"
        >
          →
        </Link>
      </div>

      <div className="mt-4 space-y-1">
        {loading ? (
          Array.from({ length: 4 }, (_, index) => <SimilarProductSkeleton key={index} />)
        ) : error ? (
          <p className="rounded-xl border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-gray-500 dark:border-neutral-700 dark:text-gray-400">
            {error}
          </p>
        ) : products.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-gray-500 dark:border-neutral-700 dark:text-gray-400">
            No similar products found yet.
          </p>
        ) : (
          products.map((product) => (
            <SimilarProductRow key={product.id} product={product} />
          ))
        )}
      </div>
    </aside>
  );
}

function SimilarProductRow({ product }: { product: MarketplaceProductSummary }) {
  const reviewCount = product.reviewCount ?? 0;
  const averageRating = product.averageRating;

  return (
    <Link
      href={`/marketplace/products/${product.id}`}
      className="flex items-center gap-4 rounded-xl p-2.5 transition hover:bg-gray-50 dark:hover:bg-neutral-800/60"
    >
      <div className="h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200 dark:bg-neutral-800 dark:ring-neutral-700">
        {product.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-base font-semibold leading-snug text-gray-900 dark:text-white">
          {product.title}
        </p>
        {product.creatorName && (
          <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
            {product.creatorName}
          </p>
        )}
        <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300">
          {reviewCount > 0 && averageRating != null ? (
            <>{averageRating.toFixed(1)} ★</>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">No ratings yet</span>
          )}
        </p>
      </div>
    </Link>
  );
}
