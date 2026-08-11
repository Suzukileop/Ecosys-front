'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { getCreatorFollowStats, listCreatorProducts } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { formatLocationLabel } from '@/lib/geolocation';
import { normalizeCoverObjectPositionY } from '@/lib/creator-profile-cover';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioHubSkeleton, CreatorStudioTabPanelSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { uploadCreatorCover, uploadUserAvatar } from '@/lib/user-profile-api';
import { usePendingNavigation } from '@/hooks/usePendingNavigation';
import { CreatorStudioShell, type CreatorStudioHeaderData } from './CreatorStudioShell';
import { parseCreatorStudioHeaderLayout, type CreatorStudioHeaderLayout } from './creator-studio-header';
import {
  parseCreatorStudioHeaderContentStyle,
  type CreatorStudioHeaderContentStyle,
} from './creator-studio-header-content';
import { parseCreatorStudioTabNavAlign, type CreatorStudioTabNavAlign } from './creator-studio-layout';
import { CreatorStudioContentTab } from './CreatorStudioContentTab';
import { CreatorStudioProductsTab } from './CreatorStudioProductsTab';
import { CreatorStudioProfileTab } from './CreatorStudioProfileTab';
import { STORE_INFORMATION_SECTION_IDS } from './profile-section-nav';
import { CreatorStudioVisitorsTab } from './CreatorStudioVisitorsTab';
import { CreatorStudioSubscribersTab } from './CreatorStudioSubscribersTab';
import { parseCreatorStudioTab, type CreatorStudioTab } from './types';
import type { CreatorProfileDto } from '@/types/ecosystem';

function CreatorStudioPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, hasRole, updateUser } = useAuth();
  const tab = parseCreatorStudioTab(searchParams.get('tab'));
  const { isTransitioning: isTabTransitioning, startTransition: startTabTransition, preview: previewTab } =
    usePendingNavigation(tab);

  const [headerLoading, setHeaderLoading] = useState(true);
  const [header, setHeader] = useState<CreatorStudioHeaderData | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [layoutError, setLayoutError] = useState<string | null>(null);
  const [savingHeaderLayout, setSavingHeaderLayout] = useState(false);
  const [savingHeaderContentStyle, setSavingHeaderContentStyle] = useState(false);
  const [savingTabNavAlign, setSavingTabNavAlign] = useState(false);
  const [savingContentHeadline, setSavingContentHeadline] = useState(false);
  const coverPositionSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      setHeader({
        fullName: profile.fullName ?? user.fullName,
        email: user.email,
        avatarUrl: profile.avatarUrl ?? user.avatarUrl ?? null,
        coverUrl: profile.coverUrl ?? null,
        coverObjectPositionY: normalizeCoverObjectPositionY(profile.coverObjectPositionY),
        bio: profile.bio ?? null,
        specialite: profile.specialite ?? null,
        followerCount: followStatsRes.followerCount ?? 0,
        productCount: productsRes.totalElements ?? productsRes.content.length,
        profileVisits: profile.profileVisits ?? 0,
        isAvailable: profile.isAvailable ?? true,
        averageRating: profile.reputation?.averageRating ?? null,
        locationLabel: formatLocationLabel(profile.locationCity, profile.locationCountry),
        headerLayout: parseCreatorStudioHeaderLayout(profile.studioHeaderLayout),
        headerContentStyle: parseCreatorStudioHeaderContentStyle(profile.studioHeaderContentStyle),
        tabNavAlign: parseCreatorStudioTabNavAlign(profile.studioTabNavAlign),
        contentHeadline: profile.studioContentHeadline ?? null,
      });
    } catch {
      setHeader({
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl ?? null,
        coverUrl: null,
        coverObjectPositionY: 50,
        bio: null,
        specialite: null,
        followerCount: 0,
        productCount: 0,
        profileVisits: 0,
        isAvailable: true,
        headerLayout: 'BANNER',
        headerContentStyle: 'DEFAULT',
        tabNavAlign: 'LEFT',
        contentHeadline: null,
      });
    } finally {
      setHeaderLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && user && hasRole('ROLE_CREATOR')) {
      void loadHeader();
    }
  }, [isLoading, user, hasRole, loadHeader]);

  useEffect(() => {
    if (!isLoading && user && !hasRole('ROLE_CREATOR')) {
      router.replace('/dashboard');
    }
  }, [isLoading, user, hasRole, router]);

  const setTab = (next: CreatorStudioTab) => {
    if (next === tab) return;
    startTabTransition(next);
    router.replace(`/dashboard/creator?tab=${next}`, { scroll: false });
  };

  const onCoverSelect = async (file: File) => {
    setImageError(null);
    setUploadingCover(true);
    try {
      await uploadCreatorCover(file);
      await loadHeader();
    } catch (e) {
      setImageError(getApiErrorMessage(e, 'Unable to upload cover image.'));
    } finally {
      setUploadingCover(false);
    }
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

  useEffect(() => {
    return () => {
      if (coverPositionSaveTimerRef.current) {
        clearTimeout(coverPositionSaveTimerRef.current);
      }
    };
  }, []);

  const saveCoverObjectPositionY = useCallback(async (y: number) => {
    setLayoutError(null);
    try {
      await api.put('/api/creator/profile', { coverObjectPositionY: y });
    } catch (e) {
      setLayoutError(getApiErrorMessage(e, 'Unable to save cover position.'));
    }
  }, []);

  const onCoverObjectPositionYChange = useCallback(
    (y: number) => {
      const normalized = normalizeCoverObjectPositionY(y);
      setHeader((current) => (current ? { ...current, coverObjectPositionY: normalized } : current));
      if (coverPositionSaveTimerRef.current) {
        clearTimeout(coverPositionSaveTimerRef.current);
      }
      coverPositionSaveTimerRef.current = setTimeout(() => {
        void saveCoverObjectPositionY(normalized);
      }, 350);
    },
    [saveCoverObjectPositionY],
  );

  const saveHeaderLayout = async (layout: CreatorStudioHeaderLayout) => {
    if (!header || layout === header.headerLayout || savingHeaderLayout) return;
    setLayoutError(null);
    setSavingHeaderLayout(true);
    try {
      await api.put('/api/creator/profile', { studioHeaderLayout: layout });
      setHeader((current) => (current ? { ...current, headerLayout: layout } : current));
    } catch (e) {
      setLayoutError(getApiErrorMessage(e, 'Unable to save header style.'));
    } finally {
      setSavingHeaderLayout(false);
    }
  };

  const saveHeaderContentStyle = async (style: CreatorStudioHeaderContentStyle) => {
    if (!header || style === header.headerContentStyle || savingHeaderContentStyle) return;
    setLayoutError(null);
    setSavingHeaderContentStyle(true);
    try {
      await api.put('/api/creator/profile', { studioHeaderContentStyle: style });
      setHeader((current) => (current ? { ...current, headerContentStyle: style } : current));
    } catch (e) {
      setLayoutError(getApiErrorMessage(e, 'Unable to save content display style.'));
    } finally {
      setSavingHeaderContentStyle(false);
    }
  };

  const saveTabNavAlign = async (align: CreatorStudioTabNavAlign) => {
    if (!header || align === header.tabNavAlign || savingTabNavAlign) return;
    setLayoutError(null);
    setSavingTabNavAlign(true);
    try {
      await api.put('/api/creator/profile', { studioTabNavAlign: align });
      setHeader((current) => (current ? { ...current, tabNavAlign: align } : current));
    } catch (e) {
      setLayoutError(getApiErrorMessage(e, 'Unable to save tab alignment.'));
    } finally {
      setSavingTabNavAlign(false);
    }
  };

  const saveContentHeadline = async (headline: string) => {
    const next = headline.trim();
    if (!header || savingContentHeadline) return;
    if ((header.contentHeadline?.trim() || '') === next) return;
    setLayoutError(null);
    setSavingContentHeadline(true);
    try {
      await api.put('/api/creator/profile', { studioContentHeadline: next });
      setHeader((current) => (current ? { ...current, contentHeadline: next } : current));
    } catch (e) {
      setLayoutError(getApiErrorMessage(e, 'Unable to save content headline.'));
    } finally {
      setSavingContentHeadline(false);
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
        uploadingCover={uploadingCover}
        uploadingAvatar={uploadingAvatar}
        onCoverSelect={onCoverSelect}
        onAvatarSelect={onAvatarSelect}
        savingHeaderLayout={savingHeaderLayout}
        savingHeaderContentStyle={savingHeaderContentStyle}
        savingTabNavAlign={savingTabNavAlign}
        savingContentHeadline={savingContentHeadline}
        layoutError={layoutError}
        onDismissLayoutError={() => setLayoutError(null)}
        onHeaderLayoutChange={saveHeaderLayout}
        onHeaderContentStyleChange={saveHeaderContentStyle}
        onTabNavAlignChange={saveTabNavAlign}
        onContentHeadlineChange={saveContentHeadline}
        onCoverObjectPositionYChange={onCoverObjectPositionYChange}
      >
      {isTabTransitioning ? (
        <CreatorStudioTabPanelSkeleton tab={previewTab} />
      ) : (
        <>
          {tab === 'content' && (
            <CreatorStudioContentTab
              contentHeadline={header.contentHeadline}
              specialite={header.specialite}
            />
          )}
          {tab === 'products' && <CreatorStudioProductsTab />}
          {tab === 'visitors' && <CreatorStudioVisitorsTab />}
          {tab === 'subscribers' && <CreatorStudioSubscribersTab />}
          {tab === 'profile' && (
            <CreatorStudioProfileTab
              variant="portfolio"
              portfolioNavSide="right"
              allowedSections={STORE_INFORMATION_SECTION_IDS}
              sectionsNavTitle="Information"
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
