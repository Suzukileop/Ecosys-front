'use client';

import { localeTag } from '@/lib/i18n/active';
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
import { NeutralIconBadge } from '@/components/marketplace/creator-profile-social-icons';
import { PublicSkillsToolsGrouped } from '@/components/marketplace/PublicSkillsToolsGrouped';
import {
  geocodePlaceLabel,
  openStreetMapEmbedUrl,
  detectUserCoordinatesForDistance,
  computeReliableDistanceKm,
  distanceKmBetween,
} from '@/lib/geolocation';
import { geolocationAlreadyGranted, savedProfileLocation } from '@/lib/viewer-location';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceAwayKm } from '@/lib/countries';
import type { ProfileStrengthTool } from '@/types/profile';
import type { MarketplaceCreatorPublicProfile } from '@/types/marketplace';
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
import { useT } from '@/lib/i18n/I18nProvider';

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
  'flex items-center gap-3 px-3 text-left text-[15px] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black/15 dark:focus-visible:ring-white/25';
/* Black & white selection, as the News rail: the active row is bold ink, never a colour. */
const NAV_BUTTON_ACTIVE = 'font-bold text-[#0F1419] dark:text-[#E7E9EA]';
const NAV_BUTTON_INACTIVE =
  'font-medium text-[#0F1419] hover:bg-[rgba(15,20,25,0.06)] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)]';

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

export type InfoRow = {
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
  return date.toLocaleDateString(localeTag(), { month: 'long', year: 'numeric' });
}

