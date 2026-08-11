'use client';

import type { CSSProperties, ReactNode } from 'react';
import {
  servicesCardSplitBackgroundLayerStyle,
  shouldRenderCardSplitBackground,
  type PortfolioServicesCardBackgroundSettings,
} from '@/components/portfolio/portfolio-services-card-background-settings';
import {
  servicesCardDecorShellStyle,
  shouldShowServicesCardDecor,
  type PortfolioServicesCardDecorSettings,
} from '@/components/portfolio/portfolio-services-card-decor-settings';

type ServicesCardLayerSettings = PortfolioServicesCardBackgroundSettings &
  Partial<PortfolioServicesCardDecorSettings> & {
    /** Services designs only; other sections may pass unrelated design ids. */
    cardDesign?: string;
  };

export function ServicesCardBackgroundLayers({
  presentation,
  cardIndex = 0,
}: {
  presentation: ServicesCardLayerSettings;
  /** Gallery index — used for decor alternation sequences. */
  cardIndex?: number;
}) {
  const designOwnsBackground =
    presentation.cardDesign === 'compact' || presentation.cardDesign === 'glass';
  const split = shouldRenderCardSplitBackground(presentation) && !designOwnsBackground;
  const showDecor = shouldShowServicesCardDecor(
    {
      cardDecorEnabled: Boolean(presentation.cardDecorEnabled),
      cardDecorAlternation: presentation.cardDecorAlternation ?? 'none',
    },
    cardIndex
  );

  if (!split && !showDecor) {
    return null;
  }

  const layerStyle = split ? servicesCardSplitBackgroundLayerStyle(presentation) : null;
  const decorSettings: PortfolioServicesCardDecorSettings | null = showDecor
    ? {
        cardDecorEnabled: true,
        cardDecorShape: presentation.cardDecorShape ?? 'circle',
        cardDecorColor: presentation.cardDecorColor ?? '#e5e5e5',
        cardDecorOpacity: presentation.cardDecorOpacity ?? 55,
        cardDecorSize: presentation.cardDecorSize ?? 42,
        cardDecorX: presentation.cardDecorX ?? 92,
        cardDecorY: presentation.cardDecorY ?? 8,
        cardDecorRotation: presentation.cardDecorRotation ?? 0,
        cardDecorAlternation: presentation.cardDecorAlternation ?? 'none',
      }
    : null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{ borderRadius: 'inherit' }}
      aria-hidden
    >
      {layerStyle ? <div className="absolute inset-0" style={layerStyle} /> : null}
      {decorSettings ? (
        <div className="pf-services-card-decor" style={servicesCardDecorShellStyle(decorSettings)} />
      ) : null}
    </div>
  );
}

export function ServicesCardForeground({
  className = '',
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className={`relative z-[1] w-full min-w-0 ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
