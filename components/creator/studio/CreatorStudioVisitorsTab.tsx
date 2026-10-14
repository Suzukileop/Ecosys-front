'use client';

import { trPlural } from '@/lib/i18n/active';
import { useCallback, useEffect, useState } from 'react';
import { CREATOR_PROFILE_VISITS_LABEL } from '@/components/creator/creator-profile-header-types';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import { creatorAppRoleLabel, normalizeCreatorAppRole } from '@/lib/creator-app-role';
import { listCreatorProfileVisits, type CreatorProfileVisitItem } from '@/lib/creator-profile-visits-api';
import {
  groupByDay,
  StudioEmptyBlock,
  StudioPeopleGroup,
  StudioPeopleList,
  StudioPersonRow,
  StudioSectionHeading,
} from './studio-list-ui';
import { useT } from '@/lib/i18n/I18nProvider';

const PAGE_SIZE = 20;

function visitorRoleLabel(visit: CreatorProfileVisitItem): string {
  if (visit.anonymous) return 'Guest';
  if (visit.viewerAppRole) {
    return creatorAppRoleLabel(normalizeCreatorAppRole(visit.viewerAppRole));
  }
  return 'Registered user';
}

function visitCountLabel(count: number): string {
  const safe = Number.isFinite(count) && count > 0 ? count : 1;
  return safe === 1 ? '1 visit' : `${safe.toLocaleString()} visits`;
}

function VisitorRow({ visit }: { visit: CreatorProfileVisitItem }) {
  const anonymous = visit.anonymous || !visit.viewerUserId;
  const displayName = visit.anonymous ? 'Anonymous visitor' : (visit.viewerFullName ?? 'User');
  return (
    <StudioPersonRow
      name={displayName}
      avatarUrl={visit.anonymous ? null : visit.viewerAvatarUrl}
      anonymous={visit.anonymous}
      meta={`${visitorRoleLabel(visit)} · ${visitCountLabel(visit.visitCount)}`}
      date={visit.viewedAt}
      href={anonymous ? null : `/providers/${visit.viewerUserId}`}
    />
  );
}

export function CreatorStudioVisitorsTab() {
  const t = useT();
  const [visits, setVisits] = useState<CreatorProfileVisitItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (pageIndex: number, append: boolean) => {
    try {
      setError(null);
      if (append) setLoadingMore(true);
      else setLoading(true);

      const data = await listCreatorProfileVisits(pageIndex, PAGE_SIZE);
      setVisits((current) => (append ? [...current, ...data.content] : data.content));
      setPage(data.page);
      setTotalElements(data.totalElements);
      setLast(data.last);
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to load profile visitors.')));
      if (!append) setVisits([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [t]);

  useEffect(() => {
    void loadPage(0, false);
  }, [loadPage]);

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StudioSectionHeading
        title={CREATOR_PROFILE_VISITS_LABEL}
        description={t('Who has been looking at your public profile.')}
        stat={{ value: totalElements, label: trPlural(totalElements, 'visit', 'visits') }}
      />

      {error ? <ErrorAlert message={error} onDismiss={() => setError(null)} /> : null}

      {visits.length === 0 ? (
        <StudioEmptyBlock title={t('No visits yet')}>
          {t('Visitors will appear here when someone views your public profile.')}
        </StudioEmptyBlock>
      ) : (
        <StudioPeopleList hasMore={!last} loadingMore={loadingMore} onShowMore={() => void loadPage(page + 1, true)}>
          {groupByDay(visits, (visit) => visit.viewedAt).map((group) => (
            <StudioPeopleGroup key={group.label} label={t(group.label)}>
              {group.items.map((visit) => (
                <VisitorRow key={visit.id} visit={visit} />
              ))}
            </StudioPeopleGroup>
          ))}
        </StudioPeopleList>
      )}
    </div>
  );
}
