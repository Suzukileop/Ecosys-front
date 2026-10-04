'use client';

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MarketplaceFilterDropdown } from '@/components/marketplace/MarketplaceFilterDropdown';
import { APP_FIELD, APP_FIELD_HOVER } from '@/components/landing/landingBrand';
import type {
  CreatorProductFormatFilter,
  CreatorProductSort,
  CreatorProductStatusFilter,
} from '@/components/creator/useCreatorProductsFilter';

export type CreatorProductsLayout = 'all' | 'catalogues';

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
  { id: 'physical', label: 'Material' },
  { id: 'virtual', label: 'Digital' },
];

const STATUS_OPTIONS: { id: Exclude<CreatorProductStatusFilter, 'all'>; label: string }[] = [
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' },
];

type CreatorProductsToolbarProps = {
  query: string;
  status: CreatorProductStatusFilter;
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
  onSortChange: (sort: CreatorProductSort) => void;
  onFormatChange: (format: CreatorProductFormatFilter) => void;
  /** When set, shows the "All / By catalogue" display switch. */
  layout?: CreatorProductsLayout;
  onLayoutChange?: (layout: CreatorProductsLayout) => void;
};

const LAYOUT_OPTIONS: { id: CreatorProductsLayout; label: string; icon: string }[] = [
  {
    id: 'all',
    label: 'All',
    icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
  },
  {
    id: 'catalogues',
    label: 'By catalogue',
    icon: 'M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3',
  },
];

