import { localeTag, tr } from '@/lib/i18n/active';
import type { DirectMessage } from '@/types/messaging';

type TimelineItem =
  | { kind: 'date'; key: string; label: string }
  | { kind: 'message'; key: string; message: DirectMessage };

function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'unknown';
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Day rule label, News-style sentence case: "Today", "Yesterday", "Mon, Sep 29", "Sep 29, 2025". */
function formatConversationDateLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) return tr('Today');
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  if (isYesterday) return tr('Yesterday');
  if (date.getFullYear() !== now.getFullYear()) {
    return date.toLocaleDateString(localeTag(), { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return date.toLocaleDateString(localeTag(), { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatConversationTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(localeTag(), { hour: 'numeric', minute: '2-digit' });
}

/** Build timeline with date separators from chronological messages. */
export function buildMessageTimeline(messages: DirectMessage[]): TimelineItem[] {
  const items: TimelineItem[] = [];
  let lastDay: string | null = null;
  for (const message of messages) {
    if (message.messageType === 'SYSTEM') {
      items.push({ kind: 'message', key: message.id, message });
      continue;
    }
    const key = dayKey(message.sentAt);
    if (key !== lastDay) {
      items.push({ kind: 'date', key: `date-${key}`, label: formatConversationDateLabel(message.sentAt) });
      lastDay = key;
    }
    items.push({ kind: 'message', key: message.id, message });
  }
  return items;
}
