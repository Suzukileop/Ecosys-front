'use client';

import { useState } from 'react';
import Link from 'next/link';
import { voteProductReviewHelpful, deleteProductReview } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { StarRating } from '@/components/marketplace/StarRating';
import { AvatarImage } from '@/components/ui/PersonAvatar';
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
    <article className="py-6">
      <div className="flex items-start gap-3.5">
        <AvatarImage
          src={review.userAvatarUrl}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
          fallback={
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-[13px] font-semibold text-[#111111] dark:bg-white/[0.08] dark:text-white">
              {review.userName.slice(0, 2).toUpperCase()}
            </div>
          }
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="text-[15px] font-semibold text-[#111111] dark:text-white">{review.userName}</p>
            <div className="flex items-center gap-3">
              <time className="text-[13px] text-neutral-400 dark:text-neutral-500" dateTime={review.createdAt}>
                {formatReviewDate(review.createdAt)}
              </time>
              {isOwnReview && (
                <button
                  type="button"
                  onClick={() => void onDelete()}
                  disabled={deleting}
                  className="text-[13px] font-medium text-[#E0431A] hover:underline disabled:opacity-50 dark:text-[#FF7A52]"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              )}
            </div>
          </div>

          <div className="mt-1.5">
            <StarRating rating={review.rating} />
          </div>

          {review.comment ? (
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">{review.comment}</p>
          ) : (
            <p className="mt-3 text-[15px] italic text-neutral-400 dark:text-neutral-500">No written review.</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-[13px] text-neutral-500 dark:text-neutral-400">Helpful?</span>
            {!user ? (
              <Link
                href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}
                className="text-[13px] font-medium text-[#111111] underline-offset-4 hover:underline dark:text-white"
              >
                Sign in to vote
              </Link>
            ) : isOwnReview ? (
              <span className="text-[13px] text-neutral-400 dark:text-neutral-500">This is your review.</span>
            ) : !isClient ? (
              <span className="text-[13px] text-neutral-400 dark:text-neutral-500">
                Only client accounts can vote on reviews.
              </span>
            ) : (
              <>
                {([true, false] as const).map((helpful) => {
                  const active = review.userHelpfulVote === helpful;
                  return (
                    <button
                      key={String(helpful)}
                      type="button"
                      disabled={busy}
                      aria-pressed={active}
                      onClick={() => void onVote(helpful)}
                      className={`h-8 rounded-full border px-3.5 text-[13px] font-medium transition disabled:opacity-50 ${
                        active
                          ? 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-[#111111]'
                          : 'border-black/[0.1] text-neutral-700 hover:border-black/[0.25] dark:border-white/[0.14] dark:text-neutral-200 dark:hover:border-white/[0.3]'
                      }`}
                    >
                      {helpful ? 'Yes' : 'No'}
                    </button>
                  );
                })}
              </>
            )}
            {review.helpfulYesCount > 0 && (
              <span className="text-[13px] text-neutral-400 dark:text-neutral-500">
                {review.helpfulYesCount} {review.helpfulYesCount === 1 ? 'person' : 'people'} found this helpful
              </span>
            )}
          </div>
          {error && <p className="mt-2 text-sm text-[#E0431A] dark:text-[#FF7A52]">{error}</p>}
        </div>
      </div>
    </article>
  );
}
