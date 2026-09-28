'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
  creatorProductGridClassName,
} from '@/components/creator/CreatorProductCard';
import { CreatorProductGroupModal } from '@/components/creator/CreatorProductGroupModal';
import { CreatorProductsToolbar } from '@/components/creator/CreatorProductsToolbar';
import { CreatorProductsStatsPanel } from '@/components/creator/CreatorProductsStatsPanel';
import { CreatorProductGroupsExplorePanel } from '@/components/creator/CreatorProductGroupsExplorePanel';
import { CreatorStudioNewProductPanel } from '@/components/creator/studio/CreatorStudioNewProductPanel';
import { CreatorProductsEmptyGuide } from '@/components/creator/studio/CreatorProductsEmptyGuide';
import { ProfileReadinessWarning } from '@/components/creator/studio/ProfileReadinessWarning';
import { ProductFormatToggle } from '@/components/marketplace/ProductFormatToggle';
import type { ProductFormat } from '@/components/marketplace/product-editor-steps';
import { useCreatorProductsFilter } from '@/components/creator/useCreatorProductsFilter';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioProductsTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { useAuth } from '@/context/AuthContext';
import { useOutOfViewSticky } from '@/hooks/useOutOfViewSticky';
import api from '@/lib/api';
import {
  getMissingProfileReadinessFields,
  type ProfileReadinessField,
} from '@/lib/creator-profile-readiness';
import type { CreatorProfileDto } from '@/types/ecosystem';
import type {
  MarketplaceBundleSummary,
  MarketplaceProductGroup,
  MarketplaceProductSummary,
} from '@/types/marketplace';

type ProductsView = 'list' | 'create';
type FormatSectionOrder = 'physical-first' | 'virtual-first';

