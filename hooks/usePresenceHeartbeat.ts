'use client';

import { useEffect } from 'react';
import { sendPresenceHeartbeat } from '@/lib/presence-api';

const HEARTBEAT_INTERVAL_MS = 25_000;

/**
 * Keeps the authenticated user Online only while a visible dashboard tab is open.
 * Heartbeats pause when the tab is hidden; server TTL (~75s) then marks Offline
 * if no other live tab / WebSocket remains.
 */
export function usePresenceHeartbeat(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timer: number | null = null;

    const clearTimer = () => {
      if (timer != null) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const beat = () => {
      if (cancelled || document.visibilityState === 'hidden') return;
      void sendPresenceHeartbeat().catch(() => {
        /* network / auth blips — next interval retries */
      });
    };

    const start = () => {
      clearTimer();
      beat();
      timer = window.setInterval(beat, HEARTBEAT_INTERVAL_MS);
    };

    const stop = () => {
      clearTimer();
    };

    const onVisibility = () => {
      if (cancelled) return;
      if (document.visibilityState === 'visible') {
        start();
      } else {
        // Pause only — other tabs may still heartbeat; server TTL handles offline.
        stop();
      }
    };

    if (document.visibilityState === 'visible') {
      start();
    }

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled]);
}
