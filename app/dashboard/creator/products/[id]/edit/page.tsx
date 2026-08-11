'use client';

import { use, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCreatorProduct, updateProduct } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { creatorProductsRedirectAfterAction } from '@/lib/creator-product-feedback';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ProductEditorForm } from '@/components/marketplace/ProductEditorForm';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioProductEditSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { useAuth } from '@/context/AuthContext';
import type { MarketplaceProductDetail, MarketplaceProductRequest } from '@/types/marketplace';

export default function EditCreatorProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { hasRole } = useAuth();
  const [product, setProduct] = useState<MarketplaceProductDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      setProduct(null);
      const data = await getCreatorProduct(id);
      setProduct(data);
    } catch (e) {
      setLoadError(getApiErrorMessage(e, 'Unable to load this product.'));
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useLayoutEffect(() => {
    setLoading(true);
    setProduct(null);
    setLoadError(null);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!hasRole('ROLE_CREATOR')) {
    return (
      <DashboardHomeShell>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-900">
          This section is reserved for creator accounts.
        </div>
      </DashboardHomeShell>
    );
  }

  const onSubmit = async (body: MarketplaceProductRequest) => {
    setSubmitError(null);
    try {
      await updateProduct(id, body);
      router.replace(creatorProductsRedirectAfterAction('updated', body.title));
      router.refresh();
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Update failed.'));
    }
  };

  return (
    <DashboardHomeShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            href="/dashboard/creator?tab=products"
            className="text-sm font-medium text-orange-600 transition hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            ← My products
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">Edit product</h1>
        </div>

        {loadError && <ErrorAlert message={loadError} onDismiss={() => setLoadError(null)} />}
        {submitError && <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />}

        {loading ? (
          <CreatorStudioProductEditSkeleton />
        ) : (
          product && (
            <ProductEditorForm
              initial={product}
              submitLabel="Save changes"
              cancelHref="/dashboard/creator?tab=products"
              onSubmit={onSubmit}
            />
          )
        )}
      </div>
    </DashboardHomeShell>
  );
}
