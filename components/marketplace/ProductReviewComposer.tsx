'use client';

import { useCallback, useEffect, useState } from 'react';
import { getMyProductReviewStatus, submitProductReview } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { StarRatingInput } from '@/components/marketplace/StarRatingInput';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { useAuth } from '@/context/AuthContext';

type ProductReviewComposerProps = {
  productId: string;
  onSubmitted?: () => void;
};

const SKELETON = 'animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]';

function ReviewComposerSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className={`h-4 w-36 ${SKELETON}`} />
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className={`h-6 w-6 ${SKELETON}`} />
        ))}
      </div>
      <div className={`h-24 w-full rounded-lg ${SKELETON}`} />
      <div className={`h-10 w-28 rounded-lg ${SKELETON}`} />
    </div>
  );
}

export function ProductReviewComposer({ productId, onSubmitted }: ProductReviewComposerProps) {
  const { hasRole, user, isLoading: authLoading } = useAuth();
  const isClient = hasRole('ROLE_CREATOR');

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewsPostedToday, setReviewsPostedToday] = useState(0);
  const [dailyReviewLimit, setDailyReviewLimit] = useState(3);
  const [canPostReviewToday, setCanPostReviewToday] = useState(true);

  const loadStatus = useCallback(async () => {
    if (authLoading) {
      return;
    }
    if (!isClient || !user) {
      setLoading(false);
      return;
    }
    try {
      const status = await getMyProductReviewStatus(productId);
      if (status) {
        setReviewsPostedToday(status.reviewsPostedToday);
        setDailyReviewLimit(status.dailyReviewLimit);
        setCanPostReviewToday(status.canPostReviewToday);
      } else {
        setReviewsPostedToday(0);
        setDailyReviewLimit(3);
        setCanPostReviewToday(true);
      }
      setRating(0);
      setComment('');
    } catch {
      // optional
    } finally {
      setLoading(false);
    }
  }, [productId, isClient, user, authLoading]);

  useEffect(() => {
    const t = setTimeout(() => void loadStatus(), 0);
    return () => clearTimeout(t);
  }, [loadStatus]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPostReviewToday) {
      setError(`You can post up to ${dailyReviewLimit} reviews per day for this product.`);
      return;
    }
    if (rating < 1) {
      setError('Please select a star rating.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await submitProductReview(productId, {
        rating,
        comment: comment.trim() || undefined,
      });
      setRating(0);
      setComment('');
      await loadStatus();
      onSubmitted?.();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to save your review.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <ReviewComposerSkeleton />;
  }

  if (!user) {
    return (
      <p className="text-[15px] text-neutral-500 dark:text-neutral-400">
        Sign in as a client to rate this product.
      </p>
    );
  }

  if (!isClient) {
    return (
      <p className="text-[15px] text-neutral-500 dark:text-neutral-400">
        Only client accounts can leave product reviews.
      </p>
    );
  }

  const remainingToday = Math.max(0, dailyReviewLimit - reviewsPostedToday);

  return (
    <div className="space-y-4">
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <div className="space-y-1">
          <p className="text-base font-semibold text-[#111111] dark:text-white">Write a review</p>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
            {canPostReviewToday
              ? `${remainingToday} of ${dailyReviewLimit} reviews remaining today. Your latest review sets your rating for this product.`
              : `Daily limit reached (${dailyReviewLimit}/${dailyReviewLimit}). You can post again tomorrow.`}
          </p>
        </div>
        <StarRatingInput value={rating} onChange={setRating} disabled={submitting || !canPostReviewToday} />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Describe your experience with this product…"
          className="w-full rounded-lg border border-black/[0.1] bg-transparent px-3.5 py-3 text-[15px] text-[#111111] outline-none transition placeholder:text-neutral-400 focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 disabled:opacity-60 dark:border-white/[0.14] dark:text-white"
          disabled={submitting || !canPostReviewToday}
        />
        <button
          type="submit"
          disabled={submitting || !canPostReviewToday}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#111111] px-5 text-[15px] font-medium text-white transition hover:bg-black disabled:opacity-60 dark:bg-white dark:text-[#111111] dark:hover:bg-neutral-200"
        >
          {submitting ? 'Posting…' : 'Post review'}
        </button>
      </form>
    </div>
  );
}
