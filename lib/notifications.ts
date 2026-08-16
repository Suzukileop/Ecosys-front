import api from '@/lib/api';
import { normalizeSpringPage } from '@/lib/ecosystem';
import {
  hrefWithNotificationHighlight,
  NOTIFICATION_TARGET,
} from '@/lib/notification-highlight';
import type { NotificationDto, PagedResponse, SpringPageRaw } from '@/types/ecosystem';

const BADGE_BASELINE_KEY = 'notification_badge_baseline';
export const NOTIFICATION_BADGE_DISMISS_EVENT = 'notification-badge-dismiss';

/**
 * When more than this many registered profile-visit notifications fall on the
 * same calendar day, they collapse into one aggregated row in the panel.
 */
export const PROFILE_VISIT_NOTIFICATION_INDIVIDUAL_MAX = 3;

export const CREATOR_PROFILE_VISIT_TYPE = 'CREATOR_PROFILE_VISIT';
export const CREATOR_PROFILE_VISIT_GROUP_TYPE = 'CREATOR_PROFILE_VISIT_GROUP';

export type NotificationFilter = 'all' | 'unread';
export type NotificationTimeGroup = 'nouveau' | 'aujourdhui' | 'plus_tot';

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

export async function markNotificationRead(id: string): Promise<void> {
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

function localDayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'invalid';
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function isProfileVisitNotification(n: NotificationDto): boolean {
  return n.type === CREATOR_PROFILE_VISIT_TYPE && !n.aggregatedNotificationIds?.length;
}

/**
 * Collapse same-day profile-visit notifications beyond
 * {@link PROFILE_VISIT_NOTIFICATION_INDIVIDUAL_MAX} into one row.
 */
export function collapseProfileVisitNotifications(
  items: NotificationDto[],
  individualMax = PROFILE_VISIT_NOTIFICATION_INDIVIDUAL_MAX,
): NotificationDto[] {
  const visitsByDay = new Map<string, NotificationDto[]>();
  for (const n of items) {
    if (!isProfileVisitNotification(n)) continue;
    const key = localDayKey(n.createdAt);
    const list = visitsByDay.get(key) ?? [];
    list.push(n);
    visitsByDay.set(key, list);
  }

  const collapsedIds = new Set<string>();
  const aggregates: NotificationDto[] = [];

  for (const [dayKey, visits] of visitsByDay) {
    if (visits.length <= individualMax) continue;
    const sorted = [...visits].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    sorted.forEach((v) => collapsedIds.add(v.id));
    const unread = sorted.some((v) => !v.isRead);
    const count = sorted.length;
    const isToday = dayKey === localDayKey(new Date().toISOString());
    const daySuffix = isToday ? ' today' : '';
    aggregates.push({
      id: `profile-visit-group:${dayKey}`,
      type: CREATOR_PROFILE_VISIT_GROUP_TYPE,
      title: 'Profile visits',
      message:
        count === 1
          ? `1 person visited your profile${daySuffix}.`
          : `${count} people visited your profile${daySuffix}.`,
      isRead: !unread,
      createdAt: sorted[0]?.createdAt ?? new Date().toISOString(),
      refId: sorted[0]?.refId ?? null,
      refSecondaryId: null,
      aggregatedNotificationIds: sorted.map((v) => v.id),
      actorFullName: null,
      actorAvatarUrl: null,
      actorProfileAvailable: null,
    });
  }

  const kept = items.filter((n) => !collapsedIds.has(n.id));
  const merged = [...kept, ...aggregates];
  merged.sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return merged;
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

export type ResolveNotificationHrefOptions = {
  actorProfileAvailable?: boolean | null;
};

/** Lien cible selon le type de notification et le rôle de l'utilisateur. */
export function resolveNotificationHref(
  type: string,
  refId?: string | null,
  isAgent = false,
  refSecondaryId?: string | null,
  options?: ResolveNotificationHrefOptions,
): string | null {
  if (type === CREATOR_PROFILE_VISIT_GROUP_TYPE) {
    return '/dashboard/creator?tab=visitors';
  }

  if (type === CREATOR_PROFILE_VISIT_TYPE) {
    if (refSecondaryId) {
      if (options?.actorProfileAvailable === false) {
        return null;
      }
      return `/marketplace/${encodeURIComponent(refSecondaryId)}`;
    }
    return '/dashboard/creator?tab=visitors';
  }

  if (!refId) {
    if (isAgent && (type === 'NICHE_ACTIVATED' || type === 'NICHE_WAITING_VALIDATION' || type === 'NICHE_REQUEST_NEW')) {
      return '/dashboard/agent';
    }
    return null;
  }

  if (isAgent) {
    switch (type) {
      case 'NICHE_WAITING_VALIDATION':
      case 'NICHE_REQUEST_NEW':
      case 'DEMO_REJECTED':
        return hrefWithNotificationHighlight(`/dashboard/agent/${refId}`, NOTIFICATION_TARGET.AGENT_DEMO);
      case 'NICHE_ACTIVATED':
        return hrefWithNotificationHighlight(
          `/dashboard/agent/deliver/${refId}`,
          NOTIFICATION_TARGET.AGENT_DELIVER,
        );
      default:
        return '/dashboard/agent';
    }
  }

  switch (type) {
    case 'DEMO_READY':
    case 'NICHE_PENDING_MODEL':
    case 'ECOSYSTEM_ACTIVE':
    case 'CONTENT_DELIVERED':
      return '/dashboard/home';
    case 'CONVERSATION_GUEST_INVITE':
      return '/dashboard/discussions?filter=temporary';
    default:
      return '/dashboard/home';
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
  isAgent: boolean,
): { href: string | null; unavailableVisitor: boolean } {
  if (n.type === CREATOR_PROFILE_VISIT_TYPE && n.refSecondaryId && n.actorProfileAvailable === false) {
    return { href: null, unavailableVisitor: true };
  }
  return {
    href: resolveNotificationHref(n.type, n.refId, isAgent, n.refSecondaryId, {
      actorProfileAvailable: n.actorProfileAvailable,
    }),
    unavailableVisitor: false,
  };
}

const NOTIFICATION_TITLES_EN: Record<string, string> = {
  CONTENT_DELIVERED: 'New content available',
  ECOSYSTEM_ACTIVE: 'Ecosystem activated',
  DEMO_READY: 'Validation model ready',
  NICHE_PENDING_MODEL: 'Request submitted',
  NICHE_WAITING_VALIDATION: 'Niche awaiting validation model',
  NICHE_REQUEST_NEW: 'New niche request',
  NICHE_ACTIVATED: 'Niche activated by client',
  DEMO_REJECTED: 'Validation model rejected',
  PAYMENT_FAILED: 'Payment failed',
  POST_PUBLISHED: 'Published successfully',
  POST_FAILED: 'Publication failed',
  CONVERSATION_GUEST_INVITE: 'Temporary conversation invite',
  CREATOR_PROFILE_VISIT: 'Profile visit',
  CREATOR_PROFILE_VISIT_GROUP: 'Profile visits',
};

function extractQuotedTheme(message: string | null | undefined): string | null {
  if (!message) return null;
  const fr = message.match(/«([^»]+)»/);
  if (fr?.[1]) return fr[1].trim();
  const en = message.match(/"([^"]+)"/);
  if (en?.[1]) return en[1].trim();
  return null;
}

function extractContentNumber(message: string | null | undefined): string | null {
  if (!message) return null;
  const match = message.match(/(?:Contenu n°|Content #)\s*(\d+)/i);
  return match?.[1] ?? null;
}

function extractAfterColon(message: string | null | undefined): string | null {
  if (!message) return null;
  const idx = message.indexOf(':');
  if (idx < 0) return null;
  return message.slice(idx + 1).trim() || null;
}

export function extractVisitorNameFromVisitMessage(message: string | null | undefined): string | null {
  if (!message) return null;
  const match = message.match(/^(.+?)\s+visited your profile\.?$/i);
  if (!match?.[1]) return null;
  const name = match[1].trim();
  if (!name || /^someone$/i.test(name) || /^a user$/i.test(name)) return null;
  return name;
}

/** English labels for stored notifications (legacy French rows included). */
export function formatNotificationDisplay(n: NotificationDto): { title: string; message: string | null } {
  const title = NOTIFICATION_TITLES_EN[n.type] ?? n.title;
  const theme = extractQuotedTheme(n.message);
  const contentNum = extractContentNumber(n.message);
  const raw = n.message?.trim() ?? null;

  switch (n.type) {
    case 'CONTENT_DELIVERED':
      if (contentNum && theme) {
        return { title, message: `Your agent delivered Content #${contentNum} for "${theme}".` };
      }
      if (theme) {
        return { title, message: `Your agent delivered content for "${theme}".` };
      }
      return { title, message: 'Your agent delivered new content.' };

    case 'ECOSYSTEM_ACTIVE':
      if (theme) {
        return {
          title,
          message: `Your ecosystem "${theme}" is active! Set up your publishing schedule.`,
        };
      }
      return { title, message: 'Your ecosystem is active! Set up your publishing schedule.' };

    case 'DEMO_READY':
      if (theme) {
        return {
          title,
          message: `Your agent published the validation model for "${theme}". Review and approve it.`,
        };
      }
      return {
        title,
        message: 'Your validation model is ready. Review and approve it.',
      };

    case 'NICHE_PENDING_MODEL':
      if (theme) {
        return {
          title,
          message: `Your niche "${theme}" is being processed. You will be notified when the validation model is ready.`,
        };
      }
      return {
        title,
        message: 'Your niche is being processed. You will be notified when the validation model is ready.',
      };

    case 'NICHE_WAITING_VALIDATION':
    case 'NICHE_REQUEST_NEW':
      if (theme) {
        return {
          title,
          message: `The client confirmed "${theme}". Prepare the validation model.`,
        };
      }
      return { title, message: 'A client niche is ready for validation model preparation.' };

    case 'NICHE_ACTIVATED':
      if (theme) {
        return {
          title,
          message: `The client activated the ecosystem "${theme}". You can deliver content.`,
        };
      }
      return { title, message: 'A client activated their ecosystem. You can deliver content.' };

    case 'DEMO_REJECTED': {
      const reason = extractAfterColon(raw);
      const codeMatch = raw?.match(/\(([^)]+)\)/);
      const code = codeMatch?.[1];
      if (code && reason) {
        return { title, message: `The client rejected the validation model (${code}): ${reason}` };
      }
      if (reason) {
        return { title, message: `The client rejected the validation model: ${reason}` };
      }
      return { title, message: 'The client rejected the validation model.' };
    }

    case 'PAYMENT_FAILED':
      return {
        title,
        message: 'Your ecosystem subscription payment failed. Please try again.',
      };

    case 'POST_PUBLISHED': {
      const platformMatch = raw?.match(/(?:sur|on)\s+(\w+)/i);
      const platform = platformMatch?.[1];
      if (platform) {
        return { title, message: `Your content was published on ${platform}.` };
      }
      return { title, message: 'Your content was published successfully.' };
    }

    case 'POST_FAILED': {
      const failMatch = raw?.match(/(?:sur|on)\s+(\w+)\s*:\s*(.+)/i);
      if (failMatch) {
        return { title, message: `Failed to publish on ${failMatch[1]}: ${failMatch[2]}` };
      }
      return { title, message: raw ?? 'Content publication failed.' };
    }

    case CREATOR_PROFILE_VISIT_TYPE: {
      const name = n.actorFullName?.trim() || extractVisitorNameFromVisitMessage(raw);
      if (name) {
        return { title, message: `${name} visited your profile.` };
      }
      return { title, message: raw ?? 'Someone visited your profile.' };
    }

    case CREATOR_PROFILE_VISIT_GROUP_TYPE:
      return { title, message: raw };

    default:
      return { title, message: raw };
  }
}
