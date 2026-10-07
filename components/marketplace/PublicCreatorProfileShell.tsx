'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
import { CreatorFollowButton } from '@/components/marketplace/CreatorFollowButton';
import { CreatorStarButton } from '@/components/marketplace/CreatorStarButton';
import { OrderCreatorCta } from '@/components/marketplace/OrderCreatorCta';
import { CreatorProfileViewTracker } from '@/components/marketplace/CreatorProfileViewTracker';
import { CreatorProfileServicesTab } from '@/components/marketplace/CreatorProfileServicesTab';
import { ProductCard, marketplaceProductGridClassName } from '@/components/marketplace/ProductCard';
import { usePresence } from '@/hooks/usePresence';
import type { MarketplaceCreatorPublicProfile, MarketplaceProductSummary } from '@/types/marketplace';
import { filterActiveServices } from '@/lib/profile-services';
import {
  creatorCanAccessProfileProducts,
  creatorCanAccessProfileServices,
  normalizeCreatorAppRole,
} from '@/lib/creator-app-role';

type PublicCreatorProfileTab = 'content' | 'products' | 'info' | 'services';

const PUBLIC_CREATOR_TABS: { id: PublicCreatorProfileTab; label: string }[] = [
  { id: 'info', label: 'Info' },
  { id: 'services', label: 'Services' },
  { id: 'content', label: 'Content' },
  { id: 'products', label: 'Products' },
];

function parsePublicTab(value: string | null): PublicCreatorProfileTab {
  if (
    value === 'content' ||
    value === 'products' ||
    value === 'info' ||
    value === 'services'
  ) {
    return value;
  }
  return 'info';
}

function readTabFromLocation(): PublicCreatorProfileTab {
  if (typeof window === 'undefined') return 'info';
  return parsePublicTab(new URLSearchParams(window.location.search).get('tab'));
}

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

  const [tab, setTab] = useState<PublicCreatorProfileTab>('info');
  const [profileVisits, setProfileVisits] = useState(profile.profileVisits ?? 0);
  const [followerCount, setFollowerCount] = useState(profile.followerCount ?? 0);
  const [isFollowing, setIsFollowing] = useState(Boolean(profile.isFollowing));
  const [starCount, setStarCount] = useState(profile.starCount ?? 0);
  const [isStarred, setIsStarred] = useState(Boolean(profile.isStarred));
  const activeServiceCount = filterActiveServices(profile.profileServices ?? []).length;

  useEffect(() => {
    setFollowerCount(profile.followerCount ?? 0);
    setIsFollowing(Boolean(profile.isFollowing));
  }, [profile.followerCount, profile.isFollowing, creatorId]);

  useEffect(() => {
    setStarCount(profile.starCount ?? 0);
    setIsStarred(Boolean(profile.isStarred));
  }, [profile.starCount, profile.isStarred, creatorId]);

  useEffect(() => {
    const next = readTabFromLocation();
    if (next === 'products' && !showProducts) {
      setTab('info');
      return;
    }
    if (next === 'services' && !showServices) {
      setTab('info');
      return;
    }
    setTab(next);
  }, [showProducts, showServices]);

  const selectTab = (next: PublicCreatorProfileTab) => {
    if (next === 'products' && !showProducts) return;
    if (next === 'services' && !showServices) return;
    setTab(next);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (next === 'info') url.searchParams.delete('tab');
      else url.searchParams.set('tab', next);
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  };

  return (
    <div className={`${PORTFOLIO_FRAME_CLASS} min-w-0 overflow-x-hidden pb-24 pt-3 max-sm:px-0 sm:pt-10`}>
      <CreatorProfileViewTracker creatorId={creatorId} onVisitRecorded={setProfileVisits} />
      <div>
        <CreatorProfileHeader
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
                onStarChange={(starred, count) => {
                  setIsStarred(starred);
                  setStarCount(count);
                }}
              />
              <Link
                href={buildCreatorPortfolioPath(creatorId, profile.username)}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-[15px] font-medium text-neutral-700 transition-colors hover:text-[#111111] dark:text-neutral-300 dark:hover:text-white"
              >
                View portfolio
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

      <div>
        <div className="mt-6 flex items-end justify-between gap-4 border-b border-black/[0.08] px-5 dark:border-white/[0.08] sm:mt-16 sm:px-0">
          <nav
            className={`flex min-w-0 flex-1 gap-7 overflow-x-auto [scrollbar-width:none] sm:gap-10 [&::-webkit-scrollbar]:hidden ${creatorStudioTabNavAlignClass(tabNavAlign)}`}
            aria-label="Creator profile sections"
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
                  className={`relative inline-flex shrink-0 items-baseline gap-1.5 pb-3.5 pt-1 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 dark:focus-visible:ring-white/25 sm:pb-4 sm:text-base ${
                    active
                      ? 'text-[#0A0A0A] dark:text-white'
                      : 'text-[#222222]/60 hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                  {badge ? (
                    <span className="text-[14px] font-normal text-neutral-500 dark:text-neutral-400">
                      {badge}
                    </span>
                  ) : null}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[#111111] dark:bg-white" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pt-8 sm:pt-16">
        {tab === 'content' && (
          <div className="px-5 sm:px-0">
            <CreatorProfileContentTab creatorId={creatorId} creatorName={profile.fullName} />
          </div>
        )}

        {tab === 'products' && showProducts && (
          <div className="space-y-6 sm:space-y-10">
            <div className="flex items-end justify-between gap-x-6 gap-y-4 px-5 sm:flex-wrap sm:px-0">
              <div className="min-w-0">
                <h2 className="text-[1.375rem] font-semibold tracking-[-0.015em] text-[#111111] dark:text-white sm:text-[1.5rem]">
                  Products
                </h2>
                <p className="mt-1 text-[15px] text-neutral-500 dark:text-neutral-400 sm:mt-2 sm:text-[1rem] sm:text-neutral-600 sm:dark:text-neutral-300">
                  {products.length} published product{products.length !== 1 ? 's' : ''}.
                </p>
              </div>
              {products.length > 0 ? (
                <Link
                  href={`/providers/${encodeURIComponent(creatorId)}/shop`}
                  className="group inline-flex h-10 shrink-0 items-center gap-2 text-[15px] font-medium text-[#111111] transition-colors dark:text-white sm:h-11 sm:rounded-lg sm:border sm:border-black/10 sm:px-5 sm:hover:border-black/25 sm:dark:border-white/15 sm:dark:hover:border-white/30"
                >
                  Explore shop
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
              <p className="px-5 py-16 text-center text-[1.0625rem] text-neutral-500 dark:text-neutral-400 sm:py-20">
                No products published yet.
              </p>
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
          <div className="px-5 sm:px-0">
            <CreatorProfileServicesTab creatorId={creatorId} profile={profile} />
          </div>
        )}

        {tab === 'info' && (
          <div className="px-5 sm:px-0">
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
  );
}
