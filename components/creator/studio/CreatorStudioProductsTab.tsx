'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createProductGroup,
  deleteProductGroup,
  hideProductFromProfile,
  listCreatorBundles,
  listCreatorProductGroups,
  listCreatorProducts,
  pinProduct,
  publishProduct,
  showProductOnProfile,
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
import { CreatorCatalogueAddProductsModal } from '@/components/creator/CreatorCatalogueAddProductsModal';
import {
  CreatorProductsToolbar,
  type CreatorProductsLayout,
} from '@/components/creator/CreatorProductsToolbar';
import {
  CreatorProductsCatalogueStrip,
  CreatorProductsStatsPanel,
  CreatorStoreSettingsButton,
} from '@/components/creator/CreatorProductsStatsPanel';
import { CreatorProductGroupsExplorePanel } from '@/components/creator/CreatorProductGroupsExplorePanel';
import { CreatorProductCreateModal } from '@/components/creator/CreatorProductCreateModal';
import { CreatorProductsEmptyGuide } from '@/components/creator/studio/CreatorProductsEmptyGuide';
import { ProfileReadinessWarning } from '@/components/creator/studio/ProfileReadinessWarning';
import type { ProductFormat } from '@/components/marketplace/product-editor-steps';
import { useCreatorProductsFilter } from '@/components/creator/useCreatorProductsFilter';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioProductsTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { useAuth } from '@/context/AuthContext';
import { BackToTopButton, useBackToTop } from '@/components/ui/ScrollUpStickyBar';
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
  'mx-5 rounded-lg border border-dashed border-black/[0.12] px-6 py-14 text-center dark:border-white/[0.12] sm:mx-0';

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
      className="mx-5 inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-500 transition-colors hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white sm:mx-0"
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
    <div className="flex items-center justify-between gap-3 px-5 sm:px-0">
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

