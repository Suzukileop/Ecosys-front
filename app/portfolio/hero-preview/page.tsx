import { normalizeCreatorProfile, serverMarketplaceFetch } from '@/lib/marketplace-api';
import { normalizePortfolioHeroBannerDesign } from '@/components/portfolio/portfolio-hero-banner-settings';
import { HeroCataloguePreview } from '@/components/portfolio/HeroCataloguePreview';

export const metadata = { title: 'Hero preview', robots: { index: false, follow: false } };

export default async function HeroPreviewPage({ searchParams }: {
  searchParams: Promise<{ creator?: string; design?: string }>;
}) {
  const { creator, design } = await searchParams;
  const raw = creator ? await serverMarketplaceFetch<Record<string, unknown>>(
    `/api/marketplace/creators/${encodeURIComponent(creator)}`
  ) : null;
  const profile = raw ? normalizeCreatorProfile(raw) : null;
  return <HeroCataloguePreview design={normalizePortfolioHeroBannerDesign(design)} avatarUrl={profile?.avatarUrl || '/landing/audience/freelancer-dev.jpg'} />;
}
