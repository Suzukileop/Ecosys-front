'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PRODUCT_TYPE_LABELS } from '@/lib/marketplace-api';
import type { MarketplaceSort } from '@/components/marketplace/useMarketplaceCatalogParams';
import type { ProductType } from '@/types/marketplace';

const GENRES = ['', 'Tech', 'Lifestyle', 'Business', 'Art', 'Sport', 'Music'];

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

const SORT_SELECT_OPTIONS: { value: MarketplaceSort; label: string }[] = [
  { value: 'popular', label: 'Popularity' },
  { value: 'newest', label: 'Recent' },
  { value: 'views', label: 'Most viewed' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

const SEARCH_DEBOUNCE_MS = 350;

type PricePresetId = 'all' | 'free' | 'under10' | 'range10_50' | 'range50_100' | 'over100' | 'custom';

const PRICE_PRESETS: { id: PricePresetId; label: string; min: string; max: string }[] = [
  { id: 'all', label: 'All prices', min: '', max: '' },
  { id: 'free', label: 'Free', min: '0', max: '0' },
  { id: 'under10', label: '< €10', min: '', max: '10' },
  { id: 'range10_50', label: '€10–50', min: '10', max: '50' },
  { id: 'range50_100', label: '€50–100', min: '50', max: '100' },
  { id: 'over100', label: '€100+', min: '100', max: '' },
  { id: 'custom', label: 'Custom', min: '', max: '' },
];

const BUDGET_SELECT_OPTIONS = PRICE_PRESETS.map((preset) => ({
  value: preset.id,
  label: preset.label,
}));

function detectPricePreset(minPrice: string, maxPrice: string): PricePresetId {
  const match = PRICE_PRESETS.find(
    (preset) => preset.id !== 'custom' && preset.min === minPrice && preset.max === maxPrice
  );
  return match?.id ?? (minPrice || maxPrice ? 'custom' : 'all');
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300">{children}</p>;
}

function pillClass(active: boolean) {
  return `rounded-full border px-3 py-1.5 text-xs font-medium transition ${
    active
      ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
      : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:text-gray-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300 dark:hover:border-orange-500/50 dark:hover:text-white'
  }`;
}

function budgetPillClass(active: boolean) {
  return `rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
    active
      ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
      : 'border-gray-200 bg-stone-50 text-gray-700 hover:border-gray-300 hover:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700'
  }`;
}

function FlameIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
      />
    </svg>
  );
}

function ClockIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function EyeIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function SortAscIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 8v12M15 17l3 3 3-3" />
    </svg>
  );
}

function SortDescIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 16V4M15 7l3-3 3 3" />
    </svg>
  );
}

function SortOptionIcon({ sort }: { sort: MarketplaceSort }) {
  if (sort === 'popular') return <FlameIcon />;
  if (sort === 'newest') return <ClockIcon />;
  if (sort === 'views') return <EyeIcon />;
  return null;
}

function SlidersIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8v-2m0 2a2 2 0 100-4m0 4a2 2 0 110-4m12 4v-2m0 2a2 2 0 100-4m0 4a2 2 0 110-4M6 12h.01M12 12h.01M18 12h.01"
      />
    </svg>
  );
}

type FilterSelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  compact?: boolean;
  activeOverride?: boolean;
};

