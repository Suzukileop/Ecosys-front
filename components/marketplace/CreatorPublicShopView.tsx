'use client';

import { localeTag, trPlural } from '@/lib/i18n/active';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { listPublicCreatorProductGroups, listPublicProducts } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { MediaImage } from '@/components/ui/MediaImage';
import { CreatorProductGroupsExplorePanel } from '@/components/creator/CreatorProductGroupsExplorePanel';
import { useCreatorProductsFilter, type CreatorProductSort } from '@/components/creator/useCreatorProductsFilter';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ProductListRow } from '@/components/marketplace/ProductListRow';
import { CreatorStarButton, StarGlyph } from '@/components/marketplace/CreatorStarButton';
import { ContentPostDialogShell } from '@/components/creator/ContentPostDialogShell';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import { ALL_ICON, RailGlyph } from '@/components/home/NewsDiscoverRail';
import { BOX_TITLE, SpecialtyRow } from '@/components/marketplace/ProviderDiscoverRail';
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
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { BackToTopButton, useBackToTop } from '@/components/ui/ScrollUpStickyBar';
import { useAuth } from '@/context/AuthContext';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import type { MarketplaceProductGroup, MarketplaceProductSummary } from '@/types/marketplace';
import { ListSectionHeading } from '@/components/ui/ListSectionHeading';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

type FormatSectionOrder = 'physical-first' | 'virtual-first';

const SORT_OPTIONS: { value: CreatorProductSort; label: string }[] = [
  { value: 'newest', label: msg('Most recent') },
  { value: 'bestseller', label: msg('Best sellers') },
  { value: 'views', label: msg('Most viewed') },
  { value: 'price_asc', label: msg('Price: low to high') },
  { value: 'price_desc', label: msg('Price: high to low') },
  { value: 'title', label: msg('Title A–Z') },
];

/** Catalogue rows shown in the rail before "Explore all". */
const RAIL_CATALOGUES_LIMIT = 6;

const EMPTY_BLOCK_CLASS = 'mx-5 bg-[color:var(--gn-surface)] px-6 py-12 text-center sm:mx-0';
const RAIL_ROW =
  'group/row flex w-full items-center gap-3 px-6 py-3.5 text-left text-[15px] font-semibold leading-5 text-[color:var(--gn-ink)] transition-colors duration-150 hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)]';
/** X pills: ink fill for the primary, a 1px ring for the secondary. */
const PRIMARY_PILL =
  'inline-flex h-9 items-center justify-center gap-2 rounded-full bg-[color:var(--gn-primary)] px-4 text-[14px] font-bold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';
const SECONDARY_PILL =
  'inline-flex h-9 items-center justify-center gap-2 rounded-full px-4 text-[14px] font-bold text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[color:var(--gn-hover)] dark:shadow-[inset_0_0_0_1px_#536471] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';

/** Stacked sheets: a catalogue. */
const CATALOGUE_GLYPH = (
  <>
    <path d="M12 3.5 21 8l-9 4.5L3 8z" />
    <path d="m3 12 9 4.5 9-4.5" />
    <path d="m3 16 9 4.5 9-4.5" />
  </>
);

function isPhysicalProduct(product: MarketplaceProductSummary) {
  return product.type === 'PHYSICAL';
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-[color:var(--gn-ink2)] transition-transform duration-200 group-hover/row:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

/** A group's title inside the list ("Material 28", a catalogue): 17px ink, the count secondary. */
function SectionHeading({ label, count, children }: { label: string; count: number; children?: React.ReactNode }) {
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

type CreatorPublicShopViewProps = {
  creatorId: string;
  creatorName: string;
  avatarUrl?: string | null;
  shopName?: string | null;
  shopSellingFocus?: string | null;
  shopDescription?: string | null;
  shopCoverUrl?: string | null;
  starCount?: number;
  isStarred?: boolean;
};

/** The shop while it loads: the banner, the identity block, then the grid and the rail. */
function ShopSkeleton() {
  const t = useT();
  const block = 'animate-pulse bg-[#EFF3F4] dark:bg-[#202327]';
  return (
    <div className="pb-24 pt-2 sm:pt-4 lg:pt-3" aria-busy="true" aria-label={t('Loading shop')}>
      <div className={`aspect-[3/1] w-full sm:aspect-[4/1] ${block}`} />
      <div className="px-5 sm:px-0">
        <div className={`-mt-10 h-20 w-20 rounded-full ring-4 ring-white dark:ring-black sm:-mt-14 sm:h-28 sm:w-28 ${block}`} />
        <div className={`mt-4 h-7 w-56 ${block}`} />
        <div className={`mt-2 h-4 w-80 max-w-full ${block}`} />
      </div>
      <div className="mt-10 grid gap-2 sm:grid-cols-2 sm:gap-5 min-[1400px]:grid-cols-3 lg:mr-[380px] xl:mr-[448px]">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`aspect-[4/3] ${block}`} />
        ))}
      </div>
    </div>
  );
}

