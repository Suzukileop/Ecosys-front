'use client';

import { useCallback, useEffect, useState } from 'react';
import { getMyProductReviewStatus, submitProductReview } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { StarRatingInput } from '@/components/marketplace/StarRatingInput';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/lib/i18n/I18nProvider';

type ProductReviewComposerProps = {
  productId: string;
  onSubmitted?: () => void;
};

const SKELETON = 'animate-pulse bg-[color:var(--gn-inset)]';

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
  const t = useT();
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
      setError(t('Please select a star rating.'));
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
      setError(getApiErrorMessage(e, t('Unable to save your review.')));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <ReviewComposerSkeleton />;
  }

  if (!user) {
    return (
      <p className="text-[15px] text-[color:var(--gn-ink2)]">
        {t('Sign in as a client to rate this product.')}
      </p>
    );
  }

  // Creator accounts cannot review: render nothing (the wrapper hides itself when empty).
  if (!isClient) return null;

  const remainingToday = Math.max(0, dailyReviewLimit - reviewsPostedToday);

  return (
    <div className="space-y-4">
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <div className="space-y-1">
          <p className="text-[17px] font-bold leading-[22px] text-[color:var(--gn-ink)]">{t('Write a review')}</p>
          <p className="text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
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
          placeholder={t('Describe your experience with this product…')}
          className="w-full border-0 bg-[color:var(--gn-inset)] px-4 py-3 text-[15px] text-[color:var(--gn-ink)] outline-none transition placeholder:text-[color:var(--gn-ink3)] focus:shadow-[inset_0_0_0_2px_var(--gn-ink)] disabled:opacity-60"
          disabled={submitting || !canPostReviewToday}
        />
        <button
          type="submit"
          disabled={submitting || !canPostReviewToday}
          className="inline-flex h-10 items-center justify-center rounded-full bg-[color:var(--gn-primary)] px-6 text-[15px] font-bold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] disabled:opacity-50"
        >
          {submitting ? t('Posting…') : t('Post review')}
        </button>
      </form>
    </div>
  );
}
