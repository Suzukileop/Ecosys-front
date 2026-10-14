import { computeHeaderBadgeCount, createHeaderBadgeStore } from '@/lib/header-badge';

export const MESSAGING_BADGE_DISMISS_EVENT = 'messaging-badge-dismiss';

export const messagingBadgeStore = createHeaderBadgeStore('messaging_badge_baseline', MESSAGING_BADGE_DISMISS_EVENT);

export function getMessagingBadgeBaseline(userId?: string | null): number {
  return messagingBadgeStore.read(userId);
}

/** Hide the badge without marking conversations as read (opening the Messages icon, like Facebook). */
export function dismissMessagingBadge(currentUnread: number, userId?: string | null): void {
  messagingBadgeStore.write(currentUnread, userId);
}

export function computeMessagingBadgeCount(unreadTotal: number, baseline: number): number {
  return computeHeaderBadgeCount(unreadTotal, baseline);
}
