'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import { CreatorProfileHeader } from '@/components/creator/CreatorProfileHeader';
import { buildCreatorPortfolioPath } from '@/lib/portfolio-url';
import { PORTFOLIO_FRAME_CLASS } from '@/components/portfolio/portfolioFrame';
import {
  creatorStudioTabNavAlignClass,
  type CreatorStudioTabNavAlign,
} from '@/components/creator/studio/creator-studio-layout';
import type { CreatorStudioHeaderLayout } from '@/components/creator/studio/creator-studio-header';
import type { CreatorStudioHeaderContentStyle } from '@/components/creator/studio/creator-studio-header-content';
import { CreatorProfileContentTab } from '@/components/marketplace/CreatorProfileContentTab';
import { CreatorProfileContactSection } from '@/components/marketplace/CreatorProfileContactSection';
import {
  CreatorProfileContactRail,
  CreatorProfileHeaderLinks,
  creatorHasContactChannels,
} from '@/components/marketplace/CreatorProfileHeaderLinks';
import { CreatorFollowButton } from '@/components/marketplace/CreatorFollowButton';
import { CreatorStarButton } from '@/components/marketplace/CreatorStarButton';
import { OrderCreatorCta } from '@/components/marketplace/OrderCreatorCta';
import { ContentPostDialogShell } from '@/components/creator/ContentPostDialogShell';
import {
  PROFILE_MOBILE_ICON_BUTTON,
  PROFILE_MOBILE_SOFT_BUTTON,
} from '@/components/creator/creator-profile-header-types';
import { CreatorProfileViewTracker } from '@/components/marketplace/CreatorProfileViewTracker';
import { CreatorProfileServicesTab } from '@/components/marketplace/CreatorProfileServicesTab';
import { ProductCard, marketplaceProductGridClassName } from '@/components/marketplace/ProductCard';
import { PROVIDER_SECONDARY_BUTTON_CLASS } from '@/components/marketplace/ProviderDirectoryPrimitives';
import { usePresence } from '@/hooks/usePresence';
import type { MarketplaceCreatorPublicProfile, MarketplaceProductSummary } from '@/types/marketplace';
import { filterActiveServices } from '@/lib/profile-services';
import {
  creatorCanAccessProfileProducts,
  creatorCanAccessProfileServices,
  normalizeCreatorAppRole,
} from '@/lib/creator-app-role';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

type PublicCreatorProfileTab = 'content' | 'products' | 'info' | 'services';

/* Commercial order: what you can buy first (Services), then who the creator is (Info) — the two
   stay separate tabs, Services opening by default when the creator has active services. */
const PUBLIC_CREATOR_TABS: { id: PublicCreatorProfileTab; label: string }[] = [
  { id: 'services', label: msg('Services') },
  { id: 'info', label: msg('Info') },
  { id: 'content', label: msg('Content') },
  { id: 'products', label: msg('Products') },
];

function parsePublicTab(value: string | null): PublicCreatorProfileTab | null {
  if (
    value === 'content' ||
    value === 'products' ||
    value === 'info' ||
    value === 'services'
  ) {
    return value;
  }
  return null;
}

function readTabFromLocation(): PublicCreatorProfileTab | null {
  if (typeof window === 'undefined') return null;
  return parsePublicTab(new URLSearchParams(window.location.search).get('tab'));
}

const PROFILE_TABS_ID = 'creator-profile-tabs';

type PublicCreatorProfileShellProps = {
  creatorId: string;
  profile: MarketplaceCreatorPublicProfile;
  isAuthenticated: boolean;
  products: MarketplaceProductSummary[];
  locationLabel: string | null;
  headerLayout: CreatorStudioHeaderLayout;
  headerContentStyle: CreatorStudioHeaderContentStyle;
  tabNavAlign: CreatorStudioTabNavAlign;
};

