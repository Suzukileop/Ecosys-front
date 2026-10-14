'use client';

import { trPlural } from '@/lib/i18n/active';
import { useState } from 'react';
import Link from 'next/link';
import { voteProductReviewHelpful, deleteProductReview } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { StarRating } from '@/components/marketplace/StarRating';
import { AvatarImage } from '@/components/ui/PersonAvatar';
import { useAuth } from '@/context/AuthContext';
import type { ProductReview } from '@/types/marketplace';
import { formatCompactDate } from '@/components/marketplace/product-relative-date';
import { useT } from '@/lib/i18n/I18nProvider';

type ProductReviewCardProps = {
  review: ProductReview;
  loginRedirect: string;
  onUpdated: (review: ProductReview) => void;
  onDeleted?: (reviewId: string) => void;
};

function formatReviewDate(value: string): string {
  return formatCompactDate(value);
}

export function ProductReviewCard({ review, loginRedirect, onUpdated, onDeleted }: ProductReviewCardProps) {
  const t = useT();
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
      setError(getApiErrorMessage(e, t('Unable to record your vote.')));
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
      setError(getApiErrorMessage(e, t('Unable to delete your review.')));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="!rounded-none !bg-transparent py-4">
      <div className="flex items-start gap-3.5">
        <AvatarImage
          src={review.userAvatarUrl}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
          fallback={
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--gn-inset)] text-[13px] font-semibold text-[color:var(--gn-ink)]">
              {review.userName.slice(0, 2).toUpperCase()}
            </div>
          }
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="text-[15px] font-bold leading-5 text-[color:var(--gn-ink)]">{review.userName}</p>
            <div className="flex items-center gap-3">
              <time className="text-[13px] text-[color:var(--gn-ink2)]" dateTime={review.createdAt}>
                {formatReviewDate(review.createdAt)}
              </time>
              {isOwnReview && (
                <button
                  type="button"
                  onClick={() => void onDelete()}
                  disabled={deleting}
                  className="text-[13px] font-semibold text-[#F4212E] hover:underline disabled:opacity-50"
                >
                  {deleting ? t('Deleting…') : t('Delete')}
                </button>
              )}
            </div>
          </div>

          <div className="mt-1.5">
            <StarRating rating={review.rating} />
          </div>

          {review.comment ? (
            <p className="mt-2 text-[15px] leading-[22px] text-[color:var(--gn-ink)]">{review.comment}</p>
          ) : (
            <p className="mt-2 text-[15px] text-[color:var(--gn-ink3)]">{t('No written review.')}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-[13px] text-[color:var(--gn-ink2)]">{t('Helpful?')}</span>
            {!user ? (
              <Link
                href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}
                className="text-[13px] font-medium text-[#111111] underline-offset-4 hover:underline dark:text-white"
              >
                {t('Sign in to vote')}
              </Link>
            ) : isOwnReview ? (
              <span className="text-[13px] text-neutral-400 dark:text-neutral-500">{t('This is your review.')}</span>
            ) : !isClient ? (
              <span className="text-[13px] text-neutral-400 dark:text-neutral-500">
                {t('Only client accounts can vote on reviews.')}
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
                      className={`h-8 rounded-full px-3.5 text-[13px] font-semibold transition-colors disabled:opacity-50 ${
                        active
                          ? 'bg-[color:var(--gn-primary)] text-[color:var(--gn-primary-ink)]'
                          : 'bg-[color:var(--gn-inset)] text-[color:var(--gn-ink)] hover:bg-[color:var(--gn-hover)]'
                      }`}
                    >
                      {helpful ? t('Yes') : t('No')}
                    </button>
                  );
                })}
              </>
            )}
            {review.helpfulYesCount > 0 && (
              <span className="text-[13px] text-neutral-400 dark:text-neutral-500">
                {review.helpfulYesCount} {trPlural(review.helpfulYesCount, 'person', 'people')} {t('found this helpful')}
              </span>
            )}
          </div>
          {error && <p className="mt-2 text-[13px] text-[#F4212E]">{error}</p>}
        </div>
      </div>
    </article>
  );
}
