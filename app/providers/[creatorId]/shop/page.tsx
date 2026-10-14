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
  if (!profile) return { title: 'Shop not found — Skraft' };
  return {
    title: `${(profile.shopName || profile.fullName)}'s shop — Skraft`,
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
      {/* News / Products' frame: gutters outside a 1240px column whose edges sit under the top bar's
          (logo left, avatar right); `news-mono` gives it the rail boxes and type. */}
      <div className="w-full sm:px-8 md:px-12 lg:px-16">
        <div className="news-theme news-feed news-mono mx-auto w-full max-w-[1240px]">
        <CreatorPublicShopView
          creatorId={creatorId}
          creatorName={profile.fullName}
          avatarUrl={profile.avatarUrl}
          shopName={profile.shopName}
          shopSellingFocus={profile.shopSellingFocus}
          shopDescription={profile.shopDescription}
          shopCoverUrl={profile.shopCoverUrl}
          starCount={profile.starCount}
          isStarred={profile.isStarred}
        />
        </div>
      </div>
    </DashboardHomeShell>
  );
}
