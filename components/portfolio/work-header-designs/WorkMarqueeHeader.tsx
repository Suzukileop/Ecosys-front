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

const TITLE_SIZE_CLASS: Record<PortfolioWorkHeaderTitleSize, string> = {
  sm: 'text-4xl sm:text-5xl lg:text-6xl',
  md: 'text-5xl sm:text-6xl lg:text-7xl',
  lg: 'text-6xl sm:text-7xl lg:text-8xl',
  xl: 'text-7xl sm:text-8xl lg:text-9xl',
};

/** Marquee's foreground title is bold by identity — "regular" preserves that prior default. */
const TITLE_WEIGHT_CLASS: Record<PortfolioWorkHeaderTitleWeight, string> = {
  light: '!font-normal',
  regular: '!font-bold',
  semibold: '!font-extrabold',
  bold: '!font-black',
};

/**
 * Marquee — a bold foreground title over a slow, continuously scrolling
 * decorative word band. Entrance reveal + an endless GSAP marquee loop.
 */
export function WorkMarqueeHeader({
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
  const bandWord = (title || 'PORTFOLIO').toUpperCase();
  const bandText = Array.from({ length: 8 }, () => bandWord).join(' • ');

  const headerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const track = header.querySelector<HTMLElement>('.pf-work-marquee-track');
    const foregroundBlock = header.querySelector<HTMLElement>('.pf-work-marquee-foreground');
    const reduced = prefersReducedMotion() || !animationEnabled;

    if (reduced) {
      const foreground = header.querySelectorAll<HTMLElement>('.pf-work-marquee-item');
      gsap.set(foreground, { opacity: 1, y: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 90);

    const ctx = gsap.context(() => {
      const foreground = header.querySelectorAll<HTMLElement>('.pf-work-marquee-item');
      if (foreground.length) {
        gsap.fromTo(
          foreground,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', stagger: 0.08 }
        );
      }

      if (track) {
        gsap.to(track, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
      }

      if (foregroundBlock) {
        gsap.fromTo(
          foregroundBlock,
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
      }
    }, header);

    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [animationEnabled, title, subtitle]);

  return (
    <header
      ref={headerRef}
      className={`pf-work-marquee-header relative w-full overflow-hidden ${centered ? 'text-center' : 'text-left'}`}
      style={{ marginBottom: `${WORK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none overflow-hidden opacity-[0.05]"
        aria-hidden
      >
        <div className="pf-work-marquee-track flex w-max whitespace-nowrap">
          <span
            className="px-4 text-7xl font-black uppercase tracking-tight sm:text-9xl"
            style={{ color: titleInk }}
          >
            {bandText}
          </span>
          <span
            className="px-4 text-7xl font-black uppercase tracking-tight sm:text-9xl"
            style={{ color: titleInk }}
          >
            {bandText}
          </span>
        </div>
      </div>

      <div className={`pf-work-marquee-foreground relative flex flex-col gap-4 ${centered ? 'items-center' : 'items-start'}`}>
        <h2
          className={`pf-work-marquee-item mb-0 ${workHeaderFontClass(presentation.titleFont, 'title')} ${TITLE_SIZE_CLASS[presentation.headerTitleSize ?? 'md']} ${TITLE_WEIGHT_CLASS[presentation.headerTitleWeight ?? 'regular']} tracking-[-0.02em]`}
          style={workTitleColorStyle(presentation.titleColor)}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            className={`pf-work-marquee-item mb-0 max-w-xl ${workHeaderFontClass(presentation.subtitleFont, 'subtitle')} text-sm leading-relaxed sm:text-base`}
            style={workSubtitleColorStyle(presentation.subtitleColor)}
          >
            {subtitle}
          </p>
        ) : null}
        {trailing ? <div className="pf-work-marquee-item">{trailing}</div> : null}
      </div>
    </header>
  );
}
