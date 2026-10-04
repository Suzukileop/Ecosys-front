'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AbbreviatedLine } from '@/components/ui/AbbreviatedLine';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { usePresence } from '@/hooks/usePresence';
import { mediaImageSrc } from '@/lib/media-image-url';
import {
  PROVIDER_FRAME_CLASS,
  PROVIDER_INK_CLASS,
  PROVIDER_LABEL_CLASS,
  ProviderSlashList,
  ProviderTextAction,
} from '@/components/marketplace/ProviderDirectoryPrimitives';
import { formatDistanceAwayKm, nationalityLabel, normalizeNationalityCode } from '@/lib/countries';
import { formatPlaceLabel } from '@/lib/geolocation';
import { buildCreatorPortfolioPath } from '@/lib/portfolio-url';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';

/** Stable 0-359 seed from the provider id - only ever drives geometry, never a fill colour. */
function seedFromId(id: string) {
  const s = id ?? '';
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * 17) % 360;
  return h;
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7.5A1.5 1.5 0 014.5 6h4l2 2.25h7A1.5 1.5 0 0119 9.75v7.5a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 013 17.25V7.5z"
      />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

const DISCUSS_BUTTON_CLASS =
  'inline-flex h-9 w-9 items-center justify-center gap-2 rounded-full text-[14px] font-medium text-[#111111] transition-colors duration-200 hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 dark:text-white dark:hover:bg-white/[0.06] sm:w-auto sm:px-3';

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.5 11.6c0 4.2-3.8 7.6-8.5 7.6a9.6 9.6 0 0 1-3.6-.7L3.5 20l1.4-3.6a7.1 7.1 0 0 1-1.4-4.8C3.5 7.4 7.3 4 12 4s8.5 3.4 8.5 7.6Z" />
      <path d="M8.6 11.7h.01M12 11.7h.01M15.4 11.7h.01" />
    </svg>
  );
}

