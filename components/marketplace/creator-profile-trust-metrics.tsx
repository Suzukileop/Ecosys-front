import type { ReactNode } from 'react';
import { getAvailabilityDisplayParts } from '@/lib/availabilityHours';

/**
 * Minimum sample size before rating & Discuss response metrics
 * show a numeric value with full visual authority (reviews / inbound Discuss DMs).
 */
export const TRUST_METRICS_MIN_SAMPLE = 2;

type TrustMetricCardProps = {
  label: string;
  icon?: ReactNode;
  /** Main numeric / text value when sample is sufficient. */
  value?: string;
  /** Secondary denominator / latency line under the value. */
  hint?: string | null;
  /** When true, hide the number and show a neutral badge instead. */
  insufficient?: boolean;
  insufficientLabel?: string;
};

function MetricIconShell({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
      {children}
    </span>
  );
}

export function TrustMetricCard({
  label,
  icon,
  value,
  hint,
  insufficient = false,
  insufficientLabel = 'Not enough data yet',
}: TrustMetricCardProps) {
  return (
    <div className="flex min-h-[5.5rem] flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
        {icon}
      </div>
      {insufficient ? (
        <span className="mt-2 inline-flex w-fit max-w-full rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {insufficientLabel}
        </span>
      ) : (
        <div className="mt-2 min-w-0">
          <p className="text-xl font-bold leading-tight text-neutral-900 dark:text-white">{value}</p>
          {hint ? (
            <p className="mt-1 text-xs leading-snug text-neutral-500 dark:text-neutral-400">{hint}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function AvailabilityMetricCard({
  availabilityHours,
  timezoneId,
}: {
  availabilityHours?: string | null;
  timezoneId?: string | null;
}) {
  const parts = getAvailabilityDisplayParts(availabilityHours, timezoneId);

  return (
    <div className="flex min-h-[5.5rem] flex-col rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Availability</p>
        <MetricIconShell>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </MetricIconShell>
      </div>

      {!parts ? (
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Hours not set</p>
      ) : (
        <div className="mt-2 space-y-0.5">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{parts.days}</p>
          <p className="text-base font-bold tabular-nums leading-tight text-neutral-900 dark:text-white">{parts.hours}</p>
          {parts.timezone ? (
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{parts.timezone}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

type CreatorTrustMetricsRowProps = {
  averageRating: number | null;
  reviewCount: number;
  responseRatePercent?: number | null;
  inboundConversationCount?: number;
  typicallyRepliesWithinLabel?: string | null;
  availabilityHours?: string | null;
  timezoneId?: string | null;
};

export function formatEnglishCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/** @deprecated Prefer formatEnglishCount */
export function formatFrenchCount(value: number): string {
  return formatEnglishCount(value);
}

function insufficientSampleLabel(sampleSize: number): string {
  return sampleSize <= 0 ? 'New provider' : 'Not enough data yet';
}

function basedOnReviewsHint(reviewCount: number): string {
  const n = formatEnglishCount(reviewCount);
  return reviewCount === 1 ? `Based on ${n} review` : `Based on ${n} reviews`;
}

export function CreatorTrustMetricsRow({
  averageRating,
  reviewCount,
  responseRatePercent,
  inboundConversationCount = 0,
  typicallyRepliesWithinLabel,
  availabilityHours,
  timezoneId,
}: CreatorTrustMetricsRowProps) {
  const ratingInsufficient = reviewCount < TRUST_METRICS_MIN_SAMPLE;
  const responseInsufficient = inboundConversationCount < TRUST_METRICS_MIN_SAMPLE;

  const hasRating = averageRating != null && reviewCount > 0;
  const hasResponseRate = typeof responseRatePercent === 'number' && inboundConversationCount > 0;

  return (
    <div className="grid min-w-0 gap-3 md:grid-cols-3">
      <TrustMetricCard
        label="Average rating"
        insufficient={ratingInsufficient || !hasRating}
        insufficientLabel={insufficientSampleLabel(reviewCount)}
        value={hasRating ? `${averageRating!.toFixed(1)} ★` : undefined}
        hint={hasRating && !ratingInsufficient ? basedOnReviewsHint(reviewCount) : null}
        icon={
          <MetricIconShell>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </MetricIconShell>
        }
      />
      <TrustMetricCard
        label="Response rate"
        insufficient={responseInsufficient || !hasResponseRate}
        insufficientLabel={insufficientSampleLabel(inboundConversationCount)}
        value={hasResponseRate ? `${Math.round(responseRatePercent!)} %` : undefined}
        hint={
          hasResponseRate && !responseInsufficient && typicallyRepliesWithinLabel?.trim()
            ? typicallyRepliesWithinLabel.trim()
            : null
        }
        icon={
          <MetricIconShell>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </MetricIconShell>
        }
      />
      <AvailabilityMetricCard availabilityHours={availabilityHours} timezoneId={timezoneId} />
    </div>
  );
}
