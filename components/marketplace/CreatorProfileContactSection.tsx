'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  NeutralIconBadge,
  SocialPlatformIcon,
  socialPlatformBrandClass,
  type NeutralIconName,
} from '@/components/marketplace/creator-profile-social-icons';
import { PublicSkillsToolsGrouped } from '@/components/marketplace/PublicSkillsToolsGrouped';
import { geocodePlaceLabel, openStreetMapEmbedUrl, detectUserCoordinatesForDistance, computeReliableDistanceKm } from '@/lib/geolocation';
import { formatDistanceAwayKm } from '@/lib/countries';
import { formatPhoneDisplay } from '@/lib/phone';
import type { ProfileMediaBlock, ProfileStrengthTool } from '@/types/ecosystem';
import type { MarketplaceCreatorPublicProfile } from '@/types/marketplace';
import { ContentMediaPreview } from '@/components/creator/creator-content-media';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import {
  ProfileSectionNavIcon,
  getProfileSection,
  type ProfileSectionId,
} from '@/components/creator/studio/profile-section-nav';
import {
  profileNavButtonActiveClass,
  profileNavButtonBaseClass,
  profileNavButtonInactiveClass,
} from '@/components/creator/studio/profile-section-ui';
import { SOCIAL_PLATFORMS } from '@/types/ecosystem';
import { creatorShowsProviderAboutFields, normalizeCreatorAppRole } from '@/lib/creator-app-role';

type PublicInfoNavId = Extract<
  ProfileSectionId,
  'experience' | 'about' | 'strengths' | 'faq' | 'contact' | 'links'
>;

const PUBLIC_INFO_SECTION_DOM_ID: Record<PublicInfoNavId, string> = {
  experience: 'public-info-experience',
  about: 'public-info-about',
  strengths: 'public-info-skills-tools',
  faq: 'public-info-faq',
  contact: 'public-info-contact',
  links: 'public-info-links',
};

const PUBLIC_INFO_LABEL_OVERRIDES: Partial<Record<PublicInfoNavId, string>> = {
  about: 'Profile',
  strengths: 'Stack',
};

type CreatorProfileContactSectionProps = {
  creatorId: string;
  profile: MarketplaceCreatorPublicProfile;
  isAuthenticated: boolean;
  locationLabel?: string | null;
};

type InfoRow = {
  key: string;
  label: string;
  value: ReactNode;
};

function socialLabel(platform: string): string {
  return SOCIAL_PLATFORMS.find((p) => p.value === platform)?.label ?? platform;
}

function websiteHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function formatMemberSince(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function resolveDisplayLinks(profile: MarketplaceCreatorPublicProfile) {
  if (profile.profileLinks && profile.profileLinks.length > 0) {
    return profile.profileLinks.filter((link) => link.url.trim());
  }
  const legacy: Array<{ id: string; label: string; url: string; type: string; platform?: string | null }> = [];
  if (profile.websiteUrl?.trim()) {
    legacy.push({ id: 'website', label: 'Website', url: profile.websiteUrl.trim(), type: 'WEBSITE' });
  }
  if (profile.ctaUrl?.trim()) {
    legacy.push({
      id: 'cta',
      label: profile.ctaLabel?.trim() || 'En savoir plus',
      url: profile.ctaUrl.trim(),
      type: 'CTA',
    });
  }
  if (profile.socialLinks) {
    for (const [platform, url] of Object.entries(profile.socialLinks)) {
      if (url.trim()) {
        legacy.push({ id: platform, label: socialLabel(platform), url, type: 'SOCIAL', platform });
      }
    }
  }
  return legacy;
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
      {children}
    </h3>
  );
}

function InfoPanel({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-20 overflow-hidden rounded-2xl border border-neutral-200 bg-white px-5 py-10 dark:border-neutral-800 dark:bg-neutral-900/80 sm:gap-24 sm:px-6 sm:py-12">
      {children}
    </div>
  );
}

function InfoPanelSection({
  children,
  id,
}: {
  children: ReactNode;
  bordered?: boolean;
  id?: string;
}) {
  return (
    <div id={id} className={id ? 'scroll-mt-24' : undefined}>
      {children}
    </div>
  );
}

