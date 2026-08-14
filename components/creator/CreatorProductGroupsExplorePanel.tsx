'use client';

import { useMemo } from 'react';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import type { MarketplaceProductGroup, MarketplaceProductSummary } from '@/types/marketplace';

type CreatorProductGroupsExplorePanelProps = {
  groups: MarketplaceProductGroup[];
  products: MarketplaceProductSummary[];
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
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Explore catalogues</h2>
        <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
          {groups.length} catalogue{groups.length !== 1 ? 's' : ''} — open one to view its products.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-14 sm:gap-y-14 xl:grid-cols-2 xl:gap-x-16 2xl:grid-cols-3 2xl:gap-x-14">
        {groups.map((group) => {
          const selected = selectedGroupId === group.id;
          const thumbnailUrl = resolveGroupThumbnail(group, productsById);
          const hasVideoThumb = isVideoThumbnailUrl(thumbnailUrl);

          return (
            <div key={group.id} className="relative pt-5 pr-5">
              {/* Decorative back cards — catalogue stack simulation */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-1 top-5 rounded-2xl border-2 border-neutral-300 bg-neutral-200/90 shadow-md dark:border-neutral-600 dark:bg-neutral-700/90"
                style={{ transform: 'translate(18px, -16px) rotate(4deg)' }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0.5 top-5 rounded-2xl border-2 border-neutral-200 bg-white shadow-md dark:border-neutral-500 dark:bg-neutral-800"
                style={{ transform: 'translate(9px, -8px) rotate(2deg)' }}
              />

              <article
                className={`group relative z-10 flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-neutral-900 ${
                  selected
                    ? 'border-orange-500 ring-2 ring-orange-500/30 dark:border-orange-400'
                    : 'border-neutral-300 dark:border-neutral-600'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectGroup(group.id)}
                  className="flex w-full flex-col text-left"
                >
                  <div className="relative h-52 w-full shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    {thumbnailUrl ? (
                      <ProductThumbnailMedia
                        url={thumbnailUrl}
                        autoPlay={hasVideoThumb}
                        fit="cover"
                        zoomOnHover
                        className="h-full w-full"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
                        No preview
                      </div>
                    )}
                    <div className="pointer-events-none absolute bottom-3 right-3">
                      <span className="rounded-md bg-neutral-900/85 px-2.5 py-1 text-xs font-semibold tabular-nums text-white">
                        {group.productCount} item{group.productCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 items-center justify-between gap-3 px-4 py-3.5">
                    <h3 className="truncate text-base font-bold text-neutral-900 dark:text-white">
                      {group.name}
                    </h3>
                    <span
                      aria-hidden
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition group-hover:text-orange-500 dark:text-neutral-500 dark:group-hover:text-orange-400"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </button>

                {onEditGroup ? (
                  <div className="border-t border-neutral-100 px-3 py-2.5 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => onEditGroup(group)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
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
            className="flex min-h-[17.5rem] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center transition duration-200 hover:border-neutral-400 hover:bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-900/40 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
          >
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </span>
            <span className="text-base font-bold text-neutral-700 dark:text-neutral-200">
              New catalogue
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
