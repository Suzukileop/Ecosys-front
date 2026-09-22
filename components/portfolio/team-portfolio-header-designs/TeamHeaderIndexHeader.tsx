'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { DEFAULT_TEAM_PRESENTATION, type PortfolioTeamPresentationSettings } from '@/components/portfolio/portfolio-team-settings';
import {
  TEAM_HEADER_MARGIN_BOTTOM_REM,
  teamHeaderPaletteTokenColor,
  type PortfolioTeamHeaderTitleSize,
  type PortfolioTeamHeaderTitleWeight,
} from '@/components/portfolio/portfolio-team-header-settings';

const DEFAULT_LABEL_TEXT = 'Index';
const DEFAULT_TITLE_TEXT = 'Meet the team';
const DEFAULT_SUBTITLE_TEXT = 'The people behind every project, in one place.';
const COUNT_DURATION_MS = 800;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Label is a small uppercase kicker — sizes stay compact at every step. */
const LABEL_SIZE: Record<PortfolioTeamHeaderTitleSize, string> = {
  sm: '0.6rem',
  md: '0.68rem',
  lg: '0.76rem',
  xl: '0.85rem',
};
const LABEL_WEIGHT: Record<PortfolioTeamHeaderTitleWeight, number> = {
  light: 400,
  regular: 600,
  semibold: 700,
  bold: 800,
};
const TITLE_SIZE: Record<PortfolioTeamHeaderTitleSize, string> = {
  sm: 'clamp(1.9rem, 4.4vw, 3.1rem)',
  md: 'clamp(2.3rem, 5.3vw, 3.85rem)',
  lg: 'clamp(2.75rem, 6.2vw, 4.6rem)',
  xl: 'clamp(3.2rem, 7.1vw, 5.4rem)',
};
const TITLE_WEIGHT: Record<PortfolioTeamHeaderTitleWeight, number> = {
  light: 300,
  regular: 300,
  semibold: 500,
  bold: 650,
};
const SUBTITLE_SIZE: Record<PortfolioTeamHeaderTitleSize, string> = {
  sm: '0.8125rem',
  md: '0.9375rem',
  lg: '1.0625rem',
  xl: '1.1875rem',
};
const SUBTITLE_WEIGHT: Record<PortfolioTeamHeaderTitleWeight, number> = {
  light: 350,
  regular: 400,
  semibold: 500,
  bold: 600,
};

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Index — a ledger-style divider rule up top, a counting numeral (the team
 * member count itself, ticking up from zero) on the left, split from the
 * title by a vertical rule. Strictly two phases, driven by React state (not
 * left to CSS/GSAP timing to get out of sync with re-renders): first the
 * counter runs on its own, and only once it fully finishes does the
 * title/subtitle on the right fade in — never before, never partially.
 */
