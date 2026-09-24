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
import {
  FAQ_HEADER_MARGIN_BOTTOM_REM,
  faqHeaderPaletteTokenColor,
  type PortfolioFaqHeaderPaletteToken,
} from '@/components/portfolio/portfolio-faq-header-settings';
import {
  FAQ_HEADER_TITLE_SIZE_CLASS,
  createFaqHeaderLayoutResolver,
  faqHeaderCountLabel,
} from '@/components/portfolio/portfolio-faq-header-layout';

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

/** Splits on whitespace, keeping each word wrapped so it can mask-reveal independently. */
function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * Signal — a pulsing "live" status pill (question count) sits above an asymmetric
 * title/subtitle line: the title fills the left column, a short subtitle note sits
 * bottom-right on wide screens, closer to a dashboard readout than the other Header
 * designs' stacked block. Words mask-reveal in from below on entrance.
 */
export function FaqHeaderSignalHeader({
  title,
  subtitle,
  presentation: presentationProp,
  itemCount,
  trailing,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioFaqPresentationSettings;
  itemCount?: number;
  trailing?: ReactNode;
}) {
  const presentation = presentationProp ?? DEFAULT_FAQ_PRESENTATION;
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const titleText = title.trim();
  const subtitleText = subtitle?.trim() || '';
  const words = splitWords(titleText);
  const layout = createFaqHeaderLayoutResolver(presentation, 'signal');
  const showPill = layout.isVisible('pill');
  const pillLabel = layout.text('pillLabel');
  const showCount = layout.isVisible('count');
  const subtitleBelow = layout.option('subtitlePlacement') === 'below';
  const dotColor = faqHeaderPaletteTokenColor(layout.option('dotColor') as PortfolioFaqHeaderPaletteToken);
  const count = itemCount ?? 0;
  const countLabel = faqHeaderCountLabel(count, layout.text('countLabel'));
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
        const pill = header.querySelector<HTMLElement>('.pf-faq-header-signal-pill');
        const wordLines = pick('.pf-faq-header-signal-word-line');
        const subs = pick('.pf-faq-header-signal-sub');

        const tl = gsap.timeline({
          defaults: { overwrite: 'auto' },
          scrollTrigger: {
            trigger: header,
            scroller: faqHeaderScrollParent(header),
            start: 'top 85%',
            once: true,
          },
        });
        if (pill) tl.fromTo(pill, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0);
        if (wordLines.length) {
          tl.set(wordLines, { yPercent: 100 }, 0);
          tl.to(wordLines, { yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.045 }, 0.16);
        }
        if (subs.length) {
          tl.set(subs, { y: 12, opacity: 0 }, 0);
          tl.to(subs, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.42);
        }
      }, header);
    } catch (error) {
      console.error('[FaqHeaderSignalHeader] GSAP entrance animation failed to initialize', error);
      ctx?.revert();
      gsap.set(header.querySelectorAll('.pf-faq-header-signal-pill, .pf-faq-header-signal-word-line, .pf-faq-header-signal-sub'), {
        clearProps: 'all',
      });
    }

    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [animationEnabled, titleText, subtitleText, countLabel, showPill, subtitleBelow]);

  return (
    <header
      ref={headerRef}
      className="pf-faq-header-signal-header relative w-full text-left"
      style={{ marginBottom: `${FAQ_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
    >
      {showPill ? (
        <div
          className="pf-faq-header-signal-pill mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
          style={{ borderColor: 'color-mix(in srgb, currentColor 16%, transparent)' }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: dotColor }}
            />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
          </span>
          {pillLabel ? (
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em]" style={faqTitleColorStyle(presentation.titleColor)}>
              {pillLabel}
            </span>
          ) : null}
          {pillLabel && showCount ? (
            <span className="h-3 w-px" style={{ backgroundColor: 'color-mix(in srgb, currentColor 20%, transparent)' }} />
          ) : null}
          {showCount ? (
            <span className="text-[0.7rem] font-semibold" style={faqSubtitleColorStyle(presentation.subtitleColor)}>
              {countLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* "Side" goes side by side only when the header itself is wide enough (container query
          in globals.css), not at a viewport breakpoint — inside a narrow column such as Kinetic
          Split's left rail, a viewport `lg:` row pushed the subtitle out over the question list. */}
      <div className={`flex flex-col gap-6 ${subtitleBelow ? '' : 'pf-faq-header-signal-row--side'}`}>
        <h2
          className={`mb-0 max-w-3xl ${titleSizeClass} ${faqHeaderFontClass(presentation.titleFont, 'title')} tracking-[-0.03em] lg:leading-[0.98]`}
          style={faqTitleColorStyle(presentation.titleColor)}
        >
          {words.map((word, index) => (
            <span key={`${word}-${index}`} className="mr-[0.28em] inline-block overflow-hidden align-bottom last:mr-0">
              <span className="pf-faq-header-signal-word-line inline-block">{word}</span>
            </span>
          ))}
        </h2>
        {subtitleText ? (
          <p
            className={`pf-faq-header-signal-sub mb-0 shrink-0 ${
              subtitleBelow ? 'max-w-xl' : 'max-w-xs pf-faq-header-signal-sub--side'
            } ${faqHeaderFontClass(presentation.subtitleFont, 'subtitle')} text-sm leading-relaxed sm:text-base`}
            style={faqSubtitleColorStyle(presentation.subtitleColor)}
          >
            {subtitleText}
          </p>
        ) : null}
      </div>
      {trailing ? <div className="mt-4 shrink-0">{trailing}</div> : null}
    </header>
  );
}
