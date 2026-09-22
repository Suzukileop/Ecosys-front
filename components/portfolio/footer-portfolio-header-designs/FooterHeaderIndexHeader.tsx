'use client';

import type { ReactNode } from 'react';
import { DEFAULT_FOOTER_PRESENTATION, type PortfolioFooterPresentationSettings } from '@/components/portfolio/portfolio-footer-settings';
import {
  FOOTER_HEADER_MARGIN_BOTTOM_REM,
  footerHeaderPaletteTokenColor,
  type PortfolioFooterHeaderTitleSize,
  type PortfolioFooterHeaderTitleWeight,
} from '@/components/portfolio/portfolio-footer-header-settings';

const DEFAULT_LABEL_TEXT = 'Contact';
const DEFAULT_TITLE_TEXT = "Let's talk";
const DEFAULT_SUBTITLE_TEXT = 'Reach out — I read every message.';
const LABEL_SIZE: Record<PortfolioFooterHeaderTitleSize, string> = {
  sm: '0.6rem',
  md: '0.68rem',
  lg: '0.76rem',
  xl: '0.85rem',
};
const LABEL_WEIGHT: Record<PortfolioFooterHeaderTitleWeight, number> = {
  light: 400,
  regular: 600,
  semibold: 700,
  bold: 800,
};
const TITLE_SIZE: Record<PortfolioFooterHeaderTitleSize, string> = {
  sm: 'clamp(1.9rem, 4.4vw, 3.1rem)',
  md: 'clamp(2.3rem, 5.3vw, 3.85rem)',
  lg: 'clamp(2.75rem, 6.2vw, 4.6rem)',
  xl: 'clamp(3.2rem, 7.1vw, 5.4rem)',
};
const TITLE_WEIGHT: Record<PortfolioFooterHeaderTitleWeight, number> = {
  light: 300,
  regular: 300,
  semibold: 500,
  bold: 650,
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

/**
 * Index — a ledger-style divider rule up top, the creator's contact-links
 * count on the left, split from the title by a vertical rule.
 */
export function FooterHeaderIndexHeader({
  presentation: presentationProp,
  trailing,
  itemCount,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioFooterPresentationSettings;
  trailing?: ReactNode;
  itemCount?: number;
}) {
  const presentation = presentationProp ?? DEFAULT_FOOTER_PRESENTATION;
  const title = (presentation.headerIndexTitleText || DEFAULT_TITLE_TEXT).trim();
  const subtitle = (presentation.headerIndexSubtitleText || DEFAULT_SUBTITLE_TEXT).trim();
  const label = (presentation.headerIndexLabelText || DEFAULT_LABEL_TEXT).trim();
  const count = Math.max(0, itemCount ?? 0);
  const countLabelCustom = presentation.headerIndexCountLabelText?.trim();
  const countLabel = countLabelCustom || (count === 1 ? 'Link' : 'Links');

  const labelTone = footerHeaderPaletteTokenColor(presentation.headerIndexLabelColor ?? 'texteFort');
  const numberTone = footerHeaderPaletteTokenColor(presentation.headerIndexNumberColor ?? 'principal');
  const titleTone = footerHeaderPaletteTokenColor(presentation.headerIndexTitleColor ?? 'texteFort');
  const subtitleTone = footerHeaderPaletteTokenColor(presentation.headerIndexSubtitleColor ?? 'texteFort');
  const labelMuted = `color-mix(in srgb, ${labelTone} 55%, transparent)`;
  const ruleTone = `color-mix(in srgb, ${titleTone} 16%, transparent)`;
  const ruleToneSoft = `color-mix(in srgb, ${titleTone} 12%, transparent)`;

  const labelFontSize = LABEL_SIZE[presentation.headerIndexLabelSize ?? 'md'];
  const labelFontWeight = LABEL_WEIGHT[presentation.headerIndexLabelWeight ?? 'regular'];
  const titleFontSize = TITLE_SIZE[presentation.headerIndexTitleSize ?? 'md'];
  const titleFontWeight = TITLE_WEIGHT[presentation.headerIndexTitleWeight ?? 'regular'];
  const subtitleFontSize = SUBTITLE_SIZE[presentation.headerIndexSubtitleSize ?? 'md'];
  const subtitleFontWeight = SUBTITLE_WEIGHT[presentation.headerIndexSubtitleWeight ?? 'regular'];

  return (
    <header
      className="pf-footer-header-index-header relative w-full text-left"
      style={{ marginBottom: `${FOOTER_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
      data-footer-header="index"
    >
      <div className="mb-6 flex items-center gap-4 sm:mb-8">
        <span
          className="shrink-0 uppercase leading-none tracking-[0.28em]"
          style={{ color: labelMuted, fontSize: labelFontSize, fontWeight: labelFontWeight }}
        >
          {label}
        </span>
        <span className="h-px flex-1 origin-left" style={{ backgroundColor: ruleTone }} aria-hidden />
      </div>

      <div className="flex items-stretch gap-6 sm:gap-10">
        <div className="flex shrink-0 flex-col items-start">
          <span
            className="text-6xl font-light leading-none tracking-[-0.03em] sm:text-7xl lg:text-8xl"
            style={{ color: numberTone }}
          >
            {String(count).padStart(2, '0')}
          </span>
          <span
            className="mt-2 text-[0.68rem] font-medium uppercase tracking-[0.16em]"
            style={{ color: labelMuted }}
          >
            {countLabel}
          </span>
        </div>

        <span className="w-px origin-top self-stretch" style={{ backgroundColor: ruleToneSoft }} aria-hidden />

        <div className="min-w-0 flex-1 pt-1">
          <h2
            className="mb-0 leading-[1.05]"
            style={{ color: titleTone, fontSize: titleFontSize, fontWeight: titleFontWeight }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              className="mb-0 mt-3 max-w-md leading-relaxed"
              style={{ color: subtitleTone, fontSize: subtitleFontSize, fontWeight: subtitleFontWeight }}
            >
              {subtitle}
            </p>
          ) : null}
          {trailing ? <div className="mt-4">{trailing}</div> : null}
        </div>
      </div>
    </header>
  );
}
