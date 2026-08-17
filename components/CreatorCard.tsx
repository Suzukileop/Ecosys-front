'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { usePresence } from '@/hooks/usePresence';
import { formatDistanceAwayKm, nationalityLabel, normalizeNationalityCode } from '@/lib/countries';
import { formatPlaceLabel } from '@/lib/geolocation';
import { buildCreatorPortfolioPath } from '@/lib/portfolio-url';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hueFromId(id: string) {
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
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white shadow-sm"
      title="Verified creator"
      aria-label="Verified creator"
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

function RatingBadge({ rating }: { rating: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-orange-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
      <StarIcon className="h-3 w-3" />
      {rating.toFixed(1)}
    </span>
  );
}

function NewBadge() {
  return (
    <span className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-400">
      New
    </span>
  );
}

function NationalityFlag({ code }: { code: string }) {
  const iso2 = normalizeNationalityCode(code);
  if (!iso2) return null;
  const label = nationalityLabel(iso2) || iso2;
  return (
    <span
      className="inline-flex shrink-0 items-center"
      title={label}
      aria-label={`Nationality: ${label}`}
    >
      <CountryFlag iso2={iso2} size="sm" />
    </span>
  );
}

function YearsExperienceBadge({ years }: { years: number }) {
  const label = years === 1 ? '1 year' : `${years} years`;
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold tabular-nums text-neutral-700 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
      title={label}
      aria-label={label}
    >
      {label}
    </span>
  );
}

function CreatorCardAvatar({
  avatarUrl,
  fullName,
  hue,
}: {
  avatarUrl?: string | null;
  fullName?: string;
  hue: number;
}) {
  const resolved = resolveStorageMediaUrl(avatarUrl);
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(resolved) && !failed;

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_18%]"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white"
      style={{ backgroundColor: `hsl(${hue} 55% 42%)` }}
      aria-hidden
    >
      {initialsFromName(fullName ?? '')}
    </div>
  );
}

const tertiaryActionClass =
  'inline-flex items-center rounded-lg px-1 py-1 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100';

/** Portfolio CTA in the Service Provider footer. */
const portfolioSideFrameClass =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40';

const primaryActionClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40';

type CreatorCardProps = {
  /** Identifiant créateur pour l’URL ; `userId` sert de repli si l’API ne renvoie que celui-ci. */
  id?: string;
  userId?: string;
  fullName?: string;
  avatarUrl?: string | null;
  specialite: string | null;
  specialties?: string[];
  specialtyTags?: string[];
  bio?: string | null;
  isVerified: boolean;
  isAvailable?: boolean;
  serviceCount?: number;
  averageRating?: number | null;
  nationality?: string | null;
  yearsOfExperience?: number | null;
  distanceKm?: number | null;
  locationCity?: string | null;
  locationCountry?: string | null;
};

