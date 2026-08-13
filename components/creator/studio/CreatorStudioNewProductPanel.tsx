'use client';

import { useState } from 'react';
import { createProduct } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { ProductEditorForm } from '@/components/marketplace/ProductEditorForm';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import type { ProductFormat } from '@/components/marketplace/product-editor-steps';
import type { MarketplaceProductRequest } from '@/types/marketplace';

type CreatorStudioNewProductPanelProps = {
  onClose: () => void;
  onCreated: (productTitle: string) => void;
  productFormat: ProductFormat;
};

export function CreatorStudioNewProductPanel({
  onClose,
  onCreated,
  productFormat,
}: CreatorStudioNewProductPanelProps) {
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
      <div className="px-5 py-6 sm:px-6">
        {submitError && (
          <div className="mb-5">
            <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />
          </div>
        )}
        <ProductEditorForm
          embedded
          showFormatToggle={false}
          controlledFormat={productFormat}
          submitLabel="Create product"
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </section>
  );
}
