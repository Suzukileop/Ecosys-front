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

/**
 * The Spotlight, as an **exploration panel**: one wide card anchored at the top of the viewport,
 * the field lifted out of it in white, and below it two columns — a tab strip of product areas on
 * the left, the list they drive on the right, with a figure at the far end of every row.
 *
 * Below `lg` the two columns stack and the tab strip becomes a horizontal pill rail, because five
 * stacked tabs plus a list is a scroll before anything has been read.
 *
 * Chromatically it is the app's own system: `#111111` ink, one warm off-grey surface, and
 * neutral grays for chrome — accent color only on things that are actually active.
 */

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

const CATEGORY_ORDER: GlobalSearchCategory[] = ['creators', 'products', 'content'];

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Entrance for a row, staggered down the panel. Keyframes live in `globals.css`. */
function rowIn(index: number) {
  return {
    animation: `gsm-row-in 0.46s ${EASE} both`,
    animationDelay: `${40 + index * 35}ms`,
  };
}

/**
 * The panel's content, as **scopes and terms**, not as a left rail and a right ledger.
 *
 * The rail-plus-list arrangement was the reference's, and read as it: a list of labels down the
 * left whose only job was to swap a list on the right, and a column of figures at the far edge
 * that nobody was going to compare. It is now one object — a row of scope pills under the field
 * and, below it, the terms of the selected scope as a wrapped field of chips. Scanning a wrapped
 * field is one pass over a shape; scanning a ruled list is one pass per row.
 *
 * Every chip is a real search term: clicking it fills the field and the existing debounce runs
 * the search, so the panel stays open and fills with real results.
 */
type PanelSection = { key: string; label: string; terms: string[] };

const PANEL_SECTIONS: PanelSection[] = [
  {
    key: 'portfolios',
    label: 'Portfolios',
    terms: [
      'product designer',
      'art direction',
      'illustration',
      'web development',
      'photography',
      'motion design',
      'brand identity',
    ],
  },
  {
    key: 'storefronts',
    label: 'Storefronts',
    terms: ['digital product', 'template', 'preset', 'course', 'ebook', 'ui kit'],
  },
  {
    key: 'providers',
    label: 'Providers',
    terms: ['studio', 'designer', 'developer', 'copywriter', 'photographer', 'agency'],
  },
];

