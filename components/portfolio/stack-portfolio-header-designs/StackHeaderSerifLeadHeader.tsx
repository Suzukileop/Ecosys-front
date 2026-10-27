'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { DEFAULT_STACK_PRESENTATION, type PortfolioStackPresentationSettings } from '@/components/portfolio/portfolio-stack-settings';
import {
  STACK_HEADER_MARGIN_BOTTOM_REM,
  stackHeaderPaletteTokenColor,
  type PortfolioStackHeaderTitleSize,
  type PortfolioStackHeaderTitleWeight,
} from '@/components/portfolio/portfolio-stack-header-settings';
import { usePortfolioHeaderMotionOff } from '@/components/portfolio/portfolio-motion-off';
import { headerElementVisibility } from '@/components/portfolio/portfolio-header-elements';

/** Label is a small uppercase kicker — sizes stay compact at every step. */
const LABEL_SIZE: Record<PortfolioStackHeaderTitleSize, string> = {
  sm: '0.6875rem',
  md: '0.75rem',
  lg: '0.85rem',
  xl: '0.95rem',
};
const LABEL_WEIGHT: Record<PortfolioStackHeaderTitleWeight, number> = {
  light: 300,
  regular: 350,
  semibold: 500,
  bold: 650,
};
/** Title keeps its serif clamp scale — "regular" preserves this design's prior default (500). */
const TITLE_SIZE: Record<PortfolioStackHeaderTitleSize, string> = {
  sm: 'clamp(1.8rem, 3.9vw, 2.65rem)',
  md: 'clamp(2.15rem, 4.8vw, 3.35rem)',
  lg: 'clamp(2.6rem, 5.7vw, 4.05rem)',
  xl: 'clamp(3.1rem, 6.6vw, 4.85rem)',
};
const TITLE_WEIGHT: Record<PortfolioStackHeaderTitleWeight, number> = {
  light: 400,
  regular: 500,
  semibold: 600,
  bold: 700,
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
// The plain section title (usually one or two short words) would stay on a
// single line and never show the two-line serif treatment, so this design
// gets its own default sentence, same as Masthead's own default headline.
const DEFAULT_TITLE_TEXT = 'A curated set of languages, frameworks, and tools.';

/** Two-line split, avoiding a one-word widow on the last line. */
function splitSerifLeadLines(text: string): string[] {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return [];
  const words = trimmed.split(' ');
  if (words.length <= 4) return [trimmed];
  let splitAt = Math.max(2, Math.round(words.length * 0.62));
  if (words.length - splitAt < 2) splitAt = Math.max(2, words.length - 2);
  if (splitAt >= words.length) return [trimmed];
  return [words.slice(0, splitAt).join(' '), words.slice(splitAt).join(' ')];
}

/**
 * Serif lead — a small uppercase label above a large serif title split across up to two balanced lines.
 *
 * Motion — quiet and typographic, unlike the other Stack headers: the label's letter-spacing SETTLES (it
 * arrives airy and tightens into place as it fades in), then each serif line comes into presence with a soft
 * rise and a barely-there scale from 97%, one after the other, and the subtitle follows. No mask, no blur,
 * no count: just tracking, light and a little depth. It replays on every pass; scrolling back up, the lines
 * descend instead of rising. Leaving is shorter and lighter: the lines thin out toward the scroll direction,
 * last line first, and the label opens its tracking again as it fades.
 */
export function StackHeaderSerifLeadHeader({
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
  const align = presentation.headerDesignAlignment ?? 'left';
  const centered = align === 'center';
  const alignRight = align === 'right';
  const motionOff = usePortfolioHeaderMotionOff();
  const animationEnabled = presentation.headerAnimationEnabled !== false && !motionOff;
  const show = headerElementVisibility(presentation.headerHiddenElements, 'serif-lead');
  const showLabel = show('label');
  const showTitle = show('title');
  const showSubtitle = show('subtitle');
  const title = (presentation.headerSerifLeadTitleText || DEFAULT_TITLE_TEXT).trim();
  const label = (presentation.headerSerifLeadLabelText || DEFAULT_LABEL_TEXT).trim();
  const lines = showTitle ? splitSerifLeadLines(title) : [];
  const subtitleText = showSubtitle ? presentation.headerSerifLeadSubtitleText?.trim() || subtitle?.trim() || '' : '';

  const labelTone = stackHeaderPaletteTokenColor(presentation.headerSerifLeadLabelColor ?? 'texteFort');
  const titleTone = stackHeaderPaletteTokenColor(presentation.headerSerifLeadTitleColor ?? 'texteFort');
  const subtitleTone = stackHeaderPaletteTokenColor(presentation.headerSerifLeadSubtitleColor ?? 'texteFort');
  const labelFontSize = LABEL_SIZE[presentation.headerSerifLeadLabelSize ?? 'md'];
  const labelFontWeight = LABEL_WEIGHT[presentation.headerSerifLeadLabelWeight ?? 'regular'];
  const titleFontSize = TITLE_SIZE[presentation.headerSerifLeadTitleSize ?? 'md'];
  const titleFontWeight = TITLE_WEIGHT[presentation.headerSerifLeadTitleWeight ?? 'regular'];
  const subtitleFontSize = SUBTITLE_SIZE[presentation.headerSerifLeadSubtitleSize ?? 'md'];
  const subtitleFontWeight = SUBTITLE_WEIGHT[presentation.headerSerifLeadSubtitleWeight ?? 'regular'];

  // Lines scale toward their own anchor, so a left-aligned title grows from the left edge, not its centre.
  const originX = centered ? '50% 100%' : alignRight ? '100% 100%' : '0% 100%';

  const headerRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const leadRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    const header = headerRef.current;
    const labelEl = labelRef.current;
    const subtitleEl = subtitleRef.current;
    if (!header) return;
    if (prefersReducedMotion() || !animationEnabled) return;

    gsap.registerPlugin(ScrollTrigger);
    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        // A best-effort refresh must never take the page down (GSAP can throw on an init-time edge case).
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);
    const scroller = stackHeaderScrollParent(header);
    const lineEls = lineRefs.current.filter((node): node is HTMLSpanElement => Boolean(node));
    const LABEL_TRACKING = '0.1em';
    const LABEL_TRACKING_OPEN = '0.42em';

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        // Hidden until the header first reaches the viewport (set before paint: no flash).
        if (labelEl) gsap.set(labelEl, { opacity: 0, letterSpacing: LABEL_TRACKING_OPEN });
        if (lineEls.length) gsap.set(lineEls, { opacity: 0, y: '0.35em', scale: 0.97, transformOrigin: originX });
        if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, y: 10 });

        // dir 1: arriving from below (scrolling down); -1: arriving from above (scrolling up).
        const enter = (dir: 1 | -1) => {
          if (labelEl) {
            gsap.to(labelEl, { opacity: 1, letterSpacing: LABEL_TRACKING, duration: 1.1, ease: 'expo.out', overwrite: true });
          }
          if (lineEls.length) {
            gsap.fromTo(
              lineEls,
              { opacity: 0, y: `${0.35 * dir}em`, scale: 0.97 },
              { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.15, overwrite: true }
            );
          }
          if (subtitleEl) {
            gsap.fromTo(
              subtitleEl,
              { opacity: 0, y: 10 * dir },
              { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.45, overwrite: true }
            );
          }
        };
        // dir 1: out through the top; -1: out through the bottom. Shorter and lighter than the entrance.
        const leave = (dir: 1 | -1) => {
          if (subtitleEl) gsap.to(subtitleEl, { opacity: 0, y: -8 * dir, duration: 0.35, ease: 'power2.in', overwrite: true });
          if (lineEls.length) {
            gsap.to(lineEls, {
              opacity: 0,
              y: `${-0.25 * dir}em`,
              scale: 0.985,
              duration: 0.5,
              ease: 'power2.in',
              stagger: { each: 0.06, from: 'end' },
              overwrite: true,
            });
          }
          if (labelEl) {
            gsap.to(labelEl, { opacity: 0, letterSpacing: LABEL_TRACKING_OPEN, duration: 0.5, ease: 'power2.in', delay: 0.1, overwrite: true });
          }
        };

        ScrollTrigger.create({
          trigger: header,
          scroller,
          start: 'top 85%',
          end: 'bottom 25%',
          onEnter: () => enter(1),
          onLeave: () => leave(1),
          onEnterBack: () => enter(-1),
          onLeaveBack: () => leave(-1),
        });
      }, header);
    } catch (error) {
      // Never leave the header invisible because the motion failed to initialise.
      console.error('[StackHeaderSerifLeadHeader] motion setup failed', error);
      ctx?.revert();
    }

    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [animationEnabled, title, label, subtitleText, centered, alignRight, showLabel, showTitle, originX]);

  const textAlignClass = centered ? 'text-center' : alignRight ? 'text-right' : 'text-left';
  const itemsAlignClass = centered ? 'items-center' : alignRight ? 'items-end' : 'items-start';
  const leadMarginLeft = centered || alignRight ? 'auto' : 0;
  const leadMarginRight = centered || !alignRight ? 'auto' : 0;

  return (
    <header
      ref={headerRef}
      className={`relative w-full ${textAlignClass}`}
      style={{ marginBottom: `${STACK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      <div className={`flex flex-col gap-3 ${itemsAlignClass}`}>
        <div className="min-w-0">
          {showLabel ? (
            <p
              ref={labelRef}
              className="mb-0 uppercase leading-[1.2] tracking-[0.1em]"
              style={{
                color: `color-mix(in srgb, ${labelTone} 40%, transparent)`,
                fontSize: labelFontSize,
                fontWeight: labelFontWeight,
              }}
            >
              {label}
            </p>
          ) : null}
          {lines.length > 0 ? (
            <h2
              ref={leadRef}
              className="mb-0 mt-[1.05rem] font-serif"
              style={{
                color: titleTone,
                maxWidth: 'min(32ch, 100%)',
                fontSize: titleFontSize,
                fontWeight: titleFontWeight,
                lineHeight: 1.06,
                letterSpacing: '-0.04em',
                marginLeft: leadMarginLeft,
                marginRight: leadMarginRight,
              }}
            >
              {lines.map((line, index) => (
                <span key={`${line}-${index}`} className="block">
                  <span
                    ref={(node) => {
                      lineRefs.current[index] = node;
                    }}
                    className="block"
                    style={{ paddingBottom: '0.04em' }}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h2>
          ) : null}
          {subtitleText ? (
            <p
              ref={subtitleRef}
              className="mb-0 mt-3 max-w-xl leading-relaxed"
              style={{ color: subtitleTone, fontSize: subtitleFontSize, fontWeight: subtitleFontWeight }}
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
