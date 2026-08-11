'use client';

import { useEffect, type RefObject } from 'react';
import {
  portfolioNavIsTop,
  type PortfolioNavPlacement,
} from '@/components/portfolio/portfolio-nav-settings';
import type { PortfolioNavSettings } from '@/components/portfolio/portfolio-settings-types';

const CLEARANCE_GAP_PX = 16;

/** Measured from the fixed top nav — 0px when the bar is hidden or not top-placed. */
export const PORTFOLIO_NAV_TOP_CLEARANCE_CSS_VAR = '--portfolio-nav-top-clearance';

export function portfolioNavTopClearanceActive(
  settings: Pick<PortfolioNavSettings, 'enabled' | 'navMode'>,
  effectivePlacement: PortfolioNavPlacement
): boolean {
  if (!settings.enabled) return false;
  // Dots / per-page chrome is not a fixed top bar — skip. Default, pages, and split need clearance.
  if ((settings.navMode ?? 'default') === 'per-page') return false;
  return portfolioNavIsTop(effectivePlacement);
}

/** Anchor / scroll target offset — grows with the measured top nav height. */
export function portfolioNavTopScrollMarginClass(): string {
  return 'scroll-mt-[max(7rem,var(--portfolio-nav-top-clearance,0px))]';
}

/** Hero copy column — never less than the editorial defaults, grows when the nav is taller. */
export function portfolioHeroTopClearancePaddingClass(): string {
  return 'pt-[max(5rem,var(--portfolio-nav-top-clearance,0px))] sm:pt-[max(6rem,var(--portfolio-nav-top-clearance,0px))] xl:pt-[max(7rem,var(--portfolio-nav-top-clearance,0px))] transition-[padding-top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';
}

/**
 * Publish the live bottom edge of the fixed top nav as a CSS variable on :root.
 * Cleared when the bar is hidden, collapsed away, or not top-placed — not a permanent inset.
 */
export function usePortfolioNavTopClearanceSync({
  rootRef,
  active,
  visible,
}: {
  rootRef: RefObject<HTMLElement | null>;
  active: boolean;
  visible: boolean;
}) {
  useEffect(() => {
    const root = document.documentElement;

    const clear = () => {
      root.style.removeProperty(PORTFOLIO_NAV_TOP_CLEARANCE_CSS_VAR);
      root.style.removeProperty('scroll-padding-top');
    };

    if (!active || !visible) {
      clear();
      return clear;
    }

    const el = rootRef.current;
    if (!el) {
      clear();
      return clear;
    }

    const update = () => {
      // Prefer the visible chrome box (bar / handle) — the outer <nav> can be full-bleed.
      const box =
        (el.querySelector('[data-portfolio-nav-clearance-box]') as HTMLElement | null) ?? el;
      const bottom = Math.ceil(box.getBoundingClientRect().bottom);
      const clearance = Math.max(0, bottom + CLEARANCE_GAP_PX);
      root.style.setProperty(PORTFOLIO_NAV_TOP_CLEARANCE_CSS_VAR, `${clearance}px`);
      root.style.setProperty('scroll-padding-top', `${clearance}px`);
    };

    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    const shell = el.querySelector('[data-portfolio-nav-clearance-box]');
    if (shell && ro) ro.observe(shell);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      ro?.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      clear();
    };
  }, [active, visible, rootRef]);
}
