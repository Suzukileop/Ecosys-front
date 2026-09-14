'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef } from 'react';
import type { PortfolioExperiencePresentationSettings } from '@/components/portfolio/portfolio-experience-settings';
import {
  DEFAULT_EXPERIENCE_MUTED_COLOR,
  DEFAULT_EXPERIENCE_MUTED_COLOR_DARK,
  DEFAULT_EXPERIENCE_PRESENTATION,
  DEFAULT_EXPERIENCE_TITLE_COLOR,
  DEFAULT_EXPERIENCE_TITLE_COLOR_DARK,
  ensureExperienceInkContrast,
  normalizeExperienceElementStyles,
  resolveExperienceColorMode,
  resolveExperienceTextColor,
} from '@/components/portfolio/portfolio-experience-settings';
import { portfolioSectionTitleSentenceCase } from '@/components/portfolio/portfolio-section-title';

const DEFAULT_REEL_KICKER = '02 / Chronology';
export const EXP_LEAD_MOTION_DONE = 'pf-exp-lead-motion-done';

function reelHeaderScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isLaidOut(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

function leadStep(el: HTMLElement): number {
  const raw = el.getAttribute('data-pf-lead-step');
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? value : 0;
}

function notifyLeadMotionDone(section: Element | null) {
  section?.dispatchEvent(new CustomEvent(EXP_LEAD_MOTION_DONE, { bubbles: true }));
}

/**
 * Title stack — left-aligned luxury editorial header for Experience.
 * Light monumental title, micro chronology kicker, airy subtitle, GSAP reveal + recede.
 * Also draws the first timeline rail and staggers the lead project card.
 */
export function ExperienceReelHeader({
  sectionTitle,
  sectionSubtitle,
  presentation: presentationProp,
}: {
  sectionTitle: string;
  sectionSubtitle?: string;
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  const presentation: PortfolioExperiencePresentationSettings = {
    ...(presentationProp ?? DEFAULT_EXPERIENCE_PRESENTATION),
  };

  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const titleColor = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const mutedColor = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );

  const title = portfolioSectionTitleSentenceCase(sectionTitle.trim() || 'Experience');
  const subtitle = sectionSubtitle?.replace(/\s+/g, ' ').trim() || '';
  const titleInk = `color-mix(in srgb, ${titleColor} 85%, transparent)`;
  const kickerInk = `color-mix(in srgb, ${titleColor} 30%, transparent)`;
  const titleLines = useMemo(() => [title], [title]);
  const kickerEnabled = presentation.reelKickerEnabled !== false;
  const kickerText = presentation.reelKickerText?.trim() || DEFAULT_REEL_KICKER;
  const animationEnabled = presentation.reelHeaderAnimationEnabled !== false;

  const headerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const section = header.closest('#experience') ?? header;
    if (prefersReducedMotion() || !animationEnabled) {
      notifyLeadMotionDone(section);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    let ctx: gsap.Context | undefined;
    let refreshId = 0;

    const scroller = reelHeaderScrollParent(header);
    const pickIn = (root: ParentNode, selector: string) =>
      [...root.querySelectorAll<HTMLElement>(selector)].filter(isLaidOut);

    const kickers = pickIn(header, '.pf-exp-reel-kicker');
    const lines = pickIn(header, '.pf-exp-reel-title-line');
    const subs = pickIn(header, '.pf-exp-reel-sub');
    const stages = pickIn(header, '.pf-exp-reel-stage');

    const leadCard = section.querySelector<HTMLElement>('[data-pf-exp-lead-card]');
    const rails = pickIn(leadCard ?? section, '.pf-exp-lead-rail');
    const reveals = pickIn(leadCard ?? section, '.pf-exp-lead-reveal').sort(
      (a, b) => leadStep(a) - leadStep(b)
    );

    ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onComplete: () => notifyLeadMotionDone(section),
      });

      if (kickers.length) {
        tl.fromTo(
          kickers,
          { opacity: 0 },
          { opacity: 1, duration: 0.7, ease: 'power2.out' },
          0
        );
      }
      if (lines.length) {
        tl.set(lines, { yPercent: 110 }, 0);
        tl.to(
          lines,
          { yPercent: 0, duration: 1.08, ease: 'power3.out', stagger: 0.08 },
          0.18
        );
      }
      if (subs.length) {
        tl.set(subs, { x: -22, opacity: 0 }, 0);
        tl.to(
          subs,
          { x: 0, opacity: 1, duration: 0.72, ease: 'power3.out' },
          0.33
        );
      }

      const lineAt = 1.05;
      if (rails.length) {
        tl.fromTo(
          rails,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 0.78,
            ease: 'power2.inOut',
            transformOrigin: 'top center',
            immediateRender: false,
          },
          lineAt
        );
      }
      if (reveals.length) {
        tl.fromTo(
          reveals,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.62,
            ease: 'power3.out',
            stagger: 0.1,
            immediateRender: false,
          },
          lineAt + 0.22
        );
      }

      const trigger = header.closest('#experience') ?? header;
      stages.forEach((stage) => {
        gsap.fromTo(
          stage,
          { opacity: 1, scale: 1 },
          {
            opacity: 0,
            scale: 0.96,
            ease: 'none',
            transformOrigin: 'left center',
            scrollTrigger: {
              trigger,
              scroller,
              start: 'top 26%',
              end: 'top -18%',
              scrub: 0.55,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    }, section);

    refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 90);
    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [animationEnabled, title, subtitle, titleInk]);

  return (
    <header ref={headerRef} className="pf-exp-reel-header relative w-full text-left">
      <div
        className="pf-exp-reel-stage relative w-full origin-left"
        data-pf-no-color-transition=""
      >
        {kickerEnabled ? (
          <p
            className="pf-exp-reel-kicker mb-0 ml-0 mr-0 font-sans text-[0.68rem] font-medium uppercase tracking-[0.22em]"
            style={{ color: kickerInk }}
            data-pf-no-color-transition=""
          >
            {kickerText}
          </p>
        ) : null}

        <h2
          className="pf-exp-reel-title mb-0 ml-0 mr-0 mt-3 font-sans text-5xl font-light tracking-[-0.035em] sm:text-6xl lg:text-7xl lg:leading-[0.95]"
          style={{ color: titleInk, fontWeight: 300 }}
        >
          {titleLines.map((line) => (
            <span key={line} className="pf-exp-reel-title-mask block overflow-hidden">
              <span className="pf-exp-reel-title-line block" data-pf-no-color-transition="">
                {line}
              </span>
            </span>
          ))}
        </h2>

        {subtitle ? (
          <p
            className="pf-exp-reel-sub mb-0 ml-0 mr-0 mt-8 max-w-2xl font-sans text-base leading-relaxed tracking-[-0.01em] sm:mt-9 sm:text-lg"
            style={{ color: mutedColor }}
            data-pf-no-color-transition=""
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
}
