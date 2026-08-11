'use client';

import type { ReactNode } from 'react';
import { CREATOR_PROFILE_SUBSCRIBERS_LABEL, CREATOR_PROFILE_VISITS_LABEL, type CreatorProfileHeaderProps } from '@/components/creator/creator-profile-header-types';
import { ProfileVisitStat, ProfileVisitStatGridItem } from '@/components/creator/ProfileVisitStat';
import type { CreatorStudioHeaderContentStyle } from '@/components/creator/studio/creator-studio-header-content';

type BannerProfileContentProps = CreatorProfileHeaderProps & {
  contentStyle: CreatorStudioHeaderContentStyle;
  avatar: ReactNode;
  bioPreview: string | null;
};

function StatsInline(props: CreatorProfileHeaderProps) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
      <ProfileVisitStat
        value={props.followerCount}
        label={CREATOR_PROFILE_SUBSCRIBERS_LABEL}
        href={props.profileSubscribersHref}
        layout="inline"
      />
      <span aria-hidden>·</span>
      <span>
        {props.productCount} product{props.productCount !== 1 ? 's' : ''}
      </span>
      <span aria-hidden>·</span>
      <ProfileVisitStat
        value={props.profileVisits}
        label={CREATOR_PROFILE_VISITS_LABEL}
        href={props.profileVisitsHref}
        layout="inline"
      />
      {props.averageRating != null && props.averageRating > 0 && (
        <>
          <span aria-hidden>·</span>
          <span className="font-medium text-amber-600 dark:text-amber-400">
            ⭐ {props.averageRating.toFixed(1)}/5
          </span>
        </>
      )}
      {props.locationLabel && (
        <>
          <span aria-hidden>·</span>
          <span>{props.locationLabel}</span>
        </>
      )}
      {props.specialite && (
        <>
          <span aria-hidden>·</span>
          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-500/10 dark:text-orange-300">
            {props.specialite}
          </span>
        </>
      )}
    </div>
  );
}

function StatsGrid(props: CreatorProfileHeaderProps) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-3 sm:max-w-sm">
      <ProfileVisitStatGridItem
        value={props.followerCount}
        label={CREATOR_PROFILE_SUBSCRIBERS_LABEL}
        href={props.profileSubscribersHref}
      />
      <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/80 px-2 py-2 dark:border-neutral-800 dark:bg-neutral-900/60">
        <p className="text-base font-bold text-neutral-900 dark:text-white">{props.productCount.toLocaleString()}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Products</p>
      </div>
      <ProfileVisitStatGridItem
        value={props.profileVisits}
        label={CREATOR_PROFILE_VISITS_LABEL}
        href={props.profileVisitsHref}
      />
    </div>
  );
}

function NameBlock({ props, centered }: { props: CreatorProfileHeaderProps; centered?: boolean }) {
  return (
    <div className={`min-w-0 ${centered ? 'text-center' : 'pb-1'}`}>
      <div className={`flex flex-wrap items-center gap-2 ${centered ? 'justify-center' : ''}`}>
        <h1
          className={`font-bold text-neutral-900 dark:text-white ${
            centered ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
          }`}
        >
          {props.fullName}
        </h1>
        {props.isVerified && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-500/15 dark:text-green-300">
            Verified
          </span>
        )}
      </div>
      <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{props.handle}</p>
    </div>
  );
}

export function BannerProfileContent({
  contentStyle,
  avatar,
  bioPreview,
  ...props
}: BannerProfileContentProps) {
  if (contentStyle === 'CENTERED') {
    return (
      <div className="px-4 pb-2 pt-2 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="-mt-12 sm:-mt-14">{avatar}</div>
          <NameBlock props={props} centered />
          <div className="flex w-full justify-center">
            <StatsInline {...props} />
          </div>
          {bioPreview && (
            <p className="max-w-xl text-sm text-neutral-600 dark:text-neutral-400">{bioPreview}</p>
          )}
          <div className="flex flex-wrap justify-center gap-2">{props.trailingActions}</div>
        </div>
      </div>
    );
  }

  if (contentStyle === 'COMPACT') {
    return (
      <div className="px-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-3">
            <div className="-mt-8 shrink-0 sm:-mt-10">{avatar}</div>
            <div className="min-w-0 pb-0.5">
              <NameBlock props={props} />
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                <ProfileVisitStat
                  value={props.followerCount}
                  label={CREATOR_PROFILE_SUBSCRIBERS_LABEL}
                  href={props.profileSubscribersHref}
                  layout="inline"
                />
                <span aria-hidden>·</span>
                <span>{props.productCount} products</span>
                <span aria-hidden>·</span>
                <ProfileVisitStat
                  value={props.profileVisits}
                  label={CREATOR_PROFILE_VISITS_LABEL}
                  href={props.profileVisitsHref}
                  layout="inline"
                />
              </div>
              {props.specialite && (
                <span className="mt-1.5 inline-block rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-800 dark:bg-orange-500/10 dark:text-orange-300">
                  {props.specialite}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pb-0.5">{props.trailingActions}</div>
        </div>
      </div>
    );
  }

  if (contentStyle === 'GRID') {
    return (
      <div className="px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="-mt-12 shrink-0 sm:-mt-14">{avatar}</div>
            <div className="min-w-0">
              <NameBlock props={props} />
              <StatsGrid {...props} />
              {bioPreview && (
                <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">{bioPreview}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:pt-8">{props.trailingActions}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="-mt-12 shrink-0 sm:-mt-14">{avatar}</div>
          <div className="min-w-0 pb-1">
            <NameBlock props={props} />
            <StatsInline {...props} />
            {bioPreview && (
              <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">{bioPreview}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pb-1">{props.trailingActions}</div>
      </div>
    </div>
  );
}

export function splitContentStyleClass(style: CreatorStudioHeaderContentStyle): string {
  switch (style) {
    case 'COMPACT':
      return 'gap-4 p-4 sm:p-5';
    case 'CENTERED':
      return 'items-center gap-5 p-5 text-center sm:p-6';
    case 'GRID':
      return 'gap-5 p-5 sm:gap-6 sm:p-6';
    default:
      return 'gap-5 p-5 sm:gap-6 sm:p-6';
  }
}
