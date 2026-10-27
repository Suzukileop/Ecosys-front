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
import { headerElementVisibility } from '@/components/portfolio/portfolio-header-elements';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

const DEFAULT_LABEL_TEXT = 'Stack';
const DEFAULT_TITLE_TEXT = 'Core stack';

const TITLE_SIZE_CLASS: Record<PortfolioStackHeaderTitleSize, string> = {
  sm: 'text-[clamp(2.1rem,6vw,4.2rem)]',
  md: 'text-[clamp(2.75rem,7.5vw,5.5rem)]',
  lg: 'text-[clamp(3.4rem,9vw,6.8rem)]',
  xl: 'text-[clamp(4.1rem,10.5vw,8.2rem)]',
};

const LABEL_SIZE_CLASS: Record<PortfolioStackHeaderTitleSize, string> = {
  sm: 'text-[0.6rem]',
  md: 'text-[0.7rem]',
  lg: 'text-[0.82rem]',
  xl: 'text-[0.95rem]',
};

/** The italic-first-word / regular-rest contrast stays at every weight step —
 *  "weight" shifts both up together rather than flattening the contrast. */
const TITLE_WEIGHT: Record<PortfolioStackHeaderTitleWeight, { italic: number; regular: number }> = {
  light: { italic: 300, regular: 400 },
  regular: { italic: 300, regular: 500 },
  semibold: { italic: 400, regular: 600 },
  bold: { italic: 500, regular: 800 },
};

