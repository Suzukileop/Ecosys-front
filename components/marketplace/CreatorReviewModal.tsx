'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CreatorReviewComposer } from '@/components/marketplace/CreatorReviewComposer';
import { useAuth } from '@/context/AuthContext';

type CreatorReviewTriggerButtonProps = {
  creatorId: string;
  onClick: () => void;
  className?: string;
};

export function CreatorReviewTriggerButton({
  creatorId,
  onClick,
  className,
}: CreatorReviewTriggerButtonProps) {
  const { user, isLoading: authLoading } = useAuth();
  const isSelf = user?.id === creatorId;

  if (authLoading || isSelf) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className ??
        'inline-flex shrink-0 items-center justify-center rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600 sm:px-4 sm:py-2 sm:text-sm'
      }
    >
      Laisser un avis
    </button>
  );
}

type CreatorReviewModalProps = {
  open: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  onSubmitted?: () => void;
};

export function CreatorReviewModal({
  open,
  onClose,
  creatorId,
  creatorName,
  onSubmitted,
}: CreatorReviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    setFormKey((k) => k + 1);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, handleClose]);

  const handleSubmitted = () => {
    onSubmitted?.();
    window.setTimeout(() => {
      handleClose();
    }, 1200);
  };

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center overscroll-contain p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 h-[100dvh] w-full bg-neutral-950/70 backdrop-blur-md"
        aria-label="Fermer"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="creator-review-modal-title"
        className="relative z-[201] w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950 sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800 sm:px-6">
          <div>
            <h2
              id="creator-review-modal-title"
              className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white"
            >
              Laisser un avis
            </h2>
            <p className="mt-1 text-sm text-neutral-500">Partagez votre expérience avec {creatorName}.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-900"
            aria-label="Fermer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <CreatorReviewComposer
            key={formKey}
            creatorId={creatorId}
            creatorName={creatorName}
            embedded
            onSubmitted={handleSubmitted}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
