import { Suspense, cache } from 'react';
import { cookies } from 'next/headers';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { PublicCreatorPortfolioPage } from '@/components/portfolio/PublicCreatorPortfolioPage';
import { PortfolioLoadingPage } from '@/components/portfolio/PortfolioLoadingPage';
import { formatPlaceLabel } from '@/lib/geolocation';
import {
  buildCreatorPortfolioPath,
  looksLikeUuid,
} from '@/lib/portfolio-url';
import { isPortfolioStudioEmbedParam, withPortfolioStudioEmbed } from '@/lib/portfolio-studio-preview';
import { readDesignPreviewTarget, withDesignPreview, type DesignPreviewTarget } from '@/lib/portfolio-design-preview';
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
  if (!profile) return { title: 'Portfolio not found — Skraft' };

  const title = `${profile.fullName} — Portfolio`;
  const description =
    profile.bio?.trim() ||
    (profile.specialite
      ? `Discover the work of ${profile.fullName} — ${profile.specialite}.`
      : `Visual portfolio by ${profile.fullName} on Skraft.`);

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

async function CreatorPortfolioBody({
  creatorId,
  studioEmbed = false,
  designPreview = null,
}: {
  creatorId: string;
  studioEmbed?: boolean;
  /** A studio design picker card (`?previewSection=&previewDesign=`) — only honoured inside the embed. */
  designPreview?: DesignPreviewTarget | null;
}) {
  const refreshToken = (await cookies()).get('refresh_token')?.value;
  const isAuthenticated = Boolean(refreshToken);

  const profile = await getCreatorProfileServer(creatorId, refreshToken);
  if (!profile) notFound();

  const preferredSlug = profile.username?.trim();
  if (preferredSlug && looksLikeUuid(creatorId) && creatorId !== preferredSlug) {
    const dest = buildCreatorPortfolioPath(profile.id, preferredSlug);
    permanentRedirect(studioEmbed && designPreview
      ? withDesignPreview(dest, designPreview)
      : studioEmbed ? withPortfolioStudioEmbed(dest) : dest);
  }

  /* null when nothing is set — formatLocationLabel would hand the page the literal "Location not set". */
  const locationLabel = formatPlaceLabel(profile.locationCity, profile.locationCountry, profile.nationality);

  return (
    <PublicCreatorPortfolioPage
      creatorId={profile.id}
      profile={profile}
      isAuthenticated={isAuthenticated}
      locationLabel={locationLabel}
      portfolioPosts={profile.portfolioPosts}
      studioEmbed={studioEmbed}
      designPreview={studioEmbed ? designPreview : null}
    />
  );
}

export default async function CreatorPortfolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ creatorId: string }>;
  searchParams: Promise<{ embed?: string; previewSection?: string; previewDesign?: string }>;
}) {
  const { creatorId } = await params;
  const { embed, previewSection, previewDesign } = await searchParams;
  const cookieStore = await cookies();
  const initialDesign =
    designFromCookie(cookieStore, creatorId) ?? DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN;
  const safeCreatorKey=creatorId.replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,64);
  const modeHint=cookieStore.get(`pf_hm_${safeCreatorKey}`)?.value;
  const initialMode=modeHint==='light'||modeHint==='dark'?modeHint:undefined;

  // Do NOT await the profile here — that would skip the Suspense fallback.
  return (
    <Suspense
      key={creatorId}
      fallback={<PortfolioLoadingPage creatorKey={creatorId} initialDesign={initialDesign} initialMode={initialMode} designPreview={isPortfolioStudioEmbedParam(embed)?readDesignPreviewTarget(previewSection,previewDesign):null} />}
    >
      <CreatorPortfolioBody
        creatorId={creatorId}
        studioEmbed={isPortfolioStudioEmbedParam(embed)}
        designPreview={readDesignPreviewTarget(previewSection, previewDesign)}
      />
    </Suspense>
  );
}
