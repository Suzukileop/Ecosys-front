'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { DEFAULT_STACK_PRESENTATION, type PortfolioStackPresentationSettings } from '@/components/portfolio/portfolio-stack-settings';
import {
  STACK_HEADER_MARGIN_BOTTOM_REM,
  stackHeaderPaletteTokenColor,
  type PortfolioStackHeaderTitleSize,
  type PortfolioStackHeaderTitleWeight,
} from '@/components/portfolio/portfolio-stack-header-settings';
import { usePortfolioHeaderMotionOff } from '@/components/portfolio/portfolio-motion-off';
import { headerElementVisibility } from '@/components/portfolio/portfolio-header-elements';
import { useT } from '@/lib/i18n/I18nProvider';

const DEFAULT_LABEL_TEXT = 'Index';
const DEFAULT_TITLE_TEXT = 'Core stack';
const DEFAULT_SUBTITLE_TEXT = 'Languages, frameworks, and tools.';
const COUNT_DURATION_MS = 800;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Label is a small uppercase kicker — sizes stay compact at every step. */
const LABEL_SIZE: Record<PortfolioStackHeaderTitleSize, string> = {
  sm: '0.6rem',
  md: '0.68rem',
  lg: '0.76rem',
  xl: '0.85rem',
};
const LABEL_WEIGHT: Record<PortfolioStackHeaderTitleWeight, number> = {
  light: 400,
  regular: 600,
  semibold: 700,
  bold: 800,
};
const TITLE_SIZE: Record<PortfolioStackHeaderTitleSize, string> = {
  sm: 'clamp(1.9rem, 4.4vw, 3.1rem)',
  md: 'clamp(2.3rem, 5.3vw, 3.85rem)',
  lg: 'clamp(2.75rem, 6.2vw, 4.6rem)',
  xl: 'clamp(3.2rem, 7.1vw, 5.4rem)',
};
const TITLE_WEIGHT: Record<PortfolioStackHeaderTitleWeight, number> = {
  light: 300,
  regular: 300,
  semibold: 500,
  bold: 650,
};
const SUBTITLE_SIZE: Record<PortfolioStackHeaderTitleSize, string> = {
  sm: '0.8125rem',
  md: '0.9375rem',
  lg: '1.0625rem',
  xl: '1.1875rem',
};
const SUBTITLE_WEIGHT: Record<PortfolioStackHeaderTitleWeight, number> = {
  light: 350,
  regular: 400,
  semibold: 500,
  bold: 600,
};

/** Nearest scrollable ancestor — the Studio preview scrolls inside a nested container, not `window`. */
function scrollParent(el: HTMLElement | null): HTMLElement | undefined {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && node.scrollHeight > node.clientHeight + 1) {
      return node;
    }
    node = node.parentElement;
  }
  return undefined;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Index — a ledger-style divider rule up top, a counting numeral (the stack
 * item count itself, ticking up from zero) on the left, split from the
 * title by a vertical rule. Strictly two phases, driven by React state (not
 * left to CSS/GSAP timing to get out of sync with re-renders): first the
 * counter runs on its own, and only once it fully finishes does the
 * title/subtitle on the right fade in — never before, never partially.
 *
 * It plays on every pass and leaves the way the scroll goes. Entering (top crosses 85% of the viewport):
 * rules draw, the numeral counts up from zero, then the title and subtitle rise in. Leaving (bottom crosses
 * 25%): the reverse order, faster — title and subtitle go first, then the numeral fades and the rules retract.
 * The text exits upward when scrolled past and downward when scrolled back, and re-enters from that side.
 */
