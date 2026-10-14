import { msg } from '@/lib/i18n/config';
import type { ReactNode } from 'react';
import {
  CREATOR_NEW_FOLLOWER_TYPE,
  CREATOR_PROFILE_VISIT_GROUP_TYPE,
  CREATOR_PROFILE_VISIT_TYPE,
  FOLLOWER_NEW_CONTENT_TYPE,
  FOLLOWER_NEW_PRODUCT_TYPE,
  FOLLOWER_NEW_SERVICE_TYPE,
  MARKETPLACE_NEW_COMMENT_TYPE,
  filterNotifications,
} from '@/lib/notifications';
import type { NotificationDto } from '@/types/profile';

/*
 * What a notification is about, and the views the page offers on the list. Presentation only: the
 * API still returns one flat list; "Unread" reuses `filterNotifications`, the type views narrow it by
 * `type` on the client. Glyphs are drawn like News's rail (RailGlyph): one 24-unit box, round caps
 * and joins, no fill — so the type badge on an avatar, the rail rows and the chips share one set.
 */

export type NotificationKind =
  | 'follow'
  | 'visit'
  | 'product'
  | 'content'
  | 'service'
  | 'comment'
  | 'invite'
  | 'other';

export function notificationKind(type: string): NotificationKind {
  switch (type) {
    case CREATOR_NEW_FOLLOWER_TYPE:
      return 'follow';
    case CREATOR_PROFILE_VISIT_TYPE:
    case CREATOR_PROFILE_VISIT_GROUP_TYPE:
      return 'visit';
    case FOLLOWER_NEW_PRODUCT_TYPE:
      return 'product';
    case FOLLOWER_NEW_CONTENT_TYPE:
      return 'content';
    case FOLLOWER_NEW_SERVICE_TYPE:
      return 'service';
    case MARKETPLACE_NEW_COMMENT_TYPE:
      return 'comment';
    case 'CONVERSATION_GUEST_INVITE':
      return 'invite';
    default:
      return 'other';
  }
}

/** The bell. */
const BELL = (
  <>
    <path d="M18.4 15.4a1.9 1.9 0 0 1-.55-1.33V10.9a5.9 5.9 0 0 0-4.1-5.6v-.4a1.75 1.75 0 1 0-3.5 0v.4a5.9 5.9 0 0 0-4.1 5.6v3.17c0 .5-.2.98-.55 1.33L4.5 16.7h15l-1.1-1.3Z" />
    <path d="M14.1 19.2a2.35 2.35 0 0 1-4.2 0" />
  </>
);

/** A speech bubble — comments and conversation invites. */
const BUBBLE = (
  <path d="M20.5 11.6c0 4.2-3.8 7.6-8.5 7.6a9.6 9.6 0 0 1-3.6-.7L3.5 20l1.4-3.6a7.1 7.1 0 0 1-1.4-4.8C3.5 7.4 7.3 4 12 4s8.5 3.4 8.5 7.6Z" />
);

export const KIND_GLYPHS: Record<NotificationKind, ReactNode> = {
  /* A person with a plus. */
  follow: (
    <>
      <circle cx="9.5" cy="8" r="3.5" />
      <path d="M3 20a6.5 6.5 0 0 1 13 0" />
      <path d="M19 8v6" />
      <path d="M16 11h6" />
    </>
  ),
  /* An eye. */
  visit: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  /* A shopping bag. */
  product: (
    <>
      <path d="M5 8h14l-1.2 12H6.2z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  /* A picture. */
  content: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="m21 16-5-5-9 9" />
    </>
  ),
  /* A briefcase. */
  service: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M3 12.5h18" />
    </>
  ),
  comment: BUBBLE,
  invite: BUBBLE,
  other: BELL,
};

export type NotificationView = 'all' | 'unread' | 'follows' | 'visits' | 'publications' | 'comments';

export const VIEW_LABELS: Record<NotificationView, { chip: string; rail: string; filtered: string }> = {
  all: { chip: msg('All'), rail: msg('All'), filtered: msg('All') },
  unread: { chip: msg('Unread'), rail: msg('Unread'), filtered: msg('Unread') },
  follows: { chip: msg('Followers'), rail: msg('New followers'), filtered: msg('New followers') },
  visits: { chip: msg('Visits'), rail: msg('Profile visits'), filtered: msg('Profile visits') },
  publications: { chip: msg('Publications'), rail: msg('Publications'), filtered: msg('Publications') },
  comments: { chip: msg('Comments'), rail: msg('Comments'), filtered: msg('Comments') },
};

export const VIEW_GLYPHS: Record<NotificationView, ReactNode> = {
  all: BELL,
  /* A ring around a dot — the unread mark. */
  unread: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </>
  ),
  follows: KIND_GLYPHS.follow,
  visits: KIND_GLYPHS.visit,
  /* Four tiles — products, posts and services from people you follow. */
  publications: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  comments: BUBBLE,
};

const TYPE_VIEWS: NotificationView[] = ['follows', 'visits', 'publications', 'comments'];

function viewOfKind(kind: NotificationKind): NotificationView | null {
  if (kind === 'follow') return 'follows';
  if (kind === 'visit') return 'visits';
  if (kind === 'product' || kind === 'content' || kind === 'service') return 'publications';
  if (kind === 'comment') return 'comments';
  return null;
}

export function filterByView(items: NotificationDto[], view: NotificationView): NotificationDto[] {
  if (view === 'all' || view === 'unread') return filterNotifications(items, view);
  return items.filter((n) => viewOfKind(notificationKind(n.type)) === view);
}

/**
 * "All" and "Unread" always; a type view only when the loaded list holds that type (or it is the
 * current view) — no filter that can only lead to an empty list.
 */
export function availableViews(items: NotificationDto[], current: NotificationView): NotificationView[] {
  const present = new Set(items.map((n) => viewOfKind(notificationKind(n.type))));
  return ['all', 'unread', ...TYPE_VIEWS.filter((view) => present.has(view) || view === current)];
}
