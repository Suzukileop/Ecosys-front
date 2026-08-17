import type { DirectMessage } from '@/types/messaging';
import { isGuestSessionTraceMessage } from '@/lib/guest-session-trace';

export type InboxPreviewKind = 'text' | 'photo' | 'video' | 'audio' | 'document' | 'call' | 'system';

export type InboxPreviewParts = {
  kind: InboxPreviewKind;
  /** Primary label shown in the inbox row (e.g. "Document", "report.pdf", caption). */
  label: string;
};

function attachmentKind(contentType: string | undefined | null): Exclude<InboxPreviewKind, 'text' | 'call' | 'system'> {
  const type = contentType?.toLowerCase() ?? '';
  if (type.startsWith('image/')) return 'photo';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  return 'document';
}

function defaultLabelForKind(kind: InboxPreviewParts['kind']): string {
  switch (kind) {
    case 'photo':
      return 'Photo';
    case 'video':
      return 'Video';
    case 'audio':
      return 'Audio';
    case 'document':
      return 'Document';
    case 'call':
      return 'Call';
    case 'system':
      return 'System message';
    default:
      return 'Message';
  }
}

function emojiForKind(kind: InboxPreviewParts['kind']): string {
  switch (kind) {
    case 'photo':
      return '📷';
    case 'video':
      return '🎥';
    case 'audio':
      return '🎵';
    case 'document':
      return '📄';
    case 'call':
      return '📞';
    default:
      return '';
  }
}

/** Serialize attachment preview for inbox / realtime (WhatsApp-style). */
export function formatAttachmentPreviewParts(message: DirectMessage): InboxPreviewParts {
  const caption = message.content?.trim() ?? '';
  const attachment = message.attachments?.[0];
  const kind = attachmentKind(attachment?.contentType);
  const fileName = attachment?.fileName?.trim() || '';

  if (caption) {
    return { kind, label: caption };
  }
  if (kind === 'document' && fileName) {
    return { kind, label: fileName };
  }
  return { kind, label: defaultLabelForKind(kind) };
}

export function formatAttachmentPreview(message: DirectMessage): string {
  const parts = formatAttachmentPreviewParts(message);
  const emoji = emojiForKind(parts.kind);
  return emoji ? `${emoji} ${parts.label}` : parts.label;
}

export function formatMessagePreview(message: DirectMessage): string | null {
  if (isGuestSessionTraceMessage(message)) {
    return null;
  }

  if (message.messageType === 'SYSTEM') {
    return message.content?.trim() || 'System message';
  }

  if (message.messageType === 'CALL') {
    return '📞 Call';
  }

  if (message.messageType === 'FILE' || (message.attachments?.length ?? 0) > 0) {
    return formatAttachmentPreview(message);
  }

  const text = message.content?.trim();
  if (text) return text;

  return 'Message';
}

/**
 * Parse a stored / realtime preview string into kind + label for inbox UI.
 * Supports current and legacy formats (`📎 File`, plain "Photo", etc.).
 */
export function parseInboxPreview(raw: string): InboxPreviewParts {
  const text = raw.trim();
  if (!text) return { kind: 'text', label: 'No messages yet' };

  const patterns: Array<{ re: RegExp; kind: InboxPreviewParts['kind'] }> = [
    { re: /^(?:📷|📸)\s*(.*)$/u, kind: 'photo' },
    { re: /^(?:🎥|🎬|📹)\s*(.*)$/u, kind: 'video' },
    { re: /^(?:🎵|🎶|🎧)\s*(.*)$/u, kind: 'audio' },
    { re: /^(?:📄|📎|📃|📁)\s*(.*)$/u, kind: 'document' },
    { re: /^(?:📞|☎️)\s*(.*)$/u, kind: 'call' },
  ];

  for (const { re, kind } of patterns) {
    const match = text.match(re);
    if (!match) continue;
    let label = (match[1] ?? '').trim();
    if (!label || /^file$/i.test(label) || /^attachment$/i.test(label)) {
      label = defaultLabelForKind(kind);
    }
    return { kind, label };
  }

  // Legacy plain labels without emoji
  if (/^photo$/i.test(text)) return { kind: 'photo', label: 'Photo' };
  if (/^video$/i.test(text)) return { kind: 'video', label: 'Video' };
  if (/^audio$/i.test(text)) return { kind: 'audio', label: 'Audio' };
  if (/^(file|attachment|document)$/i.test(text)) return { kind: 'document', label: 'Document' };
  if (/^call$/i.test(text)) return { kind: 'call', label: 'Call' };

  return { kind: 'text', label: text };
}
