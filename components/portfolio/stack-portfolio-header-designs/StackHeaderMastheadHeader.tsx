'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { DEFAULT_STACK_PRESENTATION, type PortfolioStackPresentationSettings } from '@/components/portfolio/portfolio-stack-settings';
import {
  STACK_HEADER_MARGIN_BOTTOM_REM,
  stackHeaderPaletteTokenColor,
  type PortfolioStackHeaderTitleSize,
  type PortfolioStackHeaderTitleWeight,
} from '@/components/portfolio/portfolio-stack-header-settings';
import { usePortfolioHeaderMotionOff } from '@/components/portfolio/portfolio-motion-off';

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

// Three short, punchy default lines — that's what makes the mast stack
// dramatically. Each line is its own field (not one string split on
// periods), so the count and wording are both directly editable.
const DEFAULT_LINE_1 = 'Core stack.';
const DEFAULT_LINE_2 = 'Chosen with intent.';
const DEFAULT_LINE_3 = 'Kept up to date.';

const HEADLINE_SIZE_CLASS: Record<PortfolioStackHeaderTitleSize, string> = {
  sm: 'text-[clamp(1.7rem,4.8vw,3.4rem)]',
  md: 'text-[clamp(2.2rem,6vw,4.2rem)]',
  lg: 'text-[clamp(2.7rem,7.2vw,5.1rem)]',
  xl: 'text-[clamp(3.2rem,8.4vw,6.1rem)]',
};

/** The light-first-word / black-rest contrast stays at every weight step —
 *  "weight" shifts both up together rather than flattening the contrast. */
const HEADLINE_WEIGHT: Record<PortfolioStackHeaderTitleWeight, { light: number; heavy: number }> = {
  light: { light: 300, heavy: 700 },
  regular: { light: 300, heavy: 900 },
  semibold: { light: 400, heavy: 900 },
  bold: { light: 500, heavy: 900 },
};

/**
 * Masthead — disposition copy of Portfolio/Work's Masthead header
 * (`WorkMastheadHeader`): up to three independent lines stack into the mast
 * (the first word of every line light, the rest bold). Motion: each line
 * slides horizontally through its own mask, alternating sides, replayed on
 * every pass in both scroll directions and exiting out the opposite side.
 * One color/size/weight for the whole headline, across every line.
 */
