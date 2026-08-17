'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

export type ConfirmDialogProps = {
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
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40 disabled:opacity-60',
  brand:
    'bg-[var(--msg-brand,#F47B20)] text-white hover:bg-[var(--msg-brand-hover,#E06E18)] focus-visible:ring-[var(--msg-brand)]/40 disabled:opacity-60',
  neutral:
    'bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-400/40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 disabled:opacity-60',
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
      className="fixed inset-0 z-[220] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        aria-label="Close"
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
        className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-950"
      >
        <h2 id={titleId} className="text-lg font-semibold text-neutral-900 dark:text-white">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950 ${confirmToneClass[tone]}`}
          >
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
