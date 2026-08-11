'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';

const XL_MIN = 1280;
const GAP_PX = 28;
const HARD_CAP_PX = 44 * 16; // 44rem

/**
 * Measure the absolute portrait card and shrink the copy column so text wraps
 * (line-break) before overlapping — only when they would actually collide.
 * On wide layouts with clearance, returns undefined (CSS 44rem / % cap applies).
 */
export function useHeroCopyPortraitSafeMaxWidth(
  copyRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  flipped = false
): number | undefined {
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (!enabled) {
      setMaxWidth(undefined);
      return;
    }

    const measure = () => {
      if (typeof window === 'undefined' || window.innerWidth < XL_MIN) {
        setMaxWidth(undefined);
        return;
      }

      const copy = copyRef.current;
      if (!copy) {
        setMaxWidth(undefined);
        return;
      }

      const portrait = document.querySelector<HTMLElement>('[data-hero-portrait]');
      if (!portrait || getComputedStyle(portrait).display === 'none') {
        setMaxWidth(undefined);
        return;
      }

      const copyBox = copy.getBoundingClientRect();
      const portraitBox = portrait.getBoundingClientRect();

      // Space left of the portrait (or right of it when flipped) for copy text.
      const available = flipped
        ? copyBox.right - portraitBox.right - GAP_PX
        : portraitBox.left - copyBox.left - GAP_PX;

      if (!Number.isFinite(available)) {
        setMaxWidth(undefined);
        return;
      }

      if (available <= 0) {
        // Portrait sits on top of copy origin — keep a readable wrap width.
        setMaxWidth(Math.min(HARD_CAP_PX, Math.max(14 * 16, copy.parentElement?.clientWidth
          ? copy.parentElement.clientWidth * 0.4
          : 18 * 16)));
        return;
      }

      const next = Math.min(HARD_CAP_PX, available);
      // Enough room for the full editorial column — do not force a tighter cap.
      if (next >= HARD_CAP_PX - 0.5) {
        setMaxWidth(undefined);
        return;
      }

      setMaxWidth(Math.round(next));
    };

    // Portrait mounts in a sibling absolute layer — measure after paint.
    const raf = window.requestAnimationFrame(measure);

    const ro = new ResizeObserver(() => measure());
    const copy = copyRef.current;
    if (copy) ro.observe(copy);
    const portrait = document.querySelector('[data-hero-portrait]');
    if (portrait) ro.observe(portrait);
    const section = document.getElementById('hero');
    if (section) ro.observe(section);
    window.addEventListener('resize', measure);

    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [copyRef, enabled, flipped]);

  return maxWidth;
}
