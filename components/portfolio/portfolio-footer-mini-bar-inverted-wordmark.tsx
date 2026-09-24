'use client';

import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterX,
} from '@/components/portfolio/portfolio-editorial-layout';
import {
  footerMiniBarCopyrightBase,
  prefersReducedMotion,
  type FooterMiniBarVariantProps,
} from '@/components/portfolio/portfolio-footer-mini-bar-shared';

const DEFAULT_CREDIT = 'Designed & built with care.';

/**
 * "Inverted wordmark" — extracted verbatim from the "Inverted wordmark" Footer design's
 * own hardcoded sub-footer bar (see footer-minibar-catalog-extraction memory): copyright
 * on the left, a centered credit line, and a "Back to top ↑" control on the right. Used to
 * carry its own solid, OPPOSITE-contrast fill (a black bar on a light page, a white bar on
 * a dark page) — now transparent by default like every other Mini bar variant (the Footer
 * section's own Background tab drives any fill), so ink instead follows the page's own
 * `colorMode` directly rather than assuming an opposite fill that may no longer be there.
 */
export function FooterMiniBarInvertedWordmark({
  creatorName,
  colorMode,
  copyrightText,
  creditLabel,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
}: FooterMiniBarVariantProps) {
  const isLight = colorMode === 'light';
  const barInk = isLight ? 'rgba(10,10,10,0.85)' : 'rgba(250,250,247,0.85)';
  const barInkStrong = isLight ? '#0a0a0a' : '#fafaf7';

  const text = copyrightText?.trim() || footerMiniBarCopyrightBase(creatorName);
  const credit = creditLabel?.trim() || DEFAULT_CREDIT;

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <div
      data-pf-mini-footer-bar="inverted-wordmark"
      data-pf-no-color-transition=""
      className={`relative flex w-full flex-col items-center gap-2 py-3.5 sm:flex-row sm:justify-between sm:gap-4 ${portfolioEditorialGutterX(contentGutter)}`}
      style={backgroundStyle}
    >
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em]" style={{ color: barInk }}>
        {text}
      </p>
      <p
        className="text-[0.65rem] font-medium uppercase tracking-[0.14em] sm:absolute sm:left-1/2 sm:-translate-x-1/2"
        style={{ color: barInk }}
      >
        {credit}
      </p>
      <button
        type="button"
        onClick={handleBackToTop}
        data-pf-no-color-transition=""
        className="w-fit text-[0.65rem] font-semibold uppercase tracking-[0.14em] opacity-85 transition-opacity duration-500 ease-out hover:opacity-100"
        style={{ color: barInkStrong }}
      >
        Back to top ↑
      </button>
    </div>
  );
}

/** Tiny abstract wireframe for the settings-panel design picker thumbnail. */
export function FooterMiniBarInvertedWordmarkWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      <rect className="pf-stack-mini-mute" x="8" y="14" width="38" height="4" rx="2" opacity={0.7} />
      <rect className="pf-stack-mini-mute" x="8" y="24" width="26" height="4" rx="2" />
      <rect className="pf-stack-mini-accent" x="1.25" y="47" width="117.5" height="23.5" />
    </svg>
  );
}
