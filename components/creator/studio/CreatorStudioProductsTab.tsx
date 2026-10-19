'use client';

import { trPlural } from '@/lib/i18n/active';
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
import { CreatorProductCard } from '@/components/creator/CreatorProductCard';
import { CreatorProductListRow } from '@/components/creator/CreatorProductListRow';
import { CreatorProductGroupModal } from '@/components/creator/CreatorProductGroupModal';
import { CreatorCatalogueAddProductsModal } from '@/components/creator/CreatorCatalogueAddProductsModal';
import { CreatorStoreSettingsModal } from '@/components/creator/CreatorStoreSettingsModal';
import { ContentPostDialogShell } from '@/components/creator/ContentPostDialogShell';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import { ALL_ICON, RailGlyph } from '@/components/home/NewsDiscoverRail';
import { BOX_TITLE, ProviderRailSwitch, SpecialtyRow } from '@/components/marketplace/ProviderDiscoverRail';
import { filterChipClass, PRODUCT_FORMAT_OPTIONS } from '@/components/marketplace/MarketplaceProductFilters';
import {
  CloseIcon,
  parseView,
  RailToggleGlyph,
  railRoundButtonClass,
  SearchIcon,
  SlidersIcon,
  SortMenu,
  useRailFold,
  useStoredChoice,
  VIEW_GRID_CLASS,
  ViewSwitch,
} from '@/components/marketplace/CatalogRailKit';
import { CreatorProductGroupsExplorePanel } from '@/components/creator/CreatorProductGroupsExplorePanel';
import { CreatorProductCreateModal } from '@/components/creator/CreatorProductCreateModal';
import { CreatorProductsEmptyGuide } from '@/components/creator/studio/CreatorProductsEmptyGuide';
import { ProfileReadinessWarning } from '@/components/creator/studio/ProfileReadinessWarning';
import type { ProductFormat } from '@/components/marketplace/product-editor-steps';
import { useCreatorProductsFilter, type CreatorProductSort } from '@/components/creator/useCreatorProductsFilter';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioProductsTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { useAuth } from '@/context/AuthContext';
import { BackToTopButton, useBackToTop } from '@/components/ui/ScrollUpStickyBar';
import api from '@/lib/api';
import {
  getMissingProfileReadinessFields,
  type ProfileReadinessField,
} from '@/lib/creator-profile-readiness';
import type { CreatorProfileDto } from '@/types/profile';
import type {
  MarketplaceBundleSummary,
  MarketplaceProductGroup,
  MarketplaceProductSummary,
} from '@/types/marketplace';
import { ListSectionHeading } from '@/components/ui/ListSectionHeading';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

type ProductsView = 'list' | 'create';
type FormatSectionOrder = 'physical-first' | 'virtual-first';

type CreatorProductsLayout = 'all' | 'catalogues';

/* Every action on the page is a pill (News / My services): ink fill for the primary, a 1px ring for
   the secondary — on the theme's tokens. */
const PRIMARY_BUTTON_CLASS =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[color:var(--gn-primary)] px-5 text-[15px] font-semibold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';
const SECONDARY_BUTTON_CLASS =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[color:var(--gn-hover)] dark:shadow-[inset_0_0_0_1px_#536471] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';
/** "Nothing here" blocks: the card tone, no dashed frame (My services' empty filter block). */
const EMPTY_FRAME_CLASS = 'mx-5 bg-[color:var(--gn-surface)] px-6 py-12 text-center sm:mx-0';
/** The rail's primary — News's "Publish a post" pill. */
const RAIL_PRIMARY_CLASS =
  'inline-flex h-12 w-full items-center justify-center gap-2 !rounded-full bg-[color:var(--gn-primary)] text-[15px] font-semibold leading-5 text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] disabled:cursor-not-allowed disabled:opacity-40';
/** A rail row (the Specialty / Format rows' shape) for links and actions. */
const RAIL_ROW =
  'group/row flex w-full items-center gap-3 px-6 py-3.5 text-left text-[15px] font-semibold leading-5 text-[color:var(--gn-ink)] transition-colors duration-150 hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)]';
/** Catalogue rows shown in the rail before "Explore all". */
const RAIL_CATALOGUES_LIMIT = 6;

const SORT_OPTIONS: { value: CreatorProductSort; label: string }[] = [
  { value: 'newest', label: msg('Most recent') },
  { value: 'oldest', label: msg('Oldest') },
  { value: 'title', label: msg('Title A–Z') },
  { value: 'price_asc', label: msg('Price: low to high') },
  { value: 'price_desc', label: msg('Price: high to low') },
  { value: 'views', label: msg('Most viewed') },
  { value: 'bestseller', label: msg('Best sellers') },
];

/** Stacked sheets: a catalogue. */
const CATALOGUE_GLYPH = (
  <>
    <path d="M12 3.5 21 8l-9 4.5L3 8z" />
    <path d="m3 12 9 4.5 9-4.5" />
    <path d="m3 16 9 4.5 9-4.5" />
  </>
);

/** A storefront: the shop as clients see it. */
const STOREFRONT_GLYPH = (
  <>
    <path d="M4 9.5 5.5 4h13L20 9.5" />
    <path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
    <path d="M5.5 12v8h13v-8" />
    <path d="M10 20v-4.5h4V20" />
  </>
);

const GEAR_GLYPH = (
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </>
);

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-[color:var(--gn-ink2)] transition-transform duration-200 group-hover/row:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

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
      className="mx-5 inline-flex min-h-10 items-center gap-1.5 text-[15px] font-semibold text-[color:var(--gn-ink2)] transition-colors hover:text-[color:var(--gn-ink)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] sm:mx-1"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}

