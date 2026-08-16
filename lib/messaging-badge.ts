const BADGE_BASELINE_KEY = 'messaging_badge_baseline';
export const MESSAGING_BADGE_DISMISS_EVENT = 'messaging-badge-dismiss';

export function getMessagingBadgeBaseline(): number {
  if (typeof window === 'undefined') return 0;
  const raw = sessionStorage.getItem(BADGE_BASELINE_KEY);
  const n = raw != null ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

/** Hide the badge without marking conversations as read. */
export function dismissMessagingBadge(currentUnread: number): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(BADGE_BASELINE_KEY, String(currentUnread));
  window.dispatchEvent(
    new CustomEvent(MESSAGING_BADGE_DISMISS_EVENT, { detail: currentUnread })
  );
}

export function computeMessagingBadgeCount(unreadTotal: number, baseline?: number): number {
  const base = baseline ?? getMessagingBadgeBaseline();
  return Math.max(0, unreadTotal - base);
}
