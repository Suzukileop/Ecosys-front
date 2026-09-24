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
 * "Contact CTA" — extracted verbatim from the "Contact CTA" Footer design's (`minimal`)
 * own hardcoded closing line (see footer-minibar-catalog-extraction memory): a single
 * centered copyright line above a thin top hairline — same quiet, single-line shape as
 * the "Landing" bar, just centered instead of left-aligned to match that design's own
 * centered composition.
 */
export function FooterMiniBarContactCta({
  creatorName,
  colorMode,
  copyrightText,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
}: FooterMiniBarVariantProps) {
  const isLight = colorMode === 'light';
  const ink = isLight ? '#000000' : '#ffffff';
  const hairline = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.14)';

  const text = copyrightText?.trim() || footerMiniBarCopyrightBase(creatorName);
  if (!text) return null;

  return (
    <div
      data-pf-mini-footer-bar="contact-cta"
      data-pf-no-color-transition=""
      className={`w-full border-t ${portfolioEditorialGutterX(contentGutter)}`}
      style={{ ...backgroundStyle, borderColor: hairline }}
    >
      <div className="mx-auto w-full max-w-none py-5">
        <p className="text-center text-xs font-normal tracking-wide" style={{ opacity: 0.6, color: ink }}>
          {text}
        </p>
      </div>
    </div>
  );
}

/** Tiny abstract wireframe for the settings-panel design picker thumbnail. */
export function FooterMiniBarContactCtaWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      <line x1="6" y1="40" x2="114" y2="40" className="pf-stack-mini-mute" strokeWidth={1} />
      <rect className="pf-stack-mini-mute" x="44" y="50" width="32" height="3" rx="1.5" opacity={0.5} />
    </svg>
  );
}
