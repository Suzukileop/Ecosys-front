'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Affiche un état « en chargement » dès le clic, avant que le routeur
 * n’ait mis à jour l’URL / les search params.
 */
export function usePendingNavigation<T extends string>(active: T) {
  const [pending, setPending] = useState<T | null>(null);

  useEffect(() => {
    if (pending === active) {
      setPending(null);
    }
  }, [active, pending]);

  const startTransition = useCallback(
    (next: T) => {
      if (next === active) return;
      setPending(next);
    },
    [active]
  );

  const isTransitioning = pending !== null && pending !== active;
  const preview = pending ?? active;

  return { pending, preview, isTransitioning, startTransition, clearPending: () => setPending(null) };
}
