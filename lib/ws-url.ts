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

/**
 * Native WebSocket to the SockJS endpoint's raw transport (`/ws/websocket`).
 * Avoids the sockjs-client runtime, which registers a deprecated `unload` listener.
 */
export function createStompWebSocket(): WebSocket {
  const url = new URL(`${getSockJsEndpoint()}/websocket`);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return new WebSocket(url.toString());
}
