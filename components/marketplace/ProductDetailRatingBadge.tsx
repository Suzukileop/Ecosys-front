'use client';

import { useEffect, useState } from 'react';
import { StarRating } from '@/components/marketplace/StarRating';
import { getProductReviewSummary } from '@/lib/marketplace-api';
import { subscribeRatingUpdated } from '@/lib/ratingBus';

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

  return (
    <div className="flex flex-wrap items-center gap-3">
      <StarRating rating={rating ?? 0} size="md" />
      {reviewCount > 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">
            {rating?.toFixed(1)}
          </span>
          {' · '}
          {reviewCount} customer review{reviewCount === 1 ? '' : 's'}
        </p>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No customer ratings yet
        </p>
      )}
    </div>
  );
}
