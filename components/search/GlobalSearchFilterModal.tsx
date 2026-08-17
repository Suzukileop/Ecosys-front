'use client';

import { useEffect, useMemo, useState } from 'react';
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

const PANELS: { id: FilterPanel; label: string }[] = [
  { id: 'show', label: 'Show' },
  { id: 'date', label: 'Publication date' },
  { id: 'sort', label: 'Sort by' },
];

const SCROLLBAR =
  '[scrollbar-width:thin] [scrollbar-color:#a3a3a3_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-400 dark:[scrollbar-color:#525252_transparent] [&::-webkit-scrollbar-thumb]:dark:bg-neutral-600';

function SlidersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" d="M4 7h16M4 12h10M4 17h6" />
      <circle cx="8" cy="7" r="2" fill="currentColor" stroke="none" />
      <circle cx="14" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="11" cy="17" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PanelTitle({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">{children}</p>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
        active
          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-600'
      }`}
    >
      {children}
    </button>
  );
}

function CategoryCard({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition ${
        active
          ? 'border-orange-500 bg-orange-50/50 dark:border-orange-500/60 dark:bg-orange-500/10'
          : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600'
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
          active ? 'border-orange-500' : 'border-neutral-300 dark:border-neutral-600'
        }`}
      >
        {active ? <span className="h-2 w-2 rounded-full bg-orange-500" /> : null}
      </span>
      <span className="text-sm font-medium text-neutral-900 dark:text-white">{label}</span>
    </button>
  );
}

export function GlobalSearchFilterButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open search filters"
      className="shrink-0 p-1.5 text-neutral-500 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
    >
      <SlidersIcon className="h-[22px] w-[22px]" />
    </button>
  );
}

export function GlobalSearchFilterModal({
  open,
  filters,
  isAuthenticated,
  resultCount,
  onClose,
  onApply,
}: GlobalSearchFilterModalProps) {
  const [draft, setDraft] = useState(filters);
  const [activePanel, setActivePanel] = useState<FilterPanel>('show');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setDraft(filters);
      setActivePanel('show');
    }
  }, [open, filters]);

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

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 h-[100dvh] w-full bg-neutral-950/60 backdrop-blur-sm"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter search"
        className="relative flex h-[min(90vh,640px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Filter Search</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Refine categories, date, and sort
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <aside className="flex w-52 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/50">
            <nav className="flex-1 space-y-1 p-3">
              {PANELS.map((panel) => {
                const isActive = activePanel === panel.id;
                const hasChange = panelHasDraftChange(panel.id);
                return (
                  <button
                    key={panel.id}
                    type="button"
                    onClick={() => setActivePanel(panel.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                      isActive
                        ? 'border border-orange-500/40 bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
                        : 'border border-transparent text-neutral-600 hover:bg-white/80 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <span>{panel.label}</span>
                    {hasChange ? <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500" /> : null}
                  </button>
                );
              })}
            </nav>

            {activeFilterCount > 0 ? (
              <div className="m-3 rounded-xl border border-orange-200 bg-orange-50 px-3 py-3 dark:border-orange-500/30 dark:bg-orange-500/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Active filters
                </p>
                <p className="mt-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {activeFilterCount} {activeFilterCount === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            ) : null}
          </aside>

          <div className={`min-h-0 flex-1 overflow-y-auto px-6 py-6 ${SCROLLBAR}`}>
            {activePanel === 'show' ? (
              <div className="space-y-4">
                <PanelTitle>Show</PanelTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  {categoryOptions.map((option) => (
                    <CategoryCard
                      key={option.value}
                      label={option.label}
                      active={draft.categories.includes(option.value)}
                      onClick={() => toggleCategory(option.value)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {activePanel === 'date' ? (
              <div className="space-y-4">
                <PanelTitle>Publication date</PanelTitle>
                <div className="flex flex-wrap gap-2">
                  {GLOBAL_SEARCH_DATE_OPTIONS.map((option) => (
                    <PillButton
                      key={option.value}
                      active={draft.dateRange === option.value}
                      onClick={() => setDraft((prev) => ({ ...prev, dateRange: option.value }))}
                    >
                      {option.label}
                    </PillButton>
                  ))}
                </div>
              </div>
            ) : null}

            {activePanel === 'sort' ? (
              <div className="space-y-4">
                <PanelTitle>Sort by</PanelTitle>
                <select
                  value={draft.sort}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      sort: event.target.value as GlobalSearchFilters['sort'],
                    }))
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                >
                  {GLOBAL_SEARCH_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <button
            type="button"
            onClick={reset}
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            Clear all filters
          </button>
          <div className="flex items-center gap-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Showing {resultCount.toLocaleString()} {resultCount === 1 ? 'result' : 'results'}
            </p>
            <button
              type="button"
              onClick={() => {
                onApply(draft);
                onClose();
              }}
              className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
