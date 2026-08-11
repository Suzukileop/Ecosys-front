'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  CREATOR_PROFILE_SUBSCRIBERS_LABEL,
  CREATOR_PROFILE_VISITS_LABEL,
  type CreatorProfileHeaderProps,
} from '@/components/creator/creator-profile-header-types';
import { coverImageObjectPosition, normalizeCoverObjectPositionY } from '@/lib/creator-profile-cover';
import { VipAuroraHeader, VipGoldHeader, StageHeader } from '@/components/creator/CreatorProfileHeaderPremium';
import { BannerProfileContent, splitContentStyleClass } from '@/components/creator/BannerProfileContent';
import { ProfileVisitStat } from '@/components/creator/ProfileVisitStat';
import { parseCreatorStudioHeaderContentStyle } from '@/components/creator/studio/creator-studio-header-content';

export type { CreatorProfileHeaderProps } from '@/components/creator/creator-profile-header-types';

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

function AvatarButton({
  fullName,
  avatarUrl,
  editable,
  uploadingAvatar,
  onAvatarPick,
  shape,
  size,
  overlap = false,
}: {
  fullName: string;
  avatarUrl: string | null;
  editable?: boolean;
  uploadingAvatar?: boolean;
  onAvatarPick?: () => void;
  shape: 'circle' | 'square';
  size: 'md' | 'lg';
  overlap?: boolean;
}) {
  const sizeClass = size === 'lg' ? 'h-20 w-20 sm:h-28 sm:w-28' : 'h-16 w-16 sm:h-20 sm:w-20';
  const radiusClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const frameClass = `${sizeClass} overflow-hidden ${radiusClass} border-4 border-white bg-neutral-100 shadow-md dark:border-neutral-950`;

  const avatarInner = avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
  ) : (
    <div
      className={`flex h-full w-full items-center justify-center bg-orange-500 font-bold text-white ${
        size === 'lg' ? 'text-xl sm:text-2xl' : 'text-lg'
      }`}
    >
      {initials(fullName)}
    </div>
  );

  const wrapperClass = overlap ? '-mt-12 shrink-0 sm:-mt-14' : 'shrink-0';

  if (!editable) {
    return (
      <div className={wrapperClass}>
        <div className={frameClass}>{avatarInner}</div>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <button
        type="button"
        onClick={onAvatarPick}
        disabled={uploadingAvatar}
        className={`group relative block ${radiusClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950`}
        aria-label="Change profile photo"
      >
        <div className={frameClass}>{avatarInner}</div>
        <span className={`absolute inset-0 flex items-center justify-center ${radiusClass} bg-black/0 transition group-hover:bg-black/45`}>
          <CameraIcon className="h-6 w-6 text-white opacity-0 transition group-hover:opacity-100 sm:h-7 sm:w-7" />
        </span>
        {uploadingAvatar && (
          <span className={`absolute inset-0 flex items-center justify-center ${radiusClass} bg-black/50`}>
            <LoadingSpinner size="sm" />
          </span>
        )}
      </button>
    </div>
  );
}

