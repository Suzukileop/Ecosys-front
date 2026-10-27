'use client';

import { useLayoutEffect, type RefObject } from 'react';

/** Below this share of the design's full size a one-line email would be too small to read: the text
 *  then wraps (at its natural break points) instead of shrinking further. */
const MIN_FIT = 0.3;
/** Breathing room so the last glyph never touches the container's edge. */
const SAFETY = 0.985;

/**
 * Keeps a big email on ONE line: sets `--fit` (0.3–1) on `container` so that `text` (the inline-block
 * holding the address, `white-space: nowrap`) exactly fills the container's width at most. Every size in
 * the design is `calc(<its own max size> * var(--fit, 1))`, so the address starts at the design's full
 * size and only shrinks as far as the available width requires — on any screen width, any email length,
 * and after the web font has loaded. If even the smallest size cannot fit it, the text falls back to
 * wrapping (nothing is ever clipped).
 */
export function useFitText(
  container: RefObject<HTMLElement | null>,
  text: RefObject<HTMLElement | null>,
  deps: ReadonlyArray<unknown>
) {
  useLayoutEffect(() => {
    const box = container.current;
    const line = text.current;
    if (!box || !line) return undefined;

    let lastWidth = -1;
    const fit = () => {
      const avail = box.clientWidth;
      if (avail <= 0) return;
      lastWidth = avail;
      box.style.setProperty('--fit', '1');
      line.style.whiteSpace = 'nowrap';
      line.style.overflowWrap = 'normal';
      const natural = line.offsetWidth;
      if (natural <= 0) return;
      const ratio = (avail / natural) * SAFETY;
      if (ratio >= 1) return;
      if (ratio >= MIN_FIT) {
        box.style.setProperty('--fit', ratio.toFixed(4));
        return;
      }
      // Still too wide at the smallest size: let it wrap rather than overflow.
      box.style.setProperty('--fit', String(MIN_FIT));
      line.style.whiteSpace = 'normal';
      line.style.overflowWrap = 'anywhere';
    };

    fit();
    const observer = new ResizeObserver(() => {
      // Resizing the font changes the box's height, not its width: only react to real width changes.
      if (box.clientWidth !== lastWidth) fit();
    });
    observer.observe(box);
    let cancelled = false;
    void document.fonts?.ready?.then(() => {
      if (!cancelled) fit();
    });
    return () => {
      cancelled = true;
      observer.disconnect();
      box.style.removeProperty('--fit');
      line.style.whiteSpace = '';
      line.style.overflowWrap = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the caller lists what changes the text or its size
  }, deps);
}
