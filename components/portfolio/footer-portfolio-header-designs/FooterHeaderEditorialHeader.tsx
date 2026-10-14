'use client';

import type { ReactNode } from 'react';
import {
  DEFAULT_FOOTER_PRESENTATION,
  type PortfolioFooterPresentationSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import {
  FOOTER_HEADER_MARGIN_BOTTOM_REM,
  FOOTER_HEADER_PADDING_REM,
  footerHeaderPaletteTokenColor,
  type PortfolioFooterHeaderTitleSize,
  type PortfolioFooterHeaderTitleWeight,
} from '@/components/portfolio/portfolio-footer-header-settings';
import { headerElementVisibility } from '@/components/portfolio/portfolio-header-elements';

const DEFAULT_TITLE_TEXT = "Let's work together.";

const TITLE_SIZE_CLASS: Record<PortfolioFooterHeaderTitleSize, string> = {
  sm: 'text-4xl sm:text-5xl lg:text-6xl',
  md: 'text-5xl sm:text-6xl lg:text-7xl',
  lg: 'text-6xl sm:text-7xl lg:text-8xl',
  xl: 'text-7xl sm:text-8xl lg:text-9xl',
};

/** A genuinely heavy display scale — the reference brief is a monumental, black-weight
 *  uppercase headline, not Team/Work's lighter editorial default. */
// Bold stays black — the monumental default — and the lighter options now mean what they say
// (Light used to render at 400, Regular at 600).
const TITLE_WEIGHT_CLASS: Record<PortfolioFooterHeaderTitleWeight, string> = {
  light: '!font-light',
  regular: '!font-normal',
  semibold: '!font-semibold',
  bold: '!font-black',
};

/**
 * Editorial — a monumental uppercase headline, no kicker. Styled to match the
 * "LET'S WORK TOGETHER." reference brief: black-weight, tight tracking,
 * left-aligned by default.
 */
export function FooterHeaderEditorialHeader({
  presentation: presentationProp,
  trailing,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioFooterPresentationSettings;
  trailing?: ReactNode;
}) {
  const presentation = presentationProp ?? DEFAULT_FOOTER_PRESENTATION;
  const show = headerElementVisibility(presentation.headerHiddenElements, 'footer-editorial');
  const align = presentation.headerDesignAlignment ?? 'left';
  const titleText = (presentation.headerEditorialTitleText || DEFAULT_TITLE_TEXT).trim();
  const subtitleText = (presentation.headerEditorialSubtitleText || '').trim();
  const titleInk = footerHeaderPaletteTokenColor(presentation.headerEditorialTitleColor ?? 'texteFort');

  return (
    <header
      className={`pf-footer-header-editorial-header relative w-full ${
        align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
      }`}
      style={{
        marginBottom: `${FOOTER_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem`,
        paddingTop: `${FOOTER_HEADER_PADDING_REM[presentation.headerPaddingTop ?? 'none']}rem`,
        paddingBottom: `${FOOTER_HEADER_PADDING_REM[presentation.headerPaddingBottom ?? 'none']}rem`,
      }}
      data-footer-header="editorial"
    >
      <div
        className={`pf-footer-header-editorial-stage flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between ${
          align === 'center' ? 'items-center sm:flex-col' : align === 'right' ? 'items-end sm:flex-row-reverse' : ''
        }`}
      >
        <div className="min-w-0 max-w-4xl">
          {show('title') ? (
            <h2
              className={`mb-0 ${TITLE_SIZE_CLASS[presentation.headerTitleSize ?? 'xl']} ${TITLE_WEIGHT_CLASS[presentation.headerTitleWeight ?? 'bold']} uppercase tracking-[-0.02em] lg:leading-[0.92]`}
              style={{ color: titleInk }}
            >
              <span className="pf-footer-header-editorial-title-mask block overflow-hidden">
                <span className="pf-footer-header-editorial-title-line block">{titleText}</span>
              </span>
            </h2>
          ) : null}
          {show('subtitle') && subtitleText ? (
            <p
              className={`pf-footer-header-editorial-sub mb-0 mt-6 max-w-xl text-sm leading-relaxed sm:text-base ${
                align === 'center' ? 'mx-auto' : align === 'right' ? 'ms-auto' : ''
              }`}
              style={{ color: `color-mix(in srgb, ${titleInk} 60%, transparent)` }}
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
