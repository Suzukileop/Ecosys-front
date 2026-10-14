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

/** Sections are separated by space alone — no rule between them (News design). */
const SECTION_DIVIDER = '';

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
    <div className="space-y-10 md:space-y-14">
      <ProductDetailCharacteristics product={product} reviewCount={reviewCount} />

      {middle ? <div className={`space-y-10 md:space-y-14 ${SECTION_DIVIDER}`}>{middle}</div> : null}

      <section className={SECTION_DIVIDER}>
        <div className="flex flex-col gap-10 md:gap-14">
          <div className="min-w-0 space-y-2 sm:space-y-3">
            <ProductReviewsList
              productId={product.id}
              loginRedirect={loginRedirect}
              refreshKey={listRefreshKey}
              initialReviewCount={product.reviewCount}
              initialAverageRating={product.averageRating}
            />
            {!isOwner && (
              <div className="bg-[color:var(--gn-surface)] p-5 empty:hidden sm:p-6">
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
