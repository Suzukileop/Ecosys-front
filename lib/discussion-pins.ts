const STORAGE_PREFIX = 'discussion-pins:';

function storageKey(conversationId: string): string {
  return `${STORAGE_PREFIX}${conversationId}`;
}

export function getPinnedMessageIds(conversationId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(conversationId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function isMessagePinned(conversationId: string, messageId: string): boolean {
  return getPinnedMessageIds(conversationId).includes(messageId);
}

export function togglePinnedMessage(conversationId: string, messageId: string): boolean {
  const current = getPinnedMessageIds(conversationId);
  const pinned = current.includes(messageId);
  const next = pinned ? current.filter((id) => id !== messageId) : [...current, messageId];
  window.localStorage.setItem(storageKey(conversationId), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('discussion-pins-updated', { detail: { conversationId } }));
  return !pinned;
}

export function removePinnedMessage(conversationId: string, messageId: string): void {
  const current = getPinnedMessageIds(conversationId);
  if (!current.includes(messageId)) return;
  window.localStorage.setItem(
    storageKey(conversationId),
    JSON.stringify(current.filter((id) => id !== messageId))
  );
  window.dispatchEvent(new CustomEvent('discussion-pins-updated', { detail: { conversationId } }));
}
