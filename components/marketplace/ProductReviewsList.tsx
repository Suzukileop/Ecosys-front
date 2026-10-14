'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getProductReviewSummary, listProductReviews } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { emitRatingUpdated } from '@/lib/ratingBus';
import { ProductReviewCard } from '@/components/marketplace/ProductReviewCard';
import { ProductReviewDistributionChart } from '@/components/marketplace/ProductReviewDistributionChart';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import type { ProductReview, ProductReviewSummary } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

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

const SKELETON = 'animate-pulse bg-[color:var(--gn-inset)]';

function ReviewCardSkeleton() {
  return (
    <div className="py-6">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 shrink-0 rounded-full ${SKELETON}`} />
        <div className="space-y-2">
          <div className={`h-4 w-32 ${SKELETON}`} />
          <div className={`h-3 w-24 ${SKELETON}`} />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className={`h-3 w-full ${SKELETON}`} />
        <div className={`h-3 w-4/5 ${SKELETON}`} />
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
  const t = useT();
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
          setError(getApiErrorMessage(e, t('Unable to load reviews.')));
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
  }, [loadPage, loadSummary, refreshKey, t]);

  const onLoadMore = async () => {
    try {
      setLoadingMore(true);
      await loadPage(page + 1, true);
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to load more reviews.')));
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
    <section>
      <h2 className="px-4 text-[17px] font-bold leading-[22px] tracking-[-0.01em] text-[color:var(--gn-ink)] sm:px-0">
        {t('Reviews')}
      </h2>

      {error && (
        <div className="mt-3 px-4 sm:mt-4 sm:px-0">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {!loading && reviews.length === 0 && summary.reviewCount === 0 ? (
        <div className="mt-3 bg-[color:var(--gn-surface)] px-6 py-10 text-center sm:mt-4">
          <p className="text-[17px] font-bold leading-[22px] text-[color:var(--gn-ink)]">{t('No reviews yet')}</p>
          <p className="mt-1 text-[15px] leading-5 text-[color:var(--gn-ink2)]">
            {t('Be the first to share your experience.')}
          </p>
        </div>
      ) : (
        <div className="mt-3 bg-[color:var(--gn-surface)] sm:mt-4">
          <div>
            <div className="p-5 sm:p-6">
              <ProductReviewDistributionChart summary={summary} loading={summaryLoading} />
            </div>

            <div className="min-w-0 space-y-2 px-5 pb-2 sm:px-6">
              {loading && reviews.length === 0
                ? Array.from({ length: Math.min(Math.max(initialReviewCount, 1), 3) }, (_, index) => (
                    <ReviewCardSkeleton key={index} />
                  ))
                : reviews.map((review) => (
                    <ProductReviewCard
                      key={review.id}
                      review={review}
                      loginRedirect={loginRedirect}
                      onUpdated={onReviewUpdated}
                      onDeleted={(reviewId) => void onReviewDeleted(reviewId)}
                    />
                  ))}
              {hasMore && (
                <div className="py-5 text-center">
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={() => void onLoadMore()}
                    className="h-10 border border-[#CFD9DE] px-5 text-[14px] font-bold text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover)] disabled:opacity-60 dark:border-[#536471]"
                  >
                    {loadingMore ? t('Loading…') : t('Load more reviews')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
