'use client';

import { FooterMiniBarMinimal } from '@/components/portfolio/portfolio-footer-mini-bar-minimal';
import { FooterMiniBarKinetic } from '@/components/portfolio/portfolio-footer-mini-bar-kinetic';
import { FooterMiniBarSplitCaps } from '@/components/portfolio/portfolio-footer-mini-bar-split-caps';
import { FooterMiniBarLanding } from '@/components/portfolio/portfolio-footer-mini-bar-landing';
import { FooterMiniBarContactCta } from '@/components/portfolio/portfolio-footer-mini-bar-contact-cta';
import { FooterMiniBarHeroColumns } from '@/components/portfolio/portfolio-footer-mini-bar-hero-columns';
import { FooterMiniBarInvertedWordmark } from '@/components/portfolio/portfolio-footer-mini-bar-inverted-wordmark';
import { FooterMiniBarServicesReveal } from '@/components/portfolio/portfolio-footer-mini-bar-services-reveal';
import type { FooterMiniBarVariantProps } from '@/components/portfolio/portfolio-footer-mini-bar-shared';
import type { PortfolioFooterMiniBarDesign } from '@/components/portfolio/portfolio-footer-settings';

export type { PortfolioFooterMiniBarDesign };

/**
 * Ultra-minimal, edge-to-edge "Bottom Bar" that closes the page just below the main
 * Contact/Footer section — independent of whichever Footer `design` is active, and of
 * whichever of its own 8 variants is picked (see `PORTFOLIO_FOOTER_MINI_BAR_DESIGN_OPTIONS`
 * in `portfolio-footer-settings.ts`). The first 3 (Minimal/Kinetic/Split caps) were
 * purpose-built for this catalog; the other 5 (Landing/Contact CTA/Hero columns/Inverted
 * wordmark/Services reveal) were extracted verbatim from their namesake Footer design's own
 * hardcoded sub-footer bar (see footer-minibar-catalog-extraction memory) so that look is
 * now available under ANY Footer design, not just its design of origin. Mirrors
 * `EditorialPortfolioFooter`'s own dispatch-by-`design` shape one level down, one file per
 * variant.
 */
export function PortfolioFooterMiniBar({
  design,
  ...props
}: FooterMiniBarVariantProps & { design: PortfolioFooterMiniBarDesign }) {
  if (design === 'kinetic') return <FooterMiniBarKinetic {...props} />;
  if (design === 'split-caps') return <FooterMiniBarSplitCaps {...props} />;
  if (design === 'landing') return <FooterMiniBarLanding {...props} />;
  if (design === 'contact-cta') return <FooterMiniBarContactCta {...props} />;
  if (design === 'hero-columns') return <FooterMiniBarHeroColumns {...props} />;
  if (design === 'inverted-wordmark') return <FooterMiniBarInvertedWordmark {...props} />;
  if (design === 'services-reveal') return <FooterMiniBarServicesReveal {...props} />;
  return <FooterMiniBarMinimal {...props} />;
}
