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

const SKELETON = 'animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]';

function DistributionSkeleton() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-12" aria-hidden>
      <div className="shrink-0 space-y-3">
        <div className={`h-11 w-20 ${SKELETON}`} />
        <div className={`h-4 w-28 ${SKELETON}`} />
      </div>
      <div className="min-w-0 flex-1 space-y-3 sm:max-w-md">
        {STAR_LEVELS.map((star) => (
          <div key={star} className="flex items-center gap-3">
            <div className={`h-3 w-3 ${SKELETON}`} />
            <div className={`h-1.5 flex-1 rounded-full ${SKELETON}`} />
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
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-12">
      <div className="shrink-0">
        <div className="flex items-baseline gap-1.5">
          <p className="text-[44px] font-semibold leading-none tracking-[-0.03em] text-[#111111] tabular-nums dark:text-white">
            {average.toFixed(1)}
          </p>
          <span className="text-[15px] text-neutral-400 dark:text-neutral-500">/ 5</span>
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          <StarRating rating={average} />
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {summary.reviewCount.toLocaleString()} review{summary.reviewCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <dl className="min-w-0 flex-1 space-y-2.5 sm:max-w-md">
        {STAR_LEVELS.map((star) => {
          const count = countForStar(summary, star);
          const percent =
            summary.reviewCount > 0 ? Math.round((count / summary.reviewCount) * 100) : 0;

          return (
            <div key={star} className="flex items-center gap-3">
              <dt className="w-3 shrink-0 text-center text-[13px] font-medium text-neutral-500 tabular-nums dark:text-neutral-400">
                {star}
              </dt>
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-[#111111] transition-[width] duration-500 ease-out dark:bg-white"
                  style={{ width: `${percent}%` }}
                  role="presentation"
                />
              </div>
              <dd className="w-8 shrink-0 text-right text-[13px] text-neutral-400 tabular-nums dark:text-neutral-500">
                {count.toLocaleString()}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
