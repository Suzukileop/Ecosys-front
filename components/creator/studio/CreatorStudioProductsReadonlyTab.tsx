'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { listCreatorProducts } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  CreatorProductCard,
  creatorProductGridClassName,
} from '@/components/creator/CreatorProductCard';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioProductsTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { useAuth } from '@/context/AuthContext';
import type { MarketplaceProductSummary } from '@/types/marketplace';

type FormatSectionOrder = 'physical-first' | 'virtual-first';

function formatSectionOrderKey(userId: string) {
  return `creator-product-format-section-order:${userId}`;
}

function isPhysicalProduct(product: MarketplaceProductSummary) {
  return product.type === 'PHYSICAL';
}

function productRank(product: MarketplaceProductSummary) {
  if (product.isPinned) return 0;
  if (product.isBestseller) return 1;
  return 2;
}

function sortProfileProducts(products: MarketplaceProductSummary[]) {
  return [...products].sort((a, b) => {
    const rankDiff = productRank(a) - productRank(b);
    if (rankDiff !== 0) return rankDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/** Read-only products grid inside My Profile (management lives in My Product). */
export function CreatorStudioProductsReadonlyTab() {
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionOrder, setSectionOrder] = useState<FormatSectionOrder>('physical-first');

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

  useEffect(() => {
    if (!user?.id) {
      setSectionOrder('physical-first');
      return;
    }
    try {
      const raw = window.localStorage.getItem(formatSectionOrderKey(user.id));
      setSectionOrder(raw === 'virtual-first' ? 'virtual-first' : 'physical-first');
    } catch {
      setSectionOrder('physical-first');
    }
  }, [user?.id]);

  const physicalProducts = useMemo(
    () => sortProfileProducts(items.filter(isPhysicalProduct)),
    [items]
  );
  const virtualProducts = useMemo(
    () => sortProfileProducts(items.filter((product) => !isPhysicalProduct(product))),
    [items]
  );

  const formatSections = useMemo(() => {
    const physical = {
      key: 'physical' as const,
      label: 'Physical',
      products: physicalProducts,
    };
    const virtual = {
      key: 'virtual' as const,
      label: 'Virtual',
      products: virtualProducts,
    };
    return sectionOrder === 'virtual-first' ? [virtual, physical] : [physical, virtual];
  }, [physicalProducts, sectionOrder, virtualProducts]);

  const swapFormatSections = useCallback(() => {
    setSectionOrder((current) => {
      const next: FormatSectionOrder =
        current === 'physical-first' ? 'virtual-first' : 'physical-first';
      if (user?.id) {
        try {
          window.localStorage.setItem(formatSectionOrderKey(user.id), next);
        } catch {
          // ignore quota / private mode
        }
      }
      return next;
    });
  }, [user?.id]);

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
        <div className="space-y-10">
          {formatSections.map((section, index) => {
            if (section.products.length === 0) return null;
            const previousVisible = formatSections
              .slice(0, index)
              .some((entry) => entry.products.length > 0);

            return (
              <div key={section.key} className="space-y-10">
                {previousVisible ? (
                  <hr className="border-neutral-200 dark:border-neutral-700" />
                ) : null}
                <section className="space-y-4" aria-label={`${section.label} products`}>
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-900 dark:text-white">
                      {section.label}
                    </h3>
                    <span className="text-xs font-medium tabular-nums text-neutral-500 dark:text-neutral-400">
                      {section.products.length}
                    </span>
                    {physicalProducts.length > 0 &&
                    virtualProducts.length > 0 &&
                    !previousVisible ? (
                      <button
                        type="button"
                        onClick={swapFormatSections}
                        aria-label="Swap Physical and Virtual sections"
                        title="Swap Physical / Virtual order"
                        className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:border-orange-300 hover:text-orange-600 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-orange-500/50 dark:hover:text-orange-300"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
                          />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                  <div className={creatorProductGridClassName}>
                    {section.products.map((product) => (
                      <CreatorProductCard
                        key={product.id}
                        product={product}
                        readOnly
                        from="profile"
                      />
                    ))}
                  </div>
                </section>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
