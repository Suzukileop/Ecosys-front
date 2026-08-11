import type { ReactNode } from 'react';
import { getAvailabilityDisplayParts } from '@/lib/availabilityHours';

type TrustMetricCardProps = {
  label: string;
  value: string;
  icon?: ReactNode;
};

function MetricIconShell({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
      {children}
    </span>
  );
}

export function TrustMetricCard({ label, value, icon }: TrustMetricCardProps) {
  return (
    <div className="flex min-h-[5.5rem] flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-xl font-bold leading-tight text-neutral-900 dark:text-white">{value}</p>
    </div>
  );
}

function AvailabilityMetricCard({
  availabilityHours,
  timezoneId,
  isAvailable = true,
}: {
  availabilityHours?: string | null;
  timezoneId?: string | null;
  isAvailable?: boolean;
}) {
  const parts = getAvailabilityDisplayParts(availabilityHours, timezoneId);

  return (
    <div className="flex min-h-[5.5rem] flex-col rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Disponibilité</p>
        <MetricIconShell>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </MetricIconShell>
      </div>

      <p
        className={`mt-2 text-sm font-semibold ${
          isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        {isAvailable ? 'Disponible' : 'Indisponible'}
      </p>

      {!parts ? (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Horaires non renseignés</p>
      ) : (
        <div className="mt-1 space-y-0.5">
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
  recommendPercent: number | null;
  availabilityHours?: string | null;
  timezoneId?: string | null;
  isAvailable?: boolean;
};

export function formatFrenchCount(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

export function CreatorTrustMetricsRow({
  averageRating,
  reviewCount,
  recommendPercent,
  availabilityHours,
  timezoneId,
  isAvailable = true,
}: CreatorTrustMetricsRowProps) {
  const hasRating = averageRating != null && reviewCount > 0;
  const completionPercent =
    reviewCount > 0 && recommendPercent != null ? `${Math.round(recommendPercent)} %` : '—';

  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <TrustMetricCard
        label="Note moyenne"
        value={hasRating ? `${averageRating!.toFixed(1)} ★` : '—'}
        icon={
          <MetricIconShell>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </MetricIconShell>
        }
      />
      <TrustMetricCard
        label="Taux de complétion"
        value={completionPercent}
        icon={
          <MetricIconShell>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </MetricIconShell>
        }
      />
      <AvailabilityMetricCard availabilityHours={availabilityHours} timezoneId={timezoneId} isAvailable={isAvailable} />
      <TrustMetricCard
        label="Avis clients"
        value={reviewCount > 0 ? formatFrenchCount(reviewCount) : '—'}
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
    </div>
  );
}
