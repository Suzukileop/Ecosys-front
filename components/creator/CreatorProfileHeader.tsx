'use client';

import { localeTag, tr, trPlural } from '@/lib/i18n/active';
import Link from 'next/link';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  CREATOR_PROFILE_SUBSCRIBERS_LABEL,
  resolveShowSubscriberCount,
  type CreatorProfileHeaderProps,
} from '@/components/creator/creator-profile-header-types';
import { normalizeCreatorAppRole } from '@/lib/creator-app-role';
import { MediaImage } from '@/components/ui/MediaImage';
import { collapseRepeatedBio } from '@/lib/profile-bio';
import { nationalityLabel, normalizeNationalityCode } from '@/lib/countries';
import { parseSpecialtyList } from '@/lib/specialties';
import { resolveAvailabilityStatusLabel } from '@/lib/availability-status';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { useT } from '@/lib/i18n/I18nProvider';

export const CREATOR_PROFILE_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

/*
 * The header follows the News design (X palette, black & white): no block of its own — it sits
 * straight on the page ground (#FFF / #000), no fill, no outline, no shadow; spacing separates things. Phones get an X-style compact hero (72px avatar beside the name) so the
 * profile's content starts on the first screen. Colours are hard-coded (not `.news-theme` tokens)
 * because the public profile renders this header outside that scope.
 */
/** The page ground the header sits on — the online dot's cut-out ring takes this tone. */
const GROUND_RING = 'ring-[#FFFFFF] dark:ring-[#000000]';
const INK = 'text-[#0F1419] dark:text-[#E7E9EA]';
const INK2 = 'text-[#536471] dark:text-[#71767B]';
const INK3 = 'text-[#8B98A5] dark:text-[#536471]';

function headerSpecialties(props: Pick<CreatorProfileHeaderProps, 'specialties' | 'specialite'>): string[] {
  return parseSpecialtyList(props.specialties, props.specialite).map((label) => tr(label));
}

