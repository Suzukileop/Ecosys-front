'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';

/**
 * Columns that follow the block's real width.
 *
 * Services designs used to pick their column count from the window's breakpoints, but the block is
 * often narrower than the window (the editor's preview, a boxed page, side margins): four cards
 * "per row" then ended up ~200 px wide with their text wrapping word by word. A design now measures
 * its own container, keeps the asked-for count as a maximum and drops to fewer columns when a card
 * would get narrower than `minWidth`.
 */

/**
 * Columns for `count` cards when the creator asked for at most `cols`: steps down while the last row
 * would hold a single card (4 cards at "3 per row" → 2 + 2, 5 at "4 per row" → 3 + 2). Counts with no
 * such split (7 at 3) keep the asked-for columns.
 */
export function balancedColumns(count: number, cols: number): number {
  for (let c = cols; c >= 2; c -= 1) {
    if (count <= c || count % c !== 1) return c;
  }
  return cols;
}

/** Columns to draw: the asked-for count capped by what fits, rebalanced so a cap never strands one card. */
export function fluidColumns(count: number, asked: number, fit: number): number {
  const capped = Math.max(1, Math.min(asked, fit, count));
  return capped < asked ? balancedColumns(count, capped) : capped;
}

export type FluidTrack = { fit: number; gap: number };

/**
 * Measures `ref`'s width and returns how many cards of at least `minWidth` fit across it, plus the
 * gap in force at that width. `null` until measured (server render, first paint): callers keep their
 * viewport-breakpoint layout as the fallback. State only changes when `fit` or `gap` does.
 */
export function useFluidTrack(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  gapFor: (width: number) => number,
  minWidth: number,
  resetKey?: string
): FluidTrack | null {
  const [track, setTrack] = useState<FluidTrack | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !active) return undefined;
    const measure = () => {
      const width = el.clientWidth;
      const gap = gapFor(width);
      const next = { fit: Math.max(1, Math.floor((width + gap) / (minWidth + gap))), gap };
      setTrack((prev) => (prev && prev.fit === next.fit && prev.gap === next.gap ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
    // `gapFor` is a stable per-design function of the width; `resetKey` re-attaches when the ref's element changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, active, minWidth, resetKey]);
  return track;
}
