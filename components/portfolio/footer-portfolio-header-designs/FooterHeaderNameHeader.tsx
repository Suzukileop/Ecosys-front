'use client';

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import {
  DEFAULT_FOOTER_PRESENTATION,
  type PortfolioFooterPresentationSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import {
  FOOTER_HEADER_MARGIN_BOTTOM_REM,
  FOOTER_HEADER_PADDING_REM,
  footerHeaderPaletteTokenColor,
} from '@/components/portfolio/portfolio-footer-header-settings';

const REFERENCE_PX = 100;

/**
 * Sizes `textRef`'s font so its rendered box exactly fills `containerRef`'s width —
 * on mount, on any container-width change, and once web fonts finish loading. Same
 * technique the Billboard design uses, and the one "Editorial grid" Footer design's
 * own monumental name block uses — a fit-to-width name can never bleed past the
 * section's own margin regardless of how long the creator's name is, unlike a
 * vw-based clamp.
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

/**
 * Name — a Footer-local 10th design (beyond the canonical 8 + Hero), modeled on the
 * "Editorial grid" Footer design's own top block: nothing but the creator's full name,
 * fit-to-width, edge-to-edge, no kicker/subtitle/CTA. No dedicated text field — it
 * always reflects the real `title` prop (the creator's name), same as the source design.
 */
export function FooterHeaderNameHeader({
  title,
  presentation: presentationProp,
  trailing,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioFooterPresentationSettings;
  trailing?: ReactNode;
}) {
  const presentation = presentationProp ?? DEFAULT_FOOTER_PRESENTATION;
  const centered = presentation.headerDesignAlignment === 'center';
  const name = title.trim() || 'Your name';
  const ink = footerHeaderPaletteTokenColor(presentation.headerNameColor ?? 'texteFort');

  const nameContainerRef = useRef<HTMLDivElement>(null);
  const nameTextRef = useRef<HTMLSpanElement>(null);
  useFitWidthTextSize(nameContainerRef, nameTextRef, name);

  const nameStyle: CSSProperties = { fontSize: 'clamp(2.75rem, 13vw, 12.5rem)' };

  return (
    <header
      className={`pf-footer-header-name-header relative w-full ${centered ? 'text-center' : 'text-left'}`}
      style={{
        marginBottom: `${FOOTER_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem`,
        paddingTop: `${FOOTER_HEADER_PADDING_REM[presentation.headerPaddingTop ?? 'none']}rem`,
        paddingBottom: `${FOOTER_HEADER_PADDING_REM[presentation.headerPaddingBottom ?? 'none']}rem`,
      }}
      data-footer-header="name"
    >
      <div className="pf-footer-header-name-stage relative">
        <div ref={nameContainerRef} className="relative w-full overflow-hidden">
          <h2
            className="select-none whitespace-nowrap font-serif font-semibold uppercase leading-[0.82] tracking-tight"
            style={{ color: ink }}
          >
            <span ref={nameTextRef} className="pf-footer-header-name-line inline-block" style={nameStyle}>
              {name}
            </span>
          </h2>
        </div>
      </div>
      {trailing ? <div className="mt-6">{trailing}</div> : null}
    </header>
  );
}
