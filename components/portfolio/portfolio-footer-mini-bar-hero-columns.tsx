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
 * "Hero columns" — extracted verbatim from the "Hero columns" Footer design's own
 * hardcoded "compact sub-footer bar" (see footer-minibar-catalog-extraction memory):
 * copyright on the left, an availability status ("WE ARE OPEN" / "WE ARE CLOSED") plus
 * hours on the right, both in a muted uppercase caption tone, on a thin top hairline.
 * Stacks centered below 640px, sits as a single row above it.
 */
export function FooterMiniBarHeroColumns({
  creatorName,
  colorMode,
  copyrightText,
  isAvailable,
  hoursLabel,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
}: FooterMiniBarVariantProps) {
  const isLight = colorMode === 'light';
  const muted = isLight ? '#8f8f8f' : '#7d7d7d';
  const hairline = isLight ? 'rgba(10,10,10,0.08)' : 'rgba(255,255,255,0.1)';

  const text = copyrightText?.trim() || footerMiniBarCopyrightBase(creatorName);
  const statusLabel = typeof isAvailable === 'boolean' ? (isAvailable ? 'WE ARE OPEN' : 'WE ARE CLOSED') : null;
  const trimmedHours = hoursLabel?.trim() || null;
  const rightLabel = [statusLabel, trimmedHours].filter(Boolean).join(' · ') || null;

  if (!text && !rightLabel) return null;

  return (
    <div
      data-pf-mini-footer-bar="hero-columns"
      data-pf-no-color-transition=""
      className={`flex w-full flex-col items-center gap-3 border-t py-6 text-center sm:flex-row sm:justify-between sm:text-left ${portfolioEditorialGutterX(contentGutter)}`}
      style={{ ...backgroundStyle, borderColor: hairline }}
    >
      {text ? (
        <p className="m-0 text-xs font-medium tracking-wide" style={{ color: muted }}>
          {text}
        </p>
      ) : (
        <span aria-hidden />
      )}
      {rightLabel ? (
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: muted }}>
          {rightLabel}
        </p>
      ) : null}
    </div>
  );
}

/** Tiny abstract wireframe for the settings-panel design picker thumbnail. */
export function FooterMiniBarHeroColumnsWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      <line x1="6" y1="40" x2="114" y2="40" className="pf-stack-mini-mute" strokeWidth={1} />
      <rect className="pf-stack-mini-mute" x="8" y="50" width="28" height="3" rx="1.5" opacity={0.5} />
      <rect className="pf-stack-mini-mute" x="82" y="50" width="30" height="3" rx="1.5" opacity={0.7} />
    </svg>
  );
}
