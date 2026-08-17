'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  CREATOR_PROFILE_PRODUCTS_LABEL,
  CREATOR_PROFILE_SERVICES_LABEL,
  CREATOR_PROFILE_SUBSCRIBERS_LABEL,
  CREATOR_PROFILE_VISITS_LABEL,
  resolveShowProductCount,
  resolveShowSubscriberCount,
  type CreatorProfileHeaderProps,
} from '@/components/creator/creator-profile-header-types';
import { ProfileVisitStat } from '@/components/creator/ProfileVisitStat';
import {
  creatorAppRoleRingClass,
  type CreatorAppRole,
} from '@/lib/creator-app-role';
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
export function ProfileHeaderSpecialtyBlock(
  props: Pick<CreatorProfileHeaderProps, 'specialties' | 'specialite'>
) {
  const specialties = headerSpecialties(props);
  if (specialties.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {specialties.map((label, index) => (
        <span
          key={label}
          className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            index === 0
              ? 'bg-orange-500/15 text-orange-700 dark:bg-orange-500/12 dark:text-orange-300'
              : 'border border-neutral-300/90 bg-transparent text-neutral-600 dark:border-neutral-600/80 dark:text-neutral-300'
          }`}
        >
          {label}
        </span>
      ))}
    </div>
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
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
}: {
  fullName: string;
  avatarUrl: string | null;
  appRole?: CreatorAppRole | null;
  editable?: boolean;
  uploadingAvatar?: boolean;
  onAvatarPick?: () => void;
}) {
  const ringColorClass = creatorAppRoleRingClass(appRole)
    .replace('ring-sky-500', 'ring-sky-500/90')
    .replace('ring-red-500', 'ring-red-500/90')
    .replace('ring-violet-500', 'ring-violet-500/90')
    .replace('ring-yellow-400', 'ring-yellow-400/95')
    .replace('ring-gray-400', 'ring-gray-400/85');
  const ringShellClass = [
    'aspect-square w-full rounded-full',
    'ring-4 ring-offset-4 sm:ring-[5px] sm:ring-offset-[5px]',
    'ring-offset-white dark:ring-offset-[#171717]',
    'transition-all duration-200',
    ringColorClass,
  ].join(' ');

  const mediaClass =
    'h-full w-full overflow-hidden rounded-full bg-neutral-100 shadow-sm dark:bg-neutral-800';

  const avatarInner = avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-orange-500 text-3xl font-bold text-white sm:text-4xl">
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
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition group-hover:bg-black/45">
          <CameraIcon className="h-7 w-7 text-white opacity-0 transition group-hover:opacity-100" />
        </span>
        {uploadingAvatar ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <LoadingSpinner size="sm" />
          </span>
        ) : null}
      </div>
    </button>
  );
}

function HorizontalProfileHeader(props: CreatorProfileHeaderProps) {
  const bioPreview = collapseRepeatedBio(props.bio) || null;
  const showProductCount = resolveShowProductCount(props);
  const showSubscribers = resolveShowSubscriberCount(props);
  const serviceCount = props.serviceCount ?? 0;
  const middleValue = showProductCount ? props.productCount : serviceCount;
  const middleLabel = showProductCount ? CREATOR_PROFILE_PRODUCTS_LABEL : CREATOR_PROFILE_SERVICES_LABEL;
  const statValueClass = 'text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-[1.65rem]';
  const statLabelClass =
    'mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400';

  const stats = (
    <div className="flex h-full min-h-[10rem] w-full flex-col items-center justify-center divide-y divide-neutral-200/80 dark:divide-neutral-700/50">
      {showSubscribers ? (
        <div className="flex w-full flex-1 flex-col items-center justify-center px-3 py-3.5 text-center">
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
      <div className="flex w-full flex-1 flex-col items-center justify-center px-3 py-3.5 text-center">
        <p className={statValueClass}>{middleValue.toLocaleString()}</p>
        <p className={statLabelClass}>{middleLabel}</p>
      </div>
      <div className="flex w-full flex-1 flex-col items-center justify-center px-3 py-3.5 text-center">
        <ProfileVisitStat
          value={props.profileVisits}
          label={CREATOR_PROFILE_VISITS_LABEL}
          href={props.profileVisitsHref}
          className="flex flex-col items-center"
          valueClassName={statValueClass}
          labelClassName={statLabelClass}
        />
      </div>
    </div>
  );

  return (
    <div
      className={`border border-neutral-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] dark:border-neutral-700/55 dark:bg-[#171717] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_10px_28px_rgba(0,0,0,0.22)] sm:p-8 ${
        props.flushBottom ? 'rounded-t-2xl rounded-b-none' : 'rounded-2xl'
      }`}
    >
      <div className="flex min-h-[15rem] flex-row items-stretch gap-6 sm:min-h-[17rem] sm:gap-8 md:min-h-[19rem] md:gap-10">
        <div className="flex w-48 shrink-0 items-center sm:w-56 md:w-64 lg:w-72">
          <ProfileAvatar
            fullName={props.fullName}
            avatarUrl={props.avatarUrl}
            appRole={props.appRole}
            editable={props.editable}
            uploadingAvatar={props.uploadingAvatar}
            onAvatarPick={props.onAvatarPick}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-5 sm:gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-[1.75rem]">
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
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-500/15 dark:text-green-300">
                  Verified
                </span>
              )}
            </div>
            {props.handle ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-300">
                {props.handle}
              </p>
            ) : null}
            {(() => {
              const status = resolveAvailabilityStatusLabel(props.isAvailable, props.availabilityLabel);
              if (!status) return null;
              return (
                <p
                  className={`pt-0.5 text-sm font-medium ${
                    props.isAvailable
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-neutral-500 dark:text-neutral-300'
                  }`}
                >
                  {status}
                </p>
              );
            })()}
          </div>

          {props.locationLabel ? (
            <p className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-300">
              <PinIcon className="h-4 w-4 shrink-0 opacity-80" />
              {props.locationLabel}
            </p>
          ) : null}

          <ProfileHeaderSpecialtyBlock
            specialties={props.specialties}
            specialite={props.specialite}
          />

          {bioPreview ? (
            <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {bioPreview}
            </p>
          ) : null}

          {props.trailingActions ? (
            <div className="flex flex-wrap gap-2 pt-1">{props.trailingActions}</div>
          ) : null}
        </div>

        <aside
          className="hidden w-[8rem] shrink-0 self-stretch border-l border-neutral-200/80 pl-5 sm:block sm:w-32 md:w-36 md:pl-6 dark:border-neutral-700/40"
          aria-label="Profile stats"
        >
          <div className="flex h-full flex-col justify-center px-0.5">{stats}</div>
        </aside>
      </div>

      <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-700/50 sm:hidden">
        {stats}
      </div>
    </div>
  );
}

/** Profile header — large avatar on the left, details on the right (no cover banner). */
export function CreatorProfileHeader(props: CreatorProfileHeaderProps) {
  return <HorizontalProfileHeader {...props} />;
}
