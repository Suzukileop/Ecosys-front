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
import { useT } from '@/lib/i18n/I18nProvider';

export default function EditCreatorProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useT();
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
      setLoadError(getApiErrorMessage(e, t('Unable to load this product.')));
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

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
      <DashboardHomeShell newsTheme newsGround>
        <div className="bg-[color:var(--gn-surface)] px-6 py-10 text-center text-[15px] text-[color:var(--gn-ink2)]">
          {t('This section is reserved for creator accounts.')}
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
      setSubmitError(getApiErrorMessage(e, t('Update failed.')));
    }
  };

  return (
    <DashboardHomeShell fullWidth newsTheme newsGround>
      <div className="mx-auto w-full max-w-[1400px] space-y-4 px-0 pb-24 pt-2 sm:space-y-6 sm:px-6 sm:pt-6 lg:px-8">
        <div className="space-y-2 px-4 sm:px-0">
          <Link
            href={consultHref}
            className="inline-flex h-10 items-center gap-1.5 text-[14px] font-medium text-[color:var(--gn-ink2)] transition-colors hover:text-[color:var(--gn-ink)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
            {t('Back to product')}
          </Link>
          <div>
            <h1 className="text-[26px] font-extrabold leading-8 tracking-[-0.02em] text-[color:var(--gn-ink)] sm:text-[32px] sm:leading-10">
              {t('Edit product')}
            </h1>
            <p className="mt-1 text-[15px] leading-5 text-[color:var(--gn-ink2)]">
              {t('Update your listing, then save — the preview on the right shows how it will look.')}
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
              submitLabel={t('Save changes')}
              cancelHref={consultHref}
              onSubmit={onSubmit}
            />
          )
        )}
      </div>
    </DashboardHomeShell>
  );
}
