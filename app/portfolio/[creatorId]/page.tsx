import { cache } from 'react';
import { cookies } from 'next/headers';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { PublicCreatorPortfolioPage } from '@/components/portfolio/PublicCreatorPortfolioPage';
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

export default async function CreatorPortfolioPage({
  params,
}: {
  params: Promise<{ creatorId: string }>;
}) {
  const { creatorId } = await params;
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
