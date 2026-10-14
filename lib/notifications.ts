import { msg } from '@/lib/i18n/config';
import { localeTag, tr, trPlural } from '@/lib/i18n/active';
import api from '@/lib/api';
import { normalizeSpringPage } from '@/lib/pagination';
import type { NotificationDto, PagedResponse, SpringPageRaw } from '@/types/profile';
import { SIGNED_IN_HOME } from '@/lib/routes';
import { computeHeaderBadgeCount, createHeaderBadgeStore } from '@/lib/header-badge';

export const NOTIFICATION_BADGE_DISMISS_EVENT = 'notification-badge-dismiss';

export const notificationBadgeStore = createHeaderBadgeStore(
  'notification_badge_baseline',
  NOTIFICATION_BADGE_DISMISS_EVENT
);

/** A comment on one of the viewer's posts: `refId` is the post, `refSecondaryId` the comment. */
export const MARKETPLACE_NEW_COMMENT_TYPE = 'MARKETPLACE_NEW_COMMENT';

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
  nouveau: msg('New'),
  aujourdhui: msg('Today'),
  plus_tot: msg('Earlier'),
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

export function getNotificationBadgeBaseline(userId?: string | null): number {
  return notificationBadgeStore.read(userId);
}

/** Masque le badge sans marquer les notifications comme lues (style Facebook). */
export function dismissNotificationBadge(currentUnread: number, userId?: string | null): void {
  notificationBadgeStore.write(currentUnread, userId);
}

export function computeNotificationBadgeCount(unreadTotal: number, baseline: number): number {
  return computeHeaderBadgeCount(unreadTotal, baseline);
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
  if (diffMin < 1) return tr('Just now');
  if (diffMin < 60) return tr('{count} min ago', { count: diffMin });

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return tr('{count}h ago', { count: diffH });

  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return trPlural(diffD, '{count} day ago', '{count} days ago');

  return date.toLocaleDateString(localeTag(), { month: 'short', day: 'numeric', year: 'numeric' });
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
    case MARKETPLACE_NEW_COMMENT_TYPE:
      /* The feed opens that post with its comments unfolded and the comment highlighted. */
      return refSecondaryId
        ? `/feed?post=${encodeURIComponent(refId)}&comment=${encodeURIComponent(refSecondaryId)}`
        : `/feed?post=${encodeURIComponent(refId)}`;
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
  CONVERSATION_GUEST_INVITE: msg('Temporary conversation invite'),
  CREATOR_PROFILE_VISIT: msg('Profile visit'),
  CREATOR_PROFILE_VISIT_GROUP: msg('Profile visits'),
  CREATOR_NEW_FOLLOWER: msg('New follower'),
  FOLLOWER_NEW_PRODUCT: msg('New product'),
  FOLLOWER_NEW_CONTENT: msg('New content'),
  FOLLOWER_NEW_SERVICE: msg('New service'),
  MARKETPLACE_NEW_COMMENT: msg('New comment'),
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
  const title = tr(NOTIFICATION_TITLES_EN[n.type] ?? n.title);
  const raw = n.message?.trim() ?? null;

  switch (n.type) {
    case CREATOR_PROFILE_VISIT_TYPE: {
      const name = n.actorFullName?.trim() || extractVisitorNameFromVisitMessage(raw);
      if (name) {
        return { title, message: tr('{name} visited your profile.', { name }) };
      }
      return { title, message: tr('Someone visited your profile.') };
    }

    case CREATOR_PROFILE_VISIT_GROUP_TYPE: {
      const name = n.actorFullName?.trim() || extractVisitorNameFromVisitMessage(raw);
      return { title, message: name ? tr('{name} visited your profile.', { name }) : raw };
    }

    case CREATOR_NEW_FOLLOWER_TYPE: {
      const name = n.actorFullName?.trim() || extractFollowerNameFromFollowMessage(raw);
      if (name) {
        return { title, message: tr('{name} started following you.', { name }) };
      }
      return { title, message: tr('Someone started following you.') };
    }

    case FOLLOWER_NEW_PRODUCT_TYPE:
      return {
        title: tr('New product'),
        message: formatFollowerPublishMessage(raw, n.actorFullName, 'product', 'published'),
      };

    case FOLLOWER_NEW_CONTENT_TYPE:
      return {
        title: tr('New content'),
        message: formatFollowerPublishMessage(raw, n.actorFullName, 'content', 'shared'),
      };

    case FOLLOWER_NEW_SERVICE_TYPE:
      return {
        title: tr('New service'),
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
    tr('A creator you follow');

  const afterColon = raw?.includes(':') ? raw.slice(raw.indexOf(':') + 1).trim() : null;
  const legacyItem =
    raw?.match(/^(.+?)\s+(?:published|shared|added)\s+(?:a\s+new\s+(?:product|service|content):\s*)?(.+)$/i)?.[2]?.trim() ??
    null;
  const item = (afterColon || legacyItem || '').trim();

  const withItem = item && !/^(a new (product|service|post|content)|untitled)$/i.test(item);
  const sentence = {
    product: withItem ? msg('{actor} published a new product: {item}') : msg('{actor} published a new product.'),
    content: withItem ? msg('{actor} shared a new post: {item}') : msg('{actor} shared a new post.'),
    service: withItem ? msg('{actor} added a new service: {item}') : msg('{actor} added a new service.'),
  }[kind];
  void verb;
  return tr(sentence, { actor, item });
}
