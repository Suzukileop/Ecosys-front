'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  DEFAULT_WORK_PRESENTATION,
  WORK_HEADER_MARGIN_BOTTOM_REM,
  workHeaderFontClass,
  workSubtitleColorStyle,
  workTitleColorStyle,
  type PortfolioWorkHeaderTitleSize,
  type PortfolioWorkHeaderTitleWeight,
  type PortfolioWorkPresentationSettings,
} from '@/components/portfolio/portfolio-work-settings';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isLaidOut(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

/** Nearest scrollable ancestor — ScrollTrigger needs this explicitly inside an
 *  embedded/iframe dashboard preview, where `window` isn't the real scroller. */
function workHeaderScrollParent(el: HTMLElement | null): HTMLElement | undefined {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return undefined;
}

const TITLE_SIZE_CLASS: Record<PortfolioWorkHeaderTitleSize, string> = {
  sm: 'text-4xl sm:text-5xl lg:text-6xl',
  md: 'text-5xl sm:text-6xl lg:text-7xl',
  lg: 'text-6xl sm:text-7xl lg:text-8xl',
  xl: 'text-7xl sm:text-8xl lg:text-9xl',
};

/** Editorial's identity is a light title — "regular" here preserves that prior default,
 *  the other 3 steps adjust from it, rather than the generic light/normal/semibold/bold scale. */
const TITLE_WEIGHT_CLASS: Record<PortfolioWorkHeaderTitleWeight, string> = {
  light: '!font-thin',
  regular: '!font-light',
  semibold: '!font-medium',
  bold: '!font-semibold',
};

/**
 * Editorial — kicker + masked line-reveal title + subtitle, with a subtle
 * scroll-scrubbed recede on the whole block. The premium GSAP treatment.
 */
export function WorkEditorialHeader({
  sectionTitle,
  sectionSubtitle,
  presentation: presentationProp,
  trailing,
}: {
  sectionTitle: string;
  sectionSubtitle?: string;
  presentation?: PortfolioWorkPresentationSettings;
  trailing?: ReactNode;
}) {
  const presentation = presentationProp ?? DEFAULT_WORK_PRESENTATION;
  const centered = presentation.headerAlignment === 'center';
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const title = sectionTitle.trim();
  const subtitle = sectionSubtitle?.trim() || '';
  const titleInk = workTitleColorStyle(presentation.titleColor).color as string;
  const kickerInk = `color-mix(in srgb, ${titleInk} 38%, transparent)`;

  const headerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    if (prefersReducedMotion() || !animationEnabled) return;

    gsap.registerPlugin(ScrollTrigger);
    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        // GSAP's ScrollTrigger.refresh() can throw internally on an edge case
        // (e.g. "Cannot read properties of undefined (reading 'end')") during
        // its own init-time recompute; uncaught, that crash propagates up
        // through this deferred setTimeout with no React boundary to catch it
        // and takes down the whole page. Never let a best-effort refresh do that.
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);

    const ctx = gsap.context(() => {
      const pick = (selector: string) =>
        [...header.querySelectorAll<HTMLElement>(selector)].filter(isLaidOut);
      const kicker = pick('.pf-work-editorial-kicker');
      const lines = pick('.pf-work-editorial-title-line');
      const subs = pick('.pf-work-editorial-sub');
      const stage = header.querySelector<HTMLElement>('.pf-work-editorial-stage');

      // Gated by ScrollTrigger, not fired on mount — a header mounted below
      // the fold must stay in its hidden "from" state (set immediately, no
      // flash) until it actually scrolls into view, not play-then-finish
      // off-screen and show up already static.
      const tl = gsap.timeline({
        defaults: { overwrite: 'auto' },
        scrollTrigger: {
          trigger: header,
          scroller: workHeaderScrollParent(header),
          start: 'top 85%',
          once: true,
        },
      });
      if (kicker.length) tl.fromTo(kicker, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0);
      if (lines.length) {
        tl.set(lines, { yPercent: 110 }, 0);
        tl.to(lines, { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.07 }, 0.14);
      }
      if (subs.length) {
        tl.set(subs, { y: 14, opacity: 0 }, 0);
        tl.to(subs, { y: 0, opacity: 1, duration: 0.68, ease: 'power3.out' }, 0.4);
      }

      if (stage) {
        gsap.fromTo(
          stage,
          { opacity: 1, y: 0 },
          {
            opacity: 0.55,
            y: -10,
            ease: 'none',
            scrollTrigger: {
              trigger: header,
              scroller: workHeaderScrollParent(header),
              start: 'top 20%',
              end: 'top -20%',
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          }
        );
      }
    }, header);

    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [animationEnabled, title, subtitle]);

  return (
    <header
      ref={headerRef}
      className={`pf-work-editorial-header relative w-full ${centered ? 'text-center' : 'text-left'}`}
      style={{ marginBottom: `${WORK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      <div className={`pf-work-editorial-stage flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between ${centered ? 'sm:flex-col sm:items-center' : ''}`}>
        <div className="min-w-0 max-w-3xl">
          <p
            className="pf-work-editorial-kicker mb-0 text-[0.68rem] font-semibold uppercase tracking-[0.24em]"
            style={{ color: kickerInk }}
          >
            Portfolio
          </p>
          <h2
            className={`mb-0 mt-3 ${workHeaderFontClass(presentation.titleFont, 'title')} ${TITLE_SIZE_CLASS[presentation.headerTitleSize ?? 'md']} ${TITLE_WEIGHT_CLASS[presentation.headerTitleWeight ?? 'regular']} tracking-[-0.03em] lg:leading-[0.98]`}
            style={workTitleColorStyle(presentation.titleColor)}
          >
            <span className="pf-work-editorial-title-mask block overflow-hidden">
              <span className="pf-work-editorial-title-line block">{title}</span>
            </span>
          </h2>
          {subtitle ? (
            <p
              className={`pf-work-editorial-sub mb-0 mt-6 max-w-xl ${workHeaderFontClass(presentation.subtitleFont, 'subtitle')} text-sm leading-relaxed sm:text-base`}
              style={workSubtitleColorStyle(presentation.subtitleColor)}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </header>
  );
}
