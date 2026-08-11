import type { ConversationSummary } from '@/types/messaging';

export type OutgoingMessageStatus = 'sent' | 'delivered' | 'seen';

export function getOutgoingMessageStatus(
  conversation: ConversationSummary,
  currentUserId: string | null | undefined,
  deliveredUserIds?: Set<string>
): OutgoingMessageStatus | null {
  if (!currentUserId || !conversation.lastMessageId) return null;
  if (conversation.lastMessageSenderId !== currentUserId) return null;

  const sentAt = conversation.lastMessageAt ? new Date(conversation.lastMessageAt).getTime() : NaN;
  const readAt = conversation.otherUserLastReadAt
    ? new Date(conversation.otherUserLastReadAt).getTime()
    : NaN;

  if (!Number.isNaN(sentAt) && !Number.isNaN(readAt) && readAt >= sentAt) {
    return 'seen';
  }

  if (conversation.otherUserId && deliveredUserIds?.has(conversation.otherUserId)) {
    return 'delivered';
  }

  return 'sent';
}

export function getOutgoingStatusLabel(status: OutgoingMessageStatus): string {
  switch (status) {
    case 'seen':
      return 'Seen';
    case 'delivered':
      return 'Delivered';
    default:
      return 'Sent';
  }
}
