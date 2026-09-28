'use client';

import { useState, type ReactNode } from 'react';
import type { CreatorReputationDto, CreatorReviewItem } from '@/types/ecosystem';
import type { ContactVisibilityLevel } from '@/lib/contact-visibility';
import { PortfolioFieldVisibilityMenu } from '@/components/portfolio/PortfolioInformationChrome';
import {
  STUDIO_EMPTY_CLASS,
  STUDIO_FLOAT_IN_STYLE,
  STUDIO_ROW_RULE,
  STUDIO_SECONDARY_CLASS,
  STUDIO_VALUE_CLASS,
  StudioSectionHeader,
  StudioSlashLine,
} from '@/components/portfolio/PortfolioStudioKit';

const REVIEWS_PREVIEW = 3;
const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.176 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.047 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z';
const STAT_LABEL_CLASS =
  'text-[12px] font-medium uppercase tracking-[0.08em] text-neutral-500 dark:text-neutral-400';

function Stars({ rating, size = 'h-3.5 w-3.5' }: { rating: number; size?: string }) {
  const filled = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          aria-hidden
          viewBox="0 0 20 20"
          className={`${size} ${
            i < filled ? 'fill-[#FF5722]' : 'fill-black/[0.08] dark:fill-white/[0.12]'
          }`}
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function reviewerInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="min-w-0 py-4 sm:px-8 sm:py-0 sm:first:pl-0">
      <p className={STAT_LABEL_CLASS}>{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-black dark:text-neutral-100">{value}</p>
      {hint ? <p className={`mt-1 ${STUDIO_SECONDARY_CLASS}`}>{hint}</p> : null}
    </div>
  );
}

function RatingDistribution({
  distribution,
  total,
}: {
  distribution: NonNullable<CreatorReputationDto['ratingDistribution']>;
  total: number;
}) {
  const counted = ([5, 4, 3, 2, 1] as const).reduce((sum, star) => sum + (distribution[star] ?? 0), 0);
  const base = Math.max(counted, total, 1);
  return (
    <ul className="grid w-full gap-2.5 sm:max-w-[16rem]" aria-label="Rating distribution">
      {([5, 4, 3, 2, 1] as const).map((star) => {
        const count = distribution[star] ?? 0;
        return (
          <li key={star} className="grid grid-cols-[1rem_minmax(0,1fr)_2rem] items-center gap-3">
            <span className={`tabular-nums ${STUDIO_SECONDARY_CLASS}`}>{star}</span>
            <span className="h-[3px] overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
              <span
                className="block h-full rounded-full bg-neutral-800 transition-[width] duration-500 dark:bg-neutral-200"
                style={{ width: `${(count / base) * 100}%` }}
              />
            </span>
            <span className={`text-right tabular-nums ${STUDIO_SECONDARY_CLASS}`}>{count}</span>
          </li>
        );
      })}
    </ul>
  );
}

function ReviewRow({ review }: { review: CreatorReviewItem }) {
  const comment = review.comment?.trim();
  return (
    <li className={`grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 py-6 first:pt-2 ${STUDIO_ROW_RULE}`}>
      <span
        aria-hidden
        className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-[14px] font-semibold text-neutral-600 dark:bg-white/[0.06] dark:text-neutral-300"
      >
        {reviewerInitial(review.reviewerName)}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className={`truncate !font-semibold ${STUDIO_VALUE_CLASS}`}>{review.reviewerName}</p>
          <time dateTime={review.createdAt} className={`shrink-0 ${STUDIO_SECONDARY_CLASS}`}>
            {formatReviewDate(review.createdAt)}
          </time>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Stars rating={review.rating} />
          {review.wouldRecommend ? <span className={STUDIO_SECONDARY_CLASS}>Recommends</span> : null}
        </div>
        {comment ? (
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
            {comment}
          </p>
        ) : (
          <p className={`mt-3 text-[15px] ${STUDIO_EMPTY_CLASS}`}>No written comment</p>
        )}
      </div>
    </li>
  );
}

