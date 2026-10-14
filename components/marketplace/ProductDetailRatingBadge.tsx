'use client';

import { useEffect, useState } from 'react';
import { StarRating } from '@/components/marketplace/StarRating';
import { getProductReviewSummary } from '@/lib/marketplace-api';
import { subscribeRatingUpdated } from '@/lib/ratingBus';
import { useT } from '@/lib/i18n/I18nProvider';

type ProductDetailRatingBadgeProps = {
  productId: string;
  initialRating: number | null;
  initialReviewCount: number;
};

export function ProductDetailRatingBadge({
  productId,
  initialRating,
  initialReviewCount,
}: ProductDetailRatingBadgeProps) {
  const t = useT();
  const [rating, setRating] = useState<number | null>(initialRating);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);

  useEffect(() => {
    return subscribeRatingUpdated(async (updatedProductId) => {
      if (updatedProductId !== productId) return;
      try {
        const summary = await getProductReviewSummary(productId);
        setRating(summary.averageRating);
        setReviewCount(summary.reviewCount);
      } catch {
        // silently ignore — display stays as-is
      }
    });
  }, [productId]);

  // No reviews yet: nothing to show here (the reviews section says so) — no row of empty stars.
  if (reviewCount <= 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StarRating rating={rating ?? 0} size="sm" />
      <p className="text-[13px] leading-[18px] text-[#536471] dark:text-[#71767B]">
        <span className="font-semibold text-[#0F1419] dark:text-[#E7E9EA]">{rating?.toFixed(1)}</span>
        {' · '}
        {reviewCount} {t('review')}{reviewCount === 1 ? '' : 's'}
      </p>
    </div>
  );
}
