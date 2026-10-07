'use client';

import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const subscribeNoop = () => () => {};

/**
 * Modal frame shared by the post dialogs (repost, report): bottom sheet on phones, centred card from
 * `sm`, same chrome as the share dialog. Locks page scroll and closes on Escape / backdrop.
 */
export function ContentPostDialogShell({
  open,
  title,
  onClose,
  busy = false,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  /** While a request is in flight the dialog cannot be dismissed. */
  busy?: boolean;
  children: ReactNode;
}) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, busy, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[210] flex items-end justify-center sm:items-start sm:px-5 sm:pt-[10vh]">
      <button
        type="button"
        className="fixed inset-0 h-[100dvh] w-full cursor-default bg-black/40 dark:bg-black/60"
        aria-label="Close"
        onClick={() => {
          if (!busy) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-[211] flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-black/[0.08] bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] dark:border-white/[0.1] dark:bg-[#0A0A0A] sm:max-w-[480px] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-4">
          <h2 className="text-[17px] font-bold text-[#111111] dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-black/[0.06] hover:text-[#111111] disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export const DIALOG_PRIMARY_BUTTON =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#111111] px-5 text-[14px] font-semibold text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-[#111111]';

export const DIALOG_SECONDARY_BUTTON =
  'inline-flex h-10 items-center justify-center rounded-full px-4 text-[14px] font-medium text-neutral-600 transition-colors hover:bg-black/[0.05] hover:text-[#111111] disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-white/[0.08] dark:hover:text-white';
