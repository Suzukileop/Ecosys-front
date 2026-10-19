'use client';

import { useSyncExternalStore } from 'react';

/*
 * A portfolio's visit counter, as returned by the API once this visit is recorded (shortly after
 * the page loads). It used to live in PublicCreatorPortfolioPage's state, so that one number
 * re-rendered every section of the page; only the footer shows it, so only the footer subscribes.
 */
const visitsByCreator = new Map<string, number>();
const listeners = new Set<() => void>();

export function publishProfileVisits(creatorId: string, visits: number): void {
  if (visitsByCreator.get(creatorId) === visits) return;
  visitsByCreator.set(creatorId, visits);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The recorded count once known, else the count the page was rendered with. */
export function useProfileVisits(creatorId: string, initialVisits: number): number {
  return useSyncExternalStore(
    subscribe,
    () => visitsByCreator.get(creatorId) ?? initialVisits,
    () => initialVisits,
  );
}
