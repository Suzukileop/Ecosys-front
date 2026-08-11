'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  computeNotificationBadgeCount,
  dismissNotificationBadge,
  getNotificationBadgeBaseline,
  NOTIFICATION_BADGE_DISMISS_EVENT,
} from '@/lib/notifications';

export function useNotificationBadge(unreadTotal: number) {
  const [baseline, setBaseline] = useState(getNotificationBadgeBaseline);

  useEffect(() => {
    const onDismiss = (event: Event) => {
      const detail = (event as CustomEvent<number>).detail;
      setBaseline(typeof detail === 'number' ? detail : getNotificationBadgeBaseline());
    };
    window.addEventListener(NOTIFICATION_BADGE_DISMISS_EVENT, onDismiss);
    return () => window.removeEventListener(NOTIFICATION_BADGE_DISMISS_EVENT, onDismiss);
  }, []);

  const badgeCount = computeNotificationBadgeCount(unreadTotal, baseline);

  const dismissBadge = useCallback(
    (currentUnread = unreadTotal) => {
      dismissNotificationBadge(currentUnread);
      setBaseline(currentUnread);
    },
    [unreadTotal],
  );

  return { badgeCount, dismissBadge };
}
