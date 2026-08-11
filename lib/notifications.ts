import api from '@/lib/api';
import { normalizeSpringPage } from '@/lib/ecosystem';
import {
  hrefWithNotificationHighlight,
  NOTIFICATION_TARGET,
} from '@/lib/notification-highlight';
import type { NotificationDto, PagedResponse, SpringPageRaw } from '@/types/ecosystem';

const BADGE_BASELINE_KEY = 'notification_badge_baseline';
export const NOTIFICATION_BADGE_DISMISS_EVENT = 'notification-badge-dismiss';

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

export function groupNotificationsByTime(
  items: NotificationDto[],
): { key: NotificationTimeGroup; items: NotificationDto[] }[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const buckets: Record<NotificationTimeGroup, NotificationDto[]> = {
    nouveau: [],
    aujourdhui: [],
    plus_tot: [],
  };

  for (const n of items) {
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

/** Lien cible selon le type de notification et le rôle de l'utilisateur. */
export function resolveNotificationHref(
  type: string,
  refId?: string | null,
  isAgent = false,
  refSecondaryId?: string | null,
): string | null {
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
    case 'CREATOR_PROFILE_VISIT':
      return '/dashboard/creator?tab=visitors';
    default:
      return '/dashboard/home';
  }
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

    case 'CREATOR_PROFILE_VISIT':
      return { title, message: raw ?? 'Someone visited your profile.' };

    default:
      return { title, message: raw };
  }
}
