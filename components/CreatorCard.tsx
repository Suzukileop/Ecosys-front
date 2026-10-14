'use client';

import { localeTag } from '@/lib/i18n/active';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { usePresence } from '@/hooks/usePresence';
import { mediaImageSrc } from '@/lib/media-image-url';
import { formatDistanceAwayKm, nationalityLabel, normalizeNationalityCode } from '@/lib/countries';
import { formatPlaceLabel } from '@/lib/geolocation';
import { buildCreatorPortfolioPath } from '@/lib/portfolio-url';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';
import { formatHourlyRateAmount } from '@/lib/profile-services';
import type { ProfileServiceItem } from '@/types/profile';
import { useT } from '@/lib/i18n/I18nProvider';

const INK = 'text-[#0F1419] dark:text-[#E7E9EA]';
/* Dark secondary #8B98A5, not #71767B: on the #16181C card #71767B falls under AA (News does the same). */
const INK2 = 'text-[#536471] dark:text-[#8B98A5]';

/** Skills typed all lower-case ("spring boot") read as raw input next to "DevOps": capitalise them. */
function displaySkill(skill: string) {
  return skill === skill.toLowerCase() ? skill.charAt(0).toUpperCase() + skill.slice(1) : skill;
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.5 11.6c0 4.2-3.8 7.6-8.5 7.6a9.6 9.6 0 0 1-3.6-.7L3.5 20l1.4-3.6a7.1 7.1 0 0 1-1.4-4.8C3.5 7.4 7.3 4 12 4s8.5 3.4 8.5 7.6Z" />
    </svg>
  );
}