function VerifiedMark() {
  return (
    <span
      className="inline-flex shrink-0 items-center text-[#FF5722]"
      title="Verified provider"
      aria-label="Verified provider"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

function NationalityFlag({ code }: { code: string }) {
  const iso2 = normalizeNationalityCode(code);
  if (!iso2) return null;
  const label = nationalityLabel(iso2) || iso2;
  return (
    <span className="inline-flex shrink-0 items-center" title={label} aria-label={`Nationality: ${label}`}>
      <CountryFlag iso2={iso2} size="sm" />
    </span>
  );
}

/**
 * The mineral wash every avatar slot sits on — a barely-there grey with a soft top light and a few
 * wireframe rules. `seed` only nudges the geometry, so two slots side by side are never identical.
 *
 * `bust` draws the abstract figure used when there is no usable photo at all. With it off, the
 * rings act as a quiet backdrop behind a medallion.
 */
function MineralGround({ seed, bust }: { seed: number; bust: boolean }) {
  const ringOffset = (seed % 14) - 7;
  const horizon = 104 + (seed % 9);

  return (
    <div className="absolute inset-0 bg-[#E3E2DF] dark:bg-neutral-800" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(255,255,255,0.65),transparent_70%)] dark:bg-[radial-gradient(120%_90%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]" />
      <svg
        viewBox="0 0 120 170"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full text-black/[0.16] dark:text-white/20"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
      >
        <line x1="0" y1={horizon} x2="120" y2={horizon} strokeOpacity="0.5" />
        <circle cx={60 + ringOffset} cy="66" r="42" strokeOpacity="0.4" />
        {bust ? (
          <>
            <circle cx="60" cy="62" r="21" />
            <path d="M22 168c0-23.2 17-40 38-40s38 16.8 38 40" strokeLinecap="round" />
            <path d="M60 83v45" strokeOpacity="0.45" strokeLinecap="round" />
          </>
        ) : null}
      </svg>
    </div>
  );
}

/** Below this, a source is too small to fill the slot without going soft — see `CreatorCardAvatar`. */
const AVATAR_COVER_MIN_WIDTH = 200;

/**
 * Avatar slot.
 *
 * Three presentations, picked from the source itself rather than from a URL pattern:
 *
 * - `cover` — a real photo, large enough to fill the slot.
 * - `medallion` — a source under {@link AVATAR_COVER_MIN_WIDTH}px. Provider accounts signed in
 *   through Google arrive with a 96px monogram tile; stretched across the slot that became a flat
 *   block of raw colour with a blurred letter in it — the single loudest thing on the page. Shown
 *   at its own size on the mineral ground, it reads as an identity mark instead, and any genuine
 *   low-res photo stops being upscaled into mush.
 * - `wireframe` — nothing usable: the abstract bust.
 */
function CreatorCardAvatar({
  avatarUrl,
  seed,
  compact = false,
}: {
  avatarUrl?: string | null;
  seed: number;
  /**
   * The 72px pill in the mobile row. `medallion` exists to stop a 96px monogram being blown up
   * across a 220–290px slot; at this size nothing is upscaled, so insetting the source would only
   * leave it floating on the ground texture.
   */
  compact?: boolean;
}) {
  const resolved = resolveStorageMediaUrl(avatarUrl);
  const [fit, setFit] = useState<'pending' | 'cover' | 'medallion' | 'none'>(resolved ? 'pending' : 'none');

  const onLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (compact) {
      setFit('cover');
      return;
    }
    const { naturalWidth, naturalHeight } = event.currentTarget;
    const smallest = Math.min(naturalWidth || 0, naturalHeight || 0);
    setFit(smallest >= AVATAR_COVER_MIN_WIDTH ? 'cover' : 'medallion');
  };

  return (
    <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-105">
      <MineralGround seed={seed} bust={fit === 'none'} />

      {resolved && fit !== 'none' ? (
        fit === 'medallion' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              /* Stays above AVATAR_COVER_MIN_WIDTH: the optimizer never upscales, so `onLoad`
                 still sees a small source as small and keeps this presentation. */
              src={mediaImageSrc(resolved, 256)}
              alt=""
              loading="lazy"
              decoding="async"
              onLoad={onLoad}
              onError={() => setFit('none')}
              className="h-[104px] max-h-[70%] w-[104px] max-w-[70%] rounded-full object-cover ring-1 ring-black/[0.06] dark:ring-white/10"
            />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            /*
             * One `src`, never a `srcSet`: for an image picked from `w` descriptors the HTML spec
             * scales the intrinsic size by the selected density, so `naturalWidth` reports the
             * CSS box, not the source. `onLoad` below needs the real source width — a 96px
             * monogram has to still read as 96. The optimizer never upscales, so this stays true.
             */
            src={mediaImageSrc(resolved, compact ? 256 : 640)}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={onLoad}
            onError={() => setFit('none')}
            className={`absolute inset-0 h-full w-full object-cover object-[center_18%] transition-opacity duration-500 ${
              fit === 'pending' ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )
      ) : null}
    </div>
  );
}

type CreatorCardProps = {
  /** Identifiant createur pour l'URL ; `userId` sert de repli si l'API ne renvoie que celui-ci. */
  id?: string;
  userId?: string;
  /** Unique public handle - used in portfolio URLs when present. */
  username?: string | null;
  fullName?: string;
  avatarUrl?: string | null;
  specialite: string | null;
  specialties?: string[];
  specialtyTags?: string[];
  bio?: string | null;
  isVerified: boolean;
  isAvailable?: boolean;
  serviceCount?: number;
  starCount?: number | null;
  nationality?: string | null;
  yearsOfExperience?: number | null;
  distanceKm?: number | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  /** Larger type for reading-first surfaces such as search results. */
  comfortable?: boolean;
  /** Square card that runs edge to edge on phones. */
  flushOnMobile?: boolean;
};

export function CreatorCard({
  id,
  userId,
  username,
  fullName,
  avatarUrl,
  specialite,
  specialties = [],
  specialtyTags = [],
  bio,
  isVerified,
  isAvailable = true,
  serviceCount,
  starCount,
  nationality,
  yearsOfExperience,
  distanceKm,
  locationCity,
  locationCountry,
  comfortable = false,
  flushOnMobile = false,
}: CreatorCardProps) {
  const { user } = useAuth();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsId = useId();
  const labelClass = comfortable ? 'text-[15px] font-medium' : PROVIDER_LABEL_CLASS;
  const nameSizeClass = comfortable ? 'text-[1.5rem]' : 'text-[1.25rem]';
  const metaSizeClass = comfortable ? 'text-[15px]' : 'text-[14px]';
  const bioSizeClass = comfortable ? 'text-base' : 'text-[15px]';
  const tagSizeClass = 'text-[14px]';
  const resolvedId = (id ?? userId ?? '').trim();
  /** Presence API keys off auth user id - prefer `userId` like Profiles search rows. */
  const presenceUserId = (userId ?? id ?? '').trim();
  const isOwnCard = Boolean(user?.id && resolvedId && user.id === resolvedId);
  const presenceIds = useMemo(() => (presenceUserId ? [presenceUserId] : []), [presenceUserId]);
  const { isOnline } = usePresence(presenceIds);
  const online = Boolean(presenceUserId) && isOnline(presenceUserId);
  const statusLabel = online ? 'Online' : 'Offline';
  const seed = seedFromId(resolvedId || 'unknown');
  const services = serviceCount ?? 0;
  const stars = Math.max(0, starCount ?? 0);
  const hasStars = stars > 0;
  const isNew = !hasStars && !isVerified && services === 0;
  const bioText = bio?.trim() || '';
  const distanceLabel = formatDistanceAwayKm(distanceKm);
  const placeLabel = formatPlaceLabel(locationCity, locationCountry, nationality);
  const profileHref = isOwnCard ? '/dashboard/creator?tab=profile' : resolvedId ? `/marketplace/${resolvedId}` : null;
  const servicesHref = isOwnCard
    ? '/dashboard/creator?tab=services'
    : resolvedId
      ? `/marketplace/${resolvedId}?tab=services`
      : null;
  const discussHref =
    !isOwnCard && resolvedId
      ? user
        ? `/dashboard/discussions?user=${encodeURIComponent(resolvedId)}`
        : `/login?redirect=${encodeURIComponent(`/dashboard/discussions?user=${encodeURIComponent(resolvedId)}`)}`
      : null;
  const discussLabel = fullName?.trim() ? `Discuss with ${fullName.trim()}` : 'Discuss';
  const portfolioHref = isOwnCard
    ? '/dashboard/portfolio'
    : resolvedId
      ? buildCreatorPortfolioPath(resolvedId, username)
      : null;
  const servicesLabel = services === 1 ? '1 service' : `${services} services`;
  const specialtyChips =
    specialties.filter((item) => item.trim()).length > 0
      ? specialties.filter((item) => item.trim())
      : specialite?.trim()
        ? [specialite.trim()]
        : [];
  const tagChips = specialtyTags.filter((item) => item.trim());

  /* One marker only, top-right, strongest signal first - experience beats novelty. Verification is
     not in this slot: it sits inline with the name, where it qualifies the person rather than the
     listing. */
  const marker =
    yearsOfExperience != null && yearsOfExperience >= 0
      ? yearsOfExperience === 1
        ? '1 year'
        : `${yearsOfExperience} years`
      : isNew
        ? 'New'
        : null;
  const experienceLabel =
    yearsOfExperience != null && yearsOfExperience >= 0
      ? `${yearsOfExperience} ${yearsOfExperience === 1 ? 'yr' : 'yrs'} exp.`
      : null;
  const primarySpecialty = specialtyChips[0] ?? '';
  /* Below `sm` only the identity block stays visible; everything else waits behind "Details". */
  const mobileDetailsClass = detailsOpen ? 'contents' : 'hidden sm:contents';

  return (
    <div className="flex h-full flex-col gap-2.5">
      <article
        className={`group/card flex h-full flex-1 flex-col overflow-hidden ${PROVIDER_FRAME_CLASS} max-sm:border-0 ${flushOnMobile ? 'max-sm:rounded-none max-sm:!border-y max-sm:!border-[#DADDE1] max-sm:!bg-transparent dark:max-sm:!border-white/[0.16]' : ''} transition-colors duration-200 hover:border-black/[0.12] sm:min-h-[300px] md:min-h-[280px] md:flex-row md:items-stretch dark:hover:border-white/[0.16]`}
      >
        <div
          className={`relative hidden w-full shrink-0 overflow-hidden sm:block md:h-auto md:self-stretch ${
            comfortable ? 'h-[260px] md:w-[290px]' : 'h-[240px] md:w-[220px]'
          }`}
        >
          <CreatorCardAvatar avatarUrl={avatarUrl} seed={seed} />
        </div>

        <div
          className={`flex min-h-0 min-w-0 flex-1 flex-col ${
            comfortable ? 'px-3 py-4 sm:p-8 md:p-9 lg:p-10' : 'px-3 py-4 sm:p-7 lg:p-8'
          }`}
        >
          <div className="flex items-center gap-4 sm:hidden">
            <div className="relative h-[72px] w-[72px] shrink-0">
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <CreatorCardAvatar avatarUrl={avatarUrl} seed={seed} compact />
              </div>
              {online ? (
                <span
                  className="absolute bottom-[5px] right-[5px] h-2 w-2 rounded-full bg-emerald-500/90 ring-[1.5px] ring-white dark:ring-[#111111]"
                  title={statusLabel}
                  aria-label={statusLabel}
                  role="status"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <AbbreviatedLine
                as="h3"
                text={fullName ?? 'Provider'}
                href={profileHref}
                textClassName={`text-[17px] font-semibold leading-snug tracking-[-0.01em] ${PROVIDER_INK_CLASS}`}
                after={
                  nationality || isVerified ? (
                    <>
                      {nationality ? <NationalityFlag code={nationality} /> : null}
                      {isVerified ? <VerifiedMark /> : null}
                    </>
                  ) : null
                }
              />
              {primarySpecialty ? (
                <AbbreviatedLine
                  as="p"
                  text={primarySpecialty}
                  className="mt-1"
                  textClassName="text-[14px] text-neutral-600 dark:text-neutral-300"
                />
              ) : null}
              {experienceLabel || hasStars || isNew ? (
                <p className="mt-1 flex items-center gap-3 text-[13px] tabular-nums text-neutral-500 dark:text-neutral-400">
                  {experienceLabel ? (
                    <span>{experienceLabel}</span>
                  ) : isNew ? (
                    <span className="text-[#FF5722]">New</span>
                  ) : null}
                  {hasStars ? (
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${PROVIDER_INK_CLASS}`}
                      aria-label={`${stars} trust ${stars === 1 ? 'star' : 'stars'}`}
                    >
                      <StarIcon className="h-3.5 w-3.5 text-[#FF5722]" />
                      {stars.toLocaleString('en-US')}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>
          </div>

          <div className="hidden items-start justify-between gap-5 sm:flex">
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              {profileHref ? (
                <Link href={profileHref} className="min-w-0 focus-visible:outline-none">
                  <h3
                    className={`${nameSizeClass} font-semibold leading-tight tracking-tight ${PROVIDER_INK_CLASS} transition-colors duration-200 hover:text-[#FF5722]`}
                  >
                    {fullName ?? 'Provider'}
                  </h3>
                </Link>
              ) : (
                <h3
                  className={`min-w-0 ${nameSizeClass} font-semibold leading-tight tracking-tight ${PROVIDER_INK_CLASS}`}
                >
                  {fullName ?? 'Provider'}
                </h3>
              )}
              {nationality ? <NationalityFlag code={nationality} /> : null}
              {isVerified ? <VerifiedMark /> : null}
              {presenceUserId && !comfortable ? (
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    online ? 'bg-emerald-500' : 'bg-black/15 dark:bg-white/20'
                  }`}
                  title={statusLabel}
                  aria-label={statusLabel}
                  role="status"
                />
              ) : null}
            </div>

            {hasStars ? (
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 text-[15px] font-semibold tabular-nums ${PROVIDER_INK_CLASS}`}
                aria-label={`${stars} trust ${stars === 1 ? 'star' : 'stars'}`}
              >
                <StarIcon className="h-4 w-4 text-[#FF5722]" />
                {stars.toLocaleString('en-US')}
              </span>
            ) : marker ? (
              <span
                className={`shrink-0 ${labelClass} tabular-nums ${
                  marker === 'New' ? 'text-[#FF5722]' : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {marker}
              </span>
            ) : null}
          </div>

          <div id={detailsId} className={mobileDetailsClass}>
            <div
              className={`mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 ${metaSizeClass} text-neutral-500 dark:text-neutral-400`}
            >
              {servicesHref ? (
                <Link
                  href={servicesHref}
                  className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-[#FF5722]"
                >
                  <FolderIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                  <span>{servicesLabel}</span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <FolderIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                  <span>{servicesLabel}</span>
                </span>
              )}
              {placeLabel ? (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <PinIcon className="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
                  <span className="truncate">{placeLabel}</span>
                </span>
              ) : null}
              {isAvailable ? null : (
                <span className={`${labelClass} text-neutral-400 dark:text-neutral-500`}>Unavailable</span>
              )}
            </div>

            {bioText ? (
              <p className={`mt-5 max-w-[52ch] ${bioSizeClass} leading-[1.75] text-neutral-600 dark:text-neutral-400`}>
                {bioText}
              </p>
            ) : null}

            {specialtyChips.length > 0 || tagChips.length > 0 ? (
              <div className="mt-auto space-y-1.5 pt-6">
                {specialtyChips.length > 0 ? (
                  <ProviderSlashList
                    items={specialtyChips}
                    className={`${labelClass} leading-relaxed text-[#111111]/85 dark:text-white/85`}
                  />
                ) : null}
                {tagChips.length > 0 ? (
                  <ProviderSlashList
                    items={tagChips}
                    className={`${tagSizeClass} leading-relaxed text-neutral-500 dark:text-neutral-400`}
                  />
                ) : null}
              </div>
            ) : (
              <div className="mt-auto" />
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-black/[0.06] pt-4 dark:border-white/[0.06] sm:mt-6 sm:pt-5">
            <ProviderTextAction
              href={portfolioHref}
              disabled={!portfolioHref}
              icon={<ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover/act:translate-x-0.5" />}
              className="max-sm:text-[14px]"
            >
              Portfolio
            </ProviderTextAction>
            <span className={detailsOpen ? 'inline-flex' : 'hidden sm:inline-flex'}>
              <ProviderTextAction href={servicesHref} disabled={!servicesHref} className="max-sm:text-[14px]">
                View service
              </ProviderTextAction>
            </span>
            <button
              type="button"
              onClick={() => setDetailsOpen((open) => !open)}
              aria-expanded={detailsOpen}
              aria-controls={detailsId}
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-neutral-500 transition-colors hover:text-[#111111] focus-visible:outline-none dark:text-neutral-400 dark:hover:text-white sm:hidden"
            >
              {detailsOpen ? 'Less' : 'Details'}
              <ChevronIcon className={`h-4 w-4 transition-transform duration-300 ${detailsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOwnCard ? null : discussHref ? (
              <Link
                href={discussHref}
                title={discussLabel}
                aria-label={discussLabel}
                className={`${DISCUSS_BUTTON_CLASS} ml-auto ${comfortable ? 'sm:ml-0' : ''}`}
              >
                <ChatIcon className="h-[18px] w-[18px]" />
                <span className="hidden sm:inline">Discuss</span>
              </Link>
            ) : (
              <span
                aria-disabled
                aria-label="Discuss"
                className={`${DISCUSS_BUTTON_CLASS} pointer-events-none ml-auto opacity-35 ${comfortable ? 'sm:ml-0' : ''}`}
              >
                <ChatIcon className="h-[18px] w-[18px]" />
                <span className="hidden sm:inline">Discuss</span>
              </span>
            )}
            {presenceUserId && comfortable ? (
              <span
                role="status"
                className={`ml-auto hidden items-center gap-2 sm:inline-flex ${labelClass} ${
                  online ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400 dark:text-neutral-500'
                }`}
              >
                <span
                  aria-hidden
                  className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-black/20 dark:bg-white/25'}`}
                />
                {statusLabel}
              </span>
            ) : null}
          </div>
        </div>
      </article>

      {distanceLabel ? (
        <p
          className={`shrink-0 pl-1 ${detailsOpen ? '' : 'hidden sm:block'} ${labelClass} leading-none text-neutral-500 dark:text-neutral-400`}
        >
          {distanceLabel}
        </p>
      ) : null}
    </div>
  );
}
