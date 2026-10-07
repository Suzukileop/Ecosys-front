'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { getCreatorFollowStats, listCreatorProducts } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { formatLocationLabel } from '@/lib/geolocation';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioHubSkeleton, CreatorStudioTabPanelSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { uploadUserAvatar } from '@/lib/user-profile-api';
import { usePendingNavigation } from '@/hooks/usePendingNavigation';
import { CreatorStudioShell, type CreatorStudioHeaderData } from './CreatorStudioShell';
import { parseCreatorStudioHeaderLayout } from './creator-studio-header';
import { parseCreatorStudioHeaderContentStyle } from './creator-studio-header-content';
import { parseCreatorStudioTabNavAlign } from './creator-studio-layout';
import { CreatorStudioContentTab } from './CreatorStudioContentTab';
import { CreatorStudioServicesTab } from './CreatorStudioServicesTab';
import { CreatorStudioProductsReadonlyTab } from './CreatorStudioProductsReadonlyTab';
import { CreatorStudioProfileTab } from './CreatorStudioProfileTab';
import { STORE_INFORMATION_SECTION_IDS } from './profile-section-nav';
import { CreatorStudioVisitorsTab } from './CreatorStudioVisitorsTab';
import { CreatorStudioSubscribersTab } from './CreatorStudioSubscribersTab';
import { CreatorStudioImagesTab } from './CreatorStudioImagesTab';
import { parseCreatorStudioTab, type CreatorStudioTab } from './types';
import type { CreatorProfileDto } from '@/types/profile';
import { parseSpecialtyList, parseSpecialtyTags } from '@/lib/specialties';
import { filterActiveServices } from '@/lib/profile-services';
import {
  creatorCanAccessMyProducts,
  creatorCanAccessProfileProducts,
  creatorCanAccessProfileServices,
  normalizeCreatorAppRole,
} from '@/lib/creator-app-role';
import { SIGNED_IN_HOME } from '@/lib/routes';

function CreatorStudioPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, hasRole, updateUser } = useAuth();
  const tab = parseCreatorStudioTab(searchParams.get('tab'));
  const { isTransitioning: isTabTransitioning, startTransition: startTabTransition, preview: previewTab } =
    usePendingNavigation(tab);

  const [headerLoading, setHeaderLoading] = useState(true);
  const [header, setHeader] = useState<CreatorStudioHeaderData | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  // Create flow lives in My Product — redirect legacy ?create=1 from profile.
  useEffect(() => {
    if (searchParams.get('tab') !== 'products' || searchParams.get('create') !== '1') return;
    if (header && !creatorCanAccessMyProducts(normalizeCreatorAppRole(header.appRole))) {
      router.replace('/profile?tab=content', { scroll: false });
      return;
    }
    if (!header) return;
    router.replace('/my-products?create=1');
  }, [header, router, searchParams]);

  // Role-gated studio tabs: bounce away from Products / Services when hidden.
  useEffect(() => {
    if (!header) return;
    const role = normalizeCreatorAppRole(header.appRole);
    if (tab === 'products' && !creatorCanAccessProfileProducts(role)) {
      router.replace('/profile?tab=content', { scroll: false });
      return;
    }
    if (tab === 'services' && !creatorCanAccessProfileServices(role)) {
      router.replace('/profile?tab=content', { scroll: false });
    }
  }, [header, router, tab]);

  const loadHeader = useCallback(async (options?: { silent?: boolean }) => {
    if (!user) return;
    try {
      if (!options?.silent) {
        setHeaderLoading(true);
      }
      const [profileRes, followStatsRes, productsRes] = await Promise.all([
        api.get<CreatorProfileDto>('/api/creator/profile'),
        getCreatorFollowStats(user.id).catch(() => ({ followerCount: 0, isFollowing: false })),
        listCreatorProducts(0, 1).catch(() => ({ content: [], totalElements: 0 })),
      ]);

      const profile = profileRes.data;
      const nextAvatar = profile.avatarUrl ?? user.avatarUrl ?? null;

      setHeader({
        fullName: profile.fullName ?? user.fullName,
        email: user.email,
        avatarUrl: nextAvatar,
        bio: profile.bio ?? null,
        specialite: profile.specialite ?? null,
        specialties: parseSpecialtyList(profile.specialties, profile.specialite),
        specialtyTags: parseSpecialtyTags(profile.specialtyTags),
        followerCount: followStatsRes.followerCount ?? 0,
        productCount: productsRes.totalElements ?? productsRes.content.length,
        serviceCount: filterActiveServices(profile.profileServices ?? []).length,
        profileVisits: profile.profileVisits ?? 0,
        isAvailable: profile.isAvailable ?? true,
        availabilityLabel: profile.availabilityLabel ?? null,
        starCount: profile.starCount ?? 0,
        locationLabel: formatLocationLabel(
          profile.locationCity,
          profile.locationCountry,
          profile.nationality
        ),
        appRole: profile.appRole ?? null,
        headerLayout: parseCreatorStudioHeaderLayout(profile.studioHeaderLayout),
        headerContentStyle: parseCreatorStudioHeaderContentStyle(profile.studioHeaderContentStyle),
        tabNavAlign: parseCreatorStudioTabNavAlign(profile.studioTabNavAlign),
        contentHeadline: profile.studioContentHeadline ?? null,
      });
      // Only sync auth when the avatar actually changes — unconditional updateUser
      // recreates the user object and retriggers this load (header flicker loop).
      if (nextAvatar && nextAvatar !== user.avatarUrl) {
        updateUser({ avatarUrl: nextAvatar });
      }
    } catch {
      setHeader({
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl ?? null,
        bio: null,
        specialite: null,
        specialties: [],
        specialtyTags: [],
        followerCount: 0,
        productCount: 0,
        serviceCount: 0,
        profileVisits: 0,
        isAvailable: true,
        availabilityLabel: null,
        appRole: null,
        headerLayout: 'BANNER',
        headerContentStyle: 'DEFAULT',
        tabNavAlign: 'LEFT',
        contentHeadline: null,
      });
    } finally {
      setHeaderLoading(false);
    }
  }, [user, updateUser]);

  useEffect(() => {
    if (isLoading || !user || !hasRole('ROLE_CREATOR')) return;
    void loadHeader();
    // Only boot once per creator session — loadHeader identity must not re-run this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prevent store header flicker loop
  }, [isLoading, user?.id]);

  useEffect(() => {
    if (!isLoading && user && !hasRole('ROLE_CREATOR')) {
      router.replace(SIGNED_IN_HOME);
    }
  }, [isLoading, user, hasRole, router]);

  const setTab = (next: CreatorStudioTab) => {
    if (next === tab) return;
    startTabTransition(next);
    router.replace(`/profile?tab=${next}`, { scroll: false });
  };

  const onAvatarSelect = async (file: File) => {
    setImageError(null);
    setUploadingAvatar(true);
    try {
      const updated = await uploadUserAvatar(file);
      updateUser({ avatarUrl: updated.avatarUrl, fullName: updated.fullName });
      await loadHeader();
    } catch (e) {
      setImageError(getApiErrorMessage(e, 'Unable to upload profile photo.'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (isLoading || !user) {
    return <CreatorStudioHubSkeleton tab={tab} />;
  }

  if (!hasRole('ROLE_CREATOR')) return null;

  if (headerLoading || !header) {
    return <CreatorStudioHubSkeleton tab={tab} />;
  }

  return (
    <>
      {imageError && (
        <div className="mx-auto mb-4 max-w-[1280px] px-4 sm:px-6">
          <ErrorAlert message={imageError} onDismiss={() => setImageError(null)} />
        </div>
      )}
      <CreatorStudioShell
        tab={isTabTransitioning ? previewTab : tab}
        onTabChange={setTab}
        header={header}
        uploadingAvatar={uploadingAvatar}
        onAvatarSelect={onAvatarSelect}
      >
      {isTabTransitioning ? (
        <CreatorStudioTabPanelSkeleton tab={previewTab} />
      ) : (
        <>
          {tab === 'content' && (
            <CreatorStudioContentTab
              specialite={header.specialite}
              specialties={header.specialties}
              appRole={header.appRole}
              publishOpen={publishOpen}
              onPublishOpenChange={setPublishOpen}
            />
          )}
          {tab === 'services' && (
            <CreatorStudioServicesTab />
          )}
          {tab === 'products' && <CreatorStudioProductsReadonlyTab />}
          {tab === 'images' && (
            <CreatorStudioImagesTab onImagesUpdated={() => void loadHeader({ silent: true })} />
          )}
          {tab === 'visitors' && <CreatorStudioVisitorsTab />}
          {tab === 'subscribers' && <CreatorStudioSubscribersTab />}
          {tab === 'profile' && (
            <CreatorStudioProfileTab
              variant="portfolio"
              portfolioNavSide="left"
              allowedSections={STORE_INFORMATION_SECTION_IDS}
              sectionsNavTitle="Information"
              sectionsNavPlacement="top"
              showProfileHero={false}
              onProfileUpdated={() => void loadHeader({ silent: true })}
            />
          )}
        </>
      )}
    </CreatorStudioShell>
    </>
  );
}

export function CreatorStudioPage() {
  return (
    <DashboardHomeShell fullWidth>
      <CreatorStudioPageInner />
    </DashboardHomeShell>
  );
}
