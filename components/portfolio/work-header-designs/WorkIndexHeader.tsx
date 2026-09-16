'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  DEFAULT_WORK_PRESENTATION,
  WORK_HEADER_MARGIN_BOTTOM_REM,
  WORK_HEADER_TITLE_WEIGHT_CLASS,
  workHeaderFontClass,
  workSubtitleColorStyle,
  workTitleColorStyle,
  type PortfolioWorkHeaderTitleSize,
  type PortfolioWorkPresentationSettings,
} from '@/components/portfolio/portfolio-work-settings';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const TITLE_SIZE_CLASS: Record<PortfolioWorkHeaderTitleSize, string> = {
  sm: 'text-4xl sm:text-5xl lg:text-6xl',
  md: 'text-5xl sm:text-6xl lg:text-7xl',
  lg: 'text-6xl sm:text-7xl lg:text-8xl',
  xl: 'text-7xl sm:text-8xl lg:text-9xl',
};

/**
 * Index — a large faded numeral beside the title, editorial-catalog style.
 * Numeral scales in first, title line-reveals alongside it.
 */
export function WorkIndexHeader({
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
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const title = sectionTitle.trim();
  const subtitle = sectionSubtitle?.trim() || '';
  const titleInk = workTitleColorStyle(presentation.titleColor).color as string;

  const headerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    if (prefersReducedMotion() || !animationEnabled) return;

    gsap.registerPlugin(ScrollTrigger);
    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 90);

    const ctx = gsap.context(() => {
      const numeral = header.querySelector<HTMLElement>('.pf-work-index-numeral');
      const lines = header.querySelectorAll<HTMLElement>('.pf-work-index-title-line');
      const sub = header.querySelector<HTMLElement>('.pf-work-index-sub');

      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
      if (numeral) {
        tl.fromTo(
          numeral,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out' },
          0
        );
      }
      if (lines.length) {
        tl.set(lines, { yPercent: 110 }, 0);
        tl.to(lines, { yPercent: 0, duration: 0.95, ease: 'power3.out', stagger: 0.06 }, 0.12);
      }
      if (sub) {
        tl.fromTo(sub, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.38);
      }

      gsap.fromTo(
        header,
        { opacity: 1, y: 0 },
        {
          opacity: 0.6,
          y: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: header,
            start: 'top 18%',
            end: 'top -18%',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        }
      );
    }, header);

    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [animationEnabled, title, subtitle]);

  return (
    <header
      ref={headerRef}
      className="pf-work-index-header relative w-full text-left"
      style={{ marginBottom: `${WORK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      <div className="flex items-start gap-5 sm:gap-7">
        <span
          className="pf-work-index-numeral shrink-0 text-5xl font-light leading-none tracking-[-0.03em] sm:text-6xl lg:text-7xl"
          style={{ color: `color-mix(in srgb, ${titleInk} 16%, transparent)` }}
          aria-hidden
        >
          01
        </span>
        <div className="min-w-0 flex-1 pt-1 sm:pt-2">
          <h2
            className={`mb-0 ${workHeaderFontClass(presentation.titleFont, 'title')} ${TITLE_SIZE_CLASS[presentation.headerTitleSize ?? 'md']} ${WORK_HEADER_TITLE_WEIGHT_CLASS[presentation.headerTitleWeight ?? 'regular']} leading-[1.05]`}
            style={workTitleColorStyle(presentation.titleColor)}
          >
            <span className="pf-work-index-title-mask block overflow-hidden">
              <span className="pf-work-index-title-line block">{title}</span>
            </span>
          </h2>
          {subtitle ? (
            <p
              className={`pf-work-index-sub mb-0 mt-3 max-w-md ${workHeaderFontClass(presentation.subtitleFont, 'subtitle')} text-sm leading-relaxed sm:text-base`}
              style={workSubtitleColorStyle(presentation.subtitleColor)}
            >
              {subtitle}
            </p>
          ) : null}
          {trailing ? <div className="mt-4">{trailing}</div> : null}
        </div>
      </div>
    </header>
  );
}
