'use client';

import type { ReactNode } from 'react';
import { PRODUCT_TYPE_LABELS } from '@/lib/marketplace-api';
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

const FORMAT_OPTIONS: { value: CreatorProductFormatFilter; label: string }[] = [
  { value: 'all', label: 'All formats' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'physical', label: 'Physical' },
];

const SORT_OPTIONS: { value: CreatorProductSort; label: string }[] = [
  { value: 'newest', label: 'Most recent' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'views', label: 'Most viewed' },
];

type CreatorProductsToolbarProps = {
  query: string;
  status: CreatorProductStatusFilter;
  format: CreatorProductFormatFilter;
  type: ProductType | '';
  sort: CreatorProductSort;
  resultCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onSearch: (query: string) => void;
  onStatusChange: (status: CreatorProductStatusFilter) => void;
  onFormatChange: (format: CreatorProductFormatFilter) => void;
  onTypeChange: (type: ProductType | '') => void;
  onSortChange: (sort: CreatorProductSort) => void;
};

function FilterSelect({
  id,
  value,
  onChange,
  'aria-label': ariaLabel,
  children,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  'aria-label': string;
  children: ReactNode;
}) {
  return (
    <div className="relative shrink-0">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="min-w-[8.5rem] cursor-pointer appearance-none rounded-xl border-0 bg-neutral-100 py-2.5 pl-4 pr-10 text-sm font-medium text-neutral-800 transition focus:outline-none focus:ring-2 focus:ring-orange-200 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:ring-orange-500/30"
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

function StatusToggle({
  status,
  onStatusChange,
}: {
  status: CreatorProductStatusFilter;
  onStatusChange: (status: CreatorProductStatusFilter) => void;
}) {
  const isDraft = status === 'draft';
  const isPublished = !isDraft;

  return (
    <div className="inline-flex shrink-0 items-center gap-2" role="group" aria-label="Filter by status">
      <button
        type="button"
        onClick={() => onStatusChange('draft')}
        className={`text-sm font-semibold transition ${
          isDraft
            ? 'text-orange-600 dark:text-orange-400'
            : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
        }`}
      >
        Draft
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={isPublished}
        aria-label={isPublished ? 'Showing published products' : 'Showing draft products'}
        onClick={() => onStatusChange(isPublished ? 'draft' : 'published')}
        className={`relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 ${
          isPublished ? 'bg-orange-500' : 'bg-neutral-400 dark:bg-neutral-600'
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
            isPublished ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <button
        type="button"
        onClick={() => onStatusChange('published')}
        className={`text-sm font-semibold transition ${
          isPublished
            ? 'text-orange-600 dark:text-orange-400'
            : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
        }`}
      >
        Published
      </button>
    </div>
  );
}

export function CreatorProductsToolbar({
  query,
  status,
  format,
  type,
  sort,
  resultCount,
  totalCount,
  hasActiveFilters,
  onSearch,
  onStatusChange,
  onFormatChange,
  onTypeChange,
  onSortChange,
}: CreatorProductsToolbarProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-transparent dark:bg-neutral-900/70 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <label htmlFor="creator-products-search" className="sr-only">
            Search products
          </label>
          <div className="flex items-center gap-3 rounded-full bg-neutral-100 px-5 py-3 transition focus-within:ring-2 focus-within:ring-orange-200 dark:bg-neutral-800 dark:focus-within:ring-orange-500/30">
            <svg
              className="h-5 w-5 shrink-0 text-neutral-400"
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
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => onSearch('')}
                className="rounded-full p-1 text-neutral-400 transition hover:bg-neutral-200/80 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <FilterSelect
            value={format}
            onChange={(v) => onFormatChange(v as CreatorProductFormatFilter)}
            aria-label="Filter by format"
          >
            {FORMAT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            value={type}
            onChange={(v) => onTypeChange((v || '') as ProductType | '')}
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            {PRODUCT_TYPES.map((productType) => (
              <option key={productType} value={productType}>
                {PRODUCT_TYPE_LABELS[productType] ?? productType}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            value={sort}
            onChange={(v) => onSortChange(v as CreatorProductSort)}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
          <StatusToggle status={status} onStatusChange={onStatusChange} />
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        {hasActiveFilters ? (
          <>
            <span className="font-semibold text-gray-900 dark:text-white">{resultCount}</span> of{' '}
            {totalCount} product{totalCount !== 1 ? 's' : ''}
          </>
        ) : (
          <>
            {resultCount} product{resultCount !== 1 ? 's' : ''}
          </>
        )}
      </p>
    </div>
  );
}
