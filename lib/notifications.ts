import api from '@/lib/api';
import { normalizeSpringPage } from '@/lib/pagination';
import type { NotificationDto, PagedResponse, SpringPageRaw } from '@/types/profile';
import { SIGNED_IN_HOME } from '@/lib/routes';

const BADGE_BASELINE_KEY = 'notification_badge_baseline';
export const NOTIFICATION_BADGE_DISMISS_EVENT = 'notification-badge-dismiss';

/**
 * Profile visits stay as individual rows (no same-day aggregation).
 * Kept as a pass-through for callers that previously collapsed groups.
 */
const PROFILE_VISIT_NOTIFICATION_INDIVIDUAL_MAX = Number.POSITIVE_INFINITY;

export const CREATOR_PROFILE_VISIT_TYPE = 'CREATOR_PROFILE_VISIT';
export const CREATOR_PROFILE_VISIT_GROUP_TYPE = 'CREATOR_PROFILE_VISIT_GROUP';
export const CREATOR_NEW_FOLLOWER_TYPE = 'CREATOR_NEW_FOLLOWER';
export const FOLLOWER_NEW_PRODUCT_TYPE = 'FOLLOWER_NEW_PRODUCT';
export const FOLLOWER_NEW_CONTENT_TYPE = 'FOLLOWER_NEW_CONTENT';
export const FOLLOWER_NEW_SERVICE_TYPE = 'FOLLOWER_NEW_SERVICE';

export type NotificationFilter = 'all' | 'unread';
type NotificationTimeGroup = 'nouveau' | 'aujourdhui' | 'plus_tot';

export const NOTIFICATION_GROUP_LABELS: Record<NotificationTimeGroup, string> = {
  nouveau: 'New',
  aujourdhui: 'Today',
  plus_tot: 'Earlier',
};

export async function fetchNotifications(
  page = 0,
  size = 20,
): Promise<PagedResponse<NotificationDto>> {
  const res = await api.get<SpringPageRaw<NotificationDto>>('/api/notifications', {
    params: { page, size },
  });
  return normalizeSpringPage(res.data);
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await api.get<number>('/api/notifications/unread-count');
  return typeof res.data === 'number' ? res.data : 0;
}

