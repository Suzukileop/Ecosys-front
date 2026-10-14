'use client';

import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/lib/i18n/I18nProvider';

const subscribeNoop = () => () => {};

/**
 * Modal frame shared by the post dialogs (repost, report, collections), in the X palette: a bottom
 * sheet on phones (grab handle, rounded top, clear of the home-indicator safe area), a centred card
 * from `sm`, over the same darkening veil as the global search (black 40% / 60%). Locks page scroll
 * and closes on Escape / backdrop.
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
  const t = useT();
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
        aria-label={t('Close')}
        onClick={() => {
          if (!busy) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-[211] flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] dark:bg-black sm:max-w-[520px] sm:rounded-2xl sm:pb-0 sm:shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] sm:dark:shadow-[0_0_0_1px_#2F3336]"
        onClick={(e) => e.stopPropagation()}
      >
        <span aria-hidden className="mx-auto mt-2.5 block h-1 w-10 shrink-0 rounded-full bg-[#CFD9DE] dark:bg-[#3E4144] sm:hidden" />
        <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-3 sm:pt-4">
          <h2 className="text-[19px] font-bold leading-6 text-[#0F1419] dark:text-[#E7E9EA]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label={t('Close')}
            className="-mr-2 flex h-9 w-9 items-center justify-center rounded-full text-[#536471] transition hover:bg-[rgba(15,20,25,0.1)] hover:text-[#0F1419] disabled:opacity-40 dark:text-[#71767B] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]"
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

/** X's primary pill: ink on light, off-white on dark. */
export const DIALOG_PRIMARY_BUTTON =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#0F1419] px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#272C30] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]';

/** X's secondary pill: a hairline outline, ink label. */
export const DIALOG_SECONDARY_BUTTON =
  'inline-flex h-10 items-center justify-center rounded-full border border-[#CFD9DE] px-5 text-[15px] font-bold text-[#0F1419] transition-colors hover:bg-[rgba(15,20,25,0.06)] disabled:opacity-40 dark:border-[#536471] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)]';
