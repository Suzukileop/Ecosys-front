'use client';

import { useRef, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faAddressCard,
  faEye,
  faGem,
  faHandshake,
  faImage,
  faPenToSquare,
  faUser,
} from '@fortawesome/free-regular-svg-icons';
import { CreatorProfileHeader, CREATOR_PROFILE_IMAGE_ACCEPT } from '@/components/creator/CreatorProfileHeader';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import { creatorStudioTabNavAlignClass } from '@/components/creator/studio/creator-studio-layout';
import type { CreatorStudioTabNavAlign } from '@/components/creator/studio/creator-studio-layout';
import { CREATOR_STUDIO_TABS, type CreatorStudioTab } from './types';
import type { CreatorStudioHeaderLayout } from './creator-studio-header';
import type { CreatorStudioHeaderContentStyle } from './creator-studio-header-content';
import {
  creatorCanAccessProfileProducts,
  creatorCanAccessProfileServices,
  normalizeCreatorAppRole,
} from '@/lib/creator-app-role';

export type CreatorStudioHeaderData = {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  specialite: string | null;
  specialties?: string[];
  specialtyTags?: string[];
  followerCount: number;
  productCount: number;
  serviceCount?: number;
  profileVisits: number;
  isAvailable: boolean;
  availabilityLabel?: string | null;
  starCount?: number;
  locationLabel?: string | null;
  /** App role — drives avatar status ring color. */
  appRole?: string | null;
  headerLayout: CreatorStudioHeaderLayout;
  headerContentStyle: CreatorStudioHeaderContentStyle;
  tabNavAlign: CreatorStudioTabNavAlign;
  contentHeadline?: string | null;
};

type CreatorStudioShellProps = {
  tab: CreatorStudioTab;
  onTabChange: (tab: CreatorStudioTab) => void;
  header: CreatorStudioHeaderData;
  children: ReactNode;
  uploadingAvatar?: boolean;
  onAvatarSelect?: (file: File) => void | Promise<void>;
  /** Primary action shown above the desktop sections rail. */
  railAction?: ReactNode;
};

const STUDIO_TAB_ICONS: Record<CreatorStudioTab, IconDefinition> = {
  content: faPenToSquare,
  services: faHandshake,
  products: faGem,
  images: faImage,
  visitors: faEye,
  subscribers: faUser,
  profile: faAddressCard,
};

export function CreatorStudioShell({
  tab,
  onTabChange,
  header,
  children,
  uploadingAvatar = false,
  onAvatarSelect,
  railAction,
}: CreatorStudioShellProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handle = header.email;
  const pickAvatar = () => avatarInputRef.current?.click();
  const appRole = normalizeCreatorAppRole(header.appRole);
  const visibleTabs = CREATOR_STUDIO_TABS.filter((item) => {
    if (item.id === 'products') return creatorCanAccessProfileProducts(appRole);
    if (item.id === 'services') return creatorCanAccessProfileServices(appRole);
    return true;
  });

  const selectTab = (next: CreatorStudioTab) => onTabChange(next);

  return (
    <div className="news-theme mx-auto w-full max-w-[1400px] px-0 pb-16 pt-2 sm:px-8 sm:pt-4 md:px-12 lg:px-16">
      <input
        ref={avatarInputRef}
        type="file"
        accept={CREATOR_PROFILE_IMAGE_ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onAvatarSelect?.(file);
          e.target.value = '';
        }}
      />

      <div>
        <CreatorProfileHeader
          layout={header.headerLayout}
          fullName={header.fullName}
          handle={handle}
          avatarUrl={header.avatarUrl}
          appRole={appRole}
          headerContentStyle={header.headerContentStyle}
          bio={header.bio}
          specialite={header.specialite}
          specialties={header.specialties}
          specialtyTags={header.specialtyTags}
          followerCount={header.followerCount}
          productCount={header.productCount}
          serviceCount={header.serviceCount ?? 0}
          showProductCount={creatorCanAccessProfileProducts(appRole)}
          profileVisits={header.profileVisits}
          profileVisitsHref="/profile?tab=visitors"
          profileSubscribersHref="/profile?tab=subscribers"
          starCount={header.starCount}
          locationLabel={header.locationLabel}
          isAvailable={header.isAvailable}
          availabilityLabel={header.availabilityLabel}
          shopHref="/my-products"
          shopLabel="Manage shop"
          editable
          uploadingAvatar={uploadingAvatar}
          onAvatarPick={pickAvatar}
        />
      </div>

      <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] xl:gap-16">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        <div className="border-b border-black/[0.06] dark:border-white/[0.08] lg:hidden">
          <div className="flex items-center gap-4">
            <nav
              className={`flex min-w-0 flex-1 gap-8 overflow-x-auto px-5 [scrollbar-width:none] sm:px-0 [&::-webkit-scrollbar]:hidden ${creatorStudioTabNavAlignClass(header.tabNavAlign)}`}
              aria-label="Creator studio sections"
            >
              {visibleTabs.map((item) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectTab(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative shrink-0 py-4 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 ${
                      active
                        ? 'text-[#111111] dark:text-white'
                        : 'text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#FF5722]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className={`py-10 sm:py-12 lg:pt-0 ${tab === 'content' ? '' : 'px-5 sm:px-0'}`}>{children}</div>
        </div>

        <div className="hidden self-start lg:col-start-2 lg:row-start-1 lg:block">
          <ProfileSectionStickyAside
            className="w-full"
            surfaceClassName="flex w-full max-w-full min-w-0 flex-col gap-5"
          >
            {railAction}
            <div className="flex min-h-0 flex-col overflow-hidden">
              <div className="flex h-14 shrink-0 items-center border-b border-black/[0.05] px-5 dark:border-white/[0.05]">
                <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#666666] dark:text-neutral-500">
                  Manage
                </p>
              </div>
              <nav
                className="mt-3 flex min-h-0 w-full flex-col gap-1.5 overflow-y-auto rounded-xl bg-[#FFFFFF] px-2.5 py-3 [scrollbar-width:none] dark:bg-[#111111] [&::-webkit-scrollbar]:hidden"
                aria-label="Creator studio sections"
              >
                {visibleTabs.map((item) => {
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectTab(item.id)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex min-h-[3.25rem] w-full items-center gap-3.5 rounded-lg px-3 py-3.5 text-left text-[16px] text-[#0F0F0F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 dark:text-[#F1F1F1] ${
                        active
                          ? 'bg-black/[0.05] font-semibold dark:bg-white/[0.1]'
                          : 'font-medium hover:bg-black/[0.05] dark:hover:bg-white/[0.1]'
                      }`}
                    >
                      <FontAwesomeIcon icon={STUDIO_TAB_ICONS[item.id]} className="h-[1.05rem] w-[1.05rem] shrink-0" />
                      <span className="min-w-0 flex-1 whitespace-nowrap">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </ProfileSectionStickyAside>
        </div>
      </div>
    </div>
  );
}
