import { CreatorTrustMetricsRow } from '@/components/marketplace/creator-profile-trust-metrics';

type CreatorProfileTrustStripProps = {
  starCount: number;
  responseTimeLabel?: string | null;
  availabilityHours?: string | null;
  timezoneId?: string | null;
  className?: string;
};

export function CreatorProfileTrustStrip({
  starCount,
  responseTimeLabel,
  availabilityHours,
  timezoneId,
  className = '',
}: CreatorProfileTrustStripProps) {
  return (
    <div className={className}>
      <CreatorTrustMetricsRow
        starCount={starCount}
        responseTimeLabel={responseTimeLabel}
        availabilityHours={availabilityHours}
        timezoneId={timezoneId}
      />
    </div>
  );
}
