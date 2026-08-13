'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  listCreatorBundles,
  listCreatorProducts,
  publishProduct,
  unpublishProduct,
} from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { showCreatorProductFeedback } from '@/lib/creator-product-feedback';
import { CreatorBundleCard } from '@/components/creator/CreatorBundleCard';
import {
  CreatorProductCard,
} from '@/components/creator/CreatorProductCard';
import { CreatorProductsToolbar } from '@/components/creator/CreatorProductsToolbar';
import { CreatorProductsStatsPanel } from '@/components/creator/CreatorProductsStatsPanel';
import { CreatorStudioNewProductPanel } from '@/components/creator/studio/CreatorStudioNewProductPanel';
import { ProductFormatToggle } from '@/components/marketplace/ProductFormatToggle';
import type { ProductFormat } from '@/components/marketplace/product-editor-steps';
import { useCreatorProductsFilter } from '@/components/creator/useCreatorProductsFilter';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioProductsTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { useAuth } from '@/context/AuthContext';
import type { MarketplaceBundleSummary, MarketplaceProductSummary } from '@/types/marketplace';

type ProductsView = 'list' | 'create';

export function CreatorStudioProductsTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const loadSeq = useRef(0);
  const [items, setItems] = useState<MarketplaceProductSummary[]>([]);
  const [bundles, setBundles] = useState<MarketplaceBundleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [view, setView] = useState<ProductsView>(searchParams.get('create') === '1' ? 'create' : 'list');
  const [productFormat, setProductFormat] = useState<ProductFormat>('virtual');

  const {
    query,
    setQuery,
    status,
    setStatus,
    format,
    setFormat,
    type,
    setType,
    sort,
    setSort,
    filtered,
    hasActiveFilters,
    resetFilters,
  } = useCreatorProductsFilter(items);

  const draftCount = items.filter((p) => !p.isPublished).length;

  const load = useCallback(async () => {
    const seq = ++loadSeq.current;
    try {
      setError(null);
      setLoading(true);
      const [productsPage, bundlesPage] = await Promise.all([
        listCreatorProducts(0, 50),
        listCreatorBundles(0, 50),
      ]);
      if (seq !== loadSeq.current) return;
      setItems(productsPage.content);
      setBundles(bundlesPage.content);
    } catch (e) {
      if (seq !== loadSeq.current) return;
      setError(getApiErrorMessage(e, 'Unable to load your products.'));
      setItems([]);
      setBundles([]);
    } finally {
      if (seq === loadSeq.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setView(searchParams.get('create') === '1' ? 'create' : 'list');
  }, [searchParams]);

  const setProductsView = (next: ProductsView) => {
    if (next === view) return;
    setView(next);
    if (next === 'create') {
      setProductFormat('virtual');
    }
    router.replace(
      next === 'create' ? '/dashboard/products?create=1' : '/dashboard/products',
      { scroll: false }
    );
    // Returning to the list used to set loading=true without refetching → stuck skeleton.
    if (next === 'list') {
      void load();
    }
  };

  const onProductCreated = (productTitle: string) => {
    showCreatorProductFeedback('created', productTitle);
    setProductsView('list');
  };

  const togglePublish = async (product: MarketplaceProductSummary) => {
    try {
      setPublishingId(product.id);
      setError(null);
      if (product.isPublished) {
        await unpublishProduct(product.id);
      } else {
        await publishProduct(product.id);
      }
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not update publication status.'));
    } finally {
      setPublishingId(null);
    }
  };

  const isCreateView = view === 'create';
  const showStatsColumn = !isCreateView && items.length > 0;

  return (
    <div className="space-y-6">
      {isCreateView ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setProductsView('list')}
                className="mb-3 inline-flex items-center text-sm font-medium text-neutral-500 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                {'< back'}
              </button>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">New product</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Build a listing buyers trust — clear offer, sharp price, ready to sell.
              </p>
            </div>
            <div className="shrink-0 sm:pt-1">
              <ProductFormatToggle value={productFormat} onChange={setProductFormat} />
            </div>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          <CreatorStudioNewProductPanel
            productFormat={productFormat}
            onClose={() => setProductsView('list')}
            onCreated={(productTitle) => onProductCreated(productTitle)}
          />

          <button
            type="button"
            className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.16)] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
          >
            <span aria-hidden className="text-base leading-none">
              💬
            </span>
            Help
          </button>
        </div>
      ) : (
        <>
          <div
            className={`flex w-full items-start justify-end ${
              showStatsColumn ? 'xl:ml-auto xl:w-[16rem] xl:pl-6' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => setProductsView('create')}
              className={`inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 ${
                showStatsColumn ? 'w-full' : ''
              }`}
            >
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Publish new item
            </button>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          {loading && items.length === 0 && bundles.length === 0 ? (
            <CreatorStudioProductsTabSkeleton />
          ) : items.length === 0 && bundles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-400">No products listed yet.</p>
          <button
            type="button"
            onClick={() => setProductsView('create')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-orange-400 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28)] ring-1 ring-orange-600/30 transition hover:from-orange-500 hover:to-orange-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Publish new item
          </button>
        </div>
      ) : (
        <>
          {!loading && draftCount > 0 && (
            <p className="inline-flex items-center gap-2 rounded-lg border border-amber-200/70 bg-amber-50/60 px-3 py-1.5 text-xs text-amber-950 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-100">
              <span className="font-semibold">
                {draftCount} draft{draftCount > 1 ? 's' : ''}
              </span>
              <span className="text-amber-800/75 dark:text-amber-200/75">· hidden until published</span>
            </p>
          )}

          {bundles.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Bundles</h3>
              <div className="grid gap-5 md:grid-cols-2">
                {bundles.map((bundle) => (
                  <CreatorBundleCard
                    key={bundle.id}
                    bundle={bundle}
                    isAuthenticated={Boolean(user)}
                    loginRedirect="/dashboard/products"
                  />
                ))}
              </div>
            </section>
          )}

          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-14">
            <section className="min-w-0 flex-1 space-y-5">
              {items.length > 0 && (
                <CreatorProductsToolbar
                  query={query}
                  status={status}
                  format={format}
                  type={type}
                  sort={sort}
                  resultCount={filtered.length}
                  totalCount={items.length}
                  hasActiveFilters={hasActiveFilters}
                  onSearch={setQuery}
                  onStatusChange={setStatus}
                  onFormatChange={(next) => {
                    setFormat(next);
                    if (next === 'physical') setType('');
                  }}
                  onTypeChange={setType}
                  onSortChange={setSort}
                />
              )}

              {items.length === 0 ? (
                <p className="text-sm text-neutral-500">No products yet.</p>
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
                  <p className="text-neutral-600 dark:text-neutral-400">No products match your filters.</p>
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-sm font-semibold text-orange-600 transition hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                      Clear filters
                    </button>
                    <button
                      type="button"
                      onClick={resetFilters}
                      aria-label="Reset filters"
                      title="Reset filters"
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full text-orange-600 transition hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
                    >
                      <svg
                        className="h-7 w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {filtered.map((product) => (
                    <CreatorProductCard
                      key={product.id}
                      product={product}
                      from="products"
                      publishingId={publishingId}
                      onTogglePublish={(p) => void togglePublish(p)}
                    />
                  ))}
                </div>
              )}
            </section>

            {items.length > 0 && (
              <div className="w-full shrink-0 xl:sticky xl:top-24 xl:ml-4 xl:w-[16rem] xl:pl-6">
                <CreatorProductsStatsPanel products={items} />
              </div>
            )}
          </div>
        </>
          )}
        </>
      )}
    </div>
  );
}
