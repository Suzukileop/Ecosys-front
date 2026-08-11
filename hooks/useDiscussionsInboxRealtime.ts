'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken, onAccessTokenChange } from '@/lib/accessToken';
import { normalizeDirectMessage } from '@/lib/messaging';
import { getSockJsEndpoint } from '@/lib/ws-url';
import type { ConversationReadReceipt, DirectMessage, MessageDeliveryReceipt, TypingIndicator } from '@/types/messaging';

type UseDiscussionsInboxRealtimeOptions = {
  conversationIds: string[];
  currentUserId?: string;
  onMessage: (conversationId: string, message: DirectMessage) => void;
  onTyping: (conversationId: string, indicator: TypingIndicator | null) => void;
  onReadReceipt?: (conversationId: string, receipt: ConversationReadReceipt) => void;
  onDeliveryReceipt?: (conversationId: string, receipt: MessageDeliveryReceipt) => void;
  enabled?: boolean;
};

function parseRealtimeTimestamp(value: string | unknown): string {
  if (typeof value === 'string' && value.trim()) return value;
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value as number[];
    const date = new Date(year, month - 1, day, hour, minute, second);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return new Date().toISOString();
}

function deliveryKey(conversationId: string, messageId: string): string {
  return `${conversationId}:${messageId}`;
}

export function useDiscussionsInboxRealtime({
  conversationIds,
  currentUserId,
  onMessage,
  onTyping,
  onReadReceipt,
  onDeliveryReceipt,
  enabled = true,
}: UseDiscussionsInboxRealtimeOptions) {
  const [connected, setConnected] = useState(false);
  const [reconnectNonce, setReconnectNonce] = useState(0);
  const callbacksRef = useRef({ onMessage, onTyping, onReadReceipt, onDeliveryReceipt });
  const currentUserIdRef = useRef(currentUserId);
  const typingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const stompRef = useRef<Client | null>(null);
  const deliveredAckSentRef = useRef<Set<string>>(new Set());
  const pendingDeliveriesRef = useRef<Array<{ conversationId: string; messageId: string }>>([]);

  useEffect(() => {
    callbacksRef.current = { onMessage, onTyping, onReadReceipt, onDeliveryReceipt };
    currentUserIdRef.current = currentUserId;
  }, [onMessage, onTyping, onReadReceipt, onDeliveryReceipt, currentUserId]);

  useEffect(() => onAccessTokenChange(() => setReconnectNonce((value) => value + 1)), []);

  const publishDelivery = useCallback((conversationId: string, messageId: string) => {
    if (!messageId) return;
    const key = deliveryKey(conversationId, messageId);
    if (deliveredAckSentRef.current.has(key)) return;

    const client = stompRef.current;
    if (!client?.connected) {
      pendingDeliveriesRef.current.push({ conversationId, messageId });
      return;
    }

    deliveredAckSentRef.current.add(key);
    client.publish({
      destination: `/app/conversations/${conversationId}/delivered`,
      body: JSON.stringify({ messageId }),
    });
  }, []);

  const flushPendingDeliveries = useCallback(() => {
    const pending = [...pendingDeliveriesRef.current];
    pendingDeliveriesRef.current = [];
    for (const item of pending) {
      publishDelivery(item.conversationId, item.messageId);
    }
  }, [publishDelivery]);

  useEffect(() => {
    if (!enabled || !currentUserId) {
      setConnected(false);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setConnected(false);
      return;
    }

    const stomp = new Client({
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: { Authorization: `Bearer ${token}` },
      webSocketFactory: () => new SockJS(getSockJsEndpoint()) as unknown as WebSocket,
      onConnect: () => {
        setConnected(true);
        flushPendingDeliveries();

        for (const conversationId of conversationIds) {
          stomp.subscribe(`/topic/conversations/${conversationId}`, (frame: IMessage) => {
            try {
              const raw = JSON.parse(frame.body) as DirectMessage;
              const message = normalizeDirectMessage({
                ...raw,
                sentAt: parseRealtimeTimestamp(raw.sentAt),
              });
              callbacksRef.current.onMessage(conversationId, message);

              const userId = currentUserIdRef.current;
              if (userId && message.senderId !== userId) {
                publishDelivery(conversationId, message.id);
              }
            } catch {
              /* ignore malformed payloads */
            }
          });

          stomp.subscribe(`/topic/conversations/${conversationId}/typing`, (frame: IMessage) => {
            try {
              const indicator = JSON.parse(frame.body) as TypingIndicator;
              if (String(indicator.userId) === currentUserIdRef.current) return;

              const existing = typingTimersRef.current.get(conversationId);
              if (existing) clearTimeout(existing);

              if (indicator.typing) {
                callbacksRef.current.onTyping(conversationId, indicator);
                const timer = setTimeout(() => {
                  callbacksRef.current.onTyping(conversationId, null);
                  typingTimersRef.current.delete(conversationId);
                }, 4000);
                typingTimersRef.current.set(conversationId, timer);
              } else {
                callbacksRef.current.onTyping(conversationId, null);
              }
            } catch {
              /* ignore */
            }
          });

          stomp.subscribe(`/topic/conversations/${conversationId}/read`, (frame: IMessage) => {
            try {
              const raw = JSON.parse(frame.body) as ConversationReadReceipt;
              callbacksRef.current.onReadReceipt?.(conversationId, {
                userId: String(raw.userId),
                readAt: parseRealtimeTimestamp(raw.readAt),
              });
            } catch {
              /* ignore */
            }
          });

          stomp.subscribe(`/topic/conversations/${conversationId}/delivered`, (frame: IMessage) => {
            try {
              const raw = JSON.parse(frame.body) as MessageDeliveryReceipt;
              callbacksRef.current.onDeliveryReceipt?.(conversationId, {
                messageId: String(raw.messageId),
                userId: String(raw.userId),
                deliveredAt: parseRealtimeTimestamp(raw.deliveredAt),
              });
            } catch {
              /* ignore */
            }
          });
        }
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
      onWebSocketError: () => setConnected(false),
    });

    stompRef.current = stomp;
    stomp.activate();

    const typingTimers = typingTimersRef.current;
    return () => {
      typingTimers.forEach((timer) => clearTimeout(timer));
      typingTimers.clear();
      stomp.deactivate();
      stompRef.current = null;
      setConnected(false);
    };
  }, [conversationIds.join('|'), currentUserId, enabled, flushPendingDeliveries, publishDelivery, reconnectNonce]);

  return { connected, publishDelivery };
}
