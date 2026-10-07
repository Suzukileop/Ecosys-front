'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  dismissNotificationBadge,
  extractVisitorNameFromVisitMessage,
  fetchNotifications,
  fetchUnreadCount,
  filterNotifications,
  markAllNotificationsRead,
  markNotificationItemRead,
  resolveNotificationNavigation,
  visitorPublicProfileUnavailableMessage,
  type NotificationFilter,
} from '@/lib/notifications';
import { NotificationFilterTabs } from '@/components/notifications/NotificationFilterTabs';
import { NotificationGroupedList } from '@/components/notifications/NotificationGroupedList';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { BackToTopButton } from '@/components/ui/BackToTopButton';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { NotificationDto } from '@/types/profile';
import { SIGNED_IN_HOME } from '@/lib/routes';

export function NotificationsPageClient() {
  const router = useRouter();

  const [items, setItems] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (clearBadge = false) => {
    try {
      setLoading(true);
      setError(null);
      const [page, count] = await Promise.all([fetchNotifications(0, 50), fetchUnreadCount()]);
      setItems(page.content);
      setUnreadCount(count);
      if (clearBadge) {
        dismissNotificationBadge(count);
      }
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load notifications.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
  }, [load]);

  const filteredItems = filterNotifications(items, filter);

  const openNotification = async (n: NotificationDto) => {
    try {
      const targetIds = n.aggregatedNotificationIds?.length
        ? n.aggregatedNotificationIds
        : [n.id];
      const unreadTargets = items.filter((item) => targetIds.includes(item.id) && !item.isRead);
      const idsToRead =
        unreadTargets.length > 0
          ? unreadTargets.map((item) => item.id)
          : !n.isRead
            ? targetIds.filter((id) => !id.startsWith('profile-visit-group:'))
            : [];

      if (idsToRead.length > 0) {
        const readIds = await markNotificationItemRead({
          ...n,
          aggregatedNotificationIds: idsToRead,
          isRead: false,
        });
        const readSet = new Set(readIds);
        setUnreadCount((c) => Math.max(0, c - readIds.length));
        setItems((prev) =>
          prev.map((item) => (readSet.has(item.id) ? { ...item, isRead: true } : item)),
        );
      }

      const { href, unavailableVisitor } = resolveNotificationNavigation(n);
      if (unavailableVisitor) {
        const fallback = visitorPublicProfileUnavailableMessage(
          n.actorFullName ?? extractVisitorNameFromVisitMessage(n.message),
        );
        pushFlashFeedback({
          variant: 'info',
          title: fallback.title,
          description: fallback.description,
          actionHref: '/profile?tab=visitors',
          actionLabel: 'Open Visitors',
        });
        return;
      }

      if (href) router.push(href);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(SIGNED_IN_HOME);
  };

  const markAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      dismissNotificationBadge(0);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <DashboardHomeShell>
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-0">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              aria-label="Go back"
              title="Go back"
              className="-ml-2 inline-flex h-9 w-9 sm:absolute sm:-left-14 sm:top-1/2 sm:ml-0 sm:-translate-y-1/2 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-black/[0.05] hover:text-[#111111] dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="truncate text-2xl font-bold tracking-[-0.02em] text-[#111111] dark:text-white">
              Notifications
              {unreadCount > 0 ? (
                <span className="text-[#FF5722]"> · {String(unreadCount).padStart(2, '0')}</span>
              ) : null}
            </h1>
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void markAll()}
              className="inline-flex items-center gap-2 text-[15px] font-medium text-neutral-500 transition-colors hover:text-[#FF5722] dark:text-neutral-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
              Mark all as read
            </button>
          ) : null}
        </div>

        <NotificationFilterTabs value={filter} onChange={setFilter} unreadCount={unreadCount} underline />

        {error ? (
          <div className="mt-6">
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          </div>
        ) : null}

        <div className="mt-10">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <NotificationGroupedList
              items={filteredItems}
              onItemClick={(n) => void openNotification(n)}
              emptyMessage={filter === 'unread' ? 'You’re all caught up.' : 'No notifications yet.'}
              variant="page"
            />
          )}
        </div>
      </div>
      <BackToTopButton />
    </DashboardHomeShell>
  );
}
