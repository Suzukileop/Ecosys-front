/** Identifiants de zone cible pour le scroll + encadrement depuis une notification. */
export const NOTIFICATION_TARGET = {
  WAITING_AGENT: 'waiting-agent',
  VALIDATION_MODEL: 'validation-model',
  PAYMENT: 'payment',
  SCHEDULER: 'scheduler',
  ACTIVE: 'active',
  AGENT_CONTENT: 'agent-content',
  CONTENT_ITEM: 'content-item',
  AGENT_DEMO: 'agent-demo',
  AGENT_DELIVER: 'agent-deliver',
} as const;

export type NotificationTargetId = (typeof NOTIFICATION_TARGET)[keyof typeof NOTIFICATION_TARGET];

export const HIGHLIGHT_TO_STEP_INDEX: Partial<Record<NotificationTargetId, number>> = {
  [NOTIFICATION_TARGET.WAITING_AGENT]: 2,
  [NOTIFICATION_TARGET.VALIDATION_MODEL]: 2,
  [NOTIFICATION_TARGET.PAYMENT]: 3,
  [NOTIFICATION_TARGET.SCHEDULER]: 4,
  [NOTIFICATION_TARGET.ACTIVE]: 5,
};

export function hrefWithNotificationHighlight(path: string, target: NotificationTargetId): string {
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}highlight=${encodeURIComponent(target)}`;
}

export function appendNotificationQuery(path: string, params: Record<string, string>): string {
  const qs = new URLSearchParams(params);
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}${qs.toString()}`;
}

export function notificationContentTargetId(contentId: string): string {
  return `notification-target-content-${contentId}`;
}

export function isHighlightTarget(
  highlight: string | null,
  targetId: string,
  alsoMatch: string[] = [],
): boolean {
  if (!highlight) return false;
  return highlight === targetId || alsoMatch.includes(highlight);
}

export function notificationTargetElementId(targetId: string): string {
  return `notification-target-${targetId}`;
}
