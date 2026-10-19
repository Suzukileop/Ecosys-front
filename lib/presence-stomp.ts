import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import { createStompWebSocket } from '@/lib/ws-url';

/*
 * One STOMP connection for every usePresence() on the page. Each card used to open its own
 * WebSocket (twelve sockets for one page of providers); topics are now multiplexed on a shared
 * client that closes when the last subscriber leaves, and reconnects when the access token changes.
 */
type Handler = (body: string) => void;

let client: Client | null = null;
let clientToken: string | null = null;
let connected = false;
const handlersByTopic = new Map<string, Set<Handler>>();
const subscriptions = new Map<string, StompSubscription>();

function subscribeTopic(topic: string) {
  if (!client || !connected || subscriptions.has(topic)) return;
  subscriptions.set(
    topic,
    client.subscribe(topic, (frame: IMessage) => {
      handlersByTopic.get(topic)?.forEach((handler) => handler(frame.body));
    }),
  );
}

function ensureClient(token: string) {
  if (client && clientToken === token) return;
  if (client) {
    void client.deactivate();
    subscriptions.clear();
    connected = false;
  }
  clientToken = token;
  client = new Client({
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    connectHeaders: { Authorization: `Bearer ${token}` },
    webSocketFactory: () => createStompWebSocket(),
    onConnect: () => {
      connected = true;
      subscriptions.clear();
      handlersByTopic.forEach((_handlers, topic) => subscribeTopic(topic));
    },
    onWebSocketClose: () => {
      connected = false;
      subscriptions.clear();
    },
  });
  client.activate();
}

/** Listen to `topic` on the shared connection; returns the unsubscribe function. */
export function subscribeShared(topic: string, token: string, handler: Handler): () => void {
  ensureClient(token);
  let handlers = handlersByTopic.get(topic);
  if (!handlers) {
    handlers = new Set();
    handlersByTopic.set(topic, handlers);
  }
  handlers.add(handler);
  subscribeTopic(topic);

  return () => {
    const current = handlersByTopic.get(topic);
    current?.delete(handler);
    if (current && current.size === 0) {
      handlersByTopic.delete(topic);
      subscriptions.get(topic)?.unsubscribe();
      subscriptions.delete(topic);
    }
    if (handlersByTopic.size === 0 && client) {
      void client.deactivate();
      client = null;
      clientToken = null;
      connected = false;
      subscriptions.clear();
    }
  };
}