function CoverArea({
  coverUrl,
  coverObjectPositionY = 50,
  editable,
  uploadingCover,
  onCoverPick,
  coverPositionAdjustable,
  onCoverObjectPositionYChange,
  className,
  aspectClass,
}: {
  coverUrl: string | null;
  coverObjectPositionY?: number;
  editable?: boolean;
  uploadingCover?: boolean;
  onCoverPick?: () => void;
  coverPositionAdjustable?: boolean;
  onCoverObjectPositionYChange?: (value: number) => void;
  className?: string;
  aspectClass?: string;
}) {
  const positionY = normalizeCoverObjectPositionY(coverObjectPositionY);

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <div className={aspectClass ?? 'aspect-[4.5/1] min-h-[160px] w-full sm:min-h-[200px] md:min-h-[240px]'}>
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: coverImageObjectPosition(positionY) }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-neutral-800 to-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {uploadingCover && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <LoadingSpinner size="md" />
          </div>
        )}
      </div>
      {coverPositionAdjustable && coverUrl && onCoverObjectPositionYChange && (
        <div className="absolute inset-y-3 left-3 z-10 flex w-8 flex-col items-center justify-center rounded-full bg-black/45 px-1 py-2 backdrop-blur-sm">
          <span className="mb-1 text-[9px] text-white/70" aria-hidden>
            ↑
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={positionY}
            onChange={(e) => onCoverObjectPositionYChange(Number(e.target.value))}
            className="h-20 w-1 cursor-pointer appearance-none rounded-full bg-white/25 accent-orange-400 [writing-mode:vertical-lr] [direction:rtl]"
            aria-label="Adjust cover vertical position"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <span className="mt-1 text-[9px] text-white/70" aria-hidden>
            ↓
          </span>
        </div>
      )}
      {editable && (
        <button
          type="button"
          onClick={onCoverPick}
          disabled={uploadingCover}
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-60"
          aria-label="Change cover image"
        >
          <CameraIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function BannerHeader(props: CreatorProfileHeaderProps) {
  const bioPreview = props.bio?.trim()
    ? props.bio.trim().length > 120
      ? `${props.bio.trim().slice(0, 120)}…`
      : props.bio.trim()
    : null;
  const contentStyle = parseCreatorStudioHeaderContentStyle(props.headerContentStyle);
  const avatarSize = contentStyle === 'COMPACT' ? 'md' : 'lg';

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-900">
        <CoverArea
          coverUrl={props.coverUrl}
          coverObjectPositionY={props.coverObjectPositionY}
          editable={props.editable}
          uploadingCover={props.uploadingCover}
          onCoverPick={props.onCoverPick}
          coverPositionAdjustable={props.coverPositionAdjustable}
          onCoverObjectPositionYChange={props.onCoverObjectPositionYChange}
        />
      </div>

      <BannerProfileContent
        {...props}
        contentStyle={contentStyle}
        bioPreview={bioPreview}
        avatar={
          <AvatarButton
            fullName={props.fullName}
            avatarUrl={props.avatarUrl}
            editable={props.editable}
            uploadingAvatar={props.uploadingAvatar}
            onAvatarPick={props.onAvatarPick}
            shape="circle"
            size={avatarSize}
            overlap={contentStyle !== 'CENTERED'}
          />
        }
      />
    </>
  );
}

function SplitHeader(props: CreatorProfileHeaderProps) {
  const bioPreview = props.bio?.trim() || null;
  const contentStyle = parseCreatorStudioHeaderContentStyle(props.headerContentStyle);
  const panelClass = splitContentStyleClass(contentStyle);
  const centered = contentStyle === 'CENTERED';
  const statValueClass =
    'text-2xl font-bold tracking-tight text-neutral-950 dark:text-white';
  const statLabelClass =
    'mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400';

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="grid md:grid-cols-2">
        <div className={`flex flex-col ${panelClass}`}>
          <div className={`flex items-start gap-4 ${centered ? 'flex-col items-center' : ''}`}>
            <AvatarButton
              fullName={props.fullName}
              avatarUrl={props.avatarUrl}
              editable={props.editable}
              uploadingAvatar={props.uploadingAvatar}
              onAvatarPick={props.onAvatarPick}
              shape="square"
              size="md"
            />
            <div className={`min-w-0 pt-1 ${centered ? 'text-center' : ''}`}>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{props.fullName}</h1>
                {props.isVerified && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-500/15 dark:text-green-300">
                    Verified
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{props.handle}</p>
            </div>
          </div>

          <div
            className={`grid grid-cols-3 gap-4 ${centered ? 'mx-auto w-full max-w-xs' : ''}`}
          >
            <ProfileVisitStat
              value={props.followerCount}
              label={CREATOR_PROFILE_SUBSCRIBERS_LABEL}
              href={props.profileSubscribersHref}
              valueClassName={statValueClass}
              labelClassName={statLabelClass}
            />
            <div>
              <p className={statValueClass}>{props.productCount.toLocaleString()}</p>
              <p className={statLabelClass}>Products</p>
            </div>
            <ProfileVisitStat
              value={props.profileVisits}
              label={CREATOR_PROFILE_VISITS_LABEL}
              href={props.profileVisitsHref}
              valueClassName={statValueClass}
              labelClassName={statLabelClass}
            />
          </div>

          {props.locationLabel && (
            <p className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              <PinIcon className="h-4 w-4 shrink-0" />
              {props.locationLabel}
            </p>
          )}

          {props.specialite && (
            <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-orange-800 dark:bg-orange-500/10 dark:text-orange-300">
              {props.specialite}
            </span>
          )}

          {bioPreview && (
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {bioPreview}
            </p>
          )}

          <div className={`mt-auto flex flex-wrap gap-2 pt-1 ${centered ? 'justify-center' : ''}`}>
            {props.trailingActions}
          </div>
        </div>

        <CoverArea
          coverUrl={props.coverUrl}
          coverObjectPositionY={props.coverObjectPositionY}
          editable={props.editable}
          uploadingCover={props.uploadingCover}
          onCoverPick={props.onCoverPick}
          coverPositionAdjustable={props.coverPositionAdjustable}
          onCoverObjectPositionYChange={props.onCoverObjectPositionYChange}
          className="min-h-[220px] md:min-h-full"
          aspectClass="h-full min-h-[220px] w-full md:min-h-[280px]"
        />
      </div>
    </div>
  );
}

export function CreatorProfileHeader(props: CreatorProfileHeaderProps) {
  switch (props.layout) {
    case 'SPLIT':
      return <SplitHeader {...props} />;
    case 'VIP_GOLD':
      return <VipGoldHeader {...props} />;
    case 'VIP_AURORA':
      return <VipAuroraHeader {...props} />;
    case 'STAGE':
      return <StageHeader {...props} />;
    default:
      return <BannerHeader {...props} />;
  }
}

export const CREATOR_PROFILE_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';