function FilterSelect({ id, label, value, onChange, options, compact = false, activeOverride }: FilterSelectProps) {
  const active = activeOverride ?? Boolean(value);

  return (
    <div className={compact ? 'w-auto shrink-0' : 'w-full sm:w-auto sm:min-w-[10rem]'}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-gray-700 sm:sr-only">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full cursor-pointer appearance-none rounded-xl border font-medium transition focus:outline-none focus:ring-2 focus:ring-orange-200 ${
            compact ? 'py-2 pl-3 pr-8 text-xs' : 'py-2.5 pl-3.5 pr-9 text-sm'
          } ${
            active
              ? 'border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-200'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200 dark:hover:border-neutral-600'
          }`}
        >
          {options.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

type BudgetFilterProps = {
  minPrice: string;
  maxPrice: string;
  onApply: (min: string, max: string) => void;
};

function CustomPriceField({
  id,
  label,
  value,
  onChange,
  onApply,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <div className="flex w-[7.5rem] items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-2 shadow-sm focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 dark:border-neutral-600 dark:bg-neutral-800 dark:focus-within:border-orange-500/50 dark:focus-within:ring-orange-500/20">
        <span className="shrink-0 text-sm text-gray-400">€</span>
        <input
          id={id}
          type="number"
          min={0}
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onApply}
          onKeyDown={(e) => e.key === 'Enter' && onApply()}
          placeholder="0"
          className="w-full min-w-0 border-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 dark:placeholder:text-gray-500"
        />
      </div>
    </div>
  );
}

function BudgetFilter({ minPrice, maxPrice, onApply }: BudgetFilterProps) {
  const detected = useMemo(() => detectPricePreset(minPrice, maxPrice), [minPrice, maxPrice]);
  const [preset, setPreset] = useState<PricePresetId>(detected);
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    setPreset(detectPricePreset(minPrice, maxPrice));
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const selectPreset = (id: PricePresetId) => {
    setPreset(id);
    if (id === 'custom') return;
    const found = PRICE_PRESETS.find((item) => item.id === id);
    if (!found) return;
    onApply(found.min, found.max);
  };

  const applyCustom = () => {
    let min = localMin.trim();
    let max = localMax.trim();
    const minNum = min ? Number(min) : null;
    const maxNum = max ? Number(max) : null;
    if (minNum != null && maxNum != null && minNum > maxNum) {
      min = localMax.trim();
      max = localMin.trim();
      setLocalMin(min);
      setLocalMax(max);
    }
    onApply(min, max);
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      {PRICE_PRESETS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => selectPreset(item.id)}
          className={budgetPillClass(preset === item.id)}
        >
          {item.label}
        </button>
      ))}

      {preset === 'custom' && (
        <>
          <CustomPriceField
            id="budget-min"
            label="Min"
            value={localMin}
            onChange={setLocalMin}
            onApply={applyCustom}
          />
          <span className="pb-2.5 text-sm text-gray-400" aria-hidden>–</span>
          <CustomPriceField
            id="budget-max"
            label="Max"
            value={localMax}
            onChange={setLocalMax}
            onApply={applyCustom}
          />
          <button
            type="button"
            onClick={applyCustom}
            className="rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            Apply
          </button>
        </>
      )}
    </div>
  );
}

function segmentBtnClass(active: boolean, position: 'first' | 'middle' | 'last' | 'solo') {
  const radius =
    position === 'first'
      ? 'rounded-l-lg'
      : position === 'last'
        ? 'rounded-r-lg'
        : position === 'solo'
          ? 'rounded-lg'
          : '';

  return `inline-flex items-center gap-1.5 border-y border-r border-gray-200 px-3 py-2 text-xs font-medium transition first:border-l dark:border-neutral-600 ${radius} ${
    active
      ? 'border-orange-400 bg-orange-500 text-white dark:border-orange-500'
      : 'bg-white text-gray-700 hover:bg-stone-50 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700'
  }`;
}

type SortByControlProps = {
  sort: MarketplaceSort;
  onSortChange: (sort: MarketplaceSort) => void;
};

function SortByControl({ sort, onSortChange }: SortByControlProps) {
  const mainOptions = SORT_SELECT_OPTIONS.filter(
    (o) => o.value !== 'price_asc' && o.value !== 'price_desc'
  ) as { value: Exclude<MarketplaceSort, 'price_asc' | 'price_desc'>; label: string }[];

  return (
    <div className="inline-flex max-w-full flex-wrap overflow-hidden rounded-lg">
      {mainOptions.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSortChange(option.value)}
          className={segmentBtnClass(sort === option.value, index === 0 ? 'first' : 'middle')}
        >
          <SortOptionIcon sort={option.value} />
          {option.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onSortChange('price_asc')}
        title="Price low to high"
        aria-label="Price low to high"
        className={segmentBtnClass(sort === 'price_asc', 'middle')}
      >
        <SortAscIcon />
      </button>
      <button
        type="button"
        onClick={() => onSortChange('price_desc')}
        title="Price high to low"
        aria-label="Price high to low"
        className={segmentBtnClass(sort === 'price_desc', 'last')}
      >
        <SortDescIcon />
      </button>
    </div>
  );
}

type MarketplaceCatalogStickyBarProps = {
  visible: boolean;
  stickyTop: string;
  localQ: string;
  onLocalQChange: (value: string) => void;
  onSearch: (query: string) => void;
  genre: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  sort: MarketplaceSort;
  genreOptions: { value: string; label: string }[];
  typeOptions: { value: string; label: string }[];
  budgetPreset: PricePresetId;
  hasActiveFilters: boolean;
  onGenreChange: (genre: string) => void;
  onTypeChange: (type: string) => void;
  onSortChange: (sort: MarketplaceSort) => void;
  onBudgetPresetChange: (presetId: PricePresetId) => void;
  onReset: () => void;
};

function MarketplaceCatalogStickyBar({
  visible,
  stickyTop,
  localQ,
  onLocalQChange,
  onSearch,
  genre,
  type,
  sort,
  genreOptions,
  typeOptions,
  budgetPreset,
  hasActiveFilters,
  onGenreChange,
  onTypeChange,
  onSortChange,
  onBudgetPresetChange,
  onReset,
}: MarketplaceCatalogStickyBarProps) {
  return (
    <div
      className={`fixed right-0 z-30 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md transition-all duration-200 dark:border-neutral-800 dark:bg-neutral-950/95 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'
      }`}
      style={{ top: stickyTop, left: 'var(--dash-sidebar-w, 0)' }}
      aria-hidden={!visible}
    >
      <div className="flex w-full flex-wrap items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-6 xl:flex-nowrap">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(localQ.trim());
          }}
          className="w-full min-w-[12rem] flex-1 sm:min-w-[18rem] xl:max-w-2xl"
        >
          <label htmlFor="marketplace-search-sticky" className="sr-only">Search products</label>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-800">
            <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="marketplace-search-sticky"
              value={localQ}
              onChange={(e) => onLocalQChange(e.target.value)}
              placeholder="Search by title or tag…"
              className="min-w-0 flex-1 border-0 bg-transparent text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2 xl:ml-auto xl:shrink-0">
        <FilterSelect
          id="sticky-filter-type"
          label="Type"
          value={type}
          onChange={(value) => onTypeChange(value)}
          options={typeOptions}
          compact
        />
        <FilterSelect
          id="sticky-filter-sort"
          label="Sort by"
          value={sort}
          onChange={(value) => onSortChange(value as MarketplaceSort)}
          options={SORT_SELECT_OPTIONS}
          compact
          activeOverride={sort !== 'popular'}
        />
        <FilterSelect
          id="sticky-filter-genre"
          label="Genre"
          value={genre}
          onChange={(value) => onGenreChange(value)}
          options={genreOptions}
          compact
        />
        <FilterSelect
          id="sticky-filter-budget"
          label="Budget"
          value={budgetPreset}
          onChange={(value) => onBudgetPresetChange(value as PricePresetId)}
          options={BUDGET_SELECT_OPTIONS}
          compact
          activeOverride={budgetPreset !== 'all'}
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20"
          >
            Reset
          </button>
        )}
        </div>
      </div>
    </div>
  );
}

type MarketplaceCatalogToolbarProps = {
  q: string;
  genre: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  sort: MarketplaceSort;
  hasActiveFilters: boolean;
  onSearch: (query: string) => void;
  onGenreChange: (genre: string) => void;
  onTypeChange: (type: string) => void;
  onPriceRangeApply: (min: string, max: string) => void;
  onSortChange: (sort: MarketplaceSort) => void;
  onReset: () => void;
};

export function MarketplaceCatalogToolbar({
  q,
  genre,
  type,
  minPrice,
  maxPrice,
  sort,
  hasActiveFilters,
  onSearch,
  onGenreChange,
  onTypeChange,
  onPriceRangeApply,
  onSortChange,
  onReset,
}: MarketplaceCatalogToolbarProps) {
  const pathname = usePathname();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const onSearchRef = useRef(onSearch);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [stickyTop, setStickyTop] = useState('4.25rem');
  const [localQ, setLocalQ] = useState(q);
  const [advancedOpen, setAdvancedOpen] = useState(true);

  onSearchRef.current = onSearch;

  const budgetPreset = useMemo(
    () => detectPricePreset(minPrice, maxPrice),
    [minPrice, maxPrice]
  );

  useEffect(() => {
    setLocalQ(q);
  }, [q]);

  useEffect(() => {
    const trimmed = localQ.trim();
    if (trimmed === q.trim()) return;

    const timer = window.setTimeout(() => {
      onSearchRef.current(trimmed);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [localQ, q]);

  const handleSearchInputChange = (value: string) => {
    setLocalQ(value);
  };

  useEffect(() => {
    const inDashboard = Boolean(document.querySelector('[data-dashboard-main]'));
    setStickyTop(inDashboard ? '4.25rem' : '3.5rem');
  }, [pathname]);

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-72px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleReset = () => {
    setLocalQ('');
    onReset();
  };

  const genreOptions = [
    { value: '', label: 'All genres' },
    ...GENRES.filter(Boolean).map((g) => ({ value: g, label: g })),
  ];

  const typeOptions = [
    { value: '', label: 'All types' },
    ...PRODUCT_TYPES.map((item) => ({
      value: item,
      label: PRODUCT_TYPE_LABELS[item] ?? item,
    })),
  ];

  const handleBudgetPresetChange = (presetId: PricePresetId) => {
    if (presetId === 'custom') {
      setAdvancedOpen(true);
      toolbarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const found = PRICE_PRESETS.find((item) => item.id === presetId);
    if (found) onPriceRangeApply(found.min, found.max);
  };

  return (
    <>
      <MarketplaceCatalogStickyBar
        visible={showStickyBar}
        stickyTop={stickyTop}
        localQ={localQ}
        onLocalQChange={handleSearchInputChange}
        onSearch={onSearch}
        genre={genre}
        type={type}
        minPrice={minPrice}
        maxPrice={maxPrice}
        sort={sort}
        genreOptions={genreOptions}
        typeOptions={typeOptions}
        budgetPreset={budgetPreset}
        hasActiveFilters={hasActiveFilters}
        onGenreChange={onGenreChange}
        onTypeChange={onTypeChange}
        onSortChange={onSortChange}
        onBudgetPresetChange={handleBudgetPresetChange}
        onReset={handleReset}
      />

      <div ref={toolbarRef} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5 dark:border-neutral-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(localQ.trim());
          }}
          className="w-full sm:max-w-lg sm:shrink-0"
        >
          <label htmlFor="marketplace-search" className="sr-only">
            Search products
          </label>
          <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 transition focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-800 dark:focus-within:border-orange-500/50 dark:focus-within:ring-orange-500/20">
            <svg
              className="h-4 w-4 shrink-0 text-gray-400"
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
              id="marketplace-search"
              value={localQ}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              placeholder="Search by title or tag…"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-end gap-3 sm:ml-auto">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20"
            >
              Reset all
            </button>
          )}

          <FilterSelect
            id="filter-genre"
            label="Genre"
            value={genre}
            onChange={(value) => onGenreChange(value)}
            options={genreOptions}
          />

          <button
            type="button"
            onClick={() => setAdvancedOpen((open) => !open)}
            aria-expanded={advancedOpen}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-orange-200 ${
              advancedOpen
                ? 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-200'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-stone-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700'
            }`}
          >
            <SlidersIcon />
            Advanced filters
            <svg
              className={`h-4 w-4 text-gray-500 transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {advancedOpen && (
      <div className="bg-stone-50/60 p-4 sm:p-5 dark:bg-neutral-950/50">
        <div className="space-y-4">
          <section className="p-3.5 sm:p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 flex-1">
                <SectionLabel>Product type</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => onTypeChange('')} className={pillClass(!type)}>
                    All
                  </button>
                  {PRODUCT_TYPES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onTypeChange(type === item ? '' : item)}
                      className={pillClass(type === item)}
                    >
                      {PRODUCT_TYPE_LABELS[item] ?? item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="shrink-0 lg:ml-auto lg:pl-6">
                <SectionLabel>Sort by</SectionLabel>
                <SortByControl sort={sort} onSortChange={onSortChange} />
              </div>
            </div>
          </section>

          <section className="p-3.5 sm:p-4">
            <SectionLabel>Budget</SectionLabel>
            <BudgetFilter
              minPrice={minPrice}
              maxPrice={maxPrice}
              onApply={onPriceRangeApply}
            />
          </section>
        </div>
      </div>
      )}
      </div>
    </>
  );
}