export function StackHeaderIndexHeader({
  presentation: presentationProp,
  trailing,
  itemCount,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioStackPresentationSettings;
  trailing?: ReactNode;
  itemCount?: number;
}) {
  const t = useT();
  const presentation = presentationProp ?? DEFAULT_STACK_PRESENTATION;
  const motionOff = usePortfolioHeaderMotionOff();
  const animationEnabled = presentation.headerAnimationEnabled !== false && !motionOff;
  const show = headerElementVisibility(presentation.headerHiddenElements, 'index');
  const title = (presentation.headerIndexTitleText || DEFAULT_TITLE_TEXT).trim();
  const subtitle = (presentation.headerIndexSubtitleText || DEFAULT_SUBTITLE_TEXT).trim();
  const label = (presentation.headerIndexLabelText || DEFAULT_LABEL_TEXT).trim();
  const count = Math.max(0, itemCount ?? 0);
  const countLabelCustom = presentation.headerIndexCountLabelText?.trim();
  const countLabel = countLabelCustom || (count === 1 ? t('Technology') : t('Technologies'));

  const labelTone = stackHeaderPaletteTokenColor(presentation.headerIndexLabelColor ?? 'texteFort');
  const numberTone = stackHeaderPaletteTokenColor(presentation.headerIndexNumberColor ?? 'principal');
  const titleTone = stackHeaderPaletteTokenColor(presentation.headerIndexTitleColor ?? 'texteFort');
  const subtitleTone = stackHeaderPaletteTokenColor(presentation.headerIndexSubtitleColor ?? 'texteFort');
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
  /** Leaving: the transitions switch to the faster, reversed exit timing. */
  const [exiting, setExiting] = useState(false);
  /** Where the hidden title sits: +1 below (enters rising), -1 above (enters dropping). */
  const [side, setSide] = useState<1 | -1>(1);

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

    let rafId = 0;
    const stopCount = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const enter = () => {
      stopCount();
      setExiting(false);
      setRevealed(false);
      setDisplayCount(0);
      setLeftVisible(true);
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / COUNT_DURATION_MS);
        setDisplayCount(Math.round(easeOutCubic(progress) * count));
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          rafId = 0;
          setRevealed(true);
        }
      };
      rafId = requestAnimationFrame(tick);
    };
    // dir 1: out through the top (scrolled past); -1: out through the bottom (scrolled back up).
    const leave = (dir: 1 | -1) => {
      stopCount();
      setExiting(true);
      setSide(dir === 1 ? -1 : 1);
      setRevealed(false);
      setLeftVisible(false);
    };

    gsap.registerPlugin(ScrollTrigger);
    let trigger: ScrollTrigger | undefined;
    try {
      trigger = ScrollTrigger.create({
        trigger: header,
        scroller: scrollParent(header),
        start: 'top 85%',
        end: 'bottom 25%',
        onEnter: enter,
        onEnterBack: enter,
        onLeave: () => leave(1),
        onLeaveBack: () => leave(-1),
      });
    } catch (error) {
      // Never leave the header invisible because the trigger failed to initialise.
      console.error('[StackHeaderIndexHeader] ScrollTrigger setup failed', error);
      queueMicrotask(() => {
        setLeftVisible(true);
        setRevealed(true);
        setDisplayCount(count);
      });
    }

    // Positions are measured at creation; the page settles a moment later (fonts, other sections).
    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('[StackHeaderIndexHeader] deferred refresh() failed', error);
      }
    }, 90);

    return () => {
      window.clearTimeout(refreshId);
      stopCount();
      trigger?.kill();
    };
  }, [animationEnabled, count]);

  // Entering: left side first (rules draw, numeral counts), right side once the count is done.
  // Exiting: everything ~35% faster, right side first, then the left side.
  const dur = exiting ? 0.45 : 0.7;
  const leftStyle = (delayMs: number): CSSProperties => ({
    opacity: leftVisible ? 1 : 0,
    transition: `opacity ${exiting ? 0.4 : 0.5}s ${EASE} ${exiting ? 120 + delayMs / 2 : delayMs}ms`,
  });
  const scaleStyle = (axis: 'X' | 'Y', delayMs: number): CSSProperties => ({
    transform: leftVisible ? `scale${axis}(1)` : `scale${axis}(0)`,
    transition: `transform ${exiting ? 0.45 : 0.6}s ${EASE} ${exiting ? 160 + delayMs / 2 : delayMs}ms`,
  });
  const revealStyle = (delayMs: number): CSSProperties => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translateY(0) scale(1)' : `translateY(${18 * side}px) scale(0.98)`,
    transition: `opacity ${dur}s ${EASE} ${exiting ? 0 : delayMs}ms, transform ${dur}s ${EASE} ${exiting ? 0 : delayMs}ms`,
  });

  return (
    <header
      ref={headerRef}
      className="pf-stack-header-index-header relative w-full text-left"
      style={{ marginBottom: `${STACK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      <div className="mb-6 flex items-center gap-4 sm:mb-8">
        {show('label') ? (
          <span
            className="shrink-0 uppercase leading-none tracking-[0.28em]"
            style={{ color: labelMuted, fontSize: labelFontSize, fontWeight: labelFontWeight, ...leftStyle(0) }}
          >
            {label}
          </span>
        ) : null}
        <span
          className="h-px flex-1 origin-left"
          style={{ backgroundColor: ruleTone, ...scaleStyle('X', 40) }}
          aria-hidden
        />
      </div>

      <div className="flex items-stretch gap-6 sm:gap-10">
        {(show('number') || show('countLabel')) ? (
          <div className="flex shrink-0 flex-col items-start">
            {show('number') ? (
              <span
                className="text-6xl font-light leading-none tracking-[-0.03em] sm:text-7xl lg:text-8xl"
                style={{ color: numberTone, ...leftStyle(0) }}
              >
                {String(displayCount).padStart(2, '0')}
              </span>
            ) : null}
            {show('countLabel') ? (
              <span
                className="mt-2 text-[0.68rem] font-medium uppercase tracking-[0.16em]"
                style={{ color: labelMuted, ...leftStyle(150) }}
              >
                {countLabel}
              </span>
            ) : null}
          </div>
        ) : null}

        {(show('number') || show('countLabel')) && (show('title') || show('subtitle')) ? (
          <span className="w-px origin-top self-stretch" style={{ backgroundColor: ruleToneSoft, ...scaleStyle('Y', 100) }} aria-hidden />
        ) : null}

        <div className="min-w-0 flex-1 pt-1">
          {show('title') ? (
            <h2
              className="mb-0 leading-[1.05]"
              style={{ color: titleTone, fontSize: titleFontSize, fontWeight: titleFontWeight, ...revealStyle(0) }}
            >
              {title}
            </h2>
          ) : null}
          {show('subtitle') && subtitle ? (
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
