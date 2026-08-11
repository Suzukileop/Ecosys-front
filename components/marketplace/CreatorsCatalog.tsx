'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { CreatorCard } from '@/components/CreatorCard';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { normalizeCreatorSummary } from '@/lib/marketplace-api';
import type { MarketplaceCreatorsPage, MarketplaceCreatorSummary } from '@/types/marketplace';

const GENRES = ['', 'Tech', 'Lifestyle', 'Business', 'Art', 'Sport', 'Music'];

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function FilterToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 whitespace-nowrap">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-orange-500' : 'bg-gray-200 dark:bg-neutral-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
}

function CreatorsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const genre = searchParams.get('genre') ?? '';
  const verifiedOnly = searchParams.get('verified') === '1';
  const availableOnly = searchParams.get('available') === '1';
  const page = Math.max(0, Number(searchParams.get('page') ?? '0') || 0);

  const [localQ, setLocalQ] = useState(q);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<MarketplaceCreatorsPage | null>(null);

  useEffect(() => {
    setLocalQ(q);
  }, [q]);

  const pushParams = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === '') params.delete(k);
      else params.set(k, v);
    });
    const qs = params.toString();
    router.push(qs ? `/marketplace/creators?${qs}` : '/marketplace/creators');
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const trimmed = q.trim();
      const res = trimmed
        ? await api.get<MarketplaceCreatorsPage>('/api/marketplace/creators/search', {
            params: {
              q: trimmed,
              page,
              size: 12,
              ...(availableOnly ? { available: true } : {}),
            },
          })
        : await api.get<MarketplaceCreatorsPage>('/api/marketplace/creators', {
            params: {
              page,
              size: 12,
              ...(genre ? { specialite: genre } : {}),
              ...(verifiedOnly ? { verified: true } : {}),
              ...(availableOnly ? { available: true } : {}),
            },
          });
      setPageData({
        ...res.data,
        content: (res.data.content ?? []).map((row) =>
          normalizeCreatorSummary(row as unknown as Record<string, unknown>)
        ),
      });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load creators.'));
      setPageData(null);
    } finally {
      setLoading(false);
    }
  }, [q, genre, verifiedOnly, availableOnly, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const creators: MarketplaceCreatorSummary[] = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const currentPage = page + 1;
  const pageCount = totalPages > 0 ? totalPages : 1;

  const emptyState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">No creators found</h2>
        <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
          Try a different keyword or broaden your filters.
        </p>
        <Link
          href="/marketplace/creators"
          className="mt-8 inline-flex rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Browse creators
        </Link>
      </div>
    ),
    []
  );

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushParams({ q: localQ.trim() || undefined, page: '0' });
  };

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Content creators</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          Discover world-class creators, explore their portfolios, and contact them for custom work.
        </p>
      </div>

      <form
        onSubmit={onSearchSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:flex-row lg:items-center"
      >
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="cq"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Search by name, specialty, or keywords…"
            className="w-full rounded-xl border-0 bg-transparent py-2.5 pr-3 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <div className="hidden h-8 w-px shrink-0 bg-gray-200 lg:block dark:bg-neutral-700" aria-hidden />

        <div className="flex flex-wrap items-center gap-4 lg:gap-5">
          <div className="min-w-[140px]">
            <label htmlFor="cgenre" className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Niche
            </label>
            <select
              id="cgenre"
              value={genre}
              onChange={(e) => pushParams({ genre: e.target.value || undefined, page: '0' })}
              className="mt-1 w-full cursor-pointer rounded-lg border-0 bg-transparent py-1 text-sm font-medium text-gray-900 focus:outline-none focus:ring-0 dark:text-white"
            >
              {GENRES.map((g) => (
                <option key={g || 'all'} value={g}>
                  {g || 'All categories'}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden h-8 w-px shrink-0 bg-gray-200 lg:block dark:bg-neutral-700" aria-hidden />

          <FilterToggle
            checked={verifiedOnly}
            onChange={(next) => pushParams({ verified: next ? '1' : undefined, page: '0' })}
            label="Verified only"
          />

          <FilterToggle
            checked={availableOnly}
            onChange={(next) => pushParams({ available: next ? '1' : undefined, page: '0' })}
            label="Available only"
          />

          <button
            type="submit"
            className="w-full shrink-0 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 lg:w-auto"
          >
            Search
          </button>
        </div>
      </form>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : creators.length === 0 ? (
        emptyState
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((c) => (
              <CreatorCard
                key={c.id ?? c.userId ?? c.fullName}
                id={c.id}
                userId={c.userId}
                fullName={c.fullName}
                avatarUrl={c.avatarUrl}
                specialite={c.specialite}
                isVerified={c.isVerified}
                isAvailable={c.isAvailable}
                portfolioCount={c.portfolioCount}
                productCount={c.productCount}
                averageRating={c.averageRating}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {pageCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => pushParams({ page: String(page - 1) })}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:text-white"
              >
                Previous
              </button>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
                {currentPage}
              </span>
              <button
                type="button"
                disabled={totalPages > 0 && page >= totalPages - 1}
                onClick={() => pushParams({ page: String(page + 1) })}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-300 dark:hover:bg-neutral-800"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export function CreatorsCatalog() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center px-4 py-20">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <CreatorsCatalogContent />
    </Suspense>
  );
}
