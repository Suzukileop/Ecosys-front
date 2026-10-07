'use client';

import { useMemo, type MouseEvent as ReactMouseEvent } from 'react';
import {
  handleServicesOrderCtaClick,
  useServicesOrderCtaNav,
} from '@/components/portfolio/portfolio-section-primitives';
import {
  normalizePricingCtaUrl,
  pricingBorderColor,
  pricingBorderWidthPx,
  pricingCardRadiusPx,
  pricingCtaRadius,
  readServicesPricingStyle,
  type PortfolioServicesPricingStyleSettings,
} from '@/components/portfolio/portfolio-services-pricing-style';
import type { PortfolioServicesPresentationSettings } from '@/components/portfolio/portfolio-services-settings';

export type ServicesPricingAnchorProps = {
  href: string;
  target?: '_blank';
  rel?: string;
  onClick: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
};

export type ServicesPricingStyle = {
  style: PortfolioServicesPricingStyleSettings;
  /** Card corner radius in px; `null` keeps the design's own radius. */
  cardRadiusPx: number | null;
  /** Card border width in px; `null` keeps the design's own width. */
  borderWidthPx: number | null;
  /** Card border color; `null` keeps the design's own color. */
  borderColor: string | null;
  /** Order-button border-radius; `null` keeps the design's own shape. */
  ctaRadius: string | null;
  /** Spread onto every order-button `<a>`: href, click handling and new-tab behaviour. */
  anchorProps: ServicesPricingAnchorProps;
  /** Plain href + navigate callback, for components that build their own `<a>`. */
  href: string;
  onNavigate?: (href: string) => void;
};

/**
 * Everything a Services pricing design needs from the shared "card style" settings: resolved
 * corner / border values (each `null` when the creator left it on Default) and the order
 * button's destination. The destination falls back to the Contact route the page already
 * resolved (`useServicesOrderCtaNav`), so a design with nothing configured behaves as before.
 */
export function useServicesPricingStyle(
  presentation: PortfolioServicesPresentationSettings
): ServicesPricingStyle {
  const nav = useServicesOrderCtaNav();
  const rawStyle = (presentation as unknown as { pricingStyle?: unknown }).pricingStyle;
  const palette = presentation.servicesPalette;

  return useMemo(() => {
    const style = readServicesPricingStyle({ pricingStyle: rawStyle });

    let href = nav.href;
    let onNavigate = nav.onNavigate;
    let target: '_blank' | undefined;
    if (style.ctaLinkMode === 'section') {
      href = `#${style.ctaLinkSection || 'contact'}`;
    } else if (style.ctaLinkMode === 'url') {
      const url = normalizePricingCtaUrl(style.ctaLinkUrl);
      if (url) {
        href = url;
        onNavigate = undefined;
        if (style.ctaLinkNewTab && /^https?:/i.test(url)) target = '_blank';
      }
    }

    return {
      style,
      cardRadiusPx: pricingCardRadiusPx(style),
      borderWidthPx: pricingBorderWidthPx(style),
      borderColor: pricingBorderColor(style, palette),
      ctaRadius: pricingCtaRadius(style),
      anchorProps: {
        href,
        target,
        rel: target ? 'noopener noreferrer' : undefined,
        onClick: (event: ReactMouseEvent<HTMLAnchorElement>) =>
          handleServicesOrderCtaClick(event, href, onNavigate),
      },
      href,
      onNavigate,
    };
  }, [rawStyle, palette, nav.href, nav.onNavigate]);
}