export function PublicCreatorProfileShell({
  creatorId,
  profile,
  isAuthenticated,
  products,
  locationLabel,
  headerLayout,
  headerContentStyle,
  tabNavAlign,
}: PublicCreatorProfileShellProps) {
  const t = useT();
  const appRole = normalizeCreatorAppRole(profile.appRole);
  const showProducts = creatorCanAccessProfileProducts(appRole);
  const { isOnline } = usePresence([creatorId]);
  const creatorOnline = isOnline(creatorId);
  const showServices = creatorCanAccessProfileServices(appRole);
  const visibleTabs = PUBLIC_CREATOR_TABS.filter((item) => {
    if (item.id === 'products') return showProducts;
    if (item.id === 'services') return showServices;
    return true;
  });

  const activeServiceCount = filterActiveServices(profile.profileServices ?? []).length;
  const hasServices = showServices && activeServiceCount > 0;
  const hasContactRail = creatorHasContactChannels(profile);
  /* The landing tab (no ?tab= in the URL): Services when there is something to order, else Info. */
  const defaultTab: PublicCreatorProfileTab = hasServices ? 'services' : 'info';
  const [tab, setTab] = useState<PublicCreatorProfileTab>(defaultTab);
  const [profileVisits, setProfileVisits] = useState(profile.profileVisits ?? 0);
  const [followerCount, setFollowerCount] = useState(profile.followerCount ?? 0);
  const [isFollowing, setIsFollowing] = useState(Boolean(profile.isFollowing));
  const [starCount, setStarCount] = useState(profile.starCount ?? 0);
  const [isStarred, setIsStarred] = useState(Boolean(profile.isStarred));
  /* Phones: the "Contact" sheet (star, portfolio, contact channels, links). */
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setFollowerCount(profile.followerCount ?? 0);
    setIsFollowing(Boolean(profile.isFollowing));
  }, [profile.followerCount, profile.isFollowing, creatorId]);

  useEffect(() => {
    setStarCount(profile.starCount ?? 0);
    setIsStarred(Boolean(profile.isStarred));
  }, [profile.starCount, profile.isStarred, creatorId]);

  useEffect(() => {
    const next = readTabFromLocation() ?? defaultTab;
    if (next === 'products' && !showProducts) {
      setTab('info');
      return;
    }
    if (next === 'services' && !showServices) {
      setTab('info');
      return;
    }
    setTab(next);
  }, [defaultTab, showProducts, showServices]);

  const selectTab = (next: PublicCreatorProfileTab) => {
    if (next === 'products' && !showProducts) return;
    if (next === 'services' && !showServices) return;
    setTab(next);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (next === defaultTab) url.searchParams.delete('tab');
      else url.searchParams.set('tab', next);
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  };

  return (
    <div
      // The navbar's frame (1240px + its gutters — NAVBAR_FRAME_CLASS), like My Profile.
      className={`providers-x news-theme news-feed news-mono ${PORTFOLIO_FRAME_CLASS} !max-w-[1368px] min-w-0 overflow-x-hidden pb-24 pt-0 max-sm:px-0`}
    >
      <CreatorProfileViewTracker creatorId={creatorId} onVisitRecorded={setProfileVisits} />

      {/* Phones: what the desktop header and right rail show (star, portfolio, contact, links), one tap away. */}
      <ContentPostDialogShell open={moreOpen} title={profile.fullName} onClose={() => setMoreOpen(false)}>
        <div className="flex flex-col gap-6 px-2 pb-6 pt-1">
          <div className="flex gap-2 px-3 [&>*]:flex-1 [&_a]:w-full [&_button]:w-full">
            <div className="empty:hidden">
              <CreatorStarButton
                size="sm"
                showCount={false}
                creatorId={creatorId}
                initialStarred={isStarred}
                initialStarCount={starCount}
                onStarChange={(starred, count) => {
                  setIsStarred(starred);
                  setStarCount(count);
                }}
              />
            </div>
            <Link
              href={buildCreatorPortfolioPath(creatorId, profile.username)}
              target="_blank"
              rel="noreferrer"
              className={PROFILE_MOBILE_SOFT_BUTTON}
            >
              {t('View portfolio ↗')}
            </Link>
          </div>
          <CreatorProfileContactRail profile={profile} />
        </div>
      </ContentPostDialogShell>
      <div>
        <CreatorProfileHeader
          railAligned
          layout={headerLayout}
          fullName={profile.fullName}
          handle=""
          avatarUrl={profile.avatarUrl}
          appRole={appRole}
          headerContentStyle={headerContentStyle}
          bio={profile.bio}
          specialite={profile.specialite}
          specialties={profile.specialties}
          specialtyTags={profile.specialtyTags}
          followerCount={followerCount}
          productCount={showProducts ? profile.productCount ?? 0 : 0}
          serviceCount={
            typeof profile.serviceCount === 'number' ? profile.serviceCount : activeServiceCount
          }
          showProductCount={showProducts}
          profileVisits={profileVisits}
          starCount={starCount}
          locationLabel={locationLabel}
          nationality={profile.nationality}
          isOnline={creatorOnline}
          isAvailable={profile.isAvailable}
          availabilityLabel={profile.availabilityLabel}
          isVerified={profile.isVerified}
          shopHref={`/providers/${creatorId}/shop`}
          headerLinks={
            <div className="lg:hidden">
              <CreatorProfileHeaderLinks profile={profile} />
            </div>
          }
          mobileActions={
            <>
              <div className="min-w-0 flex-1">
                <OrderCreatorCta
                  size="compact"
                  creatorId={creatorId}
                  creatorName={profile.fullName}
                  isAuthenticated={isAuthenticated}
                />
              </div>
              {/* Empty (hidden) on your own profile: there is nothing to follow. */}
              <div className="min-w-0 flex-1 empty:hidden [&>div]:w-full">
                <CreatorFollowButton
                  appearance="soft"
                  creatorId={creatorId}
                  initialFollowing={isFollowing}
                  initialFollowerCount={followerCount}
                  onFollowingChange={(following, count) => {
                    setIsFollowing(following);
                    setFollowerCount(count);
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                aria-haspopup="dialog"
                aria-label={t('Contact, links and more')}
                title={t('Contact, links and more')}
                className={PROFILE_MOBILE_ICON_BUTTON}
              >
                <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="1.8" />
                  <circle cx="12" cy="12" r="1.8" />
                  <circle cx="19" cy="12" r="1.8" />
                </svg>
              </button>
            </>
          }
          trailingActions={
            <>
              <OrderCreatorCta
                creatorId={creatorId}
                creatorName={profile.fullName}
                isAuthenticated={isAuthenticated}
              />
              <CreatorFollowButton
                creatorId={creatorId}
                initialFollowing={isFollowing}
                initialFollowerCount={followerCount}
                onFollowingChange={(following, count) => {
                  setIsFollowing(following);
                  setFollowerCount(count);
                }}
              />
              <CreatorStarButton
                creatorId={creatorId}
                initialStarred={isStarred}
                initialStarCount={starCount}
                showCount={false}
                onStarChange={(starred, count) => {
                  setIsStarred(starred);
                  setStarCount(count);
                }}
              />
              <Link
                href={buildCreatorPortfolioPath(creatorId, profile.username)}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-[15px] font-semibold text-[#536471] transition-colors hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:text-[#71767B] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]"
              >
                {t('View portfolio')}
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                >
                  ↗
                </span>
              </Link>
            </>
          }
        />
      </div>

      {/* From lg the page reads like My Profile: horizontal tabs + their content on the left, and on the
          right, behind one fine vertical hairline, the creator's Contact / Links (moved out of the header
          to keep it light). Below lg there is no rail: the header keeps them as a row of icons. */}
      <div
        id={PROFILE_TABS_ID}
        className={`scroll-mt-24 ${hasContactRail ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8 xl:gap-12' : ''}`}
      >
        <div className="min-w-0">
          <div className="mt-4 flex items-end justify-between gap-4 px-4 sm:mt-8 sm:px-0">
            <nav
              className={`flex min-w-0 flex-1 gap-7 overflow-x-auto [scrollbar-width:none] sm:gap-10 [&::-webkit-scrollbar]:hidden ${creatorStudioTabNavAlignClass(tabNavAlign)}`}
              aria-label={t('Creator profile sections')}
            >
              {visibleTabs.map((item) => {
                const active = tab === item.id;
                const badge = item.id === 'services' && activeServiceCount > 0 ? `${activeServiceCount}` : '';
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectTab(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative inline-flex min-h-11 shrink-0 items-center gap-1.5 pb-1 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 dark:focus-visible:ring-white/25 ${
                      active
                        ? 'font-bold text-[#0F1419] dark:text-[#E7E9EA]'
                        : 'font-medium text-[#536471] hover:text-[#0F1419] dark:text-[#71767B] dark:hover:text-[#E7E9EA]'
                    }`}
                  >
                    {t(item.label)}
                    {badge ? (
                      <span className="text-[13px] font-normal text-[#536471] dark:text-[#71767B]">{badge}</span>
                    ) : null}
                    {active && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#0F1419] dark:bg-[#E7E9EA]" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-5 sm:pt-8">
            {tab === 'content' && (
              <div className="px-4 sm:px-0">
                <CreatorProfileContentTab creatorId={creatorId} creatorName={profile.fullName} />
              </div>
            )}

            {tab === 'products' && showProducts && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-end justify-between gap-x-6 gap-y-4 px-4 sm:flex-wrap sm:px-0">
                  <div className="min-w-0">
                    <h2 className="text-[20px] font-extrabold tracking-[-0.015em] text-[#0F1419] dark:text-[#E7E9EA]">
                      {t('Products')}
                    </h2>
                    {products.length > 0 ? (
                      <p className="mt-1 text-[15px] text-[#536471] dark:text-[#71767B]">
                        {products.length} {t('published product')}{products.length !== 1 ? 's' : ''}
                      </p>
                    ) : null}
                  </div>
                  {products.length > 0 ? (
                    <Link
                      href={`/providers/${encodeURIComponent(creatorId)}/shop`}
                      className={`group ${PROVIDER_SECONDARY_BUTTON_CLASS} inline-flex h-10 shrink-0 items-center gap-2 rounded-none px-4 text-[14px] font-semibold transition-colors`}
                    >
                      {t('Explore shop')}
                      <span
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </Link>
                  ) : null}
                </div>
                {products.length === 0 ? (
                  <div className="gn-card bg-[#F7F9F9] px-6 py-16 text-center dark:bg-[#16181C]">
                    <p className="text-[15px] text-[#536471] dark:text-[#71767B]">{t('No products published yet.')}</p>
                  </div>
                ) : (
                  <div className={marketplaceProductGridClassName}>
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} showCreator={false} flushOnMobile />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'services' && showServices && (
              <div className="px-4 sm:px-0">
                <CreatorProfileServicesTab creatorId={creatorId} profile={profile} />
              </div>
            )}

            {tab === 'info' && (
              <div className="px-4 sm:px-0">
                <CreatorProfileContactSection
                  creatorId={creatorId}
                  profile={profile}
                  isAuthenticated={isAuthenticated}
                  locationLabel={locationLabel}
                />
              </div>
            )}
          </div>
        </div>

        {hasContactRail ? (
          <div className="gn-rail-edge hidden self-stretch pb-8 pl-5 pt-8 lg:block">
            <ProfileSectionStickyAside className="w-full" surfaceClassName="flex w-full max-w-full min-w-0 flex-col bg-transparent">
              <CreatorProfileContactRail profile={profile} />
            </ProfileSectionStickyAside>
          </div>
        ) : null}
      </div>
    </div>
  );
}