function productsLayoutKey(userId: string) {
  return `creator-products-layout:${userId}`;
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
  const [addToGroupOpen, setAddToGroupOpen] = useState(false);
  const [addToGroupSaving, setAddToGroupSaving] = useState(false);
  const [addToGroupError, setAddToGroupError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [flagBusyId, setFlagBusyId] = useState<string | null>(null);
  const [view, setView] = useState<ProductsView>(searchParams.get('create') === '1' ? 'create' : 'list');
  const [productFormat, setProductFormat] = useState<ProductFormat>('virtual');
  const [sectionOrder, setSectionOrder] = useState<FormatSectionOrder>('physical-first');
  const [layout, setLayout] = useState<CreatorProductsLayout>(() => {
    if (typeof window === 'undefined' || !user?.id) return 'all';
    try {
      return window.localStorage.getItem(productsLayoutKey(user.id)) === 'catalogues' ? 'catalogues' : 'all';
    } catch {
      return 'all';
    }
  });

  const changeLayout = (next: CreatorProductsLayout) => {
    setLayout(next);
    if (!user?.id) return;
    try {
      window.localStorage.setItem(productsLayoutKey(user.id), next);
    } catch {
      // ignore quota / private mode
    }
  };
  const [missingProfileFields, setMissingProfileFields] = useState<ProfileReadinessField[]>([]);

  const sticky = useBackToTop(toolbarRef, items.length > 0 && !exploringGroups);

  const {
    query,
    setQuery,
    status,
    setStatus,
    format,
    setFormat,
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
      label: 'Material',
      products: displayPhysicalProducts,
    };
    const virtual = {
      key: 'virtual' as const,
      label: 'Digital',
      products: displayVirtualProducts,
    };
    return sectionOrder === 'virtual-first' ? [virtual, physical] : [physical, virtual];
  }, [displayPhysicalProducts, displayVirtualProducts, sectionOrder]);

  const catalogueSections = useMemo(() => {
    const grouped = new Set<string>();
    const sections: {
      key: string;
      label: string;
      group: MarketplaceProductGroup | null;
      products: MarketplaceProductSummary[];
    }[] = [];
    for (const group of groups) {
      const ids = new Set(group.productIds);
      const products = displayProducts.filter((product) => ids.has(product.id));
      products.forEach((product) => grouped.add(product.id));
      if (products.length > 0) sections.push({ key: group.id, label: group.name, group, products });
    }
    const ungrouped = displayProducts.filter((product) => !grouped.has(product.id));
    if (ungrouped.length > 0) {
      sections.push({ key: 'ungrouped', label: 'Not in a catalogue', group: null, products: ungrouped });
    }
    return sections;
  }, [displayProducts, groups]);

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

  const statusItems = useMemo(
    () =>
      items.filter((product) =>
        status === 'published' ? product.isPublished : status === 'draft' ? !product.isPublished : true
      ),
    [items, status]
  );

  const formatCounts = useMemo(
    () => ({
      all: statusItems.length,
      physical: statusItems.filter((product) => product.type === 'PHYSICAL').length,
      virtual: statusItems.filter((product) => product.type !== 'PHYSICAL').length,
    }),
    [statusItems]
  );

  const groupCounts = useMemo(() => {
    const ids = new Set(statusItems.map((product) => product.id));
    return Object.fromEntries(
      groups.map((group) => [group.id, group.productIds.filter((id) => ids.has(id)).length])
    );
  }, [groups, statusItems]);

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

  const toggleProfileVisibility = async (product: MarketplaceProductSummary) => {
    const wasVisible = product.showOnProfile !== false;
    try {
      setFlagBusyId(product.id);
      setError(null);
      patchProductFlags(product.id, { showOnProfile: !wasVisible });
      const updated = wasVisible
        ? await hideProductFromProfile(product.id)
        : await showProductOnProfile(product.id);
      patchProductFlags(product.id, { showOnProfile: updated.showOnProfile !== false });
    } catch (e) {
      patchProductFlags(product.id, { showOnProfile: wasVisible });
      setError(getApiErrorMessage(e, 'Could not update profile visibility.'));
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

  const openAddToGroup = () => {
    setAddToGroupError(null);
    setAddToGroupOpen(true);
  };

  const addProductsToGroup = async (productIds: string[]) => {
    if (!selectedGroup || productIds.length === 0) return;
    const liveIds = new Set(items.map((product) => product.id));
    const nextIds = [
      ...selectedGroup.productIds.filter((id) => liveIds.has(id)),
      ...productIds.filter((id) => !selectedGroup.productIds.includes(id)),
    ];
    try {
      setAddToGroupSaving(true);
      setAddToGroupError(null);
      const updated = await updateProductGroup(selectedGroup.id, {
        name: selectedGroup.name,
        productIds: nextIds,
      });
      setGroups((prev) => prev.map((group) => (group.id === updated.id ? updated : group)));
      const addedPublished = items.some((product) => productIds.includes(product.id) && product.isPublished);
      const addedDraft = items.some((product) => productIds.includes(product.id) && !product.isPublished);
      if (status === 'published' && !addedPublished && addedDraft) setStatus('draft');
      else if (status === 'draft' && !addedDraft && addedPublished) setStatus('published');
      setAddToGroupOpen(false);
    } catch (e) {
      setAddToGroupError(getApiErrorMessage(e, 'Could not add products to the catalogue.'));
    } finally {
      setAddToGroupSaving(false);
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

  const selectedGroupIds = new Set(selectedGroup?.productIds ?? []);
  const selectedGroupTotalCount = items.filter((product) => selectedGroupIds.has(product.id)).length;
  const selectedGroupStatusCount = selectedGroup ? (groupCounts[selectedGroup.id] ?? 0) : 0;
  const selectedGroupOtherStatusCount =
    status === 'all' ? 0 : selectedGroupTotalCount - selectedGroupStatusCount;
  const selectedGroupEmptyMessage = !selectedGroup
    ? null
    : selectedGroupTotalCount === 0
      ? `“${selectedGroup.name}” is empty.`
      : selectedGroupStatusCount === 0
        ? `No ${status === 'draft' ? 'drafts' : 'published products'} in “${selectedGroup.name}” yet.`
        : `No products in “${selectedGroup.name}” match your search or filters.`;

  const showStatsColumn = items.length > 0;
  const isEmptyGuide = !loading && items.length === 0 && bundles.length === 0;
  const greetingName = user?.fullName?.trim().split(/\s+/)[0] || 'there';
  const profileWarning =
    missingProfileFields.length > 0 ? (
      <ProfileReadinessWarning
        missingFields={missingProfileFields}
        title="Complete your profile first"
        description="Add a real profile photo (not the auto-generated avatar), plus address, phone, email, nationality, link, name, role, and location before you can create a product. Don't worry — it's a mark of trust for your clients."
      />
    ) : null;

  const renderProductCard = (product: MarketplaceProductSummary) => (
    <CreatorProductCard
      key={product.id}
      product={product}
      from="products"
      publishingId={publishingId}
      flagBusyId={flagBusyId}
      onTogglePublish={(p) => void togglePublish(p)}
      onTogglePin={(p) => void togglePin(p)}
      onToggleProfileVisibility={(p) => void toggleProfileVisibility(p)}
      flushOnMobile
    />
  );

  return (
    <div
      className={
        isEmptyGuide
          ? 'relative flex min-h-0 flex-1 flex-col overflow-hidden'
          : 'relative flex-1 space-y-6 pb-20 pt-4 sm:space-y-10 sm:pt-8 xl:pt-10'
      }
    >
      {isEmptyGuide ? (
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-6 px-5 pt-8 sm:px-0 sm:pt-10">
          <h1 className="min-w-0 truncate text-[40px] font-semibold leading-none tracking-[-0.035em] text-[#111111] dark:text-white sm:text-[56px]">
            Hi, {greetingName}
          </h1>
          {profileWarning}
        </div>
      ) : profileWarning ? (
        <div className="px-5 sm:px-0">{profileWarning}</div>
      ) : null}

        <>
          {error && (
            <div className="px-5 sm:px-0">
              <ErrorAlert message={error} onDismiss={() => setError(null)} />
            </div>
          )}

          {loading && items.length === 0 && bundles.length === 0 ? (
            <CreatorStudioProductsTabSkeleton insetOnMobile />
          ) : items.length === 0 && bundles.length === 0 ? (
            <div className="mx-auto flex min-h-0 w-full max-w-[1280px] flex-1 flex-col px-5 pt-2 sm:px-0">
              <CreatorProductsEmptyGuide
                onCreate={() => setProductsView('create')}
                createDisabled={missingProfileFields.length > 0}
              />
            </div>
          ) : (
            <>
              <header className="flex items-center justify-between gap-4 px-5 sm:items-end sm:px-0">
                <div className="min-w-0">
                  <h1 className="text-[1.5rem] font-bold leading-tight tracking-tight text-[#111111] dark:text-white sm:text-4xl">
                    My products
                  </h1>
                  <p className="mt-2 hidden text-base text-neutral-500 dark:text-neutral-400 sm:block">
                    Manage your listings, drafts and catalogues in one place.
                  </p>
                  {!loading && draftCount > 0 ? (
                    <p className="mt-1 inline-flex items-center gap-2 text-[13px] text-neutral-500 dark:text-neutral-400 sm:mt-4 sm:text-[14px]">
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
                ) : (
                  <div className="flex shrink-0 items-center gap-2 xl:hidden">
                    <CreatorStoreSettingsButton />
                    <button
                      type="button"
                      onClick={() => setProductsView('create')}
                      disabled={missingProfileFields.length > 0}
                      aria-label="Publish new item"
                      className={`${PRIMARY_BUTTON_CLASS} h-9 w-9 !rounded-full !px-0 !py-0 sm:h-10 sm:w-auto sm:!rounded-lg sm:!px-5`}
                    >
                      <PlusIcon />
                      <span className="hidden sm:inline">New item</span>
                    </button>
                  </div>
                )}
              </header>

              {bundles.length > 0 && (
                <section className="space-y-5" aria-label="Bundles">
                  <SectionHeading label="Bundles" count={bundles.length} />
                  <div className="grid gap-6 px-5 sm:px-0 md:grid-cols-2">
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
                <section className="min-w-0 flex-1 space-y-6 sm:space-y-10">
                  {exploringGroups ? (
                    <>
                      <BackLink label="Back to products" onClick={() => setExploringGroups(false)} />
                      <div className="px-5 sm:px-0">
                      <CreatorProductGroupsExplorePanel
                        groups={groups}
                        products={items}
                        groupCounts={groupCounts}
                        selectedGroupId={selectedGroupId}
                        onSelectGroup={(groupId) => {
                          setSelectedGroupId(groupId);
                          setExploringGroups(false);
                        }}
                        onEditGroup={openEditGroupModal}
                        onCreateCatalogue={openCreateGroupModal}
                      />
                      </div>
                    </>
                  ) : (
                    <>
                      {items.length > 0 && (
                        <BackToTopButton visible={sticky.visible} onClick={sticky.backToTop} />
                      )}
                      {items.length > 0 && (
                        <div ref={toolbarRef} className="scroll-mt-28 px-5 sm:px-0">
                          <CreatorProductsToolbar
                            query={query}
                            status={status}
                            sort={sort}
                            format={format}
                            formatCounts={formatCounts}
                            groupActive={Boolean(selectedGroupId)}
                            resultCount={displayProducts.length}
                            totalCount={items.length}
                            hasActiveFilters={hasActiveFilters}
                            onSearch={setQuery}
                            onStatusChange={setStatus}
                            onSortChange={setSort}
                            onFormatChange={(next) => {
                              setSelectedGroupId(null);
                              setFormat(next);
                            }}
                            layout={groups.length > 0 ? layout : undefined}
                            onLayoutChange={(next) => {
                              setSelectedGroupId(null);
                              changeLayout(next);
                            }}
                          />
                        </div>
                      )}

                      {items.length > 0 ? (
                        <div className="xl:hidden">
                          <CreatorProductsCatalogueStrip
                            groups={groups}
                            groupCounts={groupCounts}
                            selectedGroupId={selectedGroupId}
                            allCount={formatCounts.all}
                            onSelectGroup={setSelectedGroupId}
                            onCreateGroup={openCreateGroupModal}
                            onExplore={() => {
                              setSelectedGroupId(null);
                              setExploringGroups(true);
                            }}
                          />
                        </div>
                      ) : null}

                      {items.length === 0 ? (
                        <p className="px-5 text-[15px] text-neutral-500 dark:text-neutral-400 sm:px-0">No products yet.</p>
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
                            {selectedGroupEmptyMessage ?? 'No products match your filters.'}
                          </p>
                          {selectedGroup ? (
                            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                              {selectedGroupOtherStatusCount > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setStatus(status === 'draft' ? 'published' : 'draft')}
                                  className={SECONDARY_BUTTON_CLASS}
                                >
                                  {status === 'draft' ? 'See published' : 'See drafts'}
                                </button>
                              ) : selectedGroupTotalCount === 0 ? (
                                <button type="button" onClick={openAddToGroup} className={PRIMARY_BUTTON_CLASS}>
                                  <PlusIcon />
                                  Add products
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => setSelectedGroupId(null)}
                                className={SECONDARY_BUTTON_CLASS}
                              >
                                Show all products
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : layout === 'catalogues' && groups.length > 0 && !selectedGroup ? (
                        <div className="divide-y divide-black/[0.08] dark:divide-white/[0.08]">
                          {catalogueSections.map((section) => (
                            <section
                              key={section.key}
                              className="space-y-6 py-12 first:pt-0 last:pb-0 sm:py-20"
                              aria-label={section.label}
                            >
                              <SectionHeading label={section.label} count={section.products.length}>
                                {section.group ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedGroupId(section.group!.id)}
                                    className="group/open inline-flex items-center gap-1 text-[14px] font-medium text-neutral-500 transition-colors hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white"
                                  >
                                    Open
                                    <svg
                                      className="h-3.5 w-3.5 transition-transform group-hover/open:translate-x-0.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      aria-hidden
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                ) : null}
                              </SectionHeading>
                              <div className={creatorProductGridClassName}>{section.products.map(renderProductCard)}</div>
                            </section>
                          ))}
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
                          <div className={creatorProductGridClassName}>
                            {displayProducts.map(renderProductCard)}
                            {selectedGroup ? (
                              <button
                                type="button"
                                onClick={openAddToGroup}
                                className="group/add mx-5 flex min-h-[18rem] flex-col sm:mx-0 items-center justify-center gap-3 rounded-lg border border-dashed border-black/[0.14] px-6 py-10 text-center transition-colors duration-200 hover:border-black/30 hover:bg-black/[0.02] dark:border-white/[0.14] dark:hover:border-white/30 dark:hover:bg-white/[0.02]"
                              >
                                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-black/[0.1] text-neutral-500 transition-all duration-200 group-hover/add:scale-105 group-hover/add:border-[#111111] group-hover/add:bg-[#111111] group-hover/add:text-white dark:border-white/[0.14] dark:text-neutral-400 dark:group-hover/add:border-white dark:group-hover/add:bg-white dark:group-hover/add:text-[#111111]">
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                  </svg>
                                </span>
                                <span>
                                  <span className="block text-[15px] font-semibold text-[#111111] dark:text-white">
                                    Add products
                                  </span>
                                  <span className="mt-0.5 block text-[13px] text-neutral-500 dark:text-neutral-400">
                                    to {selectedGroup.name}
                                  </span>
                                </span>
                              </button>
                            ) : null}
                          </div>
                        </section>
                      )}
                    </>
                  )}
                </section>

                {items.length > 0 && (
                  <aside className="hidden w-72 shrink-0 xl:sticky xl:top-8 xl:block">
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
                      groupCounts={groupCounts}
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

      <CreatorProductCreateModal
        open={view === 'create'}
        productFormat={productFormat}
        onFormatChange={setProductFormat}
        onClose={() => setProductsView('list')}
        onCreated={(productTitle) => onProductCreated(productTitle)}
      />

      <CreatorCatalogueAddProductsModal
        open={addToGroupOpen}
        group={selectedGroup}
        products={items}
        saving={addToGroupSaving}
        error={addToGroupError}
        onClose={() => setAddToGroupOpen(false)}
        onAdd={(productIds) => void addProductsToGroup(productIds)}
        onCreateProduct={() => {
          setAddToGroupOpen(false);
          setProductsView('create');
        }}
      />

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
