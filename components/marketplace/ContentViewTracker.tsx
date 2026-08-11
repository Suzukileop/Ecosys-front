'use client';

import { useEffect, useRef } from 'react';
import { recordContentView } from '@/lib/marketplace-api';

type ContentViewTrackerProps = {
  contentId: string;
};

export function ContentViewTracker({ contentId }: ContentViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    void recordContentView(contentId).catch(() => {
      /* view tracking is best-effort */
    });
  }, [contentId]);

  return null;
}
