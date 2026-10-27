import type { PortfolioHeroBannerDesign } from '@/components/portfolio/portfolio-hero-banner-settings';
import { DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN } from '@/components/portfolio/portfolio-hero-banner-settings';
import { PortfolioHeroBannerSkeleton } from '@/components/portfolio/portfolio-hero-banner-skeletons';
import type { PortfolioSettings } from './portfolio-settings-types';

/** Page loading is Hero-only. Catalogue thumbnails have independent placeholders. */
export function PublicCreatorPortfolioSkeleton({
  heroBannerDesign = DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN,
  settings,
}: {
  heroBannerDesign?: PortfolioHeroBannerDesign;
  settings?: PortfolioSettings | null;
}) {
  return (
    <div className="min-h-screen" aria-busy="true" aria-label="Loading portfolio">
      <PortfolioHeroBannerSkeleton design={heroBannerDesign} settings={settings} />
    </div>
  );
}
