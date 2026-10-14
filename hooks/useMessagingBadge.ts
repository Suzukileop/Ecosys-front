'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useAuth } from '@/context/AuthContext';
import { computeMessagingBadgeCount, messagingBadgeStore } from '@/lib/messaging-badge';

/**
 * Header badge for new messages. Opening the Messages icon records the current unread total as
 * seen — the badge clears even though the messages stay unread inside their conversations.
 */
export function useMessagingBadge(unreadTotal: number) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const baseline = useSyncExternalStore(
    messagingBadgeStore.subscribe,
    () => messagingBadgeStore.read(userId),
    () => 0
  );

  const badgeCount = computeMessagingBadgeCount(unreadTotal, baseline);

  const dismissBadge = useCallback(
    (currentUnread = unreadTotal) => messagingBadgeStore.write(currentUnread, userId),
    [unreadTotal, userId]
  );

  /** Call with a freshly fetched total: some messages were read elsewhere, so the baseline follows. */
  const syncBaseline = useCallback(
    (currentUnread: number) => messagingBadgeStore.lowerTo(currentUnread, userId),
    [userId]
  );

  return { badgeCount, dismissBadge, syncBaseline };
}
