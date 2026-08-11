'use client';

import { ProductReviewComposer } from '@/components/marketplace/ProductReviewComposer';
import { ProductReviewsList } from '@/components/marketplace/ProductReviewsList';

type ProductReviewsSectionProps = {
  productId: string;
  loginRedirect: string;
  initialAverageRating?: number | null;
  initialReviewCount?: number;
};

/** Full reviews block (composer + list). Prefer ProductDetailInfoTabs on the product page. */
export function ProductReviewsSection({
  productId,
  loginRedirect,
  initialAverageRating,
  initialReviewCount = 0,
}: ProductReviewsSectionProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <ProductReviewComposer productId={productId} />
      </div>
      <ProductReviewsList
        productId={productId}
        loginRedirect={loginRedirect}
        initialReviewCount={initialReviewCount}
        initialAverageRating={initialAverageRating}
      />
    </div>
  );
}
