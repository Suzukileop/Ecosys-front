'use client';

import { useMemo } from 'react';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import type { MarketplaceProductGroup, MarketplaceProductSummary } from '@/types/marketplace';

type CreatorProductGroupsExplorePanelProps = {
  groups: MarketplaceProductGroup[];
  products: MarketplaceProductSummary[];
  /** Per-catalogue counts matching what the list shows when the catalogue is opened. */
  groupCounts?: Record<string, number>;
  selectedGroupId?: string | null;
  onSelectGroup: (groupId: string) => void;
  onEditGroup?: (group: MarketplaceProductGroup) => void;
  onCreateCatalogue?: () => void;
};

function resolveGroupThumbnail(
  group: MarketplaceProductGroup,
  productsById: Map<string, MarketplaceProductSummary>
): string | null {
  for (const productId of group.productIds ?? []) {
    const product = productsById.get(productId);
    if (product?.thumbnailUrl) return product.thumbnailUrl;
  }
  return null;
}

/** Inline central catalog of all product groups (replaces product grid when exploring). */
export function CreatorProductGroupsExplorePanel({
  groups,
  products,
  groupCounts,
  selectedGroupId = null,
  onSelectGroup,
  onEditGroup,
  onCreateCatalogue,
}: CreatorProductGroupsExplorePanelProps) {
  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#111111] dark:text-white">Explore catalogues</h2>
        <p className="mt-1 text-[15px] text-neutral-500 dark:text-neutral-400">
          {groups.length} catalogue{groups.length !== 1 ? 's' : ''} — open one to view its products.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => {
          const selected = selectedGroupId === group.id;
          const thumbnailUrl = resolveGroupThumbnail(group, productsById);
          const hasVideoThumb = isVideoThumbnailUrl(thumbnailUrl);
          const count =
            groupCounts?.[group.id] ??
            (group.productIds ?? []).filter((id) => productsById.has(id)).length;

          return (
            <div key={group.id} className="relative pr-2 pt-2">
              {count > 1 ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-1 top-2 rounded-lg border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#111111]"
                  style={{ transform: 'translate(8px, -8px)' }}
                />
              ) : null}

              <article
                className={`group relative z-10 flex flex-col overflow-hidden rounded-lg border bg-white transition-colors duration-300 dark:bg-[#111111] ${
                  selected
                    ? 'border-[#111111]/40 dark:border-white/40'
                    : 'border-black/[0.06] hover:border-black/[0.12] dark:border-white/[0.08] dark:hover:border-white/[0.16]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectGroup(group.id)}
                  className="flex w-full flex-col text-left"
                >
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-black/[0.04] dark:bg-white/[0.04]">
                    {thumbnailUrl ? (
                      <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105">
                        <ProductThumbnailMedia
                          url={thumbnailUrl}
                          autoPlay={hasVideoThumb}
                          fit="cover"
                          className="h-full w-full"
                        />
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-400 dark:text-neutral-500">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0H3.75m16.5 0l-1.5-3h-13.5l-1.5 3" />
                        </svg>
                        <span className="text-[14px]">{count === 0 ? 'Empty catalogue' : 'No preview'}</span>
                      </div>
                    )}
                    {count > 0 ? (
                      <div className="pointer-events-none absolute bottom-3 right-3">
                        <span className="rounded-md bg-black/60 px-2 py-1 text-[13px] font-medium tabular-nums text-white backdrop-blur-sm">
                          {count} item{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-1 items-center justify-between gap-3 px-5 py-4">
                    <h3 className="truncate text-[17px] font-semibold text-[#111111] transition-colors duration-200 group-hover:text-[#FF5722] dark:text-white">
                      {group.name}
                    </h3>
                    <svg
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.75}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                {onEditGroup ? (
                  <div className="border-t border-black/[0.06] px-5 py-3 dark:border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => onEditGroup(group)}
                      className="inline-flex items-center gap-1.5 text-[14px] font-medium text-neutral-500 transition-colors hover:text-[#FF5722] dark:text-neutral-400"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 00.707-.293l9.646-9.646a1.5 1.5 0 000-2.121l-2.879-2.879a1.5 1.5 0 00-2.121 0L4.293 14.707A1 1 0 004 15.414V20z" />
                      </svg>
                      Edit catalogue
                    </button>
                  </div>
                ) : null}
              </article>
            </div>
          );
        })}

        {onCreateCatalogue ? (
          <button
            type="button"
            onClick={onCreateCatalogue}
            className="group/new mr-2 mt-2 flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-black/[0.12] px-6 py-10 text-center transition-colors duration-200 hover:border-black/25 dark:border-white/[0.12] dark:hover:border-white/25"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/[0.08] text-neutral-500 transition-colors group-hover/new:text-[#FF5722] dark:border-white/[0.1] dark:text-neutral-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </span>
            <span className="text-[15px] font-semibold text-[#111111] dark:text-white">New catalogue</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
