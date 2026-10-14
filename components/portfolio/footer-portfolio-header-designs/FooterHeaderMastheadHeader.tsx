'use client';

import { Fragment, useMemo, type ReactNode } from 'react';
import { DEFAULT_FOOTER_PRESENTATION, type PortfolioFooterPresentationSettings } from '@/components/portfolio/portfolio-footer-settings';
import {
  FOOTER_HEADER_MARGIN_BOTTOM_REM,
  FOOTER_HEADER_PADDING_REM,
  footerHeaderPaletteTokenColor,
  type PortfolioFooterHeaderTitleSize,
  type PortfolioFooterHeaderTitleWeight,
} from '@/components/portfolio/portfolio-footer-header-settings';

const DEFAULT_LINE_1 = 'Always open.';
const DEFAULT_LINE_2 = 'Quick to reply.';
const DEFAULT_LINE_3 = 'Easy to reach.';

const HEADLINE_SIZE_CLASS: Record<PortfolioFooterHeaderTitleSize, string> = {
  sm: 'text-[clamp(1.7rem,4.8vw,3.4rem)]',
  md: 'text-[clamp(2.2rem,6vw,4.2rem)]',
  lg: 'text-[clamp(2.7rem,7.2vw,5.1rem)]',
  xl: 'text-[clamp(3.2rem,8.4vw,6.1rem)]',
};

const HEADLINE_WEIGHT: Record<PortfolioFooterHeaderTitleWeight, { light: number; heavy: number }> = {
  light: { light: 300, heavy: 700 },
  regular: { light: 300, heavy: 900 },
  semibold: { light: 400, heavy: 900 },
  bold: { light: 500, heavy: 900 },
};

/**
 * Masthead — up to three independent lines stack into the mast (first word
 * of every line light, the rest bold).
 */
export function FooterHeaderMastheadHeader({
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
  const ink = footerHeaderPaletteTokenColor(presentation.headerMastheadHeadlineColor ?? 'principal');
  const headlineWeight = HEADLINE_WEIGHT[presentation.headerMastheadHeadlineWeight ?? 'regular'];

  const lines = useMemo(
    () => {
      const hidden = new Set(presentation.headerHiddenElements);
      return [
        hidden.has('footer-masthead.line1') ? '' : presentation.headerMastheadLine1Text || DEFAULT_LINE_1,
        hidden.has('footer-masthead.line2') ? '' : presentation.headerMastheadLine2Text || DEFAULT_LINE_2,
        hidden.has('footer-masthead.line3') ? '' : presentation.headerMastheadLine3Text || DEFAULT_LINE_3,
      ]
        .map((line) => line.trim())
        .filter(Boolean);
    },
    [
      presentation.headerMastheadLine1Text,
      presentation.headerMastheadLine2Text,
      presentation.headerMastheadLine3Text,
      presentation.headerHiddenElements,
    ]
  );

  const styledLines = useMemo(
    () =>
      lines.map((line) => {
        const words = line.replace(/\.$/, '').split(/\s+/).filter(Boolean);
        return words.map((word, idx) => ({
          text: word,
          isLight: idx === 0,
          hasPeriod: idx === words.length - 1,
        }));
      }),
    [lines]
  );
  return (
    <header
      className="w-full"
      style={{
        marginBottom: `${FOOTER_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem`,
        paddingTop: `${FOOTER_HEADER_PADDING_REM[presentation.headerPaddingTop ?? 'none']}rem`,
        paddingBottom: `${FOOTER_HEADER_PADDING_REM[presentation.headerPaddingBottom ?? 'none']}rem`,
      }}
      data-footer-header="masthead"
    >
      {styledLines.length > 0 ? (
        <div
          className={`flex flex-col gap-1 sm:gap-2 ${
            align === 'center' ? 'items-center' : align === 'right' ? 'items-end' : 'items-start'
          }`}
        >
          {styledLines.map((words, lineIndex) => (
            <div key={lineIndex} className="overflow-hidden">
              <h2
                className={`${HEADLINE_SIZE_CLASS[presentation.headerMastheadHeadlineSize ?? 'md']} uppercase leading-[1.08] tracking-[-0.02em] ${
                  align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
                }`}
                style={{ color: ink }}
              >
                {words.map((word, wordIndex) => (
                  <Fragment key={wordIndex}>
                    {wordIndex > 0 ? ' ' : null}
                    <span
                      className="inline-block"
                      style={{ fontWeight: word.isLight ? headlineWeight.light : headlineWeight.heavy }}
                    >
                      {word.text.toUpperCase()}
                      {word.hasPeriod ? <span style={{ fontWeight: headlineWeight.heavy }}>.</span> : null}
                    </span>
                  </Fragment>
                ))}
              </h2>
            </div>
          ))}
        </div>
      ) : null}

      {trailing ? <div className="mt-6">{trailing}</div> : null}
    </header>
  );
}
