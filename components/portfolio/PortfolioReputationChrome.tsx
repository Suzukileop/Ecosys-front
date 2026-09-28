'use client';

import type { CreatorReputationDto, CreatorReviewItem } from '@/types/ecosystem';
import type { ContactVisibilityLevel } from '@/lib/contact-visibility';
import { PortfolioFlatField } from '@/components/portfolio/PortfolioInformationChrome';
import {
  STUDIO_EMPTY_CLASS,
  STUDIO_ROW_RULE,
  STUDIO_SECONDARY_CLASS,
  STUDIO_VALUE_CLASS,
  StudioSectionHeader,
  StudioSlashLine,
} from '@/components/portfolio/PortfolioStudioKit';

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[#FF5722]" aria-hidden>
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

function RecentReviewRow({ review }: { review: CreatorReviewItem }) {
  const comment = review.comment?.trim();
  return (
    <li className={`grid gap-y-2 py-6 first:pt-2 ${STUDIO_ROW_RULE}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className={`!font-medium ${STUDIO_VALUE_CLASS}`}>{review.reviewerName}</p>
        <p className={STUDIO_SECONDARY_CLASS}>{new Date(review.createdAt).toLocaleDateString()}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Stars rating={review.rating} />
        <span className={STUDIO_SECONDARY_CLASS}>{review.rating.toFixed(1)}/5</span>
      </div>
      {comment ? (
        <p className={`whitespace-pre-wrap leading-relaxed ${STUDIO_VALUE_CLASS}`}>{comment}</p>
      ) : (
        <p className={STUDIO_EMPTY_CLASS}>No comment</p>
      )}
      <p className={STUDIO_SECONDARY_CLASS}>
        {review.wouldRecommend ? 'Recommends this creator' : 'Does not recommend'}
      </p>
    </li>
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
          <PortfolioFlatField
            label="Overall rating"
            emptyLabel="No reviews yet"
            muted
            showVisibility
            visibility={visibility}
            onVisibilityChange={onVisibilityChange}
            className="!pt-3"
          />
        ) : null}
        <p className={`py-10 ${STUDIO_EMPTY_CLASS}`}>
          No reviews yet. Once clients rate your profile, your score and feedback will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <div className="grid items-start gap-x-8 sm:grid-cols-3">
          <PortfolioFlatField
            label="Overall rating"
            showVisibility={showVisibility}
            visibility={visibility}
            onVisibilityChange={onVisibilityChange}
            className="!pt-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Stars rating={averageRating ?? 0} />
              <span className={STUDIO_VALUE_CLASS}>{averageRating?.toFixed(1) ?? '—'}/5</span>
            </div>
          </PortfolioFlatField>
          <PortfolioFlatField label="Reviews" className="!pt-3">
            <p className={STUDIO_VALUE_CLASS}>{reviewCount}</p>
            <p className={`mt-1 ${STUDIO_SECONDARY_CLASS}`}>
              based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
            </p>
          </PortfolioFlatField>
          <PortfolioFlatField label="Recommendation" className="!pt-3">
            <p className={STUDIO_VALUE_CLASS}>{recommendPercent}%</p>
            <p className={`mt-1 ${STUDIO_SECONDARY_CLASS}`}>would recommend this creator</p>
          </PortfolioFlatField>
        </div>

        <PortfolioFlatField
          label="Trust badges"
          emptyLabel="No trust badges yet"
          value={null}
        >
          {trustBadges.length > 0 ? (
            <StudioSlashLine
              className=""
              items={trustBadges.map((badge) => (
                <span key={badge} className={STUDIO_VALUE_CLASS}>
                  {badge}
                </span>
              ))}
            />
          ) : undefined}
        </PortfolioFlatField>
      </div>

      {recentReviews.length > 0 ? (
        <section>
          <StudioSectionHeader label="Recent reviews" />
          <ul>
            {recentReviews.map((review) => (
              <RecentReviewRow key={review.id} review={review} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
