'use client';

import type { CreatorReputationDto } from '@/types/ecosystem';
import {
  profileSectionEmptyClass,
  profileSectionFieldClass,
  profileSectionHeaderDescClass,
  profileSectionHeaderTitleClass,
  profileSectionLabelClass,
  profileSectionMutedTextClass,
  profileSectionValueClass,
} from '@/components/creator/studio/profile-section-ui';

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-current' : 'fill-none stroke-current'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.176 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.047 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
        </svg>
      ))}
    </span>
  );
}

export function CreatorReputationPanel({
  reputation,
  showHeader = true,
}: {
  reputation: CreatorReputationDto | null | undefined;
  showHeader?: boolean;
}) {
  const { averageRating, reviewCount, recommendPercent, trustBadges, recentReviews } = reputation ?? {
    averageRating: null,
    reviewCount: 0,
    recommendPercent: 0,
    trustBadges: [] as string[],
    recentReviews: [],
    ratingDistribution: {},
  };

  return (
    <div className="space-y-4">
      {showHeader && (
        <div>
          <h2 className={profileSectionHeaderTitleClass}>Reputation</h2>
          <p className={profileSectionHeaderDescClass}>
            Ratings and feedback from users who interacted with your creator profile.
          </p>
        </div>
      )}

      {reviewCount === 0 ? (
        <p className={`rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 dark:border-neutral-700 dark:bg-neutral-950 ${profileSectionEmptyClass}`}>
          No reviews yet. Once clients rate your profile, your score and trust badges will appear here.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className={profileSectionFieldClass}>
              <p className={profileSectionLabelClass}>Overall rating</p>
              <div className="mt-2 flex items-center gap-2">
                <Stars rating={averageRating ?? 0} />
                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                  {averageRating?.toFixed(1) ?? '—'}/5
                </span>
              </div>
            </div>
            <div className={profileSectionFieldClass}>
              <p className={profileSectionLabelClass}>Reviews</p>
              <p className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">{reviewCount}</p>
              <p className={profileSectionMutedTextClass}>based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
            </div>
            <div className={profileSectionFieldClass}>
              <p className={profileSectionLabelClass}>Recommendation</p>
              <p className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">{recommendPercent}%</p>
              <p className={profileSectionMutedTextClass}>would recommend this creator</p>
            </div>
          </div>

          {trustBadges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {recentReviews.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white">Recent reviews</h3>
              {recentReviews.map((review) => (
                <article key={review.id} className={profileSectionFieldClass}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[15px] font-semibold text-neutral-900 dark:text-white">{review.reviewerName}</p>
                    <div className={`flex items-center gap-2 ${profileSectionMutedTextClass}`}>
                      <Stars rating={review.rating} />
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className={`${profileSectionValueClass} mt-2`}>{review.comment}</p>
                  )}
                  <p className={`mt-2 ${profileSectionMutedTextClass}`}>
                    {review.wouldRecommend ? 'Recommends this creator' : 'Does not recommend'}
                  </p>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
