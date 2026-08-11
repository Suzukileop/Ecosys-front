'use client';

import { useState } from 'react';
import { createProduct } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { ProductEditorForm } from '@/components/marketplace/ProductEditorForm';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import type { MarketplaceProductRequest } from '@/types/marketplace';

type CreatorStudioNewProductPanelProps = {
  onClose: () => void;
  onCreated: (productTitle: string) => void;
};

export function CreatorStudioNewProductPanel({ onClose, onCreated }: CreatorStudioNewProductPanelProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (body: MarketplaceProductRequest) => {
    setSubmitError(null);
    try {
      await createProduct(body);
      onCreated(body.title);
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Unable to create product.'));
    }
  };

  return (
    <section
      id="creator-new-product"
      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-orange-600 dark:text-neutral-400 dark:hover:text-orange-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to my products
          </button>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">New product</p>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6">
        {submitError && (
          <div className="mb-5">
            <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />
          </div>
        )}
        <ProductEditorForm
          embedded
          submitLabel="Create product"
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </section>
  );
}
