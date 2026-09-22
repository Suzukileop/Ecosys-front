'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { DEFAULT_CONTACT_PRESENTATION, type PortfolioContactPresentationSettings } from '@/components/portfolio/portfolio-contact-settings';
import {
  CONTACT_HEADER_MARGIN_BOTTOM_REM,
  contactHeaderPaletteTokenColor,
  type PortfolioContactHeaderTitleSize,
  type PortfolioContactHeaderTitleWeight,
} from '@/components/portfolio/portfolio-contact-header-settings';

/** Label is a small uppercase kicker — sizes stay compact at every step. */
const LABEL_SIZE: Record<PortfolioContactHeaderTitleSize, string> = {
  sm: '0.6875rem',
  md: '0.75rem',
  lg: '0.85rem',
  xl: '0.95rem',
};
const LABEL_WEIGHT: Record<PortfolioContactHeaderTitleWeight, number> = {
  light: 300,
  regular: 350,
  semibold: 500,
  bold: 650,
};
/** Title keeps its serif clamp scale — "regular" preserves this design's prior default (500). */
const TITLE_SIZE: Record<PortfolioContactHeaderTitleSize, string> = {
  sm: 'clamp(1.8rem, 3.9vw, 2.65rem)',
  md: 'clamp(2.15rem, 4.8vw, 3.35rem)',
  lg: 'clamp(2.6rem, 5.7vw, 4.05rem)',
  xl: 'clamp(3.1rem, 6.6vw, 4.85rem)',
};
const TITLE_WEIGHT: Record<PortfolioContactHeaderTitleWeight, number> = {
  light: 400,
  regular: 500,
  semibold: 600,
  bold: 700,
};
const SUBTITLE_SIZE: Record<PortfolioContactHeaderTitleSize, string> = {
  sm: '0.8125rem',
  md: '0.9375rem',
  lg: '1.0625rem',
  xl: '1.1875rem',
};
const SUBTITLE_WEIGHT: Record<PortfolioContactHeaderTitleWeight, number> = {
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
function contactHeaderScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

const DEFAULT_LABEL_TEXT = 'Contact';
// The plain section title (usually one or two short words) would stay on a
// single line and never show the two-line serif treatment, so this design
// gets its own default sentence, same as Masthead's own default headline.
const DEFAULT_TITLE_TEXT = 'Always happy to hear about new projects and ideas.';

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
 * Serif lead — exact disposition + motion copy of Portfolio/Work's Serif lead
 * header (`WorkSerifLeadHeader`): a small uppercase label above a large serif
 * title split across up to two balanced lines, each masked and revealed with
 * a stagger. On scroll: the label drifts up while the title block slides and
 * fades away — two separate, scrubbed motions, not one shared recede.
 */
export function ContactHeaderSerifLeadHeader({
  subtitle,
  presentation: presentationProp,
  trailing,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioContactPresentationSettings;
  trailing?: ReactNode;
}) {
  const presentation = presentationProp ?? DEFAULT_CONTACT_PRESENTATION;
  const align = presentation.headerDesignAlignment ?? 'left';
  const centered = align === 'center';
  const alignRight = align === 'right';
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const title = (presentation.headerSerifLeadTitleText || DEFAULT_TITLE_TEXT).trim();
  const label = (presentation.headerSerifLeadLabelText || DEFAULT_LABEL_TEXT).trim();
  const lines = splitSerifLeadLines(title);

  const labelTone = contactHeaderPaletteTokenColor(presentation.headerSerifLeadLabelColor ?? 'texteFort');
  const titleTone = contactHeaderPaletteTokenColor(presentation.headerSerifLeadTitleColor ?? 'texteFort');
  const subtitleTone = contactHeaderPaletteTokenColor(presentation.headerSerifLeadSubtitleColor ?? 'texteFort');
  const labelFontSize = LABEL_SIZE[presentation.headerSerifLeadLabelSize ?? 'md'];
  const labelFontWeight = LABEL_WEIGHT[presentation.headerSerifLeadLabelWeight ?? 'regular'];
  const titleFontSize = TITLE_SIZE[presentation.headerSerifLeadTitleSize ?? 'md'];
  const titleFontWeight = TITLE_WEIGHT[presentation.headerSerifLeadTitleWeight ?? 'regular'];
  const subtitleFontSize = SUBTITLE_SIZE[presentation.headerSerifLeadSubtitleSize ?? 'md'];
  const subtitleFontWeight = SUBTITLE_WEIGHT[presentation.headerSerifLeadSubtitleWeight ?? 'regular'];

  const headerRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const leadRef = useRef<HTMLHeadingElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    const header = headerRef.current;
    const labelEl = labelRef.current;
    const leadBlock = leadRef.current;
    if (!header || !labelEl) return;
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
    const scroller = contactHeaderScrollParent(header);
    const lineEls = lineRefs.current.filter((node): node is HTMLSpanElement => Boolean(node));

    const ctx = gsap.context(() => {
      gsap.set(labelEl, { opacity: 0 });
      if (lineEls.length) gsap.set(lineEls, { yPercent: 110 });
      if (leadBlock) gsap.set(leadBlock, { x: 0, opacity: 1 });

      // Gated by ScrollTrigger, not fired on mount — a header mounted below
      // the fold must stay in its hidden "from" state (set immediately, no
      // flash) until it actually scrolls into view, not play-then-finish
      // off-screen and show up already static.
      const intro = gsap.timeline({
        defaults: { overwrite: true },
        scrollTrigger: { trigger: header, scroller, start: 'top 85%', once: true },
      });
      intro.to(labelEl, { opacity: 1, duration: 0.7, ease: 'power2.out' });
      if (lineEls.length) {
        intro.to(lineEls, { yPercent: 0, duration: 0.95, ease: 'power3.out', stagger: 0.14 }, 0.12);
      }

      const fade = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          scroller,
          start: 'top 52%',
          end: 'top 0%',
          scrub: 0.45,
          invalidateOnRefresh: true,
        },
      });
      fade.fromTo(labelEl, { y: 0 }, { y: -26, ease: 'none' }, 0);
      if (leadBlock) {
        const slideX = centered ? 0 : alignRight ? 16 : -16;
        fade.fromTo(leadBlock, { x: 0, opacity: 1 }, { x: 0, opacity: 1, duration: 0.22, ease: 'none' }, 0);
        fade.to(leadBlock, { x: slideX, opacity: 0, duration: 0.78, ease: 'power1.in' }, 0.22);
      }
    }, header);

    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [animationEnabled, title, label, centered, alignRight]);

  const textAlignClass = centered ? 'text-center' : alignRight ? 'text-right' : 'text-left';
  const itemsAlignClass = centered ? 'items-center' : alignRight ? 'items-end' : 'items-start';
  const leadMarginLeft = centered || alignRight ? 'auto' : 0;
  const leadMarginRight = centered || !alignRight ? 'auto' : 0;

  return (
    <header
      ref={headerRef}
      className={`relative w-full ${textAlignClass}`}
      style={{ marginBottom: `${CONTACT_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      <div className={`flex flex-col gap-3 ${itemsAlignClass}`}>
        <div className="min-w-0">
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
                <span key={`${line}-${index}`} className="block overflow-hidden" style={{ clipPath: 'inset(0)' }}>
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
          {subtitle ? (
            <p
              className="mb-0 mt-3 max-w-xl leading-relaxed"
              style={{ color: subtitleTone, fontSize: subtitleFontSize, fontWeight: subtitleFontWeight }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </header>
  );
}
