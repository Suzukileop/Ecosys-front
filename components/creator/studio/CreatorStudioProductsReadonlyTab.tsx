'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { listCreatorProducts } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  CreatorProductCard,
  creatorProductGridClassName,
} from '@/components/creator/CreatorProductCard';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioProductsTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import type { MarketplaceProductSummary } from '@/types/marketplace';

/** Read-only products grid inside My Profile (management lives in My Product). */
export function CreatorStudioProductsReadonlyTab() {
  const [items, setItems] = useState<MarketplaceProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const page = await listCreatorProducts(0, 50);
      setItems(page.content);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load your products.'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <CreatorStudioProductsTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Products</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Preview of your catalog. Create or manage products in{' '}
            <Link
              href="/dashboard/products"
              className="font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
            >
              My Product
            </Link>
            .
          </p>
        </div>
      </div>

      {error ? <ErrorAlert message={error} onDismiss={() => setError(null)} /> : null}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-400">No products listed yet.</p>
          <Link
            href="/dashboard/products?create=1"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Create a product
          </Link>
        </div>
      ) : (
        <div className={creatorProductGridClassName}>
          {items.map((product) => (
            <CreatorProductCard key={product.id} product={product} readOnly from="profile" />
          ))}
        </div>
      )}
    </div>
  );
}
