'use client';

import { motion } from 'framer-motion';
import {
  buildStatusCounts,
  type EcosystemStatusFilter,
} from '@/components/ecosystem/ecosystem-request-utils';

export type EcosystemViewMode = 'table' | 'grid';

type Props = {
  rows: unknown[];
  statusFilter: EcosystemStatusFilter;
  onStatusFilterChange: (filter: EcosystemStatusFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
  viewMode: EcosystemViewMode;
  onViewModeChange: (mode: EcosystemViewMode) => void;
};

const PILLS: {
  filter: EcosystemStatusFilter;
  countKey: 'inProgress' | 'active' | 'total';
  label: string;
  dot: string;
}[] = [
  { filter: 'inProgress', countKey: 'inProgress', label: 'In progress', dot: 'bg-[#F97316]' },
  { filter: 'active', countKey: 'active', label: 'Active', dot: 'bg-emerald-500' },
  { filter: 'all', countKey: 'total', label: 'Total', dot: 'bg-neutral-400' },
];

function ViewModeToggle({ mode, onChange }: { mode: EcosystemViewMode; onChange: (m: EcosystemViewMode) => void }) {
  const isTable = mode === 'table';
  const nextMode: EcosystemViewMode = isTable ? 'grid' : 'table';
  const label = isTable ? 'Grid' : 'Table';

  return (
    <button
      type="button"
      onClick={() => onChange(nextMode)}
      aria-label={`Switch to ${label.toLowerCase()} view`}
      title={`Switch to ${label.toLowerCase()} view`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-900 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
    >
      {isTable ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      )}
      {label}
    </button>
  );
}

export function EcosystemRequestsToolbar({
  rows,
  statusFilter,
  onStatusFilterChange,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: Props) {
  const counts = buildStatusCounts(rows);

  if (counts.total === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
        {PILLS.map((pill) => {
          const selected = statusFilter === pill.filter;
          return (
            <button
              key={pill.filter}
              type="button"
              aria-pressed={selected}
              onClick={() => onStatusFilterChange(selected ? 'all' : pill.filter)}
              className={`inline-flex items-center gap-2.5 rounded-xl border px-4 py-2.5 transition ${
                selected
                  ? 'border-neutral-400 bg-white shadow-sm ring-1 ring-neutral-900/5 dark:border-neutral-500 dark:bg-neutral-800 dark:ring-white/10'
                  : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-neutral-700'
              }`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${pill.dot}`} aria-hidden />
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{pill.label}</span>
              <span className="text-sm font-bold tabular-nums text-neutral-900 dark:text-white">
                {counts[pill.countKey]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
        <ViewModeToggle mode={viewMode} onChange={onViewModeChange} />
        <div className="relative min-w-0 flex-1 sm:w-72">
        <label htmlFor="ecosystem-requests-search" className="sr-only">
          Search requests
        </label>
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
        </svg>
        <input
          id="ecosystem-requests-search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search code, niche, status…"
          className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-9 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/5 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-white/10"
        />
        {search.length > 0 && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-neutral-400 transition hover:text-neutral-700 dark:hover:text-neutral-200"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        </div>
      </div>
    </motion.div>
  );
}
