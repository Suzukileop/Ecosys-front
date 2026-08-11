'use client';

import { StarRating } from '@/components/marketplace/StarRating';
import type { ProductReviewSummary } from '@/types/marketplace';

type ProductReviewDistributionChartProps = {
  summary: ProductReviewSummary;
  loading?: boolean;
};

const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

function countForStar(summary: ProductReviewSummary, star: (typeof STAR_LEVELS)[number]) {
  switch (star) {
    case 5:
      return summary.rating5Count;
    case 4:
      return summary.rating4Count;
    case 3:
      return summary.rating3Count;
    case 2:
      return summary.rating2Count;
    case 1:
      return summary.rating1Count;
    default:
      return 0;
  }
}

function DistributionSkeleton() {
  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12" aria-hidden>
      <div className="flex flex-col items-center gap-3 sm:items-start">
        <div className="h-14 w-20 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
        <div className="h-5 w-28 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
      </div>
      <div className="flex-1 space-y-3">
        {STAR_LEVELS.map((star) => (
          <div key={star} className="flex items-center gap-3">
            <div className="h-4 w-3 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
            <div className="h-2.5 flex-1 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductReviewDistributionChart({
  summary,
  loading = false,
}: ProductReviewDistributionChartProps) {
  if (loading) {
    return <DistributionSkeleton />;
  }

  if (summary.reviewCount === 0) {
    return null;
  }

  const average = summary.averageRating ?? 0;

  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12">
      <div className="flex shrink-0 flex-col items-center gap-2 sm:items-start">
        <p className="text-5xl font-bold leading-none tracking-tight text-gray-900 dark:text-white">
          {average.toFixed(1)}
        </p>
        <StarRating rating={average} size="md" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {summary.reviewCount.toLocaleString()} review{summary.reviewCount === 1 ? '' : 's'}
        </p>
      </div>

      <div className="min-w-0 flex-1 space-y-2.5">
        {STAR_LEVELS.map((star) => {
          const count = countForStar(summary, star);
          const percent =
            summary.reviewCount > 0 ? Math.round((count / summary.reviewCount) * 100) : 0;

          return (
            <div key={star} className="flex items-center gap-3">
              <span className="w-3 shrink-0 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {star}
              </span>
              <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-700">
                <div
                  className="h-full rounded-full bg-orange-500 transition-[width] duration-500 ease-out dark:bg-orange-400"
                  style={{ width: `${percent}%` }}
                  role="presentation"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
