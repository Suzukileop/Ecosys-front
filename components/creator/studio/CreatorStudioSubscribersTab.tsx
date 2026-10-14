'use client';

import { trPlural } from '@/lib/i18n/active';
import { useCallback, useEffect, useState } from 'react';
import { CREATOR_PROFILE_SUBSCRIBERS_LABEL } from '@/components/creator/creator-profile-header-types';
import {
  groupByDay,
  StudioEmptyBlock,
  StudioPeopleGroup,
  StudioPeopleList,
  StudioPersonRow,
  StudioSectionHeading,
} from './studio-list-ui';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import { listCreatorProfileFollowers, type CreatorProfileFollowerItem } from '@/lib/creator-profile-followers-api';
import { useT } from '@/lib/i18n/I18nProvider';

const PAGE_SIZE = 20;

function SubscriberRow({ follower }: { follower: CreatorProfileFollowerItem }) {
  return (
    <StudioPersonRow
      name={follower.followerFullName ?? 'User'}
      avatarUrl={follower.followerAvatarUrl}
      meta="Subscribed to you"
      date={follower.followedAt}
      href={`/providers/${follower.followerUserId}`}
    />
  );
}

export function CreatorStudioSubscribersTab() {
  const t = useT();
  const [followers, setFollowers] = useState<CreatorProfileFollowerItem[]>([]);
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

      const data = await listCreatorProfileFollowers(pageIndex, PAGE_SIZE);
      setFollowers((current) => (append ? [...current, ...data.content] : data.content));
      setPage(data.page);
      setTotalElements(data.totalElements);
      setLast(data.last);
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to load subscribers.')));
      if (!append) setFollowers([]);
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
        title={t(CREATOR_PROFILE_SUBSCRIBERS_LABEL)}
        description={t('People who follow your work and see your new posts.')}
        stat={{ value: totalElements, label: trPlural(totalElements, 'subscriber', 'subscribers') }}
      />

      {error ? <ErrorAlert message={error} onDismiss={() => setError(null)} /> : null}

      {followers.length === 0 ? (
        <StudioEmptyBlock title={t('No subscribers yet')}>
          {t('People who subscribe to your profile will appear here.')}
        </StudioEmptyBlock>
      ) : (
        <StudioPeopleList hasMore={!last} loadingMore={loadingMore} onShowMore={() => void loadPage(page + 1, true)}>
          {groupByDay(followers, (follower) => follower.followedAt).map((group) => (
            <StudioPeopleGroup key={group.label} label={t(group.label)}>
              {group.items.map((follower) => (
                <SubscriberRow key={follower.id} follower={follower} />
              ))}
            </StudioPeopleGroup>
          ))}
        </StudioPeopleList>
      )}
    </div>
  );
}
