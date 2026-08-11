import type { DirectMessage } from '@/types/messaging';

export function isGuestSessionTrace(content?: string | null): boolean {
  const text = content?.trim().toLowerCase() ?? '';
  return (
    text.includes('temporary guest') ||
    text.includes('temporary conversation') ||
    text.includes('temporary guest access')
  );
}

export function isGuestSessionTraceMessage(message: Pick<DirectMessage, 'messageType' | 'content'>): boolean {
  return message.messageType === 'SYSTEM' && isGuestSessionTrace(message.content);
}

export function filterGuestSessionTraces(messages: DirectMessage[]): DirectMessage[] {
  return messages.filter(isGuestSessionTraceMessage);
}

export function formatGuestTraceTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
