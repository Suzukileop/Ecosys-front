'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ACCENT_ORANGE } from '@/components/landing/landingBrand';
import { GlobalSearchModal } from '@/components/layout/GlobalSearchModal';

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
}: {
  label: string;
  hasQuery: boolean;
  onClick: () => void;
  compact?: boolean;
  iconOnly?: boolean;
}) {
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
        aria-label={hasQuery ? `Search: ${label}` : 'Open search'}
        title={hasQuery ? label : 'Search'}
        className="group/search relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-700 hover:text-neutral-950 dark:text-neutral-200 dark:hover:text-white transition-[color,transform] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
      >
        <SearchIcon className="h-[1.3rem] w-[1.3rem]" />
        {hasQuery ? (
          <span
            aria-hidden
            style={{ backgroundColor: ACCENT_ORANGE }}
            className="absolute right-1.5 top-1.5 block h-1.5 w-1.5 rounded-full"
          />
        ) : null}
      </button>
    );
  }

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={onClick}
        className={`flex h-9 items-center gap-2 rounded-full bg-gray-100 py-0 pl-9 pr-4 text-left text-sm transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F97316]/15 dark:bg-neutral-800 dark:hover:bg-neutral-700 ${
          compact ? 'w-9 justify-center p-0 sm:w-36 sm:justify-start sm:pl-9 sm:pr-4' : 'w-36 sm:w-48 md:w-56 lg:w-64'
        }`}
        aria-label={hasQuery ? `Search: ${label}` : 'Open search'}
      >
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <span
          className={`min-w-0 flex-1 truncate ${
            compact ? 'hidden sm:inline' : ''
          } ${
            hasQuery
              ? 'font-medium text-neutral-900 dark:text-white'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          {label}
        </span>
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
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onClick}
        title="Search"
        aria-label={hasQuery ? `Search: ${label}` : 'Open search'}
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
      aria-label={hasQuery ? `Search: ${label}` : 'Open search'}
      /* A rule, not a box. The old filled slab was the heaviest object in the rail and it sat
         directly above a nav that has just lost every one of its rectangles. */
      className="group/search relative flex w-full items-center gap-2.5 border-b border-neutral-200/80 pb-2.5 text-left text-sm transition-colors duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-neutral-400 focus:outline-none focus-visible:border-neutral-900 dark:border-white/10 dark:hover:border-white/30 dark:focus-visible:border-white"
    >
      <SearchIcon className="h-[0.9rem] w-[0.9rem] shrink-0 text-neutral-400 transition-colors duration-[520ms] group-hover/search:text-neutral-700 dark:text-neutral-500 dark:group-hover/search:text-neutral-200" />
      <span
        className={`min-w-0 flex-1 truncate text-[0.72rem] uppercase tracking-[0.14em] ${
          hasQuery
            ? 'font-medium text-neutral-900 dark:text-white'
            : 'font-light text-neutral-500 dark:text-neutral-400'
        }`}
      >
        {label}
      </span>
      <kbd className="shrink-0 font-mono text-[0.6rem] font-light tracking-[0.1em] text-neutral-400 dark:text-neutral-600">
        ⌘K
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
}: {
  compact?: boolean;
  variant?: 'header' | 'sidebar';
  collapsed?: boolean;
  iconOnly?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const currentQuery = pathname.startsWith('/dashboard/search')
    ? (searchParams.get('q') ?? '').trim()
    : '';
  const hasQuery = currentQuery.length > 0;
  const displayText = hasQuery ? currentQuery : 'Search anything...';

  useGlobalSearchShortcut(() => setOpen(true));

  return (
    <>
      {variant === 'sidebar' ? (
        <SidebarSearchButton
          label={displayText}
          hasQuery={hasQuery}
          onClick={() => setOpen(true)}
          collapsed={collapsed}
        />
      ) : (
        <HeaderSearchButton
          label={displayText}
          hasQuery={hasQuery}
          onClick={() => setOpen(true)}
          compact={compact}
          iconOnly={iconOnly}
        />
      )}
      <GlobalSearchModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function DashboardHeaderSearch({
  compact = false,
  variant = 'header',
  collapsed = false,
  iconOnly = false,
}: {
  compact?: boolean;
  variant?: 'header' | 'sidebar';
  collapsed?: boolean;
  iconOnly?: boolean;
}) {
  const fallback =
    variant === 'sidebar' ? (
      <SidebarSearchButton label="Search anything..." hasQuery={false} onClick={() => {}} collapsed={collapsed} />
    ) : (
      <HeaderSearchButton label="Search anything..." hasQuery={false} onClick={() => {}} compact={compact} iconOnly={iconOnly} />
    );

  return (
    <Suspense fallback={fallback}>
      <DashboardHeaderSearchContent compact={compact} variant={variant} collapsed={collapsed} iconOnly={iconOnly} />
    </Suspense>
  );
}
