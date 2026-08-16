'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  computeMessagingBadgeCount,
  dismissMessagingBadge,
  getMessagingBadgeBaseline,
  MESSAGING_BADGE_DISMISS_EVENT,
} from '@/lib/messaging-badge';

export function useMessagingBadge(unreadTotal: number) {
  const [baseline, setBaseline] = useState(getMessagingBadgeBaseline);

  useEffect(() => {
    const onDismiss = (event: Event) => {
      const detail = (event as CustomEvent<number>).detail;
      setBaseline(typeof detail === 'number' ? detail : getMessagingBadgeBaseline());
    };
    window.addEventListener(MESSAGING_BADGE_DISMISS_EVENT, onDismiss);
    return () => window.removeEventListener(MESSAGING_BADGE_DISMISS_EVENT, onDismiss);
  }, []);

  const badgeCount = computeMessagingBadgeCount(unreadTotal, baseline);

  const dismissBadge = useCallback(
    (currentUnread = unreadTotal) => {
      dismissMessagingBadge(currentUnread);
      setBaseline(currentUnread);
    },
    [unreadTotal]
  );

  return { badgeCount, dismissBadge };
}
