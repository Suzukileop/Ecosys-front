'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type TouchEvent,
} from 'react';
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
import type { ProfileStrengthTool } from '@/types/profile';
import type { MarketplaceCreatorPublicProfile } from '@/types/marketplace';
import { APP_FIELD } from '@/components/landing/landingBrand';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import {
  ProfileSectionNavIcon,
  getProfileSection,
  type ProfileSectionId,
} from '@/components/creator/studio/profile-section-nav';
import { SOCIAL_PLATFORMS } from '@/types/profile';
import {
  creatorShowsCareerSections,
  creatorShowsProviderAboutFields,
  normalizeCreatorAppRole,
} from '@/lib/creator-app-role';

type PublicInfoNavId = Extract<
  ProfileSectionId,
  'about' | 'strengths' | 'faq' | 'contact' | 'links'
>;

const PUBLIC_INFO_SECTION_DOM_ID: Record<PublicInfoNavId, string> = {
  about: 'public-info-about',
  strengths: 'public-info-skills-tools',
  faq: 'public-info-faq',
  contact: 'public-info-contact',
  links: 'public-info-links',
};

const NAV_BUTTON_BASE =
  'flex items-center gap-3 rounded-lg px-3 text-left text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 dark:focus-visible:ring-white/25';
const NAV_BUTTON_ACTIVE = 'font-medium text-[#FF5722]';
const NAV_BUTTON_INACTIVE =
  'text-[#111111] hover:bg-black/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.05]';

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

/** Below `md` the information sections are shown one page at a time. */
const PAGED_QUERY = '(max-width: 767px)';

