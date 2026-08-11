'use client';

import type { CreatorReputationDto, CreatorReviewItem } from '@/types/ecosystem';
import type { ContactVisibilityLevel } from '@/lib/contact-visibility';
import { PortfolioFlatField } from '@/components/portfolio/PortfolioInformationChrome';

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

function RecentReviewBlock({ review }: { review: CreatorReviewItem }) {
  return (
    <article className="divide-y divide-neutral-200/50 dark:divide-white/[0.06]">
      <PortfolioFlatField label="Reviewer" value={review.reviewerName} className="!py-4" />
      <div className="grid items-start gap-x-8 sm:grid-cols-2">
        <PortfolioFlatField label="Rating" className="!py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Stars rating={review.rating} />
            <span className="text-[15px] font-semibold text-neutral-900 dark:text-white">
              {review.rating.toFixed(1)}/5
            </span>
          </div>
        </PortfolioFlatField>
        <PortfolioFlatField
          label="Date"
          value={new Date(review.createdAt).toLocaleDateString()}
          className="!py-4"
        />
      </div>
      <PortfolioFlatField
        label="Comment"
        value={review.comment}
        emptyLabel="No comment"
        muted={!review.comment?.trim()}
        className="!py-4"
      />
      <PortfolioFlatField
        label="Would recommend"
        value={review.wouldRecommend ? 'Recommends this creator' : 'Does not recommend'}
        muted={!review.wouldRecommend}
        className="!py-4"
      />
    </article>
  );
}

export function PortfolioReputationChrome({
  reputation,
  actionsVisible = false,
  visibility,
  onVisibilityChange,
}: {
  reputation: CreatorReputationDto | null | undefined;
  actionsVisible?: boolean;
  visibility?: ContactVisibilityLevel;
  onVisibilityChange?: (value: ContactVisibilityLevel) => void;
}) {
  const { averageRating, reviewCount, recommendPercent, trustBadges, recentReviews } = reputation ?? {
    averageRating: null,
    reviewCount: 0,
    recommendPercent: 0,
    trustBadges: [] as string[],
    recentReviews: [] as CreatorReviewItem[],
  };

  const showVisibility = Boolean(actionsVisible && visibility && onVisibilityChange);

  if (reviewCount === 0) {
    return (
      <div>
        {showVisibility ? (
          <div className="divide-y divide-neutral-200/50 dark:divide-white/[0.06]">
            <PortfolioFlatField
              label="Overall rating"
              emptyLabel="No reviews yet"
              muted
              showVisibility
              visibility={visibility}
              onVisibilityChange={onVisibilityChange}
            />
          </div>
        ) : null}
        <p className="py-10 text-center text-sm italic text-neutral-500 dark:text-neutral-400">
          No reviews yet. Once clients rate your profile, your score and feedback will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="divide-y divide-neutral-200/50 dark:divide-white/[0.06]">
        <div className="grid items-start gap-x-8 sm:grid-cols-3">
          <PortfolioFlatField
            label="Overall rating"
            showVisibility={showVisibility}
            visibility={visibility}
            onVisibilityChange={onVisibilityChange}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Stars rating={averageRating ?? 0} />
              <span className="text-xl font-bold text-neutral-900 dark:text-white">
                {averageRating?.toFixed(1) ?? '—'}/5
              </span>
            </div>
          </PortfolioFlatField>
          <PortfolioFlatField label="Reviews">
            <div>
              <p className="text-xl font-bold text-neutral-900 dark:text-white">{reviewCount}</p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
              </p>
            </div>
          </PortfolioFlatField>
          <PortfolioFlatField label="Recommendation">
            <div>
              <p className="text-xl font-bold text-neutral-900 dark:text-white">
                {recommendPercent}%
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                would recommend this creator
              </p>
            </div>
          </PortfolioFlatField>
        </div>

        <PortfolioFlatField
          label="Trust badges"
          value={trustBadges.length > 0 ? trustBadges.join(' · ') : null}
          emptyLabel="No trust badges yet"
          muted={trustBadges.length === 0}
        >
          {trustBadges.length > 0 ? (
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {trustBadges.map((badge) => (
                <li
                  key={badge}
                  className="text-[15px] font-semibold leading-relaxed text-neutral-900 dark:text-white"
                >
                  {badge}
                </li>
              ))}
            </ul>
          ) : undefined}
        </PortfolioFlatField>
      </div>

      {recentReviews.length > 0 ? (
        <div className="space-y-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Recent reviews
          </p>
          <div className="space-y-6">
            {recentReviews.map((review) => (
              <div
                key={review.id}
                className="border-t border-neutral-200/50 pt-2 first:border-t-0 first:pt-0 dark:border-white/[0.06]"
              >
                <RecentReviewBlock review={review} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
