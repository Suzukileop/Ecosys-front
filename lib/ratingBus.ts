/**
 * Minimal pub/sub for rating updates.
 * Allows sibling client components (rating badge ↔ review composer)
 * to communicate without a shared parent or React context.
 */
type Listener = (productId: string) => void;

const listeners = new Set<Listener>();

export function subscribeRatingUpdated(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function emitRatingUpdated(productId: string): void {
  listeners.forEach((fn) => fn(productId));
}
