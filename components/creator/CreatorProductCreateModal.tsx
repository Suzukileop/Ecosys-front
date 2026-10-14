'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { createProduct } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { ProductEditorForm } from '@/components/marketplace/ProductEditorForm';
import type { ProductFormat } from '@/components/marketplace/product-editor-steps';
import type { MarketplaceProductRequest } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

type CreatorProductCreateModalProps = {
  open: boolean;
  productFormat: ProductFormat;
  onFormatChange: (format: ProductFormat) => void;
  onClose: () => void;
  onCreated: (productTitle: string) => void;
};

const subscribeNoop = () => () => {};

export function CreatorProductCreateModal({
  open,
  productFormat,
  onFormatChange,
  onClose,
  onCreated,
}: CreatorProductCreateModalProps) {
  const t = useT();
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  const dirtyRef = useRef(false);

  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setFormKey((key) => key + 1);
      setSubmitError(null);
      setConfirmDiscard(false);
    }
  }

  const requestClose = useCallback(() => {
    if (dirtyRef.current) setConfirmDiscard(true);
    else onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      if (confirmDiscard) setConfirmDiscard(false);
      else requestClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, confirmDiscard, requestClose]);

  const onSubmit = async (body: MarketplaceProductRequest) => {
    setSubmitError(null);
    try {
      await createProduct(body);
      dirtyRef.current = false;
      onCreated(body.title);
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, t('Unable to create product.')));
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-start sm:px-5 sm:pt-[6vh]">
      <button
        type="button"
        aria-label={t('Close')}
        tabIndex={-1}
        onClick={requestClose}
        className="fixed inset-0 h-[100dvh] w-full cursor-default bg-black/40 backdrop-blur-[2px] dark:bg-black/60"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-[201] flex h-[94dvh] max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[22px] bg-white sm:h-auto sm:border sm:border-black/[0.08] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] dark:border-white/[0.1] dark:bg-[#0A0A0A] sm:max-h-[min(88dvh,900px)] sm:max-w-[760px] sm:rounded-2xl"
      >
        {submitError ? (
          <div role="alert"
            className="flex shrink-0 items-start justify-between gap-3 bg-[#F4212E]/[0.08] px-5 py-3 text-[14px] font-medium text-[#F4212E] sm:px-8">
            <span>{submitError}</span>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="shrink-0 font-medium underline-offset-4 hover:underline"
            >
              {t('Dismiss')}
            </button>
          </div>
        ) : null}

        <ProductEditorForm
          key={formKey}
          variant="modal"
          heading={t('New product')}
          controlledFormat={productFormat}
          onFormatChange={onFormatChange}
          submitLabel={t('Publish')}
          onCancel={requestClose}
          onDirtyChange={(dirty) => {
            dirtyRef.current = dirty;
          }}
          onSubmit={onSubmit}
        />

        {confirmDiscard ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 p-6 backdrop-blur-sm dark:bg-black/60">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="discard-product-title"
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] dark:bg-black dark:shadow-[0_0_0_1px_#2F3336]"
            >
              <h3 id="discard-product-title" className="text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[#0F1419] dark:text-[#E7E9EA]">
                {t('Discard this product?')}
              </h3>
              <p className="mt-2 text-[15px] leading-5 text-[#536471] dark:text-[#71767B]">
                {t('What you’ve entered will be lost. Save it as a draft to finish later.')}
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setConfirmDiscard(false)}
                  className="inline-flex h-10 items-center rounded-full px-5 text-[15px] font-bold text-[#0F1419] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[rgba(15,20,25,0.06)] dark:text-[#E7E9EA] dark:shadow-[inset_0_0_0_1px_#536471] dark:hover:bg-[rgba(231,233,234,0.1)]"
                >
                  {t('Keep editing')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDiscard(false);
                    onClose();
                  }}
                  className="inline-flex h-10 items-center rounded-full bg-[#F4212E] px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#DC1E29]"
                >
                  {t('Discard')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
