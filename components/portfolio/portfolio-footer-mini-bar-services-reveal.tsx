'use client';

import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterX,
} from '@/components/portfolio/portfolio-editorial-layout';
import {
  footerMiniBarCopyrightBase,
  type FooterMiniBarVariantProps,
} from '@/components/portfolio/portfolio-footer-mini-bar-shared';

/**
 * "Services reveal" — extracted verbatim from the "Services grid reveal" Footer design's
 * own hardcoded closing line (see footer-minibar-catalog-extraction memory): a single
 * centered copyright line above a thin top hairline, in that design's own felted resting
 * tone. Visually close to the "Contact CTA" bar (same simple shape), kept as its own
 * catalog entry since it's a faithful 1:1 extraction of a distinct design's own bar.
 */
export function FooterMiniBarServicesReveal({
  creatorName,
  colorMode,
  copyrightText,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
}: FooterMiniBarVariantProps) {
  const isLight = colorMode === 'light';
  const navRest = isLight ? 'rgba(10,10,10,0.55)' : 'rgba(250,250,247,0.55)';
  const hairline = isLight ? 'rgba(10,10,10,0.08)' : 'rgba(250,250,247,0.1)';

  const text = copyrightText?.trim() || footerMiniBarCopyrightBase(creatorName);
  if (!text) return null;

  return (
    <div
      data-pf-mini-footer-bar="services-reveal"
      data-pf-no-color-transition=""
      className={`w-full border-t py-6 text-center text-xs font-medium tracking-wide ${portfolioEditorialGutterX(contentGutter)}`}
      style={{ ...backgroundStyle, borderColor: hairline, color: navRest }}
    >
      {text}
    </div>
  );
}

/** Tiny abstract wireframe for the settings-panel design picker thumbnail. */
export function FooterMiniBarServicesRevealWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      <line x1="6" y1="40" x2="114" y2="40" className="pf-stack-mini-mute" strokeWidth={1} />
      <rect className="pf-stack-mini-mute" x="46" y="50" width="28" height="3" rx="1.5" opacity={0.6} />
    </svg>
  );
}
