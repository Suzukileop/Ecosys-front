import { cache } from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { parseCreatorStudioHeaderLayout } from '@/components/creator/studio/creator-studio-header';
import { parseCreatorStudioHeaderContentStyle } from '@/components/creator/studio/creator-studio-header-content';
import { parseCreatorStudioTabNavAlign } from '@/components/creator/studio/creator-studio-layout';
import { PublicCreatorProfileShell } from '@/components/marketplace/PublicCreatorProfileShell';
import { formatPlaceLabel } from '@/lib/geolocation';
import {
  listPublicProductsServer,
  normalizeCreatorProfile,
  serverMarketplaceFetch,
} from '@/lib/marketplace-api';
import type { MarketplaceCreatorPublicProfile } from '@/types/marketplace';

const getCreatorProfileServer = cache(
  async (creatorId: string, refreshToken?: string): Promise<MarketplaceCreatorPublicProfile | null> => {
    const rawProfile = await serverMarketplaceFetch<Record<string, unknown>>(
      `/api/marketplace/creators/${creatorId}`,
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
  if (!profile) return { title: 'Creator not found — NoProbleme' };
  return {
    title: `${profile.fullName} — NoProbleme Marketplace`,
    description: profile.bio ?? `Portfolio by ${profile.fullName}`,
  };
}

export default async function MarketplaceCreatorPage({
  params,
}: {
  params: Promise<{ creatorId: string }>;
}) {
  const { creatorId } = await params;
  const refreshToken = (await cookies()).get('refresh_token')?.value;
  const isAuthenticated = Boolean(refreshToken);

  const profile = await getCreatorProfileServer(creatorId, refreshToken);
  if (!profile) notFound();

  const productsPage = await listPublicProductsServer({
    creatorId,
    size: 24,
  });

  const locationLabel = formatPlaceLabel(
    profile.locationCity,
    profile.locationCountry,
    profile.nationality
  );

  return (
    <DashboardHomeShell fullWidth>
      <PublicCreatorProfileShell
        creatorId={creatorId}
        profile={profile}
        isAuthenticated={isAuthenticated}
        products={productsPage.content}
        locationLabel={locationLabel}
        headerLayout={parseCreatorStudioHeaderLayout(profile.studioHeaderLayout)}
        headerContentStyle={parseCreatorStudioHeaderContentStyle(profile.studioHeaderContentStyle)}
        tabNavAlign={parseCreatorStudioTabNavAlign(profile.studioTabNavAlign)}
      />
    </DashboardHomeShell>
  );
}
