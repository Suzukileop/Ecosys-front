'use client';

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { DEFAULT_FOOTER_PRESENTATION, type PortfolioFooterPresentationSettings } from '@/components/portfolio/portfolio-footer-settings';
import {
  FOOTER_HEADER_MARGIN_BOTTOM_REM,
  FOOTER_HEADER_PADDING_REM,
  footerHeaderPaletteTokenColor,
  type PortfolioFooterHeaderBillboardWordStyle,
} from '@/components/portfolio/portfolio-footer-header-settings';

const DEFAULT_BIG_WORD = 'TALK';
const REFERENCE_PX = 100;

/**
 * Sizes `textRef`'s font so its rendered box exactly fills `containerRef`'s
 * width — on mount, on any container-width change, and once web fonts
 * finish loading. Measures the *same* element it then resizes, so
 * measurement and final render can never disagree.
 */
function useFitWidthTextSize(
  containerRef: RefObject<HTMLElement | null>,
  textRef: RefObject<HTMLElement | null>,
  text: string
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
  }, [text]);
}

/** The full-bleed word — outline (stroke + glow), fill (solid + glow), or
 *  simple (solid, no glow at all — plain display), user's choice. */
function FooterHeaderBillboardBigWord({
  text,
  tone,
  wordStyle,
}: {
  text: string;
  tone: string;
  wordStyle: PortfolioFooterHeaderBillboardWordStyle;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  useFitWidthTextSize(containerRef, textRef, text);

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
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </div>
  );
}

/**
 * Billboard — full-bleed outline word, nothing else.
 */
export function FooterHeaderBillboardHeader({
  presentation: presentationProp,
  trailing,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioFooterPresentationSettings;
  trailing?: ReactNode;
  itemCount?: number;
}) {
  const presentation = presentationProp ?? DEFAULT_FOOTER_PRESENTATION;
  const bigWord = (presentation.headerBillboardBigWord || DEFAULT_BIG_WORD).trim();
  const wordTone = footerHeaderPaletteTokenColor(presentation.headerBillboardWordColor ?? 'principal');

  return (
    <div
      className="w-full"
      style={{
        marginBottom: `${FOOTER_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem`,
        paddingTop: `${FOOTER_HEADER_PADDING_REM[presentation.headerPaddingTop ?? 'none']}rem`,
        paddingBottom: `${FOOTER_HEADER_PADDING_REM[presentation.headerPaddingBottom ?? 'none']}rem`,
      }}
      data-footer-header="billboard"
    >
      <div>
        <FooterHeaderBillboardBigWord text={bigWord} tone={wordTone} wordStyle={presentation.headerBillboardWordStyle ?? 'outline'} />
      </div>

      {trailing ? <div className="mt-8">{trailing}</div> : null}
    </div>
  );
}
