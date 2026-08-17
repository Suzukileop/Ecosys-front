'use client';

import { useEffect, useMemo, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken, onAccessTokenChange } from '@/lib/accessToken';
import { fetchPresenceStatuses, type PresenceStatus } from '@/lib/presence-api';
import { getSockJsEndpoint } from '@/lib/ws-url';

export type PresenceMap = Record<string, PresenceStatus>;

type UsePresenceOptions = {
  /** When false, skip REST bootstrap and STOMP (default true). */
  enabled?: boolean;
  /** Subscribe to live `/topic/presence/{id}` updates (default true). */
  live?: boolean;
  /** Poll REST status while watching (ms). Default 15000. Set 0 to disable. */
  pollIntervalMs?: number;
};

function parseLastSeen(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value;
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value as number[];
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return null;
}

function normalizeStatus(raw: Partial<PresenceStatus> & { userId?: string }): PresenceStatus | null {
  const userId = raw.userId != null ? String(raw.userId) : '';
  if (!userId) return null;
  return {
    userId,
    online: raw.online === true,
    lastSeenAt: parseLastSeen(raw.lastSeenAt),
  };
}

/**
 * Bootstraps presence via REST, polls periodically, and optionally listens on STOMP.
 * Unknown users default to offline (never assumed online).
 */
export function usePresence(userIds: string[], options: UsePresenceOptions = {}) {
  const { enabled = true, live = true, pollIntervalMs = 15_000 } = options;
  const [presenceByUserId, setPresenceByUserId] = useState<PresenceMap>({});
  const [loading, setLoading] = useState(false);
  const [reconnectNonce, setReconnectNonce] = useState(0);

  const idsKey = [...new Set(userIds.map((id) => id.trim()).filter(Boolean))].sort().join(',');
  const stableIds = useMemo(() => (idsKey ? idsKey.split(',') : []), [idsKey]);

  useEffect(() => onAccessTokenChange(() => setReconnectNonce((n) => n + 1)), []);

  useEffect(() => {
    if (!enabled || stableIds.length === 0) {
      setPresenceByUserId({});
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async (showLoading: boolean) => {
      if (showLoading) setLoading(true);
      try {
        const statuses = await fetchPresenceStatuses(stableIds);
        if (cancelled) return;
        const next: PresenceMap = {};
        for (const id of stableIds) {
          next[id] = { userId: id, online: false, lastSeenAt: null };
        }
        for (const status of statuses) {
          const normalized = normalizeStatus(status);
          if (normalized) next[normalized.userId] = normalized;
        }
        setPresenceByUserId(next);
      } catch {
        if (!cancelled && showLoading) {
          const next: PresenceMap = {};
          for (const id of stableIds) {
            next[id] = { userId: id, online: false, lastSeenAt: null };
          }
          setPresenceByUserId(next);
        }
      } finally {
        if (!cancelled && showLoading) setLoading(false);
      }
    };

    void load(true);

    const poll =
      pollIntervalMs > 0
        ? window.setInterval(() => {
            void load(false);
          }, pollIntervalMs)
        : null;

    return () => {
      cancelled = true;
      if (poll != null) window.clearInterval(poll);
    };
  }, [enabled, idsKey, reconnectNonce, stableIds, pollIntervalMs]);

  useEffect(() => {
    if (!enabled || !live || stableIds.length === 0) return;

    const token = getAccessToken();
    if (!token) return;

    const stomp = new Client({
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: { Authorization: `Bearer ${token}` },
      webSocketFactory: () => new SockJS(getSockJsEndpoint()) as unknown as WebSocket,
      onConnect: () => {
        for (const userId of stableIds) {
          stomp.subscribe(`/topic/presence/${userId}`, (frame: IMessage) => {
            try {
              const raw = JSON.parse(frame.body) as Partial<PresenceStatus>;
              const normalized = normalizeStatus(raw);
              if (!normalized) return;
              setPresenceByUserId((prev) => ({
                ...prev,
                [normalized.userId]: normalized,
              }));
            } catch {
              /* ignore malformed */
            }
          });
        }
      },
    });

    stomp.activate();
    return () => {
      void stomp.deactivate();
    };
  }, [enabled, live, idsKey, reconnectNonce, stableIds]);

  const isOnline = (userId: string | undefined | null): boolean => {
    if (!userId) return false;
    return presenceByUserId[userId]?.online === true;
  };

  return { presenceByUserId, loading, isOnline };
}