function subscribePaged(onChange: () => void) {
  const mq = window.matchMedia(PAGED_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function useIsPagedLayout() {
  return useSyncExternalStore(
    subscribePaged,
    () => window.matchMedia(PAGED_QUERY).matches,
    () => false
  );
}

function SectionHeading({ children, meta }: { children: ReactNode; meta?: ReactNode }) {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4 md:mb-10">
      <h3 className="text-[1.25rem] font-semibold tracking-[-0.015em] text-[#111111] dark:text-white md:text-[1.5rem]">
        {children}
      </h3>
      {meta ? (
        <span className="shrink-0 text-[13px] font-medium text-neutral-500 dark:text-neutral-400 md:hidden">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

function InfoPanel({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-10 sm:gap-12">{children}</div>;
}

function InfoPanelSection({
  children,
  id,
  framed = false,
  pageHidden = false,
}: {
  children: ReactNode;
  id?: string;
  framed?: boolean;
  pageHidden?: boolean;
}) {
  return (
    <div
      id={id}
      className={`${
        framed
          ? 'bg-white max-md:!bg-transparent dark:bg-[#111111] dark:max-md:!bg-transparent md:rounded-lg md:border md:border-black/[0.06] md:p-10 md:dark:border-white/[0.08]'
          : 'pb-2'
      } ${id ? 'scroll-mt-24' : ''} ${pageHidden ? 'max-md:hidden' : 'max-md:animate-[pf-fade-in_220ms_ease-out]'}`}
    >
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
      <div className="flex items-center gap-4 border-t border-black/[0.06] pt-5 dark:border-white/[0.06]">
        <NeutralIconBadge name="location" size="sm" />
        <div className="min-w-0">
          <p className="text-[14px] text-neutral-600 dark:text-neutral-300">Location</p>
          <p className="mt-1 text-[1.0625rem] font-medium leading-snug text-[#111111] dark:text-neutral-100">
            {label}
          </p>
          {loading ? (
            <p className="mt-1 text-[14px] text-neutral-500 dark:text-neutral-400">Loading map…</p>
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
    <div>
      <div className="relative h-60 overflow-hidden rounded-lg border border-black/[0.06] bg-neutral-100 dark:border-white/[0.08] dark:bg-neutral-900 sm:h-72 lg:h-80">
        {!mapImageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element -- external static map host
          <img
            src={staticMapUrl}
            alt={`Map of ${label}`}
            loading="lazy"
            decoding="async"
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
          <div className="absolute left-3 top-3 z-20 flex items-center gap-0.5 rounded-full bg-white py-1 pl-3 pr-1 text-[13px] font-semibold text-neutral-800 shadow-md dark:bg-neutral-950 dark:text-neutral-100">
            <span>{distanceLabel}</span>
            {distanceRefreshButton}
          </div>
        ) : distanceEnabled && distancePending ? (
          <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[13px] font-medium text-neutral-700 shadow-md dark:bg-neutral-950/95 dark:text-neutral-300">
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
            className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-neutral-800 shadow-md transition hover:bg-neutral-50 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900"
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
      <div className="flex items-end justify-between gap-4 pt-5">
        <div className="min-w-0">
          <p className="text-[14px] text-neutral-600 dark:text-neutral-300">
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
          <p className="mt-1 truncate text-[1.0625rem] font-medium text-[#111111] dark:text-neutral-100">{label}</p>
        </div>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[14px] font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-[#111111] hover:decoration-neutral-500 dark:text-neutral-300 dark:decoration-neutral-600 dark:hover:text-white"
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
    <dl
      className={`grid gap-x-10 gap-y-8 max-md:gap-0 max-md:divide-y max-md:divide-[#DADDE1] max-md:rounded-xl max-md:border max-md:border-[#DADDE1] dark:max-md:divide-white/[0.12] dark:max-md:border-white/[0.16] ${
        rows.length === 1 ? 'sm:max-w-sm' : rows.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
      }`}
    >
      {rows.map((row) => (
        <div
          key={row.key}
          className="border-t border-black/[0.06] pt-5 dark:border-white/[0.06] max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-t-0 max-md:px-4 max-md:py-3.5"
        >
          <dt className="shrink-0 text-[14px] text-neutral-600 dark:text-neutral-300">{row.label}</dt>
          <dd className="mt-1.5 text-[1.0625rem] font-medium leading-snug text-[#111111] dark:text-neutral-100 max-md:mt-0 max-md:min-w-0 max-md:text-right max-md:text-[15px]">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
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
      className="group flex items-center gap-4 border-t border-black/[0.06] pt-5 dark:border-white/[0.06] max-md:rounded-xl max-md:border max-md:border-[#DADDE1] max-md:p-4 max-md:active:bg-black/[0.03] dark:max-md:border-white/[0.16] dark:max-md:active:bg-white/[0.04]"
    >
      <NeutralIconBadge name={icon} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] text-neutral-600 dark:text-neutral-300 max-md:text-[13px]">{label}</p>
        <p className="mt-1 break-all text-[1.0625rem] font-medium leading-snug text-[#111111] underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-neutral-400 dark:text-white dark:group-hover:decoration-neutral-500 max-md:mt-0.5 max-md:text-[15px]">
          {value}
        </p>
      </div>
      <svg
        className="h-4 w-4 shrink-0 text-neutral-400 md:hidden"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
      </svg>
    </a>
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
      className="group flex w-full min-w-0 flex-col items-center gap-2.5 md:w-24"
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
      <span className="w-full truncate text-center text-[13px] font-medium text-neutral-800 dark:text-neutral-200 md:text-[14px]">
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
  const spokenLanguageNames = useMemo(
    () =>
      (profile.spokenLanguages ?? [])
        .map((item) => (typeof item === 'string' ? item : item?.name ?? '').trim())
        .filter(Boolean),
    [profile.spokenLanguages]
  );
  const legacyLanguages = profile.languages?.trim();
  const hasLanguages = spokenLanguageNames.length > 0 || Boolean(legacyLanguages);
  const hasLocation = Boolean(locationLabel?.trim());
  const memberSinceLabel = formatMemberSince(profile.memberSince);
  const hasGender = Boolean(profile.gender?.trim());
  const appRole = normalizeCreatorAppRole(profile.appRole);
  const showProviderSections = creatorShowsProviderAboutFields(appRole);
  const showCareerSections = creatorShowsCareerSections(appRole);

  const faqItems = profile.faqItems ?? [];
  const strengths = profile.strengthsToolsMastered ?? [];
  const stackItems =
    profile.profileStack ??
    (profile as { stack?: ProfileStrengthTool[] }).stack ??
    [];
  const skillTags = (profile.specialtyTags ?? []).map((tag) => tag.trim()).filter(Boolean);
  const allowedSpecialties = (profile.specialties ?? []).map((item) => item.trim()).filter(Boolean);
  const hasStrengths = showCareerSections && strengths.length > 0;
  const hasStack = showCareerSections && stackItems.length > 0;
  const hasSkillTags = showCareerSections && skillTags.length > 0 && !hasStack;
  const hasFaq = showProviderSections && faqItems.length > 0;
  const hasLinks = displayLinks.length > 0;
  const hasAboutMeta = hasGender || hasLanguages || memberSinceLabel;
  const hasProfileInfo = hasAboutMeta || hasLocation || hasStrengths || hasStack || hasSkillTags;
  const hasDirectContact = hasEmail || hasPhone;
  const hasAnyPublicInfo =
    hasProfileInfo || hasDirectContact || hasLinks || hasFaq;
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
        value: spokenLanguageNames.length > 0 ? spokenLanguageNames.join(', ') : legacyLanguages,
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
    spokenLanguageNames,
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
    if (hasFaq) items.push('faq');
    if (hasDirectContact) items.push('contact');
    if (hasLinks) items.push('links');
    return items;
  }, [hasAboutSection, hasFaq, hasDirectContact, hasLinks]);

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

  /* While a nav click is smooth-scrolling, the clicked item stays active instead of flickering
     through the sections in between. */
  const scrollLockRef = useRef<{ timer: number } | null>(null);
  const paged = useIsPagedLayout();
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (navItems.length === 0 || paged) return;
    let frame = 0;

    const compute = (scroller: Element | null) => {
      frame = 0;
      const sections = navItems
        .map((id) => ({ id, el: document.getElementById(PUBLIC_INFO_SECTION_DOM_ID[id]) }))
        .filter((item): item is { id: PublicInfoNavId; el: HTMLElement } => item.el != null);
      if (sections.length === 0) return;

      /* A section owns the nav from the moment its top crosses the reading line until the next
         one does — tall sections stay active for their whole height. */
      const readingLine = Math.max(140, window.innerHeight * 0.3);
      let current = sections[0].id;
      for (const { id, el } of sections) {
        if (el.getBoundingClientRect().top - readingLine <= 0) current = id;
      }

      const target = scroller ?? document.scrollingElement;
      const atBottom =
        target != null && target.scrollHeight - target.scrollTop - target.clientHeight < 4;
      const last = sections[sections.length - 1];
      if (atBottom && last.el.getBoundingClientRect().top < window.innerHeight) current = last.id;

      setActiveSection((prev) => (prev === current ? prev : current));
    };

    const onScroll = (event: Event) => {
      const lock = scrollLockRef.current;
      if (lock) {
        window.clearTimeout(lock.timer);
        lock.timer = window.setTimeout(() => {
          scrollLockRef.current = null;
        }, 140);
        return;
      }
      if (frame) return;
      const scroller =
        event.target instanceof Element ? event.target : document.scrollingElement;
      frame = window.requestAnimationFrame(() => compute(scroller));
    };

    frame = window.requestAnimationFrame(() => compute(null));
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onScroll as EventListener, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      document.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onScroll as EventListener);
    };
  }, [navItems, paged]);

  const selectSection = (sectionId: PublicInfoNavId) => {
    setActiveSection(sectionId);
    if (paged) {
      const nav = mobileNavRef.current;
      if (nav && nav.getBoundingClientRect().top < 0) {
        nav.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    const previous = scrollLockRef.current;
    if (previous) window.clearTimeout(previous.timer);
    scrollLockRef.current = {
      timer: window.setTimeout(() => {
        scrollLockRef.current = null;
      }, 900),
    };
    const el = document.getElementById(PUBLIC_INFO_SECTION_DOM_ID[sectionId]);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activePageIndex = activeSection ? navItems.indexOf(activeSection) : -1;
  const isPageHidden = (sectionId: PublicInfoNavId) => paged && activeSection !== sectionId;

  const onPageTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (!paged || navItems.length < 2) return;
    const touch = event.touches[0];
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onPageTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || activePageIndex < 0) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const next = activePageIndex + (dx < 0 ? 1 : -1);
    if (next >= 0 && next < navItems.length) selectSection(navItems[next]);
  };

  const renderNav = (layout: 'desktop' | 'mobile') => (
    <nav
      aria-label="Profile information sections"
      className={layout === 'desktop' ? 'flex min-h-0 flex-col' : 'flex'}
    >
      {layout === 'desktop' ? (
        <div className="flex h-14 shrink-0 items-center px-5 pt-2">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-600 dark:text-neutral-300">
            Information
          </p>
        </div>
      ) : null}
      <div
        className={
          layout === 'desktop'
            ? 'flex min-h-0 flex-col gap-1.5 overflow-y-auto px-2 pb-4 pt-1'
            : 'flex w-full items-center justify-around gap-2'
        }
      >
        {navItems.map((sectionId) => {
          const active = activeSection === sectionId;
          const label =
            PUBLIC_INFO_LABEL_OVERRIDES[sectionId] ?? getProfileSection(sectionId).label;
          const iconOnly = layout === 'mobile';
          return (
            <button
              key={sectionId}
              type="button"
              onClick={() => selectSection(sectionId)}
              aria-current={active ? 'true' : undefined}
              aria-label={iconOnly ? label : undefined}
              title={iconOnly ? label : undefined}
              className={`${NAV_BUTTON_BASE} ${
                iconOnly
                  ? `h-11 w-11 shrink-0 justify-center !rounded-full !px-0 ${
                      active ? 'bg-[#FF5722]/10 dark:bg-[#FF5722]/15' : ''
                    }`
                  : 'w-full py-3.5'
              } ${active ? NAV_BUTTON_ACTIVE : NAV_BUTTON_INACTIVE}`}
            >
              <ProfileSectionNavIcon sectionId={sectionId} active={active} />
              {iconOnly ? null : <span className="min-w-0 truncate">{label}</span>}
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
        <div className="py-20 text-center">
          <p className="text-[1.0625rem] text-neutral-500 dark:text-neutral-400">No public information yet.</p>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-10">
          {navItems.length > 0 ? (
            <div
              ref={mobileNavRef}
              className="scroll-mt-4 border-b border-[#DADDE1] pb-3 dark:border-white/[0.16] md:hidden"
            >
              {renderNav('mobile')}
            </div>
          ) : null}

          <div className="grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
            <div
              className="order-2 min-w-0 space-y-10 max-md:min-h-[45dvh] md:order-none md:col-start-1 md:row-start-1"
              onTouchStart={onPageTouchStart}
              onTouchEnd={onPageTouchEnd}
            >
              <InfoPanel>
                {hasAboutSection ? (
                  <InfoPanelSection
                    id={PUBLIC_INFO_SECTION_DOM_ID.about}
                    pageHidden={isPageHidden('about')}
                  >
                    <SectionHeading>Profile</SectionHeading>
                    {hasStack || hasSkillTags || hasStrengths ? (
                      <div
                        id={PUBLIC_INFO_SECTION_DOM_ID.strengths}
                        className="mb-10 scroll-mt-24 md:mb-14"
                      >
                        <PublicSkillsToolsGrouped
                          stack={stackItems}
                          skillTags={skillTags}
                          tools={strengths}
                          allowedSpecialties={allowedSpecialties}
                        />
                      </div>
                    ) : null}
                    {(hasLocation || profileFactRows.length > 0) && (
                      <div className="space-y-8 md:space-y-12">
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

                {hasFaq ? (
                  <InfoPanelSection
                    id={PUBLIC_INFO_SECTION_DOM_ID.faq}
                    framed
                    pageHidden={isPageHidden('faq')}
                  >
                    <SectionHeading meta={`${faqItems.length} ${faqItems.length > 1 ? 'questions' : 'question'}`}>
                      FAQ
                    </SectionHeading>
                    <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06] max-md:divide-[#DADDE1] max-md:border-y max-md:border-[#DADDE1] dark:max-md:divide-white/[0.12] dark:max-md:border-white/[0.16]">
                      {faqItems.map((item) => (
                        <details
                          key={item.id}
                          className="group py-6 first:pt-0 last:pb-0 max-md:py-4 max-md:first:pt-4 max-md:last:pb-4"
                        >
                          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left [&::-webkit-details-marker]:hidden max-md:items-center max-md:gap-4">
                            <span className="text-[1.0625rem] font-medium leading-snug text-[#111111] dark:text-white max-md:text-[15px]">
                              {item.question}
                            </span>
                            <span
                              className="mt-0.5 shrink-0 text-xl font-light leading-none text-neutral-400 transition group-open:rotate-45 dark:text-neutral-500 max-md:mt-0 max-md:flex max-md:h-7 max-md:w-7 max-md:items-center max-md:justify-center max-md:rounded-full max-md:bg-black/[0.05] max-md:text-lg max-md:text-[#111111] max-md:group-open:bg-[#FF5722]/10 max-md:group-open:text-[#FF5722] dark:max-md:bg-white/[0.08] dark:max-md:text-white"
                              aria-hidden
                            >
                              +
                            </span>
                          </summary>
                          <p className="mt-3 pr-10 text-[1rem] leading-[1.75] text-neutral-600 dark:text-neutral-300 max-md:mt-2.5 max-md:pr-11 max-md:text-[15px] max-md:leading-relaxed">
                            {item.answer}
                          </p>
                        </details>
                      ))}
                    </div>
                  </InfoPanelSection>
                ) : null}

                {hasDirectContact ? (
                  <InfoPanelSection
                    id={PUBLIC_INFO_SECTION_DOM_ID.contact}
                    framed
                    pageHidden={isPageHidden('contact')}
                  >
                    <SectionHeading>Contact</SectionHeading>
                    <div
                      className={`grid gap-x-10 gap-y-8 max-md:gap-3 ${directContacts.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-md'}`}
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
                  <InfoPanelSection
                    id={PUBLIC_INFO_SECTION_DOM_ID.links}
                    framed
                    pageHidden={isPageHidden('links')}
                  >
                    <SectionHeading meta={displayLinks.length}>Links</SectionHeading>
                    <div className="grid grid-cols-4 gap-x-2 gap-y-6 md:flex md:flex-wrap md:items-start md:gap-x-10 md:gap-y-8">
                      {displayLinks.map((link) => (
                        <UnifiedLinkIcon key={link.id} link={link} />
                      ))}
                    </div>
                  </InfoPanelSection>
                ) : null}
              </InfoPanel>

              {showMembersHint ? (
                <p className="border-t border-black/[0.06] pt-6 text-[1rem] text-neutral-600 dark:border-white/[0.06] dark:text-neutral-300">
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/providers/${creatorId}`)}`}
                    className="font-medium text-[#111111] underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500 dark:text-white dark:decoration-neutral-600"
                  >
                    Sign in
                  </Link>{' '}
                  to see additional member-only information.
                </p>
              ) : null}
            </div>

            {navItems.length > 0 ? (
              <ProfileSectionStickyAside
                className="w-[15.5rem] md:col-start-2 md:row-start-1"
                surfaceClassName={`flex w-full max-w-full min-w-0 flex-col overflow-hidden rounded-lg ${APP_FIELD} dark:bg-white/[0.06]`}
              >
                {renderNav('desktop')}
              </ProfileSectionStickyAside>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
