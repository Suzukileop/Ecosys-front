'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { marketplaceRailProductGridClassName } from '@/components/marketplace/ProductCard';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';
import { useT } from '@/lib/i18n/I18nProvider';

/*
 * The catalogue pages' shared kit (Products, My products): the per-viewer view / rail choices, the
 * view switch, the sort menu, the rail fold glyph and the small icons — so both pages stay one
 * design.
 */

/*
 * Two per-viewer preferences, remembered in browser storage (conveniences — they may be lost):
 * the catalogue's view and whether the right rail is folded.
 */
export function useStoredChoice<T extends string>(key: string, parse: (raw: string | null) => T, fallback: T) {
  const event = `skraft:${key}`;
  const subscribe = useCallback(
    (onChange: () => void) => {
      window.addEventListener(event, onChange);
      window.addEventListener('storage', onChange);
      return () => {
        window.removeEventListener(event, onChange);
        window.removeEventListener('storage', onChange);
      };
    },
    [event],
  );
  const read = useCallback(() => {
    try {
      return parse(window.localStorage.getItem(key));
    } catch {
      return fallback;
    }
  }, [key, parse, fallback]);
  const stored = useSyncExternalStore(subscribe, read, () => fallback);
  /* Storage blocked (private window): the last pick still applies for this visit. */
  const [picked, setPicked] = useState<T | null>(null);
  const set = (next: T) => {
    setPicked(next);
    try {
      window.localStorage.setItem(key, next);
    } catch {
      /* the in-memory pick above covers it */
    }
    window.dispatchEvent(new Event(event));
  };
  return [picked ?? stored, set] as const;
}

/*
 * The catalogue's three views:
 * - compact (default): small cards — three to a row beside the rail (two below 1400px, where three
 *   would squeeze them), four once the rail is folded;
 * - large: bigger cards for pictures that sell — two to a row beside the rail, three when folded;
 * - list: one product per row with what a card hides (description, rating, sold, stock, discount).
 */
export type CatalogView = 'compact' | 'large' | 'list';

export const parseView = (raw: string | null): CatalogView => (raw === 'large' || raw === 'list' ? raw : 'compact');
export const parseFolded = (raw: string | null): 'folded' | 'open' => (raw === 'folded' ? 'folded' : 'open');

/*
 * Folding the rail re-lays the whole frame at once (the rail swapped for its strip, one more card per
 * row). Run as a view transition it reads as one movement: the rail slides out on its side (in, when
 * unfolding), the cards on screen glide to their new place, the rest crossfades — styles under
 * `.rail-folding` in globals.css. The page marks the rail column `data-rail-fold="rail"` and each
 * card grid `data-rail-fold="cards"`. Without the API, or with reduced motion, it switches at once.
 */
type FoldTransition = { ready: Promise<void>; finished: Promise<void> };
const FOLDING_CLASS = 'rail-folding';
let foldRun = 0;

function runRailFold(update: () => void) {
  const doc = document as Document & { startViewTransition?: (callback: () => void) => FoldTransition };
  if (typeof doc.startViewTransition !== 'function' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update();
    return;
  }
  const run = ++foldRun;
  const root = document.documentElement;
  /* Only the cards near the screen get their own glide (a long catalogue would mean hundreds of
     snapshots); the others go with the crossfade. React keeps each card's node, so the name holds
     in the new layout too. */
  document.querySelectorAll<HTMLElement>('[data-rail-fold-card]').forEach(clearCardName);
  const reach = window.innerHeight;
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-rail-fold="cards"] > *')).filter((card) => {
    const rect = card.getBoundingClientRect();
    return rect.bottom > -reach / 2 && rect.top < reach * 2;
  });
  cards.forEach((card, index) => {
    card.setAttribute('data-rail-fold-card', '');
    card.style.setProperty('view-transition-name', `rail-card-${index}`);
    card.style.setProperty('view-transition-class', 'rail-card');
  });
  root.classList.add(FOLDING_CLASS);
  const transition = doc.startViewTransition(() => flushSync(update));
  /* A skipped transition (a second click mid-way) still applies its update; nothing to report. */
  transition.ready.catch(() => undefined);
  transition.finished
    .catch(() => undefined)
    .finally(() => {
      /* A newer fold (a quick second click) owns the names and the class now. */
      if (run !== foldRun) return;
      root.classList.remove(FOLDING_CLASS);
      cards.forEach(clearCardName);
    });
}

function clearCardName(card: HTMLElement) {
  card.removeAttribute('data-rail-fold-card');
  card.style.removeProperty('view-transition-name');
  card.style.removeProperty('view-transition-class');
}

/** The rail's folded / open choice (remembered per viewer), changed through the fold animation. */
export function useRailFold(key: string) {
  const [rail, setRailNow] = useStoredChoice(key, parseFolded, 'open');
  const setRail = (next: 'folded' | 'open') => {
    if (next === rail) return;
    runRailFold(() => setRailNow(next));
  };
  return [rail, setRail] as const;
}

export const VIEW_GRID_CLASS: Record<'open' | 'folded', Record<Exclude<CatalogView, 'list'>, string>> = {
  open: {
    compact: marketplaceRailProductGridClassName,
    large: 'grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-5',
  },
  /* The rail folded to its 44px strip: the grid gets ~1170px. */
  folded: {
    compact: 'grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4',
    large: 'grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3',
  },
};

/* "Large" only differs from "compact" from these widths; below, its button is hidden and the grid
   button shows as the pick. */
