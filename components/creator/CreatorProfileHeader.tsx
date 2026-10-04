'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  CREATOR_PROFILE_SUBSCRIBERS_LABEL,
  resolveShowSubscriberCount,
  type CreatorProfileHeaderProps,
} from '@/components/creator/creator-profile-header-types';
import { ProfileVisitStat } from '@/components/creator/ProfileVisitStat';
import { creatorAppRoleRingClass, normalizeCreatorAppRole, type CreatorAppRole } from '@/lib/creator-app-role';
import { mediaImageResponsive } from '@/lib/media-image-url';
import { collapseRepeatedBio } from '@/lib/profile-bio';
import { nationalityLabel, normalizeNationalityCode } from '@/lib/countries';
import { parseSpecialtyList } from '@/lib/specialties';
import { resolveAvailabilityStatusLabel } from '@/lib/availability-status';
import { CountryFlag } from '@/components/ui/CountryFlag';

export type { CreatorProfileHeaderProps } from '@/components/creator/creator-profile-header-types';

export const CREATOR_PROFILE_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

function headerSpecialties(props: Pick<CreatorProfileHeaderProps, 'specialties' | 'specialite'>): string[] {
  return parseSpecialtyList(props.specialties, props.specialite);
}

/** Primary specialties inside the header card (previous placement). */
export function ProfileHeaderSpecialtyBlock(props: Pick<CreatorProfileHeaderProps, 'specialties' | 'specialite'>) {
  const specialties = headerSpecialties(props);
  if (specialties.length === 0) return null;

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[16px] font-medium text-[#111111] dark:text-neutral-100">
      {specialties.map((label, index) => (
        <span key={label} className="inline-flex items-center gap-2">
          {index > 0 ? (
            <span aria-hidden className="text-neutral-300 dark:text-neutral-600">
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
  appRole,
  editable,
  uploadingAvatar,
  onAvatarPick,
  shape = 'circle',
  ringless = false,
}: {
  fullName: string;
  avatarUrl: string | null;
  appRole?: CreatorAppRole | null;
  editable?: boolean;
  uploadingAvatar?: boolean;
  onAvatarPick?: () => void;
  /** Square reads as a brand mark (shop logo) rather than a person. */
  shape?: 'circle' | 'square';
  ringless?: boolean;
}) {
  const radius = shape === 'square' ? 'rounded-3xl' : 'rounded-full';
  const ringColorClass = creatorAppRoleRingClass(appRole)
    .replace('ring-sky-500', 'ring-sky-500/90')
    .replace('ring-red-500', 'ring-red-500/90')
    .replace('ring-violet-500', 'ring-violet-500/90')
    .replace('ring-yellow-400', 'ring-yellow-400/95')
    .replace('ring-gray-400', 'ring-gray-400/85');
  const ringShellClass = ringless
    ? `aspect-square w-full ${radius} ring-1 ring-black/[0.06] dark:ring-white/[0.1]`
    : [
        `aspect-square w-full ${radius}`,
        'ring-2 ring-offset-4 sm:ring-offset-[6px]',
        'ring-offset-white dark:ring-offset-[#111111]',
        'transition-all duration-200',
        ringColorClass,
      ].join(' ');

  const mediaClass = `h-full w-full overflow-hidden ${radius} bg-neutral-100 shadow-sm dark:bg-neutral-800`;

  const avatarInner = avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...mediaImageResponsive(avatarUrl, [256, 384, 640])}
      sizes="(min-width: 640px) 220px, 140px"
      alt=""
      decoding="async"
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-3xl font-semibold text-[#111111] dark:bg-neutral-800 dark:text-white sm:text-4xl">
      {initials(fullName)}
    </div>
  );

  if (!editable) {
    return (
      <div className={ringShellClass}>
        <div className={mediaClass}>{avatarInner}</div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAvatarPick}
      disabled={uploadingAvatar}
      className={`group relative ${ringShellClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-60`}
      aria-label="Change profile photo"
    >
      <div className={`relative ${mediaClass}`}>
        {avatarInner}
        <span
          className={`absolute inset-0 flex items-center justify-center ${radius} bg-black/0 transition group-hover:bg-black/45`}
        >
          <CameraIcon className="h-7 w-7 text-white opacity-0 transition group-hover:opacity-100" />
        </span>
        {uploadingAvatar ? (
          <span className={`absolute inset-0 flex items-center justify-center ${radius} bg-black/50`}>
            <LoadingSpinner size="sm" />
          </span>
        ) : null}
      </div>
    </button>
  );
}

function HorizontalProfileHeader(props: CreatorProfileHeaderProps) {
  const bioPreview = collapseRepeatedBio(props.bio) || null;
  const showSubscribers = resolveShowSubscriberCount(props);
  const starCount = Math.max(0, props.starCount ?? 0);
  const flat = Boolean(props.flat);
  const statValueClass = 'text-[2rem] font-bold leading-none tracking-[-0.02em] text-[#111111] dark:text-white';
  const statLabelClass = 'mt-2 text-[15px] font-normal text-neutral-500 dark:text-neutral-400';
  const statCellClass = 'flex flex-1 flex-col items-center justify-center px-2 py-4 text-center';

  const stats = (
    <div className="flex h-full w-full flex-row divide-x divide-black/[0.06] dark:divide-white/[0.08] sm:flex-col sm:divide-x-0 sm:divide-y">
      {showSubscribers ? (
        <div className={statCellClass}>
          <ProfileVisitStat
            value={props.followerCount}
            label={CREATOR_PROFILE_SUBSCRIBERS_LABEL}
            href={props.profileSubscribersHref}
            className="flex flex-col items-center"
            valueClassName={statValueClass}
            labelClassName={statLabelClass}
          />
        </div>
      ) : null}
      <div className={statCellClass}>
        <p className={statValueClass}>{new Intl.NumberFormat('en-US').format(starCount)}</p>
        <p className={`${statLabelClass} inline-flex items-center gap-1.5`}>
          <svg aria-hidden viewBox="0 0 20 20" className="h-3.5 w-3.5 text-amber-400" fill="currentColor">
            <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
          </svg>
          {starCount === 1 ? 'Star' : 'Stars'}
        </p>
      </div>
    </div>
  );

  return (
    <div
      className={
        flat
          ? ''
          : `border-y border-black/[0.06] !bg-white px-5 py-7 max-sm:border-[#DADDE1] dark:max-sm:border-white/[0.16] dark:border-white/[0.08] dark:!bg-[#111111] sm:rounded-lg sm:border sm:p-10 ${
              props.flushBottom ? 'sm:rounded-b-none' : ''
            }`
      }
    >
      <div
        className={`flex flex-col items-center text-center sm:flex-row sm:items-stretch sm:text-left ${
          flat ? 'gap-10 sm:gap-12 md:gap-16' : 'gap-7 sm:gap-10 md:gap-12'
        }`}
      >
        <div className="flex w-32 shrink-0 items-center self-center sm:w-44 md:w-52 lg:w-56">
          <ProfileAvatar
            fullName={props.fullName}
            avatarUrl={props.avatarUrl}
            appRole={props.appRole}
            editable={props.editable}
            uploadingAvatar={props.uploadingAvatar}
            onAvatarPick={props.onAvatarPick}
          />
        </div>

        <div className={`flex min-w-0 flex-1 flex-col items-center justify-center sm:items-start ${flat ? 'gap-6' : 'gap-5'}`}>
          <div className="w-full space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <h1
                className={`font-bold leading-tight tracking-[-0.02em] text-[#111111] dark:text-white ${
                  flat ? 'text-[2rem] sm:text-[2.5rem]' : 'text-[2rem] sm:text-[2.25rem]'
                }`}
              >
                {props.fullName}
              </h1>
              {(() => {
                const iso2 = normalizeNationalityCode(props.nationality);
                if (!iso2) return null;
                const label = nationalityLabel(iso2) || iso2;
                return (
                  <span
                    className="inline-flex shrink-0 items-center"
                    title={label}
                    aria-label={`Nationality: ${label}`}
                  >
                    <CountryFlag iso2={iso2} size="md" />
                  </span>
                );
              })()}
              {props.isOnline != null ? (
                <span
                  className={
                    props.isOnline
                      ? 'ml-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500'
                      : 'ml-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500'
                  }
                  title={props.isOnline ? 'Online' : 'Offline'}
                  aria-label={props.isOnline ? 'Online' : 'Offline'}
                  role="status"
                />
              ) : null}
              {props.isVerified && (
                <span className="rounded-full border border-emerald-500/30 px-2.5 py-0.5 text-[14px] font-medium text-emerald-600 dark:text-emerald-400">
                  Verified
                </span>
              )}
            </div>
            {props.handle ? <p className="text-[16px] text-neutral-500 dark:text-neutral-400">{props.handle}</p> : null}
          </div>

          {(() => {
            const status = resolveAvailabilityStatusLabel(props.isAvailable, props.availabilityLabel);
            if (!status && !props.locationLabel) return null;
            return (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[1rem] text-neutral-500 dark:text-neutral-400 sm:justify-start">
                {status ? (
                  <span
                    className={`inline-flex items-center gap-2 font-medium ${
                      props.isAvailable ? 'text-emerald-600 dark:text-emerald-400' : ''
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`h-2 w-2 rounded-full ${props.isAvailable ? 'bg-emerald-500' : 'bg-neutral-400'}`}
                    />
                    {status}
                  </span>
                ) : null}
                {props.locationLabel ? (
                  <span className="inline-flex items-center gap-1.5">
                    <PinIcon className="h-4 w-4 shrink-0 opacity-70" />
                    {props.locationLabel}
                  </span>
                ) : null}
              </div>
            );
          })()}

          <div className="flex w-full justify-center sm:justify-start">
            <ProfileHeaderSpecialtyBlock specialties={props.specialties} specialite={props.specialite} />
          </div>

          {bioPreview ? (
            <p className="max-w-2xl text-[1.0625rem] leading-[1.7] text-neutral-600 dark:text-neutral-400">
              {bioPreview}
            </p>
          ) : null}

          {props.trailingActions ? (
            <div className={`flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-start ${flat ? 'pt-2' : 'pt-1'}`}>
              {props.trailingActions}
            </div>
          ) : null}
        </div>

        <aside
          className={`w-full shrink-0 border-t border-black/[0.06] pt-2 dark:border-white/[0.08] sm:w-auto sm:self-stretch sm:border-l sm:border-t-0 sm:pt-0 ${
            flat ? 'sm:w-40 sm:pl-10 md:w-44' : 'sm:w-36 sm:pl-8 md:w-40'
          }`}
          aria-label="Profile stats"
        >
          {stats}
        </aside>
      </div>
    </div>
  );
}

function headerSurfaceClass(props: CreatorProfileHeaderProps): string {
  if (props.flat) return '';
  return `border-y border-black/[0.06] !bg-white px-5 py-7 max-sm:border-[#DADDE1] dark:max-sm:border-white/[0.16] dark:border-white/[0.08] dark:!bg-[#111111] sm:rounded-lg sm:border sm:p-10 ${
    props.flushBottom ? 'sm:rounded-b-none' : ''
  }`;
}

function NameBadges(props: CreatorProfileHeaderProps) {
  const iso2 = normalizeNationalityCode(props.nationality);
  const label = iso2 ? nationalityLabel(iso2) || iso2 : null;
  return (
    <>
      {iso2 ? (
        <span
          className="inline-flex shrink-0 items-center"
          title={label ?? undefined}
          aria-label={`Nationality: ${label}`}
        >
          <CountryFlag iso2={iso2} size="md" />
        </span>
      ) : null}
      {props.isOnline != null ? (
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            props.isOnline ? 'bg-emerald-500' : 'bg-neutral-400 dark:bg-neutral-500'
          }`}
          title={props.isOnline ? 'Online' : 'Offline'}
          aria-label={props.isOnline ? 'Online' : 'Offline'}
          role="status"
        />
      ) : null}
      {props.isVerified ? (
        <span className="rounded-full border border-emerald-500/30 px-2.5 py-0.5 text-[14px] font-medium text-emerald-600 dark:text-emerald-400">
          Verified
        </span>
      ) : null}
    </>
  );
}

function StarGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={className} fill="currentColor">
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

const formatCount = (value: number) => new Intl.NumberFormat('en-US').format(Math.max(0, value));

/** Seller — storefront presentation: brand mark, shop tagline, categories and commerce metrics. */
function SellerProfileHeader(props: CreatorProfileHeaderProps) {
  const bio = collapseRepeatedBio(props.bio) || null;
  const categories = headerSpecialties(props);
  const showSubscribers = resolveShowSubscriberCount(props);
  const starCount = Math.max(0, props.starCount ?? 0);
  const metricValue = 'text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-[#111111] dark:text-white';
  const metricLabel = 'text-[15px] text-neutral-500 dark:text-neutral-400';
  const metrics: Array<{
    key: string;
    value: ReactNode;
    label: string;
    href?: string;
  }> = [
    {
      key: 'products',
      value: formatCount(props.productCount),
      label: props.productCount === 1 ? 'product' : 'products',
    },
    {
      key: 'stars',
      value: (
        <span className="inline-flex items-center gap-1.5">
          {formatCount(starCount)}
          <StarGlyph className="h-4 w-4 text-amber-400" />
        </span>
      ),
      label: starCount === 1 ? 'trust star' : 'trust stars',
    },
    ...(showSubscribers
      ? [
          {
            key: 'subscribers',
            value: formatCount(props.followerCount),
            label: props.followerCount === 1 ? 'subscriber' : 'subscribers',
            href: props.profileSubscribersHref,
          },
        ]
      : []),
  ];

  return (
    <div className={headerSurfaceClass(props)}>
      <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-stretch md:gap-12">
        <div className="w-32 shrink-0 self-start sm:w-64 lg:w-[18.5rem]">
          <ProfileAvatar
            shape="square"
            ringless
            fullName={props.fullName}
            avatarUrl={props.avatarUrl}
            appRole={props.appRole}
            editable={props.editable}
            uploadingAvatar={props.uploadingAvatar}
            onAvatarPick={props.onAvatarPick}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-8">
          <div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#111111] dark:text-white">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#FF5722]" />
                Official shop
              </span>
              {props.locationLabel ? (
                <span className="font-normal normal-case tracking-normal text-neutral-500 dark:text-neutral-400">
                  {props.locationLabel}
                </span>
              ) : null}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="text-[2rem] font-bold leading-[0.95] tracking-[-0.045em] text-[#111111] dark:text-white sm:text-[3.25rem] lg:text-[3.75rem]">
                {props.fullName}
              </h1>
              <NameBadges {...props} />
            </div>

            {bio ? (
              <p className="mt-4 line-clamp-2 max-w-2xl text-[1.125rem] leading-[1.65] text-neutral-500 dark:text-neutral-400">
                {bio}
              </p>
            ) : null}

            {categories.length > 0 ? (
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-medium text-[#111111] dark:text-neutral-100">
                {categories.map((label, index) => (
                  <span key={label} className="inline-flex items-center gap-3">
                    {index > 0 ? (
                      <span aria-hidden className="text-neutral-300 dark:text-neutral-600">
                        /
                      </span>
                    ) : null}
                    {label}
                  </span>
                ))}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-6 border-t border-black/[0.06] pt-6 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
            <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-3 sm:gap-x-10 sm:gap-y-4">
              {metrics.map((metric) => {
                const content = (
                  <>
                    <dd
                      className={
                        metric.href ? `${metricValue} transition-colors group-hover:text-[#FF5722]` : metricValue
                      }
                    >
                      {metric.value}
                    </dd>
                    <dt className={metricLabel}>{metric.label}</dt>
                  </>
                );
                return metric.href ? (
                  <Link key={metric.key} href={metric.href} className="group flex items-baseline gap-2">
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
                  <Link
                    href={props.shopHref}
                    className="group inline-flex items-center gap-2.5 rounded-full bg-[#111111] py-3 pl-6 pr-5 text-[15px] font-medium text-white transition hover:opacity-85 dark:bg-white dark:text-[#111111]"
                  >
                    {props.shopLabel ?? 'Visit shop'}
                    <ArrowGlyph className="h-4 w-4 text-[#FF5722] transition-transform duration-200 group-hover:translate-x-1" />
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

/** RH / Recruiter / Client — large portrait on the left, name and a hiring brief (needs, base, trust). */
function RecruiterProfileHeader(props: CreatorProfileHeaderProps) {
  const bio = collapseRepeatedBio(props.bio) || null;
  const needs = headerSpecialties(props);
  const showSubscribers = resolveShowSubscriberCount(props);
  const starCount = Math.max(0, props.starCount ?? 0);
  const hiring = Boolean(props.isAvailable);
  const rowLabel = 'text-[15px] text-neutral-500 dark:text-neutral-400';
  const rowValue = 'min-w-0 text-[15px] font-medium text-[#111111] dark:text-neutral-100';

  const rows: Array<{ key: string; label: string; value: ReactNode }> = [];
  if (needs.length > 0) {
    rows.push({
      key: 'needs',
      label: 'Looking for',
      value: (
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {needs.map((label, index) => (
            <span key={label} className="inline-flex items-center gap-3">
              {index > 0 ? (
                <span aria-hidden className="text-neutral-300 dark:text-neutral-600">
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
    rows.push({ key: 'base', label: 'Based in', value: props.locationLabel });
  }
  rows.push({
    key: 'trust',
    label: 'Trust',
    value: (
      <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="inline-flex items-center gap-1.5">
          <StarGlyph className="h-3.5 w-3.5 text-amber-400" />
          {formatCount(starCount)} {starCount === 1 ? 'star' : 'stars'}
        </span>
        {showSubscribers ? (
          props.profileSubscribersHref ? (
            <Link href={props.profileSubscribersHref} className="transition-colors hover:text-[#FF5722]">
              {formatCount(props.followerCount)} {props.followerCount === 1 ? 'subscriber' : 'subscribers'}
            </Link>
          ) : (
            <span>
              {formatCount(props.followerCount)} {props.followerCount === 1 ? 'subscriber' : 'subscribers'}
            </span>
          )
        ) : null}
      </span>
    ),
  });

  return (
    <div className={headerSurfaceClass(props)}>
      <div className="flex flex-col gap-10 md:flex-row md:items-center md:gap-14 lg:gap-16">
        <div className="relative w-52 shrink-0 self-start sm:w-60 md:self-center lg:w-72">
          <ProfileAvatar
            ringless
            fullName={props.fullName}
            avatarUrl={props.avatarUrl}
            appRole={props.appRole}
            editable={props.editable}
            uploadingAvatar={props.uploadingAvatar}
            onAvatarPick={props.onAvatarPick}
          />
          {hiring ? (
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-[9%] right-[9%] h-5 w-5 rounded-full bg-yellow-400 ring-4 ring-white dark:ring-[#111111]"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="text-[2.5rem] font-bold leading-[0.95] tracking-[-0.045em] text-[#111111] dark:text-white sm:text-[3.25rem]">
              {props.fullName}
            </h1>
            <NameBadges {...props} />
          </div>

          {bio ? (
            <p className="mt-4 line-clamp-2 max-w-2xl text-[1.0625rem] leading-[1.65] text-neutral-500 dark:text-neutral-400">
              {bio}
            </p>
          ) : null}

          <dl className="mt-8 max-w-2xl divide-y divide-black/[0.06] border-y border-black/[0.06] dark:divide-white/[0.08] dark:border-white/[0.08]">
            {rows.map((row) => (
              <div key={row.key} className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-4 py-3">
                <dt className={rowLabel}>{row.label}</dt>
                <dd className={rowValue}>{row.value}</dd>
              </div>
            ))}
          </dl>

          {props.trailingActions ? <div className="mt-6 flex flex-wrap gap-2">{props.trailingActions}</div> : null}
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
