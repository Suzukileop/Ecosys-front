'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  readPortfolioNavTopClearancePx,
} from '@/components/portfolio/portfolio-nav-top-clearance';

const ACTIVATION_GAP_PX = 24;
const NAVIGATE_LOCK_MS = 720;
const SCROLL_SETTLE_MS = 100;

export { readPortfolioNavTopClearancePx };

/** Y-position (viewport px) where the active section switches — below the fixed nav. */
export function resolvePortfolioNavActivationLinePx(): number {
  const clearance = readPortfolioNavTopClearancePx();
  const viewportBand =
    typeof window !== 'undefined' ? window.innerHeight * 0.28 : 0;
  return Math.max(clearance + ACTIVATION_GAP_PX, viewportBand);
}

/**
 * Stable scroll-spy: last section (DOM order) whose top has crossed the activation line.
 * Avoids IntersectionObserver ratio flicker between adjacent sections.
 */
export function resolveActivePortfolioSectionId(
  sectionIds: readonly string[],
  activationLinePx = resolvePortfolioNavActivationLinePx()
): string | null {
  if (sectionIds.length === 0) return null;

  let active = sectionIds[0]!;
  for (const id of sectionIds) {
    const node = document.getElementById(id);
    if (!node) continue;
    if (node.getBoundingClientRect().top <= activationLinePx) {
      active = id;
    }
  }
  return active;
}

export type PortfolioSectionSpyOptions = {
  isLocked?: () => boolean;
  activationLinePx?: number;
};

export function subscribePortfolioSectionActiveId(
  sectionIds: readonly string[],
  onActiveId: (id: string) => void,
  options?: PortfolioSectionSpyOptions
): () => void {
  if (typeof window === 'undefined' || sectionIds.length === 0) {
    return () => {};
  }

  let rafId = 0;
  let settleTimer: number | undefined;
  let lastEmitted = '';

  const emit = () => {
    if (options?.isLocked?.()) return;
    const next = resolveActivePortfolioSectionId(
      sectionIds,
      options?.activationLinePx
    );
    if (!next || next === lastEmitted) return;
    lastEmitted = next;
    onActiveId(next);
  };

  const schedule = () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(emit);
  };

  const onScroll = () => {
    schedule();
    if (settleTimer) window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(emit, SCROLL_SETTLE_MS);
  };

  emit();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  return () => {
    cancelAnimationFrame(rafId);
    if (settleTimer) window.clearTimeout(settleTimer);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}

/** Scroll-spy with a short lock after programmatic navigation (smooth scroll). */
export function usePortfolioSectionSpy(sectionIds: readonly string[], enabled: boolean) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '');
  const lockedRef = useRef(false);
  const unlockTimerRef = useRef<number | null>(null);

  const releaseLock = useCallback(() => {
    lockedRef.current = false;
    if (unlockTimerRef.current) {
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
    const next = resolveActivePortfolioSectionId(sectionIds);
    if (next) setActiveId(next);
  }, [sectionIds]);

  const lockForNavigation = useCallback(
    (targetId: string) => {
      setActiveId(targetId);
      lockedRef.current = true;
      if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = window.setTimeout(releaseLock, NAVIGATE_LOCK_MS);
    },
    [releaseLock]
  );

  useEffect(() => {
    if (!enabled || sectionIds.length === 0) return;
    return subscribePortfolioSectionActiveId(sectionIds, setActiveId, {
      isLocked: () => lockedRef.current,
    });
  }, [sectionIds, enabled]);

  useEffect(() => {
    if (sectionIds.length === 0) return;
    if (!sectionIds.includes(activeId)) {
      setActiveId(sectionIds[0]!);
    }
  }, [sectionIds, activeId]);

  useEffect(
    () => () => {
      if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current);
    },
    []
  );

  return { activeId, setActiveId, lockForNavigation };
}
