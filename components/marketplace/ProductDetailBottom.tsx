'use client';

import { useState, type ReactNode } from 'react';
import { ProductDetailInfoTabs } from '@/components/marketplace/ProductDetailInfoTabs';
import { ProductDetailPurchaseCta } from '@/components/marketplace/ProductDetailPurchaseCta';
import { ProductReviewsList } from '@/components/marketplace/ProductReviewsList';
import { ProductSimilarList } from '@/components/marketplace/ProductSimilarList';
import { emitRatingUpdated } from '@/lib/ratingBus';
import { productDetailSectionGapClass } from '@/components/marketplace/product-highlight-ui';
import type { MarketplaceProductDetail } from '@/types/marketplace';

type ProductDetailBottomProps = {
  product: MarketplaceProductDetail;
  deliveryLabel: string;
  licenseLabel: string;
  reviewCount: number;
  loginRedirect: string;
  middle?: ReactNode;
  purchaseCta?: {
    priceCents: number;
    priceLabel: string;
    isAuthenticated: boolean;
    productTitle: string;
  };
};

export function ProductDetailBottom({
  product,
  deliveryLabel,
  licenseLabel,
  reviewCount,
  loginRedirect,
  middle,
  purchaseCta,
}: ProductDetailBottomProps) {
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

      {purchaseCta ? (
        <ProductDetailPurchaseCta
          priceCents={purchaseCta.priceCents}
          priceLabel={purchaseCta.priceLabel}
          isAuthenticated={purchaseCta.isAuthenticated}
          loginRedirect={loginRedirect}
          productTitle={purchaseCta.productTitle}
        />
      ) : null}

      <section className="border-t border-gray-200 pt-10 dark:border-neutral-800">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <ProductReviewsList
            productId={product.id}
            loginRedirect={loginRedirect}
            refreshKey={listRefreshKey}
            initialReviewCount={product.reviewCount}
            initialAverageRating={product.averageRating}
          />
          <ProductSimilarList productId={product.id} genre={product.genre} />
        </div>
      </section>
    </div>
  );
}
