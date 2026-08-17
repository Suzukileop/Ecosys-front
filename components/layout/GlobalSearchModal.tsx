'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  GlobalSearchResultRow,
  getGlobalSearchItemHref,
} from '@/components/search/GlobalSearchResultRow';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import {
  buildGlobalSearchPageUrl,
  fetchGlobalSearch,
  flattenGlobalSearchResults,
  GLOBAL_SEARCH_CATEGORY_LABELS,
  GLOBAL_SEARCH_MIN_LENGTH,
  GLOBAL_SEARCH_MODAL_PREVIEW_SIZE,
  type GlobalSearchCategory,
  type GlobalSearchItem,
  type GlobalSearchResults,
} from '@/lib/global-search';

type GlobalSearchModalProps = {
  open: boolean;
  onClose: () => void;
};

const EMPTY_RESULTS: GlobalSearchResults = {
  users: [],
  creators: [],
  serviceProviders: [],
  products: [],
  content: [],
};

const CATEGORY_ORDER: GlobalSearchCategory[] = [
  'creators',
  'products',
  'content',
];

const MODAL_SCROLLBAR =
  '[scrollbar-width:thin] [scrollbar-color:#a3a3a3_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-400 dark:[scrollbar-color:#525252_transparent] [&::-webkit-scrollbar-thumb]:dark:bg-neutral-600';

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ClearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function GlobalSearchModal({ open, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const flatItems = useMemo(() => flattenGlobalSearchResults(results), [results]);
  const trimmedQuery = query.trim();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setResults(EMPTY_RESULTS);
    setSelectedIndex(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open || !mounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, mounted, onClose]);

  useEffect(() => {
    if (!open) return;
    if (trimmedQuery.length < GLOBAL_SEARCH_MIN_LENGTH) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      setSelectedIndex(0);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      void (async () => {
        try {
          const data = await fetchGlobalSearch(trimmedQuery, Boolean(user), {
            limit: GLOBAL_SEARCH_MODAL_PREVIEW_SIZE,
            categories: ['creators', 'products', 'content'],
          });
          if (!cancelled) {
            setResults(data);
            setSelectedIndex(0);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, trimmedQuery, user]);

  const goToSearchPage = useCallback(
    (tab: 'all' | GlobalSearchCategory = 'all') => {
      if (trimmedQuery.length < GLOBAL_SEARCH_MIN_LENGTH) return;
      onClose();
      router.push(buildGlobalSearchPageUrl(trimmedQuery, tab));
    },
    [onClose, router, trimmedQuery]
  );

  const activateItem = useCallback(
    async (item: GlobalSearchItem) => {
      onClose();
      router.push(getGlobalSearchItemHref(item));
    },
    [onClose, router]
  );

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (flatItems.length === 0) return;
      setSelectedIndex((index) => (index + 1) % flatItems.length);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (flatItems.length === 0) return;
      setSelectedIndex((index) => (index - 1 + flatItems.length) % flatItems.length);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      goToSearchPage('all');
    }
  };

  let runningIndex = -1;

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[220] flex items-start justify-center overflow-y-auto overscroll-contain p-4 pt-[12vh] sm:pt-[14vh]">
      <button
        type="button"
        className="absolute inset-0 h-[100dvh] w-full bg-neutral-950/60 backdrop-blur-sm"
        aria-label="Close search"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
      >
        <form
          className="flex items-center gap-2 border-b border-neutral-200 px-4 dark:border-neutral-800"
          onSubmit={(event) => {
            event.preventDefault();
            goToSearchPage('all');
          }}
        >
          <SearchIcon className="h-5 w-5 shrink-0 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search profiles, service providers, products, content…"
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white"
            autoComplete="off"
            spellCheck={false}
          />
          {query.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              aria-label="Clear search"
            >
              <ClearIcon className="h-4 w-4" />
            </button>
          ) : null}
          <span className="hidden shrink-0 text-[10px] font-medium uppercase tracking-wide text-neutral-400 sm:inline">
            esc
          </span>
        </form>

        <div className={`max-h-[min(50vh,400px)] overflow-y-auto p-2 ${MODAL_SCROLLBAR}`}>
          {trimmedQuery.length < GLOBAL_SEARCH_MIN_LENGTH ? null : loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="sm" />
            </div>
          ) : flatItems.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No results for &ldquo;{trimmedQuery}&rdquo;
            </p>
          ) : (
            <>
              {CATEGORY_ORDER.map((category) => {
                const items = results[category];
                if (items.length === 0) return null;

                return (
                  <section key={category} className="mb-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        {GLOBAL_SEARCH_CATEGORY_LABELS[category]}
                      </h3>
                      <button
                        type="button"
                        onClick={() => goToSearchPage(category)}
                        className="text-[11px] font-medium text-neutral-500 transition hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                      >
                        See all
                      </button>
                    </div>
                    <ul className="space-y-0.5">
                      {items.map((item) => {
                        runningIndex += 1;
                        const itemIndex = runningIndex;
                        return (
                          <li key={`${item.category}-${item.id}`}>
                            <GlobalSearchResultRow
                              item={item}
                              selected={itemIndex === selectedIndex}
                              compact
                              onMouseEnter={() => setSelectedIndex(itemIndex)}
                              onClick={() => void activateItem(item)}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}

              <div className="border-t border-neutral-100 px-3 py-2 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => goToSearchPage('all')}
                  className="w-full rounded-xl py-2.5 text-center text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900"
                >
                  See all results for &ldquo;{trimmedQuery}&rdquo;
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
