'use client';

import { useCallback, useEffect, useState } from 'react';
import { StarRating } from '@/components/marketplace/StarRating';
import { CreatorReviewModal, CreatorReviewTriggerButton } from '@/components/marketplace/CreatorReviewModal';
import {
  formatFrenchCount,
} from '@/components/marketplace/creator-profile-trust-metrics';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getCreatorReputation } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { formatRelativeDateFrench, initialsFromName } from '@/lib/profile-format';
import type { CreatorReputationDto } from '@/types/ecosystem';
import type { CreatorReviewItem } from '@/types/ecosystem';

const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

type CreatorProfileReviewsTabProps = {
  creatorId: string;
  creatorName: string;
};

function countForStar(distribution: Record<number, number> | undefined, star: number) {
  return distribution?.[star] ?? 0;
}

function totalFromDistribution(distribution: Record<number, number> | undefined): number {
  if (!distribution) return 0;
  return STAR_LEVELS.reduce((sum, star) => sum + countForStar(distribution, star), 0);
}

function ReviewCard({ review }: { review: CreatorReviewItem }) {
  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-800 dark:bg-orange-500/20 dark:text-orange-200">
          {initialsFromName(review.reviewerName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-semibold text-neutral-900 dark:text-white">{review.reviewerName}</p>
            <time className="text-xs text-neutral-500" dateTime={review.createdAt}>
              {formatRelativeDateFrench(review.createdAt)}
            </time>
          </div>
          <div className="mt-1">
            <StarRating rating={review.rating} size="sm" />
          </div>
          {review.comment ? (
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {review.comment}
            </p>
          ) : (
            <p className="mt-2 text-sm italic text-neutral-400">Avis sans commentaire.</p>
          )}
        </div>
      </div>
    </article>
  );
}

export function CreatorProfileReviewsTab({ creatorId, creatorName }: CreatorProfileReviewsTabProps) {
  const [reputation, setReputation] = useState<CreatorReputationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCreatorReputation(creatorId);
      setReputation(data);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de charger les avis.'));
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  const reviewCount = reputation?.reviewCount ?? 0;
  const distribution = reputation?.ratingDistribution as Record<number, number> | undefined;
  const totalDist = totalFromDistribution(distribution);
  const hasAverage = reputation?.averageRating != null && reviewCount > 0;
  const reviews = reputation?.recentReviews ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Réputation & avis</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Indicateurs de confiance et retours des clients sur ce créateur.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-2 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Synthèse</h3>
            {reviewSubmitted ? (
              <p className="max-w-[9rem] text-right text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Avis publié
              </p>
            ) : (
              <CreatorReviewTriggerButton
                creatorId={creatorId}
                onClick={() => setReviewModalOpen(true)}
              />
            )}
          </div>
          {hasAverage ? (
            <div className="mt-4 flex flex-col items-start gap-2">
              <p className="text-4xl font-bold text-neutral-900 dark:text-white">
                {reputation!.averageRating!.toFixed(1)}
              </p>
              <StarRating rating={reputation!.averageRating!} size="md" />
              <p className="text-sm text-neutral-500">
                {formatFrenchCount(reviewCount)} avis client{reviewCount !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-neutral-500">Aucun avis pour le moment.</p>
          )}

          {totalDist > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Répartition
              </p>
              {STAR_LEVELS.map((star) => {
                const count = countForStar(distribution, star);
                const percent = Math.round((count / totalDist) * 100);
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-3 shrink-0 text-center text-sm text-neutral-500">{star}</span>
                    <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-orange-500 transition-[width]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs text-neutral-500">{count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {(reputation?.trustBadges?.length ?? 0) > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {reputation!.trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-800 dark:bg-orange-500/10 dark:text-orange-300"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-span-3">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Avis récents
            {reviewCount > 0 ? ` (${formatFrenchCount(reviewCount)})` : ''}
          </h3>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/50">
              Soyez le premier à laisser un avis sur {creatorName}.
            </p>
          )}
        </div>
      </div>

      <CreatorReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        creatorId={creatorId}
        creatorName={creatorName}
        onSubmitted={() => {
          setReviewSubmitted(true);
          void load();
        }}
      />
    </div>
  );
}