export function resolveDisplayLinks(profile: MarketplaceCreatorPublicProfile) {
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
    <div className="mb-5 flex items-baseline justify-between gap-4 md:mb-6">
      <h3 className="text-[20px] font-extrabold tracking-[-0.015em] text-[#0F1419] dark:text-[#E7E9EA]">
        {children}
      </h3>
      {meta ? (
        <span className="shrink-0 text-[13px] text-[#536471] dark:text-[#71767B] md:hidden">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

function InfoPanel({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2 sm:gap-6">{children}</div>;
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
          ? /* A surface block: square, flat, edge to edge on phones. */
            'gn-card -mx-4 rounded-none bg-[#F7F9F9] px-4 py-6 dark:bg-[#16181C] sm:mx-0 sm:p-6 md:p-8'
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
  const t = useT();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [distanceLabel, setDistanceLabel] = useState<string | null>(null);
  const [distancePending, setDistancePending] = useState(false);
  const [geoDenied, setGeoDenied] = useState(false);
  const [mapImageFailed, setMapImageFailed] = useState(false);
  const [distanceEnabled, setDistanceEnabled] = useState(false);
  const distanceAbortRef = useRef<AbortController | null>(null);
  const { hasRole } = useAuth();
  const isCreator = hasRole('ROLE_CREATOR');

  /**
   * The device could not measure (desktop without GPS, timeout, permission not given yet): a signed-in
   * creator gets the distance from the location saved on their own profile, named so it is clear what
   * it is measured from. Same spot (their own profile) → no badge rather than "0 km".
   */
  const applyProfileDistance = useCallback(
    async (place: { lat: number; lng: number }) => {
      if (!isCreator) return false;
      const saved = await savedProfileLocation();
      if (!saved) return false;
      const km = distanceKmBetween(saved, place);
      if (!Number.isFinite(km) || km < 0.05) return false;
      const away = formatDistanceAwayKm(km);
      if (!away) return false;
      setDistanceLabel(`${away.replace(/ away$/, '')} from ${saved.placeLabel ?? 'your profile location'}`);
      setGeoDenied(false);
      setDistancePending(false);
      return true;
    },
    [isCreator]
  );

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
        if (!ok && !(await applyProfileDistance(place))) {
          setDistanceLabel(null);
          setDistancePending(false);
          setGeoDenied(true);
        }
      } catch (error) {
        if (isCancelled?.() || controller.signal.aborted) return;
        if (error instanceof Error && /cancelled/i.test(error.message)) return;
        if (await applyProfileDistance(place)) return;
        if (isCancelled?.() || controller.signal.aborted) return;
        setDistanceLabel(null);
        setGeoDenied(true);
        setDistancePending(false);
      }
    },
    [applyDistance, applyProfileDistance]
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
          /* Measure on load only when the browser answers without a prompt; otherwise use the
             viewer's profile location, or offer the "Show distance from you" button. */
          if (await geolocationAlreadyGranted()) {
            if (!cancelled) await resolveDistance(place, { isCancelled });
          } else if (!cancelled && !(await applyProfileDistance(place)) && !cancelled) {
            setGeoDenied(true);
          }
        }
        return;
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
      distanceAbortRef.current?.abort();
    };
  }, [applyProfileDistance, label, locationLat, locationLng, resolveDistance]);

  if (!coords) {
    return (
      <div className="flex items-center gap-4">
        <NeutralIconBadge name="location" size="sm" />
        <div className="min-w-0">
          <p className="text-[13px] text-[#536471] dark:text-[#71767B]">{t('Location')}</p>
          <p className="mt-0.5 text-[15px] font-semibold leading-5 text-[#0F1419] dark:text-[#E7E9EA]">
            {label}
          </p>
          {loading ? (
            <p className="mt-1 text-[13px] text-[#536471] dark:text-[#71767B]">{t('Loading map…')}</p>
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
      aria-label={distancePending ? t('Refreshing distance…') : t('Refresh distance')}
      title={distancePending ? t('Refreshing distance…') : t('Refresh distance')}
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
      <div className="relative -mx-4 h-60 overflow-hidden bg-[#EFF3F4] dark:bg-[#202327] sm:mx-0 sm:h-72 lg:h-80">
        {!mapImageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element -- external static map host
          <img
            src={staticMapUrl}
            alt={t('Map of {label}', { label })}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setMapImageFailed(true)}
          />
        ) : (
          <>
            {/* The embed's own attribution bar ("Report a problem · Make a donation …") is pushed
                below the clipped box; the licence-required credit is kept as one small link. */}
            <iframe
              title={t('Map of {label}', { label })}
              src={openStreetMapEmbedUrl(coords.lat, coords.lng)}
              className="absolute inset-x-0 top-0 h-[calc(100%+26px)] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-0 right-0 z-20 bg-white/80 px-1.5 py-0.5 text-[10px] leading-4 text-[#536471] hover:text-[#0F1419] dark:bg-black/70 dark:text-[#71767B] dark:hover:text-[#E7E9EA]"
            >
              {t('© OpenStreetMap')}
            </a>
          </>
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
            {t('Measuring distance…')}
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
            {t('Show distance from you')}
          </button>
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-4 pt-4">
        <div className="min-w-0">
          <p className="text-[13px] text-[#536471] dark:text-[#71767B]">
            {t('Location')}
            {distanceEnabled && distanceLabel ? (
              <span className="ml-1 inline-flex items-center gap-1 normal-case tracking-normal">
                · {distanceLabel}
                <button
                  type="button"
                  onClick={refreshDistance}
                  disabled={distancePending}
                  aria-label={t('Refresh distance')}
                  title={t('Refresh distance')}
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
          <p className="mt-0.5 truncate text-[15px] font-semibold leading-5 text-[#0F1419] dark:text-[#E7E9EA]">{label}</p>
        </div>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 shrink-0 items-center text-[14px] font-semibold text-[#0F1419] underline-offset-4 hover:underline dark:text-[#E7E9EA]"
        >
          {t('Open map')}
        </a>
      </div>
    </div>
  );
}

/** Label / value facts on one surface block (also My Profile's General Info read view). */
export function ProfileFactCards({ rows }: { rows: InfoRow[] }) {
  const t = useT();
  if (rows.length === 0) return null;
  return (
    <dl
      className={`gn-card -mx-4 grid gap-x-10 gap-y-4 rounded-none bg-[#F7F9F9] px-4 py-5 dark:bg-[#16181C] sm:mx-0 sm:p-6 ${
        rows.length === 1 ? '' : rows.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
      }`}
    >
      {rows.map((row) => (
        <div
          key={row.key}
          className="max-sm:flex max-sm:items-baseline max-sm:justify-between max-sm:gap-4"
        >
          <dt className="shrink-0 text-[13px] text-[#536471] dark:text-[#71767B]">{t(row.label)}</dt>
          <dd className="mt-0.5 text-[15px] font-semibold leading-5 text-[#0F1419] dark:text-[#E7E9EA] max-sm:mt-0 max-sm:min-w-0 max-sm:text-right">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function resolveLinkPlatform(link: {
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

export function linkDisplayLabel(
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

/** The FAQ as visitors read it: one disclosure per question (also My Profile's FAQ read view). */
export function PublicFaqList({ items }: { items: ReadonlyArray<{ id: string; question: string; answer: string }> }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <details key={item.id} className="group bg-[color:var(--gn-inset)] px-4 py-3 sm:px-5 sm:py-4">
          <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-4 text-left [&::-webkit-details-marker]:hidden">
            <span className="text-[15px] font-bold leading-5 text-[#0F1419] dark:text-[#E7E9EA]">{item.question}</span>
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl font-light leading-none text-[#0F1419] transition group-open:rotate-45 dark:text-[#E7E9EA]"
              aria-hidden
            >
              +
            </span>
          </summary>
          <p className="mt-2 pr-10 text-[15px] leading-[22px] text-[#536471] dark:text-[#71767B]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function CreatorProfileContactSection({
  creatorId,
  profile,
  isAuthenticated,
  locationLabel,
}: CreatorProfileContactSectionProps) {
  const t = useT();
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
  const hasAboutMeta = hasGender || hasLanguages || memberSinceLabel;
  const hasProfileInfo = hasAboutMeta || hasLocation || hasStrengths || hasStack || hasSkillTags;
  // Contact (email / phone) and Links now live as icons in the profile header, not here.
  const hasAnyPublicInfo = hasProfileInfo || hasFaq;
  const showMembersHint = !isAuthenticated && profile.membersOnlyContactAvailable;

  const profileFactRows = useMemo(() => {
    const rows: InfoRow[] = [];
    if (hasGender) {
      rows.push({ key: 'gender', label: t('Gender'), value: profile.gender });
    }
    if (hasLanguages) {
      rows.push({
        key: 'languages',
        label: t('Working languages'),
        value: spokenLanguageNames.length > 0 ? spokenLanguageNames.join(', ') : legacyLanguages,
      });
    }
    if (memberSinceLabel) {
      rows.push({ key: 'memberSince', label: t('Member since'), value: memberSinceLabel });
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

  const hasAboutSection = hasProfileInfo || hasStrengths || hasStack || hasSkillTags;

  const navItems = useMemo(() => {
    const items: PublicInfoNavId[] = [];
    if (hasAboutSection) items.push('about');
    if (hasFaq) items.push('faq');
    return items;
  }, [hasAboutSection, hasFaq]);

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
      aria-label={t('Profile information sections')}
      className={layout === 'desktop' ? 'flex min-h-0 flex-col' : 'flex'}
    >
      {layout === 'desktop' ? (
        <div className="flex shrink-0 items-center px-3 pb-2">
          <p className="gn-kicker">{t('Information')}</p>
        </div>
      ) : null}
      <div
        className={
          layout === 'desktop'
            ? 'flex min-h-0 flex-col gap-0.5 overflow-y-auto'
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
                      active ? 'bg-[#0F1419] !text-white dark:bg-[#EFF3F4] dark:!text-[#0F1419]' : ''
                    }`
                  : `min-h-10 w-full !rounded-md py-2 ${active ? 'bg-[#EFF3F4] dark:bg-[#27272A]' : ''}`
              } ${active ? NAV_BUTTON_ACTIVE : NAV_BUTTON_INACTIVE}`}
            >
              <ProfileSectionNavIcon sectionId={sectionId} active={active} inheritColor />
              {iconOnly ? null : <span className="min-w-0 flex-1 truncate">{label}</span>}
              {!iconOnly && active ? (
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );

  return (
    <section aria-labelledby="info-heading">
      <h2 id="info-heading" className="sr-only">
        {t('Public information')}
      </h2>

      {!hasAnyPublicInfo && !showMembersHint ? (
        <div className="py-20 text-center">
          <p className="text-[15px] text-[#536471] dark:text-[#71767B]">{t('No public information yet.')}</p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {navItems.length > 0 ? (
            <div
              ref={mobileNavRef}
              className="scroll-mt-4 pb-1 md:hidden"
            >
              {renderNav('mobile')}
            </div>
          ) : null}

          <div className="grid items-start gap-6">
            <div
              className="order-2 min-w-0 space-y-6 max-md:min-h-[45dvh] md:order-none md:col-start-1 md:row-start-1"
              onTouchStart={onPageTouchStart}
              onTouchEnd={onPageTouchEnd}
            >
              <InfoPanel>
                {hasAboutSection ? (
                  <InfoPanelSection
                    id={PUBLIC_INFO_SECTION_DOM_ID.about}
                    pageHidden={isPageHidden('about')}
                  >
                    <SectionHeading>{t('Profile')}</SectionHeading>
                    {hasStack || hasSkillTags || hasStrengths ? (
                      <div
                        id={PUBLIC_INFO_SECTION_DOM_ID.strengths}
                        className="mb-6 scroll-mt-24"
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
                      <div className="space-y-6">
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
                      {t('FAQ')}
                    </SectionHeading>
                    <PublicFaqList items={faqItems} />
                  </InfoPanelSection>
                ) : null}
              </InfoPanel>

              {showMembersHint ? (
                <p className="text-[15px] text-[#536471] dark:text-[#71767B]">
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/providers/${creatorId}`)}`}
                    className="font-semibold text-[#0F1419] underline underline-offset-4 dark:text-[#E7E9EA]"
                  >
                    {t('Sign in')}
                  </Link>{' '}
                  {t('to see additional member-only information.')}
                </p>
              ) : null}
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
