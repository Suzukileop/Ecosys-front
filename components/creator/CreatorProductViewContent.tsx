'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getCreatorProduct,
  PRODUCT_TYPE_LABELS,
  publishProduct,
  unpublishProduct,
} from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { creatorProductsRedirectAfterAction } from '@/lib/creator-product-feedback';
import {
  creatorProductBackNav,
  creatorProductViewPath,
  parseCreatorProductNavFrom,
} from '@/lib/creator-product-nav';
import { CreatorProductDeleteZone } from '@/components/creator/CreatorProductDeleteZone';
import { CreatorProductDetailBottom } from '@/components/creator/CreatorProductDetailBottom';
import { CreatorProductManagePanel } from '@/components/creator/CreatorProductManagePanel';
import { ProductDemoSection } from '@/components/marketplace/ProductDemoSection';
import { ProductDetailGallery } from '@/components/marketplace/ProductDetailGallery';
import { ProductDetailMediaEngagement } from '@/components/marketplace/ProductDetailMediaEngagement';
import { ProductDetailRatingBadge } from '@/components/marketplace/ProductDetailRatingBadge';
import { ProductWhyHighlights } from '@/components/marketplace/ProductWhyHighlights';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioProductViewSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import type { MarketplaceProductDetail } from '@/types/marketplace';

type CreatorProductViewContentProps = {
  productId: string;
};

export function CreatorProductViewContent({ productId }: CreatorProductViewContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const navFrom = parseCreatorProductNavFrom(searchParams.get('from'));
  const backNav = creatorProductBackNav(navFrom);
  const [product, setProduct] = useState<MarketplaceProductDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      setProduct(null);
      const data = await getCreatorProduct(productId);
      setProduct(data);
    } catch (e) {
      setLoadError(getApiErrorMessage(e, 'Unable to load this product.'));
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useLayoutEffect(() => {
    setLoading(true);
    setProduct(null);
    setLoadError(null);
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  const togglePublish = async () => {
    if (!product) return;
    setActionError(null);
    setPublishing(true);
    try {
      if (product.isPublished) {
        await unpublishProduct(product.id);
      } else {
        await publishProduct(product.id);
      }
      await load();
    } catch (e) {
      setActionError(getApiErrorMessage(e, 'Could not update publication status.'));
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <CreatorStudioProductViewSkeleton />;
  }

  if (loadError || !product) {
    return <ErrorAlert message={loadError ?? 'Product not found.'} />;
  }

  const typeLabel = PRODUCT_TYPE_LABELS[product.type] ?? product.type;
  const reviewCount = product.reviewCount ?? 0;
  const consultUrl = creatorProductViewPath(product.id, navFrom);

  const handleDeleted = () => {
    router.replace(creatorProductsRedirectAfterAction('deleted', product.title));
    router.refresh();
  };

  const productStorySections = (
    <>
      {product.whyProductBlocks && product.whyProductBlocks.length > 0 && (
        <ProductWhyHighlights blocks={product.whyProductBlocks} />
      )}

      {product.demoUrl && product.demoType !== 'NONE' && (
        <ProductDemoSection
          demoUrl={product.demoUrl}
          demoType={product.demoType}
          demoSubtitles={product.demoSubtitles}
          demoDescription={product.demoDescription}
        />
      )}
    </>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backNav.href}
          className="text-sm font-medium text-orange-600 transition hover:text-orange-700 dark:text-orange-400"
        >
          {backNav.label}
        </Link>
        {!product.isPublished && (
          <span className="rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            Draft — not visible on the public marketplace
          </span>
        )}
      </div>

      {actionError && <ErrorAlert message={actionError} onDismiss={() => setActionError(null)} />}

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="order-1 lg:col-span-5">
          <ProductDetailGallery
            title={product.title}
            thumbnailUrl={product.thumbnailUrl}
            videoDurationSeconds={product.videoDurationSeconds}
            videoResolution={product.videoResolution}
            isBestseller={product.isBestseller}
          />

          <div className="mt-4 flex items-end justify-between gap-4">
            <ProductDetailRatingBadge
              productId={product.id}
              initialRating={product.averageRating ?? null}
              initialReviewCount={reviewCount}
            />
            <ProductDetailMediaEngagement
              productId={product.id}
              initialViews={product.views}
              initialLikes={product.likes}
            />
          </div>
        </div>

        <div className="order-3 space-y-6 lg:order-2 lg:col-span-4">
          <header className="space-y-4">
            <h1 className="text-2xl font-bold leading-tight text-neutral-900 dark:text-white md:text-3xl">
              {product.title}
            </h1>

            {product.description && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {product.description}
              </p>
            )}

            {(product.compatibleTools.length > 0 ||
              product.tags.length > 0 ||
              typeLabel ||
              product.genre ||
              product.specialite) && (
              <div className="space-y-3">
                {(typeLabel || product.genre || product.specialite) && (
                  <div className="flex flex-wrap gap-2">
                    {typeLabel && (
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-500/10 dark:text-orange-200">
                        {typeLabel}
                      </span>
                    )}
                    {product.genre && (
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold capitalize text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        {product.genre}
                      </span>
                    )}
                    {product.specialite && (
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold capitalize text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        {product.specialite}
                      </span>
                    )}
                  </div>
                )}

                {product.compatibleTools.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Compatible tools
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {product.compatibleTools.map((tool) => (
                        <li
                          key={tool}
                          className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {tool}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.tags.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Tags</p>
                    <ul className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-800 dark:bg-orange-500/10 dark:text-orange-200"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </header>
        </div>

        <div className="order-2 lg:order-3 lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <CreatorProductManagePanel
              product={product}
              publishing={publishing}
              onTogglePublish={() => void togglePublish()}
              from={navFrom}
            />
          </div>
        </div>
      </div>

      {product.isPublished ? (
        <div className="mt-10 border-t border-neutral-200 pt-10 dark:border-neutral-800">
          <CreatorProductDetailBottom
            product={product}
            reviewCount={reviewCount}
            loginRedirect={consultUrl}
            onDeleted={handleDeleted}
            middle={productStorySections}
          />
        </div>
      ) : (
        <>
          {(product.whyProductBlocks?.length || (product.demoUrl && product.demoType !== 'NONE')) && (
            <div className="mt-10 space-y-10 border-t border-neutral-200 pt-10 dark:border-neutral-800">
              {productStorySections}
            </div>
          )}
        <div className="grid items-start gap-10 border-t border-neutral-200 pt-10 dark:border-neutral-800 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-400">
            <p className="font-semibold text-neutral-900 dark:text-white">Product details</p>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              {product.fileFormat && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">Format</dt>
                  <dd className="font-medium text-neutral-800 dark:text-neutral-200">{product.fileFormat}</dd>
                </div>
              )}
              {product.fileSizeMb != null && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">Size</dt>
                  <dd className="font-medium text-neutral-800 dark:text-neutral-200">{product.fileSizeMb} MB</dd>
                </div>
              )}
              {product.language && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">Language</dt>
                  <dd className="font-medium text-neutral-800 dark:text-neutral-200">{product.language}</dd>
                </div>
              )}
              {product.version && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">Version</dt>
                  <dd className="font-medium text-neutral-800 dark:text-neutral-200">{product.version}</dd>
                </div>
              )}
            </dl>
          </div>
          <div className="lg:sticky lg:top-24">
            <CreatorProductDeleteZone
              productId={product.id}
              productTitle={product.title}
              onDeleted={handleDeleted}
            />
          </div>
        </div>
        </>
      )}
    </div>
  );
}
