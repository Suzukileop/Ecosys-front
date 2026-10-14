'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { APP_FIELD } from '@/components/landing/landingBrand';

const GAP_PX = 12;

function getHeaderBottom(): number {
  const header = document.querySelector('[data-dashboard-main] > header');
  const headerBottom =
    header instanceof HTMLElement ? Math.round(header.getBoundingClientRect().bottom) + GAP_PX : 80;
  // Stay below the workspace sub-nav while it is still on screen; its own padding is the gap.
  const subNav = document.querySelector('[data-portfolio-workspace-nav]');
  if (subNav instanceof HTMLElement) {
    return Math.max(headerBottom, Math.round(subNav.getBoundingClientRect().bottom));
  }
  return headerBottom;
}

type ProfileSectionStickyAsideProps = {
  children: ReactNode;
  className?: string;
  /** Overrides the rail's own surface (border / fill / shadow). */
  surfaceClassName?: string;
  /** A rail taller than the viewport scrolls inside itself (no visible bar) instead of clipping. */
  scrollable?: boolean;
  /**
   * A short rail whose rows open menus (Refine dropdowns): once pinned, the menus may hang past the
   * rail's locked height instead of being clipped by it. Ignored when `scrollable`.
   */
  overflowVisible?: boolean;
};

/**
 * Fixes the portfolio sections rail under the dashboard header as soon as it
 * reaches the top. Height stays content-sized; only width animates on collapse.
 * maxHeight caps the rail when sticky.
 */
export function ProfileSectionStickyAside({
  children,
  className = '',
  surfaceClassName,
  scrollable = false,
  overflowVisible = false,
}: ProfileSectionStickyAsideProps) {
  /* Read once: a rail does not switch between scrolling and clipping while mounted. */
  const scrollableRef = useRef(scrollable);
  const overflowVisibleRef = useRef(overflowVisible);
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
      aside.style.overflowY = scrollableRef.current ? 'auto' : overflowVisibleRef.current ? 'visible' : 'hidden';
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

    /* Content that arrives or changes after the rail is pinned (a box loaded late, a filter's footer)
       re-measures it, so the locked height never clips the last box. */
    let contentRaf: number | null = null;
    const remeasure = () => {
      if (contentRaf != null) cancelAnimationFrame(contentRaf);
      contentRaf = requestAnimationFrame(() => {
        contentRaf = null;
        if (!fixedRef.current) return;
        aside.style.height = '';
        lockedHeightRef.current = null;
        syncFixedGeometry(false);
      });
    };
    const contentRo = new ResizeObserver(remeasure);
    const observeChildren = () => {
      contentRo.disconnect();
      Array.from(aside.children).forEach((child) => contentRo.observe(child));
    };
    observeChildren();
    const childrenMo = new MutationObserver(() => {
      observeChildren();
      remeasure();
    });
    childrenMo.observe(aside, { childList: true });

    update(true);

    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onResize, { passive: true });
    placeholder.addEventListener('transitionend', onWidthTransitionEnd);

    const ro = new ResizeObserver(onResize);
    ro.observe(placeholder);

    const header = document.querySelector('[data-dashboard-main] > header');
    const headerRo = header instanceof HTMLElement ? new ResizeObserver(onResize) : null;
    if (header instanceof HTMLElement) headerRo?.observe(header);
    const subNav = document.querySelector('[data-portfolio-workspace-nav]');
    if (subNav instanceof HTMLElement) headerRo?.observe(subNav);

    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onResize);
      placeholder.removeEventListener('transitionend', onWidthTransitionEnd);
      ro.disconnect();
      headerRo?.disconnect();
      contentRo.disconnect();
      childrenMo.disconnect();
      if (contentRaf != null) cancelAnimationFrame(contentRaf);
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
        className={`${
          surfaceClassName ||
          `gn-aside flex w-full max-w-full min-w-0 flex-col overflow-hidden rounded-lg ${APP_FIELD} dark:bg-white/[0.06]`
        } ${
          /* Its children keep their height (`shrink-0`): a pinned rail has a fixed height, and
             flex items would otherwise squeeze to fit it — boxes shrinking under their rows —
             instead of overflowing into the scroll. */
          scrollable ? 'overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0' : ''
        }`}
      >
        {children}
      </aside>
    </div>
  );
}
