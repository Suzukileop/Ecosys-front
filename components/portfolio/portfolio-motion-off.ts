'use client';

import { createContext, useContext } from 'react';
import gsap from 'gsap';

/**
 * Global "Animations" switch for the public portfolio (Settings → Global → Animations).
 *
 * Nearly every animated section already honours `prefers-reduced-motion` (it is checked through
 * `window.matchMedia` in each GSAP / reveal effect). Rather than threading a new prop through
 * ~100 files, turning animations off makes that same query answer "reduce" for the whole page, so
 * every section takes its existing static path. Two backstops cover code that never asks:
 * a global GSAP time-scale (tweens finish instantly) and `data-pf-motion="off"` on <html>,
 * which a rule in globals.css uses to drop CSS animations / transitions.
 *
 * Must be applied during render (before children mount their effects, which run first) —
 * it is idempotent, so calling it on every render is safe.
 */

// Also matches the value-less form framer-motion asks for: "(prefers-reduced-motion)".
const REDUCED_MOTION_QUERY = /prefers-reduced-motion(?!\s*:\s*no-preference)/i;

type MatchMedia = typeof window.matchMedia;

let originalMatchMedia: MatchMedia | null = null;
let motionOff = false;

function forcedReducedMotionList(query: string): MediaQueryList {
  return {
    matches: true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  } as MediaQueryList;
}

export function setPortfolioMotionOff(off: boolean): void {
  if (typeof window === 'undefined' || off === motionOff) return;
  motionOff = off;

  if (off) {
    if (!originalMatchMedia) {
      originalMatchMedia = window.matchMedia.bind(window);
      const original = originalMatchMedia;
      window.matchMedia = ((query: string) =>
        motionOff && REDUCED_MOTION_QUERY.test(query)
          ? forcedReducedMotionList(query)
          : original(query)) as MatchMedia;
    }
    document.documentElement.dataset.pfMotion = 'off';
    gsap.globalTimeline.timeScale(100);
  } else {
    delete document.documentElement.dataset.pfMotion;
    gsap.globalTimeline.timeScale(1);
  }
}

/** True while the portfolio's animations are switched off. */
export function isPortfolioMotionOff(): boolean {
  return motionOff;
}

/** `setTimeout` for staged entrance reveals: with animations off the stages all fire at once,
 *  so nothing waits (CSS transitions are already removed, so the change is instant). */
export function motionTimeout(callback: () => void, ms: number): ReturnType<typeof setTimeout> {
  return setTimeout(callback, motionOff ? 0 : ms);
}

/**
 * Render-safe twin of {@link isPortfolioMotionOff}: derived from the saved settings and provided
 * by the page, so the server render and the first client render agree (the module flag above is
 * only set on the client, which would make initial inline styles mismatch on hydration).
 * Components that choose an initial "hidden until animated" style must read this one.
 */
export const PortfolioMotionOffContext = createContext(false);

export function usePortfolioMotionOff(): boolean {
  return useContext(PortfolioMotionOffContext);
}
