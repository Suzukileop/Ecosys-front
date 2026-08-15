'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { GlobalSearchModal } from '@/components/layout/GlobalSearchModal';

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function HeaderSearchButton({
  label,
  hasQuery,
  onClick,
  compact = false,
}: {
  label: string;
  hasQuery: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
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
      className="flex h-10 w-full items-center gap-2.5 rounded-xl bg-neutral-100 px-3 text-left text-sm transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-neutral-800/70 dark:hover:bg-neutral-800 dark:focus:ring-orange-500/30"
    >
      <SearchIcon className="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
      <span
        className={`min-w-0 flex-1 truncate ${
          hasQuery
            ? 'font-medium text-neutral-900 dark:text-white'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        {label}
      </span>
      <kbd className="hidden shrink-0 rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-500 sm:inline">
        ⌘K
      </kbd>
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
}: {
  compact?: boolean;
  variant?: 'header' | 'sidebar';
  collapsed?: boolean;
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
}: {
  compact?: boolean;
  variant?: 'header' | 'sidebar';
  collapsed?: boolean;
}) {
  const fallback =
    variant === 'sidebar' ? (
      <SidebarSearchButton label="Search anything..." hasQuery={false} onClick={() => {}} collapsed={collapsed} />
    ) : (
      <HeaderSearchButton label="Search anything..." hasQuery={false} onClick={() => {}} compact={compact} />
    );

  return (
    <Suspense fallback={fallback}>
      <DashboardHeaderSearchContent compact={compact} variant={variant} collapsed={collapsed} />
    </Suspense>
  );
}
