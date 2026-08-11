import type { DirectMessage } from '@/types/messaging';
import { isGuestSessionTraceMessage } from '@/lib/guest-session-trace';

export function formatMessagePreview(message: DirectMessage): string | null {
  if (isGuestSessionTraceMessage(message)) {
    return null;
  }

  if (message.messageType === 'SYSTEM') {
    return message.content?.trim() || 'System message';
  }

  const text = message.content?.trim();
  if (text) return text;

  const attachment = message.attachments?.[0];
  if (attachment) {
    if (attachment.contentType.startsWith('image/')) return 'Photo';
    if (attachment.contentType.startsWith('video/')) return 'Video';
    return attachment.fileName || 'Attachment';
  }

  return 'Message';
}