export function CreatorCard({
  id,
  userId,
  fullName,
  avatarUrl,
  specialite,
  specialties = [],
  specialtyTags = [],
  bio,
  isVerified,
  isAvailable = true,
  serviceCount,
  averageRating,
  nationality,
  yearsOfExperience,
  distanceKm,
  locationCity,
  locationCountry,
}: CreatorCardProps) {
  const { user } = useAuth();
  const resolvedId = (id ?? userId ?? '').trim();
  /** Presence API keys off auth user id — prefer `userId` like Profiles search rows. */
  const presenceUserId = (userId ?? id ?? '').trim();
  const isOwnCard = Boolean(user?.id && resolvedId && user.id === resolvedId);
  const presenceIds = useMemo(
    () => (presenceUserId ? [presenceUserId] : []),
    [presenceUserId]
  );
  const { isOnline } = usePresence(presenceIds);
  const online = Boolean(presenceUserId) && isOnline(presenceUserId);
  const statusLabel = online ? 'Online' : 'Offline';
  const hue = hueFromId(resolvedId || 'unknown');
  const services = serviceCount ?? 0;
  const hasRating = averageRating !== null && averageRating !== undefined;
  const isNew = !hasRating && !isVerified && services === 0;
  const bioText = bio?.trim() || '';
  const distanceLabel = formatDistanceAwayKm(distanceKm);
  const placeLabel = formatPlaceLabel(locationCity, locationCountry, nationality);
  const profileHref = resolvedId ? `/marketplace/${resolvedId}` : null;
  const servicesHref = resolvedId ? `/marketplace/${resolvedId}?tab=services` : null;
  const discussHref =
    !isOwnCard && resolvedId
      ? user
        ? `/dashboard/discussions?user=${encodeURIComponent(resolvedId)}`
        : `/login?redirect=${encodeURIComponent(`/dashboard/discussions?user=${encodeURIComponent(resolvedId)}`)}`
      : null;
  const discussLabel = fullName?.trim() ? `Discuss with ${fullName.trim()}` : 'Discuss';
  const portfolioHref = resolvedId ? buildCreatorPortfolioPath(resolvedId) : null;
  const servicesLabel =
    services === 1 ? '1 service disponible' : `${services} services disponibles`;
  const specialtyChips =
    specialties.filter((item) => item.trim()).length > 0
      ? specialties.filter((item) => item.trim())
      : specialite?.trim()
        ? [specialite.trim()]
        : [];
  const tagChips = specialtyTags.filter((item) => item.trim());

  return (
    <div className="flex h-full flex-col gap-2">
      <article
        className={`flex min-h-[280px] flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md dark:bg-neutral-900 md:min-h-[220px] md:flex-row md:items-stretch ${
          isAvailable
            ? 'border-white hover:border-orange-200 dark:border-neutral-800 dark:hover:border-orange-500/30'
            : 'border-white opacity-90 hover:border-gray-200 dark:border-neutral-800'
        }`}
      >
        <div className="relative h-[180px] w-full shrink-0 overflow-hidden rounded-t-2xl md:h-auto md:w-[220px] md:self-stretch md:rounded-t-none md:rounded-l-2xl">
          <CreatorCardAvatar avatarUrl={avatarUrl} fullName={fullName} hue={hue} />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col p-4 pb-6 pl-5 md:p-5 md:pb-7 md:pl-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                {profileHref ? (
                  <Link href={profileHref} className="min-w-0 truncate">
                    <h3 className="truncate text-lg font-bold text-gray-900 transition hover:text-orange-600 dark:text-white dark:hover:text-orange-300">
                      {fullName ?? 'Creator'}
                    </h3>
                  </Link>
                ) : (
                  <h3 className="min-w-0 truncate text-lg font-bold text-gray-900 dark:text-white">
                    {fullName ?? 'Creator'}
                  </h3>
                )}
                {nationality ? <NationalityFlag code={nationality} /> : null}
                {presenceUserId ? (
                  <span
                    className={
                      online
                        ? 'ml-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500'
                        : 'ml-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500'
                    }
                    title={statusLabel}
                    aria-label={statusLabel}
                    role="status"
                  />
                ) : null}
              </div>
            </div>
            {yearsOfExperience != null && yearsOfExperience >= 0 ? (
              <YearsExperienceBadge years={yearsOfExperience} />
            ) : hasRating ? (
              <RatingBadge rating={averageRating} />
            ) : isVerified ? (
              <VerifiedBadge />
            ) : isNew ? (
              <NewBadge />
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {servicesHref ? (
              <Link
                href={servicesHref}
                className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-orange-600 dark:text-neutral-400 dark:hover:text-orange-300"
              >
                <FolderIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                <span>{servicesLabel}</span>
              </Link>
            ) : (
              <p className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                <FolderIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                <span>{servicesLabel}</span>
              </p>
            )}
            {placeLabel ? (
              <p className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                <PinIcon className="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
                <span className="truncate">{placeLabel}</span>
              </p>
            ) : null}
          </div>

          <div className="mt-3 min-h-[4.5rem]">
            {bioText ? (
              <p className="line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {bioText}
              </p>
            ) : null}
          </div>

          {(specialtyChips.length > 0 || tagChips.length > 0) ? (
            <div className="mt-auto space-y-1.5 pt-4">
              {specialtyChips.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {specialtyChips.map((label) => (
                    <span
                      key={label}
                      className="inline-flex rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-medium text-orange-800 dark:bg-orange-500/10 dark:text-orange-300"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
              {tagChips.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {tagChips.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-auto" />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              {servicesHref ? (
                <Link href={servicesHref} className={tertiaryActionClass}>
                  View service
                </Link>
              ) : (
                <span className={`${tertiaryActionClass} pointer-events-none opacity-50`}>
                  View service
                </span>
              )}
              {portfolioHref ? (
                <Link href={portfolioHref} className={portfolioSideFrameClass}>
                  Portfolio
                </Link>
              ) : (
                <span className={`${portfolioSideFrameClass} pointer-events-none opacity-50`}>
                  Portfolio
                </span>
              )}
            </div>
            {isOwnCard ? null : discussHref ? (
              <Link
                href={discussHref}
                title={discussLabel}
                aria-label={discussLabel}
                className={primaryActionClass}
              >
                <FontAwesomeIcon icon={faComment} className="h-3.5 w-3.5" />
                Discuss
              </Link>
            ) : (
              <span className={`${primaryActionClass} pointer-events-none opacity-50`}>
                <FontAwesomeIcon icon={faComment} className="h-3.5 w-3.5" />
                Discuss
              </span>
            )}
          </div>
        </div>
      </article>

      {distanceLabel ? (
        <p className="shrink-0 pl-1 text-sm font-medium leading-none text-neutral-500 dark:text-neutral-400">
          {distanceLabel}
        </p>
      ) : null}
    </div>
  );
}
