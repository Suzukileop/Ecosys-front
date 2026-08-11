'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { CreatorContentPublishForm } from '@/components/creator/CreatorContentPublishForm';

type CreatorContentPublishModalProps = {
  open: boolean;
  onClose: () => void;
  onPublished: () => void;
};

export function CreatorContentPublishModal({ open, onClose, onPublished }: CreatorContentPublishModalProps) {
  const formId = useId();
  const resolvedFormId = `creator-content-publish-form-${formId}`;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setSubmitError(null);
    setUploadError(null);
    setSuccess(false);
    onClose();
  }, [isSubmitting, onClose]);

  useEffect(() => {
    if (!open) return;
    setFormKey((k) => k + 1);
    setStep(1);
    setSubmitError(null);
    setUploadError(null);
    setSuccess(false);
    setIsSubmitting(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
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

  if (!open || !mounted) return null;

  const onSuccess = () => {
    setSuccess(true);
    onPublished();
    window.setTimeout(() => {
      setSuccess(false);
      handleClose();
    }, 500);
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[200] flex justify-center overscroll-contain p-3 sm:p-5 ${
        step === 2 ? 'items-center overflow-hidden' : 'items-start overflow-y-auto py-6 sm:items-center sm:py-5'
      }`}
    >
      <button
        type="button"
        className="absolute inset-0 h-[100dvh] w-full bg-neutral-950/70 backdrop-blur-md"
        aria-label="Close"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`New publication · step ${step} of 2`}
        className={`relative z-[201] flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200/50 bg-white shadow-xl dark:border-neutral-800/80 dark:bg-neutral-950 sm:rounded-3xl ${
          step === 2 ? 'max-h-[min(88dvh,680px)]' : ''
        }`}
      >
        <div className="shrink-0 px-5 pb-2 pt-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold tabular-nums tracking-tight text-neutral-900 dark:text-white" aria-live="polite">
              <span className={step === 1 ? 'text-orange-500 dark:text-orange-400' : 'text-neutral-400'}>1</span>
              <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">/</span>
              <span className={step === 2 ? 'text-orange-500 dark:text-orange-400' : 'text-neutral-400'}>2</span>
            </p>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {success && (
            <p
              className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
              role="status"
            >
              Content published successfully.
            </p>
          )}
          {uploadError && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">
              {uploadError}
            </p>
          )}
        </div>

        <div
          className={`px-5 pb-5 sm:px-6 sm:pb-6 ${
            step === 2 ? 'flex min-h-0 flex-1 flex-col overflow-hidden' : ''
          }`}
        >
          <CreatorContentPublishForm
            key={formKey}
            formId={resolvedFormId}
            onCancel={handleClose}
            submitError={submitError}
            onSubmitError={setSubmitError}
            onUploadErrorChange={setUploadError}
            onSubmittingChange={setIsSubmitting}
            onStepChange={setStep}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
