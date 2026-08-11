'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { getMyRequests } from '@/lib/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EcosystemRequestsListSkeleton } from '@/components/ecosystem/EcosystemSkeleton';
import { EcosystemRequestsToolbar, type EcosystemViewMode } from '@/components/ecosystem/EcosystemRequestsToolbar';
import {
  filterEcosystemRows,
  type EcosystemStatusFilter,
} from '@/components/ecosystem/ecosystem-request-utils';
import {
  EcosystemRequestsGrid,
  EcosystemRequestsMobileList,
  EcosystemRequestsTable,
} from '@/components/ecosystem/EcosystemRequestsViews';

type ViewMode = EcosystemViewMode;

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

type Props = {
  newRequestHref?: string;
};

function PageSizeSelect({ value, onChange }: { value: PageSize; onChange: (size: PageSize) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
      <span className="whitespace-nowrap">Rows per page</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as PageSize)}
        className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm font-medium text-neutral-900 outline-none transition focus:border-[#F97316]/50 focus:ring-2 focus:ring-[#F97316]/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        aria-label="Rows per page"
      >
        {PAGE_SIZE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EcosystemRequestsList({ newRequestHref = '/dashboard/ecosystem/new' }: Props) {
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [data, setData] = useState<{
    content: unknown[];
    totalPages: number;
    last: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EcosystemStatusFilter>('all');
  const [pageSize, setPageSize] = useState<PageSize>(10);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyRequests(undefined, page, pageSize);
      setData(res);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load your requests.'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => data?.content ?? [], [data]);
  const filteredRows = useMemo(
    () => filterEcosystemRows(rows, { search, statusFilter }),
    [rows, search, statusFilter]
  );
  const totalPages = data?.totalPages ?? 0;
  const hasRows = rows.length > 0;
  const hasFilteredRows = filteredRows.length > 0;
  const isFiltering = search.trim().length > 0 || statusFilter !== 'all';

  return (
    <section aria-labelledby="ecosystem-requests-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="ecosystem-requests-title" className="text-lg font-bold text-neutral-900 dark:text-white">
            Your requests
          </h2>
          <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">Track status and continue where you left off.</p>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <EcosystemRequestsListSkeleton includeHeader={false} />
      ) : !hasRows ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-200 bg-white px-6 py-20 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="font-medium text-neutral-900 dark:text-white">No requests yet</p>
          <p className="max-w-xs text-sm text-neutral-500">Start your first ecosystem and we&apos;ll guide you step by step.</p>
          <Link
            href={newRequestHref}
            className="rounded-xl border border-[#F97316]/30 px-5 py-2.5 text-sm font-semibold text-[#EA580C] transition hover:bg-[#FFF7ED] dark:border-[#F97316]/40 dark:text-[#FB923C] dark:hover:bg-[#F97316]/10"
          >
            New request
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <EcosystemRequestsToolbar
            rows={rows}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            search={search}
            onSearchChange={setSearch}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {!hasFilteredRows && isFiltering ? (
              <div className="px-6 py-16 text-center">
                <p className="font-medium text-neutral-900 dark:text-white">No matching requests</p>
                <p className="mt-1 text-sm text-neutral-500">Try another keyword or clear your filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                  }}
                  className="mt-4 text-sm font-semibold text-[#EA580C] hover:underline dark:text-[#FB923C]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {viewMode === 'table' ? (
                  <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    <EcosystemRequestsTable rows={filteredRows} />
                    <EcosystemRequestsMobileList rows={filteredRows} />
                  </motion.div>
                ) : (
                  <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    <EcosystemRequestsGrid rows={filteredRows} />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      )}

      {hasRows && !loading && (
        <nav
          className="flex flex-wrap items-center justify-between gap-3 text-sm"
          aria-label="List pagination"
        >
          <PageSizeSelect
            value={pageSize}
            onChange={(next) => {
              setPageSize(next);
              setPage(0);
            }}
          />
          {totalPages > 1 ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Previous
              </button>
              <span className="text-neutral-500">
                Page {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={data?.last ?? true}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Next
              </button>
            </div>
          ) : (
            <span className="text-neutral-500">Page 1 / 1</span>
          )}
        </nav>
      )}
    </section>
  );
}
