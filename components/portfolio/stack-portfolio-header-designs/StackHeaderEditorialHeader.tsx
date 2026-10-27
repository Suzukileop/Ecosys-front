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
import { usePortfolioHeaderMotionOff } from '@/components/portfolio/portfolio-motion-off';
import { headerElementVisibility } from '@/components/portfolio/portfolio-header-elements';

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
 * Editorial — kicker + masked line-reveal title + subtitle. The reveal replays every time the header
 * scrolls into view and exits the way the scroll is going (up and out, or back down).
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
  const alignment = presentation.headerDesignAlignment ?? 'left';
  const centered = alignment === 'center';
  const right = alignment === 'right';
  const motionOff = usePortfolioHeaderMotionOff();
  const animationEnabled = presentation.headerAnimationEnabled !== false && !motionOff;
  /* Each text is the design's own setting; empty falls back to the section-level value. */
  const labelText = presentation.headerEditorialLabelText?.trim() || 'Stack';
  const titleText = presentation.headerEditorialTitleText?.trim() || title.trim();
  const subtitleText = presentation.headerEditorialSubtitleText?.trim() || subtitle?.trim() || '';
  const show = headerElementVisibility(presentation.headerHiddenElements, 'editorial');
  const showLabel = show('label');
  const showTitle = show('title');
  const showSubtitle = show('subtitle');
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
    let retryId = 0;
    const build = () => {
      ctx = gsap.context(() => {
        const pick = (selector: string) =>
          [...header.querySelectorAll<HTMLElement>(selector)].filter(isLaidOut);
        const kicker = pick('.pf-stack-header-editorial-kicker');
        const lines = pick('.pf-stack-header-editorial-title-line');
        const subs = pick('.pf-stack-header-editorial-sub');

        // Replays on every pass, in both directions, and leaves as deliberately as it arrives:
        //  - entering from below (scrolling down): the title rises out of its mask, kicker and subtitle follow;
        //  - leaving through the top: it keeps travelling up and out, faster than it came in;
        //  - coming back from above (scrolling up): it drops in from the top of the mask instead;
        //  - leaving through the bottom: it sinks back down.
        // Every tween uses overwrite so a quick reversal picks up from wherever the motion is, never snaps.
        // Until the header first reaches the viewport it sits in its hidden state (set now, no flash).
        if (kicker.length) gsap.set(kicker, { opacity: 0, y: 8 });
        if (lines.length) gsap.set(lines, { yPercent: 110 });
        if (subs.length) gsap.set(subs, { opacity: 0, y: 14 });

        const enter = (dir: 1 | -1) => {
          if (kicker.length) {
            gsap.fromTo(kicker, { opacity: 0, y: 8 * dir }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', overwrite: true });
          }
          if (lines.length) {
            gsap.fromTo(
              lines,
              { yPercent: 110 * dir },
              { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.07, delay: 0.12, overwrite: true }
            );
          }
          if (subs.length) {
            gsap.fromTo(
              subs,
              { opacity: 0, y: 14 * dir },
              { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.36, overwrite: true }
            );
          }
        };
        const leave = (dir: 1 | -1) => {
          // dir 1: out through the top (content moves up); -1: out through the bottom.
          if (subs.length) gsap.to(subs, { opacity: 0, y: -16 * dir, duration: 0.5, ease: 'power2.in', overwrite: true });
          if (lines.length) {
            gsap.to(lines, { yPercent: -110 * dir, duration: 0.7, ease: 'power3.inOut', stagger: 0.05, delay: 0.06, overwrite: true });
          }
          if (kicker.length) gsap.to(kicker, { opacity: 0, y: -10 * dir, duration: 0.5, ease: 'power2.in', delay: 0.12, overwrite: true });
        };

        ScrollTrigger.create({
          trigger: header,
          scroller: stackHeaderScrollParent(header),
          start: 'top 85%',
          // Exit as the header nears the top (its bottom crosses 25% of the viewport): late enough not to cut the
          // reading short, early enough that the motion still plays in view rather than under the nav.
          end: 'bottom 25%',
          onEnter: () => enter(1),
          onLeave: () => leave(1),
          onEnterBack: () => enter(-1),
          onLeaveBack: () => leave(-1),
        });
      }, header);
    };
    const failSafe = (error: unknown) => {
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
    };
    try {
      build();
    } catch {
      // The crash comes from another section's `once` ScrollTrigger killing itself while this one refreshes the
      // list (GSAP then reads a removed entry). It is a timing race, so a second attempt on the next frame,
      // once that refresh is over, normally succeeds; only a second failure falls back to the static header.
      ctx?.revert();
      ctx = undefined;
      retryId = window.requestAnimationFrame(() => {
        try {
          build();
        } catch (error) {
          failSafe(error);
        }
      });
    }

    return () => {
      window.clearTimeout(refreshId);
      window.cancelAnimationFrame(retryId);
      ctx?.revert();
    };
  }, [animationEnabled, labelText, titleText, subtitleText, showLabel, showTitle, showSubtitle]);

  return (
    <header
      ref={headerRef}
      className={`pf-stack-header-editorial-header relative w-full ${centered ? 'text-center' : right ? 'text-right' : 'text-left'}`}
      style={{ marginBottom: `${STACK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      <div className={`pf-stack-header-editorial-stage flex flex-col gap-6 sm:justify-between ${centered ? 'items-center sm:flex-col sm:items-center' : right ? 'items-end sm:flex-col sm:items-end' : 'sm:flex-row sm:items-end'}`}>
        <div className="min-w-0 max-w-3xl">
          {showLabel ? (
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
          ) : null}
          {showTitle ? (
            <h2
              className={`mb-0 ${showLabel ? 'mt-3' : ''} ${stackHeaderDesignFontClass(presentation.titleFont, 'title')} ${TITLE_SIZE_CLASS[presentation.headerEditorialTitleSize ?? 'md']} ${TITLE_WEIGHT_CLASS[presentation.headerEditorialTitleWeight ?? 'regular']} tracking-[-0.03em] lg:leading-[0.98]`}
              style={{ color: titleInk }}
            >
              <span className="pf-stack-header-editorial-title-mask block overflow-hidden">
                <span className="pf-stack-header-editorial-title-line block">{titleText}</span>
              </span>
            </h2>
          ) : null}
          {showSubtitle && subtitleText ? (
            <p
              className={`pf-stack-header-editorial-sub mb-0 mt-6 max-w-xl ${centered ? 'mx-auto' : right ? 'ml-auto' : ''} ${stackHeaderDesignFontClass(presentation.subtitleFont, 'subtitle')} leading-relaxed`}
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
