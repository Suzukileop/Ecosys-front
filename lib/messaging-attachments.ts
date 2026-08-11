const failedAttachmentKeys = new Set<string>();

function attachmentFailureKey(conversationId: string, attachmentId: string): string {
  return `${conversationId}:${attachmentId}`;
}

export function isAttachmentLoadFailed(conversationId: string, attachmentId: string): boolean {
  return failedAttachmentKeys.has(attachmentFailureKey(conversationId, attachmentId));
}

export function markAttachmentLoadFailed(conversationId: string, attachmentId: string): void {
  failedAttachmentKeys.add(attachmentFailureKey(conversationId, attachmentId));
}

export function clearAttachmentLoadFailuresForConversation(conversationId: string): void {
  const prefix = `${conversationId}:`;
  Array.from(failedAttachmentKeys).forEach((key) => {
    if (key.startsWith(prefix)) {
      failedAttachmentKeys.delete(key);
    }
  });
}

export function isAttachmentNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const data = (error as { response?: { data?: { error?: string } } }).response?.data;
  return data?.error === 'ATTACHMENT_NOT_FOUND';
}
