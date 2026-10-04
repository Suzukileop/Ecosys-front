'use client';

import { useState, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProductDetailCharacteristics } from '@/components/marketplace/ProductDetailInfoTabs';
import { ProductReviewComposer } from '@/components/marketplace/ProductReviewComposer';
import { ProductReviewsList } from '@/components/marketplace/ProductReviewsList';
import { ProductSimilarList } from '@/components/marketplace/ProductSimilarList';
import { emitRatingUpdated } from '@/lib/ratingBus';
import type { MarketplaceProductDetail } from '@/types/marketplace';

type ProductDetailBottomProps = {
  product: MarketplaceProductDetail;
  reviewCount: number;
  loginRedirect: string;
  middle?: ReactNode;
};

const SECTION_DIVIDER = 'border-t border-black/[0.06] pt-16 dark:border-white/[0.08] md:pt-20';

export function ProductDetailBottom({
  product,
  reviewCount,
  loginRedirect,
  middle,
}: ProductDetailBottomProps) {
  const { user } = useAuth();
  const isOwner = Boolean(user?.id && user.id === product.creatorId);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  function handleReviewSubmitted() {
    setListRefreshKey((key) => key + 1);
    emitRatingUpdated(product.id);
  }

  return (
    <div className="space-y-16 md:space-y-20">
      <ProductDetailCharacteristics product={product} reviewCount={reviewCount} />

      {middle ? <div className={`space-y-16 md:space-y-20 ${SECTION_DIVIDER}`}>{middle}</div> : null}

      <section className={SECTION_DIVIDER}>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-6">
            <ProductReviewsList
              productId={product.id}
              loginRedirect={loginRedirect}
              refreshKey={listRefreshKey}
              initialReviewCount={product.reviewCount}
              initialAverageRating={product.averageRating}
            />
            {!isOwner && (
              <div className="rounded-lg border border-black/[0.06] bg-white p-6 dark:border-white/[0.08] dark:bg-[#111111]">
                <ProductReviewComposer productId={product.id} onSubmitted={handleReviewSubmitted} />
              </div>
            )}
          </div>
          <ProductSimilarList productId={product.id} genre={product.genre} />
        </div>
      </section>
    </div>
  );
}
