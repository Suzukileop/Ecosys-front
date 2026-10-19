import { browserApiOrigin } from './api-base';

/**
 * URL SockJS pour STOMP (ex. `${origin}/ws`).
 * Dérive de NEXT_PUBLIC_API_URL (http/https → même host).
 */
function getSockJsEndpoint(): string {
  return `${browserApiOrigin()}/ws`;
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
