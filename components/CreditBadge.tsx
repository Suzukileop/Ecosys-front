'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyCreditBalance } from '@/lib/credits';

type CreditBadgeProps = {
  variant?: 'default' | 'sidebar';
  collapsed?: boolean;
};

export function CreditBadge({ variant = 'default', collapsed = false }: CreditBadgeProps) {
  const [balance, setBalance] = useState<number | null>(null);

  const loadBalance = useCallback(async () => {
    try {
      const value = await getMyCreditBalance();
      setBalance(value);
    } catch {
      setBalance(0);
    }
  }, []);

  useEffect(() => {
    void loadBalance();
  }, [loadBalance]);

  useEffect(() => {
    const onCreditsUpdated = () => {
      void loadBalance();
    };
    window.addEventListener('credits-updated', onCreditsUpdated);
    return () => window.removeEventListener('credits-updated', onCreditsUpdated);
  }, [loadBalance]);

  const display = balance === null ? '…' : balance.toLocaleString('en-US');

  const isSidebar = variant === 'sidebar';

  const sidebarCompactButtonClass =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-300 hover:text-[#F97316] dark:border-neutral-700 dark:bg-neutral-900 dark:hover:text-[#FB923C]';

  if (isSidebar && collapsed) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Link
          href="/dashboard/credits"
          title="Credit balance"
          aria-label="Credit balance"
          className={sidebarCompactButtonClass}
        >
          <svg
            className="h-4 w-4 shrink-0 text-[#F97316]"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    );
  }

  if (isSidebar) {
    return (
      <div
        className="flex h-12 w-full rounded-full bg-neutral-200/70 p-1 dark:bg-neutral-800/80"
        title="Credit balance"
      >
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-full bg-white px-3.5 py-2.5 text-sm shadow-sm dark:bg-neutral-700">
          <div className="flex min-w-0 items-center gap-2">
            <svg
              className="h-4 w-4 shrink-0 text-[#F97316]"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold tabular-nums text-neutral-900 dark:text-white">{display}</span>
            <span className="text-neutral-500 dark:text-neutral-300">credits</span>
          </div>
          <Link
            href="/dashboard/credits"
            title="Buy credits"
            aria-label="Buy credits"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFF7ED] text-sm font-semibold leading-none text-[#F97316] transition hover:bg-[#FFEDD5] dark:bg-[#F97316]/10"
          >
            +
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-sm text-teal-900 ring-1 ring-teal-200"
      title="Credit balance"
    >
      <svg className="h-4 w-4 shrink-0 text-teal-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
          clipRule="evenodd"
        />
      </svg>
      <span className="font-semibold tabular-nums">{display}</span>
      <span className="text-teal-700">credits</span>
    </div>
  );
}
