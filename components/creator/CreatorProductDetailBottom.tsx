'use client';

import { useState, type ReactNode } from 'react';
import { CreatorProductDeleteZone } from '@/components/creator/CreatorProductDeleteZone';
import { ProductDetailInfoTabs } from '@/components/marketplace/ProductDetailInfoTabs';
import { ProductReviewsList } from '@/components/marketplace/ProductReviewsList';
import { emitRatingUpdated } from '@/lib/ratingBus';
import { productDetailSectionGapClass } from '@/components/marketplace/product-highlight-ui';
import type { MarketplaceProductDetail } from '@/types/marketplace';

type CreatorProductDetailBottomProps = {
  product: MarketplaceProductDetail;
  deliveryLabel: string;
  licenseLabel: string;
  reviewCount: number;
  loginRedirect: string;
  onDeleted: () => void;
  middle?: ReactNode;
};

export function CreatorProductDetailBottom({
  product,
  deliveryLabel,
  licenseLabel,
  reviewCount,
  loginRedirect,
  onDeleted,
  middle,
}: CreatorProductDetailBottomProps) {
  const [listRefreshKey, setListRefreshKey] = useState(0);

  function handleReviewSubmitted() {
    setListRefreshKey((key) => key + 1);
    emitRatingUpdated(product.id);
  }

  return (
    <div className={productDetailSectionGapClass}>
      <ProductDetailInfoTabs
        product={product}
        deliveryLabel={deliveryLabel}
        licenseLabel={licenseLabel}
        reviewCount={reviewCount}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {middle}

      <section className="border-t border-neutral-200 pt-10 dark:border-neutral-800">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <ProductReviewsList
            productId={product.id}
            loginRedirect={loginRedirect}
            refreshKey={listRefreshKey}
            initialReviewCount={product.reviewCount}
            initialAverageRating={product.averageRating}
          />
          <div className="lg:sticky lg:top-24">
            <CreatorProductDeleteZone
              productId={product.id}
              productTitle={product.title}
              onDeleted={onDeleted}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
