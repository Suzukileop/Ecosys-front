'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreatorProfileHeader } from '@/components/creator/CreatorProfileHeader';
import { buildCreatorPortfolioPath } from '@/lib/portfolio-url';
import {
  creatorStudioTabNavAlignClass,
  type CreatorStudioTabNavAlign,
} from '@/components/creator/studio/creator-studio-layout';
import type { CreatorStudioHeaderLayout } from '@/components/creator/studio/creator-studio-header';
import type { CreatorStudioHeaderContentStyle } from '@/components/creator/studio/creator-studio-header-content';
import { CreatorProfileContentTab } from '@/components/marketplace/CreatorProfileContentTab';
import { CreatorProfileContactSection } from '@/components/marketplace/CreatorProfileContactSection';
import { CreatorProfileReviewsTab } from '@/components/marketplace/CreatorProfileReviewsTab';
import { CreatorProfileTrustStrip } from '@/components/marketplace/CreatorProfileTrustStrip';
import { CreatorFollowButton } from '@/components/marketplace/CreatorFollowButton';
import { OrderCreatorCta } from '@/components/marketplace/OrderCreatorCta';
import { CreatorProfileViewTracker } from '@/components/marketplace/CreatorProfileViewTracker';
import { CreatorProfileServicesTab } from '@/components/marketplace/CreatorProfileServicesTab';
import { ProductCard, marketplaceProductGridClassName } from '@/components/marketplace/ProductCard';
import type { MarketplaceCreatorPublicProfile, MarketplaceProductSummary } from '@/types/marketplace';
import { filterActiveServices } from '@/lib/profile-services';
import {
  creatorCanAccessProfileProducts,
  creatorCanAccessProfileServices,
  normalizeCreatorAppRole,
} from '@/lib/creator-app-role';

export type PublicCreatorProfileTab = 'content' | 'products' | 'reviews' | 'info' | 'services';

const PUBLIC_CREATOR_TABS: { id: PublicCreatorProfileTab; label: string }[] = [
  { id: 'info', label: 'Info' },
  { id: 'services', label: 'Services' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'content', label: 'Content' },
  { id: 'products', label: 'Products' },
];

function parsePublicTab(value: string | null): PublicCreatorProfileTab {
  if (
    value === 'content' ||
    value === 'products' ||
    value === 'reviews' ||
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
  const activeServiceCount = filterActiveServices(profile.profileServices ?? []).length;

  useEffect(() => {
    setFollowerCount(profile.followerCount ?? 0);
    setIsFollowing(Boolean(profile.isFollowing));
  }, [profile.followerCount, profile.isFollowing, creatorId]);

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
    <div className="mx-auto w-full min-w-0 max-w-[1280px] overflow-x-hidden">
      <CreatorProfileViewTracker creatorId={creatorId} onVisitRecorded={setProfileVisits} />
      {/* Same horizontal inset for header + trust metrics so left/right edges align. */}
      <div className="px-4 sm:px-6">
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
          averageRating={profile.averageRating}
          locationLabel={locationLabel}
          nationality={profile.nationality}
          isAvailable={profile.isAvailable}
          availabilityLabel={profile.availabilityLabel}
          isVerified={profile.isVerified}
          trailingActions={
            <>
              <Link
                href={buildCreatorPortfolioPath(creatorId)}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-neutral-200 bg-transparent px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
              >
                View portfolio
              </Link>
              <CreatorFollowButton
                creatorId={creatorId}
                initialFollowing={isFollowing}
                initialFollowerCount={followerCount}
                onFollowingChange={(following, count) => {
                  setIsFollowing(following);
                  setFollowerCount(count);
                }}
              />
              <OrderCreatorCta
                creatorId={creatorId}
                creatorName={profile.fullName}
                isAuthenticated={isAuthenticated}
              />
            </>
          }
        />

        <div className="mt-4">
          <CreatorProfileTrustStrip
            creatorId={creatorId}
            availabilityHours={profile.availabilityHours}
            timezoneId={profile.timezoneId}
          />
        </div>
      </div>

      <div className="px-4 sm:px-6">
        <div className="mt-4 flex items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800">
          <nav
            className={`flex min-w-0 flex-1 gap-1 overflow-x-auto ${creatorStudioTabNavAlignClass(tabNavAlign)}`}
            aria-label="Creator profile sections"
          >
            {visibleTabs.map((item) => {
              const active = tab === item.id;
              const badge =
                item.id === 'reviews' && profile.averageRating != null
                  ? ` ${profile.averageRating.toFixed(1)}★`
                  : item.id === 'services' && activeServiceCount > 0
                    ? ` ${activeServiceCount}`
                    : '';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTab(item.id)}
                  className={`relative shrink-0 px-4 py-3 text-sm font-semibold tracking-wide transition ${
                    active
                      ? 'text-neutral-900 dark:text-white'
                      : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                >
                  {item.label}
                  {badge}
                  {active && (
                    <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-orange-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="px-4 py-8 sm:px-6">
        {tab === 'content' && (
          <CreatorProfileContentTab creatorId={creatorId} creatorName={profile.fullName} />
        )}

        {tab === 'products' && showProducts && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Products</h2>
              <p className="mt-1 text-sm text-neutral-500">
                {products.length} published product{products.length !== 1 ? 's' : ''}.
              </p>
            </div>
            {products.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/50">
                No products published yet.
              </p>
            ) : (
              <div className={marketplaceProductGridClassName}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} showCreator={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <CreatorProfileReviewsTab creatorId={creatorId} creatorName={profile.fullName} />
        )}

        {tab === 'services' && showServices && (
          <CreatorProfileServicesTab creatorId={creatorId} profile={profile} />
        )}

        {tab === 'info' && (
          <CreatorProfileContactSection
            creatorId={creatorId}
            profile={profile}
            isAuthenticated={isAuthenticated}
            locationLabel={locationLabel}
          />
        )}
      </div>
    </div>
  );
}
