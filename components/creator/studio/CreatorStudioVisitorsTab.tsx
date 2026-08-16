'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CREATOR_PROFILE_VISITS_LABEL } from '@/components/creator/creator-profile-header-types';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PersonAvatar } from '@/components/ui/PersonAvatar';
import { getApiErrorMessage } from '@/lib/api-error';
import { creatorAppRoleLabel, normalizeCreatorAppRole } from '@/lib/creator-app-role';
import { listCreatorProfileVisits, type CreatorProfileVisitItem } from '@/lib/creator-profile-visits-api';

const PAGE_SIZE = 20;

function formatVisitDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

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
  const displayName = visit.anonymous ? 'Anonymous visitor' : (visit.viewerFullName ?? 'User');
  const avatarUrl = visit.anonymous ? null : visit.viewerAvatarUrl;
  const role = visitorRoleLabel(visit);
  const visits = visitCountLabel(visit.visitCount);

  const identity = (
    <div className="flex min-w-0 items-center gap-3">
      <PersonAvatar name={displayName} avatarUrl={avatarUrl} size="lg" />
      <div className="min-w-0">
        <p className="truncate font-semibold text-neutral-900 dark:text-white">{displayName}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 sm:hidden">
          {role} · {visits}
        </p>
      </div>
    </div>
  );

  return (
    <li className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-4 last:border-b-0 dark:border-neutral-800 sm:grid sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.7fr)_auto] sm:items-center sm:gap-4 sm:px-5">
      {visit.anonymous || !visit.viewerUserId ? (
        identity
      ) : (
        <Link href={`/marketplace/${visit.viewerUserId}`} className="min-w-0 transition hover:opacity-80">
          {identity}
        </Link>
      )}
      <p className="hidden truncate text-sm font-medium text-neutral-700 dark:text-neutral-300 sm:block">{role}</p>
      <p className="hidden text-sm text-neutral-600 dark:text-neutral-400 sm:block">{visits}</p>
      <p className="shrink-0 text-sm text-neutral-500 dark:text-neutral-400 sm:text-right">
        {formatVisitDate(visit.viewedAt)}
      </p>
    </li>
  );
}

export function CreatorStudioVisitorsTab() {
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
      setError(getApiErrorMessage(e, 'Unable to load profile visitors.'));
      if (!append) setVisits([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{CREATOR_PROFILE_VISITS_LABEL}</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {totalElements.toLocaleString()} profile visit{totalElements !== 1 ? 's' : ''} recorded.
        </p>
      </div>

      {error ? <ErrorAlert message={error} onDismiss={() => setError(null)} /> : null}

      {visits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-400">
          No profile visits yet. Visitors will appear here when someone views your public profile.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <ul>{visits.map((visit) => <VisitorRow key={visit.id} visit={visit} />)}</ul>
        </div>
      )}

      {!last && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => void loadPage(page + 1, true)}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            {loadingMore ? <LoadingSpinner /> : null}
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
