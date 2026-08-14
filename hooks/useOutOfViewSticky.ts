'use client';

import { useEffect, useState, type RefObject } from 'react';

function collectScrollParents(el: HTMLElement): HTMLElement[] {
  const parents: HTMLElement[] = [];
  let parent: HTMLElement | null = el.parentElement;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (/(auto|scroll|overlay)/.test(overflowY)) {
      parents.push(parent);
    }
    parent = parent.parentElement;
  }
  return parents;
}

/**
 * True when `targetRef` has scrolled fully above `topOffset` (px from viewport top).
 * Listens to window + nested scroll parents so it works in dashboard overflow containers.
 */
export function useOutOfViewSticky(
  targetRef: RefObject<HTMLElement | null>,
  topOffset = 72,
  /** Re-bind when the observed node mounts (e.g. after loading). */
  enabled = true
): boolean {
  const [outOfView, setOutOfView] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setOutOfView(false);
      return;
    }

    let cancelled = false;
    let scrollParents: HTMLElement[] = [];
    let attachedEl: HTMLElement | null = null;

    const update = () => {
      const el = targetRef.current;
      if (!el) {
        setOutOfView(false);
        return;
      }
      const rect = el.getBoundingClientRect();
      setOutOfView(rect.bottom <= topOffset);
    };

    const detach = () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      for (const node of scrollParents) {
        node.removeEventListener('scroll', update);
      }
      scrollParents = [];
      attachedEl = null;
    };

    const attach = () => {
      const el = targetRef.current;
      if (!el || cancelled) return false;
      if (el === attachedEl) {
        update();
        return true;
      }
      detach();
      attachedEl = el;
      scrollParents = collectScrollParents(el);
      window.addEventListener('scroll', update, { passive: true, capture: true });
      window.addEventListener('resize', update, { passive: true });
      for (const node of scrollParents) {
        node.addEventListener('scroll', update, { passive: true });
      }
      update();
      return true;
    };

    if (!attach()) {
      const timer = window.setInterval(() => {
        if (attach()) window.clearInterval(timer);
      }, 50);
      return () => {
        cancelled = true;
        window.clearInterval(timer);
        detach();
      };
    }

    return () => {
      cancelled = true;
      detach();
    };
  }, [targetRef, topOffset, enabled]);

  return outOfView;
}
