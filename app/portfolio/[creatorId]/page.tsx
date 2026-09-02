import { Suspense, cache } from 'react';
import { cookies } from 'next/headers';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { PublicCreatorPortfolioPage } from '@/components/portfolio/PublicCreatorPortfolioPage';
import { PublicCreatorPortfolioSkeleton } from '@/components/portfolio/PublicCreatorPortfolioSkeleton';
import { formatLocationLabel } from '@/lib/geolocation';
import {
  buildCreatorPortfolioPath,
  looksLikeUuid,
} from '@/lib/portfolio-url';
import {
  normalizeCreatorProfile,
  serverMarketplaceFetch,
} from '@/lib/marketplace-api';
import type { MarketplaceCreatorPublicProfile } from '@/types/marketplace';
import {
  DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN,
  normalizePortfolioHeroBannerDesign,
  type PortfolioHeroBannerDesign,
} from '@/components/portfolio/portfolio-hero-banner-settings';

const getCreatorProfileServer = cache(
  async (creatorId: string, refreshToken?: string): Promise<MarketplaceCreatorPublicProfile | null> => {
    const rawProfile = await serverMarketplaceFetch<Record<string, unknown>>(
      `/api/marketplace/creators/${encodeURIComponent(creatorId)}`,
      { refreshToken }
    );
    if (!rawProfile) return null;
    return normalizeCreatorProfile(rawProfile);
  }
);

function designFromCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  creatorKey: string
): PortfolioHeroBannerDesign | null {
  const safe = creatorKey.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
  const value = cookieStore.get(`pf_hb_${safe}`)?.value;
  if (value == null) return null;
  return normalizePortfolioHeroBannerDesign(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ creatorId: string }>;
}): Promise<Metadata> {
  const { creatorId } = await params;
  const refreshToken = (await cookies()).get('refresh_token')?.value;
  const profile = await getCreatorProfileServer(creatorId, refreshToken);
  if (!profile) return { title: 'Portfolio not found — NoProbleme' };

  const title = `${profile.fullName} — Portfolio`;
  const description =
    profile.bio?.trim() ||
    (profile.specialite
      ? `Discover the work of ${profile.fullName} — ${profile.specialite}.`
      : `Visual portfolio by ${profile.fullName} on NoProbleme.`);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      ...(profile.avatarUrl ? { images: [{ url: profile.avatarUrl }] } : {}),
    },
    alternates: {
      canonical: buildCreatorPortfolioPath(profile.id, profile.username),
    },
  };
}

async function CreatorPortfolioBody({ creatorId }: { creatorId: string }) {
  const refreshToken = (await cookies()).get('refresh_token')?.value;
  const isAuthenticated = Boolean(refreshToken);

  const profile = await getCreatorProfileServer(creatorId, refreshToken);
  if (!profile) notFound();

  const preferredSlug = profile.username?.trim();
  if (preferredSlug && looksLikeUuid(creatorId) && creatorId !== preferredSlug) {
    permanentRedirect(buildCreatorPortfolioPath(profile.id, preferredSlug));
  }

  const locationLabel = formatLocationLabel(profile.locationCity, profile.locationCountry);

  return (
    <PublicCreatorPortfolioPage
      creatorId={profile.id}
      profile={profile}
      isAuthenticated={isAuthenticated}
      locationLabel={locationLabel}
      portfolioPosts={profile.portfolioPosts}
    />
  );
}

export default async function CreatorPortfolioPage({
  params,
}: {
  params: Promise<{ creatorId: string }>;
}) {
  const { creatorId } = await params;
  const cookieStore = await cookies();
  const initialDesign =
    designFromCookie(cookieStore, creatorId) ?? DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN;

  // Do NOT await the profile here — that would skip the Suspense fallback.
  return (
    <Suspense
      key={creatorId}
      fallback={<PublicCreatorPortfolioSkeleton heroBannerDesign={initialDesign} />}
    >
      <CreatorPortfolioBody creatorId={creatorId} />
    </Suspense>
  );
}