/**
 * A creator's public shop, on the News / Products frame. The banner (the shop's cover) carries no
 * text; the identity reads under it as on an X profile — the avatar overlapping the banner's edge,
 * the shop name, what it sells, the description (two lines, "More"), then the trust stars with the
 * actions right (Star + Message, or "Manage products" on your own shop). Below: Products' section
 * line, grid / list views and rail (search, Format, Catalogues, the creator's profile) — foldable,
 * with a Filters sheet below lg. "Best sellers" is an order of the Sort menu.
 */
export function CreatorPublicShopView({
  creatorId,
  creatorName,
  avatarUrl,
  shopName,
  shopSellingFocus,
  shopDescription,
  shopCoverUrl,
  starCount = 0,
  isStarred,
}: CreatorPublicShopViewProps) {
  const t = useT();
  const { user } = useAuth();
  const [trustStars, setTrustStars] = useState(starCount);
  const [items, setItems] = useState<MarketplaceProductSummary[]>([]);
  const [groups, setGroups] = useState<MarketplaceProductGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [exploringGroups, setExploringGroups] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionOrder, setSectionOrder] = useState<FormatSectionOrder>('physical-first');
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useStoredChoice('shop.view', parseView, 'compact');
  const [rail, setRail] = useRailFold('shop.rail');
  const folded = rail === 'folded';
  const lineRef = useRef<HTMLDivElement>(null);
  const backToTop = useBackToTop(lineRef);

  const displayName = shopName?.trim() || creatorName;
  const focusLine = shopSellingFocus?.trim() || null;
  const description = shopDescription?.trim() || null;
  const isOwnShop = Boolean(user?.id && user.id === creatorId);
  const messagePath = `/messages?user=${encodeURIComponent(creatorId)}`;
  const messageHref = user ? messagePath : `/login?redirect=${encodeURIComponent(messagePath)}`;

  /* The shop lists published products only; the hook's default status is "published". */
  const { query, setQuery, setFormat, sort, setSort, filtered, format } = useCreatorProductsFilter(items);

  /* Unfolds the rail, then (search) puts the caret in its field once the rail has rendered. */
  const focusSearchRef = useRef(false);
  const openRail = (focusSearch = false) => {
    focusSearchRef.current = focusSearch;
    setRail('open');
  };
  useEffect(() => {
    if (rail !== 'open' || !focusSearchRef.current) return;
    focusSearchRef.current = false;
    document.getElementById('shop-q-side')?.focus();
  }, [rail]);

  const selectedGroup = useMemo(() => groups.find((group) => group.id === selectedGroupId) ?? null, [groups, selectedGroupId]);

  const displayProducts = useMemo(() => {
    if (!selectedGroup) return filtered;
    const ids = new Set(selectedGroup.productIds);
    return filtered.filter((product) => ids.has(product.id));
  }, [filtered, selectedGroup]);

  const physical = useMemo(() => displayProducts.filter(isPhysicalProduct), [displayProducts]);
  const virtual = useMemo(() => displayProducts.filter((product) => !isPhysicalProduct(product)), [displayProducts]);
  const formatSections = useMemo(() => {
    const material = { key: 'physical' as const, label: t('Material'), products: physical };
    const digital = { key: 'virtual' as const, label: t('Digital'), products: virtual };
    return sectionOrder === 'virtual-first' ? [digital, material] : [material, digital];
  }, [physical, virtual, sectionOrder, t]);

  const formatCounts = useMemo(
    () => ({
      all: items.length,
      physical: items.filter(isPhysicalProduct).length,
      virtual: items.filter((product) => !isPhysicalProduct(product)).length,
    }),
    [items]
  );
  const groupCounts = useMemo(() => {
    const ids = new Set(items.map((product) => product.id));
    return Object.fromEntries(groups.map((group) => [group.id, group.productIds.filter((id) => ids.has(id)).length]));
  }, [groups, items]);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [productsPage, groupsPage] = await Promise.all([
        listPublicProducts({ creatorId, size: 100, sort: 'newest' }),
        listPublicCreatorProductGroups(creatorId, 0, 50).catch(() => ({ content: [] as MarketplaceProductGroup[] })),
      ]);
      setItems(productsPage.content);
      setGroups(groupsPage.content);
      setSelectedGroupId((current) => (current && groupsPage.content.some((group) => group.id === current) ? current : null));
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to load this shop.')));
      setItems([]);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [creatorId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <ShopSkeleton />;

  const pickFormat = (next: typeof format) => {
    setSelectedGroupId(null);
    setExploringGroups(false);
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
  const formatLabel = format === 'physical' ? t('Material') : format === 'virtual' ? t('Digital') : null;
  const bestsellers = sort === 'bestseller';
  const activeFilterCount = (query.trim() ? 1 : 0) + (format !== 'all' ? 1 : 0) + (selectedGroup ? 1 : 0);
  const narrowed = activeFilterCount > 0;
  const clearAll = () => {
    setQuery('');
    setFormat('all');
    setSelectedGroupId(null);
    setExploringGroups(false);
    setSort('newest');
  };
  const renderProduct = (product: MarketplaceProductSummary) =>
    view === 'list' ? (
      <ProductListRow key={product.id} product={product} />
    ) : (
      <ProductCard key={product.id} product={product} showCreator={false} />
    );
  const productsClass = view === 'list' ? 'flex min-w-0 flex-col gap-2 sm:gap-3' : VIEW_GRID_CLASS[rail][view];
  const hasCatalogue = items.length > 0 || groups.length > 0;

  const searchField = (id: string) => (
    <form onSubmit={(event) => event.preventDefault()} className="min-w-0 flex-1">
      <div className="relative h-11 w-full min-w-0 rounded-full bg-[color:var(--gn-surface)] transition-[background-color,box-shadow] focus-within:bg-[color:var(--gn-inset)] focus-within:shadow-[inset_0_0_0_2px_var(--gn-ink)]">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[color:var(--gn-ink2)]" />
        <label htmlFor={id} className="sr-only">
          {t('Search this shop')}
        </label>
        <input
          id={id}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          enterKeyHint="search"
          autoComplete="off"
          placeholder={t('Search {displayName}', { displayName })}
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

  const filtersButton = (extra = '') => (
    <button
      type="button"
      onClick={() => setSheetOpen(true)}
      aria-label={activeFilterCount > 0 ? t('Filters ({activeFilterCount} active)', { activeFilterCount }) : t('Filters')}
      className={`${railRoundButtonClass} ${extra} hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]`}
    >
      <SlidersIcon className="h-[18px] w-[18px]" />
      {activeFilterCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[color:var(--gn-ink)] px-1 text-[10px] font-bold tabular-nums text-[color:var(--gn-surface)] ring-2 ring-[#FFFFFF] dark:ring-[#000000]">
          {activeFilterCount}
        </span>
      ) : null}
    </button>
  );

  /* ---- Identity: banner, then the X-profile block under it ---- */
  const identity = (
    <header className="pb-2">
      <div className="relative aspect-[3/1] w-full overflow-hidden bg-[#0F1419] sm:aspect-[4/1]">
        {shopCoverUrl ? (
          isVideoThumbnailUrl(shopCoverUrl) ? (
            <video src={shopCoverUrl} className="absolute inset-0 h-full w-full object-cover" muted playsInline loop autoPlay />
          ) : (
            <MediaImage src={shopCoverUrl} widths={[828, 1080, 1920]} sizes="(min-width: 1240px) 1240px, 100vw" priority className="absolute inset-0 h-full w-full object-cover" />
          )
        ) : null}
      </div>

      <div className="px-5 sm:px-1">
        <div className="flex items-end justify-between gap-4">
          <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#202327] ring-4 ring-white dark:ring-black sm:-mt-14 sm:h-28 sm:w-28">
            <MediaImage
              src={avatarUrl}
              width={112}
              priority
              referrerPolicy="no-referrer"
              fallback={<span className="text-2xl font-bold text-white sm:text-3xl">{initialsFromName(displayName)}</span>}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2 pt-3">
            {isOwnShop ? (
              <Link href="/my-products" className={PRIMARY_PILL}>
                {t('Manage products')}
              </Link>
            ) : (
              <>
                <Link href={messageHref} className={SECONDARY_PILL}>
                  {t('Message')}
                </Link>
                <CreatorStarButton
                  creatorId={creatorId}
                  initialStarred={isStarred}
                  initialStarCount={starCount}
                  onStarChange={(_, count) => setTrustStars(count)}
                  size="sm"
                  shape="pill"
                  showCount={false}
                  loginRedirect={`/providers/${creatorId}/shop`}
                />
              </>
            )}
          </div>
        </div>

        <h1 className="mt-3 text-[24px] font-extrabold leading-7 tracking-[-0.02em] text-[color:var(--gn-ink)] sm:text-[28px] sm:leading-8">
          {displayName}
        </h1>
        {focusLine ? <p className="mt-0.5 text-[15px] leading-5 text-[color:var(--gn-ink2)]">{focusLine}</p> : null}
        {description ? (
          <div className="mt-3 max-w-2xl text-[15px] leading-5 text-[color:var(--gn-ink)]">
            <p className={descriptionOpen ? '' : 'line-clamp-2'}>{description}</p>
            {description.length > 160 ? (
              <button
                type="button"
                onClick={() => setDescriptionOpen((open) => !open)}
                className="mt-1 text-[14px] font-semibold text-[color:var(--gn-ink2)] hover:text-[color:var(--gn-ink)] hover:underline"
              >
                {descriptionOpen ? t('Less') : t('More')}
              </button>
            ) : null}
          </div>
        ) : null}
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] leading-5 text-[color:var(--gn-ink2)]">
          <span className="inline-flex items-center gap-1.5" aria-label={trPlural(trustStars, '{count} trust star', '{count} trust stars')}>
            <StarGlyph filled={trustStars > 0} className="h-4 w-4 text-[color:var(--gn-ink)]" />
            <span className="font-bold tabular-nums text-[color:var(--gn-ink)]">{new Intl.NumberFormat(localeTag()).format(trustStars)}</span>
            {t.plural(trustStars, 'trust star', 'trust stars')}
          </span>
          <span>
            <span className="font-bold tabular-nums text-[color:var(--gn-ink)]">{items.length}</span> {trPlural(items.length, 'product', 'products')}
          </span>
          {groups.length > 0 ? (
            <span>
              <span className="font-bold tabular-nums text-[color:var(--gn-ink)]">{groups.length}</span>{' '}
              {trPlural(groups.length, 'catalogue', 'catalogues')}
            </span>
          ) : null}
          <Link href={`/providers/${creatorId}`} className="font-semibold text-[color:var(--gn-ink)] underline-offset-4 hover:underline">
            {t('by {creatorName}', { creatorName })}
          </Link>
        </p>
      </div>
    </header>
  );

  /* ---- Section line: what the list shows, then Sort and the view ---- */
  const sectionLine = (
    <div ref={lineRef} className="flex scroll-mt-24 flex-col gap-1 px-5 sm:px-1">
      <div className="flex min-h-8 items-center justify-between gap-4">
        <ListSectionHeading
          as="p"
          live
          title={bestsellers ? t('Best sellers') : t('Products')}
          count={displayProducts.length}
          details={[formatLabel, selectedGroup?.name]}
        />
        <div className="flex shrink-0 items-center gap-3">
          <SortMenu value={sort} options={SORT_OPTIONS} menuLabel={t('Sort this shop')} onChange={setSort} />
          <span aria-hidden className="h-4 w-px bg-[color:var(--gn-line)]" />
          <ViewSwitch value={view} rail={rail} onChange={setView} />
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
          <button type="button" onClick={clearAll} className="shrink-0 font-medium text-[color:var(--gn-ink)] underline-offset-4 hover:underline">
            {t('Clear')}
          </button>
        </p>
      ) : null}
    </div>
  );

  const swapButton = (
    <button
      type="button"
      onClick={() => setSectionOrder((current) => (current === 'physical-first' ? 'virtual-first' : 'physical-first'))}
      aria-label={t('Swap the Material and Digital sections')}
      title={t('Swap Material / Digital order')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)]"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    </button>
  );

  const body = exploringGroups ? (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setExploringGroups(false)}
        className="mx-5 inline-flex min-h-10 items-center gap-1.5 self-start text-[15px] font-semibold text-[color:var(--gn-ink2)] transition-colors hover:text-[color:var(--gn-ink)] sm:mx-1"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {t('Back to products')}
      </button>
      <div className="px-5 sm:px-0">
        <CreatorProductGroupsExplorePanel groups={groups} products={items} selectedGroupId={selectedGroupId} onSelectGroup={(groupId) => pickGroup(groupId)} />
      </div>
    </div>
  ) : items.length === 0 ? (
    <div className={EMPTY_BLOCK_CLASS}>
      <p className="text-[17px] font-bold leading-[22px] text-[color:var(--gn-ink)]">{t('Nothing on sale yet')}</p>
      <p className="mt-1.5 text-[14px] leading-5 text-[color:var(--gn-ink2)]">{t('Star this shop to hear when {displayName} publishes.', { displayName })}</p>
    </div>
  ) : displayProducts.length === 0 ? (
    <div className={EMPTY_BLOCK_CLASS}>
      <p className="text-[17px] font-bold leading-[22px] text-[color:var(--gn-ink)]">
        {bestsellers ? t('No best sellers yet') : t('Nothing matches')}
      </p>
      <p className="mt-1.5 text-[14px] leading-5 text-[color:var(--gn-ink2)]">{t('Try another search, format or catalogue.')}</p>
      <button type="button" onClick={clearAll} className={`${SECONDARY_PILL} mt-5`}>
        {t('Show everything')}
      </button>
    </div>
  ) : format === 'all' && !selectedGroup && !bestsellers ? (
    <div className="flex flex-col gap-10">
      {formatSections.map((section, index) => {
        if (section.products.length === 0) return null;
        const previousVisible = formatSections.slice(0, index).some((entry) => entry.products.length > 0);
        return (
          <section key={section.key} className="flex flex-col gap-3" aria-label={`${section.label} products`}>
            <SectionHeading label={t(section.label)} count={section.products.length}>
              {physical.length > 0 && virtual.length > 0 && !previousVisible ? swapButton : null}
            </SectionHeading>
            <div className={productsClass} data-rail-fold="cards">{section.products.map(renderProduct)}</div>
          </section>
        );
      })}
    </div>
  ) : (
    <div className={productsClass} data-rail-fold="cards">{displayProducts.map(renderProduct)}</div>
  );

  const formatRows = (
    <nav aria-label={t('Product format')} className="flex w-full flex-col">
      <SpecialtyRow label={t('All')} icon={ALL_ICON} active={format === 'all'} count={formatCounts.all} onClick={() => pickFormat('all')} />
      {PRODUCT_FORMAT_OPTIONS.map((option) =>
        formatCounts[option.id] > 0 ? (
          <SpecialtyRow
            key={option.id}
            label={t(option.label)}
            icon={option.icon}
            active={format === option.id}
            count={formatCounts[option.id]}
            onClick={() => pickFormat(format === option.id ? 'all' : option.id)}
          />
        ) : null
      )}
    </nav>
  );

  const railPanel = (
    <ProfileSectionStickyAside key="open" scrollable className="w-full" surfaceClassName="flex w-full max-w-full min-w-0 flex-col gap-6 pb-6">
      <div className="flex items-center gap-2">
        {searchField('shop-q-side')}
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

      <section className="gn-rail-box flex min-h-0 flex-col px-px pb-2 pt-5" aria-labelledby="shop-format-title">
        <h2 id="shop-format-title" className={BOX_TITLE}>
          {t('Format')}
        </h2>
        {formatRows}
      </section>

      {groups.length > 0 ? (
        <section className="gn-rail-box flex min-h-0 flex-col px-px pb-2 pt-5" aria-labelledby="shop-catalogues-title">
          <h2 id="shop-catalogues-title" className={BOX_TITLE}>
            {t('Catalogues')}
          </h2>
          <nav aria-label={t('Catalogues')} className="flex w-full flex-col">
            <SpecialtyRow label={t('All products')} icon={ALL_ICON} active={!selectedGroupId && !exploringGroups} count={items.length} onClick={() => pickGroup(null)} />
            {groups.slice(0, RAIL_CATALOGUES_LIMIT).map((group) => {
              const active = selectedGroupId === group.id && !exploringGroups;
              return (
                <SpecialtyRow
                  key={group.id}
                  label={group.name}
                  icon={CATALOGUE_GLYPH}
                  active={active}
                  count={groupCounts[group.id] ?? 0}
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
          </nav>
        </section>
      ) : null}

      {/* The person behind the shop — News's "Build your portfolio" row. */}
      <Link
        href={`/providers/${creatorId}`}
        className="gn-rail-box group/row flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#202327]">
          <MediaImage
            src={avatarUrl}
            width={44}
            referrerPolicy="no-referrer"
            fallback={<span className="text-[14px] font-bold text-white">{initialsFromName(creatorName)}</span>}
            className="h-full w-full object-cover"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[17px] font-bold leading-[22px] text-[color:var(--gn-ink)]">{creatorName}</span>
          <span className="mt-0.5 block truncate text-[14px] leading-5 text-[color:var(--gn-ink2)]">{t('View profile and services')}</span>
        </span>
        <ChevronRight />
      </Link>
    </ProfileSectionStickyAside>
  );

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
        aria-label={t('Search this shop')}
        title={t('Search this shop')}
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
    </ProfileSectionStickyAside>
  );

  return (
    <div className="pb-24 pt-2 sm:pt-4 lg:pt-3">
      {identity}

      {error ? (
        <div className="mt-4 px-5 sm:px-0">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      ) : null}

      {hasCatalogue ? (
        <>
          {/* Phones / tablets: format and catalogues in one bottom sheet. */}
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
                {groups.length > 0 ? (
                  <section>
                    <p className="gn-kicker pb-3">{t('Catalogues')}</p>
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
                  </section>
                ) : null}
              </div>
              <div className="sticky bottom-0 flex items-center justify-between gap-4 bg-white px-5 pb-5 pt-3 dark:bg-black">
                {narrowed ? (
                  <button type="button" onClick={clearAll} className="text-[14px] font-semibold text-[color:var(--gn-ink)] underline underline-offset-4">
                    {t('Clear all filters')}
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--gn-primary)] px-6 text-[15px] font-semibold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)]"
                >
                  {t('Show')} {displayProducts.length} {trPlural(displayProducts.length, 'product', 'products')}
                </button>
              </div>
            </div>
          </ContentPostDialogShell>

          <div
            className={`mt-8 grid w-full items-start gap-8 ${
              folded
                ? 'lg:grid-cols-[minmax(0,1fr)_44px] lg:gap-6'
                : 'lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12'
            }`}
          >
            <main className="flex min-w-0 flex-col gap-3" aria-label={`${displayName} products`}>
              <div className="flex items-center gap-2 px-5 sm:px-0 lg:hidden">
                {searchField('shop-q')}
                {filtersButton('bg-[color:var(--gn-surface)]')}
              </div>
              {sectionLine}
              {body}
            </main>
            <div className="hidden self-start lg:block" data-rail-fold="rail">
              {folded ? foldedRail : railPanel}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-8">{body}</div>
      )}

      <BackToTopButton visible={backToTop.visible} onClick={backToTop.backToTop} />
    </div>
  );
}
