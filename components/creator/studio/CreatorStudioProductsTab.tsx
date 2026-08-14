'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createProductGroup,
  deleteProductGroup,
  listCreatorBundles,
  listCreatorProductGroups,
  listCreatorProducts,
  markProductBestseller,
  pinProduct,
  publishProduct,
  unmarkProductBestseller,
  unpinProduct,
  unpublishProduct,
  updateProductGroup,
} from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { showCreatorProductFeedback } from '@/lib/creator-product-feedback';
import { CreatorBundleCard } from '@/components/creator/CreatorBundleCard';
import {
  CreatorProductCard,
} from '@/components/creator/CreatorProductCard';
import { CreatorProductGroupModal } from '@/components/creator/CreatorProductGroupModal';
import { CreatorProductsToolbar } from '@/components/creator/CreatorProductsToolbar';
import { CreatorProductsStatsPanel } from '@/components/creator/CreatorProductsStatsPanel';
import { CreatorProductGroupsExplorePanel } from '@/components/creator/CreatorProductGroupsExplorePanel';
import { CreatorStudioNewProductPanel } from '@/components/creator/studio/CreatorStudioNewProductPanel';
import { CreatorProductsEmptyGuide } from '@/components/creator/studio/CreatorProductsEmptyGuide';
import { ProductFormatToggle } from '@/components/marketplace/ProductFormatToggle';
import type { ProductFormat } from '@/components/marketplace/product-editor-steps';
import { useCreatorProductsFilter } from '@/components/creator/useCreatorProductsFilter';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioProductsTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { useAuth } from '@/context/AuthContext';
import { useOutOfViewSticky } from '@/hooks/useOutOfViewSticky';
import type {
  MarketplaceBundleSummary,
  MarketplaceProductGroup,
  MarketplaceProductSummary,
} from '@/types/marketplace';

type ProductsView = 'list' | 'create';
type FormatSectionOrder = 'physical-first' | 'virtual-first';

const PRODUCT_GRID_CLASS =
  'grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3';

function formatSectionOrderKey(userId: string) {
  return `creator-product-format-section-order:${userId}`;
}

function isPhysicalProduct(product: MarketplaceProductSummary) {
  return product.type === 'PHYSICAL';
}

