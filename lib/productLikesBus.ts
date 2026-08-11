/**
 * Pub/sub for product like count updates across sibling components
 * (purchase panel ↔ thumbnail strip ↔ characteristics tab).
 */
export type ProductLikesUpdate = {
  productId: string;
  likes: number;
  userLiked?: boolean;
};

type Listener = (update: ProductLikesUpdate) => void;

const listeners = new Set<Listener>();

export function subscribeProductLikesUpdated(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function emitProductLikesUpdated(update: ProductLikesUpdate): void {
  listeners.forEach((fn) => fn(update));
}
