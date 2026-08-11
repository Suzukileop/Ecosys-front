import { useEffect, useRef } from 'react';

/** Exécute un callback à intervalle régulier tant que l'onglet est visible. */
export function useVisibilityPolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled = true,
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      void callbackRef.current();
    };

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, enabled]);
}
