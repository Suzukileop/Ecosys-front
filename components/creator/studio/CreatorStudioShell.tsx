'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { RailGlyph } from '@/components/home/NewsDiscoverRail';
import { CreatorProfileHeader, CREATOR_PROFILE_IMAGE_ACCEPT } from '@/components/creator/CreatorProfileHeader';
import {
  PROFILE_MOBILE_ICON_BUTTON,
  PROFILE_MOBILE_PRIMARY_BUTTON,
  PROFILE_MOBILE_SOFT_BUTTON,
} from '@/components/creator/creator-profile-header-types';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import { EditIntroModal } from '@/components/creator/studio/EditIntroModal';
import { ProfileStrengthMeter } from '@/components/creator/studio/ProfileStrengthMeter';
import type { ProfileCompleteness, ProfileCompletenessAction } from '@/lib/profile-completeness';
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
import { useT } from '@/lib/i18n/I18nProvider';

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
  /** Action pinned under the "Manage" rail (desktop) — the "Publish a post" button, Content tab only. */
  railFooter?: ReactNode;
  /** The owner's public profile (/providers/<id>) — the header's "View public profile" action. */
  publicProfileHref?: string | null;
  /** Opens the post composer — the phone header's primary action. Pass it only where publishing is
   *  the page's job (the Content tab); without it "Edit profile" becomes the phone primary. */
  onPublish?: () => void;
  /** After the "Edit intro" dialog saves — refetch the header data here. */
  onIntroSaved?: () => void | Promise<void>;
  /** Owner's profile completeness — drives the "Profile N% complete" meter (hidden when null / 100%). */
  profileCompleteness?: ProfileCompleteness | null;
  /** The meter's "Publish your first post" step: open the composer (switching to Content if needed). */
  onStartPost?: () => void;
};

/**
 * The Manage rail's icons, drawn like the News rail's (RailGlyph: 20px, 24-unit box, round caps, no
 * fill) — one simple picture per section, no two sharing an outline.
 */
const STUDIO_TAB_ICONS: Record<CreatorStudioTab, ReactNode> = {
  /* A page with a pen: your posts. */
  content: (
    <>
      <path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <path d="M18.4 2.6a2 2 0 0 1 2.8 2.8L12 14.6l-3.5.9.9-3.5z" />
    </>
  ),
  /* A briefcase. */
  services: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
      <path d="M3 12.5h18" />
    </>
  ),
  /* A parcel. */
  products: (
    <>
      <path d="m12 3-8 4v10l8 4 8-4V7z" />
      <path d="m4 7 8 4 8-4" />
      <path d="M12 11v10" />
    </>
  ),
  /* A picture. */
  images: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="m21 15.5-5-5L5 20" />
    </>
  ),
  /* An eye. */
  visitors: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  /* Two people. */
  subscribers: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
      <path d="M21.5 20a6.5 6.5 0 0 0-4-6.1" />
    </>
  ),
  /* An ID card. */
  profile: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 16a3 3 0 0 1 6 0" />
      <path d="M14.5 10h3.5" />
      <path d="M14.5 13.5h3.5" />
    </>
  ),
};

/** Owner icon actions next to the name: 36px round outline buttons with a tooltip. */
const HEADER_ICON_ACTION =
  'group relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#0F1419] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[rgba(15,20,25,0.06)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] dark:text-[#E7E9EA] dark:shadow-[inset_0_0_0_1px_#536471] dark:hover:bg-[rgba(231,233,234,0.1)]';

/** "View as visitor": the same 36px outline, widened from lg into a pill that names itself. */
const HEADER_VISITOR_ACTION =
  'group relative inline-flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold text-[#0F1419] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[rgba(15,20,25,0.06)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] lg:w-auto lg:px-3.5 dark:text-[#E7E9EA] dark:shadow-[inset_0_0_0_1px_#536471] dark:hover:bg-[rgba(231,233,234,0.1)]';

/**
 * A visible tooltip under an icon action, on hover and on keyboard focus (the native `title` shows
 * late, never on focus, and not at all on touch). Ink chip, inverted in dark mode. `hideFromLg` drops
 * it where the control already carries its own visible label.
 */
