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

/** Masthead is already at max weight (black) by identity — "regular" preserves it;
 *  the top of the scale has nowhere heavier to go, so semibold/bold both land on black too. */
const TITLE_WEIGHT_CLASS: Record<PortfolioWorkHeaderTitleWeight, string> = {
  light: '!font-semibold',
  regular: '!font-black',
  semibold: '!font-black',
  bold: '!font-black',
};

/**
 * Masthead — a monumental uppercase headline (independent of the section
 * title) with an intro line underneath. Words reveal from a mask, line by
 * line, the most editorial-newspaper of the set.
 */
export function WorkMastheadHeader({
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
  const headline = (presentation.mastheadHeadlineText || sectionTitle).trim();
  const intro = (sectionSubtitle || '').trim();

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
      const rules = pick('.pf-work-masthead-rule');
      const lines = pick('.pf-work-masthead-line');
      const rest = pick('.pf-work-masthead-item');

      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
      if (rules.length) {
        tl.fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 }, 0);
      }
      if (lines.length) {
        tl.set(lines, { yPercent: 112 }, 0.1);
        tl.to(lines, { yPercent: 0, duration: 0.95, ease: 'power3.out', stagger: 0.08 }, 0.16);
      }
      if (rest.length) {
        tl.fromTo(rest, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 }, 0.5);
      }

      gsap.fromTo(
        header,
        { opacity: 1, y: 0 },
        {
          opacity: 0.6,
          y: -8,
          ease: 'none',
          scrollTrigger: { trigger: header, start: 'top 18%', end: 'top -18%', scrub: 0.5, invalidateOnRefresh: true },
        }
      );
    }, header);

    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [animationEnabled, headline, intro]);

  const words = headline.split(/\s+/).filter(Boolean);

  return (
    <header
      ref={headerRef}
      className={`pf-work-masthead-header relative w-full ${centered ? 'text-center' : 'text-left'}`}
      style={{ marginBottom: `${WORK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      <div className={`flex flex-col gap-3 ${centered ? 'items-center' : 'items-start'}`}>
        <span
          className={`pf-work-masthead-rule block h-px w-full origin-left bg-current opacity-20 ${centered ? 'origin-center' : ''}`}
          aria-hidden
        />
        <h2
          className="mb-0 uppercase tracking-tight"
          style={workTitleColorStyle(presentation.titleColor)}
        >
          {words.map((word, index) => (
            <span key={index} className="pf-work-masthead-mask mr-[0.28em] inline-block overflow-hidden align-top">
              <span
                className={`pf-work-masthead-line inline-block leading-[0.95] ${TITLE_SIZE_CLASS[presentation.headerTitleSize ?? 'md']} ${TITLE_WEIGHT_CLASS[presentation.headerTitleWeight ?? 'regular']}`}
              >
                {word}
              </span>
            </span>
          ))}
        </h2>
        <span
          className={`pf-work-masthead-rule block h-px w-full origin-left bg-current opacity-20 ${centered ? 'origin-center' : ''}`}
          aria-hidden
        />
        {intro ? (
          <p
            className="pf-work-masthead-item mb-0 mt-1 max-w-xl text-sm leading-relaxed sm:text-base"
            style={workSubtitleColorStyle(presentation.subtitleColor)}
          >
            {intro}
          </p>
        ) : null}
        {trailing ? <div className="pf-work-masthead-item shrink-0">{trailing}</div> : null}
      </div>
    </header>
  );
}
