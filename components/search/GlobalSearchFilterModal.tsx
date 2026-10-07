'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import type { GlobalSearchCategory } from '@/lib/global-search';
import type { GlobalSearchFilters } from '@/lib/global-search-filters';
import {
  countActiveGlobalSearchFilters,
  createDefaultGlobalSearchFilters,
  GLOBAL_SEARCH_CATEGORY_OPTIONS,
  GLOBAL_SEARCH_DATE_OPTIONS,
  GLOBAL_SEARCH_SORT_OPTIONS,
} from '@/lib/global-search-filters';

type GlobalSearchFilterModalProps = {
  open: boolean;
  filters: GlobalSearchFilters;
  isAuthenticated: boolean;
  resultCount: number;
  onClose: () => void;
  onApply: (filters: GlobalSearchFilters) => void;
};

type FilterPanel = 'show' | 'date' | 'sort';

const subscribeNoop = () => () => {};

const SCROLLBAR =
  '[scrollbar-width:thin] [scrollbar-color:#a3a3a3_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-400 dark:[scrollbar-color:#525252_transparent] [&::-webkit-scrollbar-thumb]:dark:bg-neutral-600';

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function FilterSection({
  title,
  hint,
  changed,
  children,
}: {
  title: string;
  hint?: string;
  changed: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-[#111111] dark:text-neutral-100">
          {title}
          {changed ? <span aria-label="Changed" className="h-1.5 w-1.5 rounded-full bg-[#FF5722]" /> : null}
        </h3>
        {hint ? <p className="text-[14px] text-neutral-500 dark:text-neutral-400">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** Hairline list row with a coral check — same vocabulary as the search dropdown menus. */
function OptionRow({
  role,
  selected,
  onClick,
  label,
}: {
  role: 'checkbox' | 'radio';
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={`group/opt flex w-full items-center justify-between gap-4 border-b border-black/[0.06] py-3.5 text-left text-[15px] transition-colors duration-200 last:border-b-0 dark:border-white/[0.06] ${
        selected
          ? 'font-semibold text-[#111111] dark:text-white'
          : 'text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white'
      }`}
    >
      {label}
      <CheckIcon
        className={`h-4 w-4 shrink-0 transition-opacity duration-200 ${
          selected
            ? 'text-[#FF5722] opacity-100'
            : 'text-neutral-400 opacity-0 group-hover/opt:opacity-40 dark:text-neutral-500'
        }`}
      />
    </button>
  );
}

/** Underlined text tabs, matching the results tab bar above. */
function UnderlineChoice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-x-6 border-b border-black/[0.06] dark:border-white/[0.06]">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`relative py-3 text-[15px] transition-colors duration-200 ${
              active
                ? 'font-semibold text-[#111111] dark:text-white'
                : 'text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            {option.label}
            {active ? <span aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#FF5722]" /> : null}
          </button>
        );
      })}
    </div>
  );
}

export function GlobalSearchFilterModal({
  open,
  filters,
  isAuthenticated,
  onClose,
  onApply,
}: GlobalSearchFilterModalProps) {
  const [draft, setDraft] = useState(filters);
  const [syncedFrom, setSyncedFrom] = useState<{ open: boolean; filters: GlobalSearchFilters }>({ open, filters });
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  if (syncedFrom.open !== open || syncedFrom.filters !== filters) {
    setSyncedFrom({ open, filters });
    if (open) setDraft(filters);
  }

  useEffect(() => {
    if (!open || !mounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, mounted]);

  const categoryOptions = useMemo(() => GLOBAL_SEARCH_CATEGORY_OPTIONS, []);

  const activeFilterCount = countActiveGlobalSearchFilters(draft, isAuthenticated);

  if (!open || !mounted) return null;

  const toggleCategory = (category: GlobalSearchCategory) => {
    setDraft((prev) => {
      const has = prev.categories.includes(category);
      const next = has
        ? prev.categories.filter((item) => item !== category)
        : [...prev.categories, category];
      return { ...prev, categories: next.length > 0 ? next : [category] };
    });
  };

  const reset = () => {
    const defaults = createDefaultGlobalSearchFilters(isAuthenticated);
    setDraft(defaults);
    onApply(defaults);
    onClose();
  };

  const panelHasDraftChange = (panel: FilterPanel): boolean => {
    const defaults = createDefaultGlobalSearchFilters(isAuthenticated);
    switch (panel) {
      case 'show':
        return (
          draft.categories.length !== defaults.categories.length ||
          !defaults.categories.every((category) => draft.categories.includes(category))
        );
      case 'date':
        return draft.dateRange !== defaults.dateRange;
      case 'sort':
        return draft.sort !== defaults.sort;
      default:
        return false;
    }
  };

  const apply = () => {
    onApply(draft);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:p-4"
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <button
        type="button"
        className="absolute inset-0 h-[100dvh] w-full bg-black/50 backdrop-blur-[2px]"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-filters-title"
        style={{ animation: 'pf-float-in 260ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        className="relative flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-black/[0.06] bg-[#F8F8F8] shadow-2xl dark:border-white/[0.08] dark:bg-[#0F0F0F] sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-4 px-8 pt-7">
          <h2 id="search-filters-title" className="text-xl font-bold tracking-[-0.01em] text-[#111111] dark:text-white">
            Filters
            {activeFilterCount > 0 ? (
              <span className="font-bold text-[#FF5722]"> · {String(activeFilterCount).padStart(2, '0')}</span>
            ) : null}
          </h2>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-black/[0.06] hover:text-[#111111] dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
            aria-label="Close"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className={`min-h-0 flex-1 space-y-10 overflow-y-auto px-8 pb-8 pt-6 ${SCROLLBAR}`}>
          <FilterSection
            title="Show"
            hint={`${draft.categories.length} of ${categoryOptions.length}`}
            changed={panelHasDraftChange('show')}
          >
            <div>
              {categoryOptions.map((option) => (
                <OptionRow
                  key={option.value}
                  role="checkbox"
                  label={option.label}
                  selected={draft.categories.includes(option.value)}
                  onClick={() => toggleCategory(option.value)}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Publication date" changed={panelHasDraftChange('date')}>
            <UnderlineChoice
              label="Publication date"
              value={draft.dateRange}
              options={GLOBAL_SEARCH_DATE_OPTIONS}
              onChange={(dateRange) => setDraft((prev) => ({ ...prev, dateRange }))}
            />
          </FilterSection>

          <FilterSection title="Sort by" changed={panelHasDraftChange('sort')}>
            <div role="radiogroup" aria-label="Sort by">
              {GLOBAL_SEARCH_SORT_OPTIONS.map((option) => (
                <OptionRow
                  key={option.value}
                  role="radio"
                  label={option.label}
                  selected={draft.sort === option.value}
                  onClick={() => setDraft((prev) => ({ ...prev, sort: option.value }))}
                />
              ))}
            </div>
          </FilterSection>
        </div>

        <div className="flex items-center justify-between gap-4 px-8 pb-7 pt-4">
          <button
            type="button"
            onClick={reset}
            disabled={activeFilterCount === 0}
            className="text-[15px] font-medium text-neutral-500 transition-colors hover:text-[#FF5722] disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-400"
          >
            Reset all
          </button>
          <button
            type="button"
            onClick={apply}
            className="inline-flex items-center rounded-lg bg-[#111111] px-6 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-[#111111]"
          >
            Apply filters
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
