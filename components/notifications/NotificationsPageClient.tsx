'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
import { dispatchAgentContentSync } from '@/lib/agent-content-sync';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { NotificationDto } from '@/types/ecosystem';

export function NotificationsPageClient() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const isAgent = hasRole('ROLE_AGENT') || hasRole('ROLE_ADMIN');

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

      const { href, unavailableVisitor } = resolveNotificationNavigation(n, isAgent);
      if (unavailableVisitor) {
        const fallback = visitorPublicProfileUnavailableMessage(
          n.actorFullName ?? extractVisitorNameFromVisitMessage(n.message),
        );
        pushFlashFeedback({
          variant: 'info',
          title: fallback.title,
          description: fallback.description,
          actionHref: '/dashboard/creator?tab=visitors',
          actionLabel: 'Open Visitors',
        });
        return;
      }

      if (href) {
        if (n.type === 'CONTENT_DELIVERED' && n.refId) {
          dispatchAgentContentSync(n.refId, n.refSecondaryId);
        }
        router.push(href);
      }
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
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
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/dashboard/home" className="text-sm text-neutral-500 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">
              ← Dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAll()}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Mark all as read
            </button>
          )}
        </div>

        <NotificationFilterTabs value={filter} onChange={setFilter} />

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <NotificationGroupedList
              items={filteredItems}
              isAgent={isAgent}
              onItemClick={(n) => void openNotification(n)}
              emptyMessage={filter === 'unread' ? 'No unread notifications' : 'No notifications.'}
              variant="page"
            />
          </div>
        )}
      </div>
    </DashboardHomeShell>
  );
}
