'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useAuth } from '@/context/AuthContext';
import { computeNotificationBadgeCount, notificationBadgeStore } from '@/lib/notifications';

/**
 * Header badge for new notifications. Opening the bell (or the Notifications page) records the
 * current unread total as seen — the badge clears while the notifications themselves stay unread.
 */
export function useNotificationBadge(unreadTotal: number) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const baseline = useSyncExternalStore(
    notificationBadgeStore.subscribe,
    () => notificationBadgeStore.read(userId),
    () => 0
  );

  const badgeCount = computeNotificationBadgeCount(unreadTotal, baseline);

  const dismissBadge = useCallback(
    (currentUnread = unreadTotal) => notificationBadgeStore.write(currentUnread, userId),
    [unreadTotal, userId]
  );

  /** Call with a freshly fetched total: some were read elsewhere, so the baseline follows them down. */
  const syncBaseline = useCallback(
    (currentUnread: number) => notificationBadgeStore.lowerTo(currentUnread, userId),
    [userId]
  );

  return { badgeCount, dismissBadge, syncBaseline };
}
