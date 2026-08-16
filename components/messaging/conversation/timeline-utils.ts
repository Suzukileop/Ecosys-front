import type { DirectMessage } from '@/types/messaging';

export type TimelineItem =
  | { kind: 'date'; key: string; label: string }
  | { kind: 'message'; key: string; message: DirectMessage };

function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'unknown';
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function formatConversationDateLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const datePart = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase();
  if (sameDay) return `TODAY — ${datePart}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  if (isYesterday) return `YESTERDAY — ${datePart}`;
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
}

export function formatConversationDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatConversationTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