/** Read-only reputation: rating summary, key stats, distribution and buyer reviews. */
export function PortfolioReputationStudio({
  reputation,
  actionsVisible = true,
  visibility,
  onVisibilityChange,
}: {
  reputation: CreatorReputationDto | null | undefined;
  actionsVisible?: boolean;
  visibility?: ContactVisibilityLevel;
  onVisibilityChange?: (value: ContactVisibilityLevel) => void;
}) {
  const [showAll, setShowAll] = useState(false);

  const averageRating = reputation?.averageRating ?? null;
  const reviewCount = reputation?.reviewCount ?? 0;
  const recommendPercent = reputation?.recommendPercent ?? 0;
  const responseRate = reputation?.responseRatePercent;
  const repliesWithin = reputation?.typicallyRepliesWithinLabel?.trim();
  const trustBadges = reputation?.trustBadges ?? [];
  const reviews = reputation?.recentReviews ?? [];
  const distribution = reputation?.ratingDistribution;
  const hasDistribution = Boolean(
    distribution && Object.values(distribution).some((count) => (count ?? 0) > 0)
  );

  const visibilityControl =
    actionsVisible && visibility && onVisibilityChange ? (
      <PortfolioFieldVisibilityMenu value={visibility} onChange={onVisibilityChange} menuPlacement="down" />
    ) : null;

  if (reviewCount === 0) {
    return (
      <section className="pb-10 pt-3" aria-label="Reputation">
        <StudioSectionHeader label="Reputation">{visibilityControl}</StudioSectionHeader>
        <p className={`max-w-xl py-8 leading-relaxed ${STUDIO_EMPTY_CLASS}`}>
          No reviews yet. Your reputation builds up as buyers rate completed orders — your score and their
          feedback will appear here.
        </p>
      </section>
    );
  }

  const stats: Array<{ label: string; value: ReactNode; hint?: string }> = [
    { label: 'Recommend', value: `${recommendPercent}%`, hint: 'of buyers' },
  ];
  if (responseRate != null) {
    stats.push({ label: 'Response rate', value: `${Math.round(responseRate)}%`, hint: 'on messages' });
  }
  if (repliesWithin) {
    stats.push({ label: 'Replies within', value: repliesWithin });
  }

  const visibleReviews = showAll ? reviews : reviews.slice(0, REVIEWS_PREVIEW);
  const hiddenCount = reviews.length - REVIEWS_PREVIEW;

  return (
    <div className="space-y-16 pb-10 pt-3" style={STUDIO_FLOAT_IN_STYLE}>
      <section aria-label="Rating summary">
        <StudioSectionHeader label="Overview">{visibilityControl}</StudioSectionHeader>

        <div className="flex flex-col gap-10 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-baseline gap-2">
              <span className="text-[56px] font-semibold leading-none tracking-tight tabular-nums text-[#FF5722]">
                {averageRating != null ? averageRating.toFixed(1) : '—'}
              </span>
              <span className={STUDIO_SECONDARY_CLASS}>/ 5</span>
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Stars rating={averageRating ?? 0} size="h-4 w-4" />
              <span className={STUDIO_SECONDARY_CLASS}>
                from {reviewCount} review{reviewCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          {hasDistribution && distribution ? (
            <RatingDistribution distribution={distribution} total={reviewCount} />
          ) : null}
        </div>

        <div className="mt-12 grid divide-y divide-black/[0.06] dark:divide-white/[0.06] sm:flex sm:divide-x sm:divide-y-0">
          {stats.map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </div>

        {trustBadges.length > 0 ? (
          <div className="mt-12">
            <p className={`mb-3 ${STAT_LABEL_CLASS}`}>Trust badges</p>
            <StudioSlashLine
              className=""
              items={trustBadges.map((badge) => (
                <span key={badge} className={STUDIO_VALUE_CLASS}>
                  {badge}
                </span>
              ))}
            />
          </div>
        ) : null}
      </section>

      <section aria-label="Reviews">
        <StudioSectionHeader label={`Reviews · ${String(reviews.length).padStart(2, '0')}`}>
          {reviewCount > reviews.length ? (
            <span className={STUDIO_SECONDARY_CLASS}>Latest of {reviewCount}</span>
          ) : null}
        </StudioSectionHeader>

        {reviews.length === 0 ? (
          <p className={`py-8 ${STUDIO_EMPTY_CLASS}`}>Recent reviews will show up here.</p>
        ) : (
          <>
            <ul>
              {visibleReviews.map((review) => (
                <ReviewRow key={review.id} review={review} />
              ))}
            </ul>
            {hiddenCount > 0 ? (
              <button
                type="button"
                aria-expanded={showAll}
                onClick={() => setShowAll((current) => !current)}
                className={`mt-6 transition-colors duration-200 hover:text-[#FF5722] ${STUDIO_SECONDARY_CLASS}`}
              >
                {showAll ? 'Show less' : `Show all ${reviews.length} reviews`}
              </button>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
