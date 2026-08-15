'use client';

import { useRef, useState, type ReactNode } from 'react';
import { CreatorProfileHeader, CREATOR_PROFILE_IMAGE_ACCEPT } from '@/components/creator/CreatorProfileHeader';
import { CreatorStudioLayoutSettings } from '@/components/creator/studio/CreatorStudioLayoutSettings';
import { creatorStudioTabNavAlignClass } from '@/components/creator/studio/creator-studio-layout';
import type { CreatorStudioTabNavAlign } from '@/components/creator/studio/creator-studio-layout';
import { CREATOR_STUDIO_TABS, type CreatorStudioTab } from './types';
import type { CreatorStudioHeaderLayout } from './creator-studio-header';
import type { CreatorStudioHeaderContentStyle } from './creator-studio-header-content';
import { creatorHeaderNeedsInset } from './creator-studio-header';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
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
  profileVisits: number;
  isAvailable: boolean;
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
    <div className="mx-auto w-full max-w-[1280px]">
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

      <div className={creatorHeaderNeedsInset(header.headerLayout) ? 'px-4 sm:px-6' : undefined}>
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
          profileVisits={header.profileVisits}
          profileVisitsHref="/dashboard/creator?tab=visitors"
          profileSubscribersHref="/dashboard/creator?tab=subscribers"
          averageRating={header.averageRating}
          locationLabel={header.locationLabel}
          editable
          uploadingAvatar={uploadingAvatar}
          onAvatarPick={pickAvatar}
        />
      </div>

      <div className="px-4 sm:px-6">
        <div className="mt-6 flex items-end gap-2">
          <nav
            className={`flex min-w-0 flex-1 gap-1 overflow-x-auto ${creatorStudioTabNavAlignClass(header.tabNavAlign)}`}
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
                  className={`relative shrink-0 px-4 py-3 text-sm font-semibold tracking-wide transition ${
                    active && !layoutPanelOpen
                      ? 'text-neutral-900 dark:text-white'
                      : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                >
                  {item.label}
                  {active && !layoutPanelOpen && (
                    <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-neutral-900 dark:bg-white" />
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
            className={`mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
              layoutPanelOpen
                ? 'bg-neutral-100 text-neutral-900 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700'
                : 'border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-900'
            }`}
          >
            <LayoutSettingsIcon />
          </button>
        </div>

        {layoutPanelOpen ? (
          <div id="creator-studio-layout-settings" className="py-5">
            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
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
          <div className="py-8">{children}</div>
        )}
      </div>
    </div>
  );
}