export function TeamHeaderIndexHeader({
  presentation: presentationProp,
  trailing,
  itemCount,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioTeamPresentationSettings;
  trailing?: ReactNode;
  itemCount?: number;
}) {
  const presentation = presentationProp ?? DEFAULT_TEAM_PRESENTATION;
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const title = (presentation.headerIndexTitleText || DEFAULT_TITLE_TEXT).trim();
  const subtitle = (presentation.headerIndexSubtitleText || DEFAULT_SUBTITLE_TEXT).trim();
  const label = (presentation.headerIndexLabelText || DEFAULT_LABEL_TEXT).trim();
  const count = Math.max(0, itemCount ?? 0);
  const countLabelCustom = presentation.headerIndexCountLabelText?.trim();
  const countLabel = countLabelCustom || (count === 1 ? 'Member' : 'Members');

  const labelTone = teamHeaderPaletteTokenColor(presentation.headerIndexLabelColor ?? 'texteFort');
  const numberTone = teamHeaderPaletteTokenColor(presentation.headerIndexNumberColor ?? 'principal');
  const titleTone = teamHeaderPaletteTokenColor(presentation.headerIndexTitleColor ?? 'texteFort');
  const subtitleTone = teamHeaderPaletteTokenColor(presentation.headerIndexSubtitleColor ?? 'texteFort');
  const labelMuted = `color-mix(in srgb, ${labelTone} 55%, transparent)`;
  const ruleTone = `color-mix(in srgb, ${titleTone} 16%, transparent)`;
  const ruleToneSoft = `color-mix(in srgb, ${titleTone} 12%, transparent)`;

  const labelFontSize = LABEL_SIZE[presentation.headerIndexLabelSize ?? 'md'];
  const labelFontWeight = LABEL_WEIGHT[presentation.headerIndexLabelWeight ?? 'regular'];
  const titleFontSize = TITLE_SIZE[presentation.headerIndexTitleSize ?? 'md'];
  const titleFontWeight = TITLE_WEIGHT[presentation.headerIndexTitleWeight ?? 'regular'];
  const subtitleFontSize = SUBTITLE_SIZE[presentation.headerIndexSubtitleSize ?? 'md'];
  const subtitleFontWeight = SUBTITLE_WEIGHT[presentation.headerIndexSubtitleWeight ?? 'regular'];

  const headerRef = useRef<HTMLElement>(null);

  // `revealed` only ever flips true once the count-up has fully finished —
  // it's real React state, so a re-render can never silently snap the
  // title/subtitle back to hidden or show them early.
  const [leftVisible, setLeftVisible] = useState(!animationEnabled);
  const [revealed, setRevealed] = useState(!animationEnabled);
  const [displayCount, setDisplayCount] = useState(animationEnabled ? 0 : count);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const skip = !animationEnabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (skip) {
      // Deferred a tick (not a synchronous setState in the effect body) —
      // avoids the cascading-render lint warning while still resolving
      // effectively immediately from the user's perspective.
      queueMicrotask(() => {
        setLeftVisible(true);
        setRevealed(true);
        setDisplayCount(count);
      });
      return;
    }

    const header = headerRef.current;
    if (!header) return;

    let cancelled = false;
    let rafId = 0;

    const runCountUp = () => {
      setLeftVisible(true);
      const start = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const progress = Math.min(1, (now - start) / COUNT_DURATION_MS);
        setDisplayCount(Math.round(easeOutCubic(progress) * count));
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setRevealed(true);
        }
      };
      rafId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCountUp();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '50px' }
    );
    observer.observe(header);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [animationEnabled, count]);

  const leftStyle = (delayMs: number): CSSProperties => ({
    opacity: leftVisible ? 1 : 0,
    transition: `opacity 0.5s ${EASE} ${delayMs}ms`,
  });
  const scaleStyle = (axis: 'X' | 'Y', delayMs: number): CSSProperties => ({
    transform: leftVisible ? `scale${axis}(1)` : `scale${axis}(0)`,
    transition: `transform 0.6s ${EASE} ${delayMs}ms`,
  });
  const revealStyle = (delayMs: number): CSSProperties => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.98)',
    transition: `opacity 0.7s ${EASE} ${delayMs}ms, transform 0.7s ${EASE} ${delayMs}ms`,
  });

  return (
    <header
      ref={headerRef}
      className="pf-team-header-index-header relative w-full text-left"
      style={{ marginBottom: `${TEAM_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      <div className="mb-6 flex items-center gap-4 sm:mb-8">
        <span
          className="shrink-0 uppercase leading-none tracking-[0.28em]"
          style={{ color: labelMuted, fontSize: labelFontSize, fontWeight: labelFontWeight, ...leftStyle(0) }}
        >
          {label}
        </span>
        <span
          className="h-px flex-1 origin-left"
          style={{ backgroundColor: ruleTone, ...scaleStyle('X', 40) }}
          aria-hidden
        />
      </div>

      <div className="flex items-stretch gap-6 sm:gap-10">
        <div className="flex shrink-0 flex-col items-start">
          <span
            className="text-6xl font-light leading-none tracking-[-0.03em] sm:text-7xl lg:text-8xl"
            style={{ color: numberTone }}
          >
            {String(displayCount).padStart(2, '0')}
          </span>
          <span
            className="mt-2 text-[0.68rem] font-medium uppercase tracking-[0.16em]"
            style={{ color: labelMuted, ...leftStyle(150) }}
          >
            {countLabel}
          </span>
        </div>

        <span className="w-px origin-top self-stretch" style={{ backgroundColor: ruleToneSoft, ...scaleStyle('Y', 100) }} aria-hidden />

        <div className="min-w-0 flex-1 pt-1">
          <h2
            className="mb-0 leading-[1.05]"
            style={{ color: titleTone, fontSize: titleFontSize, fontWeight: titleFontWeight, ...revealStyle(0) }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              className="mb-0 mt-3 max-w-md leading-relaxed"
              style={{ color: subtitleTone, fontSize: subtitleFontSize, fontWeight: subtitleFontWeight, ...revealStyle(120) }}
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