function SearchIcon({ className, tone }: { className?: string; tone?: string }) {
  return (
    <svg
      className={className}
      style={tone ? { color: tone } : undefined}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ClearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/** Small tracked caps that title a result group. The only uppercase in the panel. */
function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-[0.6rem] font-medium uppercase tracking-[0.28em] text-[#9A9A9A] dark:text-neutral-600">
      {children}
    </span>
  );
}

/**
 * Both chips, scope and term, are the same box at two weights.
 *
 * `rounded-xl` is **the field's own radius**, not a pill: the field is the largest box in the
 * panel and every box under it resolves its corners the same way. A pill beside a 12px field
 * reads as two components that came from different places.
 *
 * **The hover is one flat surface swap and nothing else** — no travel, no colour ramp, no rule
 * drawing itself in, and `transition-none` so it lands the instant the pointer does. Three
 * animated properties per row across thirty rows is a panel that shimmers while you read it, and
 * the only question a hover has to answer here is *which one is under the pointer*.
 */
const CHIP_BASE =
  'inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-[0.9rem] transition-none';

const CHIP_IDLE =
  'text-[#6B6B6B] hover:bg-white hover:text-[#111111] dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-white';

/** The selected scope: a filled pill, the dashboard's own active-tab idiom. */
const CHIP_ACTIVE =
  'bg-[#222222] text-white dark:bg-white dark:text-[#111111]';

export function GlobalSearchModal({ open, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  /* Which left-hand tab is showing. Deliberately not reset on open: reopening a launcher on the
     list you were last reading is what every launcher does. */
  const [sectionKey, setSectionKey] = useState(PANEL_SECTIONS[0].key);
  const inputRef = useRef<HTMLInputElement>(null);

  const flatItems = useMemo(() => flattenGlobalSearchResults(results), [results]);
  const trimmedQuery = query.trim();
  const searching = trimmedQuery.length >= GLOBAL_SEARCH_MIN_LENGTH;

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

  /* The left column swaps role once there is a query: product areas are no use mid-search, where
     the same space is exactly what a set of scopes needs — with real counts on them. */
  const scopes: { key: 'all' | GlobalSearchCategory; label: string; count: number }[] = [
    { key: 'all', label: 'Everything', count: flatItems.length },
    ...CATEGORY_ORDER.map((category) => ({
      key: category,
      label: GLOBAL_SEARCH_CATEGORY_LABELS[category],
      count: results[category].length,
    })),
  ];

  const section = PANEL_SECTIONS.find((entry) => entry.key === sectionKey) ?? PANEL_SECTIONS[0];

  return createPortal(
    <div className="fixed inset-0 z-[220] overflow-y-auto overscroll-contain p-3 sm:p-4">
      {/*
       * The scrim is a plain darkening — no `backdrop-filter` at all. The panel below is opaque,
       * so the blur was never separating anything; it only smeared the page and cost a
       * full-viewport compositor filter on every open. A flat tint reads as the page stepping
       * back, which is all it has to say.
       */}
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        style={{ animation: `gsm-veil-in 0.36s ${EASE} both` }}
        className="fixed inset-0 h-[100dvh] w-full bg-black/40 dark:bg-black/60"
      />

      {/*
       * The panel. Anchored at the top, a touch narrower than the page plate so it reads as an
       * overlay rather than a second page. Light is a warm off-grey with the
       * field lifted out of it in white — the field has to read as the one thing you can type
       * into, and on a flat panel only a tone change says that.
       */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        style={{ animation: `gsm-row-in 0.42s ${EASE} both` }}
        className="relative z-10 mx-auto w-full max-w-[72rem] overflow-hidden rounded-2xl border border-[rgba(34,34,34,0.05)] bg-[#EFEEEC] p-3 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.45)] dark:border-white/[0.06] dark:bg-[#121212] sm:p-4"
      >
        <form
          className="flex items-center gap-3 rounded-xl bg-white px-4 dark:bg-white/[0.06]"
          onSubmit={(event) => {
            event.preventDefault();
            goToSearchPage('all');
          }}
        >
          <SearchIcon className="h-[1.05rem] w-[1.05rem] shrink-0 text-[#9A9A9A] dark:text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search anything…"
            className="h-12 min-w-0 flex-1 bg-transparent text-[0.95rem] text-[#111111] outline-none placeholder:text-[#9A9A9A] dark:text-white dark:placeholder:text-neutral-500"
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
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#6B6B6B] transition-colors duration-[320ms] hover:text-[#111111] dark:text-neutral-500 dark:hover:text-white"
              aria-label="Clear search"
            >
              <ClearIcon className="h-4 w-4" />
            </button>
          ) : null}
          <span className="hidden shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#9A9A9A] dark:text-neutral-600 sm:inline">
            esc
          </span>
        </form>

        {/*
          * One line of address under the field. The panel opens on an empty field and a field of
          * nouns; without a question the chips read as the results of a search nobody ran. It
          * steps aside the moment there is a query — at that point the results are the answer.
          */}
        {!searching ? (
          <p
            style={rowIn(0)}
            className="mt-5 px-1 text-[0.95rem] text-[#6B6B6B] dark:text-neutral-400"
          >
            What are you looking for?
          </p>
        ) : null}

        {/*
         * Scopes as a single horizontal row rather than a column down the left. It puts the
         * switch directly under the field where the pointer already is, it costs one line instead
         * of a 15rem column, and it is the same pill strip the settings panels use — so the panel
         * belongs to this app rather than to the site it was drawn from.
         */}
        <div
          role="tablist"
          aria-label="Search scopes"
          className="pf-scrollbar-hide mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1"
        >
          {searching
            ? scopes.map((scope, index) => (
                <button
                  key={scope.key}
                  type="button"
                  role="tab"
                  onClick={() => goToSearchPage(scope.key)}
                  style={rowIn(index)}
                  className={`${CHIP_BASE} ${
                    scope.count > 0 ? CHIP_IDLE : 'text-[#C4C4C4] dark:text-neutral-700'
                  }`}
                >
                  {scope.label}
                  <span className="tabular-nums text-[0.78rem] opacity-60">{scope.count}</span>
                </button>
              ))
            : PANEL_SECTIONS.map((entry, index) => {
                const active = entry.key === section.key;
                return (
                  <button
                    key={entry.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSectionKey(entry.key)}
                    style={rowIn(index)}
                    className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
                  >
                    {entry.label}
                  </button>
                );
              })}
        </div>

        {/* A floor, not a reserved block: enough that switching scope or starting to type does not
            make the panel jump, small enough that the resting state is not mostly empty. */}
        <div className="mt-3 min-h-[3.5rem] px-1">
          {!searching ? (
            /* A wrapped field of terms, not a ruled list: no row rules, no right-hand column of
               figures, and the set reads as one block the eye takes in at once. */
            <div className="flex flex-wrap gap-1.5">
              {section.terms.map((term, index) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                    inputRef.current?.focus();
                  }}
                  style={rowIn(index + 1)}
                  className={`${CHIP_BASE} ${CHIP_IDLE}`}
                >
                  {term}
                </button>
              ))}
            </div>
          ) : loading ? (
            <div className="flex justify-center py-14">
              <LoadingSpinner size="sm" />
            </div>
          ) : flatItems.length === 0 ? (
            <p className="py-14 text-[0.9rem] text-[#6B6B6B] dark:text-neutral-500">
              No results for &ldquo;{trimmedQuery}&rdquo;
            </p>
          ) : (
            <>
              {CATEGORY_ORDER.map((category) => {
                const items = results[category];
                if (items.length === 0) return null;

                return (
                  <section key={category} className="mb-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <ColumnLabel>{GLOBAL_SEARCH_CATEGORY_LABELS[category]}</ColumnLabel>
                      <button
                        type="button"
                        onClick={() => goToSearchPage(category)}
                        className="mb-2 shrink-0 text-[0.75rem] text-[#6B6B6B] transition-none hover:text-[#111111] dark:text-neutral-500 dark:hover:text-white"
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

              <button
                type="button"
                onClick={() => goToSearchPage('all')}
                className="self-start py-2 text-[0.9rem] text-[#6B6B6B] transition-none hover:text-[#111111] dark:text-neutral-500 dark:hover:text-white"
              >
                See all results for &ldquo;{trimmedQuery}&rdquo;
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
