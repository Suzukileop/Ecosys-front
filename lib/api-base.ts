/**
 * Where API calls go.
 *
 * - NEXT_PUBLIC_API_URL set (local dev on :8080, LAN): that origin.
 * - Unset in the browser: '' — same origin, through the `/api` rewrite in next.config.mjs. The old
 *   fallback was http://localhost:8080, so a production build missing the variable sent every
 *   visitor's requests to their own machine.
 * - Unset on the server (SSR fetches): the backend's internal address.
 */
export const API_BASE: string = (
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  (typeof window === 'undefined' ? process.env.BACKEND_INTERNAL_URL?.trim() || 'http://localhost:8080' : '')
).replace(/\/$/, '');

/** Absolute origin of the API as seen from the browser (for WebSocket URLs). */
export function browserApiOrigin(): string {
  if (API_BASE) {
    try {
      return new URL(API_BASE).origin;
    } catch {
      /* fall through */
    }
  }
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080';
}
