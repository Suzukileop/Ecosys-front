'use client';

import { useRef, useState, type ReactNode } from 'react';
import { CreatorProfileHeader, CREATOR_PROFILE_IMAGE_ACCEPT } from '@/components/creator/CreatorProfileHeader';
import { CreatorStudioLayoutSettings } from '@/components/creator/studio/CreatorStudioLayoutSettings';
import { creatorStudioTabNavAlignClass } from '@/components/creator/studio/creator-studio-layout';
import type { CreatorStudioTabNavAlign } from '@/components/creator/studio/creator-studio-layout';
import { CREATOR_STUDIO_TABS, type CreatorStudioTab } from './types';
import type { CreatorStudioHeaderLayout } from './creator-studio-header';
import type { CreatorStudioHeaderContentStyle } from './creator-studio-header-content';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { PORTFOLIO_FRAME_CLASS } from '@/components/portfolio/portfolioFrame';
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
  averageRating?: number | null;
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
  savingHeaderLayout?: boolean;
  savingHeaderContentStyle?: boolean;
  savingTabNavAlign?: boolean;
  savingContentHeadline?: boolean;
  layoutError?: string | null;
  onDismissLayoutError?: () => void;
  onHeaderLayoutChange: (layout: CreatorStudioHeaderLayout) => void | Promise<void>;
  onHeaderContentStyleChange: (style: CreatorStudioHeaderContentStyle) => void | Promise<void>;
  onTabNavAlignChange: (align: CreatorStudioTabNavAlign) => void | Promise<void>;
  onContentHeadlineChange: (headline: string) => void | Promise<void>;
};

function LayoutSettingsIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function CreatorStudioShell({
  tab,
  onTabChange,
  header,
  children,
  uploadingAvatar = false,
  onAvatarSelect,
  savingHeaderLayout = false,
  savingHeaderContentStyle = false,
  savingTabNavAlign = false,
  savingContentHeadline = false,
  layoutError = null,
  onDismissLayoutError,
  onHeaderLayoutChange,
  onHeaderContentStyleChange,
  onTabNavAlignChange,
  onContentHeadlineChange,
}: CreatorStudioShellProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [layoutPanelOpen, setLayoutPanelOpen] = useState(false);

  const handle = header.email;
  const pickAvatar = () => avatarInputRef.current?.click();
  const appRole = normalizeCreatorAppRole(header.appRole);
  const visibleTabs = CREATOR_STUDIO_TABS.filter((item) => {
    if (item.id === 'products') return creatorCanAccessProfileProducts(appRole);
    if (item.id === 'services') return creatorCanAccessProfileServices(appRole);
    return true;
  });

  return (
    <div className={`${PORTFOLIO_FRAME_CLASS} pb-16 pt-4`}>
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
          profileVisitsHref="/dashboard/creator?tab=visitors"
          profileSubscribersHref="/dashboard/creator?tab=subscribers"
          averageRating={header.averageRating}
          locationLabel={header.locationLabel}
          isAvailable={header.isAvailable}
          availabilityLabel={header.availabilityLabel}
          editable
          uploadingAvatar={uploadingAvatar}
          onAvatarPick={pickAvatar}
        />
      </div>

      <div>
        <div className="mt-12 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-4">
            <nav
              className={`flex min-w-0 flex-1 gap-8 overflow-x-auto ${creatorStudioTabNavAlignClass(header.tabNavAlign)}`}
              aria-label="Creator studio sections"
            >
              {visibleTabs.map((item) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setLayoutPanelOpen(false);
                      onTabChange(item.id);
                    }}
                    className={`relative shrink-0 py-4 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 ${
                      active && !layoutPanelOpen
                        ? 'text-[#111111] dark:text-white'
                        : 'text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                    {active && !layoutPanelOpen && (
                      <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#FF5722]" />
                    )}
                  </button>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={() => setLayoutPanelOpen((open) => !open)}
              aria-expanded={layoutPanelOpen}
              aria-controls="creator-studio-layout-settings"
              aria-label={layoutPanelOpen ? 'Close layout settings' : 'Layout settings'}
              title={layoutPanelOpen ? 'Close layout' : 'Layout'}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 ${
                layoutPanelOpen
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                  : 'text-neutral-500 hover:bg-black/[0.05] hover:text-[#111111] dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-white'
              }`}
            >
              <LayoutSettingsIcon />
            </button>
          </div>
        </div>

        {layoutPanelOpen ? (
          <div id="creator-studio-layout-settings" className="py-10">
            <div className="rounded-lg border border-black/[0.06] bg-white p-6 dark:border-white/[0.08] dark:bg-[#111111] sm:p-8">
              {layoutError ? (
                <div className="mb-4">
                  <ErrorAlert message={layoutError} onDismiss={onDismissLayoutError} />
                </div>
              ) : null}
              <CreatorStudioLayoutSettings
                headerLayout={header.headerLayout}
                headerContentStyle={header.headerContentStyle}
                tabNavAlign={header.tabNavAlign}
                contentHeadline={header.contentHeadline}
                savingHeader={savingHeaderLayout}
                savingHeaderContent={savingHeaderContentStyle}
                savingTabAlign={savingTabNavAlign}
                savingContentHeadline={savingContentHeadline}
                onHeaderLayoutChange={onHeaderLayoutChange}
                onHeaderContentStyleChange={onHeaderContentStyleChange}
                onTabNavAlignChange={onTabNavAlignChange}
                onContentHeadlineChange={onContentHeadlineChange}
              />
            </div>
          </div>
        ) : (
          <div className="py-10 sm:py-12">{children}</div>
        )}
      </div>
    </div>
  );
}
