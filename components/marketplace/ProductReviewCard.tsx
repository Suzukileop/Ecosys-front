'use client';

import { useState } from 'react';
import Link from 'next/link';
import { voteProductReviewHelpful, deleteProductReview } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { StarRating } from '@/components/marketplace/StarRating';
import { useAuth } from '@/context/AuthContext';
import type { ProductReview } from '@/types/marketplace';

type ProductReviewCardProps = {
  review: ProductReview;
  loginRedirect: string;
  onUpdated: (review: ProductReview) => void;
  onDeleted?: (reviewId: string) => void;
};

function formatReviewDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ProductReviewCard({ review, loginRedirect, onUpdated, onDeleted }: ProductReviewCardProps) {
  const { user, hasRole } = useAuth();
  const isClient = hasRole('ROLE_CREATOR');
  const isOwnReview = user?.id === review.userId;
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onVote = async (helpful: boolean) => {
    if (!user || !isClient || isOwnReview) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await voteProductReviewHelpful(review.id, helpful);
      onUpdated(updated);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to record your vote.'));
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!isOwnReview || deleting) return;
    if (!window.confirm('Delete this review? Your product rating will update to your previous review if you have one.')) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await deleteProductReview(review.id);
      onDeleted?.(review.id);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to delete your review.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="border-b border-gray-100 py-5 last:border-b-0 dark:border-neutral-800">
      <div className="flex items-start gap-3">
        {review.userAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.userAvatarUrl}
            alt=""
            className="h-11 w-11 rounded-full object-cover ring-2 ring-white dark:ring-neutral-800"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-800 dark:bg-orange-500/20 dark:text-orange-200">
            {review.userName.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-semibold text-gray-900 dark:text-white">{review.userName}</p>
            <time className="text-xs text-gray-500 dark:text-gray-400" dateTime={review.createdAt}>
              {formatReviewDate(review.createdAt)}
            </time>
            {isOwnReview && (
              <button
                type="button"
                onClick={() => void onDelete()}
                disabled={deleting}
                className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
          </div>

          <div className="mt-1">
            <StarRating rating={review.rating} size="md" />
          </div>

          {review.comment ? (
            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {review.comment}
            </p>
          ) : (
            <p className="mt-3 text-sm italic text-gray-500 dark:text-gray-400">No written review.</p>
          )}

          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Did you find this review helpful?
            </p>
            {!user ? (
              <Link
                href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}
                className="mt-2 inline-block text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                Sign in to vote
              </Link>
            ) : isOwnReview ? (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">This is your review.</p>
            ) : !isClient ? (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Only client accounts can vote on reviews.
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onVote(true)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                    review.userHelpfulVote === true
                      ? 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-200'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-200'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onVote(false)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                    review.userHelpfulVote === false
                      ? 'border-gray-400 bg-gray-100 text-gray-900 dark:border-neutral-500 dark:bg-neutral-700 dark:text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-200'
                  }`}
                >
                  No
                </button>
                {review.helpfulYesCount > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {review.helpfulYesCount}{' '}
                    {review.helpfulYesCount === 1 ? 'person' : 'people'} found this helpful
                  </span>
                )}
              </div>
            )}
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>
        </div>
      </div>
    </article>
  );
}