/** Ink disc with a check — "verified" without a brand colour. */
function VerifiedMark() {
  const t = useT();
  return (
    <span
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0F1419] text-white dark:bg-[#E7E9EA] dark:text-[#0F1419]"
      title={t('Verified provider')}
      aria-label={t('Verified provider')}
    >
      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

function NationalityFlag({ code }: { code: string }) {
  const t = useT();
  const iso2 = normalizeNationalityCode(code);
  if (!iso2) return null;
  const label = nationalityLabel(iso2) || iso2;
  return (
    <span className="inline-flex shrink-0 items-center" title={label} aria-label={t('Nationality: {label}', { label })}>
      <CountryFlag iso2={iso2} size="sm" />
    </span>
  );
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/*
 * No photo: a soft, desaturated gradient picked from the name (stable per provider), so a card without
 * a photo reads as designed rather than empty. Tones stay near-neutral to keep the page black & white.
 */
const FALLBACK_GRADIENTS = [
  'bg-gradient-to-br from-[#EEF2F6] to-[#D6DFE8] dark:from-[#1F2731] dark:to-[#12171D]',
  'bg-gradient-to-br from-[#F1EDF5] to-[#DDD5E8] dark:from-[#26212E] dark:to-[#16131C]',
  'bg-gradient-to-br from-[#ECF3EF] to-[#D3E3DA] dark:from-[#1C2722] dark:to-[#111815]',
  'bg-gradient-to-br from-[#F5F0EA] to-[#E6DCCF] dark:from-[#2A251F] dark:to-[#191612]',
  'bg-gradient-to-br from-[#EDF2F8] to-[#D4E0EE] dark:from-[#1D2533] dark:to-[#121720]',
  'bg-gradient-to-br from-[#F5EDEF] to-[#E6D5DA] dark:from-[#2B2024] dark:to-[#1A1416]',
] as const;

function fallbackGradientOf(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return FALLBACK_GRADIENTS[Math.abs(hash) % FALLBACK_GRADIENTS.length];
}

const FALLBACK_INITIALS_CLASS = 'font-semibold tracking-[0.02em] text-[#0F1419]/75 dark:text-[#E7E9EA]/85';

/** Round avatar (44px phones, 56px from sm): a 160px source covers both sizes on 2x screens. */
function CreatorCardAvatar({ avatarUrl, fullName }: { avatarUrl?: string | null; fullName: string }) {
  const resolved = resolveStorageMediaUrl(avatarUrl);
  const [failed, setFailed] = useState(false);

  if (!resolved || failed) {
    return (
      <span
        className={`flex h-full w-full items-center justify-center rounded-full text-[15px] sm:text-[17px] ${fallbackGradientOf(fullName)} ${FALLBACK_INITIALS_CLASS}`}
      >
        {initialsOf(fullName)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={mediaImageSrc(resolved, 160)}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-full w-full rounded-full object-cover object-[center_18%]"
    />
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
  /** Kept for callers (search); the card has one size now. */
  comfortable?: boolean;
  /** Kept for callers; phones get the same rounded card inside the page gutter. */
  flushOnMobile?: boolean;
  /** Kept for callers; the card no longer derives a price from services (hourly rate only). */
  services?: ProfileServiceItem[] | null;
  /** Provider hourly rate in cents — the card's price ("25 € / hour"), else "Rate on request". */
  hourlyRateCents?: number | null;
  hourlyRateCurrency?: string | null;
};

const MAX_SKILLS = 3;

/**
 * Provider row — a News-feed card (square, the module tone #F7F9F9 / #16181C, no outline) read like
 * Upwork / Malt results: one provider per line.
 *  - Left: a round 56px avatar (48px on phones) with the live "online" dot.
 *  - Top line: name · flag · verified on the left, the hourly rate on the right (the figure a client
 *    compares first, so it lines up down the list), then "specialty · place · distance".
 *  - One meta line ("4 stars · 19 yrs exp. · Available" — the word, not a lone ★, so a star count
 *    never reads as a 1-out-of-5 rating), a two-line bio, then skill chips with the actions on the
 *    same line: "Portfolio" as text, "Discuss" as an outlined pill — quiet, so a list of cards does
 *    not stack a column of loud buttons.
 * The whole card opens the profile (a stretched link on the name); the actions sit above it.
 */
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
  hourlyRateCents,
  hourlyRateCurrency,
}: CreatorCardProps) {
  const t = useT();
  const { user } = useAuth();
  const displayName = fullName?.trim() || 'Provider';
  const resolvedId = (id ?? userId ?? '').trim();
  /** Presence API keys off auth user id - prefer `userId` like Profiles search rows. */
  const presenceUserId = (userId ?? id ?? '').trim();
  const isOwnCard = Boolean(user?.id && resolvedId && user.id === resolvedId);
  const presenceIds = useMemo(() => (presenceUserId ? [presenceUserId] : []), [presenceUserId]);
  const { isOnline } = usePresence(presenceIds);
  const online = Boolean(presenceUserId) && isOnline(presenceUserId);
  const services = serviceCount ?? 0;
  const stars = Math.max(0, starCount ?? 0);
  const bioText = bio?.trim() || '';
  const hourlyRate = formatHourlyRateAmount(hourlyRateCents, hourlyRateCurrency);
  const placeLabel = formatPlaceLabel(locationCity, locationCountry, nationality);
  const distanceLabel = formatDistanceAwayKm(distanceKm);
  const profileHref = isOwnCard ? '/profile' : resolvedId ? `/providers/${resolvedId}` : null;
  const discussHref =
    !isOwnCard && resolvedId
      ? user
        ? `/messages?user=${encodeURIComponent(resolvedId)}`
        : `/login?redirect=${encodeURIComponent(`/messages?user=${encodeURIComponent(resolvedId)}`)}`
      : null;
  const portfolioHref = isOwnCard ? '/studio' : resolvedId ? buildCreatorPortfolioPath(resolvedId, username) : null;
  const specialtyChips =
    specialties.filter((item) => item.trim()).length > 0
      ? specialties.filter((item) => item.trim())
      : specialite?.trim()
        ? [specialite.trim()]
        : [];
  const primarySpecialty = specialtyChips[0] ?? '';
  const skills = Array.from(
    new Map(
      [...specialtyChips.slice(1), ...specialtyTags.filter((item) => item.trim())].map((item) => [item.toLowerCase(), item])
    ).values()
  );
  const shownSkills = skills.slice(0, MAX_SKILLS);
  const hiddenSkillCount = skills.length - shownSkills.length;

  const hasStars = stars > 0;
  const hasExperience = yearsOfExperience != null && yearsOfExperience > 0;
  const isNew = !hasStars && !hasExperience && services === 0 && !isVerified;
  const subtitle = [primarySpecialty, placeLabel, distanceLabel].filter(Boolean).join(' · ');

  /* The rate is the card's one price; providers without one read "Rate on request" so every row
     carries the same slot and the column of prices stays aligned. */
  const price = hourlyRate ? (
    <p className="shrink-0 whitespace-nowrap text-right leading-6">
      <span className={`text-[17px] font-bold tabular-nums tracking-[-0.01em] ${INK}`}>{hourlyRate}</span>
      <span className={`text-[13px] ${INK2}`}> {t('/ hour')}</span>
    </p>
  ) : (
    <p className={`shrink-0 whitespace-nowrap text-[13px] leading-6 ${INK2}`}>{t('Rate on request')}</p>
  );

  /* Trust, experience and availability in one quiet line. Colour stays on the availability dot. */
  const metaItems = [
    hasStars ? (
      <span key="stars" className="whitespace-nowrap">
        <span className={`font-semibold tabular-nums ${INK}`}>{stars.toLocaleString(localeTag())}</span>{' '}
        {t.plural(stars, 'star', 'stars')}
      </span>
    ) : null,
    hasExperience ? (
      <span key="experience" className="whitespace-nowrap">
        <span className={`font-semibold tabular-nums ${INK}`}>{yearsOfExperience}</span>{' '}
        {t.plural(yearsOfExperience, 'yr', 'yrs')} {t('exp.')}
      </span>
    ) : null,
    <span key="availability" className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-[#00BA7C]' : 'bg-[#8B98A5] dark:bg-[#536471]'}`} />
      {isAvailable ? t('Available') : t('Busy')}
    </span>,
  ].filter(Boolean);

  /* "Portfolio" as text, "Discuss" as an outlined pill (ink fill under the pointer); own card: "Your
     profile". 40px tall on phones (touch), 36px from sm. Above the card's stretched link. */
  const actions =
    portfolioHref || discussHref || profileHref ? (
      <div className="relative z-[1] flex shrink-0 items-center gap-1">
        {portfolioHref ? (
          <Link
            href={portfolioHref}
            aria-label={t('{displayName}\'s portfolio', { displayName })}
            className={`inline-flex h-10 items-center rounded-full px-3 text-[14px] font-semibold underline-offset-4 transition-colors hover:text-[#0F1419] hover:underline dark:hover:text-[#E7E9EA] sm:h-9 ${INK2}`}
          >
            {t('Portfolio')}
          </Link>
        ) : null}
        {discussHref ? (
          <Link
            href={discussHref}
            aria-label={t('Discuss with {displayName}', { displayName })}
            className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[#0F1419] hover:text-white hover:shadow-none active:bg-[#0F1419] active:text-white dark:shadow-[inset_0_0_0_1px_#536471] dark:hover:bg-[#EFF3F4] dark:hover:text-[#0F1419] dark:active:bg-[#EFF3F4] dark:active:text-[#0F1419] sm:h-9 ${INK}`}
          >
            <ChatIcon className="h-4 w-4" />
            {t('Discuss')}
          </Link>
        ) : profileHref ? (
          <Link
            href={profileHref}
            className={`inline-flex h-10 items-center rounded-full px-4 text-[14px] font-semibold shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[rgba(15,20,25,0.06)] dark:shadow-[inset_0_0_0_1px_#536471] dark:hover:bg-[rgba(231,233,234,0.1)] sm:h-9 ${INK}`}
          >
            {t('Your profile')}
          </Link>
        ) : null}
      </div>
    ) : null;

  return (
    /* The News card: square, the module tone, no outline — tone is the only edge. Under the pointer it
       steps one tone up, saying the whole card opens the profile. `!` on radius / fill: the theme's
       `.news-theme article` rule would round and repaint it.

       Phones (most of the audience) get a stacked, airy card on 20px gutters: avatar + identity on one
       line, then the meta line, the bio at full width, and a footer with the rate on the left and the
       actions on the right — no skill chips, no full-width filled button. From sm: the rate moves up to
       the identity line and the body sits under the name (indented by the avatar). */
    <article className="group/card relative flex flex-col !rounded-none !bg-[#F7F9F9] px-5 py-5 transition-colors duration-200 hover:!bg-[#EFF3F4] dark:!bg-[#16181C] dark:hover:!bg-[#1D1F23] sm:p-6">
      <div className="flex min-w-0 items-center gap-3 sm:items-start sm:gap-4">
        <div className="relative h-11 w-11 shrink-0 sm:h-14 sm:w-14">
          <div className="h-full w-full overflow-hidden rounded-full bg-[#EFF3F4] dark:bg-[#202327]">
            <CreatorCardAvatar avatarUrl={avatarUrl} fullName={displayName} />
          </div>
          {online ? (
            <span
              className="absolute -bottom-px -right-px h-3 w-3 rounded-full bg-[#00BA7C] ring-[3px] ring-[#F7F9F9] group-hover/card:ring-[#EFF3F4] dark:ring-[#16181C] dark:group-hover/card:ring-[#1D1F23] sm:h-3.5 sm:w-3.5"
              title={t('Online')}
              aria-label={t('Online')}
              role="status"
            />
          ) : null}
        </div>

        {/* Identity. The name is the card's link — its ::after covers the whole card. */}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            {profileHref ? (
              <Link
                href={profileHref}
                className={`min-w-0 truncate text-[16px] font-semibold leading-6 tracking-[-0.01em] outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-[#0F1419]/40 dark:focus-visible:after:ring-white/40 sm:text-[17px] ${INK}`}
              >
                {displayName}
              </Link>
            ) : (
              <span className={`min-w-0 truncate text-[16px] font-semibold leading-6 sm:text-[17px] ${INK}`}>{displayName}</span>
            )}
            {nationality ? <NationalityFlag code={nationality} /> : null}
            {isVerified ? <VerifiedMark /> : null}
            {isOwnCard ? <span className={`shrink-0 text-[13px] font-medium ${INK2}`}>{t('· You')}</span> : null}
            {isNew && !isOwnCard ? <span className={`shrink-0 text-[13px] font-medium ${INK2}`}>{t('· New')}</span> : null}
          </div>
          {subtitle ? <p className={`mt-0.5 truncate text-[14px] leading-5 ${INK2}`}>{subtitle}</p> : null}
        </div>

        <div className="hidden sm:block">{price}</div>
      </div>

      <div className="min-w-0 sm:pl-[72px]">
        <p className={`mt-4 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-5 sm:mt-2 ${INK2}`}>
          {metaItems.map((item, index) => (
            <span key={index} className="inline-flex items-center gap-x-2">
              {index > 0 ? <span aria-hidden>·</span> : null}
              {item}
            </span>
          ))}
        </p>

        {bioText ? (
          <p className={`mt-2 line-clamp-2 text-[15px] leading-[22px] sm:mt-3 sm:text-[14px] sm:leading-[21px] ${INK}`}>{bioText}</p>
        ) : null}

        {/* From sm: skill chips on the left, the actions on the right. */}
        {shownSkills.length > 0 || actions ? (
          <div className="mt-4 hidden flex-wrap items-center justify-between gap-x-4 gap-y-3 sm:flex">
            {shownSkills.length > 0 ? (
              <ul className="flex min-w-0 flex-wrap gap-1.5" aria-label={t('Skills')} title={skills.map(displaySkill).join(', ')}>
                {shownSkills.map((skill) => (
                  <li
                    key={skill}
                    className={`max-w-[12rem] truncate rounded-full bg-[#FFFFFF] px-2.5 py-0.5 text-[12px] font-medium leading-5 dark:bg-[#202327] ${INK}`}
                  >
                    {displaySkill(skill)}
                  </li>
                ))}
                {hiddenSkillCount > 0 ? (
                  <li className={`px-1 text-[12px] font-medium leading-5 ${INK2}`}>+{hiddenSkillCount}</li>
                ) : null}
              </ul>
            ) : (
              <span />
            )}
            <div className="ml-auto">{actions}</div>
          </div>
        ) : null}

        {/* Phones: the rate on the left, the actions on the right. */}
        <div className="mt-4 flex items-center justify-between gap-3 sm:hidden">
          <div className="min-w-0 [&>p]:text-left">{price}</div>
          <div className="-mr-1">{actions}</div>
        </div>
      </div>
    </article>
  );
}
