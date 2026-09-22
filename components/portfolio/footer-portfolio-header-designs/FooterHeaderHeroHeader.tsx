'use client';

import { useMemo, type ReactNode } from 'react';
import {
  DEFAULT_FOOTER_PRESENTATION,
  type PortfolioFooterPresentationSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import {
  FOOTER_HEADER_MARGIN_BOTTOM_REM,
  footerHeaderPaletteTokenColor,
} from '@/components/portfolio/portfolio-footer-header-settings';

const DEFAULT_TITLE_TEXT = "Let's build a space\nthat feels alive.";
const DEFAULT_CTA_LABEL = 'Get in touch';

/**
 * Hero — a Footer-local 9th design (beyond the shared canonical 8), modeled on the
 * "Hero columns" Footer design's own top block: a centered, ultra-tight monumental
 * headline (line-height 0.95, up to a few explicit lines via `\n`) with a pill "Get in
 * touch" CTA underneath. The button bg reuses the title's palette token and its text
 * uses the global `fond` (background) token — the same "ink bg / bg text" swap Hero
 * columns itself uses, so it always reads correctly in both light and dark.
 */
export function FooterHeaderHeroHeader({
  presentation: presentationProp,
  trailing,
  ctaHref,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioFooterPresentationSettings;
  trailing?: ReactNode;
  ctaHref?: string;
}) {
  const presentation = presentationProp ?? DEFAULT_FOOTER_PRESENTATION;
  const titleText = (presentation.headerHeroTitleText || DEFAULT_TITLE_TEXT).trim() || DEFAULT_TITLE_TEXT;
  const ctaLabel = (presentation.headerHeroCtaLabel || DEFAULT_CTA_LABEL).trim();
  const ink = footerHeaderPaletteTokenColor(presentation.headerHeroTitleColor ?? 'texteFort');

  const lines = useMemo(() => titleText.split('\n').filter((line) => line.trim().length > 0), [titleText]);

  return (
    <header
      className="pf-footer-header-hero-header relative w-full text-center"
      style={{ marginBottom: `${FOOTER_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
      data-footer-header="hero"
    >
      <div className="pf-footer-header-hero-stage flex flex-col items-center">
        <h2
          className="m-0 max-w-[46rem] select-none font-sans font-black tracking-tighter"
          style={{ color: ink, fontSize: 'clamp(2.5rem, 9vw, 7.5rem)', lineHeight: 0.95 }}
        >
          {lines.map((line, index) => (
            <span key={`${line}-${index}`} className="block overflow-hidden">
              <span className="pf-footer-header-hero-line block">{line}</span>
            </span>
          ))}
        </h2>

        {ctaLabel ? (
          <a
            href={ctaHref || '#footer'}
            data-pf-no-color-transition=""
            className="pf-footer-header-hero-cta mt-10 inline-flex min-h-[44px] items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] transition hover:opacity-85"
            style={{ backgroundColor: ink, color: 'var(--pf-palette-fond, #ffffff)' }}
          >
            <span>{ctaLabel}</span>
            <span aria-hidden>→</span>
          </a>
        ) : null}

        {trailing ? <div className="mt-6">{trailing}</div> : null}
      </div>
    </header>
  );
}
