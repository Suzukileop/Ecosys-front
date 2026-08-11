'use client';

import {
  leftMotifContainerStyle,
  leftMotifInnerStyle,
  shouldRenderLeftMotif,
  type PortfolioHeroLeftMotifSettings,
} from '@/components/portfolio/portfolio-hero-left-motif-settings';

export function PortfolioHeroLeftMotif({ settings }: { settings: PortfolioHeroLeftMotifSettings }) {
  if (!shouldRenderLeftMotif(settings)) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-0 hidden overflow-visible xl:block"
      style={leftMotifContainerStyle(settings)}
    >
      <div className="absolute inset-0" style={leftMotifInnerStyle(settings)} />
    </div>
  );
}
