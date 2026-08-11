'use client';

import { useEffect, useRef } from 'react';
import { recordCreatorProfileView } from '@/lib/marketplace-api';
import { getProfileVisitorKey } from '@/lib/profile-visitor-key';
import { useAuth } from '@/context/AuthContext';

type CreatorProfileViewTrackerProps = {
  creatorId: string;
  onVisitRecorded?: (profileVisits: number) => void;
};

export function CreatorProfileViewTracker({
  creatorId,
  onVisitRecorded,
}: CreatorProfileViewTrackerProps) {
  const { user, isLoading } = useAuth();
  const tracked = useRef(false);
  const onVisitRecordedRef = useRef(onVisitRecorded);

  useEffect(() => {
    onVisitRecordedRef.current = onVisitRecorded;
  }, [onVisitRecorded]);

  useEffect(() => {
    if (!creatorId || tracked.current || isLoading) return;
    if (user?.id === creatorId) return;

    tracked.current = true;
    void recordCreatorProfileView(creatorId, getProfileVisitorKey())
      .then((result) => {
        onVisitRecordedRef.current?.(result.profileVisits);
      })
      .catch(() => {
        tracked.current = false;
      });
  }, [creatorId, user, isLoading]);

  return null;
}