/** Primary specialties, "DevOps / Developer". */
function ProfileHeaderSpecialtyBlock(props: Pick<CreatorProfileHeaderProps, 'specialties' | 'specialite'>) {
  const specialties = headerSpecialties(props);
  if (specialties.length === 0) return null;

  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-medium leading-5 ${INK}`}>
      {specialties.map((label, index) => (
        <span key={label} className="inline-flex items-center gap-2">
          {index > 0 ? (
            <span aria-hidden className={`font-normal ${INK3}`}>
              /
            </span>
          ) : null}
          {label}
        </span>
      ))}
    </p>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ProfileAvatar({
  fullName,
  avatarUrl,
  editable,
  uploadingAvatar,
  onAvatarPick,
  shape = 'circle',
  online = false,
}: {
  fullName: string;
  avatarUrl: string | null;
  editable?: boolean;
  uploadingAvatar?: boolean;
  onAvatarPick?: () => void;
  /** Square reads as a brand mark (shop logo) rather than a person. */
  shape?: 'circle' | 'square';
  /** Kept for callers; the header avatar no longer draws a role ring. */
  appRole?: CreatorProfileHeaderProps['appRole'];
  /** Green "online" dot on the avatar's lower-right edge. */
  online?: boolean;
}) {
  const t = useT();
  const radius = shape === 'square' ? 'rounded-2xl' : 'rounded-full';
  // The bare photo: no ring around it (only a focus ring on the owner's upload button).
  const ringShellClass = `relative block aspect-square w-full ${radius}`;
  const onlineDot = online ? (
    <span
      aria-label={t('Online')}
      title={t('Online')}
      role="status"
      className={`pointer-events-none absolute z-[1] h-4 w-4 rounded-full bg-[#00BA7C] ring-4 ${GROUND_RING} sm:h-5 sm:w-5 ${
        shape === 'square' ? '-bottom-1 -right-1' : 'bottom-[7%] right-[7%]'
      }`}
    />
  ) : null;

  const mediaClass = `h-full w-full overflow-hidden ${radius} bg-[#EFF3F4] dark:bg-[#202327]`;

  const avatarInner = (
    <MediaImage
      src={avatarUrl}
      widths={[256, 384, 640]}
      sizes="(min-width: 640px) 220px, 96px"
      priority
      referrerPolicy="no-referrer"
      fallback={
        <div
          className={`flex h-full w-full items-center justify-center bg-[#EFF3F4] text-xl font-bold dark:bg-[#202327] sm:text-4xl ${INK}`}
        >
          {initials(fullName)}
        </div>
      }
      className="h-full w-full object-cover"
    />
  );

  if (!editable) {
    return (
      <div className={ringShellClass}>
        <div className={mediaClass}>{avatarInner}</div>
        {onlineDot}
      </div>
    );
  }

  /* The owner's photo is itself the "Change profile photo" button: a camera veil appears on hover and
     on keyboard focus. Touch screens have no hover, so there a small camera badge stays on the photo's
     lower-left edge to say it can be tapped (the owner view draws no online dot). While a new photo
     uploads, the veil holds a spinner and the button is busy rather than dimmed. */
  return (
    <button
      type="button"
      onClick={onAvatarPick}
      disabled={uploadingAvatar}
      aria-busy={uploadingAvatar || undefined}
      className={`group relative ${ringShellClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1419] focus-visible:ring-offset-4 focus-visible:ring-offset-white disabled:cursor-progress dark:focus-visible:ring-[#E7E9EA] dark:focus-visible:ring-offset-black`}
      aria-label={uploadingAvatar ? t('Uploading profile photo') : t('Change profile photo')}
      title={uploadingAvatar ? undefined : t('Change profile photo')}
    >
      <div className={`relative ${mediaClass}`}>
        {avatarInner}
        {uploadingAvatar ? (
          <span className={`absolute inset-0 flex items-center justify-center ${radius} bg-black/55 text-white`}>
            <LoadingSpinner size="sm" />
          </span>
        ) : (
          <span
            aria-hidden
            className={`absolute inset-0 flex items-center justify-center ${radius} bg-black/0 text-white opacity-0 transition duration-150 group-hover:bg-black/45 group-hover:opacity-100 group-focus-visible:bg-black/45 group-focus-visible:opacity-100`}
          >
            <CameraIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
        )}
      </div>
      {!uploadingAvatar ? (
        <span
          aria-hidden
          className={`pointer-events-none absolute z-[1] hidden h-7 w-7 items-center justify-center rounded-full bg-[#0F1419] text-white ring-2 ${GROUND_RING} [@media(hover:none)]:flex dark:bg-[#EFF3F4] dark:text-[#0F1419] ${
            shape === 'square' ? '-bottom-1 -left-1' : 'bottom-[4%] left-[4%]'
          }`}
        >
          <CameraIcon className="h-3.5 w-3.5" />
        </span>
      ) : null}
      {onlineDot}
    </button>
  );
}

/** Live presence for visitors. The owner gets no dot: telling yourself you are online says nothing. */
function avatarOnline(props: CreatorProfileHeaderProps): boolean {
  return props.editable ? false : Boolean(props.isOnline);
}

const formatCount = (value: number) => new Intl.NumberFormat(localeTag()).format(Math.max(0, value));

/*
 * `starCount` is a count, not a rating: any signed-in member can give an account one "trust star" and
 * take it back, GitHub-style (backend CreatorStarService → countByCreator_Id). There are no reviews or
 * averages behind it. "4 ★ / Stars" read as a four-star rating, so the glyph now leads the figure
 * (★ 4, GitHub's star counter) and the label says who gave them; the tooltip spells it out. Same
 * wording for the owner and for visitors — it is the same figure.
 */
const memberStarsLabel = (count: number) => trPlural(count, 'Member star', 'Member stars');
const memberStarsTitle = (count: number) =>
  trPlural(count, 'Starred by {count} member', 'Starred by {count} members', { count: formatCount(count) });

/** The three "drawers" of the stats column: a big figure (or place) over a secondary label. */
function HeaderStatsColumn(props: CreatorProfileHeaderProps) {
  const t = useT();
  const showSubscribers = resolveShowSubscriberCount(props);
  const starCount = Math.max(0, props.starCount ?? 0);
  const [place, ...rest] = (props.locationLabel ?? '').split(',').map((part) => part.trim()).filter(Boolean);
  const region = rest.join(', ');

  const cell = 'flex min-w-0 flex-col justify-center gap-0.5 py-3 lg:py-4';
  const figure = `truncate text-[22px] font-extrabold leading-7 tabular-nums tracking-[-0.01em] ${INK}`;
  const label = `truncate text-[13px] leading-[18px] ${INK2}`;
  const subscribers = (
    <>
      <span className={figure}>{formatCount(props.followerCount)}</span>
      <span className={label}>{t(CREATOR_PROFILE_SUBSCRIBERS_LABEL)}</span>
    </>
  );

  /*
   * Phones / tablets: three equal columns under the bio, split by 1px vertical rules. From lg: a
   * column on the block's right, the three drawers stacked and split by 1px horizontal rules — the
   * one place the owner wants lines inside the header.
   */
  return (
    <dl className="grid grid-cols-3 divide-x divide-[#CFD9DE] dark:divide-[#2F3336] lg:grid-cols-1 lg:divide-x-0 lg:divide-y [&>div]:px-3 first:[&>div]:pl-0 lg:[&>div]:px-0">
      {showSubscribers ? (
        <div className={cell}>
          <dt className="sr-only">{t(CREATOR_PROFILE_SUBSCRIBERS_LABEL)}</dt>
          <dd className="flex min-w-0 flex-col gap-0.5">
            {props.profileSubscribersHref ? (
              <Link href={props.profileSubscribersHref} className="flex min-w-0 flex-col gap-0.5 hover:underline focus-visible:underline focus-visible:outline-none">
                {subscribers}
              </Link>
            ) : (
              subscribers
            )}
          </dd>
        </div>
      ) : null}
      <div className={cell} title={memberStarsTitle(starCount)}>
        <dt className="sr-only">{memberStarsLabel(starCount)}</dt>
        <dd className="flex min-w-0 flex-col gap-0.5">
          <span className={`inline-flex items-center gap-1.5 ${figure}`}>
            <StarGlyph className="h-4 w-4 shrink-0" />
            {formatCount(starCount)}
          </span>
          <span className={label}>{memberStarsLabel(starCount)}</span>
        </dd>
      </div>
      <div className={cell}>
        <dt className="sr-only">{t('Location')}</dt>
        <dd className="flex min-w-0 flex-col gap-0.5">
          <span className={`inline-flex min-w-0 items-center gap-1 text-[14px] font-bold leading-7 sm:gap-1.5 sm:text-[17px] ${INK}`}>
            <PinIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{place || t('Not set')}</span>
          </span>
          <span className={label}>{region || t('Location')}</span>
        </dd>
      </div>
    </dl>
  );
}

/** X green — the one colour in the header: "Available for hire" reads as a live status. */
const AVAILABLE_GREEN = 'text-[#00BA7C]';

/** The bio clamped to three lines with an inline "more" (Instagram / X), only when it overflows. */
function ExpandableBio({ text, lines = 3, className = '' }: { text: string; lines?: 2 | 3; className?: string }) {
  const t = useT();
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const measure = () => setOverflows(el.scrollHeight - el.clientHeight > 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  return (
    <div className={className}>
      <p
        ref={ref}
        className={`whitespace-pre-line break-words text-[14px] leading-5 ${expanded ? '' : lines === 2 ? 'line-clamp-2' : 'line-clamp-3'} ${INK}`}
      >
        {text}
      </p>
      {overflows && !expanded ? (
        <button type="button" onClick={() => setExpanded(true)} className={`mt-0.5 text-[14px] font-semibold ${INK2}`}>
          {t('more')}
        </button>
      ) : null}
    </div>
  );
}

/**
 * Phones (< sm), Facebook-style: one centred column with room around it — a large avatar, the name,
 * the specialties as a quiet subtitle, one stats line, one info line (availability · place), a
 * two-line bio, then a single row of filled actions. Email, contact, links, star… are not stacked
 * here; they sit behind those actions.
 */
function MobileProfileHeader(props: CreatorProfileHeaderProps) {
  const t = useT();
  const bio = collapseRepeatedBio(props.bio) || null;
  const status = resolveAvailabilityStatusLabel(props.isAvailable, props.availabilityLabel);
  const showSubscribers = resolveShowSubscriberCount(props);
  const starCount = Math.max(0, props.starCount ?? 0);
  const location = props.locationLabel?.trim();
  const specialties = headerSpecialties(props);
  const actions = props.mobileActions ?? props.trailingActions;
  const figure = `font-bold tabular-nums ${INK}`;

  const subscribers = (
    <>
      <span className={figure}>{formatCount(props.followerCount)}</span>{' '}
      {trPlural(props.followerCount, 'subscriber', 'subscribers')}
    </>
  );

  return (
    <div className="flex flex-col items-center text-center sm:hidden">
      <div className="w-[104px]">
        <ProfileAvatar
          fullName={props.fullName}
          avatarUrl={props.avatarUrl}
          editable={props.editable}
          uploadingAvatar={props.uploadingAvatar}
          onAvatarPick={props.onAvatarPick}
          appRole={props.appRole}
          online={avatarOnline(props)}
        />
      </div>

      <div className="mt-3.5 flex max-w-full items-center justify-center gap-2">
        <h1 className={`min-w-0 break-words text-[22px] font-extrabold leading-7 tracking-[-0.015em] ${INK}`}>
          {props.fullName}
        </h1>
        <NameBadges {...props} />
      </div>
      {specialties.length > 0 ? (
        <p className={`mt-0.5 text-[15px] leading-5 ${INK2}`}>{specialties.join(' · ')}</p>
      ) : null}

      <p className={`mt-3 flex flex-wrap items-center justify-center gap-x-1.5 text-[14px] leading-5 ${INK2}`}>
        {showSubscribers ? (
          <>
            {props.profileSubscribersHref ? (
              <Link href={props.profileSubscribersHref} className="active:opacity-70">
                {subscribers}
              </Link>
            ) : (
              <span>{subscribers}</span>
            )}
            <span aria-hidden>·</span>
          </>
        ) : null}
        <span className="inline-flex items-center gap-1" title={memberStarsTitle(starCount)}>
          <StarGlyph className="h-3.5 w-3.5" />
          <span className={figure}>{formatCount(starCount)}</span>
          {memberStarsLabel(starCount).toLowerCase()}
        </span>
      </p>

      {status || location ? (
        <p className={`mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] leading-[18px] ${INK2}`}>
          {status ? (
            <span className={`inline-flex items-center gap-1.5 font-semibold ${props.isAvailable ? AVAILABLE_GREEN : ''}`}>
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${props.isAvailable ? 'bg-[#00BA7C]' : 'bg-[#8B98A5] dark:bg-[#536471]'}`}
              />
              {t(status)}
            </span>
          ) : null}
          {location ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <PinIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{location}</span>
            </span>
          ) : null}
        </p>
      ) : null}

      {bio ? <ExpandableBio text={bio} lines={2} className="mt-3 max-w-[22rem]" /> : null}

      {actions ? <div className="mt-5 flex w-full items-stretch gap-2">{actions}</div> : null}
    </div>
  );
}

function HorizontalProfileHeader(props: CreatorProfileHeaderProps) {
  const t = useT();
  const bioPreview = collapseRepeatedBio(props.bio) || null;
  const status = resolveAvailabilityStatusLabel(props.isAvailable, props.availabilityLabel);

  /*
   * Phones get their own compact tree (MobileProfileHeader). From sm: a large avatar on the left,
   * identity in the middle, the stats as a 3-column strip under the bio; from lg the stats become a
   * column of three stacked drawers on the right.
   */
  return (
    <div className={headerSurfaceClass(props)}>
      <MobileProfileHeader {...props} />
      <div
        className={`hidden grid-cols-[96px_minmax(0,1fr)] items-center gap-x-4 gap-y-4 sm:grid sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-x-8 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-x-10 ${
          // Rail-aligned: no surface padding any more, so the stats column is the rail's own 20rem
          // with the same gaps as the layout below (lg 2rem, xl 3rem) — both columns share its edges.
          props.railAligned && !props.flat
            ? 'lg:grid-cols-[14rem_minmax(0,1fr)_20rem] lg:gap-x-8 xl:gap-x-12'
            : 'lg:grid-cols-[14rem_minmax(0,1fr)_11rem]'
        }`}
      >
        <div className="col-start-1 row-start-1 sm:row-span-2 sm:self-center">
          <ProfileAvatar
            fullName={props.fullName}
            avatarUrl={props.avatarUrl}
            editable={props.editable}
            uploadingAvatar={props.uploadingAvatar}
            onAvatarPick={props.onAvatarPick}
            appRole={props.appRole}
            online={avatarOnline(props)}
          />
        </div>

        <div className="col-start-2 row-start-1 min-w-0 sm:self-end">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
            <h1
              className={`min-w-0 break-words text-[20px] font-extrabold leading-6 tracking-[-0.015em] sm:text-[28px] sm:leading-8 md:text-[32px] md:leading-[38px] ${INK}`}
            >
              {props.fullName}
            </h1>
            <NameBadges {...props} />
            {props.nameActions ? <span className="ml-1 inline-flex items-center gap-1.5">{props.nameActions}</span> : null}
          </div>
          {props.handle ? (
            <p className={`mt-0.5 truncate text-[14px] leading-5 sm:mt-1 sm:text-[15px] ${INK2}`}>{props.handle}</p>
          ) : null}
        </div>

        <div className="col-span-2 flex min-w-0 flex-col gap-3 sm:col-span-1 sm:col-start-2 sm:row-start-2 sm:mt-3 sm:self-start">
          {status ? (
            <p className="text-[14px] leading-5">
              <span className={`inline-flex items-center gap-1.5 font-semibold ${props.isAvailable ? AVAILABLE_GREEN : INK2}`}>
                <span
                  aria-hidden
                  className={`h-2 w-2 rounded-full ${props.isAvailable ? 'bg-[#00BA7C]' : 'bg-[#8B98A5] dark:bg-[#536471]'}`}
                />
                {t(status)}
              </span>
            </p>
          ) : null}

          <ProfileHeaderSpecialtyBlock specialties={props.specialties} specialite={props.specialite} />

          {bioPreview ? (
            <p className={`max-w-2xl text-[15px] leading-[22px] line-clamp-3 sm:line-clamp-none ${INK}`}>{bioPreview}</p>
          ) : null}

          <div className="lg:hidden">
            <HeaderStatsColumn {...props} />
          </div>

          {props.headerLinks ? <div className="pt-1">{props.headerLinks}</div> : null}

          {props.trailingActions ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">{props.trailingActions}</div>
          ) : null}
        </div>

        <div className="hidden lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:block lg:self-center">
          <HeaderStatsColumn {...props} />
        </div>
      </div>
    </div>
  );
}

function headerSurfaceClass(props: CreatorProfileHeaderProps): string {
  if (props.flat) return '';
  // No fill: the header's edges are the page frame's, so the avatar lines up with the content below.
  // My Profile (rail-aligned) closes the open header with one bottom hairline, nothing else.
  return `px-5 pb-6 pt-5 sm:px-0 sm:pb-8 sm:pt-6${props.railAligned ? ' gn-rail-under sm:pb-10' : ''}`;
}

function NameBadges(props: CreatorProfileHeaderProps) {
  const t = useT();
  const iso2 = normalizeNationalityCode(props.nationality);
  const label = iso2 ? nationalityLabel(iso2) || iso2 : null;
  return (
    <>
      {iso2 ? (
        <span
          className="inline-flex shrink-0 items-center"
          title={label ?? undefined}
          aria-label={t('Nationality: {label}', { label })}
        >
          <CountryFlag iso2={iso2} size="md" />
        </span>
      ) : null}
      {props.isVerified ? (
        <span
          className={`rounded-full border border-[#CFD9DE] px-2.5 py-0.5 text-[12px] font-semibold leading-4 dark:border-[#536471] ${INK}`}
        >
          {t('Verified')}
        </span>
      ) : null}
    </>
  );
}

/** Stars stay brand orange (the header's one accent besides the green status), whatever the ink. */
function StarGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={`${className ?? ''} !text-[#FF5722]`} fill="currentColor">
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
    </svg>
  );
}

function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

/** Square page-level primary (the News "Publish a post" button). */
const HEADER_PRIMARY_LINK =
  'group inline-flex h-10 items-center gap-2 bg-[#0F1419] px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#272C30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1419]/40 focus-visible:ring-offset-2 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]';

/** Seller — storefront presentation: brand mark, shop tagline, categories and commerce metrics. */
function SellerProfileHeader(props: CreatorProfileHeaderProps) {
  const t = useT();
  const bio = collapseRepeatedBio(props.bio) || null;
  const categories = headerSpecialties(props);
  const showSubscribers = resolveShowSubscriberCount(props);
  const starCount = Math.max(0, props.starCount ?? 0);
  const metricValue = `text-[22px] font-extrabold leading-none tracking-[-0.02em] tabular-nums ${INK}`;
  const metricLabel = `text-[14px] ${INK2}`;
  const metrics: Array<{
    key: string;
    value: ReactNode;
    label: string;
    href?: string;
  }> = [
    {
      key: 'products',
      value: formatCount(props.productCount),
      label: trPlural(props.productCount, 'product', 'products'),
    },
    {
      key: 'stars',
      value: (
        <span className="inline-flex items-center gap-1.5" title={memberStarsTitle(starCount)}>
          <StarGlyph className={`h-4 w-4 ${INK2}`} />
          {formatCount(starCount)}
        </span>
      ),
      label: memberStarsLabel(starCount).toLowerCase(),
    },
    ...(showSubscribers
      ? [
          {
            key: 'subscribers',
            value: formatCount(props.followerCount),
            label: trPlural(props.followerCount, 'subscriber', 'subscribers'),
            href: props.profileSubscribersHref,
          },
        ]
      : []),
  ];

  return (
    <div className={headerSurfaceClass(props)}>
      <div className="flex flex-col gap-5 sm:gap-8 md:flex-row md:items-stretch md:gap-12">
        <div className="w-20 shrink-0 self-start sm:w-48 lg:w-56">
          <ProfileAvatar
            shape="square"
            fullName={props.fullName}
            avatarUrl={props.avatarUrl}
            editable={props.editable}
            uploadingAvatar={props.uploadingAvatar}
            onAvatarPick={props.onAvatarPick}
            appRole={props.appRole}
            online={avatarOnline(props)}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-6 sm:gap-8">
          <div>
            <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] ${INK2}`}>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 bg-[#0F1419] dark:bg-[#E7E9EA]" />
                {t('Official shop')}
              </span>
              {props.locationLabel ? (
                <span className="text-[13px] font-normal normal-case tracking-normal">{props.locationLabel}</span>
              ) : null}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className={`text-[24px] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[40px] lg:text-[48px] ${INK}`}>
                {props.fullName}
              </h1>
              <NameBadges {...props} />
            </div>

            {bio ? (
              <p className={`mt-3 line-clamp-3 max-w-2xl text-[15px] leading-[22px] sm:line-clamp-2 ${INK}`}>{bio}</p>
            ) : null}

            {categories.length > 0 ? (
              <p className={`mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-semibold ${INK}`}>
                {categories.map((label, index) => (
                  <span key={label} className="inline-flex items-center gap-3">
                    {index > 0 ? (
                      <span aria-hidden className={`font-normal ${INK3}`}>
                        /
                      </span>
                    ) : null}
                    {label}
                  </span>
                ))}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-3 sm:gap-x-10">
              {metrics.map((metric) => {
                const content = (
                  <>
                    <dd className={metricValue}>{metric.value}</dd>
                    <dt className={metricLabel}>{t(metric.label)}</dt>
                  </>
                );
                return metric.href ? (
                  <Link
                    key={metric.key}
                    href={metric.href}
                    className="flex items-baseline gap-2 underline-offset-4 hover:underline"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={metric.key} className="flex items-baseline gap-2">
                    {content}
                  </div>
                );
              })}
            </dl>

            {props.shopHref || props.trailingActions ? (
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {props.trailingActions}
                {props.shopHref ? (
                  <Link href={props.shopHref} className={HEADER_PRIMARY_LINK}>
                    {props.shopLabel ?? t('Visit shop')}
                    <ArrowGlyph className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/** RH / Recruiter / Client — portrait on the left, name and a hiring brief (needs, base, trust). */
function RecruiterProfileHeader(props: CreatorProfileHeaderProps) {
  const t = useT();
  const bio = collapseRepeatedBio(props.bio) || null;
  const needs = headerSpecialties(props);
  const showSubscribers = resolveShowSubscriberCount(props);
  const starCount = Math.max(0, props.starCount ?? 0);
  const rowLabel = `text-[14px] ${INK2}`;
  const rowValue = `min-w-0 text-[15px] font-medium ${INK}`;

  const rows: Array<{ key: string; label: string; value: ReactNode }> = [];
  if (needs.length > 0) {
    rows.push({
      key: 'needs',
      label: t('Looking for'),
      value: (
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {needs.map((label, index) => (
            <span key={label} className="inline-flex items-center gap-3">
              {index > 0 ? (
                <span aria-hidden className={INK3}>
                  /
                </span>
              ) : null}
              {label}
            </span>
          ))}
        </span>
      ),
    });
  }
  if (props.locationLabel) {
    rows.push({ key: 'base', label: t('Based in'), value: props.locationLabel });
  }
  rows.push({
    key: 'trust',
    label: t('Trust'),
    value: (
      <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="inline-flex items-center gap-1.5" title={memberStarsTitle(starCount)}>
          <StarGlyph className={`h-3.5 w-3.5 ${INK2}`} />
          {formatCount(starCount)} {memberStarsLabel(starCount).toLowerCase()}
        </span>
        {showSubscribers ? (
          props.profileSubscribersHref ? (
            <Link href={props.profileSubscribersHref} className="underline-offset-4 hover:underline">
              {formatCount(props.followerCount)} {trPlural(props.followerCount, 'subscriber', 'subscribers')}
            </Link>
          ) : (
            <span>
              {formatCount(props.followerCount)} {trPlural(props.followerCount, 'subscriber', 'subscribers')}
            </span>
          )
        ) : null}
      </span>
    ),
  });

  return (
    <div className={headerSurfaceClass(props)}>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-12 lg:gap-14">
        <div className="relative w-24 shrink-0 self-start sm:w-48 md:self-center lg:w-56">
          <ProfileAvatar
            fullName={props.fullName}
            avatarUrl={props.avatarUrl}
            editable={props.editable}
            uploadingAvatar={props.uploadingAvatar}
            onAvatarPick={props.onAvatarPick}
            appRole={props.appRole}
            online={avatarOnline(props)}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className={`text-[24px] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[40px] ${INK}`}>
              {props.fullName}
            </h1>
            <NameBadges {...props} />
          </div>

          {bio ? (
            <p className={`mt-3 line-clamp-3 max-w-2xl text-[15px] leading-[22px] sm:line-clamp-2 ${INK}`}>{bio}</p>
          ) : null}

          <dl className="mt-5 grid max-w-2xl gap-2.5">
            {rows.map((row) => (
              <div key={row.key} className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-4 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
                <dt className={rowLabel}>{t(row.label)}</dt>
                <dd className={rowValue}>{row.value}</dd>
              </div>
            ))}
          </dl>

          {props.trailingActions ? <div className="mt-5 flex flex-wrap gap-2">{props.trailingActions}</div> : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Profile header by role — the classic avatar-left layout for members, students and freelancers,
 * a storefront for sellers and a hiring card for recruiters / clients.
 */
export function CreatorProfileHeader(props: CreatorProfileHeaderProps) {
  switch (normalizeCreatorAppRole(props.appRole)) {
    case 'SELLER':
      return <SellerProfileHeader {...props} />;
    case 'RH_RECRUITER':
      return <RecruiterProfileHeader {...props} />;
    default:
      return <HorizontalProfileHeader {...props} />;
  }
}
