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

function DashboardHeaderSearchContent({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const currentQuery = pathname.startsWith('/dashboard/search')
    ? (searchParams.get('q') ?? '').trim()
    : '';
  const hasQuery = currentQuery.length > 0;
  const displayText = hasQuery ? currentQuery : 'Search anything...';

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
        setOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <HeaderSearchButton
        label={displayText}
        hasQuery={hasQuery}
        onClick={() => setOpen(true)}
        compact={compact}
      />
      <GlobalSearchModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function DashboardHeaderSearch({ compact = false }: { compact?: boolean }) {
  return (
    <Suspense
      fallback={
        <HeaderSearchButton label="Search anything..." hasQuery={false} onClick={() => {}} compact={compact} />
      }
    >
      <DashboardHeaderSearchContent compact={compact} />
    </Suspense>
  );
}
