'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  listPublicCreatorProductGroups,
  listPublicProducts,
} from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { CreatorProductsStatsPanel } from '@/components/creator/CreatorProductsStatsPanel';
import { CreatorProductGroupsExplorePanel } from '@/components/creator/CreatorProductGroupsExplorePanel';
import { useCreatorProductsFilter } from '@/components/creator/useCreatorProductsFilter';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioProductsTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import type {
  MarketplaceProductGroup,
  MarketplaceProductSummary,
} from '@/types/marketplace';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';

/** Shop visit: 3 per row on large screens, roomier gaps than Explore. */
const shopProductGridClassName =
  'grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8';

type FormatSectionOrder = 'physical-first' | 'virtual-first';
type ShopBrowseMode = 'all' | 'bestseller' | 'catalogue';

function isPhysicalProduct(product: MarketplaceProductSummary) {
  return product.type === 'PHYSICAL';
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

type CreatorPublicShopViewProps = {
  creatorId: string;
  creatorName: string;
  avatarUrl?: string | null;
  shopName?: string | null;
  shopSellingFocus?: string | null;
  shopDescription?: string | null;
  shopCoverUrl?: string | null;
};

export function CreatorPublicShopView({
  creatorId,
  creatorName,
  avatarUrl,
  shopName,
  shopSellingFocus,
  shopDescription,
  shopCoverUrl,
}: CreatorPublicShopViewProps) {
  const [items, setItems] = useState<MarketplaceProductSummary[]>([]);
  const [groups, setGroups] = useState<MarketplaceProductGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [exploringGroups, setExploringGroups] = useState(false);
  const [browseMode, setBrowseMode] = useState<ShopBrowseMode>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionOrder, setSectionOrder] = useState<FormatSectionOrder>('physical-first');

  const displayName = shopName?.trim() || creatorName;
  const focusLine = shopSellingFocus?.trim() || null;
  const description = shopDescription?.trim() || null;

  const {
    query,
    setQuery,
    setStatus,
    setFormat,
    setType,
    setSort,
    filtered,
    format,
  } = useCreatorProductsFilter(items);

  useEffect(() => {
    setStatus('published');
  }, [setStatus]);

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

  const activateAll = useCallback(() => {
    setBrowseMode('all');
    setExploringGroups(false);
    setSelectedGroupId(null);
    setFormat('all');
    setType('');
    setSort('newest');
  }, [setFormat, setSort, setType]);

  const activateBestSeller = useCallback(() => {
    setBrowseMode('bestseller');
    setExploringGroups(false);
    setSelectedGroupId(null);
    setFormat('all');
    setType('');
    setSort('bestseller');
  }, [setFormat, setSort, setType]);

  const activateCatalogue = useCallback(() => {
    setBrowseMode('catalogue');
    setSelectedGroupId(null);
    setExploringGroups(true);
    setFormat('all');
    setType('');
    setSort('newest');
  }, [setFormat, setSort, setType]);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [productsPage, groupsPage] = await Promise.all([
        listPublicProducts({ creatorId, size: 100, sort: 'newest' }),
        listPublicCreatorProductGroups(creatorId, 0, 50).catch(() => ({
          content: [] as MarketplaceProductGroup[],
        })),
      ]);
      setItems(productsPage.content);
      setGroups(groupsPage.content);
      setSelectedGroupId((current) =>
        current && groupsPage.content.some((group) => group.id === current) ? current : null
      );
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load this shop.'));
      setItems([]);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <CreatorStudioProductsTabSkeleton />;
  }

  const navItems: Array<{ id: ShopBrowseMode; label: string; onClick: () => void }> = [
    { id: 'all', label: 'All', onClick: activateAll },
    { id: 'bestseller', label: 'Best Seller', onClick: activateBestSeller },
    { id: 'catalogue', label: 'Catalogue', onClick: activateCatalogue },
  ];

  return (
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <section className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div className="relative min-h-[280px] w-full sm:min-h-[340px] lg:min-h-[400px]">
          {shopCoverUrl ? (
            isVideoThumbnailUrl(shopCoverUrl) ? (
              <video
                src={shopCoverUrl}
                className="absolute inset-0 h-full w-full object-cover"
                muted
                playsInline
                loop
                autoPlay
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shopCoverUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
          )}

          {/* Darken from bottom → top so identity text stays readable */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10"
            aria-hidden
          />

          <div className="relative z-10 flex h-full min-h-[280px] flex-col items-center justify-end px-5 pb-8 pt-16 text-center sm:min-h-[340px] sm:px-8 sm:pb-10 lg:min-h-[400px]">
            <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white/90 bg-neutral-800 shadow-lg sm:mb-5 sm:h-28 sm:w-28">
              {avatarUrl?.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl.trim()}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white sm:text-3xl">
                  {initialsFromName(displayName)}
                </span>
              )}
            </div>

            <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {displayName}
            </h1>

            {focusLine ? (
              <p className="mt-1.5 max-w-xl text-sm font-medium text-orange-300 sm:text-base">
                {focusLine}
              </p>
            ) : null}

            {description ? (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-[15px]">
                {description}
              </p>
            ) : null}

            <Link
              href={`/marketplace/${creatorId}`}
              className="mt-5 text-sm font-semibold text-white/80 underline-offset-4 transition hover:text-white hover:underline"
            >
              View profile
            </Link>
          </div>
        </div>
      </section>

      {error ? <ErrorAlert message={error} onDismiss={() => setError(null)} /> : null}

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-14">
        <section className="min-w-0 flex-1 space-y-5">
          {items.length > 0 || groups.length > 0 ? (
            <nav
              className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-neutral-200 bg-white p-1.5 dark:border-neutral-800 dark:bg-[#0F0F0F]"
              aria-label="Shop browse"
            >
              {navItems.map((item) => {
                const active = browseMode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.onClick}
                    aria-current={active ? 'page' : undefined}
                    className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                      active
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          ) : null}

          {exploringGroups ? (
            <CreatorProductGroupsExplorePanel
              groups={groups}
              products={items}
              selectedGroupId={selectedGroupId}
              onSelectGroup={(groupId) => {
                setSelectedGroupId(groupId);
                setExploringGroups(false);
                setBrowseMode('catalogue');
                setSort('newest');
              }}
            />
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center dark:border-neutral-700 dark:bg-[#0F0F0F]">
              <p className="text-neutral-600 dark:text-neutral-400">
                No published products in this shop yet.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center dark:border-neutral-700 dark:bg-[#0F0F0F]">
              <p className="text-neutral-600 dark:text-neutral-400">
                {browseMode === 'bestseller'
                  ? 'No best sellers yet.'
                  : query.trim()
                    ? 'No products match your search.'
                    : 'No products match this view.'}
              </p>
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center dark:border-neutral-700 dark:bg-[#0F0F0F]">
              <p className="text-neutral-600 dark:text-neutral-400">
                This catalogue has no matching products.
              </p>
            </div>
          ) : format === 'all' && !selectedGroupId && browseMode !== 'bestseller' ? (
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
                            onClick={() =>
                              setSectionOrder((current) =>
                                current === 'physical-first' ? 'virtual-first' : 'physical-first'
                              )
                            }
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
                      <div className={shopProductGridClassName}>
                        {section.products.map((product) => (
                          <ProductCard key={product.id} product={product} showCreator={false} />
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
              ) : browseMode === 'bestseller' ? (
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-900 dark:text-white">
                    Best sellers
                  </h3>
                  <span className="text-xs font-medium tabular-nums text-neutral-500 dark:text-neutral-400">
                    {displayProducts.length}
                  </span>
                </div>
              ) : null}
              <div className={shopProductGridClassName}>
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} showCreator={false} />
                ))}
              </div>
            </div>
          )}
        </section>

        {items.length > 0 || groups.length > 0 ? (
          <div className="w-full shrink-0 xl:sticky xl:top-24 xl:ml-4 xl:w-[16rem] xl:pl-6">
            <div className="space-y-3">
              <label className="relative block">
                <span className="sr-only">Search products</span>
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                  />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 dark:border-neutral-800 dark:bg-[#0F0F0F] dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-orange-500/50"
                />
              </label>

              <CreatorProductsStatsPanel
                readOnly
                groups={groups}
                selectedGroupId={selectedGroupId}
                exploring={exploringGroups}
                onSelectGroup={(groupId) => {
                  setExploringGroups(false);
                  setSelectedGroupId(groupId);
                  setBrowseMode(groupId ? 'catalogue' : 'all');
                  if (!groupId) {
                    setSort('newest');
                  }
                }}
                onExplore={activateCatalogue}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
