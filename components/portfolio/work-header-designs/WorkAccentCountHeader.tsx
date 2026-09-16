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

function isLaidOut(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

const TITLE_SIZE_CLASS: Record<PortfolioWorkHeaderTitleSize, string> = {
  sm: 'text-4xl sm:text-5xl lg:text-6xl',
  md: 'text-5xl sm:text-6xl lg:text-7xl',
  lg: 'text-6xl sm:text-7xl lg:text-8xl',
  xl: 'text-7xl sm:text-8xl lg:text-9xl',
};

const DEFAULT_BADGE_TEXT = '{count}+ projects';
const DEFAULT_LEAD_TEXT = 'A selection of recent work.';

function badgeSwatch(color: 'accent' | 'principal' | 'secondaire', accentColor: string): string {
  if (color === 'principal') return 'var(--pf-palette-principal, #f97316)';
  if (color === 'secondaire') return 'var(--pf-palette-secondaire, #3b82f6)';
  return accentColor || 'var(--pf-palette-principal, #f97316)';
}

/**
 * Accent count — a small accent-colored badge (project count) above a lead line
 * and the title. The badge is the signature motion beat: a soft scale-in before
 * the title reveals.
 */
export function WorkAccentCountHeader({
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
  const lead = (presentation.accentCountLeadText || DEFAULT_LEAD_TEXT).trim();
  const badgeTemplate = presentation.accentCountBadgeText || DEFAULT_BADGE_TEXT;
  const badgeText = badgeTemplate.replace('{count}', String(projectCount ?? 0));
  const badgeColor = badgeSwatch(presentation.accentCountBadgeColor ?? 'accent', presentation.ctaColor);

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
      const badge = header.querySelector<HTMLElement>('.pf-work-accent-badge');
      const lines = pick('.pf-work-accent-title-line');
      const rest = pick('.pf-work-accent-item');

      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
      if (badge) {
        tl.fromTo(badge, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, 0);
      }
      if (lines.length) {
        tl.set(lines, { yPercent: 110 }, 0.14);
        tl.to(lines, { yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06 }, 0.2);
      }
      if (rest.length) {
        tl.fromTo(rest, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 }, 0.4);
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
  }, [animationEnabled, title, lead, badgeText]);

  return (
    <header
      ref={headerRef}
      className={`pf-work-accent-header relative w-full ${centered ? 'text-center' : 'text-left'}`}
      style={{ marginBottom: `${WORK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      <div className={`flex flex-col gap-4 ${centered ? 'items-center' : 'items-start'}`}>
        <div className="min-w-0">
          {badgeText ? (
            <span
              className="pf-work-accent-badge mb-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white"
              style={{ backgroundColor: badgeColor }}
            >
              {badgeText}
            </span>
          ) : null}
          {lead ? (
            <p className="pf-work-accent-item mb-2 text-sm text-neutral-500">{lead}</p>
          ) : null}
          <h2
            className={`mb-0 ${workHeaderFontClass(presentation.titleFont, 'title')} ${TITLE_SIZE_CLASS[presentation.headerTitleSize ?? 'md']} ${WORK_HEADER_TITLE_WEIGHT_CLASS[presentation.headerTitleWeight ?? 'regular']} leading-[1.05]`}
            style={workTitleColorStyle(presentation.titleColor)}
          >
            <span className="pf-work-accent-title-mask block overflow-hidden">
              <span className="pf-work-accent-title-line block">{title}</span>
            </span>
          </h2>
          {sectionSubtitle ? (
            <p
              className={`pf-work-accent-item mb-0 mt-3 max-w-xl ${workHeaderFontClass(presentation.subtitleFont, 'subtitle')} text-sm leading-relaxed sm:text-base`}
              style={workSubtitleColorStyle(presentation.subtitleColor)}
            >
              {sectionSubtitle}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="pf-work-accent-item shrink-0">{trailing}</div> : null}
      </div>
    </header>
  );
}
