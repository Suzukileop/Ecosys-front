/**
 * URL SockJS pour STOMP (ex. `${origin}/ws`).
 * Dérive de NEXT_PUBLIC_API_URL (http/https → même host).
 */
export function getSockJsEndpoint(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:8080';
  try {
    const u = new URL(raw);
    return `${u.origin}/ws`;
  } catch {
    return 'http://localhost:8080/ws';
  }
}