async function markNotificationRead(id: string): Promise<void> {
  await api.put(`/api/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.put('/api/notifications/read-all');
}

export function getNotificationBadgeBaseline(): number {
  if (typeof window === 'undefined') return 0;
  const raw = sessionStorage.getItem(BADGE_BASELINE_KEY);
  const n = raw != null ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

/** Masque le badge sans marquer les notifications comme lues (style Facebook). */
export function dismissNotificationBadge(currentUnread: number): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(BADGE_BASELINE_KEY, String(currentUnread));
  window.dispatchEvent(
    new CustomEvent(NOTIFICATION_BADGE_DISMISS_EVENT, { detail: currentUnread }),
  );
}

export function computeNotificationBadgeCount(unreadTotal: number, baseline?: number): number {
  const base = baseline ?? getNotificationBadgeBaseline();
  return Math.max(0, unreadTotal - base);
}

export function filterNotifications(
  items: NotificationDto[],
  filter: NotificationFilter,
): NotificationDto[] {
  if (filter === 'unread') return items.filter((n) => !n.isRead);
  return items;
}

/**
 * Profile-visit notifications are shown individually (no same-day bundle).
 */
function collapseProfileVisitNotifications(
  items: NotificationDto[],
  _individualMax = PROFILE_VISIT_NOTIFICATION_INDIVIDUAL_MAX,
): NotificationDto[] {
  return items;
}

export function groupNotificationsByTime(
  items: NotificationDto[],
): { key: NotificationTimeGroup; items: NotificationDto[] }[] {
  const collapsed = collapseProfileVisitNotifications(items);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const buckets: Record<NotificationTimeGroup, NotificationDto[]> = {
    nouveau: [],
    aujourdhui: [],
    plus_tot: [],
  };

  for (const n of collapsed) {
    if (!n.isRead) {
      buckets.nouveau.push(n);
      continue;
    }
    const created = new Date(n.createdAt);
    if (created >= startOfToday) {
      buckets.aujourdhui.push(n);
    } else {
      buckets.plus_tot.push(n);
    }
  }

  return (['nouveau', 'aujourdhui', 'plus_tot'] as const)
    .filter((key) => buckets[key].length > 0)
    .map((key) => ({ key, items: buckets[key] }));
}

/** Relative up to 7 days, then a stable absolute date. */
export function formatNotificationTimestamp(iso: string, nowMs = Date.now()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Math.max(0, nowMs - date.getTime());
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;

  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return diffD === 1 ? '1 day ago' : `${diffD} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type ResolveNotificationHrefOptions = {
  actorProfileAvailable?: boolean | null;
};

/** Lien cible selon le type de notification. */
export function resolveNotificationHref(
  type: string,
  refId?: string | null,
  refSecondaryId?: string | null,
  options?: ResolveNotificationHrefOptions,
): string | null {
  if (type === CREATOR_PROFILE_VISIT_GROUP_TYPE) {
    return '/profile?tab=visitors';
  }

  if (type === CREATOR_PROFILE_VISIT_TYPE) {
    if (refSecondaryId) {
      if (options?.actorProfileAvailable === false) {
        return null;
      }
      return `/providers/${encodeURIComponent(refSecondaryId)}`;
    }
    return '/profile?tab=visitors';
  }

  if (type === CREATOR_NEW_FOLLOWER_TYPE) {
    if (refSecondaryId) {
      if (options?.actorProfileAvailable === false) {
        return null;
      }
      return `/providers/${encodeURIComponent(refSecondaryId)}`;
    }
    return '/profile?tab=subscribers';
  }

  if (!refId) return null;

  switch (type) {
    case 'CONVERSATION_GUEST_INVITE':
      return '/messages?filter=temporary';
    case FOLLOWER_NEW_PRODUCT_TYPE:
      return `/marketplace/products/${encodeURIComponent(refId)}`;
    case FOLLOWER_NEW_CONTENT_TYPE:
      return refSecondaryId
        ? `/providers/${encodeURIComponent(refSecondaryId)}?tab=content&post=${encodeURIComponent(refId)}`
        : `/marketplace/content/${encodeURIComponent(refId)}`;
    case FOLLOWER_NEW_SERVICE_TYPE:
      return refSecondaryId
        ? `/providers/${encodeURIComponent(refSecondaryId)}?tab=services&service=${encodeURIComponent(refId)}`
        : '/providers';
    default:
      return SIGNED_IN_HOME;
  }
}

export function visitorPublicProfileUnavailableMessage(visitorName?: string | null): {
  title: string;
  description: string;
} {
  const name = visitorName?.trim();
  return {
    title: 'Profile unavailable',
    description: name
      ? `${name} no longer has a public profile you can open. You can still see them in your Visitors list.`
      : 'This visitor no longer has a public profile you can open. You can still see them in your Visitors list.',
  };
}

/** Mark a single notification or every id in a visit group as read. Returns touched ids. */
export async function markNotificationItemRead(n: NotificationDto): Promise<string[]> {
  const ids =
    n.aggregatedNotificationIds?.length
      ? n.aggregatedNotificationIds
      : [n.id];
  const realIds = ids.filter((id) => !id.startsWith('profile-visit-group:'));
  await Promise.all(realIds.map((id) => markNotificationRead(id)));
  return realIds;
}

export function resolveNotificationNavigation(
  n: NotificationDto,
): { href: string | null; unavailableVisitor: boolean } {
  if (
    (n.type === CREATOR_PROFILE_VISIT_TYPE || n.type === CREATOR_NEW_FOLLOWER_TYPE) &&
    n.refSecondaryId &&
    n.actorProfileAvailable === false
  ) {
    return { href: null, unavailableVisitor: true };
  }
  return {
    href: resolveNotificationHref(n.type, n.refId, n.refSecondaryId, {
      actorProfileAvailable: n.actorProfileAvailable,
    }),
    unavailableVisitor: false,
  };
}

const NOTIFICATION_TITLES_EN: Record<string, string> = {
  CONVERSATION_GUEST_INVITE: 'Temporary conversation invite',
  CREATOR_PROFILE_VISIT: 'Profile visit',
  CREATOR_PROFILE_VISIT_GROUP: 'Profile visits',
  CREATOR_NEW_FOLLOWER: 'New follower',
  FOLLOWER_NEW_PRODUCT: 'New product',
  FOLLOWER_NEW_CONTENT: 'New content',
  FOLLOWER_NEW_SERVICE: 'New service',
};

export function extractVisitorNameFromVisitMessage(message: string | null | undefined): string | null {
  if (!message) return null;
  const match = message.match(/^(.+?)\s+visited your profile\.?$/i);
  if (!match?.[1]) return null;
  const name = match[1].trim();
  if (!name || /^someone$/i.test(name) || /^a user$/i.test(name)) return null;
  return name;
}

export function extractFollowerNameFromFollowMessage(message: string | null | undefined): string | null {
  if (!message) return null;
  const match = message.match(/^(.+?)\s+started following you\.?$/i);
  if (!match?.[1]) return null;
  const name = match[1].trim();
  if (!name || /^someone$/i.test(name) || /^a user$/i.test(name)) return null;
  return name;
}

/** English labels for stored notifications (legacy French rows included). */
export function formatNotificationDisplay(n: NotificationDto): { title: string; message: string | null } {
  const title = NOTIFICATION_TITLES_EN[n.type] ?? n.title;
  const raw = n.message?.trim() ?? null;

  switch (n.type) {
    case CREATOR_PROFILE_VISIT_TYPE: {
      const name = n.actorFullName?.trim() || extractVisitorNameFromVisitMessage(raw);
      if (name) {
        return { title, message: `${name} visited your profile.` };
      }
      return { title, message: raw ?? 'Someone visited your profile.' };
    }

    case CREATOR_PROFILE_VISIT_GROUP_TYPE:
      return { title, message: raw };

    case CREATOR_NEW_FOLLOWER_TYPE: {
      const name = n.actorFullName?.trim() || extractFollowerNameFromFollowMessage(raw);
      if (name) {
        return { title, message: `${name} started following you.` };
      }
      return { title, message: raw ?? 'Someone started following you.' };
    }

    case FOLLOWER_NEW_PRODUCT_TYPE:
      return {
        title: 'New product',
        message: formatFollowerPublishMessage(raw, n.actorFullName, 'product', 'published'),
      };

    case FOLLOWER_NEW_CONTENT_TYPE:
      return {
        title: 'New content',
        message: formatFollowerPublishMessage(raw, n.actorFullName, 'content', 'shared'),
      };

    case FOLLOWER_NEW_SERVICE_TYPE:
      return {
        title: 'New service',
        message: formatFollowerPublishMessage(raw, n.actorFullName, 'service', 'added'),
      };

    default:
      return { title, message: raw };
  }
}

/**
 * Ensure follower publish rows always name the kind (product / content / service),
 * including legacy messages that only had "X added Title".
 */
function formatFollowerPublishMessage(
  raw: string | null,
  actorFullName: string | null | undefined,
  kind: 'product' | 'content' | 'service',
  verb: 'published' | 'shared' | 'added',
): string {
  const actorFromRaw =
    raw?.match(/^(.+?)\s+(?:published|shared|added)\b/i)?.[1]?.trim() ?? null;
  const actor =
    actorFullName?.trim() ||
    actorFromRaw ||
    'A creator you follow';

  const afterColon = raw?.includes(':') ? raw.slice(raw.indexOf(':') + 1).trim() : null;
  const legacyItem =
    raw?.match(/^(.+?)\s+(?:published|shared|added)\s+(?:a\s+new\s+(?:product|service|content):\s*)?(.+)$/i)?.[2]?.trim() ??
    null;
  const item = (afterColon || legacyItem || '').trim();

  if (item && !/^(a new (product|service|post|content)|untitled)$/i.test(item)) {
    return `${actor} ${verb} a new ${kind}: ${item}`;
  }
  return `${actor} ${verb} a new ${kind}.`;
}
