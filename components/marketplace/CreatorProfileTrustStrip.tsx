'use client';

import { useCallback, useEffect, useState } from 'react';
import { CreatorTrustMetricsRow } from '@/components/marketplace/creator-profile-trust-metrics';
import { CreatorTrustMetricsRowSkeleton } from '@/components/marketplace/PublicCreatorProfileSkeleton';
import { getCreatorReputation } from '@/lib/marketplace-api';
import type { CreatorReputationDto } from '@/types/ecosystem';

type CreatorProfileTrustStripProps = {
  creatorId: string;
  availabilityHours?: string | null;
  timezoneId?: string | null;
  className?: string;
};

export function CreatorProfileTrustStrip({
  creatorId,
  availabilityHours,
  timezoneId,
  className = '',
}: CreatorProfileTrustStripProps) {
  const [reputation, setReputation] = useState<CreatorReputationDto | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCreatorReputation(creatorId);
      setReputation(data);
    } catch {
      setReputation(null);
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <CreatorTrustMetricsRowSkeleton className={className} />;
  }

  return (
    <div className={className}>
      <CreatorTrustMetricsRow
        averageRating={reputation?.averageRating ?? null}
        reviewCount={reputation?.reviewCount ?? 0}
        responseRatePercent={reputation?.responseRatePercent ?? null}
        inboundConversationCount={reputation?.inboundConversationCount ?? 0}
        typicallyRepliesWithinLabel={reputation?.typicallyRepliesWithinLabel ?? null}
        availabilityHours={availabilityHours}
        timezoneId={timezoneId}
      />
    </div>
  );
}
