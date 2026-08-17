'use client';

import { useEffect } from 'react';
import { sendPresenceHeartbeat } from '@/lib/presence-api';

const HEARTBEAT_INTERVAL_MS = 25_000;

/**
 * Keeps the authenticated user Online while any dashboard page is open.
 * Independent of STOMP SessionConnectedEvent (which often misses the principal).
 */
export function usePresenceHeartbeat(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const beat = () => {
      void sendPresenceHeartbeat().catch(() => {
        /* network / auth blips — next interval retries */
      });
    };

    beat();
    const timer = window.setInterval(beat, HEARTBEAT_INTERVAL_MS);

    const onVisible = () => {
      if (!cancelled && document.visibilityState === 'visible') beat();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled]);
}
