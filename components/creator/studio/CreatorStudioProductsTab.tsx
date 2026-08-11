'use client';

import { useCallback, useEffect, useState } from 'react';
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
  creatorProductGridClassName,
} from '@/components/creator/CreatorProductCard';
import { CreatorProductsToolbar } from '@/components/creator/CreatorProductsToolbar';
import { CreatorStudioNewProductPanel } from '@/components/creator/studio/CreatorStudioNewProductPanel';
import { useCreatorProductsFilter } from '@/components/creator/useCreatorProductsFilter';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioProductsTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { useAuth } from '@/context/AuthContext';
import type { MarketplaceBundleSummary, MarketplaceProductSummary } from '@/types/marketplace';

type ProductsView = 'list' | 'create';

function ProductsViewToggle({
  view,
  onViewChange,
}: {
  view: ProductsView;
  onViewChange: (view: ProductsView) => void;
}) {
  const tabClass = (active: boolean) =>
    `inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none sm:min-w-[9.5rem] ${
      active
        ? 'bg-white text-orange-600 shadow-sm ring-1 ring-neutral-200/80 dark:bg-neutral-800 dark:text-orange-400 dark:ring-neutral-700'
        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
    }`;

  return (
    <div
      className="inline-flex w-full rounded-xl border border-neutral-200 bg-neutral-100/80 p-1 dark:border-neutral-700 dark:bg-neutral-900/80 sm:w-auto"
      role="tablist"
      aria-label="Products view"
    >
      <button
        type="button"
        role="tab"
        aria-selected={view === 'list'}
        onClick={() => onViewChange('list')}
        className={tabClass(view === 'list')}
      >
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
        My products
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === 'create'}
        onClick={() => onViewChange('create')}
        className={tabClass(view === 'create')}
      >
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        New product
      </button>
    </div>
  );
}

export function CreatorStudioProductsTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceProductSummary[]>([]);
  const [bundles, setBundles] = useState<MarketplaceBundleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [view, setView] = useState<ProductsView>(searchParams.get('create') === '1' ? 'create' : 'list');

  const {
    query,
    setQuery,
    status,
    setStatus,
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
    try {
      setError(null);
      setLoading(true);
      setItems([]);
      setBundles([]);
      const [productsPage, bundlesPage] = await Promise.all([
        listCreatorProducts(0, 50),
        listCreatorBundles(0, 50),
      ]);
      setItems(productsPage.content);
      setBundles(bundlesPage.content);
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
    setView(searchParams.get('create') === '1' ? 'create' : 'list');
  }, [searchParams]);

  const setProductsView = (next: ProductsView) => {
    if (next === view) return;
    setView(next);
    if (next === 'list') {
      setLoading(true);
      setItems([]);
      setBundles([]);
    }
    router.replace(
      next === 'create' ? '/dashboard/creator?tab=products&create=1' : '/dashboard/creator?tab=products',
      { scroll: false }
    );
  };

  const onProductCreated = async (productTitle: string) => {
    showCreatorProductFeedback('created', productTitle);
    setProductsView('list');
    await load();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            {isCreateView ? 'New product' : 'Products'}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {isCreateView
              ? 'List a paid digital product on the marketplace. Buyers access it after purchase.'
              : 'Paid digital products on the marketplace.'}
          </p>
        </div>
        <ProductsViewToggle view={view} onViewChange={setProductsView} />
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {isCreateView ? (
        <CreatorStudioNewProductPanel
          onClose={() => setProductsView('list')}
          onCreated={(productTitle) => void onProductCreated(productTitle)}
        />
      ) : loading ? (
        <CreatorStudioProductsTabSkeleton />
      ) : items.length === 0 && bundles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-400">No products listed yet.</p>
          <button
            type="button"
            onClick={() => setProductsView('create')}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create a product
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
                    loginRedirect="/dashboard/creator?tab=products"
                  />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-5">
            {items.length > 0 && (
              <CreatorProductsToolbar
                query={query}
                status={status}
                type={type}
                sort={sort}
                resultCount={filtered.length}
                totalCount={items.length}
                hasActiveFilters={hasActiveFilters}
                onSearch={setQuery}
                onStatusChange={setStatus}
                onTypeChange={setType}
                onSortChange={setSort}
                onReset={resetFilters}
              />
            )}

            {items.length === 0 ? (
              <p className="text-sm text-neutral-500">No products yet.</p>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
                <p className="text-neutral-600 dark:text-neutral-400">No products match your filters.</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className={creatorProductGridClassName}>
                {filtered.map((product) => (
                  <CreatorProductCard
                    key={product.id}
                    product={product}
                    publishingId={publishingId}
                    onTogglePublish={(p) => void togglePublish(p)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
