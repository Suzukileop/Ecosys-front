'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { listPopularProductSearches, PRODUCT_TYPE_LABELS } from '@/lib/marketplace-api';
import type { MarketplaceProductFormat, MarketplaceSort } from '@/components/marketplace/useMarketplaceCatalogParams';
import type { ProductType } from '@/types/marketplace';
import { BackToTopButton, useBackToTop } from '@/components/ui/ScrollUpStickyBar';
import { MarketplaceFilterDropdown } from '@/components/marketplace/MarketplaceFilterDropdown';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';

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
// Trending shortcuts stay scannable at a glance: one short row, never a wall of chips.
const POPULAR_SEARCH_LIMIT = 5;

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

const HAIRLINE = 'border-black/[0.06] dark:border-white/[0.06]';
function detectPricePreset(minPrice: string, maxPrice: string): PricePresetId {
  const match = PRICE_PRESETS.find(
    (preset) => preset.id !== 'custom' && preset.min === minPrice && preset.max === maxPrice
  );
  return match?.id ?? (minPrice || maxPrice ? 'custom' : 'all');
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[15px] font-medium text-[#111111] dark:text-white">{children}</p>;
}

function pillClass(active: boolean) {
  return `rounded-full border px-3.5 py-1.5 text-[14px] transition-colors duration-200 ${
    active
      ? 'border-[#111111] bg-[#111111] font-medium text-white dark:border-white dark:bg-white dark:text-[#111111]'
      : 'border-black/[0.08] text-neutral-600 hover:border-black/20 hover:text-[#111111] dark:border-white/[0.1] dark:text-neutral-300 dark:hover:border-white/25 dark:hover:text-white'
  }`;
}

function SearchIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function TrendIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8M15 7h6v6" />
    </svg>
  );
}

function SlidersIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[14px] font-medium text-neutral-500 dark:text-neutral-400">
        {label}
      </label>
      <div className="flex w-[8rem] items-center gap-1.5 rounded-lg bg-black/[0.04] px-3 py-2.5 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-black/15 dark:bg-white/[0.06] dark:focus-within:bg-[#111111] dark:focus-within:ring-white/20">
        <span className="shrink-0 text-[15px] text-neutral-400">€</span>
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
          className="w-full min-w-0 border-0 bg-transparent text-[15px] text-[#111111] placeholder:text-neutral-400 focus:outline-none dark:text-white"
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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRICE_PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectPreset(item.id)}
            className={pillClass(preset === item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="flex flex-wrap items-end gap-3" style={STUDIO_FLOAT_IN_STYLE}>
          <CustomPriceField
            id="budget-min"
            label="Min"
            value={localMin}
            onChange={setLocalMin}
            onApply={applyCustom}
          />
          <span className="pb-3 text-[15px] text-neutral-400" aria-hidden>–</span>
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
            className="rounded-lg bg-[#111111] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-[#111111]"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

type MarketplaceCatalogToolbarProps = {
  q: string;
  genre: string;
  type: string;
  format: MarketplaceProductFormat;
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
  format,
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
  const toolbarRef = useRef<HTMLDivElement>(null);
  const onSearchRef = useRef(onSearch);
  const sticky = useBackToTop(toolbarRef);
  const [localQ, setLocalQ] = useState(q);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [popular, setPopular] = useState<{ format: MarketplaceProductFormat; terms: string[] } | null>(null);
  const popularSearches = popular?.format === format ? popular.terms.slice(0, POPULAR_SEARCH_LIMIT) : [];

  onSearchRef.current = onSearch;

  useEffect(() => {
    if (!advancedOpen || popular?.format === format) return;
    let cancelled = false;
    listPopularProductSearches(format, POPULAR_SEARCH_LIMIT)
      .then((terms) => {
        if (!cancelled) setPopular({ format, terms });
      })
      .catch(() => {
        if (!cancelled) setPopular({ format, terms: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [advancedOpen, format, popular?.format]);

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

  const handleReset = () => {
    setLocalQ('');
    onReset();
  };

  const genreOptions = [
    { value: '', label: 'All genres' },
    ...GENRES.filter(Boolean).map((g) => ({ value: g, label: g })),
  ];

  return (
    <>
      <BackToTopButton visible={sticky.visible} onClick={sticky.backToTop} />

      <div
        ref={toolbarRef}
        data-surface-tray
        className="scroll-mt-28 bg-[#EEF0F2] dark:bg-white/[0.04] sm:rounded-xl"
      >
        <div className="flex flex-col gap-2.5 px-5 py-3 sm:gap-4 sm:p-5 lg:flex-row lg:items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(localQ.trim());
            }}
            className="w-full lg:max-w-md lg:flex-1"
          >
            <label htmlFor="marketplace-search" className="sr-only">
              Search products
            </label>
            <div className="flex h-11 items-center gap-2.5 rounded-lg bg-white px-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-transparent transition focus-within:ring-2 focus-within:ring-[#FF5722]/20 dark:bg-[#111111] dark:focus-within:ring-white/20">
              <SearchIcon className="h-[1.1rem] w-[1.1rem] shrink-0 text-[#222222] dark:text-neutral-300" />
              <input
                id="marketplace-search"
                value={localQ}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                placeholder="Search by title, shop name, or author"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-medium text-[#111111] placeholder:font-normal placeholder:text-[#222222] focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-neutral-300"
              />
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:ml-auto">
            {format !== 'physical' ? (
              <MarketplaceFilterDropdown
                id="filter-genre"
                label="Genre"
                value={genre}
                onChange={onGenreChange}
                options={genreOptions}
              />
            ) : null}

            <MarketplaceFilterDropdown
              id="filter-sort"
              label="Sort"
              value={sort}
              onChange={(value) => onSortChange(value as MarketplaceSort)}
              options={SORT_SELECT_OPTIONS}
              defaultValue="popular"
              align="right"
            />

            <button
              type="button"
              onClick={() => setAdvancedOpen((open) => !open)}
              aria-expanded={advancedOpen}
              className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border px-4 text-[14px] font-medium transition-colors duration-200 ${
                advancedOpen
                  ? 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-[#111111]'
                  : 'border-transparent bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-black/15 dark:bg-[#111111] dark:text-white dark:hover:border-white/25'
              }`}
            >
              <SlidersIcon />
              Filters
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="px-1 text-[15px] font-medium text-neutral-600 transition-colors hover:text-[#FF5722] dark:text-neutral-300"
              >
                Reset all
              </button>
            )}
          </div>
        </div>

        {advancedOpen && (
          <div
            className={`space-y-8 border-t px-4 py-6 sm:px-5 ${HAIRLINE}`}
            style={STUDIO_FLOAT_IN_STYLE}
          >
            {format !== 'physical' ? (
              <section>
                <SectionLabel>Product type</SectionLabel>
                <div className="flex flex-wrap gap-2">
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
              </section>
            ) : null}

            {popularSearches.length > 0 ? (
              <section>
                <SectionLabel>Popular searches</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => {
                    const active = q.trim().toLowerCase() === term.toLowerCase();
                    return (
                      <button
                        key={term}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          const next = active ? '' : term;
                          setLocalQ(next);
                          onSearch(next);
                        }}
                        className={`inline-flex items-center gap-1.5 ${pillClass(active)}`}
                      >
                        <TrendIcon className={`h-3.5 w-3.5 ${active ? '' : 'text-neutral-400'}`} />
                        {term}
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            <section>
              <SectionLabel>Budget</SectionLabel>
              <BudgetFilter minPrice={minPrice} maxPrice={maxPrice} onApply={onPriceRangeApply} />
            </section>
          </div>
        )}
      </div>
    </>
  );
}