const PRIMARY_BUTTON_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-[#111111] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-[#111111]';
const SECONDARY_BUTTON_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-black/[0.12] px-5 py-2.5 text-[15px] font-medium text-[#111111] transition-colors hover:border-black/25 dark:border-white/[0.12] dark:text-white dark:hover:border-white/25';
const EMPTY_FRAME_CLASS =
  'rounded-lg border border-dashed border-black/[0.12] px-6 py-14 text-center dark:border-white/[0.12]';

function PlusIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-500 transition-colors hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}

function SectionHeading({ label, count, children }: { label: string; count: number; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-[#111111] dark:text-white">
        {label}
        <span className="font-medium tabular-nums text-neutral-400 dark:text-neutral-500">
          {' · '}
          {String(count).padStart(2, '0')}
        </span>
      </h2>
      {children}
    </div>
  );
}

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
  const [missingProfileFields, setMissingProfileFields] = useState<ProfileReadinessField[]>([]);

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
      const [productsPage, bundlesPage, groupsPage, profileRes] = await Promise.all([
        listCreatorProducts(0, 50),
        listCreatorBundles(0, 50),
        listCreatorProductGroups(0, 50),
        api.get<CreatorProfileDto>('/api/creator/profile'),
      ]);
      if (seq !== loadSeq.current) return;
      setItems(productsPage.content);
      setBundles(bundlesPage.content);
      setGroups(groupsPage.content);
      setMissingProfileFields(getMissingProfileReadinessFields(profileRes.data));
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
    const wantsCreate = searchParams.get('create') === '1';
    if (wantsCreate && missingProfileFields.length > 0) {
      setView('list');
      router.replace('/marketplace/my-products', { scroll: false });
      return;
    }
    setView(wantsCreate ? 'create' : 'list');
  }, [searchParams, missingProfileFields.length, router]);

  const setProductsView = (next: ProductsView) => {
    if (next === view) return;
    if (next === 'create' && missingProfileFields.length > 0) return;
    setView(next);
    if (next === 'create') {
      setProductFormat('virtual');
    }
    router.replace(
      next === 'create' ? '/marketplace/my-products?create=1' : '/marketplace/my-products',
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

  const renderProductCard = (product: MarketplaceProductSummary) => (
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
  );

  return (
    <div
      className={
        isEmptyGuide
          ? 'relative flex min-h-0 flex-1 flex-col overflow-hidden'
          : 'relative min-h-0 flex-1 space-y-10 overflow-y-auto pb-20 pt-8 [scrollbar-width:none] [-ms-overflow-style:none] sm:pt-10 [&::-webkit-scrollbar]:hidden'
      }
    >
      {!isCreateView && missingProfileFields.length > 0 ? (
        <ProfileReadinessWarning
          missingFields={missingProfileFields}
          title="Complete your profile first"
          description="Add a real profile photo (not the auto-generated avatar), plus address, phone, email, nationality, link, name, role, and location before you can create a product. Don't worry — it's a mark of trust for your clients."
        />
      ) : null}

      {isCreateView ? (
        <div className="space-y-8">
          <div className="space-y-5">
            <BackLink label="Back to products" onClick={() => setProductsView('list')} />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold tracking-tight text-[#111111] dark:text-white sm:text-4xl">
                  New product
                </h1>
                <p className="mt-2 text-base text-neutral-500 dark:text-neutral-400">
                  Build a listing buyers trust — clear offer, sharp price, ready to sell.
                </p>
              </div>
              <div className="shrink-0">
                <ProductFormatToggle value={productFormat} onChange={setProductFormat} />
              </div>
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
          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          {loading && items.length === 0 && bundles.length === 0 ? (
            <CreatorStudioProductsTabSkeleton />
          ) : items.length === 0 && bundles.length === 0 ? (
            <div className="flex min-h-0 flex-1 flex-col pt-2">
              <CreatorProductsEmptyGuide
                onCreate={() => setProductsView('create')}
                createDisabled={missingProfileFields.length > 0}
              />
            </div>
          ) : (
            <>
              <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <h1 className="text-3xl font-bold tracking-tight text-[#111111] dark:text-white sm:text-4xl">
                    My products
                  </h1>
                  <p className="mt-2 text-base text-neutral-500 dark:text-neutral-400">
                    Manage your listings, drafts and catalogues in one place.
                  </p>
                  {!loading && draftCount > 0 ? (
                    <p className="mt-4 inline-flex items-center gap-2 text-[14px] text-neutral-500 dark:text-neutral-400">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span className="font-medium text-[#111111] dark:text-white">
                        {draftCount} draft{draftCount > 1 ? 's' : ''}
                      </span>
                      <span>· hidden until published</span>
                    </p>
                  ) : null}
                </div>
                {!showStatsColumn ? (
                  <button
                    type="button"
                    onClick={() => setProductsView('create')}
                    disabled={missingProfileFields.length > 0}
                    className={`${PRIMARY_BUTTON_CLASS} shrink-0`}
                  >
                    <PlusIcon />
                    Publish new item
                  </button>
                ) : null}
              </header>

              {bundles.length > 0 && (
                <section className="space-y-5" aria-label="Bundles">
                  <SectionHeading label="Bundles" count={bundles.length} />
                  <div className="grid gap-6 md:grid-cols-2">
                    {bundles.map((bundle) => (
                      <CreatorBundleCard
                        key={bundle.id}
                        bundle={bundle}
                        isAuthenticated={Boolean(user)}
                        loginRedirect="/marketplace/my-products"
                      />
                    ))}
                  </div>
                </section>
              )}

              <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-12">
                <section className="min-w-0 flex-1 space-y-10">
                  {exploringGroups ? (
                    <>
                      <BackLink label="Back to products" onClick={() => setExploringGroups(false)} />
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
                    </>
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
                        <p className="text-[15px] text-neutral-500 dark:text-neutral-400">No products yet.</p>
                      ) : filtered.length === 0 ? (
                        <div className={EMPTY_FRAME_CLASS}>
                          <p className="text-base text-neutral-500 dark:text-neutral-400">No products match your filters.</p>
                          <button type="button" onClick={resetFilters} className={`${SECONDARY_BUTTON_CLASS} mt-5`}>
                            Clear filters
                          </button>
                        </div>
                      ) : displayProducts.length === 0 ? (
                        <div className={EMPTY_FRAME_CLASS}>
                          <p className="text-base text-neutral-500 dark:text-neutral-400">
                            {selectedGroup
                              ? `No products in “${selectedGroup.name}” match the current filters.`
                              : 'No products match your filters.'}
                          </p>
                          {selectedGroup ? (
                            <button
                              type="button"
                              onClick={() => setSelectedGroupId(null)}
                              className={`${SECONDARY_BUTTON_CLASS} mt-5`}
                            >
                              Clear catalogue filter
                            </button>
                          ) : null}
                        </div>
                      ) : format === 'all' && !selectedGroup ? (
                        <div className="space-y-12">
                          {formatSections.map((section, index) => {
                            if (section.products.length === 0) return null;
                            const previousVisible = formatSections
                              .slice(0, index)
                              .some((entry) => entry.products.length > 0);

                            return (
                              <section
                                key={section.key}
                                className="space-y-5"
                                aria-label={`${section.label} products`}
                              >
                                <SectionHeading label={section.label} count={section.products.length}>
                                  {displayPhysicalProducts.length > 0 &&
                                  displayVirtualProducts.length > 0 &&
                                  !previousVisible ? (
                                    <button
                                      type="button"
                                      onClick={swapFormatSections}
                                      aria-label="Swap Physical and Virtual sections"
                                      title="Swap Physical / Virtual order"
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.08] text-neutral-500 transition-colors hover:border-black/20 hover:text-[#FF5722] dark:border-white/[0.1] dark:text-neutral-400 dark:hover:border-white/25 dark:hover:text-[#FF5722]"
                                    >
                                      <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.75}
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
                                </SectionHeading>
                                <div className={creatorProductGridClassName}>
                                  {section.products.map(renderProductCard)}
                                </div>
                              </section>
                            );
                          })}
                        </div>
                      ) : (
                        <section className="space-y-5">
                          {selectedGroup ? (
                            <SectionHeading label={selectedGroup.name} count={displayProducts.length} />
                          ) : null}
                          <div className={creatorProductGridClassName}>{displayProducts.map(renderProductCard)}</div>
                        </section>
                      )}
                    </>
                  )}
                </section>

                {items.length > 0 && (
                  <aside className="w-full shrink-0 xl:sticky xl:top-8 xl:w-72">
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                        showStickySearch
                          ? 'grid-rows-[1fr] opacity-100'
                          : 'pointer-events-none grid-rows-[0fr] opacity-0'
                      }`}
                      aria-hidden={!showStickySearch}
                    >
                      <div className="min-h-0 overflow-hidden pb-4">
                        <label htmlFor="creator-products-search-sticky" className="sr-only">
                          Search products
                        </label>
                        <div className="flex h-11 items-center gap-3 rounded-lg bg-black/[0.04] px-4 dark:bg-white/[0.06]">
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
                            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-neutral-500"
                          />
                          {query ? (
                            <button
                              type="button"
                              onClick={() => setQuery('')}
                              tabIndex={showStickySearch ? 0 : -1}
                              className="rounded-full p-1 text-neutral-400 transition hover:text-[#111111] dark:hover:text-white"
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
                      disabled={missingProfileFields.length > 0}
                      className={`${PRIMARY_BUTTON_CLASS} mb-4 w-full`}
                    >
                      <PlusIcon />
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
                  </aside>
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