export function StackHeaderMastheadHeader({
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
  const ink = stackHeaderPaletteTokenColor(presentation.headerMastheadHeadlineColor ?? 'principal');
  const headlineWeight = HEADLINE_WEIGHT[presentation.headerMastheadHeadlineWeight ?? 'regular'];

  const sectionRef = useRef<HTMLElement>(null);

  const lines = useMemo(
    () => {
      const hidden = new Set(presentation.headerHiddenElements);
      return [
        hidden.has('masthead.line1') ? '' : presentation.headerMastheadLine1Text || DEFAULT_LINE_1,
        hidden.has('masthead.line2') ? '' : presentation.headerMastheadLine2Text || DEFAULT_LINE_2,
        hidden.has('masthead.line3') ? '' : presentation.headerMastheadLine3Text || DEFAULT_LINE_3,
      ]
        .map((line) => line.trim())
        .filter(Boolean);
    },
    [
      presentation.headerMastheadLine1Text,
      presentation.headerMastheadLine2Text,
      presentation.headerMastheadLine3Text,
      presentation.headerHiddenElements,
    ]
  );

  const styledLines = useMemo(
    () =>
      lines.map((line) => {
        const words = line.replace(/\.$/, '').split(/\s+/).filter(Boolean);
        return words.map((word, idx) => ({
          text: word,
          isLight: idx === 0,
          hasPeriod: idx === words.length - 1,
        }));
      }),
    [lines]
  );
  // A stable key that changes with the actual word structure, not just the
  // line count — editing a line (e.g. adding a space, splitting off a new
  // word) creates fresh line nodes that the effect below must re-bind to, or
  // a newly-added line stays parked at its hidden "from" state forever.
  const linesKey = lines.join('\n');
  const hasTrailing = Boolean(trailing);

  // ========== ANIMATION: horizontal line slide, replayed on every pass ==========
  useLayoutEffect(() => {
    const header = sectionRef.current;
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
        const masks = pick('.pf-stack-header-masthead-mask');
        const lines = pick('.pf-stack-header-masthead-line');
        const trailingEls = pick('.pf-stack-header-masthead-trailing');

        // Each line slides HORIZONTALLY through its own mask, alternating sides like type being
        // set on a press bed: line 1 from the left, line 2 from the right, line 3 from the left.
        // `side(i)` is that alternation; multiplied by the scroll direction it flips when the
        // header comes back from above, so the reveal mirrors itself instead of repeating.
        //  - entering from below (scrolling down): lines arrive L / R / L, first line first;
        //  - leaving through the top: each line keeps travelling the way it came and slides out the
        //    OPPOSITE side, last line first, faster — the masthead reads as passing through;
        //  - coming back from above (scrolling up): every line re-enters from the side it left by
        //    (R / L / R), which is exactly the mirrored entrance — no jump between exit and return;
        //  - leaving through the bottom: the mirrored exit, again continuing each line's travel.
        // A light skew leans each line into its travel and settles to 0 at rest, adding a sense of
        // speed without hurting legibility. Every tween uses overwrite, so a quick reversal picks
        // up from wherever the line is, never snaps.
        const side = (i: number) => (i % 2 === 0 ? 1 : -1);
        const OFF = 104; // xPercent just past the mask edge, so no sliver of the line lingers.
        const SKEW = 7;

        // The masks only clip while a line is moving: at rest they go back to `visible`, so tall
        // glyphs (accented capitals at leading 1.08) or a long wrapped line are never cut for good.
        const clip = () => {
          if (masks.length) gsap.set(masks, { overflow: 'hidden' });
        };
        const unclip = () => {
          if (masks.length) gsap.set(masks, { overflow: 'visible' });
        };

        // Hidden "from" state, set now (before paint): lines parked off their entrance side.
        clip();
        if (lines.length) {
          gsap.set(lines, { xPercent: (i: number) => -OFF * side(i), skewX: (i: number) => SKEW * side(i) });
        }
        if (trailingEls.length) gsap.set(trailingEls, { opacity: 0, y: 12 });

        const enter = (dir: 1 | -1) => {
          clip();
          if (lines.length) {
            // Line i travels side(i) * dir (+1 = rightwards): it starts off the opposite edge and
            // leans forward into the motion (negative skewX when moving right).
            gsap.fromTo(
              lines,
              { xPercent: (i: number) => -OFF * side(i) * dir, skewX: (i: number) => SKEW * side(i) * dir },
              {
                xPercent: 0,
                skewX: 0,
                duration: 1.15,
                ease: 'expo.out',
                stagger: 0.12,
                delay: 0.05,
                overwrite: true,
                onComplete: unclip,
              }
            );
          }
          if (trailingEls.length) {
            // Secondary content lands once the mast has mostly settled.
            gsap.fromTo(
              trailingEls,
              { opacity: 0, y: 12 * dir },
              { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.3 + lines.length * 0.12, overwrite: true }
            );
          }
        };
        const leave = (dir: 1 | -1) => {
          // dir 1: out through the top (page moving up); -1: out through the bottom. Each line
          // continues its entrance travel (side(i) * dir) and exits the opposite edge, last line first.
          clip();
          if (trailingEls.length) {
            gsap.to(trailingEls, { opacity: 0, y: -12 * dir, duration: 0.35, ease: 'power2.in', overwrite: true });
          }
          if (lines.length) {
            gsap.to(lines, {
              xPercent: (i: number) => OFF * side(i) * dir,
              skewX: (i: number) => -SKEW * side(i) * dir,
              duration: 0.5,
              ease: 'power3.in',
              stagger: { each: 0.07, from: 'end' },
              overwrite: true,
            });
          }
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
      // self.refresh(). Uncaught, that crash propagates up through the layout-effect commit and
      // takes the WHOLE React tree down with it (every other section on the page, not just this
      // one). Root cause looks like a GSAP-internal timing edge case, not app logic, so fail safe
      // instead: log it, clean up whatever partially initialized, and leave this header in its
      // plain, fully visible, non-animated state rather than ever crashing the page.
      console.error('[StackHeaderMastheadHeader] GSAP entrance animation failed to initialize', error);
      ctx?.revert();
      gsap.set(
        header.querySelectorAll(
          '.pf-stack-header-masthead-mask, .pf-stack-header-masthead-line, .pf-stack-header-masthead-trailing'
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
  }, [linesKey, animationEnabled, hasTrailing]);

  return (
    <header
      ref={sectionRef}
      className="w-full"
      style={{ marginBottom: `${STACK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
      data-stack-header="masthead"
    >
      {styledLines.length > 0 ? (
        <div className={`flex flex-col gap-1 sm:gap-2 ${centered ? 'items-center' : right ? 'items-end' : 'items-start'}`}>
          {styledLines.map((words, lineIndex) => (
            <div key={lineIndex} className="pf-stack-header-masthead-mask overflow-hidden" data-stack-header-line>
              <h2
                className={`pf-stack-header-masthead-line ${HEADLINE_SIZE_CLASS[presentation.headerMastheadHeadlineSize ?? 'md']} uppercase leading-[1.08] tracking-[-0.02em] ${centered ? 'text-center' : right ? 'text-right' : 'text-left'}`}
                style={{ color: ink }}
              >
                {words.map((word, wordIndex) => (
                  <span
                    key={wordIndex}
                    className="inline-block"
                    style={{
                      marginRight: wordIndex < words.length - 1 ? '0.3em' : 0,
                      fontWeight: word.isLight ? headlineWeight.light : headlineWeight.heavy,
                    }}
                    data-stack-header-word
                  >
                    {word.text.toUpperCase()}
                    {word.hasPeriod ? <span style={{ fontWeight: headlineWeight.heavy }}>.</span> : null}
                  </span>
                ))}
              </h2>
            </div>
          ))}
        </div>
      ) : null}

      {trailing ? <div className="pf-stack-header-masthead-trailing mt-6">{trailing}</div> : null}
    </header>
  );
}
