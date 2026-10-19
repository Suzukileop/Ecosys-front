'use client';

import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { GlobalSearchModal } from '@/components/layout/GlobalSearchModal';
import { useT } from '@/lib/i18n/I18nProvider';

/**
 * Window event that opens the search overlay from anywhere (the empty /search page uses it), so a page
 * can offer "Search" without owning the overlay's state.
 */
export const OPEN_GLOBAL_SEARCH_EVENT = 'skraft:open-search';

const subscribeNoop = () => () => {};

/** "⌘K" on Apple platforms, "Ctrl K" elsewhere; nothing on the server render. */
function useShortcutLabel(): string | null {
  const t = useT();
  return useSyncExternalStore(
    subscribeNoop,
    () => (/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent) ? '⌘K' : t('Ctrl K')),
    () => null
  );
}

/**
 * Magnifier drawn to the same construction as the bar's chat and bell: one 24-unit box,
 * `stroke-width: 1.5`, round caps. The three sit side by side, so any difference in weight
 * between them reads as one of them being broken.
 */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="10.75" cy="10.75" r="6.75" />
      <path d="m15.6 15.6 4.4 4.4" />
    </svg>
  );
}

function HeaderSearchButton({
  label,
  hasQuery,
  onClick,
  compact = false,
  iconOnly = false,
  fluid = false,
}: {
  label: string;
  hasQuery: boolean;
  onClick: () => void;
  compact?: boolean;
  iconOnly?: boolean;
  fluid?: boolean;
}) {
  const t = useT();
  const shortcut = useShortcutLabel();
  /*
   * `iconOnly` is the bar's form: a bare 36px disc with no plate at rest, so search sits in the
   * right-hand cluster as one control among equals instead of a wide filled pill that outweighs
   * the three buttons beside it. The dot marks a live query, which is the only state the pill's
   * text was carrying.
   */
  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={hasQuery ? t('Search: {label}', { label }) : t('Open search')}
        title={hasQuery ? label : t('Search')}
        /* 40px target; the live-query dot is ink, like every other mark in the bar (no accent hue). */
        className="group/search relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#0F1419] transition-colors duration-150 hover:bg-[#EFF3F4] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F1419]/35 dark:text-[#E7E9EA] dark:hover:bg-[#2A2D32] dark:focus-visible:ring-[#E7E9EA]/45"
      >
        <SearchIcon className="h-[1.3rem] w-[1.3rem]" />
        {hasQuery ? (
          <span
            aria-hidden
            className="absolute right-2 top-2 block h-1.5 w-1.5 rounded-full bg-[#0F1419] dark:bg-[#E7E9EA]"
          />
        ) : null}
      </button>
    );
  }

  return (
    <div className={`relative min-w-0 ${fluid ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={onClick}
        /*
         * The News search pill, as a button that opens the overlay: rounded-full on the card tone
         * (#F7F9F9 / #16181C — the same pill as the News and Providers rails), the fill tone one step
         * darker under the pointer, and focused from the keyboard a 2px ink ring inside the edge. The
         * old field was a `rounded-lg` slab, the only square-cornered search on a site of pills.
         *
         * `fluid` is the bar's form: it fills its wrapper (the row on phones, a bounded 256 / 384px
         * slot pushed right from lg). Phones get the full 40px height as a touch target.
         */
        className={`flex h-10 items-center gap-2 rounded-full py-0 pl-10 pr-3 text-left text-[15px] transition-[background-color,box-shadow] duration-150 bg-[#F7F9F9] hover:bg-[#EFF3F4] focus:outline-hidden focus-visible:bg-white focus-visible:shadow-[inset_0_0_0_2px_#0F1419] dark:bg-[#16181C] dark:hover:bg-[#2A2D32] dark:focus-visible:bg-black dark:focus-visible:shadow-[inset_0_0_0_2px_#E7E9EA] ${
          fluid
            ? 'w-full'
            : compact
              ? 'w-10 justify-center p-0 sm:w-36 sm:justify-start sm:pl-9 sm:pr-4'
              : 'w-36 sm:w-48 md:w-56 lg:w-64'
        }`}
        aria-label={hasQuery ? t('Search: {label}', { label }) : t('Open search')}
        aria-haspopup="dialog"
      >
        <SearchIcon
          className={`pointer-events-none absolute top-1/2 h-[1.1rem] w-[1.1rem] -translate-y-1/2 ${
            hasQuery ? 'text-[#0F1419] dark:text-[#E7E9EA]' : 'text-[#536471] dark:text-[#8B98A5]'
          } ${fluid ? 'left-4' : 'left-3'}`}
        />
        {/*
         * Resting, the label is the secondary ink of a placeholder (#536471 / #8B98A5 — both pass AA on
         * the pill); with a live query (on /search) it is the query itself, in ink.
         */}
        <span
          className={`min-w-0 flex-1 truncate ${
            compact && !fluid ? 'hidden sm:inline' : ''
          } ${hasQuery ? 'font-medium text-[#0F1419] dark:text-[#E7E9EA]' : 'text-[#536471] dark:text-[#8B98A5]'}`}
        >
          {label}
        </span>
        {/* The shortcut, named where there is a keyboard and room for it (from lg). */}
        {shortcut && fluid ? (
          <kbd
            aria-hidden
            className="hidden shrink-0 rounded-md bg-white px-1.5 py-0.5 font-sans text-[11px] font-semibold leading-4 text-[#536471] dark:bg-black dark:text-[#8B98A5] lg:inline"
          >
            {shortcut}
          </kbd>
        ) : null}
      </button>
    </div>
  );
}

function SidebarSearchButton({
  label,
  hasQuery,
  onClick,
  collapsed,
}: {
  label: string;
  hasQuery: boolean;
  onClick: () => void;
  collapsed: boolean;
}) {
  const t = useT();
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={t('Search')}
        aria-label={hasQuery ? t('Search: {label}', { label }) : t('Open search')}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        <SearchIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={hasQuery ? t('Search: {label}', { label }) : t('Open search')}
      /* A rule, not a box. The old filled slab was the heaviest object in the rail and it sat
         directly above a nav that has just lost every one of its rectangles. */
      className="group/search relative flex w-full items-center gap-2.5 border-b border-neutral-200/80 pb-2.5 text-left text-sm transition-colors duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-neutral-400 focus:outline-hidden focus-visible:border-neutral-900 dark:border-white/10 dark:hover:border-white/30 dark:focus-visible:border-white"
    >
      <SearchIcon className="h-[0.9rem] w-[0.9rem] shrink-0 text-[#222222] transition-colors duration-[520ms] dark:text-neutral-200" />
      <span
        className={`min-w-0 flex-1 truncate text-[0.72rem] uppercase tracking-[0.14em] ${
          hasQuery
            ? 'font-medium text-neutral-900 dark:text-white'
            : 'font-light text-[#222222] dark:text-neutral-200'
        }`}
      >
        {label}
      </span>
      <kbd className="shrink-0 font-mono text-[0.6rem] font-light tracking-[0.1em] text-[#222222] dark:text-neutral-300">
        {t('⌘K')}
      </kbd>
      {/* Focus/hover accent drawn from the left, matching the nav's sliding marker. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-px left-0 block h-px w-full origin-left scale-x-0 bg-neutral-900 transition-transform duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/search:scale-x-100 group-focus-visible/search:scale-x-100 dark:bg-white"
      />
    </button>
  );
}

function useGlobalSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if (isEditable) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpen();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onOpen]);
}

function DashboardHeaderSearchContent({
  compact = false,
  variant = 'header',
  collapsed = false,
  iconOnly = false,
  fluid = false,
}: {
  compact?: boolean;
  variant?: 'header' | 'sidebar';
  collapsed?: boolean;
  iconOnly?: boolean;
  fluid?: boolean;
}) {
  const t = useT();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  /* Where focus was when the overlay opened (the field, usually) — it goes back there on close. */
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const currentQuery = pathname.startsWith('/search')
    ? (searchParams.get('q') ?? '').trim()
    : '';
  const hasQuery = currentQuery.length > 0;
  const displayText = hasQuery ? currentQuery : t('Search Skraft');

  const openSearch = useCallback(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen(true);
  }, []);
  const closeSearch = useCallback(() => {
    setOpen(false);
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target?.isConnected) window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
  }, []);

  useGlobalSearchShortcut(openSearch);

  useEffect(() => {
    window.addEventListener(OPEN_GLOBAL_SEARCH_EVENT, openSearch);
    return () => window.removeEventListener(OPEN_GLOBAL_SEARCH_EVENT, openSearch);
  }, [openSearch]);

  return (
    <>
      {variant === 'sidebar' ? (
        <SidebarSearchButton
          label={displayText}
          hasQuery={hasQuery}
          onClick={openSearch}
          collapsed={collapsed}
        />
      ) : (
        <HeaderSearchButton
          label={displayText}
          hasQuery={hasQuery}
          onClick={openSearch}
          compact={compact}
          iconOnly={iconOnly}
          fluid={fluid}
        />
      )}
      {/* On /search the overlay opens on the current query, selected, so it can be refined or
          replaced in one gesture. */}
      <GlobalSearchModal open={open} onClose={closeSearch} initialQuery={currentQuery} />
    </>
  );
}

export function DashboardHeaderSearch({
  compact = false,
  variant = 'header',
  collapsed = false,
  iconOnly = false,
  fluid = false,
}: {
  compact?: boolean;
  variant?: 'header' | 'sidebar';
  collapsed?: boolean;
  iconOnly?: boolean;
  fluid?: boolean;
}) {
  const t = useT();
  const fallback =
    variant === 'sidebar' ? (
      <SidebarSearchButton label={t('Search Skraft')} hasQuery={false} onClick={() => {}} collapsed={collapsed} />
    ) : (
      <HeaderSearchButton label={t('Search Skraft')} hasQuery={false} onClick={() => {}} compact={compact} iconOnly={iconOnly} fluid={fluid} />
    );

  return (
    <Suspense fallback={fallback}>
      <DashboardHeaderSearchContent compact={compact} variant={variant} collapsed={collapsed} iconOnly={iconOnly} fluid={fluid} />
    </Suspense>
  );
}
