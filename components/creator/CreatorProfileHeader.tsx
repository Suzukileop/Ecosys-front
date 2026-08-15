'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  CREATOR_PROFILE_SUBSCRIBERS_LABEL,
  CREATOR_PROFILE_VISITS_LABEL,
  type CreatorProfileHeaderProps,
} from '@/components/creator/creator-profile-header-types';
import { ProfileVisitStat } from '@/components/creator/ProfileVisitStat';
import {
  creatorAppRoleRingClass,
  type CreatorAppRole,
} from '@/lib/creator-app-role';

export type { CreatorProfileHeaderProps } from '@/components/creator/creator-profile-header-types';

export const CREATOR_PROFILE_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

function headerSpecialties(props: Pick<CreatorProfileHeaderProps, 'specialties' | 'specialite'>): string[] {
  if (props.specialties && props.specialties.length > 0) {
    return props.specialties;
  }
  const primary = props.specialite?.trim();
  return primary ? [primary] : [];
}

export function ProfileHeaderSpecialtyBlock(
  props: Pick<CreatorProfileHeaderProps, 'specialties' | 'specialite' | 'specialtyTags'>
) {
  const specialties = headerSpecialties(props);
  const tags = (props.specialtyTags ?? []).filter((tag) => tag.trim());
  if (specialties.length === 0 && tags.length === 0) return null;

  return (
    <div className="space-y-2">
      {specialties.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {specialties.map((label, index) => (
              <span
                key={label}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                  index === 0
                    ? 'bg-orange-50 text-orange-800 dark:bg-orange-500/10 dark:text-orange-300'
                    : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
                }`}
              >
                {label}
              </span>
          ))}
        </div>
      ) : null}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
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
  const ringColorClass = creatorAppRoleRingClass(appRole);
  const ringShellClass = [
    'aspect-square w-full rounded-full',
    'ring-4 ring-offset-4',
    'ring-offset-white dark:ring-offset-[#0F0F0F]',
    'transition-all duration-200',
    ringColorClass,
  ].join(' ');

  const mediaClass =
    'h-full w-full overflow-hidden rounded-full bg-neutral-100 shadow-sm dark:bg-neutral-800';

  const avatarInner = avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-orange-500 text-2xl font-bold text-white sm:text-3xl">
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
      className={`group relative ${ringShellClass} focus:outline-none focus-visible:ring-orange-500`}
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
  const bioPreview = props.bio?.trim() || null;
  const statValueClass = 'text-2xl font-bold tracking-tight text-neutral-950 dark:text-white';
  const statLabelClass =
    'mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400';

  const stats = (
    <div className="flex h-full min-h-[10rem] w-full flex-col items-center justify-center divide-y divide-neutral-200 dark:divide-neutral-700">
      <div className="flex w-full flex-1 flex-col items-center justify-center px-3 py-3 text-center">
        <ProfileVisitStat
          value={props.followerCount}
          label={CREATOR_PROFILE_SUBSCRIBERS_LABEL}
          href={props.profileSubscribersHref}
          className="flex flex-col items-center"
          valueClassName={statValueClass}
          labelClassName={statLabelClass}
        />
      </div>
      <div className="flex w-full flex-1 flex-col items-center justify-center px-3 py-3 text-center">
        <p className={statValueClass}>{props.productCount.toLocaleString()}</p>
        <p className={statLabelClass}>Products</p>
      </div>
      <div className="flex w-full flex-1 flex-col items-center justify-center px-3 py-3 text-center">
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
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-[#0F0F0F] sm:p-6">
      <div className="flex flex-row items-stretch gap-5 sm:gap-7">
        <div className="w-40 shrink-0 sm:w-48 md:w-56 lg:w-64">
          <ProfileAvatar
            fullName={props.fullName}
            avatarUrl={props.avatarUrl}
            appRole={props.appRole}
            editable={props.editable}
            uploadingAvatar={props.uploadingAvatar}
            onAvatarPick={props.onAvatarPick}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
                {props.fullName}
              </h1>
              {props.isVerified && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-500/15 dark:text-green-300">
                  Verified
                </span>
              )}
            </div>
            {props.handle ? (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{props.handle}</p>
            ) : null}
          </div>

          {props.locationLabel ? (
            <p className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              <PinIcon className="h-4 w-4 shrink-0" />
              {props.locationLabel}
            </p>
          ) : null}

          <ProfileHeaderSpecialtyBlock
            specialties={props.specialties}
            specialite={props.specialite}
            specialtyTags={props.specialtyTags}
          />

          {bioPreview ? (
            <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {bioPreview}
            </p>
          ) : null}

          {props.trailingActions ? (
            <div className="flex flex-wrap gap-2 pt-1">{props.trailingActions}</div>
          ) : null}
        </div>

        <aside
          className="hidden w-[7.5rem] shrink-0 self-stretch pl-4 sm:block sm:w-32 md:w-36 md:pl-5"
          aria-label="Profile stats"
        >
          {stats}
        </aside>
      </div>

      <div className="mt-5 border-t border-neutral-200 pt-3 dark:border-neutral-700 sm:hidden">
        {stats}
      </div>
    </div>
  );
}

/** Profile header — large avatar on the left, details on the right (no cover banner). */
export function CreatorProfileHeader(props: CreatorProfileHeaderProps) {
  return <HorizontalProfileHeader {...props} />;
}
