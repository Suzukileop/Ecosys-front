'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { CreatorShopSettingsFields } from '@/components/creator/CreatorShopSettingsFields';

type CreatorStoreSettingsModalProps = {
  open: boolean;
  storefrontHref: string;
  onClose: () => void;
};

export function CreatorStoreSettingsModal({
  open,
  storefrontHref,
  onClose,
}: CreatorStoreSettingsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-settings-title"
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-md flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-neutral-200 px-6 py-5 dark:border-neutral-700">
          <div>
            <h2
              id="store-settings-title"
              className="text-lg font-bold text-neutral-900 dark:text-white"
            >
              Settings
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Shop identity and storefront options.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <CreatorShopSettingsFields />

          <hr className="border-neutral-200 dark:border-neutral-700" />

          <Link
            href={storefrontHref}
            onClick={onClose}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            Create my own storefront
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
