'use client';

import type { ReactNode } from 'react';
import { DEFAULT_FOOTER_PRESENTATION, type PortfolioFooterPresentationSettings } from '@/components/portfolio/portfolio-footer-settings';
import {
  FOOTER_HEADER_MARGIN_BOTTOM_REM,
  footerHeaderPaletteTokenColor,
  type PortfolioFooterHeaderTitleSize,
  type PortfolioFooterHeaderTitleWeight,
} from '@/components/portfolio/portfolio-footer-header-settings';

const LABEL_SIZE: Record<PortfolioFooterHeaderTitleSize, string> = {
  sm: '0.6875rem',
  md: '0.75rem',
  lg: '0.85rem',
  xl: '0.95rem',
};
const LABEL_WEIGHT: Record<PortfolioFooterHeaderTitleWeight, number> = {
  light: 300,
  regular: 350,
  semibold: 500,
  bold: 650,
};
const TITLE_SIZE: Record<PortfolioFooterHeaderTitleSize, string> = {
  sm: 'clamp(1.8rem, 3.9vw, 2.65rem)',
  md: 'clamp(2.15rem, 4.8vw, 3.35rem)',
  lg: 'clamp(2.6rem, 5.7vw, 4.05rem)',
  xl: 'clamp(3.1rem, 6.6vw, 4.85rem)',
};
const TITLE_WEIGHT: Record<PortfolioFooterHeaderTitleWeight, number> = {
  light: 400,
  regular: 500,
  semibold: 600,
  bold: 700,
};
const SUBTITLE_SIZE: Record<PortfolioFooterHeaderTitleSize, string> = {
  sm: '0.8125rem',
  md: '0.9375rem',
  lg: '1.0625rem',
  xl: '1.1875rem',
};
const SUBTITLE_WEIGHT: Record<PortfolioFooterHeaderTitleWeight, number> = {
  light: 350,
  regular: 400,
  semibold: 500,
  bold: 600,
};

const DEFAULT_LABEL_TEXT = 'Contact';
const DEFAULT_TITLE_TEXT = 'A few ways to start a conversation and say hello.';

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
 * Serif lead — a small uppercase label above a large serif title split
 * across up to two balanced lines, each masked and revealed with a stagger.
 * On scroll: the label drifts up while the title block slides and fades away.
 */
export function FooterHeaderSerifLeadHeader({
  subtitle,
  presentation: presentationProp,
  trailing,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioFooterPresentationSettings;
  trailing?: ReactNode;
}) {
  const presentation = presentationProp ?? DEFAULT_FOOTER_PRESENTATION;
  const align = presentation.headerDesignAlignment ?? 'left';
  const centered = align === 'center';
  const alignRight = align === 'right';
  const title = (presentation.headerSerifLeadTitleText || DEFAULT_TITLE_TEXT).trim();
  const label = (presentation.headerSerifLeadLabelText || DEFAULT_LABEL_TEXT).trim();
  const lines = splitSerifLeadLines(title);

  const labelTone = footerHeaderPaletteTokenColor(presentation.headerSerifLeadLabelColor ?? 'texteFort');
  const titleTone = footerHeaderPaletteTokenColor(presentation.headerSerifLeadTitleColor ?? 'texteFort');
  const subtitleTone = footerHeaderPaletteTokenColor(presentation.headerSerifLeadSubtitleColor ?? 'texteFort');
  const labelFontSize = LABEL_SIZE[presentation.headerSerifLeadLabelSize ?? 'md'];
  const labelFontWeight = LABEL_WEIGHT[presentation.headerSerifLeadLabelWeight ?? 'regular'];
  const titleFontSize = TITLE_SIZE[presentation.headerSerifLeadTitleSize ?? 'md'];
  const titleFontWeight = TITLE_WEIGHT[presentation.headerSerifLeadTitleWeight ?? 'regular'];
  const subtitleFontSize = SUBTITLE_SIZE[presentation.headerSerifLeadSubtitleSize ?? 'md'];
  const subtitleFontWeight = SUBTITLE_WEIGHT[presentation.headerSerifLeadSubtitleWeight ?? 'regular'];

  const textAlignClass = centered ? 'text-center' : alignRight ? 'text-right' : 'text-left';
  const itemsAlignClass = centered ? 'items-center' : alignRight ? 'items-end' : 'items-start';
  const leadMarginLeft = centered || alignRight ? 'auto' : 0;
  const leadMarginRight = centered || !alignRight ? 'auto' : 0;

  return (
    <header
      className={`relative w-full ${textAlignClass}`}
      style={{ marginBottom: `${FOOTER_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
      data-footer-header="serif-lead"
    >
      <div className={`flex flex-col gap-3 ${itemsAlignClass}`}>
        <div className="min-w-0">
          <p
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
                  <span className="block" style={{ paddingBottom: '0.04em' }}>
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
