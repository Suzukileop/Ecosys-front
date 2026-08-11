'use client';

import { PRODUCT_TYPE_LABELS } from '@/lib/marketplace-api';
import type { ProductType } from '@/types/marketplace';
import type { CreatorProductSort, CreatorProductStatusFilter } from '@/components/creator/useCreatorProductsFilter';

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

const STATUS_OPTIONS: { value: CreatorProductStatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

const SORT_OPTIONS: { value: CreatorProductSort; label: string }[] = [
  { value: 'newest', label: 'Most recent' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'views', label: 'Most viewed' },
  { value: 'sales', label: 'Most sales' },
];

type CreatorProductsToolbarProps = {
  query: string;
  status: CreatorProductStatusFilter;
  type: ProductType | '';
  sort: CreatorProductSort;
  resultCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onSearch: (query: string) => void;
  onStatusChange: (status: CreatorProductStatusFilter) => void;
  onTypeChange: (type: ProductType | '') => void;
  onSortChange: (sort: CreatorProductSort) => void;
  onReset: () => void;
};

function selectClassName() {
  return 'rounded-xl border border-gray-200 bg-white/90 px-3 py-2.5 text-sm font-medium text-gray-800 shadow-sm backdrop-blur-sm transition focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-gray-100 dark:focus:border-orange-500/50 dark:focus:ring-orange-500/20';
}

export function CreatorProductsToolbar({
  query,
  status,
  type,
  sort,
  resultCount,
  totalCount,
  hasActiveFilters,
  onSearch,
  onStatusChange,
  onTypeChange,
  onSortChange,
  onReset,
}: CreatorProductsToolbarProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-gray-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <label htmlFor="creator-products-search" className="sr-only">
            Search products
          </label>
          <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white/90 px-5 py-3 shadow-sm backdrop-blur-sm transition focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900/90 dark:focus-within:border-orange-500/50 dark:focus-within:ring-orange-500/20">
            <svg
              className="h-5 w-5 shrink-0 text-gray-400"
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
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => onSearch('')}
                className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-700 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as CreatorProductStatusFilter)}
            className={selectClassName()}
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => onTypeChange((e.target.value || '') as ProductType | '')}
            className={selectClassName()}
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            {PRODUCT_TYPES.map((productType) => (
              <option key={productType} value={productType}>
                {PRODUCT_TYPE_LABELS[productType] ?? productType}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as CreatorProductSort)}
            className={selectClassName()}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          {hasActiveFilters ? (
            <>
              <span className="font-semibold text-gray-900 dark:text-white">{resultCount}</span> of{' '}
              {totalCount} product{totalCount !== 1 ? 's' : ''}
            </>
          ) : (
            <>
              {totalCount} product{totalCount !== 1 ? 's' : ''}
            </>
          )}
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="font-semibold text-orange-600 transition hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