const LABEL_WEIGHT_CLASS: Record<PortfolioStackHeaderTitleWeight, string> = {
  light: 'font-normal',
  regular: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

/**
 * Split heading — exact disposition of Portfolio/Work's Split heading header
 * (`WorkSplitHeadingHeader`): the title on the left (first word italic/light,
 * rest regular); a small uppercase label sits top-aligned on the right. No
 * separator line. Every element — title, label — has its own text, color,
 * size, and weight.
 *
 * Motion — a CONVERGENCE, unlike the other Stack headers (no mask, no count,
 * no wipe, no tracking, no stretch): the two halves of the heading start apart
 * — the italic word off to the left, leaning forward (extra skew), the regular
 * words off to the right, leaning the other way — and glide toward each other
 * until they lock into the sentence, with an overshoot-free expo settle. The
 * regular words brake one after the other, nearest first, like carriages
 * closing up. Once the halves have met, the label (the aside) slides in from
 * the side facing the heading. It replays on every pass: arriving from below
 * the halves also lift a few px into place, arriving from above (scrolling
 * back up) they drop into place instead. Leaving is shorter and harder
 * (`power3.in`): the label retracts toward the heading first, then the halves
 * part ways — outermost words first — drifting the way the page moves.
 */
export function StackHeaderSplitHeadingHeader({
  presentation: presentationProp,
  trailing,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioStackPresentationSettings;
  trailing?: ReactNode;
}) {
  const presentation = presentationProp ?? DEFAULT_STACK_PRESENTATION;
  const motionOff = usePortfolioHeaderMotionOff();
  const animationEnabled = presentation.headerAnimationEnabled !== false && !motionOff;
  const show = headerElementVisibility(presentation.headerHiddenElements, 'split-heading');
  const showTitle = show('title');
  const showLabel = show('label');
  const title = showTitle ? (presentation.headerSplitHeadingTitleText || DEFAULT_TITLE_TEXT).trim() : '';
  const label = (presentation.headerSplitHeadingLabelText || DEFAULT_LABEL_TEXT).trim();
  const ink = stackHeaderPaletteTokenColor(presentation.headerSplitHeadingTitleColor ?? 'principal');
  const muted = stackHeaderPaletteTokenColor(presentation.headerSplitHeadingLabelColor ?? 'secondaire');
  const titleWeight = TITLE_WEIGHT[presentation.headerSplitHeadingTitleWeight ?? 'regular'];

  const sectionRef = useRef<HTMLDivElement>(null);
  const italicRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const regularWordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const headingParts = useMemo(() => {
    const words = title.split(/\s+/).filter(Boolean);
    if (words.length === 0) return { italic: '', regular: [] as string[] };
    return { italic: words[0], regular: words.slice(1) };
  }, [title]);

  // ========== ANIMATION: Convergence in / parting out, replayed on every pass ==========
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion() || !animationEnabled) return;

    const italicEl = italicRef.current;
    const labelEl = labelRef.current;
    const wordEls = regularWordRefs.current
      .slice(0, headingParts.regular.length)
      .filter((node): node is HTMLSpanElement => Boolean(node));

    gsap.registerPlugin(ScrollTrigger);
    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        // A best-effort refresh must never take the page down (GSAP can throw on an init-time edge case).
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);
    const scroller = stackHeaderScrollParent(section);

    // How far apart the halves start: ~10% of the header's own width (not the
    // window — the dashboard preview is narrower), kept within a range where
    // the travel reads as a deliberate move without dragging the text across
    // the whole column. Read at play time so a resize is picked up.
    const spread = () => Math.round(Math.min(160, Math.max(48, section.clientWidth * 0.1)));
    const LABEL_OFFSET = 18;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        // Hidden "from" state until the header first reaches the viewport (set before paint: no flash).
        if (italicEl) gsap.set(italicEl, { opacity: 0, x: -spread(), y: 8, skewX: -8 });
        if (wordEls.length) gsap.set(wordEls, { opacity: 0, x: spread(), y: 8, skewX: 5 });
        if (labelEl) gsap.set(labelEl, { opacity: 0, x: -LABEL_OFFSET });

        // dir 1: arriving from below (scrolling down); -1: arriving from above (scrolling up).
        const enter = (dir: 1 | -1) => {
          const d = spread();
          if (italicEl) {
            gsap.fromTo(
              italicEl,
              { opacity: 0, x: -d, y: 8 * dir, skewX: -8 },
              { opacity: 1, x: 0, y: 0, skewX: 0, duration: 1.15, ease: 'expo.out', overwrite: true }
            );
          }
          if (wordEls.length) {
            gsap.fromTo(
              wordEls,
              { opacity: 0, x: d, y: 8 * dir, skewX: 5 },
              {
                opacity: 1,
                x: 0,
                y: 0,
                skewX: 0,
                duration: 1.15,
                ease: 'expo.out',
                // Nearest word locks first, the tail closes up behind it.
                stagger: 0.04,
                delay: 0.05,
                overwrite: true,
              }
            );
          }
          if (labelEl) {
            // Waits until the halves have (visually) met, then comes from the heading's side.
            gsap.fromTo(
              labelEl,
              { opacity: 0, x: -LABEL_OFFSET },
              { opacity: 1, x: 0, duration: 0.8, ease: 'expo.out', delay: 0.5, overwrite: true }
            );
          }
        };
        // dir 1: out through the top; -1: out through the bottom. Faster than the entrance, label first.
        const leave = (dir: 1 | -1) => {
          const d = spread() * 0.6;
          if (labelEl) {
            gsap.to(labelEl, { opacity: 0, x: -LABEL_OFFSET * 0.6, duration: 0.3, ease: 'power3.in', overwrite: true });
          }
          if (italicEl) {
            gsap.to(italicEl, {
              opacity: 0,
              x: -d,
              y: -6 * dir,
              skewX: -6,
              duration: 0.5,
              ease: 'power3.in',
              delay: 0.08,
              overwrite: true,
            });
          }
          if (wordEls.length) {
            gsap.to(wordEls, {
              opacity: 0,
              x: d,
              y: -6 * dir,
              skewX: 4,
              duration: 0.5,
              ease: 'power3.in',
              // Outermost word peels off first.
              stagger: { each: 0.03, from: 'end' },
              delay: 0.08,
              overwrite: true,
            });
          }
        };

        ScrollTrigger.create({
          trigger: section,
          scroller,
          start: 'top 85%',
          end: 'bottom 25%',
          onEnter: () => enter(1),
          onLeave: () => leave(1),
          onEnterBack: () => enter(-1),
          onLeaveBack: () => leave(-1),
        });
      }, section);
    } catch (error) {
      // Never leave the header invisible because the motion failed to initialise.
      console.error('[StackHeaderSplitHeadingHeader] motion setup failed', error);
      ctx?.revert();
    }

    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [animationEnabled, headingParts, label, showLabel]);

  return (
    <div
      ref={sectionRef}
      className="w-full"
      // `overflow-x: clip` (not hidden) keeps the halves' horizontal travel from ever widening the page,
      // without turning the header into a scroll container or clipping descenders vertically.
      style={{
        marginBottom: `${STACK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem`,
        overflowX: 'clip',
      }}
      data-stack-header="split-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        {title ? (
          <div className="min-w-0">
            <h2
              className={`max-w-4xl ${TITLE_SIZE_CLASS[presentation.headerSplitHeadingTitleSize ?? 'md']} leading-[1.06] tracking-tight`}
              style={{ color: ink }}
            >
              {headingParts.italic ? (
                <span
                  ref={italicRef}
                  className="inline-block"
                  style={{ fontStyle: 'italic', fontWeight: titleWeight.italic }}
                >
                  {headingParts.italic}
                </span>
              ) : null}
              {headingParts.regular.length > 0 ? (
                <span style={{ fontWeight: titleWeight.regular }}>
                  {/* One inline-block per word (transforms need a box) — the spaces stay plain text, so the
                      title still wraps word by word exactly as the single inline run did. */}
                  {headingParts.regular.map((word, index) => (
                    <span key={`${word}-${index}`}>
                      {' '}
                      <span
                        ref={(node) => {
                          regularWordRefs.current[index] = node;
                        }}
                        className="inline-block"
                      >
                        {word}
                      </span>
                    </span>
                  ))}
                </span>
              ) : null}
            </h2>
          </div>
        ) : null}

        {showLabel ? (
          <span
            ref={labelRef}
            className={`inline-block whitespace-nowrap uppercase ${LABEL_SIZE_CLASS[presentation.headerSplitHeadingLabelSize ?? 'md']} ${LABEL_WEIGHT_CLASS[presentation.headerSplitHeadingLabelWeight ?? 'regular']}`}
            style={{
              color: muted,
              letterSpacing: '0.14em',
            }}
          >
            {label}
          </span>
        ) : null}
      </div>

      {trailing ? <div className="mt-6">{trailing}</div> : null}
    </div>
  );
}
