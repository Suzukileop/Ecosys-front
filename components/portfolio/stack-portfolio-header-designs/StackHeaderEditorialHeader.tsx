'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  DEFAULT_STACK_PRESENTATION,
  type PortfolioStackPresentationSettings,
} from '@/components/portfolio/portfolio-stack-settings';
import {
  STACK_HEADER_MARGIN_BOTTOM_REM,
  stackHeaderDesignFontClass,
  stackHeaderPaletteTokenColor,
  type PortfolioStackHeaderTitleSize,
  type PortfolioStackHeaderTitleWeight,
} from '@/components/portfolio/portfolio-stack-header-settings';
import { usePortfolioMotionOff } from '@/components/portfolio/portfolio-motion-off';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isLaidOut(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

/** Nearest scrollable ancestor — ScrollTrigger needs this explicitly inside an
 *  embedded/iframe dashboard preview, where `window` isn't the real scroller. */
function stackHeaderScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

const TITLE_SIZE_CLASS: Record<PortfolioStackHeaderTitleSize, string> = {
  sm: 'text-4xl sm:text-5xl lg:text-6xl',
  md: 'text-5xl sm:text-6xl lg:text-7xl',
  lg: 'text-6xl sm:text-7xl lg:text-8xl',
  xl: 'text-7xl sm:text-8xl lg:text-9xl',
};

/** Kicker — small uppercase label; "regular" keeps the prior semibold default. */
const LABEL_SIZE: Record<PortfolioStackHeaderTitleSize, string> = {
  sm: '0.625rem',
  md: '0.68rem',
  lg: '0.8rem',
  xl: '0.92rem',
};
const LABEL_WEIGHT: Record<PortfolioStackHeaderTitleWeight, number> = {
  light: 500,
  regular: 600,
  semibold: 700,
  bold: 800,
};
/** Subtitle — "regular" keeps the prior text-sm / sm:text-base default. */
const SUBTITLE_SIZE: Record<PortfolioStackHeaderTitleSize, string> = {
  sm: '0.8125rem',
  md: 'clamp(0.875rem, 0.35vw + 0.8rem, 1rem)',
  lg: 'clamp(1rem, 0.4vw + 0.92rem, 1.125rem)',
  xl: 'clamp(1.125rem, 0.5vw + 1rem, 1.3rem)',
};
const SUBTITLE_WEIGHT: Record<PortfolioStackHeaderTitleWeight, number> = {
  light: 300,
  regular: 400,
  semibold: 500,
  bold: 600,
};

/** Editorial's identity is a light title — "regular" here preserves that prior default,
 *  the other 3 steps adjust from it, rather than the generic light/normal/semibold/bold scale. */
const TITLE_WEIGHT_CLASS: Record<PortfolioStackHeaderTitleWeight, string> = {
  light: '!font-thin',
  regular: '!font-light',
  semibold: '!font-medium',
  bold: '!font-semibold',
};

/**
 * Editorial — kicker + masked line-reveal title + subtitle, with a subtle
 * scroll-scrubbed recede on the whole block. The premium GSAP treatment.
 */
export function StackHeaderEditorialHeader({
  title,
  subtitle,
  presentation: presentationProp,
  trailing,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioStackPresentationSettings;
  trailing?: ReactNode;
}) {
  const presentation = presentationProp ?? DEFAULT_STACK_PRESENTATION;
  const centered = presentation.headerDesignAlignment === 'center';
  const motionOff = usePortfolioMotionOff();
  const animationEnabled = presentation.headerAnimationEnabled !== false && !motionOff;
  /* Each text is the design's own setting; empty falls back to the section-level value. */
  const labelText = presentation.headerEditorialLabelText?.trim() || 'Stack';
  const titleText = presentation.headerEditorialTitleText?.trim() || title.trim();
  const subtitleText = presentation.headerEditorialSubtitleText?.trim() || subtitle?.trim() || '';
  const labelInk = stackHeaderPaletteTokenColor(presentation.headerEditorialLabelColor ?? 'texteFort');
  const titleInk = stackHeaderPaletteTokenColor(presentation.headerEditorialTitleColor ?? 'texteFort');
  const subtitleInk = stackHeaderPaletteTokenColor(presentation.headerEditorialSubtitleColor ?? 'texteFort');
  const kickerInk = `color-mix(in srgb, ${labelInk} 38%, transparent)`;

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

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        const pick = (selector: string) =>
          [...header.querySelectorAll<HTMLElement>(selector)].filter(isLaidOut);
        const kicker = pick('.pf-stack-header-editorial-kicker');
        const lines = pick('.pf-stack-header-editorial-title-line');
        const subs = pick('.pf-stack-header-editorial-sub');
        const stage = header.querySelector<HTMLElement>('.pf-stack-header-editorial-stage');

        // Gated by ScrollTrigger, not fired on mount — a header mounted below
        // the fold must stay in its hidden "from" state (set immediately, no
        // flash) until it actually scrolls into view, not play-then-finish
        // off-screen and show up already static.
        const tl = gsap.timeline({
          defaults: { overwrite: 'auto' },
          scrollTrigger: {
            trigger: header,
            scroller: stackHeaderScrollParent(header),
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
          // No invalidateOnRefresh here — these are static (non-function) from/to values, so
          // it buys nothing and was correlated with an intermittent GSAP internal crash (see
          // the try/catch below) on this particular trigger during its own init-time refresh.
          gsap.fromTo(
            stage,
            { opacity: 1, y: 0 },
            {
              opacity: 0.55,
              y: -10,
              ease: 'none',
              scrollTrigger: {
                trigger: header,
                scroller: stackHeaderScrollParent(header),
                start: 'top 20%',
                end: 'top -20%',
                scrub: 0.5,
              },
            }
          );
        }
      }, header);
    } catch (error) {
      // Observed intermittently on page load/reload: GSAP ScrollTrigger throws
      // "Cannot read properties of undefined (reading 'end')" from inside its own init-time
      // self.refresh() for this header's scroll-scrubbed stage effect. Uncaught, that crash
      // propagates up through the layout-effect commit and takes the WHOLE React tree down
      // with it (every other section on the page, not just this one) — this is why the page
      // sometimes needs several reloads before anything shows up at all. Root cause not fully
      // pinned down (looks like a GSAP-internal timing edge case, not app logic), so fail safe
      // instead: log it, clean up whatever partially initialized, and leave this header in its
      // plain, fully visible, non-animated state rather than ever crashing the page.
      console.error('[StackHeaderEditorialHeader] GSAP entrance animation failed to initialize', error);
      ctx?.revert();
      gsap.set(
        header.querySelectorAll(
          '.pf-stack-header-editorial-kicker, .pf-stack-header-editorial-title-line, .pf-stack-header-editorial-sub'
        ),
        { clearProps: 'all' }
      );
    }

    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [animationEnabled, labelText, titleText, subtitleText]);

  return (
    <header
      ref={headerRef}
      className={`pf-stack-header-editorial-header relative w-full ${centered ? 'text-center' : 'text-left'}`}
      style={{ marginBottom: `${STACK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      <div className={`pf-stack-header-editorial-stage flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between ${centered ? 'sm:flex-col sm:items-center' : ''}`}>
        <div className="min-w-0 max-w-3xl">
          <p
            className="pf-stack-header-editorial-kicker mb-0 uppercase tracking-[0.24em]"
            style={{
              color: kickerInk,
              fontSize: LABEL_SIZE[presentation.headerEditorialLabelSize ?? 'md'],
              fontWeight: LABEL_WEIGHT[presentation.headerEditorialLabelWeight ?? 'regular'],
            }}
          >
            {labelText}
          </p>
          <h2
            className={`mb-0 mt-3 ${stackHeaderDesignFontClass(presentation.titleFont, 'title')} ${TITLE_SIZE_CLASS[presentation.headerEditorialTitleSize ?? 'md']} ${TITLE_WEIGHT_CLASS[presentation.headerEditorialTitleWeight ?? 'regular']} tracking-[-0.03em] lg:leading-[0.98]`}
            style={{ color: titleInk }}
          >
            <span className="pf-stack-header-editorial-title-mask block overflow-hidden">
              <span className="pf-stack-header-editorial-title-line block">{titleText}</span>
            </span>
          </h2>
          {subtitleText ? (
            <p
              className={`pf-stack-header-editorial-sub mb-0 mt-6 max-w-xl ${stackHeaderDesignFontClass(presentation.subtitleFont, 'subtitle')} leading-relaxed`}
              style={{
                color: subtitleInk,
                fontSize: SUBTITLE_SIZE[presentation.headerEditorialSubtitleSize ?? 'md'],
                fontWeight: SUBTITLE_WEIGHT[presentation.headerEditorialSubtitleWeight ?? 'regular'],
              }}
            >
              {subtitleText}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </header>
  );
}
