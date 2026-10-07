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
      <DashboardHomeShell newsTheme>
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
    <DashboardHomeShell fullWidth newsTheme>
      <div className="mx-auto w-full max-w-[1400px] space-y-8 px-4 py-8 sm:px-8 sm:py-10 md:px-12 lg:px-16">
        <div className="space-y-5">
          <Link
            href={consultHref}
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-neutral-500 transition-colors hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to product
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#111111] dark:text-white sm:text-4xl">Edit product</h1>
            <p className="mt-2 text-base text-neutral-500 dark:text-neutral-400">
              Update your listing, then save — the preview on the right shows how it will look.
            </p>
          </div>
        </div>

        {loadError && <ErrorAlert message={loadError} onDismiss={() => setLoadError(null)} />}
        {submitError && <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />}

        {loading ? (
          <CreatorStudioProductEditSkeleton />
        ) : (
          product && (
            <ProductEditorForm
              initial={product}
              showFormatToggle={false}
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