function LayoutSwitch({
  layout,
  onLayoutChange,
}: {
  layout: CreatorProductsLayout;
  onLayoutChange: (layout: CreatorProductsLayout) => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg bg-white p-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-[#111111]"
      role="radiogroup"
      aria-label="Display"
    >
      {LAYOUT_OPTIONS.map((option) => {
        const active = layout === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onLayoutChange(option.id)}
            title={option.id === 'all' ? 'Show all products together' : 'Group products by catalogue'}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
              active
                ? 'bg-black/[0.06] text-[#111111] dark:bg-white/[0.1] dark:text-white'
                : 'text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d={option.icon} />
            </svg>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

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

const subscribeNoop = () => () => {};

function SheetSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="py-5">
      <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Phone-only sheet holding sort, format and display, so the page keeps a single control row. */
function MobileFilterSheet({
  open,
  onClose,
  sort,
  format,
  formatCounts,
  groupActive,
  resultCount,
  layout,
  onSortChange,
  onFormatChange,
  onLayoutChange,
}: {
  open: boolean;
  onClose: () => void;
  sort: CreatorProductSort;
  format: CreatorProductFormatFilter;
  formatCounts: Record<CreatorProductFormatFilter, number>;
  groupActive: boolean;
  resultCount: number;
  layout?: CreatorProductsLayout;
  onSortChange: (sort: CreatorProductSort) => void;
  onFormatChange: (format: CreatorProductFormatFilter) => void;
  onLayoutChange?: (layout: CreatorProductsLayout) => void;
}) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const segment = (active: boolean) =>
    `inline-flex h-10 items-center justify-center gap-2 rounded-full text-[14px] font-medium transition-colors ${
      active
        ? 'bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-white dark:text-[#111111]'
        : 'text-neutral-500 dark:text-neutral-400'
    }`;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:hidden">
      <button
        type="button"
        aria-label="Close filters"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] dark:bg-black/60"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter and sort"
        className="relative flex max-h-[85dvh] w-full flex-col rounded-t-[22px] bg-white dark:bg-[#0A0A0A]"
      >
        <div className="shrink-0 px-5 pt-2">
          <span aria-hidden className="mx-auto block h-1 w-9 rounded-full bg-black/[0.12] dark:bg-white/[0.16]" />
          <div className="flex items-center justify-between pb-1 pt-3">
            <h2 className="text-[17px] font-semibold text-[#111111] dark:text-white">Filter & sort</h2>
            <button
              type="button"
              onClick={() => {
                onSortChange('newest');
                onFormatChange('all');
              }}
              className="text-[14px] font-medium text-neutral-500 transition-colors hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 divide-y divide-black/[0.06] overflow-y-auto overscroll-contain px-5 dark:divide-white/[0.08]">
          <SheetSection title="Format">
            <div className="grid grid-cols-3 rounded-full bg-black/[0.05] p-1 dark:bg-white/[0.06]" role="radiogroup" aria-label="Format">
              {FORMAT_OPTIONS.map((option) => {
                const active = format === option.id && !groupActive;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onFormatChange(option.id)}
                    className={segment(active)}
                  >
                    {option.label}
                    <span className="tabular-nums text-neutral-400 dark:text-neutral-500">{formatCounts[option.id]}</span>
                  </button>
                );
              })}
            </div>
          </SheetSection>

          {layout && onLayoutChange ? (
            <SheetSection title="Display">
              <div className="grid grid-cols-2 rounded-full bg-black/[0.05] p-1 dark:bg-white/[0.06]" role="radiogroup" aria-label="Display">
                {LAYOUT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={layout === option.id}
                    onClick={() => onLayoutChange(option.id)}
                    className={segment(layout === option.id)}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d={option.icon} />
                    </svg>
                    {option.label}
                  </button>
                ))}
              </div>
            </SheetSection>
          ) : null}

          <SheetSection title="Sort by">
            <div className="-mx-2" role="radiogroup" aria-label="Sort by">
              {SORT_OPTIONS.map((option) => {
                const active = sort === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onSortChange(option.value)}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-3 text-left text-[15px] transition-colors active:bg-black/[0.04] dark:active:bg-white/[0.06] ${
                      active ? 'font-semibold text-[#111111] dark:text-white' : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {option.label}
                    {active ? (
                      <svg className="h-4 w-4 text-[#FF5722]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </SheetSection>
        </div>

        <div className="shrink-0 border-t border-black/[0.06] px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#111111] text-[15px] font-semibold text-white transition-opacity active:opacity-85 dark:bg-white dark:text-[#111111]"
          >
            Show {resultCount} product{resultCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function CreatorProductsToolbar({
  query,
  status,
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
  onSortChange,
  onFormatChange,
  layout,
  onLayoutChange,
}: CreatorProductsToolbarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const activeSheetFilters = (sort !== 'newest' ? 1 : 0) + (format !== 'all' && !groupActive ? 1 : 0);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-end justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.06]">
        {!hideStatusToggle ? (
          <StatusTabs status={status} onStatusChange={onStatusChange} />
        ) : (
          <span />
        )}
        <p className={`pb-3.5 text-[14px] text-neutral-500 dark:text-neutral-400 ${hasActiveFilters ? '' : 'max-sm:hidden'}`}>
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

      <div
        data-surface-tray
        className="sm:rounded-xl sm:bg-[#EEF0F2] sm:p-2.5 sm:dark:bg-white/[0.04]"
      >
      <div className="flex items-center gap-2 md:gap-2.5">
        <div className="min-w-0 flex-1">
          <label htmlFor="creator-products-search" className="sr-only">
            Search products
          </label>
          <div
            className={`flex h-11 items-center gap-3 rounded-lg px-4 transition ${APP_FIELD} ${APP_FIELD_HOVER} focus-within:bg-[#E6E9EC] dark:bg-white/[0.06] dark:hover:bg-white/[0.08] dark:focus-within:bg-white/[0.08] sm:bg-white sm:shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:hover:bg-white sm:focus-within:bg-white sm:focus-within:ring-1 sm:focus-within:ring-black/15 sm:dark:bg-[#111111] sm:dark:focus-within:ring-white/20`}
          >
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
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
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
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label={activeSheetFilters > 0 ? `Filter and sort, ${activeSheetFilters} active` : 'Filter and sort'}
          className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#111111] transition-colors dark:bg-white/[0.06] dark:text-white sm:hidden ${APP_FIELD}`}
        >
          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
            <circle cx="16" cy="6" r="2" />
            <circle cx="10" cy="12" r="2" />
            <circle cx="18" cy="18" r="2" />
          </svg>
          {activeSheetFilters > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF5722] px-1 text-[11px] font-semibold tabular-nums text-white">
              {activeSheetFilters}
            </span>
          ) : null}
        </button>
      </div>

      <MobileFilterSheet
        open={sheetOpen}
        onClose={closeSheet}
        sort={sort}
        format={format}
        formatCounts={formatCounts}
        groupActive={groupActive}
        resultCount={resultCount}
        layout={layout}
        onSortChange={onSortChange}
        onFormatChange={onFormatChange}
        onLayoutChange={onLayoutChange}
      />

      <div className="hidden items-center justify-between gap-3 sm:mt-2.5 sm:flex sm:border-t sm:border-black/[0.06] sm:pt-2.5 sm:dark:border-white/[0.06]">
      <div
        className="flex min-w-0 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="radiogroup"
        aria-label="Filter by format"
      >
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
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-[14px] font-medium transition-colors duration-200 ${
                selected
                  ? 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-[#111111]'
                  : 'border-transparent bg-white text-neutral-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:text-[#111111] dark:bg-[#111111] dark:text-neutral-300 dark:hover:text-white'
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
      {layout && onLayoutChange ? (
        <div className="shrink-0">
          <LayoutSwitch layout={layout} onLayoutChange={onLayoutChange} />
        </div>
      ) : null}
      </div>
      </div>
    </div>
  );
}
