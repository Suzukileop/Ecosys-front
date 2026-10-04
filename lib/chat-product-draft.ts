const STORAGE_KEY = 'np:chat-product-draft';
const MAX_AGE_MS = 10 * 60 * 1000;

type PendingProductDraft = {
  partnerUserId: string;
  productId: string;
  createdAt: number;
};

/** Remembers that the next chat opened with `partnerUserId` should start with a message about `productId`. */
export function setPendingProductDraft(partnerUserId: string, productId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const draft: PendingProductDraft = { partnerUserId, productId, createdAt: Date.now() };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // storage unavailable
  }
}

/** Returns the pending product for this chat partner, if any, without clearing it. */
export function peekPendingProductDraft(partnerUserId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as PendingProductDraft;
    if (Date.now() - draft.createdAt > MAX_AGE_MS) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return draft.partnerUserId === partnerUserId ? draft.productId : null;
  } catch {
    return null;
  }
}

export function clearPendingProductDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable
  }
}