function HeaderActionTooltip({ label, hideFromLg = false }: { label: string; hideFromLg?: boolean }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0F1419] px-2 py-1 text-[12px] font-semibold leading-4 text-white opacity-0 shadow-xs transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-[#E7E9EA] dark:text-[#0F1419] ${
        hideFromLg ? 'lg:hidden' : ''
      }`}
    >
      {label}
    </span>
  );
}

/**
 * Phone / tablet section tabs: one horizontal row that scrolls. Edge fades show there is more on
 * either side (the old row cut "Pr…" off at the screen edge with no hint), and the active tab is
 * scrolled into view whenever it changes.
 */
function StudioTabsRow({
  items,
  active,
  align,
  onSelect,
}: {
  items: { id: CreatorStudioTab; label: string }[];
  active: CreatorStudioTab;
  align: CreatorStudioTabNavAlign;
  onSelect: (tab: CreatorStudioTab) => void;
}) {
  const t = useT();
  const scrollerRef = useRef<HTMLElement>(null);
  const [fade, setFade] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const left = el.scrollLeft > 4;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    setFade((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const activeEl = el.querySelector<HTMLElement>('[aria-current="page"]');
    if (activeEl) {
      const target = activeEl.offsetLeft - (el.clientWidth - activeEl.offsetWidth) / 2;
      el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }
    measure();
  }, [active, measure]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const mask =
    fade.left || fade.right
      ? `linear-gradient(to right, ${fade.left ? 'transparent 0, #000 40px' : '#000 0'}, ${
          fade.right ? '#000 calc(100% - 40px), transparent 100%' : '#000 100%'
        })`
      : undefined;

  return (
    <nav
      ref={scrollerRef}
      onScroll={measure}
      style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
      className={`flex min-w-0 gap-1 overflow-x-auto px-2 [scrollbar-width:none] sm:px-0 [&::-webkit-scrollbar]:hidden ${creatorStudioTabNavAlignClass(align)}`}
      aria-label={t('Profile sections')}
    >
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? 'page' : undefined}
            data-pf-no-color-transition
            className={`relative flex h-12 shrink-0 items-center px-3 text-[15px] transition-colors hover:bg-[color:var(--gn-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)] ${
              isActive ? 'font-bold text-[color:var(--gn-ink)]' : 'font-medium text-[color:var(--gn-ink2)]'
            }`}
          >
            {t(item.label)}
            {isActive ? (
              <span aria-hidden className="absolute inset-x-3 bottom-0 h-1 rounded-full bg-[color:var(--gn-ink)]" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

export function CreatorStudioShell({
  tab,
  onTabChange,
  header,
  children,
  uploadingAvatar = false,
  onAvatarSelect,
  railAction,
  railFooter,
  publicProfileHref,
  onPublish,
  onIntroSaved,
  profileCompleteness,
  onStartPost,
}: CreatorStudioShellProps) {
  const t = useT();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  /* The "Edit intro" dialog, and whichever control opened it (the pencil, or the phone button) so
     focus can go back to it on close. */
  const [introOpen, setIntroOpen] = useState(false);
  const introTriggerRef = useRef<HTMLElement | null>(null);
  const openIntro = (trigger: HTMLElement) => {
    introTriggerRef.current = trigger;
    setIntroOpen(true);
  };

  const handle = header.email;
  const pickAvatar = () => avatarInputRef.current?.click();
  const appRole = normalizeCreatorAppRole(header.appRole);
  const visibleTabs = CREATOR_STUDIO_TABS.filter((item) => {
    if (item.id === 'products') return creatorCanAccessProfileProducts(appRole);
    if (item.id === 'services') return creatorCanAccessProfileServices(appRole);
    return true;
  });

  const selectTab = (next: CreatorStudioTab) => onTabChange(next);

  /* The strength meter's in-page next steps: the intro fields open "Edit intro" (focus returns to the
     meter's link on close), the photo opens the avatar's own picker, a first post opens the composer. */
  const runStrengthAction = (
    action: Exclude<ProfileCompletenessAction, { kind: 'link' }>,
    trigger: HTMLElement
  ) => {
    if (action.kind === 'intro') openIntro(trigger);
    else if (action.kind === 'photo') pickAvatar();
    else onStartPost?.();
  };

  /* Owner actions beside the name: edit the intro in place (LinkedIn-style — the "Edit intro" dialog
     covers what this header shows; username and email stay in Settings › Account) and "View as
     visitor" (the public profile, as others see it). Both get a visible tooltip on hover / focus.
     From lg, where the identity column is wide, "View as visitor" also spells itself out (eye +
     label); below lg it stays a 36px icon so the name row doesn't wrap. The photo is changed by
     clicking the avatar itself. */
  const headerActions = (
    <>
      <button
        type="button"
        onClick={(e) => openIntro(e.currentTarget)}
        className={HEADER_ICON_ACTION}
        aria-label={t('Edit intro')}
        aria-haspopup="dialog"
      >
        <svg aria-hidden className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
          <path d="m13.5 8.5 3 3" />
        </svg>
        <HeaderActionTooltip label={t('Edit intro')} />
      </button>
      {publicProfileHref ? (
        <Link href={publicProfileHref} className={HEADER_VISITOR_ACTION} aria-label={t('View as visitor')}>
          <svg aria-hidden className="h-[17px] w-[17px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span aria-hidden className="hidden whitespace-nowrap lg:inline">
            {t('View as visitor')}
          </span>
          <HeaderActionTooltip label={t('View as visitor')} hideFromLg />
        </Link>
      ) : null}
    </>
  );

  const strengthMeter = (variant: 'rail' | 'inline') =>
    profileCompleteness ? (
      <ProfileStrengthMeter completeness={profileCompleteness} variant={variant} onAction={runStrengthAction} />
    ) : null;

  return (
    /* The navbar's frame (1240px inside 32 / 48 / 64px gutters — NAVBAR_FRAME_CLASS). Phones stay edge
       to edge. */
    <div className="news-theme news-feed news-mono mx-auto w-full max-w-[1368px] pb-16 pt-0 sm:px-8 md:px-12 lg:px-16">
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

      <CreatorProfileHeader
        railAligned
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
        shopLabel={t('Manage shop')}
        editable
        uploadingAvatar={uploadingAvatar}
        onAvatarPick={pickAvatar}
        nameActions={headerActions}
        mobileActions={
          /* Phone action row. "Publish" leads only on the Content tab (the page passes onPublish there
             alone); on every other tab "Edit profile" takes the ink primary slot instead. */
          <>
            {onPublish ? (
              <button type="button" onClick={onPublish} className={PROFILE_MOBILE_PRIMARY_BUTTON}>
                <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {t('Publish')}
              </button>
            ) : null}
            <button
              type="button"
              onClick={(e) => openIntro(e.currentTarget)}
              aria-haspopup="dialog"
              className={onPublish ? PROFILE_MOBILE_SOFT_BUTTON : PROFILE_MOBILE_PRIMARY_BUTTON}
            >
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
              </svg>
              {t('Edit profile')}
            </button>
            {publicProfileHref ? (
              <Link
                href={publicProfileHref}
                className={PROFILE_MOBILE_ICON_BUTTON}
                aria-label={t('View as visitor')}
                title={t('View as visitor')}
              >
                <svg aria-hidden className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </Link>
            ) : null}
          </>
        }
      />

      <EditIntroModal
        open={introOpen}
        onClose={() => setIntroOpen(false)}
        onSaved={onIntroSaved}
        returnFocusRef={introTriggerRef}
      />

      {/* From lg: reading (content) on the left, navigation / actions on the right in a 320px rail — the
          same outlined box as the News page's "Looking for?", so no dividing line is needed between
          them. The grid has no top margin there; each column pads itself. */}
      <div className="mt-1 grid items-start gap-8 sm:mt-6 lg:mt-0 lg:grid-cols-[minmax(0,1fr)_20rem] xl:gap-12">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1 lg:pt-8">
          {/* Phones / tablets have no rail: the strength meter is one line between the header and the
              section tabs. */}
          <div className="lg:hidden">{strengthMeter('inline')}</div>
          <div className="lg:hidden">
            <StudioTabsRow items={visibleTabs} active={tab} align={header.tabNavAlign} onSelect={selectTab} />
          </div>

          <div className={`pt-4 sm:pt-6 lg:pt-0 ${tab === 'content' ? '' : 'px-4 sm:px-0'}`}>{children}</div>
        </div>

        <div className="hidden self-stretch pb-8 pt-8 lg:col-start-2 lg:row-start-1 lg:block">
          <ProfileSectionStickyAside
            className="w-full"
            surfaceClassName="flex w-full max-w-full min-w-0 flex-col gap-6"
          >
            {/* Profile strength first: a status about the whole profile, above the box that navigates it. */}
            {strengthMeter('rail')}
            {railAction}
            {/* The News rail's "Looking for?" box, as is: a hairline frame with no fill (`.gn-rail-box`),
                a bold 20px title, full-width 48px rows with 20px stroke icons in ink. The open section
                is marked exactly like News's selected interest: bold label, heavier icon, a check on the
                right; the fill tone (#EFF3F4) only under the pointer. */}
            <section className="gn-rail-box flex min-h-0 flex-col px-px pb-2 pt-5" aria-labelledby="studio-manage-title">
              <h2
                id="studio-manage-title"
                className="px-6 pb-2 pt-1 text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]"
              >
                {t('Manage')}
              </h2>
              <nav
                className="flex min-h-0 w-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label={t('Profile sections')}
              >
                {visibleTabs.map((item) => {
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectTab(item.id)}
                      aria-current={active ? 'page' : undefined}
                      data-pf-no-color-transition
                      className={`relative flex w-full items-center gap-3 px-6 py-3.5 text-left text-[15px] leading-5 text-[color:var(--gn-ink)] transition-colors duration-150 hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)] ${
                        active ? 'font-bold' : 'font-semibold'
                      }`}
                    >
                      <RailGlyph active={active}>{STUDIO_TAB_ICONS[item.id]}</RailGlyph>
                      <span className="min-w-0 flex-1 truncate">{t(item.label)}</span>
                      {active ? (
                        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="m5 12.5 4.5 4.5L19 7.5" />
                        </svg>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </section>
            {railFooter}
          </ProfileSectionStickyAside>
        </div>
      </div>
    </div>
  );
}