function LocationFeaturedBlock({
  label,
  locationLat,
  locationLng,
}: {
  label: string;
  locationLat?: number | null;
  locationLng?: number | null;
}) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [distanceLabel, setDistanceLabel] = useState<string | null>(null);
  const [distancePending, setDistancePending] = useState(false);
  const [geoDenied, setGeoDenied] = useState(false);
  const [mapImageFailed, setMapImageFailed] = useState(false);
  const [distanceEnabled, setDistanceEnabled] = useState(false);
  const distanceAbortRef = useRef<AbortController | null>(null);

  const applyDistance = useCallback(
    (place: { lat: number; lng: number }, viewer: { lat: number; lng: number; accuracyM?: number | null }) => {
      const km = computeReliableDistanceKm(
        {
          lat: viewer.lat,
          lng: viewer.lng,
          accuracyM: viewer.accuracyM ?? null,
        },
        place
      );
      if (km == null) return false;
      setDistanceLabel(formatDistanceAwayKm(km));
      setGeoDenied(false);
      setDistancePending(false);
      return true;
    },
    []
  );

  const resolveDistance = useCallback(
    async (
      place: { lat: number; lng: number },
      options?: { force?: boolean; isCancelled?: () => boolean; signal?: AbortSignal }
    ) => {
      const isCancelled = options?.isCancelled;
      setDistancePending(true);
      setGeoDenied(false);
      setDistanceLabel(null);
      distanceAbortRef.current?.abort();
      const controller = new AbortController();
      distanceAbortRef.current = controller;
      try {
        const viewer = await detectUserCoordinatesForDistance(
          (next) => {
            if (isCancelled?.() || controller.signal.aborted) return;
            applyDistance(place, next);
          },
          { timeoutMs: options?.force ? 20_000 : 18_000, signal: controller.signal }
        );
        if (isCancelled?.() || controller.signal.aborted) return;
        const ok = applyDistance(place, viewer);
        if (!ok) {
          setDistanceLabel(null);
          setDistancePending(false);
          setGeoDenied(true);
        }
      } catch (error) {
        if (isCancelled?.() || controller.signal.aborted) return;
        if (error instanceof Error && /cancelled/i.test(error.message)) return;
        setDistanceLabel(null);
        setGeoDenied(true);
        setDistancePending(false);
      }
    },
    [applyDistance]
  );

  const refreshDistance = useCallback(() => {
    if (!coords || !distanceEnabled) return;
    void resolveDistance(coords, { force: true });
  }, [coords, distanceEnabled, resolveDistance]);

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;

    setLoading(true);
    setCoords(null);
    setDistanceLabel(null);
    setDistancePending(false);
    setGeoDenied(false);
    setMapImageFailed(false);
    setDistanceEnabled(false);

    // Clear legacy coarse cache that poisoned distance on first paint.
    try {
      sessionStorage.removeItem('np_viewer_coords_v1');
    } catch {
      // ignore
    }

    const storedLat =
      locationLat != null && Number.isFinite(locationLat) ? locationLat : null;
    const storedLng =
      locationLng != null && Number.isFinite(locationLng) ? locationLng : null;

    void (async () => {
      let place: { lat: number; lng: number } | null =
        storedLat != null && storedLng != null
          ? { lat: storedLat, lng: storedLng }
          : null;

      if (!place) {
        const geocoded = await geocodePlaceLabel(label);
        if (cancelled) return;
        if (geocoded) {
          place = { lat: geocoded.lat, lng: geocoded.lng };
        }
      }

      if (cancelled) return;
      if (place) {
        setCoords(place);
        if (!cancelled) setLoading(false);
        // Distance is only meaningful from stored GPS, never a city geocode centroid.
        if (storedLat != null && storedLng != null) {
          setDistanceEnabled(true);
          await resolveDistance(place, { isCancelled });
        }
        return;
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
      distanceAbortRef.current?.abort();
    };
  }, [label, locationLat, locationLng, resolveDistance]);

  if (!coords) {
    return (
      <div className="theme-accent-border flex items-center gap-3 rounded-2xl border border-orange-300/50 bg-orange-50/30 px-4 py-3 dark:border-orange-500/30 dark:bg-orange-500/5">
        <NeutralIconBadge name="location" size="sm" accent />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Location
          </p>
          <p className="mt-0.5 text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
            {label}
          </p>
          {loading ? (
            <p className="mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-500">Loading map…</p>
          ) : null}
        </div>
      </div>
    );
  }

  const mapsHref = `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=11/${coords.lat}/${coords.lng}`;
  const staticMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${coords.lat},${coords.lng}&zoom=11&size=960x480&maptype=mapnik&markers=${coords.lat},${coords.lng},red-pushpin`;

  const distanceRefreshButton = (
    <button
      type="button"
      onClick={refreshDistance}
      disabled={distancePending}
      aria-label={distancePending ? 'Refreshing distance…' : 'Refresh distance'}
      title={distancePending ? 'Refreshing distance…' : 'Refresh distance'}
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 disabled:cursor-wait disabled:opacity-60 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      <svg
        className={`h-3.5 w-3.5 ${distancePending ? 'animate-spin' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 0 0 5.6 6.6M4 15a8 8 0 0 0 14.4 2.4"
        />
      </svg>
    </button>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
      <div className="relative h-52 bg-neutral-100 dark:bg-neutral-900 sm:h-64 lg:h-72">
        {!mapImageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element -- external static map host
          <img
            src={staticMapUrl}
            alt={`Map of ${label}`}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setMapImageFailed(true)}
          />
        ) : (
          <iframe
            title={`Map of ${label}`}
            src={openStreetMapEmbedUrl(coords.lat, coords.lng)}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
        {distanceEnabled && distanceLabel ? (
          <div className="absolute left-3 top-3 z-20 flex items-center gap-0.5 rounded-full bg-white py-1 pl-3 pr-1 text-xs font-semibold text-neutral-800 shadow-md dark:bg-neutral-950 dark:text-neutral-100">
            <span>{distanceLabel}</span>
            {distanceRefreshButton}
          </div>
        ) : distanceEnabled && distancePending ? (
          <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-neutral-500 shadow-md dark:bg-neutral-950/95 dark:text-neutral-400">
            <svg
              className="h-3.5 w-3.5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 0 0 5.6 6.6M4 15a8 8 0 0 0 14.4 2.4"
              />
            </svg>
            Measuring distance…
          </div>
        ) : distanceEnabled && geoDenied ? (
          <button
            type="button"
            onClick={() => void resolveDistance(coords, { force: true })}
            className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-orange-600 shadow-md transition hover:bg-orange-50 dark:bg-neutral-950 dark:text-orange-400 dark:hover:bg-neutral-900"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 0 0 5.6 6.6M4 15a8 8 0 0 0 14.4 2.4"
              />
            </svg>
            Show distance from you
          </button>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-neutral-200/80 px-3.5 py-2.5 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Location
            {distanceEnabled && distanceLabel ? (
              <span className="ml-2 inline-flex items-center gap-1 font-medium normal-case tracking-normal text-neutral-600 dark:text-neutral-300">
                · {distanceLabel}
                <button
                  type="button"
                  onClick={refreshDistance}
                  disabled={distancePending}
                  aria-label="Refresh distance"
                  title="Refresh distance"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                >
                  <svg
                    className={`h-3 w-3 ${distancePending ? 'animate-spin' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 0 0 5.6 6.6M4 15a8 8 0 0 0 14.4 2.4"
                    />
                  </svg>
                </button>
              </span>
            ) : null}
          </p>
          <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">{label}</p>
        </div>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[11px] font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
        >
          Open map
        </a>
      </div>
    </div>
  );
}

function ProfileFactCards({ rows }: { rows: InfoRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div
      className={`grid gap-3 ${
        rows.length === 1 ? 'sm:max-w-sm' : rows.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
      }`}
    >
      {rows.map((row) => (
        <div
          key={row.key}
          className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900/40"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {row.label}
          </p>
          <p className="mt-2 text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100 sm:text-base">
            {row.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ContactDirectCard({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: NeutralIconName;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      className="group flex min-h-[6.5rem] flex-col justify-between rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50/90 to-white p-4 transition hover:border-orange-300/70 hover:from-orange-50/40 hover:to-white hover:shadow-sm dark:border-neutral-800 dark:from-neutral-900/70 dark:to-neutral-900/40 dark:hover:border-orange-500/35 dark:hover:from-orange-500/5 dark:hover:to-neutral-900"
    >
      <div className="flex items-center gap-2.5">
        <NeutralIconBadge name={icon} size="sm" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500">
          {label}
        </span>
      </div>
      <p className="mt-3 break-all text-base font-semibold leading-snug text-neutral-900 dark:text-white sm:text-lg">
        {value}
      </p>
    </a>
  );
}

function StoryBlockCard({
  block,
  showMedia = true,
}: {
  block: ProfileMediaBlock;
  showMedia?: boolean;
}) {
  const tools = Array.from(
    new Set(
      (block.tools ?? [])
        .map((item) => {
          if (typeof item === 'string') return item.trim();
          if (item && typeof item === 'object') {
            return String(item.name ?? item.value ?? '').trim();
          }
          return '';
        })
        .filter(Boolean)
    )
  ).slice(0, 8);

  const toolIconByName = new Map<string, string>();
  for (const item of block.tools ?? []) {
    if (typeof item === 'string' || !item || typeof item !== 'object') continue;
    const name = String(item.name ?? item.value ?? '').trim();
    const iconUrl = typeof item.iconUrl === 'string' ? item.iconUrl.trim() : '';
    if (name && iconUrl) toolIconByName.set(name, iconUrl);
  }

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
      {block.title?.trim() ? (
        <p className="mb-2 font-semibold text-neutral-900 dark:text-white">{block.title.trim()}</p>
      ) : null}
      <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-800 dark:text-neutral-100 sm:text-base">
        {block.text}
      </p>
      {tools.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {tools.map((tool) => (
            <span
              key={tool}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-100/80 py-1 pl-1 pr-2.5 text-xs font-medium text-neutral-700 dark:bg-white/[0.06] dark:text-neutral-200"
              title={tool}
            >
              <CreatorToolLogo label={tool} iconUrl={toolIconByName.get(tool)} size={20} />
              <span className="max-w-[8rem] truncate">{tool}</span>
            </span>
          ))}
        </div>
      ) : null}
      {showMedia && block.mediaUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl">
          <ContentMediaPreview locale="en" mediaUrl={block.mediaUrl} mediaType="FILE" large fluid />
        </div>
      ) : null}
    </div>
  );
}

function resolveLinkPlatform(link: {
  label: string;
  url: string;
  type: string;
  platform?: string | null;
}): string {
  const haystack = `${link.platform ?? ''} ${link.label} ${link.url}`.toLowerCase();
  let host = '';
  try {
    const withProtocol = /^https?:\/\//i.test(link.url.trim())
      ? link.url.trim()
      : `https://${link.url.trim()}`;
    host = new URL(withProtocol).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    host = '';
  }

  if (
    host.includes('facebook') ||
    host.includes('fb.com') ||
    host.includes('fb.me') ||
    haystack.includes('facebook')
  ) {
    return 'FACEBOOK';
  }
  if (host.includes('youtube') || host === 'youtu.be' || haystack.includes('youtube')) {
    return 'YOUTUBE';
  }
  if (host.includes('instagram') || haystack.includes('instagram')) return 'INSTAGRAM';
  if (host.includes('tiktok') || haystack.includes('tiktok')) return 'TIKTOK';
  if (host.includes('linkedin') || haystack.includes('linkedin')) return 'LINKEDIN';
  if (host.includes('github') || haystack.includes('github')) return 'GITHUB';
  if (
    host.includes('twitter') ||
    host === 'x.com' ||
    host.endsWith('.x.com') ||
    haystack.includes('twitter')
  ) {
    return 'TWITTER';
  }

  const stored = link.platform?.trim().toUpperCase() ?? '';
  if (stored && stored !== 'OTHER') return stored;
  if (link.type === 'WEBSITE') return 'WEBSITE';
  return 'OTHER';
}

function linkDisplayLabel(
  link: { label: string; url: string; platform?: string | null },
  platform: string
): string {
  const key = platform.toUpperCase();
  if (key === 'YOUTUBE') return 'YouTube';
  if (key === 'FACEBOOK') return 'Facebook';
  if (key === 'INSTAGRAM') return 'Instagram';
  if (key === 'TIKTOK') return 'TikTok';
  if (key === 'LINKEDIN') return 'LinkedIn';
  if (key === 'GITHUB') return 'GitHub';
  if (key === 'TWITTER' || key === 'X') return 'X';
  if (key === 'WEBSITE') return 'Website';

  const raw = link.label?.trim();
  if (raw && !/^https?:\/\//i.test(raw) && !raw.includes('.')) return raw;
  return websiteHostname(link.url) || 'Link';
}

function UnifiedLinkIcon({
  link,
}: {
  link: { id: string; label: string; url: string; type: string; platform?: string | null };
}) {
  const platform = resolveLinkPlatform(link);
  const label = linkDisplayLabel(link, platform);
  const isBrand = !['OTHER', 'WEBSITE'].includes(platform.toUpperCase());

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className="group flex w-[5.5rem] flex-col items-center gap-2.5 sm:w-24"
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full transition group-hover:scale-105 sm:h-16 sm:w-16 ${
          isBrand
            ? socialPlatformBrandClass(platform)
            : 'border border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
        }`}
      >
        {isBrand ? (
          <SocialPlatformIcon platform={platform} className="h-7 w-7 sm:h-8 sm:w-8" />
        ) : (
          <svg
            className="h-7 w-7 sm:h-8 sm:w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"
            />
          </svg>
        )}
      </span>
      <span className="w-full truncate text-center text-xs font-medium text-neutral-700 dark:text-neutral-200">
        {label}
      </span>
    </a>
  );
}

export function CreatorProfileContactSection({
  creatorId,
  profile,
  isAuthenticated,
  locationLabel,
}: CreatorProfileContactSectionProps) {
  const displayLinks = useMemo(() => resolveDisplayLinks(profile), [profile]);
  const contactEmail = profile.contactEmail?.trim() ?? '';
  const contactPhone = profile.contactPhone?.trim() ?? '';
  const hasEmail = Boolean(contactEmail);
  const hasPhone = Boolean(contactPhone);
  const spokenLanguages = profile.spokenLanguages ?? [];
  const legacyLanguages = profile.languages?.trim();
  const hasLanguages = spokenLanguages.length > 0 || Boolean(legacyLanguages);
  const hasLocation = Boolean(locationLabel?.trim());
  const memberSinceLabel = formatMemberSince(profile.memberSince);
  const hasGender = Boolean(profile.gender?.trim());
  const showProviderSections = creatorShowsProviderAboutFields(normalizeCreatorAppRole(profile.appRole));

  const experienceBlocks = profile.experienceBlocks ?? [];
  const faqItems = profile.faqItems ?? [];
  const hasYears = showProviderSections && profile.yearsOfExperience != null;
  const hasExperienceBlocks = showProviderSections && experienceBlocks.length > 0;
  const hasExperience = hasYears || hasExperienceBlocks;
  const strengths = profile.strengthsToolsMastered ?? [];
  const stackItems =
    profile.profileStack ??
    (profile as { stack?: ProfileStrengthTool[] }).stack ??
    [];
  const skillTags = (profile.specialtyTags ?? []).map((tag) => tag.trim()).filter(Boolean);
  const allowedSpecialties = (profile.specialties ?? []).map((item) => item.trim()).filter(Boolean);
  const hasStrengths = showProviderSections && strengths.length > 0;
  const hasStack = showProviderSections && stackItems.length > 0;
  const hasSkillTags = showProviderSections && skillTags.length > 0 && !hasStack;
  const hasFaq = showProviderSections && faqItems.length > 0;
  const hasLinks = displayLinks.length > 0;
  const hasAboutMeta = hasGender || hasLanguages || memberSinceLabel;
  const hasProfileInfo = hasAboutMeta || hasLocation || hasStrengths || hasStack || hasSkillTags;
  const hasDirectContact = hasEmail || hasPhone;
  const hasAnyPublicInfo =
    hasProfileInfo || hasDirectContact || hasLinks || hasExperience || hasFaq;
  const showMembersHint = !isAuthenticated && profile.membersOnlyContactAvailable;

  const profileFactRows = useMemo(() => {
    const rows: InfoRow[] = [];
    if (hasGender) {
      rows.push({ key: 'gender', label: 'Gender', value: profile.gender });
    }
    if (hasLanguages) {
      rows.push({
        key: 'languages',
        label: 'Working languages',
        value: spokenLanguages.length > 0 ? spokenLanguages.join(', ') : legacyLanguages,
      });
    }
    if (memberSinceLabel) {
      rows.push({ key: 'memberSince', label: 'Member since', value: memberSinceLabel });
    }
    return rows;
  }, [
    hasGender,
    hasLanguages,
    memberSinceLabel,
    profile.gender,
    spokenLanguages,
    legacyLanguages,
  ]);

  const directContacts: Array<{
    key: string;
    href: string;
    icon: NeutralIconName;
    label: string;
    value: string;
  }> = [];
  if (hasEmail) {
    directContacts.push({
      key: 'email',
      href: `mailto:${contactEmail}`,
      icon: 'email',
      label: 'Email',
      value: contactEmail,
    });
  }
  if (hasPhone) {
    directContacts.push({
      key: 'phone',
      href: `tel:${contactPhone}`,
      icon: 'phone',
      label: 'Phone',
      value: formatPhoneDisplay(contactPhone),
    });
  }

  const hasAboutSection = hasProfileInfo || hasStrengths || hasStack || hasSkillTags;

  const navItems = useMemo(() => {
    const items: PublicInfoNavId[] = [];
    if (hasAboutSection) items.push('about');
    if (hasExperience) items.push('experience');
    if (hasFaq) items.push('faq');
    if (hasDirectContact) items.push('contact');
    if (hasLinks) items.push('links');
    return items;
  }, [hasAboutSection, hasExperience, hasFaq, hasDirectContact, hasLinks]);

  const [activeSection, setActiveSection] = useState<PublicInfoNavId | null>(navItems[0] ?? null);

  useEffect(() => {
    if (navItems.length === 0) {
      setActiveSection(null);
      return;
    }
    if (!activeSection || !navItems.includes(activeSection)) {
      setActiveSection(navItems[0]);
    }
  }, [navItems, activeSection]);

  useEffect(() => {
    if (navItems.length === 0) return;
    const elements = navItems
      .map((id) => document.getElementById(PUBLIC_INFO_SECTION_DOM_ID[id]))
      .filter((el): el is HTMLElement => el != null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (!top?.target?.id) return;
        const matched = (
          Object.entries(PUBLIC_INFO_SECTION_DOM_ID) as Array<[PublicInfoNavId, string]>
        ).find(([, domId]) => domId === top.target.id);
        if (matched) setActiveSection(matched[0]);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.15, 0.35, 0.55] }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [navItems]);

  const selectSection = (sectionId: PublicInfoNavId) => {
    setActiveSection(sectionId);
    const el = document.getElementById(PUBLIC_INFO_SECTION_DOM_ID[sectionId]);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderNav = (layout: 'desktop' | 'mobile') => (
    <nav
      aria-label="Profile information sections"
      className={
        layout === 'desktop'
          ? 'flex min-h-0 flex-col'
          : 'flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      }
    >
      {layout === 'desktop' ? (
        <div className="flex h-12 shrink-0 items-center px-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-500">
            Information
          </p>
        </div>
      ) : null}
      <div
        className={
          layout === 'desktop'
            ? 'flex min-h-0 flex-col gap-1 overflow-y-auto px-2 pb-2 pt-0.5'
            : 'flex gap-1'
        }
      >
        {navItems.map((sectionId) => {
          const active = activeSection === sectionId;
          const label =
            PUBLIC_INFO_LABEL_OVERRIDES[sectionId] ?? getProfileSection(sectionId).label;
          return (
            <button
              key={sectionId}
              type="button"
              onClick={() => selectSection(sectionId)}
              aria-current={active ? 'true' : undefined}
              className={`${profileNavButtonBaseClass} ${
                layout === 'desktop' ? 'w-full' : 'shrink-0'
              } ${active ? profileNavButtonActiveClass : profileNavButtonInactiveClass}`}
            >
              <ProfileSectionNavIcon sectionId={sectionId} active={active} />
              <span className="min-w-0 truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  return (
    <section aria-labelledby="info-heading">
      <h2 id="info-heading" className="sr-only">
        Public information
      </h2>

      {!hasAnyPublicInfo && !showMembersHint ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-5 py-10 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No public information yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {navItems.length > 0 ? (
            <div className="md:hidden overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 p-2 shadow-sm dark:border-neutral-800 dark:bg-[#0F0F0F]">
              {renderNav('mobile')}
            </div>
          ) : null}

          <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="order-2 min-w-0 space-y-4 md:order-none md:col-start-1 md:row-start-1">
              <InfoPanel>
                {hasAboutSection ? (
                  <InfoPanelSection id={PUBLIC_INFO_SECTION_DOM_ID.about}>
                    <SectionHeading>Profile</SectionHeading>
                    {hasStack || hasSkillTags || hasStrengths ? (
                      <div id={PUBLIC_INFO_SECTION_DOM_ID.strengths} className="mb-5 scroll-mt-24">
                        <PublicSkillsToolsGrouped
                          stack={stackItems}
                          skillTags={skillTags}
                          tools={strengths}
                          allowedSpecialties={allowedSpecialties}
                        />
                      </div>
                    ) : null}
                    {(hasLocation || profileFactRows.length > 0) && (
                      <div className="space-y-3">
                        {hasLocation ? (
                          <LocationFeaturedBlock
                            label={locationLabel!.trim()}
                            locationLat={profile.locationLat}
                            locationLng={profile.locationLng}
                          />
                        ) : null}
                        {profileFactRows.length > 0 ? (
                          <ProfileFactCards rows={profileFactRows} />
                        ) : null}
                      </div>
                    )}
                  </InfoPanelSection>
                ) : null}

                {hasExperience ? (
                  <InfoPanelSection id={PUBLIC_INFO_SECTION_DOM_ID.experience}>
                    <SectionHeading>Experience</SectionHeading>
                    {hasYears ? (
                      <p className="mb-4 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                        {profile.yearsOfExperience} year
                        {profile.yearsOfExperience === 1 ? '' : 's'} of experience
                      </p>
                    ) : null}
                    {hasExperienceBlocks ? (
                      <div className="space-y-3">
                        {experienceBlocks.map((block) => (
                          <StoryBlockCard key={block.id} block={block} showMedia={false} />
                        ))}
                      </div>
                    ) : null}
                  </InfoPanelSection>
                ) : null}

                {hasFaq ? (
                  <InfoPanelSection id={PUBLIC_INFO_SECTION_DOM_ID.faq}>
                    <SectionHeading>FAQ</SectionHeading>
                    <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {faqItems.map((item) => (
                        <details key={item.id} className="group py-3 first:pt-0 last:pb-0">
                          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left [&::-webkit-details-marker]:hidden">
                            <span className="text-sm font-semibold leading-snug text-neutral-900 dark:text-white sm:text-base">
                              {item.question}
                            </span>
                            <span
                              className="mt-0.5 shrink-0 text-lg leading-none text-neutral-400 transition group-open:rotate-45 dark:text-neutral-500"
                              aria-hidden
                            >
                              +
                            </span>
                          </summary>
                          <p className="mt-2 pr-8 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                            {item.answer}
                          </p>
                        </details>
                      ))}
                    </div>
                  </InfoPanelSection>
                ) : null}

                {hasDirectContact ? (
                  <InfoPanelSection id={PUBLIC_INFO_SECTION_DOM_ID.contact}>
                    <SectionHeading>Contact</SectionHeading>
                    <div
                      className={`grid gap-3 ${directContacts.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-md'}`}
                    >
                      {directContacts.map((item) => (
                        <ContactDirectCard
                          key={item.key}
                          href={item.href}
                          icon={item.icon}
                          label={item.label}
                          value={item.value}
                        />
                      ))}
                    </div>
                  </InfoPanelSection>
                ) : null}

                {hasLinks ? (
                  <InfoPanelSection id={PUBLIC_INFO_SECTION_DOM_ID.links}>
                    <SectionHeading>Links</SectionHeading>
                    <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6 sm:gap-x-10">
                      {displayLinks.map((link) => (
                        <UnifiedLinkIcon key={link.id} link={link} />
                      ))}
                    </div>
                  </InfoPanelSection>
                ) : null}
              </InfoPanel>

              {showMembersHint ? (
                <p className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-400">
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/marketplace/${creatorId}`)}`}
                    className="font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
                  >
                    Sign in
                  </Link>{' '}
                  to see additional member-only information.
                </p>
              ) : null}
            </div>

            {navItems.length > 0 ? (
              <ProfileSectionStickyAside className="w-[15.5rem] md:col-start-2 md:row-start-1">
                {renderNav('desktop')}
              </ProfileSectionStickyAside>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
