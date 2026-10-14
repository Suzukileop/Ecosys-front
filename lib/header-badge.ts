/**
 * "Seen" baseline behind the header's unread badges (messages, notifications), Facebook style.
 *
 * The badge counts what arrived since the viewer last *opened* the icon — not what is still
 * unread. Opening the icon records the current unread total as the baseline; nothing is marked
 * as read, so the conversations / notifications keep their own unread styling inside.
 *
 * The baseline lives in localStorage, per account: it survives a reload, a new tab and a new
 * session (it used to be sessionStorage, so the badge came back every time the browser reopened),
 * and is shared between tabs through the `storage` event.
 */

export type HeaderBadgeStore = {
  read: (userId?: string | null) => number;
  /** Treat `currentUnread` as seen — the badge goes to zero until something newer arrives. */
  write: (currentUnread: number, userId?: string | null) => void;
  /**
   * Unread went *down* (some were read): pull the baseline down with it, otherwise the next
   * new item would still be hidden behind the old, higher baseline.
   */
  lowerTo: (currentUnread: number, userId?: string | null) => void;
  subscribe: (onChange: () => void) => () => void;
};

export function computeHeaderBadgeCount(unreadTotal: number, baseline: number): number {
  return Math.max(0, unreadTotal - baseline);
}

export function createHeaderBadgeStore(storageKeyPrefix: string, eventName: string): HeaderBadgeStore {
  const keyFor = (userId?: string | null) => (userId ? `${storageKeyPrefix}:${userId}` : storageKeyPrefix);

  const read: HeaderBadgeStore['read'] = (userId) => {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = window.localStorage.getItem(keyFor(userId));
      const n = raw != null ? Number(raw) : 0;
      return Number.isFinite(n) && n > 0 ? n : 0;
    } catch {
      return 0;
    }
  };

  const write: HeaderBadgeStore['write'] = (currentUnread, userId) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(keyFor(userId), String(Math.max(0, currentUnread)));
    } catch {
      /* private mode / storage blocked — the badge just comes back next load */
    }
    window.dispatchEvent(new CustomEvent(eventName, { detail: currentUnread }));
  };

  return {
    read,
    write,
    lowerTo: (currentUnread, userId) => {
      if (read(userId) > currentUnread) write(currentUnread, userId);
    },
    subscribe: (onChange) => {
      window.addEventListener(eventName, onChange);
      window.addEventListener('storage', onChange);
      return () => {
        window.removeEventListener(eventName, onChange);
        window.removeEventListener('storage', onChange);
      };
    },
  };
}
