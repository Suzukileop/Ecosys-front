'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/lib/i18n/I18nProvider';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive styling for the confirm button (delete). */
  tone?: 'danger' | 'neutral' | 'brand';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const confirmToneClass: Record<NonNullable<ConfirmDialogProps['tone']>, string> = {
  danger: 'bg-[#F4212E] text-white hover:bg-[#DC1D29] focus-visible:ring-[#F4212E]/40 disabled:opacity-60',
  /* X palette: "brand" is the ink action fill like "neutral" — no accent hue on chrome. */
  brand:
    'bg-[#0F1419] text-white hover:bg-[#272C30] focus-visible:ring-[#0F1419]/35 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC] disabled:opacity-60',
  neutral:
    'bg-[#0F1419] text-white hover:bg-[#272C30] focus-visible:ring-[#0F1419]/35 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC] disabled:opacity-60',
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'neutral',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useT();
  const titleId = useId();
  const descriptionId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    const focusTimer = window.setTimeout(() => confirmRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open, busy, onCancel]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 dark:bg-black/60"
        aria-label={t('Close')}
        disabled={busy}
        onClick={() => {
          if (!busy) onCancel();
        }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative w-full max-w-md rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] dark:bg-black dark:shadow-[0_0_0_1px_#2F3336] sm:rounded-2xl sm:pb-6"
      >
        <h2 id={titleId} className="text-[20px] font-extrabold leading-6 text-[#0F1419] dark:text-[#E7E9EA]">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="mt-2 text-[15px] leading-5 text-[#536471] dark:text-[#71767B]">
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="inline-flex h-10 items-center rounded-full border border-[#CFD9DE] px-5 text-[15px] font-bold text-[#0F1419] transition-colors hover:bg-[rgba(15,20,25,0.06)] disabled:opacity-60 dark:border-[#536471] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)]"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`inline-flex h-10 items-center rounded-full px-5 text-[15px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-black ${confirmToneClass[tone]}`}
          >
            {busy ? t('Please wait…') : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
