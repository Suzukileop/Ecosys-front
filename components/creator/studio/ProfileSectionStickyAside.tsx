'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

const GAP_PX = 12;

function getHeaderBottom(): number {
  const header = document.querySelector('[data-dashboard-main] > header');
  if (header instanceof HTMLElement) {
    return Math.round(header.getBoundingClientRect().bottom) + GAP_PX;
  }
  return 80;
}

type ProfileSectionStickyAsideProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Fixes the portfolio sections rail under the dashboard header as soon as it
 * reaches the top. Height stays content-sized; only width animates on collapse.
 * maxHeight caps the rail when sticky.
 */
export function ProfileSectionStickyAside({ children, className = '' }: ProfileSectionStickyAsideProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const fixedRef = useRef(false);
  const lockedWidthRef = useRef<number | null>(null);
  const lockedHeightRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const placeholder = placeholderRef.current;
    const aside = asideRef.current;
    if (!placeholder || !aside) return;

    const clearFixed = () => {
      aside.style.position = '';
      aside.style.top = '';
      aside.style.left = '';
      aside.style.width = '';
      aside.style.zIndex = '';
      aside.style.maxHeight = '';
      aside.style.height = '';
      aside.style.overflowY = '';
      placeholder.style.height = '';
      lockedWidthRef.current = null;
      lockedHeightRef.current = null;
      fixedRef.current = false;
    };

    const readTrackWidth = () => Math.round(placeholder.getBoundingClientRect().width);

    const syncFixedGeometry = (relockWidth: boolean) => {
      const rect = placeholder.getBoundingClientRect();
      const top = getHeaderBottom();
      const maxHeightPx = Math.max(240, Math.round(window.innerHeight - top - GAP_PX));

      if (relockWidth || lockedWidthRef.current == null) {
        lockedWidthRef.current = readTrackWidth();
      }
      if (lockedHeightRef.current == null) {
        lockedHeightRef.current = Math.min(Math.round(aside.getBoundingClientRect().height), maxHeightPx);
      }

      const heightPx = Math.min(lockedHeightRef.current, maxHeightPx);

      aside.style.position = 'fixed';
      aside.style.top = `${top}px`;
      aside.style.left = `${Math.round(rect.left)}px`;
      aside.style.width = `${lockedWidthRef.current}px`;
      aside.style.zIndex = '30';
      aside.style.height = `${heightPx}px`;
      aside.style.maxHeight = `${maxHeightPx}px`;
      aside.style.overflowY = 'hidden';
      placeholder.style.height = `${heightPx}px`;
    };

    const applyFixed = (relockWidth: boolean) => {
      if (!fixedRef.current) {
        const top = getHeaderBottom();
        const maxHeightPx = Math.max(240, Math.round(window.innerHeight - top - GAP_PX));
        lockedHeightRef.current = Math.min(Math.round(aside.getBoundingClientRect().height), maxHeightPx);
      }
      syncFixedGeometry(relockWidth);
      fixedRef.current = true;
    };

    const update = (relockWidth = false) => {
      const top = getHeaderBottom();
      const rect = placeholder.getBoundingClientRect();

      if (rect.top <= top) {
        applyFixed(relockWidth);
        return;
      }

      if (fixedRef.current) {
        clearFixed();
      }
    };

    const onScroll = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => update(false));
    };

    const onResize = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (fixedRef.current) {
          lockedWidthRef.current = null;
          syncFixedGeometry(true);
          return;
        }
        update(true);
      });
    };

    const onWidthTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== placeholder || event.propertyName !== 'width') return;
      lockedWidthRef.current = null;
      update(true);
    };

    update(true);

    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onResize, { passive: true });
    placeholder.addEventListener('transitionend', onWidthTransitionEnd);

    const ro = new ResizeObserver(onResize);
    ro.observe(placeholder);

    const header = document.querySelector('[data-dashboard-main] > header');
    const headerRo = header instanceof HTMLElement ? new ResizeObserver(onResize) : null;
    if (header instanceof HTMLElement) headerRo?.observe(header);

    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onResize);
      placeholder.removeEventListener('transitionend', onWidthTransitionEnd);
      ro.disconnect();
      headerRo?.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      clearFixed();
    };
  }, []);

  return (
    <div
      ref={placeholderRef}
      className={`relative hidden min-w-0 self-start transition-[width] duration-500 ease-in-out md:block ${className || 'w-60 md:col-start-2 md:row-start-1'}`}
    >
      <aside
        ref={asideRef}
        className="flex w-full max-w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 shadow-sm dark:border-neutral-800 dark:bg-[#0F0F0F]"
      >
        {children}
      </aside>
    </div>
  );
}
