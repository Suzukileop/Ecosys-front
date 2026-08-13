'use client';

import { use, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCreatorProduct, updateProduct } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { showCreatorProductFeedback } from '@/lib/creator-product-feedback';
import {
  creatorProductViewPath,
  parseCreatorProductNavFrom,
} from '@/lib/creator-product-nav';
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
  const searchParams = useSearchParams();
  const navFrom = parseCreatorProductNavFrom(searchParams.get('from'));
  const consultHref = creatorProductViewPath(id, navFrom);
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
      showCreatorProductFeedback('updated', body.title);
      router.replace(consultHref);
      router.refresh();
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Update failed.'));
    }
  };

  return (
    <DashboardHomeShell fullWidth>
      <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <Link
            href={consultHref}
            className="inline-flex items-center text-sm font-medium text-neutral-500 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {'< back'}
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">Edit product</h1>
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
              cancelHref={consultHref}
              onSubmit={onSubmit}
            />
          )
        )}
      </div>
    </DashboardHomeShell>
  );
}
