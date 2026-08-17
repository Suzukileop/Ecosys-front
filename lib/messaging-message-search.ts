/** Client-side conversation message search (keyword / partial word). */

import type { DirectMessage } from '@/types/messaging';
import { isGuestSessionTraceMessage } from '@/lib/guest-session-trace';

export function getMessageSearchHaystack(message: DirectMessage): string {
  const parts: string[] = [];
  if (message.content?.trim()) parts.push(message.content.trim());
  for (const attachment of message.attachments ?? []) {
    if (attachment.fileName?.trim()) parts.push(attachment.fileName.trim());
  }
  return parts.join(' ');
}

export function messageMatchesSearchQuery(message: DirectMessage, query: string): boolean {
  if (isGuestSessionTraceMessage(message)) return false;
  if (message.messageType === 'SYSTEM' && !message.content?.trim()) return false;
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return false;
  const haystack = getMessageSearchHaystack(message).toLowerCase();
  if (!haystack) return false;
  return tokens.every((token) => haystack.includes(token));
}

/** Build a short preview with the first match emphasized via markers. */
export function buildSearchPreview(message: DirectMessage, query: string): { before: string; match: string; after: string } {
  const text = getMessageSearchHaystack(message) || 'Message';
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const lower = text.toLowerCase();
  let index = -1;
  let matchLen = 0;
  for (const token of tokens) {
    const at = lower.indexOf(token);
    if (at >= 0) {
      index = at;
      matchLen = token.length;
      break;
    }
  }
  if (index < 0) {
    const clipped = text.length > 100 ? `${text.slice(0, 100)}…` : text;
    return { before: clipped, match: '', after: '' };
  }
  const start = Math.max(0, index - 36);
  const end = Math.min(text.length, index + matchLen + 48);
  return {
    before: `${start > 0 ? '…' : ''}${text.slice(start, index)}`,
    match: text.slice(index, index + matchLen),
    after: `${text.slice(index + matchLen, end)}${end < text.length ? '…' : ''}`,
  };
}

export function filterMessagesBySearchQuery(messages: DirectMessage[], query: string): DirectMessage[] {
  const q = query.trim();
  if (!q) return [];
  return messages
    .filter((message) => messageMatchesSearchQuery(message, q))
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}