const LARGE_BUTTON_CLASS = { open: 'hidden min-[1400px]:inline-flex', folded: 'hidden xl:inline-flex' };
const LARGE_AS_COMPACT_CLASS = {
  open: 'max-[1399px]:bg-[color:var(--gn-surface)] max-[1399px]:text-[color:var(--gn-ink)]',
  folded: 'max-[1279px]:bg-[color:var(--gn-surface)] max-[1279px]:text-[color:var(--gn-ink)]',
};

const VIEW_OPTIONS: { id: CatalogView; label: { open: string; folded: string }; glyph: React.ReactNode }[] = [
  {
    id: 'compact',
    label: { open: 'Grid, three per row', folded: 'Grid, four per row' },
    glyph: (
      <>
        <rect x="3.5" y="5" width="4.5" height="5.5" rx="0.8" />
        <rect x="9.75" y="5" width="4.5" height="5.5" rx="0.8" />
        <rect x="16" y="5" width="4.5" height="5.5" rx="0.8" />
        <rect x="3.5" y="13.5" width="4.5" height="5.5" rx="0.8" />
        <rect x="9.75" y="13.5" width="4.5" height="5.5" rx="0.8" />
        <rect x="16" y="13.5" width="4.5" height="5.5" rx="0.8" />
      </>
    ),
  },
  {
    id: 'large',
    label: { open: 'Grid, two per row', folded: 'Grid, three per row' },
    glyph: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1" />
        <rect x="13" y="4" width="7" height="7" rx="1" />
        <rect x="4" y="13" width="7" height="7" rx="1" />
        <rect x="13" y="13" width="7" height="7" rx="1" />
      </>
    ),
  },
  {
    id: 'list',
    label: { open: 'List', folded: 'List' },
    glyph: (
      <>
        <rect x="3.5" y="5" width="5" height="5" rx="0.8" />
        <rect x="3.5" y="14" width="5" height="5" rx="0.8" />
        <path d="M11.5 6.5h9M11.5 9h5.5M11.5 15.5h9M11.5 18h5.5" />
      </>
    ),
  },
];

/** Three icon toggles at the end of the section line: the active one on the card tone, in ink. */
export function ViewSwitch({
  value,
  rail,
  onChange,
}: {
  value: CatalogView;
  rail: 'open' | 'folded';
  onChange: (next: CatalogView) => void;
}) {
  const t = useT();
  return (
    <div role="radiogroup" aria-label={t('Display')} className="flex shrink-0 items-center gap-0.5">
      {VIEW_OPTIONS.map((option) => {
        const active = value === option.id;
        const largeAsCompact = option.id === 'compact' && value === 'large';
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label[rail]}
            title={option.label[rail]}
            onClick={() => onChange(option.id)}
            className={`${option.id === 'large' ? LARGE_BUTTON_CLASS[rail] : 'inline-flex'} h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
              active
                ? 'bg-[color:var(--gn-surface)] text-[color:var(--gn-ink)]'
                : 'text-[color:var(--gn-ink2)] hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)]'
            } ${largeAsCompact ? LARGE_AS_COMPACT_CLASS[rail] : ''}`}
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {option.glyph}
            </svg>
          </button>
        );
      })}
    </div>
  );
}

/** A panel with its right side marked: the rail, folded (arrow in) or open (arrow out). */
export function RailToggleGlyph({ folded }: { folded: boolean }) {
  return (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M15 4.5v15" />
      {folded ? <path d="m10 9.5-2.5 2.5 2.5 2.5" /> : <path d="m7.5 9.5 2.5 2.5-2.5 2.5" />}
    </>
  );
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m2.2-4.8a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export function SlidersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" aria-hidden>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  );
}

export function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/** News's Saved bookmark, on the rail's 24-unit grid. */
export const BOOKMARK_GLYPH = <path d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-6.5-4.5L5.5 20V5.5a1 1 0 0 1 1-1z" />;

/** Four tiles: the whole catalogue (the way back from favorites). */
export const GRID_GLYPH = (
  <>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
  </>
);

const MENU_ITEM_CLASS =
  'flex w-full min-w-0 items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[14px] leading-5 text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover)] focus-visible:outline-none focus-visible:bg-[color:var(--gn-hover)]';

/** "Sort by: Popularity ▾" at the right of the section line — Providers' quiet text control. */
export function SortMenu<T extends string>({
  value,
  options,
  onChange,
  menuLabel = 'Sort',
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  menuLabel?: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const current = t(options.find((option) => option.value === value)?.label ?? options[0]?.label ?? '');

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((next) => !next)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('Sort by: {current}', { current })}
        className="inline-flex h-8 items-center gap-1.5 rounded-full text-[13px] leading-5 text-[color:var(--gn-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
      >
        <span className="hidden text-[color:var(--gn-ink2)] sm:inline">{t('Sort by')}</span>
        <span className="font-semibold">{current}</span>
        <ChevronIcon className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={menuLabel}
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl bg-[#FEFEFE] p-1.5 shadow-[0_0_0_1px_#E1E8ED,0_8px_20px_-14px_rgba(15,20,25,0.18)] dark:bg-[#000000] dark:shadow-[0_0_0_1px_#2F3336]"
          style={STUDIO_FLOAT_IN_STYLE}
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`${MENU_ITEM_CLASS} ${active ? 'font-semibold' : ''}`}
                >
                  <span className="truncate">{t(option.label)}</span>
                  {active ? <CheckIcon className="h-4 w-4 shrink-0" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export const railRoundButtonClass =
  'relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[color:var(--gn-ink)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';
