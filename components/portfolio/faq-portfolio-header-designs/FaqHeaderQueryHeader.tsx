'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  DEFAULT_FAQ_PRESENTATION,
  faqHeaderFontClass,
  faqTitleColorStyle,
  faqSubtitleColorStyle,
  type PortfolioFaqPresentationSettings,
} from '@/components/portfolio/portfolio-faq-settings';
import { FAQ_HEADER_MARGIN_BOTTOM_REM } from '@/components/portfolio/portfolio-faq-header-settings';
import { FAQ_HEADER_TITLE_SIZE_CLASS, createFaqHeaderLayoutResolver } from '@/components/portfolio/portfolio-faq-header-layout';

/** Layout settings → "Glyph intensity" (Medium is the original 10%). */
const GLYPH_INK_PERCENT: Record<string, number> = { subtle: 6, medium: 10, bold: 18 };

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isLaidOut(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

/** Nearest scrollable ancestor — ScrollTrigger needs this explicitly inside an
 *  embedded/iframe dashboard preview, where `window` isn't the real scroller. */
function faqHeaderScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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
 * Query — a giant, near-invisible "?" glyph sits behind the title, drifting slowly
 * upward as the page scrolls past it; a small rotated vertical "FAQ" label runs down
 * the left edge instead of a horizontal kicker line. Title/subtitle fade+lift in,
 * the glyph scales in a beat later.
 */
export function FaqHeaderQueryHeader({
  title,
  subtitle,
  presentation: presentationProp,
  trailing,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioFaqPresentationSettings;
  trailing?: ReactNode;
}) {
  const presentation = presentationProp ?? DEFAULT_FAQ_PRESENTATION;
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const titleText = title.trim();
  const subtitleText = subtitle?.trim() || '';
  const titleInk = faqTitleColorStyle(presentation.titleColor).color as string;
  const layout = createFaqHeaderLayoutResolver(presentation, 'query');
  const showGlyph = layout.isVisible('glyph');
  // A short mark only — anything longer than 3 characters would stop reading as a glyph.
  const glyphChar = (layout.text('glyphChar') ?? '?').slice(0, 3);
  const glyphInk = `color-mix(in srgb, ${titleInk} ${GLYPH_INK_PERCENT[layout.option('glyphIntensity')] ?? 10}%, transparent)`;
  const kickerText = layout.text('kicker');
  const titleSizeClass = FAQ_HEADER_TITLE_SIZE_CLASS[presentation.headerTitleSize ?? 'md'] ?? FAQ_HEADER_TITLE_SIZE_CLASS.md;

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
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        const pick = (selector: string) =>
          [...header.querySelectorAll<HTMLElement>(selector)].filter(isLaidOut);
        const kicker = pick('.pf-faq-header-query-kicker');
        const titleLines = pick('.pf-faq-header-query-title');
        const subs = pick('.pf-faq-header-query-sub');
        const glyph = header.querySelector<HTMLElement>('.pf-faq-header-query-glyph');

        const tl = gsap.timeline({
          defaults: { overwrite: 'auto' },
          scrollTrigger: {
            trigger: header,
            scroller: faqHeaderScrollParent(header),
            start: 'top 85%',
            once: true,
          },
        });
        if (kicker.length) tl.fromTo(kicker, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);
        if (glyph) tl.fromTo(glyph, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out' }, 0.05);
        if (titleLines.length) tl.fromTo(titleLines, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, 0.16);
        if (subs.length) tl.fromTo(subs, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.4);

        // No invalidateOnRefresh — static from/to scrub values only, matching the
        // documented fix for the intermittent GSAP-internal refresh crash on this
        // exact pattern (see FaqHeaderEditorialHeader's own note).
        if (glyph) {
          gsap.fromTo(
            glyph,
            { y: 0 },
            {
              y: -36,
              ease: 'none',
              scrollTrigger: {
                trigger: header,
                scroller: faqHeaderScrollParent(header),
                start: 'top 20%',
                end: 'top -40%',
                scrub: 0.5,
              },
            }
          );
        }
      }, header);
    } catch (error) {
      console.error('[FaqHeaderQueryHeader] GSAP entrance animation failed to initialize', error);
      ctx?.revert();
      gsap.set(
        header.querySelectorAll('.pf-faq-header-query-kicker, .pf-faq-header-query-title, .pf-faq-header-query-sub, .pf-faq-header-query-glyph'),
        { clearProps: 'all' }
      );
    }

    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [animationEnabled, titleText, subtitleText, showGlyph, kickerText]);

  return (
    <header
      ref={headerRef}
      className="pf-faq-header-query-header relative w-full overflow-hidden text-left"
      style={{ marginBottom: `${FAQ_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      {showGlyph ? (
        <span
          aria-hidden
          className="pf-faq-header-query-glyph pointer-events-none absolute -right-2 top-1/2 select-none font-black leading-none"
          style={{
            fontSize: 'clamp(9rem, 20vw, 17rem)',
            color: glyphInk,
            transform: 'translateY(-50%)',
          }}
        >
          {glyphChar}
        </span>
      ) : null}

      {/* No extra left padding: the vertical label (sm+) already spaces the title via the gap,
          and on mobile — where that label is hidden — an indent would push the title off the
          content edge the FAQ list below starts on. */}
      <div className="relative z-[1] flex gap-4">
        {kickerText ? (
          <span
            aria-hidden
            className="pf-faq-header-query-kicker hidden shrink-0 text-[0.68rem] font-semibold uppercase tracking-[0.24em] sm:block"
            style={{
              ...faqSubtitleColorStyle(presentation.subtitleColor),
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
            }}
          >
            {kickerText}
          </span>
        ) : null}
        <div className="min-w-0 max-w-2xl">
          <h2
            className={`pf-faq-header-query-title mb-0 ${titleSizeClass} ${faqHeaderFontClass(presentation.titleFont, 'title')} tracking-[-0.03em] lg:leading-[0.98]`}
            style={faqTitleColorStyle(presentation.titleColor)}
          >
            {titleText}
          </h2>
          {subtitleText ? (
            <p
              className={`pf-faq-header-query-sub mb-0 mt-6 max-w-md ${faqHeaderFontClass(presentation.subtitleFont, 'subtitle')} text-sm leading-relaxed sm:text-base`}
              style={faqSubtitleColorStyle(presentation.subtitleColor)}
            >
              {subtitleText}
            </p>
          ) : null}
          {trailing ? <div className="mt-4 shrink-0">{trailing}</div> : null}
        </div>
      </div>
    </header>
  );
}
