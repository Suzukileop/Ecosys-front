'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  DEFAULT_WORK_PRESENTATION,
  WORK_HEADER_MARGIN_BOTTOM_REM,
  WORK_HEADER_TITLE_WEIGHT_CLASS,
  workSubtitleColorStyle,
  workTitleColorStyle,
  type PortfolioWorkHeaderTitleSize,
  type PortfolioWorkPresentationSettings,
} from '@/components/portfolio/portfolio-work-settings';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isLaidOut(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

const DEFAULT_LABEL_TEXT = 'Portfolio';

const TITLE_SIZE_CLASS: Record<PortfolioWorkHeaderTitleSize, string> = {
  sm: 'text-4xl sm:text-5xl lg:text-6xl',
  md: 'text-5xl sm:text-6xl lg:text-7xl',
  lg: 'text-6xl sm:text-7xl lg:text-8xl',
  xl: 'text-7xl sm:text-8xl lg:text-9xl',
};

/**
 * Serif lead — a small uppercase label above a large serif title. Restrained,
 * editorial, one signature move: the label fades in first, then the serif
 * title rises from a mask.
 */
export function WorkSerifLeadHeader({
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
  const label = (presentation.serifLeadLabelText || DEFAULT_LABEL_TEXT).trim();

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
      const labelEl = header.querySelector<HTMLElement>('.pf-work-serif-label');
      const lines = pick('.pf-work-serif-title-line');
      const rest = pick('.pf-work-serif-item');

      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
      if (labelEl) {
        tl.fromTo(labelEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);
      }
      if (lines.length) {
        tl.set(lines, { yPercent: 112 }, 0.16);
        tl.to(lines, { yPercent: 0, duration: 1.05, ease: 'power3.out', stagger: 0.07 }, 0.24);
      }
      if (rest.length) {
        tl.fromTo(rest, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 }, 0.55);
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
  }, [animationEnabled, title, label]);

  return (
    <header
      ref={headerRef}
      className={`pf-work-serif-header relative w-full ${centered ? 'text-center' : 'text-left'}`}
      style={{ marginBottom: `${WORK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      <div className={`flex flex-col gap-3 ${centered ? 'items-center' : 'items-start'}`}>
        <div className="min-w-0">
          <p className="pf-work-serif-label mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-neutral-500">
            {label}
          </p>
          <h2
            className={`mb-0 font-serif italic ${TITLE_SIZE_CLASS[presentation.headerTitleSize ?? 'md']} ${WORK_HEADER_TITLE_WEIGHT_CLASS[presentation.headerTitleWeight ?? 'regular']} leading-[1.05]`}
            style={workTitleColorStyle(presentation.titleColor)}
          >
            <span className="pf-work-serif-title-mask block overflow-hidden">
              <span className="pf-work-serif-title-line block">{title}</span>
            </span>
          </h2>
          {sectionSubtitle ? (
            <p
              className="pf-work-serif-item mb-0 mt-3 max-w-xl text-sm leading-relaxed sm:text-base"
              style={workSubtitleColorStyle(presentation.subtitleColor)}
            >
              {sectionSubtitle}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="pf-work-serif-item shrink-0">{trailing}</div> : null}
      </div>
    </header>
  );
}
