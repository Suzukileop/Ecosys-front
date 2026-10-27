'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fragment, useLayoutEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { DEFAULT_STACK_PRESENTATION, type PortfolioStackPresentationSettings } from '@/components/portfolio/portfolio-stack-settings';
import {
  STACK_HEADER_MARGIN_BOTTOM_REM,
  stackHeaderPaletteTokenColor,
  type PortfolioStackHeaderBillboardWordStyle,
} from '@/components/portfolio/portfolio-stack-header-settings';
import { usePortfolioHeaderMotionOff } from '@/components/portfolio/portfolio-motion-off';
import { headerElementVisibility } from '@/components/portfolio/portfolio-header-elements';

const DEFAULT_BIG_WORD = 'STACK';
const DEFAULT_COUNT_TEXT = '{count} technologies — core stack below';
const DEFAULT_TITLE_TEXT = 'Core stack';
const REFERENCE_PX = 100;

/** How far (in % of a letter's own height) a glyph travels while it stretches — just enough
 *  to read as "pushing up out of the baseline" rather than a flat vertical scale. */
const CHAR_TRAVEL = 18;

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

/**
 * Sizes `textRef`'s font so its rendered box exactly fills `containerRef`'s
 * width — on mount, on any container-width change, and once web fonts
 * finish loading. Measures the *same* element it then resizes, so
 * measurement and final render can never disagree.
 */
function useFitWidthTextSize(
  containerRef: RefObject<HTMLElement | null>,
  textRef: RefObject<HTMLElement | null>,
  text: string,
  split: boolean
) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return undefined;

    const fit = () => {
      const targetWidth = container.getBoundingClientRect().width;
      if (targetWidth <= 0) return;

      textEl.style.fontSize = `${REFERENCE_PX}px`;
      const measuredWidth = textEl.getBoundingClientRect().width;
      if (measuredWidth <= 0) return;

      textEl.style.fontSize = `${REFERENCE_PX * (targetWidth / measuredWidth)}px`;
    };

    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(container);

    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) fit();
      }).catch(() => {});
    }

    return () => {
      cancelled = true;
      observer.disconnect();
    };
    // `split` changes the glyph boxes (per-letter spans lose kerning pairs), so the fit must re-run with it.
  }, [text, split]);
}

/** The full-bleed word — outline (stroke + glow), fill (solid + glow), or
 *  simple (solid, no glow at all — plain display), user's choice.
 *  When it animates, each letter becomes its own inline-block so it can stretch
 *  on its own; spaces stay plain text nodes so the word spacing is untouched.
 *  Stroke / fill colors are inherited by the letter spans, and the glow filter
 *  stays on the parent so it wraps the whole word, not each letter. */
function StackHeaderBillboardBigWord({
  text,
  tone,
  wordStyle,
  split,
}: {
  text: string;
  tone: string;
  wordStyle: PortfolioStackHeaderBillboardWordStyle;
  split: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  useFitWidthTextSize(containerRef, textRef, text, split);

  const glow = `drop-shadow(0 0 36px color-mix(in srgb, ${tone} 24%, transparent))`;
  const textStyle: CSSProperties =
    wordStyle === 'simple'
      ? { color: tone, WebkitTextFillColor: tone }
      : wordStyle === 'fill'
        ? { color: tone, WebkitTextFillColor: tone, filter: glow }
        : {
            color: 'transparent',
            WebkitTextStroke: `1.75px color-mix(in srgb, ${tone} 28%, transparent)`,
            WebkitTextFillColor: 'transparent',
            filter: glow,
          };

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <span
        ref={textRef}
        aria-hidden
        className="inline-block whitespace-nowrap text-[13vw] font-black uppercase leading-none tracking-tight sm:text-[9vw]"
        style={textStyle}
      >
        {split
          ? Array.from(text).map((char, i) =>
              char.trim() === '' ? (
                <Fragment key={i}>{char}</Fragment>
              ) : (
                <span key={i} className="inline-block" data-stack-header-billboard-char>
                  {char}
                </span>
              )
            )
          : text}
      </span>
      <span className="sr-only">{text}</span>
    </div>
  );
}

/**
 * Billboard — full-bleed giant word with an editorial title/count split row
 * beneath it. Motion: the letters of the giant word stretch out of their
 * baseline (scaleY 0 → 1) from the center outward, then the title and the
 * count settle in under it; on exit the letters compress back flat from the
 * edges inward, toward the side the page is scrolling to. Replays on every
 * pass, in both scroll directions.
 */