/** A group's title inside the list ("Material 28", a catalogue): 17px ink, the count secondary. */
function SectionHeading({ label, count, children }: { label: string; count: number; children?: ReactNode }) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-3 px-5 sm:px-1">
      <h2 className="flex min-w-0 items-baseline gap-2 text-[17px] font-bold leading-[22px] tracking-[-0.01em] text-[color:var(--gn-ink)]">
        <span className="truncate">{label}</span>
        <span className="shrink-0 text-[15px] font-medium tabular-nums text-[color:var(--gn-ink2)]">{count}</span>
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
  const t = useT();
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

  /* Per-viewer conveniences (browser storage): the view (Products' three) and the folded rail. */
  const [catView, setCatView] = useStoredChoice('my-products.view', parseView, 'compact');
  const [rail, setRail] = useRailFold('my-products.rail');
  const folded = rail === 'folded';
  const [sheetOpen, setSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  /* Unfolds the rail, then (search) puts the caret in its field once the rail has rendered. */
  const focusSearchRef = useRef(false);
  const openRail = (focusSearch = false) => {
    focusSearchRef.current = focusSearch;
    setRail('open');
  };
  useEffect(() => {
    if (rail !== 'open' || !focusSearchRef.current) return;
    focusSearchRef.current = false;
    document.getElementById('mp-side')?.focus();
  }, [rail]);

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
      label: t('Material'),
      products: displayPhysicalProducts,
    };
    const virtual = {
      key: 'virtual' as const,
      label: t('Digital'),
      products: displayVirtualProducts,
    };
    return sectionOrder === 'virtual-first' ? [virtual, physical] : [physical, virtual];
  }, [displayPhysicalProducts, displayVirtualProducts, sectionOrder, t]);

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
      sections.push({ key: 'ungrouped', label: t('Not in a catalogue'), group: null, products: ungrouped });
    }
    return sections;
  }, [displayProducts, groups, t]);

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
      setError(getApiErrorMessage(e, t('Unable to load your products.')));
      setItems([]);
      setBundles([]);
      setGroups([]);
    } finally {
      if (seq === loadSeq.current) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const wantsCreate = searchParams.get('create') === '1';
    if (wantsCreate && missingProfileFields.length > 0) {
      setView('list');
      router.replace('/my-products', { scroll: false });
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
      next === 'create' ? '/my-products?create=1' : '/my-products',
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
      setError(getApiErrorMessage(e, t('Could not update publication status.')));
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
      setError(getApiErrorMessage(e, t('Could not update pin.')));
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
      setError(getApiErrorMessage(e, t('Could not update profile visibility.')));
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
      setGroupError(getApiErrorMessage(e, t('Could not save the catalogue.')));
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
      setAddToGroupError(getApiErrorMessage(e, t('Could not add products to the catalogue.')));
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
      setGroupError(getApiErrorMessage(e, t('Could not delete the catalogue.')));
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

  const isEmptyGuide = !loading && items.length === 0 && bundles.length === 0;
  const greetingName = user?.fullName?.trim().split(/\s+/)[0] || 'there';
  const createDisabled = missingProfileFields.length > 0;
  const storefrontHref = user?.id ? `/providers/${user.id}/shop` : '/studio';
  const profileWarning =
    missingProfileFields.length > 0 ? (
      <ProfileReadinessWarning
        missingFields={missingProfileFields}
        title={t('Complete your profile first')}
        description={t('Add a real profile photo (not the auto-generated avatar), plus address, phone, email, nationality, link, name, role, and location before you can create a product. Don\'t worry — it\'s a mark of trust for your clients.')}
      />
    ) : null;

  const renderProduct = (product: MarketplaceProductSummary) =>
    catView === 'list' ? (
      <CreatorProductListRow
        key={product.id}
        product={product}
        publishingId={publishingId}
        flagBusyId={flagBusyId}
        onTogglePublish={(p) => void togglePublish(p)}
        onTogglePin={(p) => void togglePin(p)}
        onToggleProfileVisibility={(p) => void toggleProfileVisibility(p)}
      />
    ) : (
      <CreatorProductCard
        key={product.id}
        product={product}
        from="products"
        publishingId={publishingId}
        flagBusyId={flagBusyId}
        onTogglePublish={(p) => void togglePublish(p)}
        onTogglePin={(p) => void togglePin(p)}
        onToggleProfileVisibility={(p) => void toggleProfileVisibility(p)}
      />
    );
  const productsClass = catView === 'list' ? 'flex min-w-0 flex-col gap-2 sm:gap-3' : VIEW_GRID_CLASS[rail][catView];

  const publishedCount = items.length - draftCount;
  const grouped = layout === 'catalogues' && groups.length > 0;
  const formatLabel = format === 'physical' ? t('Material') : format === 'virtual' ? t('Digital') : null;
  /* Narrowing filters (the order and the Published / Draft tab are not filters here). */
  const activeFilterCount = (query.trim() ? 1 : 0) + (format !== 'all' ? 1 : 0) + (selectedGroup ? 1 : 0);
  const narrowed = activeFilterCount > 0;
  const clearNarrowing = () => {
    setQuery('');
    setFormat('all');
    setSelectedGroupId(null);
  };
  const pickFormat = (next: typeof format) => {
    setSelectedGroupId(null);
    setFormat(next);
  };
  const pickGroup = (groupId: string | null) => {
    setExploringGroups(false);
    setSelectedGroupId(groupId);
  };
  const exploreGroups = () => {
    setSelectedGroupId(null);
    setExploringGroups(true);
  };

  /* The search: a pill on the card tone, an ink ring when focused — the rails' pill. */
  const searchField = (id: string) => (
    <form onSubmit={(event) => event.preventDefault()} className="min-w-0 flex-1">
      <div className="relative h-11 w-full min-w-0 rounded-full bg-[color:var(--gn-surface)] transition-[background-color,box-shadow] focus-within:bg-[color:var(--gn-inset)] focus-within:shadow-[inset_0_0_0_2px_var(--gn-ink)]">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[color:var(--gn-ink2)]" />
        <label htmlFor={id} className="sr-only">
          {t('Search your products')}
        </label>
        <input
          id={id}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          enterKeyHint="search"
          autoComplete="off"
          placeholder={t('Search title or tag')}
          className="h-full w-full rounded-full border-0 bg-transparent p-0 pl-11 pr-12 text-[16px] text-[color:var(--gn-ink)] placeholder:text-[color:var(--gn-ink2)] focus:outline-hidden focus:ring-0 sm:text-[15px] [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            title={t('Clear search')}
            aria-label={t('Clear search')}
            className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)]"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </form>
  );

  const formatRows = (
    <nav aria-label={t('Product format')} className="flex w-full flex-col">
      <SpecialtyRow label={t('All')} icon={ALL_ICON} active={format === 'all'} count={formatCounts.all} onClick={() => pickFormat('all')} />
      {PRODUCT_FORMAT_OPTIONS.map((option) => (
        <SpecialtyRow
          key={option.id}
          label={t(option.label)}
          icon={option.icon}
          active={format === option.id}
          count={formatCounts[option.id]}
          onClick={() => pickFormat(format === option.id ? 'all' : option.id)}
        />
      ))}
    </nav>
  );

  const railGroups = groups.slice(0, RAIL_CATALOGUES_LIMIT);

  /* Status tabs — My services' underline tabs: a hairline under the bar, a 2px ink rule under the
     current one, the count beside each label. */
  const statusTabs = (
    <div
      role="group"
      aria-label={t('Filter by status')}
      className="mx-5 flex gap-8 shadow-[inset_0_-1px_0_#EFF3F4] dark:shadow-[inset_0_-1px_0_#2F3336] sm:mx-0"
    >
      {(
        [
          { id: 'published', label: t('Published'), count: publishedCount },
          { id: 'draft', label: t('Drafts'), count: draftCount },
        ] as const
      ).map((tab) => {
        const selected = status === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatus(tab.id)}
            aria-pressed={selected}
            data-pf-no-color-transition
            className={`relative inline-flex h-12 shrink-0 items-center gap-1.5 text-[15px] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)] ${
              selected ? 'font-bold text-[color:var(--gn-ink)]' : 'font-medium text-[color:var(--gn-ink2)] hover:text-[color:var(--gn-ink)]'
            }`}
          >
            {t(tab.label)}
            {tab.count > 0 ? <span className="text-[13px] font-normal tabular-nums text-[color:var(--gn-ink2)]">{tab.count}</span> : null}
            {selected ? <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-[color:var(--gn-ink)]" /> : null}
          </button>
        );
      })}
    </div>
  );

  /* Heading line, like News's "Latest": what the list shows (17px bold + count), then Sort and the view. */
  const sectionLine = (
    <div ref={toolbarRef} className="flex scroll-mt-24 flex-col gap-1 px-5 sm:px-1">
      <div className="flex min-h-8 items-center justify-between gap-4">
        <ListSectionHeading
          as="p"
          live
          title={status === 'draft' ? t('Drafts') : t('Published')}
          count={displayProducts.length}
          details={[formatLabel, selectedGroup?.name]}
        />
        <div className="flex shrink-0 items-center gap-3">
          <SortMenu value={sort} options={SORT_OPTIONS} menuLabel={t('Sort your products')} onChange={setSort} />
          <span aria-hidden className="h-4 w-px bg-[color:var(--gn-line)]" />
          <ViewSwitch value={catView} rail={rail} onChange={setCatView} />
        </div>
      </div>
      {narrowed ? (
        <p className="flex min-w-0 items-center gap-1.5 text-[14px] leading-5 text-[color:var(--gn-ink2)]">
          <span className="shrink-0">{t('Filtered by:')}</span>
          <span className="truncate font-semibold text-[color:var(--gn-ink)]">
            {[query.trim() ? `“${query.trim()}”` : '', formatLabel ?? '', selectedGroup?.name ?? ''].filter(Boolean).join(' · ')}
          </span>
          <span aria-hidden className="shrink-0 text-[color:var(--gn-ink3)]">
            ·
          </span>
          <button
            type="button"
            onClick={clearNarrowing}
            className="shrink-0 font-medium text-[color:var(--gn-ink)] underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
          >
            {t('Clear')}
          </button>
        </p>
      ) : null}
    </div>
  );

  const swapButton = (
    <button
      type="button"
      onClick={swapFormatSections}
      aria-label={t('Swap the Material and Digital sections')}
      title={t('Swap Material / Digital order')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)]"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    </button>
  );

  const productsBody =
    items.length === 0 ? (
      <p className="px-5 text-[15px] text-[color:var(--gn-ink2)] sm:px-1">{t('No products yet.')}</p>
    ) : filtered.length === 0 ? (
      <div className={EMPTY_FRAME_CLASS}>
        <p className="text-[17px] font-bold leading-[22px] text-[color:var(--gn-ink)]">{t('No products match these filters')}</p>
        <p className="mt-1.5 text-[14px] leading-5 text-[color:var(--gn-ink2)]">{t('Change the search, the format or the tab.')}</p>
        <button type="button" onClick={resetFilters} className={`${SECONDARY_BUTTON_CLASS} mt-5`}>
          {t('Clear filters')}
        </button>
      </div>
    ) : displayProducts.length === 0 ? (
      <div className={EMPTY_FRAME_CLASS}>
        <p className="text-[15px] leading-5 text-[color:var(--gn-ink2)]">{selectedGroupEmptyMessage ?? t('No products match your filters.')}</p>
        {selectedGroup ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {selectedGroupOtherStatusCount > 0 ? (
              <button type="button" onClick={() => setStatus(status === 'draft' ? 'published' : 'draft')} className={SECONDARY_BUTTON_CLASS}>
                {status === 'draft' ? t('See published') : t('See drafts')}
              </button>
            ) : selectedGroupTotalCount === 0 ? (
              <button type="button" onClick={openAddToGroup} className={PRIMARY_BUTTON_CLASS}>
                <PlusIcon />
                {t('Add products')}
              </button>
            ) : null}
            <button type="button" onClick={() => setSelectedGroupId(null)} className={SECONDARY_BUTTON_CLASS}>
              {t('Show all products')}
            </button>
          </div>
        ) : null}
      </div>
    ) : grouped && !selectedGroup ? (
      <div className="flex flex-col gap-10">
        {catalogueSections.map((section) => (
          <section key={section.key} className="flex flex-col gap-3" aria-label={t(section.label)}>
            <SectionHeading label={t(section.label)} count={section.products.length}>
              {section.group ? (
                <button
                  type="button"
                  onClick={() => setSelectedGroupId(section.group!.id)}
                  className="group/row inline-flex items-center gap-1 text-[14px] font-semibold text-[color:var(--gn-ink2)] transition-colors hover:text-[color:var(--gn-ink)]"
                >
                  {t('Open')}
                  <ChevronRight />
                </button>
              ) : null}
            </SectionHeading>
            <div className={productsClass} data-rail-fold="cards">{section.products.map(renderProduct)}</div>
          </section>
        ))}
      </div>
    ) : format === 'all' && !selectedGroup ? (
      <div className="flex flex-col gap-10">
        {formatSections.map((section, index) => {
          if (section.products.length === 0) return null;
          const previousVisible = formatSections.slice(0, index).some((entry) => entry.products.length > 0);
          return (
            <section key={section.key} className="flex flex-col gap-3" aria-label={`${section.label} products`}>
              <SectionHeading label={t(section.label)} count={section.products.length}>
                {displayPhysicalProducts.length > 0 && displayVirtualProducts.length > 0 && !previousVisible ? swapButton : null}
              </SectionHeading>
              <div className={productsClass} data-rail-fold="cards">{section.products.map(renderProduct)}</div>
            </section>
          );
        })}
      </div>
    ) : (
      <section className="flex flex-col gap-3">
        {selectedGroup ? (
          <SectionHeading label={selectedGroup.name} count={displayProducts.length}>
            <button
              type="button"
              onClick={() => openEditGroupModal(selectedGroup)}
              className="text-[14px] font-semibold text-[color:var(--gn-ink2)] transition-colors hover:text-[color:var(--gn-ink)]"
            >
              {t('Edit catalogue')}
            </button>
          </SectionHeading>
        ) : null}
        <div className={productsClass} data-rail-fold="cards">
          {displayProducts.map(renderProduct)}
          {selectedGroup ? (
            <button
              type="button"
              onClick={openAddToGroup}
              className={`group/add mx-5 flex flex-col items-center justify-center gap-3 px-6 py-10 text-center shadow-[inset_0_0_0_1px_var(--gn-line)] transition-colors hover:bg-[color:var(--gn-hover)] sm:mx-0 ${
                catView === 'list' ? '' : 'min-h-[16rem]'
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_var(--gn-line)] transition-colors group-hover/add:bg-[color:var(--gn-ink)] group-hover/add:text-[color:var(--gn-surface)]">
                <PlusIcon />
              </span>
              <span>
                <span className="block text-[15px] font-bold text-[color:var(--gn-ink)]">{t('Add products')}</span>
                <span className="mt-0.5 block text-[13px] text-[color:var(--gn-ink2)]">{t('to {name}', { name: selectedGroup.name })}</span>
              </span>
            </button>
          ) : null}
        </div>
      </section>
    );

  /* The rail, open (lg+): search + fold, the primary, Format, Catalogues, then the shop's links.
     Taller than most screens with several catalogues, so it scrolls inside itself; the primary sits
     right under the search so it never scrolls out of reach. */
  const railPanel = (
    <ProfileSectionStickyAside key="open" scrollable className="w-full" surfaceClassName="flex w-full max-w-full min-w-0 flex-col gap-6 pb-6">
      <div className="flex items-center gap-2">
        {searchField('mp-side')}
        <button
          type="button"
          onClick={() => setRail('folded')}
          aria-label={t('Hide the panel')}
          title={t('Hide the panel')}
          className={`${railRoundButtonClass} hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]`}
        >
          <RailGlyph>
            <RailToggleGlyph folded={false} />
          </RailGlyph>
        </button>
      </div>

      <button type="button" onClick={() => setProductsView('create')} disabled={createDisabled} className={RAIL_PRIMARY_CLASS}>
        <PlusIcon />
        {t('Publish new item')}
      </button>

      <section className="gn-rail-box flex min-h-0 flex-col px-px pb-2 pt-5" aria-labelledby="my-products-format-title">
        <h2 id="my-products-format-title" className={BOX_TITLE}>
          {t('Format')}
        </h2>
        {formatRows}
      </section>

      <section className="gn-rail-box flex min-h-0 flex-col px-px pb-2 pt-5" aria-labelledby="my-products-catalogues-title">
        <div className="flex items-center justify-between pr-4">
          <h2 id="my-products-catalogues-title" className={BOX_TITLE}>
            {t('Catalogues')}
          </h2>
          <button
            type="button"
            onClick={openCreateGroupModal}
            className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-[14px] font-semibold text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover)]"
          >
            <PlusIcon />
            {t('New')}
          </button>
        </div>
        {groups.length === 0 ? (
          <p className="px-6 pb-3 text-[14px] leading-5 text-[color:var(--gn-ink2)]">{t('Group products into catalogues your clients can browse.')}</p>
        ) : (
          <nav aria-label={t('Catalogues')} className="flex w-full flex-col">
            <SpecialtyRow label={t('All products')} icon={ALL_ICON} active={!selectedGroupId && !exploringGroups} count={formatCounts.all} onClick={() => pickGroup(null)} />
            {railGroups.map((group) => {
              const active = selectedGroupId === group.id && !exploringGroups;
              return (
                <SpecialtyRow
                  key={group.id}
                  label={group.name}
                  icon={CATALOGUE_GLYPH}
                  active={active}
                  count={groupCounts[group.id] ?? group.productCount}
                  onClick={() => pickGroup(active ? null : group.id)}
                />
              );
            })}
            <button type="button" onClick={exploreGroups} aria-pressed={exploringGroups} className={`${RAIL_ROW} !text-[color:var(--gn-ink2)] hover:!text-[color:var(--gn-ink)]`}>
              <span className="min-w-0 flex-1 truncate">
                {t('Explore all')}{groups.length > RAIL_CATALOGUES_LIMIT ? ` (${groups.length})` : ''}
              </span>
              <ChevronRight />
            </button>
            <ProviderRailSwitch label={t('Group by catalogue')} checked={layout === 'catalogues'} onChange={(next) => changeLayout(next ? 'catalogues' : 'all')} />
          </nav>
        )}
      </section>

      <section className="gn-rail-box flex min-h-0 flex-col px-px py-2" aria-label={t('Your shop')}>
        <a href={storefrontHref} target="_blank" rel="noreferrer" className={RAIL_ROW}>
          <RailGlyph>{STOREFRONT_GLYPH}</RailGlyph>
          <span className="min-w-0 flex-1 truncate">{t('View your shop')}</span>
          <ChevronRight />
        </a>
        <button type="button" onClick={() => setSettingsOpen(true)} className={RAIL_ROW}>
          <RailGlyph>{GEAR_GLYPH}</RailGlyph>
          <span className="min-w-0 flex-1 truncate">{t('Store settings')}</span>
          <ChevronRight />
        </button>
      </section>
    </ProfileSectionStickyAside>
  );

  /* The rail, folded: News's quick bar — 40px round buttons, the fold / search / filters, then a
     solid "+" for the primary. */
  const foldedRail = (
    <ProfileSectionStickyAside key="folded" className="w-11" surfaceClassName="flex w-11 flex-col items-center gap-2">
      <button type="button" onClick={() => openRail()} aria-label={t('Show the panel')} title={t('Show the panel')} className={`${railRoundButtonClass} hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]`}>
        <RailGlyph>
          <RailToggleGlyph folded />
        </RailGlyph>
      </button>
      <span aria-hidden className="my-1 h-px w-6 bg-[#d6dee3] dark:bg-[#2f3336]" />
      <button
        type="button"
        onClick={() => openRail(true)}
        aria-label={t('Search your products')}
        title={t('Search your products')}
        className={`${railRoundButtonClass} ${query ? 'bg-[color:var(--gn-surface)]' : ''} hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]`}
      >
        <SearchIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => openRail()}
        aria-label={activeFilterCount > 0 ? t('Filters ({activeFilterCount} active)', { activeFilterCount }) : t('Filters')}
        title={t('Filters')}
        className={`${railRoundButtonClass} hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]`}
      >
        <SlidersIcon className="h-[18px] w-[18px]" />
        {activeFilterCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[color:var(--gn-ink)] px-1 text-[10px] font-bold tabular-nums text-[color:var(--gn-surface)] ring-2 ring-[#FFFFFF] dark:ring-[#000000]">
            {activeFilterCount}
          </span>
        ) : null}
      </button>
      <button
        type="button"
        onClick={() => setProductsView('create')}
        disabled={createDisabled}
        aria-label={t('Publish new item')}
        title={t('Publish new item')}
        className={`${railRoundButtonClass} mt-1 bg-[color:var(--gn-primary)] !text-[color:var(--gn-primary-ink)] hover:bg-[color:var(--gn-primary-hover)] disabled:opacity-40`}
      >
        <PlusIcon />
      </button>
    </ProfileSectionStickyAside>
  );

  return (
    <div className={isEmptyGuide ? 'relative flex min-h-0 flex-1 flex-col overflow-hidden' : 'relative flex-1 pb-24 pt-2 sm:pt-4 lg:pt-3'}>
      {isEmptyGuide ? (
        <>
          <div className="flex w-full items-center justify-between gap-6 px-5 pt-8 sm:px-0 sm:pt-10">
            <h1 className="min-w-0 truncate text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-[color:var(--gn-ink)] sm:text-[34px]">
              {t('Hi, {greetingName}', { greetingName })}
            </h1>
            {profileWarning}
          </div>
          <div className="flex min-h-0 w-full flex-1 flex-col px-5 pt-2 sm:px-0">
            <CreatorProductsEmptyGuide onCreate={() => setProductsView('create')} createDisabled={createDisabled} />
          </div>
        </>
      ) : loading && items.length === 0 && bundles.length === 0 ? (
        <CreatorStudioProductsTabSkeleton insetOnMobile />
      ) : (
        <>
          <h1 className="sr-only">{t('My products')}</h1>

          {/* Phones / tablets: every filter in one bottom sheet (portalled to <body>, so it re-opens the
              News scope). Choices apply at once; the footer closes the sheet. */}
          <ContentPostDialogShell open={sheetOpen} title={t('Filters')} onClose={() => setSheetOpen(false)}>
            <div className="news-theme news-feed news-mono">
              <div className="space-y-7 px-5 pb-4 pt-1">
                <section>
                  <p className="gn-kicker pb-3">{t('Format')}</p>
                  <div className="flex flex-wrap gap-2">
                    {([{ id: 'all', label: t('All') }, ...PRODUCT_FORMAT_OPTIONS] as { id: typeof format; label: string }[]).map((option) => (
                      <button key={option.id} type="button" aria-pressed={format === option.id} onClick={() => pickFormat(option.id)} className={filterChipClass(format === option.id)}>
                        {t(option.label)}
                      </button>
                    ))}
                  </div>
                </section>
                <section>
                  <div className="flex items-center justify-between pb-3">
                    <p className="gn-kicker">{t('Catalogues')}</p>
                    <button type="button" onClick={openCreateGroupModal} className="inline-flex h-8 items-center gap-1 text-[13px] font-semibold text-[color:var(--gn-ink)]">
                      <PlusIcon />
                      {t('New')}
                    </button>
                  </div>
                  {groups.length > 0 ? (
                    <>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" aria-pressed={!selectedGroupId} onClick={() => pickGroup(null)} className={filterChipClass(!selectedGroupId)}>
                          {t('All')}
                        </button>
                        {groups.map((group) => (
                          <button
                            key={group.id}
                            type="button"
                            aria-pressed={selectedGroupId === group.id}
                            onClick={() => pickGroup(selectedGroupId === group.id ? null : group.id)}
                            className={filterChipClass(selectedGroupId === group.id)}
                          >
                            {group.name}
                          </button>
                        ))}
                      </div>
                      <div className="-mx-5 mt-3">
                        <ProviderRailSwitch label={t('Group by catalogue')} checked={layout === 'catalogues'} onChange={(next) => changeLayout(next ? 'catalogues' : 'all')} />
                      </div>
                    </>
                  ) : (
                    <p className="text-[14px] leading-5 text-[color:var(--gn-ink2)]">{t('No catalogues yet.')}</p>
                  )}
                </section>
                <section className="-mx-5">
                  <p className="gn-kicker px-5 pb-1">{t('Your shop')}</p>
                  <a href={storefrontHref} target="_blank" rel="noreferrer" className={RAIL_ROW}>
                    <RailGlyph>{STOREFRONT_GLYPH}</RailGlyph>
                    <span className="min-w-0 flex-1 truncate">{t('View your shop')}</span>
                    <ChevronRight />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSheetOpen(false);
                      setSettingsOpen(true);
                    }}
                    className={RAIL_ROW}
                  >
                    <RailGlyph>{GEAR_GLYPH}</RailGlyph>
                    <span className="min-w-0 flex-1 truncate">{t('Store settings')}</span>
                    <ChevronRight />
                  </button>
                </section>
              </div>
              <div className="sticky bottom-0 flex items-center justify-between gap-4 bg-white px-5 pb-5 pt-3 dark:bg-black">
                {narrowed ? (
                  <button type="button" onClick={clearNarrowing} className="text-[14px] font-semibold text-[color:var(--gn-ink)] underline underline-offset-4">
                    {t('Clear all filters')}
                  </button>
                ) : (
                  <span />
                )}
                <button type="button" onClick={() => setSheetOpen(false)} className={`${PRIMARY_BUTTON_CLASS} h-11`}>
                  {t('Show')} {displayProducts.length} {trPlural(displayProducts.length, 'product', 'products')}
                </button>
              </div>
            </div>
          </ContentPostDialogShell>

          {/* The News / Products frame: the list, then the sticky rail (340px, 400px from xl) — or,
              folded, a 44px strip that gives the grid one more card per row. */}
          <div
            className={`grid w-full items-start gap-8 ${
              folded
                ? 'lg:grid-cols-[minmax(0,1fr)_44px] lg:gap-6'
                : 'lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12'
            }`}
          >
            <main className="flex min-w-0 flex-col gap-3" aria-label={t('Your products')}>
              {profileWarning ? <div className="px-5 sm:px-0">{profileWarning}</div> : null}
              {error ? (
                <div className="px-5 sm:px-0">
                  <ErrorAlert message={error} onDismiss={() => setError(null)} />
                </div>
              ) : null}

              {/* Below lg (no rail): search, Filters, and the primary as a round "+". */}
              <div className="flex items-center gap-2 px-5 pt-1 sm:px-0 lg:hidden">
                {searchField('mp')}
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  aria-label={activeFilterCount > 0 ? t('Filters ({activeFilterCount} active)', { activeFilterCount }) : t('Filters')}
                  className={`${railRoundButtonClass} bg-[color:var(--gn-surface)] hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]`}
                >
                  <SlidersIcon className="h-[18px] w-[18px]" />
                  {activeFilterCount > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[color:var(--gn-ink)] px-1 text-[10px] font-bold tabular-nums text-[color:var(--gn-surface)] ring-2 ring-[#FFFFFF] dark:ring-[#000000]">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => setProductsView('create')}
                  disabled={createDisabled}
                  aria-label={t('Publish new item')}
                  className={`${railRoundButtonClass} bg-[color:var(--gn-primary)] !text-[color:var(--gn-primary-ink)] hover:bg-[color:var(--gn-primary-hover)] disabled:opacity-40`}
                >
                  <PlusIcon />
                </button>
              </div>

              {exploringGroups ? (
                <>
                  <BackLink label={t('Back to products')} onClick={() => setExploringGroups(false)} />
                  <div className="px-5 sm:px-0">
                    <CreatorProductGroupsExplorePanel
                      groups={groups}
                      products={items}
                      groupCounts={groupCounts}
                      selectedGroupId={selectedGroupId}
                      onSelectGroup={(groupId) => pickGroup(groupId)}
                      onEditGroup={openEditGroupModal}
                      onCreateCatalogue={openCreateGroupModal}
                    />
                  </div>
                </>
              ) : (
                <>
                  {items.length > 0 ? <BackToTopButton visible={sticky.visible} onClick={sticky.backToTop} /> : null}
                  {items.length > 0 ? statusTabs : null}
                  {items.length > 0 ? <div className="pt-2">{sectionLine}</div> : null}

                  {bundles.length > 0 && status === 'published' && !narrowed ? (
                    <section className="flex flex-col gap-3 pb-6" aria-label={t('Bundles')}>
                      <SectionHeading label={t('Bundles')} count={bundles.length} />
                      <div className="grid gap-2 px-5 sm:gap-5 sm:px-0 md:grid-cols-2">
                        {bundles.map((bundle) => (
                          <CreatorBundleCard key={bundle.id} bundle={bundle} isAuthenticated={Boolean(user)} loginRedirect="/my-products" />
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {productsBody}
                </>
              )}
            </main>

            <div className="hidden self-start lg:block" data-rail-fold="rail">
              {folded ? foldedRail : railPanel}
            </div>
          </div>
        </>
      )}

      <CreatorStoreSettingsModal open={settingsOpen} storefrontHref={storefrontHref} onClose={() => setSettingsOpen(false)} />

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
