import { cache } from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { CreatorPublicShopView } from '@/components/marketplace/CreatorPublicShopView';
import {
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
  if (!profile) return { title: 'Shop not found — NoProbleme' };
  return {
    title: `${(profile.shopName || profile.fullName)}'s shop — NoProbleme`,
    description:
      profile.shopDescription?.trim() ||
      profile.shopSellingFocus?.trim() ||
      `Browse products from ${profile.fullName}`,
  };
}

export default async function CreatorShopPage({
  params,
}: {
  params: Promise<{ creatorId: string }>;
}) {
  const { creatorId } = await params;
  const refreshToken = (await cookies()).get('refresh_token')?.value;
  const profile = await getCreatorProfileServer(creatorId, refreshToken);
  if (!profile) notFound();

  return (
    <DashboardHomeShell fullWidth>
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6">
        <CreatorPublicShopView
          creatorId={creatorId}
          creatorName={profile.fullName}
          avatarUrl={profile.avatarUrl}
          shopName={profile.shopName}
          shopSellingFocus={profile.shopSellingFocus}
          shopDescription={profile.shopDescription}
          shopCoverUrl={profile.shopCoverUrl}
        />
      </div>
    </DashboardHomeShell>
  );
}
