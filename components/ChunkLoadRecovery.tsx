'use client';

import { useEffect } from 'react';

const RELOAD_KEY = 'np-chunk-reload';

function isChunkLoadError(reason: unknown): boolean {
  if (!reason) return false;
  const message =
    reason instanceof Error
      ? reason.message
      : typeof reason === 'string'
        ? reason
        : String(reason);
  return /ChunkLoadError|Loading chunk .* failed/i.test(message);
}

/** Recharge une fois si un chunk JS échoue (dev: recompile HMR, cache .next stale). */
export function ChunkLoadRecovery() {
  useEffect(() => {
    sessionStorage.removeItem(RELOAD_KEY);

    const tryReload = (reason: unknown) => {
      if (!isChunkLoadError(reason)) return;
      if (sessionStorage.getItem(RELOAD_KEY)) return;
      sessionStorage.setItem(RELOAD_KEY, '1');
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => {
      tryReload(event.error ?? event.message);
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      tryReload(event.reason);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
