'use client';

import { useCallback, useEffect, useId, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { CreatorContentPublishForm } from '@/components/creator/CreatorContentPublishForm';

const subscribeNoop = () => () => {};

type CreatorContentPublishModalProps = {
  open: boolean;
  onClose: () => void;
  onPublished: () => void;
  /** Adapts the composer prompt and hides portfolio details for roles that don't show work. */
  appRole?: string | null;
};

export function CreatorContentPublishModal({ open, onClose, onPublished, appRole }: CreatorContentPublishModalProps) {
  const formId = useId();
  const resolvedFormId = `creator-content-publish-form-${formId}`;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [step, setStep] = useState<1 | 2>(1);
  const [wasOpen, setWasOpen] = useState(open);

  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setFormKey((k) => k + 1);
      setStep(1);
      setSubmitError(null);
      setUploadError(null);
      setSuccess(false);
      setIsSubmitting(false);
    }
  }

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setSubmitError(null);
    setUploadError(null);
    setSuccess(false);
    onClose();
  }, [isSubmitting, onClose]);

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
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 sm:pt-[8vh]">
      <button
        type="button"
        className="fixed inset-0 h-[100dvh] w-full cursor-default bg-black/40 dark:bg-black/60"
        aria-label="Close"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={step === 1 ? 'New post' : 'Post details'}
        className={`relative z-[201] flex w-full max-w-[600px] flex-col rounded-2xl border border-black/[0.08] bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] dark:border-white/[0.1] dark:bg-[#0A0A0A] ${
          step === 2 ? 'max-h-[min(84dvh,720px)] overflow-hidden' : ''
        }`}
      >
        {success || uploadError ? (
          <div className="shrink-0 px-5 pt-4 sm:px-6">
            {success ? (
              <p className="text-[14px] font-medium text-emerald-600 dark:text-emerald-400" role="status">
                Posted.
              </p>
            ) : null}
            {uploadError ? (
              <p className="text-[14px] font-medium text-red-600 dark:text-red-400" role="alert">
                {uploadError}
              </p>
            ) : null}
          </div>
        ) : null}

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
          appRole={appRole}
        />
      </div>
    </div>,
    document.body
  );
}
