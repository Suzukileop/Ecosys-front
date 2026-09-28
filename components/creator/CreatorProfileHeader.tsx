'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  CREATOR_PROFILE_PRODUCTS_LABEL,
  CREATOR_PROFILE_SERVICES_LABEL,
  CREATOR_PROFILE_SUBSCRIBERS_LABEL,
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
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-medium text-[#111111] dark:text-neutral-100">
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
    'ring-2 ring-offset-4 sm:ring-offset-[6px]',
    'ring-offset-white dark:ring-offset-[#111111]',
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
  const rating = props.averageRating != null && props.averageRating > 0 ? props.averageRating : null;
  const statValueClass = 'text-[1.75rem] font-bold leading-none tracking-[-0.02em] text-[#111111] dark:text-white';
  const statLabelClass = 'mt-2 text-[14px] font-normal text-neutral-500 dark:text-neutral-400';
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
        <p className={statValueClass}>{middleValue.toLocaleString()}</p>
        <p className={statLabelClass}>{middleLabel}</p>
      </div>
      <div className={statCellClass}>
        <p className={`${statValueClass} inline-flex items-center gap-1.5`}>
          <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5 text-[#FF5722]" fill="currentColor">
            <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
          </svg>
          {rating != null ? rating.toFixed(1) : '—'}
        </p>
        <p className={statLabelClass}>Rating</p>
      </div>
    </div>
  );

  return (
    <div
      className={`border border-black/[0.06] bg-white p-6 dark:border-white/[0.08] dark:bg-[#111111] sm:p-10 ${
        props.flushBottom ? 'rounded-t-lg rounded-b-none' : 'rounded-lg'
      }`}
    >
      <div className="flex flex-col items-stretch gap-8 sm:flex-row sm:gap-10 md:gap-12">
        <div className="flex w-36 shrink-0 items-center self-center sm:w-44 md:w-52 lg:w-56">
          <ProfileAvatar
            fullName={props.fullName}
            avatarUrl={props.avatarUrl}
            appRole={props.appRole}
            editable={props.editable}
            uploadingAvatar={props.uploadingAvatar}
            onAvatarPick={props.onAvatarPick}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-[#111111] dark:text-white sm:text-[2rem]">
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
                <span className="rounded-full border border-emerald-500/30 px-2.5 py-0.5 text-[13px] font-medium text-emerald-600 dark:text-emerald-400">
                  Verified
                </span>
              )}
            </div>
            {props.handle ? (
              <p className="text-[15px] text-neutral-500 dark:text-neutral-400">{props.handle}</p>
            ) : null}
          </div>

          {(() => {
            const status = resolveAvailabilityStatusLabel(props.isAvailable, props.availabilityLabel);
            if (!status && !props.locationLabel) return null;
            return (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px] text-neutral-500 dark:text-neutral-400">
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

          <ProfileHeaderSpecialtyBlock
            specialties={props.specialties}
            specialite={props.specialite}
          />

          {bioPreview ? (
            <p className="max-w-2xl text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              {bioPreview}
            </p>
          ) : null}

          {props.trailingActions ? (
            <div className="flex flex-wrap gap-2 pt-1">{props.trailingActions}</div>
          ) : null}
        </div>

        <aside
          className="shrink-0 border-t border-black/[0.06] pt-4 dark:border-white/[0.08] sm:w-36 sm:self-stretch sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0 md:w-40"
          aria-label="Profile stats"
        >
          {stats}
        </aside>
      </div>
    </div>
  );
}

/** Profile header — large avatar on the left, details on the right (no cover banner). */
export function CreatorProfileHeader(props: CreatorProfileHeaderProps) {
  return <HorizontalProfileHeader {...props} />;
}
