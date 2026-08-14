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
  reviewCount: number;
  loginRedirect: string;
  middle?: ReactNode;
  purchaseCta?: {
    isAuthenticated: boolean;
    creatorId: string;
    creatorName?: string | null;
  };
};

export function ProductDetailBottom({
  product,
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
        reviewCount={reviewCount}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {middle}

      {purchaseCta ? (
        <ProductDetailPurchaseCta
          isAuthenticated={purchaseCta.isAuthenticated}
          creatorId={purchaseCta.creatorId}
          creatorName={purchaseCta.creatorName}
        />
      ) : null}

      <section className="pt-10">
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
