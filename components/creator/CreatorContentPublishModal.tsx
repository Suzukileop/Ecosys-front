'use client';

import { useCallback, useEffect, useId, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { CreatorContentPublishForm } from '@/components/creator/CreatorContentPublishForm';
import { useT } from '@/lib/i18n/I18nProvider';

const subscribeNoop = () => () => {};

type CreatorContentPublishModalProps = {
  open: boolean;
  onClose: () => void;
  onPublished: () => void;
  /** Adapts the composer prompt and hides portfolio details for roles that don't show work. */
  appRole?: string | null;
};

export function CreatorContentPublishModal({ open, onClose, onPublished, appRole }: CreatorContentPublishModalProps) {
  const t = useT();
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
    /* Same frame as the other post dialogs (ContentPostDialogShell): a bottom sheet on phones (grab
       handle, rounded top, clear of the home indicator), a centred X card from sm. */
    <div className="x-compose fixed inset-0 z-[200] flex items-end justify-center sm:items-start sm:px-5 sm:pt-[8vh]">
      <button
        type="button"
        className="fixed inset-0 h-[100dvh] w-full cursor-default bg-black/40 dark:bg-black/60"
        aria-label={t('Close')}
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={step === 1 ? t('New post') : t('Post details')}
        /* Bounded at every step: the body scrolls inside (CreatorContentPublishForm), the header and the
           Post bar never leave the screen however long the text gets. No overflow clip on the card itself:
           the "Add to your post" panels (tag people, emoji) open upward from the bottom bar. */
        className={`relative z-[201] flex w-full flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] dark:bg-black dark:shadow-[0_0_0_1px_#2F3336] sm:rounded-2xl sm:pb-0 ${
          step === 2 ? 'max-h-[92dvh] sm:max-h-[min(84dvh,720px)]' : 'max-h-[92dvh] sm:max-h-[min(84dvh,760px)]'
        } sm:max-w-[560px]`}
      >
        <span aria-hidden className="mx-auto mt-2.5 block h-1 w-10 shrink-0 rounded-full bg-[#CFD9DE] dark:bg-[#3E4144] sm:hidden" />
        {success || uploadError ? (
          <div className="shrink-0 px-4 pt-3 sm:px-5">
            {success ? (
              <p className="text-[14px] font-bold text-[#0F1419] dark:text-[#E7E9EA]" role="status">
                {t('Posted.')}
              </p>
            ) : null}
            {uploadError ? (
              <p className="text-[14px] font-medium text-[#F4212E]" role="alert">
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