export function CreatorStudioProductsTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const loadSeq = useRef(0);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<MarketplaceProductSummary[]>([]);
  const [bundles, setBundles] = useState<MarketplaceBundleSummary[]>([]);
  const [groups, setGroups] = useState<MarketplaceProductGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [exploringGroups, setExploringGroups] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<MarketplaceProductGroup | null>(null);
  const [groupSaving, setGroupSaving] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [flagBusyId, setFlagBusyId] = useState<string | null>(null);
  const [view, setView] = useState<ProductsView>(searchParams.get('create') === '1' ? 'create' : 'list');
  const [productFormat, setProductFormat] = useState<ProductFormat>('virtual');
  const [sectionOrder, setSectionOrder] = useState<FormatSectionOrder>('physical-first');

  const showStickySearch = useOutOfViewSticky(
    toolbarRef,
    80,
    items.length > 0 && !exploringGroups && view === 'list'
  );

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

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? null,
    [groups, selectedGroupId]
  );

  const displayProducts = useMemo(() => {
    if (!selectedGroup) return filtered;
    const ids = new Set(selectedGroup.productIds);
    return filtered.filter((product) => ids.has(product.id));
  }, [filtered, selectedGroup]);

  const displayPhysicalProducts = useMemo(
    () => displayProducts.filter(isPhysicalProduct),
    [displayProducts]
  );

  const displayVirtualProducts = useMemo(
    () => displayProducts.filter((product) => !isPhysicalProduct(product)),
    [displayProducts]
  );

  const formatSections = useMemo(() => {
    const physical = {
      key: 'physical' as const,
      label: 'Physical',
      products: displayPhysicalProducts,
    };
    const virtual = {
      key: 'virtual' as const,
      label: 'Virtual',
      products: displayVirtualProducts,
    };
    return sectionOrder === 'virtual-first' ? [virtual, physical] : [physical, virtual];
  }, [displayPhysicalProducts, displayVirtualProducts, sectionOrder]);

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

  const draftCount = items.filter((p) => !p.isPublished).length;

  const formatCounts = useMemo(
    () => ({
      all: items.length,
      physical: items.filter((product) => product.type === 'PHYSICAL').length,
      virtual: items.filter((product) => product.type !== 'PHYSICAL').length,
    }),
    [items]
  );

  const load = useCallback(async () => {
    const seq = ++loadSeq.current;
    try {
      setError(null);
      setLoading(true);
      const [productsPage, bundlesPage, groupsPage] = await Promise.all([
        listCreatorProducts(0, 50),
        listCreatorBundles(0, 50),
        listCreatorProductGroups(0, 50),
      ]);
      if (seq !== loadSeq.current) return;
      setItems(productsPage.content);
      setBundles(bundlesPage.content);
      setGroups(groupsPage.content);
      setSelectedGroupId((current) =>
        current && groupsPage.content.some((group) => group.id === current) ? current : null
      );
    } catch (e) {
      if (seq !== loadSeq.current) return;
      setError(getApiErrorMessage(e, 'Unable to load your products.'));
      setItems([]);
      setBundles([]);
      setGroups([]);
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

  const patchProductFlags = (productId: string, patch: Partial<MarketplaceProductSummary>) => {
    setItems((prev) => prev.map((item) => (item.id === productId ? { ...item, ...patch } : item)));
  };

  const togglePin = async (product: MarketplaceProductSummary) => {
    try {
      setFlagBusyId(product.id);
      setError(null);
      const updated = product.isPinned
        ? await unpinProduct(product.id)
        : await pinProduct(product.id);
      patchProductFlags(product.id, {
        isPinned: Boolean(updated.isPinned),
      });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not update pin.'));
    } finally {
      setFlagBusyId(null);
    }
  };

  const toggleBestseller = async (product: MarketplaceProductSummary) => {
    try {
      setFlagBusyId(product.id);
      setError(null);
      const updated = product.isBestseller
        ? await unmarkProductBestseller(product.id)
        : await markProductBestseller(product.id);
      patchProductFlags(product.id, {
        isBestseller: Boolean(updated.isBestseller),
      });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not update bestseller.'));
    } finally {
      setFlagBusyId(null);
    }
  };

  const openCreateGroupModal = () => {
    setEditingGroup(null);
    setGroupError(null);
    setGroupModalOpen(true);
  };

  const openEditGroupModal = (group: MarketplaceProductGroup) => {
    setEditingGroup(group);
    setGroupError(null);
    setGroupModalOpen(true);
  };

  const closeGroupModal = () => {
    if (groupSaving) return;
    setGroupModalOpen(false);
    setEditingGroup(null);
    setGroupError(null);
  };

  const saveGroup = async (payload: { name: string; productIds: string[] }) => {
    try {
      setGroupSaving(true);
      setGroupError(null);
      if (editingGroup) {
        const updated = await updateProductGroup(editingGroup.id, payload);
        setGroups((prev) => prev.map((group) => (group.id === updated.id ? updated : group)));
        setSelectedGroupId(updated.id);
      } else {
        const created = await createProductGroup(payload);
        setGroups((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)));
        setSelectedGroupId(created.id);
      }
      setGroupModalOpen(false);
      setEditingGroup(null);
    } catch (e) {
      setGroupError(getApiErrorMessage(e, 'Could not save the catalogue.'));
    } finally {
      setGroupSaving(false);
    }
  };

  const removeGroup = async () => {
    if (!editingGroup) return;
    try {
      setGroupSaving(true);
      setGroupError(null);
      await deleteProductGroup(editingGroup.id);
      setGroups((prev) => prev.filter((group) => group.id !== editingGroup.id));
      setSelectedGroupId((current) => (current === editingGroup.id ? null : current));
      setGroupModalOpen(false);
      setEditingGroup(null);
    } catch (e) {
      setGroupError(getApiErrorMessage(e, 'Could not delete the catalogue.'));
    } finally {
      setGroupSaving(false);
    }
  };

  const isCreateView = view === 'create';
  const showStatsColumn = !isCreateView && items.length > 0;
  const isEmptyGuide = !isCreateView && !loading && items.length === 0 && bundles.length === 0;

  return (
    <div
      className={
        isEmptyGuide
          ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
          : 'min-h-0 flex-1 space-y-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
      }
    >
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
        </div>
      ) : (
        <>
          {!isEmptyGuide && (exploringGroups || !showStatsColumn) ? (
            <div
              className={`flex w-full shrink-0 items-center gap-4 ${
                exploringGroups ? 'justify-between' : 'justify-end'
              }`}
            >
              {exploringGroups ? (
                <button
                  type="button"
                  onClick={() => setExploringGroups(false)}
                  className="inline-flex items-center gap-1 text-lg font-medium leading-none text-neutral-500 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  <span aria-hidden className="text-xl leading-none">
                    {'<'}
                  </span>
                  <span>back</span>
                </button>
              ) : null}
              {!showStatsColumn ? (
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setProductsView('create')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
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
              ) : null}
            </div>
          ) : null}

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          {loading && items.length === 0 && bundles.length === 0 ? (
            <CreatorStudioProductsTabSkeleton />
          ) : items.length === 0 && bundles.length === 0 ? (
            <div className="flex min-h-0 flex-1 flex-col pt-2">
              <CreatorProductsEmptyGuide onCreate={() => setProductsView('create')} />
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
              {exploringGroups ? (
                <CreatorProductGroupsExplorePanel
                  groups={groups}
                  products={items}
                  selectedGroupId={selectedGroupId}
                  onSelectGroup={(groupId) => {
                    setSelectedGroupId(groupId);
                    setExploringGroups(false);
                  }}
                  onEditGroup={openEditGroupModal}
                  onCreateCatalogue={openCreateGroupModal}
                />
              ) : (
                <>
              {items.length > 0 && (
                <div ref={toolbarRef}>
                  <CreatorProductsToolbar
                    query={query}
                    status={status}
                    type={type}
                    sort={sort}
                    format={format}
                    formatCounts={formatCounts}
                    groupActive={Boolean(selectedGroupId)}
                    resultCount={displayProducts.length}
                    totalCount={items.length}
                    hasActiveFilters={hasActiveFilters}
                    onSearch={setQuery}
                    onStatusChange={setStatus}
                    onTypeChange={setType}
                    onSortChange={setSort}
                    onFormatChange={(next) => {
                      setSelectedGroupId(null);
                      setFormat(next);
                      if (next === 'physical') setType('');
                    }}
                  />
                </div>
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
              ) : displayProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {selectedGroup
                      ? `No products in “${selectedGroup.name}” match the current filters.`
                      : 'No products match your filters.'}
                  </p>
                  {selectedGroup ? (
                    <button
                      type="button"
                      onClick={() => setSelectedGroupId(null)}
                      className="mt-4 text-sm font-semibold text-orange-600 transition hover:text-orange-700 dark:text-orange-400"
                    >
                      Clear catalogue filter
                    </button>
                  ) : null}
                </div>
              ) : format === 'all' && !selectedGroup ? (
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
                            {displayPhysicalProducts.length > 0 &&
                            displayVirtualProducts.length > 0 &&
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
                          <div className={PRODUCT_GRID_CLASS}>
                            {section.products.map((product) => (
                              <CreatorProductCard
                                key={product.id}
                                product={product}
                                from="products"
                                publishingId={publishingId}
                                flagBusyId={flagBusyId}
                                onTogglePublish={(p) => void togglePublish(p)}
                                onTogglePin={(p) => void togglePin(p)}
                                onToggleBestseller={(p) => void toggleBestseller(p)}
                              />
                            ))}
                          </div>
                        </section>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedGroup ? (
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-900 dark:text-white">
                        {selectedGroup.name}
                      </h3>
                      <span className="text-xs font-medium tabular-nums text-neutral-500 dark:text-neutral-400">
                        {displayProducts.length}
                      </span>
                    </div>
                  ) : null}
                  <div className={PRODUCT_GRID_CLASS}>
                    {displayProducts.map((product) => (
                      <CreatorProductCard
                        key={product.id}
                        product={product}
                        from="products"
                        publishingId={publishingId}
                        flagBusyId={flagBusyId}
                        onTogglePublish={(p) => void togglePublish(p)}
                        onTogglePin={(p) => void togglePin(p)}
                        onToggleBestseller={(p) => void toggleBestseller(p)}
                      />
                    ))}
                  </div>
                </div>
              )}
                </>
              )}
            </section>

            {items.length > 0 && (
              <div className="w-full shrink-0 space-y-4 xl:sticky xl:top-24 xl:ml-4 xl:w-[16rem] xl:pl-6">
                <div
                  className={`grid transition-[grid-template-rows,opacity,margin] duration-200 ease-out ${
                    showStickySearch
                      ? 'mb-0 grid-rows-[1fr] opacity-100'
                      : 'pointer-events-none mb-0 grid-rows-[0fr] opacity-0'
                  }`}
                  aria-hidden={!showStickySearch}
                >
                  <div className="min-h-0 overflow-hidden">
                    <label htmlFor="creator-products-search-sticky" className="sr-only">
                      Search products
                    </label>
                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2.5 dark:bg-neutral-800">
                      <svg
                        className="h-4 w-4 shrink-0 text-neutral-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <input
                        id="creator-products-search-sticky"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search…"
                        tabIndex={showStickySearch ? 0 : -1}
                        className="min-w-0 flex-1 border-0 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                      />
                      {query ? (
                        <button
                          type="button"
                          onClick={() => setQuery('')}
                          tabIndex={showStickySearch ? 0 : -1}
                          className="rounded-full p-0.5 text-neutral-400 transition hover:text-neutral-600 dark:hover:text-neutral-300"
                          aria-label="Clear search"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setProductsView('create')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
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
                <CreatorProductsStatsPanel
                  groups={groups}
                  selectedGroupId={selectedGroupId}
                  exploring={exploringGroups}
                  onSelectGroup={(groupId) => {
                    setExploringGroups(false);
                    setSelectedGroupId(groupId);
                  }}
                  onCreateGroup={openCreateGroupModal}
                  onExplore={() => {
                    setSelectedGroupId(null);
                    setExploringGroups(true);
                  }}
                />
              </div>
            )}
          </div>
        </>
          )}
        </>
      )}

      <CreatorProductGroupModal
        open={groupModalOpen}
        products={items}
        initialGroup={editingGroup}
        saving={groupSaving}
        error={groupError}
        onClose={closeGroupModal}
        onSubmit={(payload) => void saveGroup(payload)}
        onDelete={editingGroup ? () => void removeGroup() : undefined}
      />
    </div>
  );
}
