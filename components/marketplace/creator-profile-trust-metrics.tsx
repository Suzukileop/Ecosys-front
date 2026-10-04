import type { ReactNode } from 'react';
import { getAvailabilityDisplayParts } from '@/lib/availabilityHours';

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
    <span className="inline-flex shrink-0 items-center justify-center text-neutral-400 dark:text-neutral-500">
      {children}
    </span>
  );
}

const METRIC_CELL_CLASS = 'flex min-w-0 flex-col px-6 py-6 sm:px-8';
const METRIC_LABEL_CLASS = 'text-[13px] font-medium text-neutral-500 dark:text-neutral-400';
const METRIC_VALUE_CLASS =
  'text-[1.375rem] font-semibold leading-tight tracking-[-0.02em] text-[#111111] dark:text-white';
const METRIC_HINT_CLASS = 'mt-1 text-[13px] leading-snug text-neutral-500 dark:text-neutral-400';
const METRIC_EMPTY_CLASS = 'mt-3 text-[15px] font-medium text-neutral-400 dark:text-neutral-500';

export function TrustMetricCard({
  label,
  icon,
  value,
  hint,
  insufficient = false,
  insufficientLabel = 'Not enough data yet',
}: TrustMetricCardProps) {
  return (
    <div className={METRIC_CELL_CLASS}>
      <div className="flex items-center gap-2">
        {icon}
        <p className={METRIC_LABEL_CLASS}>{label}</p>
      </div>
      {insufficient ? (
        <p className={METRIC_EMPTY_CLASS}>{insufficientLabel}</p>
      ) : (
        <div className="mt-3 min-w-0">
          <p className={METRIC_VALUE_CLASS}>{value}</p>
          {hint ? <p className={METRIC_HINT_CLASS}>{hint}</p> : null}
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
    <div className={METRIC_CELL_CLASS}>
      <div className="flex items-center gap-2">
        <MetricIconShell>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </MetricIconShell>
        <p className={METRIC_LABEL_CLASS}>Availability</p>
      </div>

      {!parts ? (
        <p className={METRIC_EMPTY_CLASS}>Hours not set</p>
      ) : (
        <div className="mt-3 min-w-0">
          <p className={`${METRIC_VALUE_CLASS} tabular-nums`}>{parts.hours}</p>
          <p className={METRIC_HINT_CLASS}>
            {parts.days}
            {parts.timezone ? <span className="text-neutral-400 dark:text-neutral-500"> · {parts.timezone}</span> : null}
          </p>
        </div>
      )}
    </div>
  );
}

type CreatorTrustMetricsRowProps = {
  starCount: number;
  responseTimeLabel?: string | null;
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

export function CreatorTrustMetricsRow({
  starCount,
  responseTimeLabel,
  availabilityHours,
  timezoneId,
}: CreatorTrustMetricsRowProps) {
  const responseLabel = responseTimeLabel?.trim() || null;

  return (
    <div className="grid min-w-0 divide-y divide-black/[0.06] dark:divide-white/[0.08] md:grid-cols-3 md:divide-x md:divide-y-0">
      <TrustMetricCard
        label="Trust stars"
        insufficient={starCount <= 0}
        insufficientLabel="No stars yet"
        value={formatEnglishCount(starCount)}
        hint={starCount === 1 ? 'Starred by 1 member' : `Starred by ${formatEnglishCount(starCount)} members`}
        icon={
          <MetricIconShell>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </MetricIconShell>
        }
      />
      <TrustMetricCard
        label="Response time"
        insufficient={!responseLabel}
        insufficientLabel="Not enough data yet"
        value={responseLabel ?? undefined}
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
