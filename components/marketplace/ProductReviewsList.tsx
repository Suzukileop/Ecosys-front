'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getProductReviewSummary, listProductReviews } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { emitRatingUpdated } from '@/lib/ratingBus';
import { ProductReviewCard } from '@/components/marketplace/ProductReviewCard';
import { ProductReviewDistributionChart } from '@/components/marketplace/ProductReviewDistributionChart';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import type { ProductReview, ProductReviewSummary } from '@/types/marketplace';

const REVIEWS_PAGE_SIZE = 20;

const EMPTY_SUMMARY: ProductReviewSummary = {
  averageRating: null,
  reviewCount: 0,
  rating5Count: 0,
  rating4Count: 0,
  rating3Count: 0,
  rating2Count: 0,
  rating1Count: 0,
};

function ReviewCardSkeleton() {
  return (
    <div className="border-b border-gray-100 py-6 last:border-b-0 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700" />
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
          <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
      </div>
    </div>
  );
}

function buildInitialSummary(
  reviewCount: number,
  averageRating?: number | null
): ProductReviewSummary {
  return {
    ...EMPTY_SUMMARY,
    reviewCount,
    averageRating: averageRating ?? null,
  };
}

type ProductReviewsListProps = {
  productId: string;
  loginRedirect: string;
  refreshKey?: number;
  initialReviewCount?: number;
  initialAverageRating?: number | null;
  /** When provided (from /init batch), the summary fetch is skipped on first load */
  prefetchedSummary?: ProductReviewSummary | null;
};

export function ProductReviewsList({
  productId,
  loginRedirect,
  refreshKey = 0,
  initialReviewCount = 0,
  initialAverageRating,
  prefetchedSummary,
}: ProductReviewsListProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(!prefetchedSummary);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [summary, setSummary] = useState<ProductReviewSummary>(() =>
    prefetchedSummary ?? buildInitialSummary(initialReviewCount, initialAverageRating)
  );
  const hasLoadedOnceRef = useRef(false);
  const hasPrefetchedSummaryRef = useRef(Boolean(prefetchedSummary));

  const loadSummary = useCallback(async () => {
    if (hasPrefetchedSummaryRef.current && !hasLoadedOnceRef.current) {
      // Skip on first mount — data already provided via prefetchedSummary
      return;
    }
    const data = await getProductReviewSummary(productId);
    setSummary(data);
  }, [productId]);

  const loadPage = useCallback(
    async (pageToLoad: number, append: boolean) => {
      const data = await listProductReviews(productId, pageToLoad, REVIEWS_PAGE_SIZE);
      setReviews((prev) => (append ? [...prev, ...data.content] : data.content));
      setHasMore(!data.last);
      setPage(pageToLoad);
    },
    [productId]
  );

  useEffect(() => {
    let cancelled = false;
    const showInitialLoading = !hasLoadedOnceRef.current;
    void (async () => {
      try {
        if (showInitialLoading) {
          setLoading(true);
          if (!hasPrefetchedSummaryRef.current) {
            setSummaryLoading(true);
          }
        }
        setError(null);
        await Promise.all([loadSummary(), loadPage(0, false)]);
      } catch (e) {
        if (!cancelled) {
          setError(getApiErrorMessage(e, 'Unable to load reviews.'));
        }
      } finally {
        if (!cancelled) {
          hasLoadedOnceRef.current = true;
          setLoading(false);
          setSummaryLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPage, loadSummary, refreshKey]);

  const onLoadMore = async () => {
    try {
      setLoadingMore(true);
      await loadPage(page + 1, true);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load more reviews.'));
    } finally {
      setLoadingMore(false);
    }
  };

  const onReviewUpdated = (updated: ProductReview) => {
    setReviews((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const onReviewDeleted = async (reviewId: string) => {
    setReviews((prev) => prev.filter((item) => item.id !== reviewId));
    emitRatingUpdated(productId);
    try {
      const data = await getProductReviewSummary(productId);
      setSummary(data);
    } catch {
      // list already updated optimistically
    }
  };

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All customer reviews</h2>

      <ProductReviewDistributionChart summary={summary} loading={summaryLoading} />

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {loading && reviews.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 dark:border-neutral-700 dark:bg-neutral-900">
          {Array.from({ length: Math.min(Math.max(initialReviewCount, 1), 3) }, (_, index) => (
            <ReviewCardSkeleton key={index} />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-neutral-700 dark:text-gray-400">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 dark:border-neutral-700 dark:bg-neutral-900">
          {reviews.map((review) => (
            <ProductReviewCard
              key={review.id}
              review={review}
              loginRedirect={loginRedirect}
              onUpdated={onReviewUpdated}
              onDeleted={(reviewId) => void onReviewDeleted(reviewId)}
            />
          ))}
          {hasMore && (
            <div className="border-t border-gray-100 py-4 text-center dark:border-neutral-800">
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => void onLoadMore()}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-orange-200 hover:bg-orange-50 disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-200"
              >
                {loadingMore ? 'Loading…' : 'Load more reviews'}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
