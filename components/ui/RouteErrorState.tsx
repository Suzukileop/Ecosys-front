'use client';

import Link from 'next/link';
import { useEffect } from 'react';

type RouteErrorStateProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
};

/**
 * User-facing fallback for route error boundaries. Technical details go to the console only;
 * the digest is shown so a user can quote it to support.
 */
export function RouteErrorState({
  error,
  reset,
  title = 'Something went wrong',
  description = 'This page could not be displayed. Please try again in a moment.',
}: RouteErrorStateProps) {
  useEffect(() => {
    console.error('[route error]', error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/[0.08] text-neutral-500 dark:border-white/[0.12] dark:text-neutral-400">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v5m0 3h.01M10.3 3.9L2.4 17.5A2 2 0 004.1 20.5h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
          </svg>
        </span>
        <h1 className="mt-6 text-[22px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-white">{title}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">{description}</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 items-center rounded-lg bg-[#111111] px-5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-[#111111]"
          >
            Try again
          </button>
          <Link
            href="/feed"
            className="inline-flex h-11 items-center rounded-lg border border-black/[0.12] px-5 text-[15px] font-medium text-[#111111] transition-colors hover:border-black/25 dark:border-white/[0.14] dark:text-white dark:hover:border-white/25"
          >
            Go to home
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-8 font-mono text-[12px] text-neutral-400 dark:text-neutral-500">Error ID: {error.digest}</p>
        ) : null}
      </div>
    </main>
  );
}
