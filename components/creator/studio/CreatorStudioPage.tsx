'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { getCreatorFollowStats, listCreatorProducts } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { listMyContent } from '@/lib/creator-content-api';
import { computeProfileCompleteness } from '@/lib/profile-completeness';
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
import { NewsPublishButton } from '@/components/home/NewsDiscoverRail';
import { SIGNED_IN_HOME } from '@/lib/routes';
import { useT } from '@/lib/i18n/I18nProvider';

function CreatorStudioPageInner() {
  const t = useT();
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
  /* Bumped after an "Edit intro" save: remounts the Profile tab so it re-reads the profile instead of
     keeping its pre-edit copy (a later full-form save there would otherwise send the old bio back). */
  const [profileTabRevision, setProfileTabRevision] = useState(0);
  /* Inputs of the "Profile strength" meter: the full profile DTO the header is built from, plus the
     active post count (null when that lookup failed — the meter then leaves posts out). */
  const [profileDto, setProfileDto] = useState<CreatorProfileDto | null>(null);
  const [postCount, setPostCount] = useState<number | null>(null);
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
      const [profileRes, followStatsRes, productsRes, postsRes] = await Promise.all([
        api.get<CreatorProfileDto>('/api/creator/profile'),
        getCreatorFollowStats(user.id).catch(() => ({ followerCount: 0, isFollowing: false })),
        listCreatorProducts(0, 1).catch(() => ({ content: [], totalElements: 0 })),
        // One-item page: only totalElements is used (the strength meter's "first post" step).
        listMyContent('active', 0, 1).catch(() => null),
      ]);

      const profile = profileRes.data;
      setProfileDto(profile);
      setPostCount(postsRes ? postsRes.totalElements : null);
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
      setProfileDto(null);
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

  const profileCompleteness = useMemo(
    () =>
      profileDto && header
        ? computeProfileCompleteness({
            profile: profileDto,
            avatarUrl: header.avatarUrl,
            productCount: header.productCount,
            postCount,
          })
        : null,
    [profileDto, header, postCount]
  );

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
      setImageError(getApiErrorMessage(e, t('Unable to upload profile photo.')));
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

  /* The tab on screen (the pending one while a switch loads) decides the page's primary action:
     "Publish a post" (rail) and "Publish" (phone row) belong to the Content tab only — on Services,
     Visitors, Profile… publishing a post is not what the page is for. */
  const shownTab = isTabTransitioning ? previewTab : tab;
  const openComposer = () => {
    if (tab !== 'content') setTab('content');
    setPublishOpen(true);
  };

  return (
    <>
      {imageError && (
        <div className="mx-auto mb-4 max-w-[1280px] px-4 sm:px-6">
          <ErrorAlert message={imageError} onDismiss={() => setImageError(null)} />
        </div>
      )}
      <CreatorStudioShell
        tab={shownTab}
        onTabChange={setTab}
        header={header}
        uploadingAvatar={uploadingAvatar}
        onAvatarSelect={onAvatarSelect}
        publicProfileHref={`/providers/${user.id}`}
        onIntroSaved={async () => {
          await loadHeader({ silent: true });
          setProfileTabRevision((n) => n + 1);
        }}
        onPublish={shownTab === 'content' ? openComposer : undefined}
        railFooter={shownTab === 'content' ? <NewsPublishButton canPublish onCompose={openComposer} /> : undefined}
        profileCompleteness={profileCompleteness}
        onStartPost={openComposer}
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
              onPublishOpenChange={(open) => {
                setPublishOpen(open);
                // The composer closed: if the meter still asks for a first post, re-count (1-item page).
                if (!open && postCount === 0) {
                  void listMyContent('active', 0, 1)
                    .then((page) => setPostCount(page.totalElements))
                    .catch(() => {});
                }
              }}
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
              key={profileTabRevision}
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
