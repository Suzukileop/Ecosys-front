'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  DEFAULT_WORK_PRESENTATION,
  WORK_HEADER_MARGIN_BOTTOM_REM,
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

const TITLE_SIZE_CLASS: Record<PortfolioWorkHeaderTitleSize, string> = {
  sm: 'text-4xl sm:text-5xl lg:text-6xl',
  md: 'text-5xl sm:text-6xl lg:text-7xl',
  lg: 'text-6xl sm:text-7xl lg:text-8xl',
  xl: 'text-7xl sm:text-8xl lg:text-9xl',
};

/** Billboard's real title is light by identity — "regular" preserves that prior default. */
const TITLE_WEIGHT_CLASS: Record<PortfolioWorkHeaderTitleWeight, string> = {
  light: '!font-thin',
  regular: '!font-light',
  semibold: '!font-medium',
  bold: '!font-semibold',
};

const DEFAULT_BIG_WORD = 'WORK';
const DEFAULT_COUNT_TEXT = '{count} projects — selected work below';

/**
 * Billboard — a big faint outlined word fills the background, the real title
 * sits on top, a small project-count line closes the block. One dramatic
 * entrance: the big word scales down into place, then the title masks in.
 */
export function WorkBillboardHeader({
  sectionTitle,
  sectionSubtitle,
  presentation: presentationProp,
  trailing,
  projectCount,
}: {
  sectionTitle: string;
  sectionSubtitle?: string;
  presentation?: PortfolioWorkPresentationSettings;
  trailing?: ReactNode;
  projectCount?: number;
}) {
  const presentation = presentationProp ?? DEFAULT_WORK_PRESENTATION;
  const centered = presentation.headerAlignment === 'center';
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const title = sectionTitle.trim();
  const bigWord = (presentation.billboardBigWord || DEFAULT_BIG_WORD).trim();
  const countTemplate = presentation.billboardCountText || DEFAULT_COUNT_TEXT;
  const countText = countTemplate.replace('{count}', String(projectCount ?? 0));

  const headerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    if (prefersReducedMotion() || !animationEnabled) return;

    gsap.registerPlugin(ScrollTrigger);
    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 90);

    const ctx = gsap.context(() => {
      const pick = (selector: string) =>
        [...header.querySelectorAll<HTMLElement>(selector)].filter(isLaidOut);
      const big = header.querySelector<HTMLElement>('.pf-work-billboard-big');
      const lines = pick('.pf-work-billboard-title-line');
      const rest = pick('.pf-work-billboard-item');

      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
      if (big) {
        tl.fromTo(
          big,
          { opacity: 0, scale: 1.08 },
          { opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out' },
          0
        );
      }
      if (lines.length) {
        tl.set(lines, { yPercent: 112 }, 0.28);
        tl.to(lines, { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.06 }, 0.34);
      }
      if (rest.length) {
        tl.fromTo(rest, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 }, 0.62);
      }

      gsap.fromTo(
        header,
        { opacity: 1, y: 0 },
        {
          opacity: 0.6,
          y: -10,
          ease: 'none',
          scrollTrigger: { trigger: header, start: 'top 16%', end: 'top -20%', scrub: 0.55, invalidateOnRefresh: true },
        }
      );
    }, header);

    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [animationEnabled, title, bigWord, countText]);

  return (
    <header
      ref={headerRef}
      className={`pf-work-billboard-header relative w-full overflow-hidden ${centered ? 'text-center' : 'text-left'}`}
      style={{ marginBottom: `${WORK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      <span
        aria-hidden
        className={`pf-work-billboard-big pointer-events-none absolute inset-x-0 top-0 select-none text-[7rem] font-black uppercase leading-none tracking-tight opacity-[0.06] sm:text-[9rem] lg:text-[11rem] ${
          centered ? 'text-center' : 'text-left'
        }`}
        style={{ WebkitTextStroke: '1px currentColor', color: workTitleColorStyle(presentation.titleColor).color }}
      >
        {bigWord}
      </span>
      <div className={`relative flex flex-col gap-3 pt-14 sm:pt-20 ${centered ? 'items-center' : 'items-start'}`}>
        <div className="min-w-0">
          <h2
            className={`mb-0 ${TITLE_SIZE_CLASS[presentation.headerTitleSize ?? 'md']} ${TITLE_WEIGHT_CLASS[presentation.headerTitleWeight ?? 'regular']} tracking-[-0.02em] leading-[1.05]`}
            style={workTitleColorStyle(presentation.titleColor)}
          >
            <span className="pf-work-billboard-title-mask block overflow-hidden">
              <span className="pf-work-billboard-title-line block">{title}</span>
            </span>
          </h2>
          {sectionSubtitle ? (
            <p
              className="pf-work-billboard-item mb-0 mt-3 max-w-xl text-sm leading-relaxed sm:text-base"
              style={workSubtitleColorStyle(presentation.subtitleColor)}
            >
              {sectionSubtitle}
            </p>
          ) : null}
          {countText ? (
            <p className="pf-work-billboard-item mb-0 mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {countText}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="pf-work-billboard-item shrink-0">{trailing}</div> : null}
      </div>
    </header>
  );
}
