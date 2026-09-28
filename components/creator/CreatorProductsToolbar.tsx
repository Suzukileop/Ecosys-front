'use client';

import { PRODUCT_TYPE_LABELS } from '@/lib/marketplace-api';
import { MarketplaceFilterDropdown } from '@/components/marketplace/MarketplaceFilterDropdown';
import type { ProductType } from '@/types/marketplace';
import type {
  CreatorProductFormatFilter,
  CreatorProductSort,
  CreatorProductStatusFilter,
} from '@/components/creator/useCreatorProductsFilter';

const PRODUCT_TYPES: ProductType[] = [
  'VIDEO',
  'COURSE',
  'TEMPLATE',
  'PDF',
  'EBOOK',
  'AUDIO',
  'PRESET',
  'SOFTWARE',
  'IMAGE_PACK',
  'FONT',
  'OTHER',
];

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  ...PRODUCT_TYPES.map((productType) => ({
    value: productType,
    label: PRODUCT_TYPE_LABELS[productType] ?? productType,
  })),
];

const SORT_OPTIONS: { value: CreatorProductSort; label: string }[] = [
  { value: 'newest', label: 'Most recent' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'views', label: 'Most viewed' },
  { value: 'bestseller', label: 'Best sellers' },
];

const FORMAT_OPTIONS: { id: CreatorProductFormatFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'physical', label: 'Physical' },
  { id: 'virtual', label: 'Virtual' },
];

const STATUS_OPTIONS: { id: Exclude<CreatorProductStatusFilter, 'all'>; label: string }[] = [
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' },
];

type CreatorProductsToolbarProps = {
  query: string;
  status: CreatorProductStatusFilter;
  type: ProductType | '';
  sort: CreatorProductSort;
  format: CreatorProductFormatFilter;
  formatCounts: Record<CreatorProductFormatFilter, number>;
  groupActive?: boolean;
  resultCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  /** Hide Draft / Published toggle (public shop). */
  hideStatusToggle?: boolean;
  onSearch: (query: string) => void;
  onStatusChange: (status: CreatorProductStatusFilter) => void;
  onTypeChange: (type: ProductType | '') => void;
  onSortChange: (sort: CreatorProductSort) => void;
  onFormatChange: (format: CreatorProductFormatFilter) => void;
};

function StatusTabs({
  status,
  onStatusChange,
}: {
  status: CreatorProductStatusFilter;
  onStatusChange: (status: CreatorProductStatusFilter) => void;
}) {
  return (
    <div className="flex items-center gap-7" role="group" aria-label="Draft or published">
      {STATUS_OPTIONS.map((option) => {
        const active = status === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onStatusChange(option.id)}
            className={`relative pb-3.5 text-[15px] font-medium transition-colors duration-200 ${
              active
                ? 'text-[#111111] dark:text-white'
                : 'text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            {option.label}
            {active ? (
              <span aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#FF5722]" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function CreatorProductsToolbar({
  query,
  status,
  type,
  sort,
  format,
  formatCounts,
  groupActive = false,
  resultCount,
  totalCount,
  hasActiveFilters,
  hideStatusToggle = false,
  onSearch,
  onStatusChange,
  onTypeChange,
  onSortChange,
  onFormatChange,
}: CreatorProductsToolbarProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.06]">
        {!hideStatusToggle ? (
          <StatusTabs status={status} onStatusChange={onStatusChange} />
        ) : (
          <span />
        )}
        <p className="pb-3.5 text-[14px] text-neutral-500 dark:text-neutral-400">
          {hasActiveFilters ? (
            <>
              <span className="font-medium text-[#111111] dark:text-white">{resultCount}</span> of {totalCount}{' '}
              product{totalCount !== 1 ? 's' : ''}
            </>
          ) : (
            <>
              {resultCount} product{resultCount !== 1 ? 's' : ''}
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <label htmlFor="creator-products-search" className="sr-only">
            Search products
          </label>
          <div className="flex h-11 items-center gap-3 rounded-lg bg-black/[0.04] px-4 transition focus-within:bg-black/[0.06] dark:bg-white/[0.06] dark:focus-within:bg-white/[0.08]">
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
              id="creator-products-search"
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by title or tag…"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-neutral-500"
            />
            {query ? (
              <button
                type="button"
                onClick={() => onSearch('')}
                className="rounded-full p-1 text-neutral-400 transition hover:bg-black/[0.06] hover:text-[#111111] dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Clear search"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MarketplaceFilterDropdown
            id="creator-products-type"
            label="Type"
            value={type}
            onChange={(v) => onTypeChange((v || '') as ProductType | '')}
            options={TYPE_OPTIONS}
            defaultValue=""
          />
          <MarketplaceFilterDropdown
            id="creator-products-sort"
            label="Sort"
            value={sort}
            onChange={(v) => onSortChange(v as CreatorProductSort)}
            options={SORT_OPTIONS}
            defaultValue="newest"
            clearable={false}
            align="right"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Filter by format">
        {FORMAT_OPTIONS.map((option) => {
          const selected = format === option.id && !groupActive;
          const count = formatCounts[option.id];
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onFormatChange(option.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[14px] font-medium transition-colors duration-200 ${
                selected
                  ? 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-[#111111]'
                  : 'border-black/[0.08] text-neutral-600 hover:border-black/20 hover:text-[#111111] dark:border-white/[0.1] dark:text-neutral-300 dark:hover:border-white/25 dark:hover:text-white'
              }`}
            >
              <span>{option.label}</span>
              <span
                className={`tabular-nums ${
                  selected ? 'text-white/60 dark:text-[#111111]/50' : 'text-neutral-400 dark:text-neutral-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
