'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type LayoutSettingsExploreModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
};

export function LayoutSettingsExploreModal({
  open,
  onClose,
  title,
  description,
  children,
}: LayoutSettingsExploreModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, handleClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto overscroll-contain p-3 py-6 sm:items-center sm:p-5">
      <button
        type="button"
        className="absolute inset-0 h-[100dvh] w-full bg-neutral-950/70 backdrop-blur-md"
        aria-label="Close"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="layout-explore-modal-title"
        className="relative z-10 w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800 sm:px-6">
          <div className="min-w-0">
            <h2 id="layout-explore-modal-title" className="text-lg font-bold text-neutral-900 dark:text-white">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="max-h-[min(70vh,720px)] overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