export function StackHeaderBillboardHeader({
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
  const presentation = presentationProp ?? DEFAULT_STACK_PRESENTATION;
  const motionOff = usePortfolioHeaderMotionOff();
  const animationEnabled = presentation.headerAnimationEnabled !== false && !motionOff;
  const show = headerElementVisibility(presentation.headerHiddenElements, 'billboard');
  const showWord = show('word');
  const showTitle = show('title');
  const bigWord = (presentation.headerBillboardBigWord || DEFAULT_BIG_WORD).trim();
  const countTemplate = presentation.headerBillboardCountText || DEFAULT_COUNT_TEXT;
  const countText = show('count') ? countTemplate.replace('{count}', String(itemCount ?? 0)) : '';
  const title = (presentation.headerBillboardTitleText || DEFAULT_TITLE_TEXT).trim();

  // Every element bound to one of our actual palette colors, chosen
  // independently — not a shared/random tone.
  const wordTone = stackHeaderPaletteTokenColor(presentation.headerBillboardWordColor ?? 'principal');
  const titleTone = stackHeaderPaletteTokenColor(presentation.headerBillboardTitleColor ?? 'principal');
  const metaTone = stackHeaderPaletteTokenColor(presentation.headerBillboardMetaColor ?? 'secondaire');

  const sectionRef = useRef<HTMLDivElement>(null);

  // First word italic/light, rest bold — same split as the editorial secondary title.
  const renderSecondaryTitle = (() => {
    const firstSpaceIndex = title.indexOf(' ');
    if (firstSpaceIndex === -1) {
      return <span className="font-light italic">{title}</span>;
    }
    const firstWord = title.slice(0, firstSpaceIndex);
    const restOfText = title.slice(firstSpaceIndex + 1);
    return (
      <>
        <span className="font-light italic">{firstWord}</span> <span className="font-semibold">{restOfText}</span>
      </>
    );
  })();

  // ========== ANIMATION: scroll entrance / exit, replayed on every pass ==========
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
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
        const pick = (selector: string) => [...section.querySelectorAll<HTMLElement>(selector)].filter(isLaidOut);
        const chars = pick('[data-stack-header-billboard-char]');
        const support = pick('[data-stack-header-gsap-secondary], [data-stack-header-gsap-meta]');

        // The letters pivot on the edge they grow out of / collapse into: the baseline when the motion
        // reads "upward from below", the cap line when it reads "downward from above".
        const ORIGIN_BOTTOM = '50% 100%';
        const ORIGIN_TOP = '50% 0%';
        const isHidden = (el: HTMLElement) => Number(gsap.getProperty(el, 'scaleY')) <= 0.001;
        const isMidFlight = (el: HTMLElement) => {
          const s = Number(gsap.getProperty(el, 'scaleY'));
          return s > 0.001 && s < 0.999;
        };
        // Swapping the pivot while a letter is half-stretched would make it jump; only re-pivot letters that
        // are fully flat (invisible) or fully settled (pivot irrelevant), so a fast reversal stays continuous.
        const pivot = (origin: string) => (_: number, el: HTMLElement) =>
          isMidFlight(el) ? el.style.transformOrigin || origin : origin;

        // Hidden "from" state, set before paint: letters flattened onto their baseline, support copy faded low.
        if (chars.length) gsap.set(chars, { scaleY: 0, yPercent: CHAR_TRAVEL, opacity: 0, transformOrigin: ORIGIN_BOTTOM });
        if (support.length) gsap.set(support, { opacity: 0, y: 18 });

        //  - entering from below (scrolling down): letters stretch UP out of the baseline, center first, then
        //    ripple outward to the edges — the word "inflates" from its middle; title and count rise in after;
        //  - coming back from above (scrolling up): the mirror — letters stretch DOWN from the cap line and
        //    the support copy drops in from above.
        // Only fully hidden elements get their start position re-primed; anything still mid-exit just turns
        // around from where it is (overwrite kills the running exit tween), so nothing snaps.
        const enter = (dir: 1 | -1) => {
          if (chars.length) {
            chars.forEach((el) => {
              if (isHidden(el)) gsap.set(el, { yPercent: CHAR_TRAVEL * dir });
            });
            gsap.set(chars, { transformOrigin: pivot(dir === 1 ? ORIGIN_BOTTOM : ORIGIN_TOP) });
            gsap.to(chars, {
              scaleY: 1,
              yPercent: 0,
              opacity: 1,
              duration: 1.1,
              ease: 'expo.out',
              stagger: { each: 0.045, from: 'center' },
              delay: 0.04,
              overwrite: true,
            });
          }
          if (support.length) {
            support.forEach((el) => {
              if (Number(gsap.getProperty(el, 'opacity')) <= 0.01) gsap.set(el, { y: 18 * dir });
            });
            gsap.to(support, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              stagger: 0.12,
              delay: 0.38,
              overwrite: true,
            });
          }
        };

        //  - leaving through the top (dir 1, page moving up): the copy lifts away first, then the letters
        //    collapse UP into their cap line, edges first, closing in on the center;
        //  - leaving through the bottom (dir -1): same, mirrored — the letters squash DOWN onto the baseline.
        // Shorter and accelerating (`.in`) versus the long decelerating entrance: an exit should get out of
        // the way, not perform.
        const leave = (dir: 1 | -1) => {
          if (support.length) {
            gsap.to([...support].reverse(), {
              opacity: 0,
              y: -14 * dir,
              duration: 0.4,
              ease: 'power2.in',
              stagger: 0.06,
              overwrite: true,
            });
          }
          if (chars.length) {
            gsap.set(chars, { transformOrigin: pivot(dir === 1 ? ORIGIN_TOP : ORIGIN_BOTTOM) });
            gsap.to(chars, {
              scaleY: 0,
              yPercent: -CHAR_TRAVEL * 0.6 * dir,
              opacity: 0,
              duration: 0.45,
              ease: 'power3.in',
              stagger: { each: 0.025, from: 'edges' },
              delay: 0.08,
              overwrite: true,
            });
          }
        };

        ScrollTrigger.create({
          trigger: section,
          scroller: stackHeaderScrollParent(section),
          start: 'top 85%',
          // Exit as the header nears the top (its bottom crosses 25% of the viewport): late enough not to cut the
          // reading short, early enough that the motion still plays in view rather than under the nav.
          end: 'bottom 25%',
          onEnter: () => enter(1),
          onLeave: () => leave(1),
          onEnterBack: () => enter(-1),
          onLeaveBack: () => leave(-1),
        });
      }, section);
    };
    const failSafe = (error: unknown) => {
      // Observed intermittently on page load/reload: GSAP ScrollTrigger throws
      // "Cannot read properties of undefined (reading 'end')" from inside its own init-time
      // self.refresh(). Uncaught, that crash propagates up through the layout-effect commit and
      // takes the WHOLE React tree down with it (every other section on the page, not just this
      // one). Fail safe instead: log it, clean up whatever partially initialized, and leave this
      // header in its plain, fully visible, non-animated state rather than ever crashing the page.
      // Only the animated props are cleared — the title / meta keep their React-set palette color.
      console.error('[StackHeaderBillboardHeader] GSAP entrance animation failed to initialize', error);
      ctx?.revert();
      gsap.set(
        section.querySelectorAll(
          '[data-stack-header-billboard-char], [data-stack-header-gsap-secondary], [data-stack-header-gsap-meta]'
        ),
        { clearProps: 'opacity,transform,transformOrigin,visibility' }
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
  }, [animationEnabled, bigWord, title, showWord, showTitle, countText]);

  return (
    <div
      ref={sectionRef}
      className="w-full"
      style={{ marginBottom: `${STACK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
      data-stack-header="billboard"
    >
      {showWord ? (
        <div data-stack-header-gsap-big-title>
          <StackHeaderBillboardBigWord
            text={bigWord}
            tone={wordTone}
            wordStyle={presentation.headerBillboardWordStyle ?? 'outline'}
            split={animationEnabled}
          />
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-5 sm:mt-10 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        {showTitle ? (
          <h2
            className="text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.02em]"
            style={{ color: titleTone }}
            data-stack-header-gsap-secondary
          >
            {renderSecondaryTitle}
          </h2>
        ) : null}

        <div className="flex max-w-xs flex-col items-start gap-3 sm:items-end" style={{ color: metaTone }} data-stack-header-gsap-meta>
          {countText ? (
            <p className="mb-0 text-[0.72rem] font-medium uppercase leading-relaxed tracking-[0.1em] sm:text-right" style={{ color: metaTone }}>
              {countText}
            </p>
          ) : null}
          {trailing ? <div className="shrink-0">{trailing}</div> : null}
        </div>
      </div>
    </div>
  );
}
