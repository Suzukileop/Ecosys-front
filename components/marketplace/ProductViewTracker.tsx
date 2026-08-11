'use client';

import { useEffect, useRef } from 'react';
import { recordProductView } from '@/lib/marketplace-api';
import { useAuth } from '@/context/AuthContext';

type ProductViewTrackerProps = {
  productId: string;
  onRecorded?: () => void;
};

export function ProductViewTracker({ productId, onRecorded }: ProductViewTrackerProps) {
  const { hasRole, user, isLoading } = useAuth();
  const tracked = useRef(false);
  const onRecordedRef = useRef(onRecorded);

  useEffect(() => {
    onRecordedRef.current = onRecorded;
  }, [onRecorded]);

  useEffect(() => {
    if (!productId || tracked.current || isLoading || !user || !hasRole('ROLE_CREATOR')) return;

    tracked.current = true;
    void recordProductView(productId)
      .then((recorded) => {
        if (recorded) {
          onRecordedRef.current?.();
        }
      })
      .catch(() => {
        tracked.current = false;
      });
  }, [productId, user, isLoading, hasRole]);

  return null;
}
