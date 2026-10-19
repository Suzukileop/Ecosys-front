import api from '@/lib/api';

export type PresenceStatus = {
  userId: string;
  online: boolean;
  lastSeenAt: string | null;
};

/**
 * Batch-fetch online/offline status for up to 50 user ids.
 */
export async function fetchPresenceStatuses(ids: string[]): Promise<PresenceStatus[]> {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) return [];

  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += 50) {
    chunks.push(unique.slice(i, i + 50));
  }

  const results: PresenceStatus[] = [];
  for (const chunk of chunks) {
    const res = await api.get<PresenceStatus[]>('/api/presence/status', {
      params: { ids: chunk.join(',') },
    });
    results.push(...(res.data ?? []));
  }
  return results;
}

/** Mark the current user online while the dashboard is open. */
export async function sendPresenceHeartbeat(): Promise<PresenceStatus | null> {
  const res = await api.post<PresenceStatus>('/api/presence/heartbeat', {});
  return res.data ?? null;
}

/** Mark the current user offline (logout). */
export async function sendPresenceOffline(): Promise<PresenceStatus | null> {
  const res = await api.post<PresenceStatus>('/api/presence/offline', {});
  return res.data ?? null;
}

/*
 * Coalesced status lookups. Every provider card / row mounts its own usePresence([id]); a page of
 * twelve cards used to send twelve requests (and twelve more every poll). Calls made within the same
 * short window are merged into one request and each caller gets back the statuses it asked for.
 */
const BATCH_WINDOW_MS = 25;
let pendingIds = new Set<string>();
let pendingWaiters: Array<{
  ids: string[];
  resolve: (statuses: PresenceStatus[]) => void;
  reject: (error: unknown) => void;
}> = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;

function flushPresenceBatch() {
  const ids = [...pendingIds];
  const waiters = pendingWaiters;
  pendingIds = new Set();
  pendingWaiters = [];
  batchTimer = null;
  fetchPresenceStatuses(ids).then(
    (statuses) => {
      const byId = new Map(statuses.map((status) => [String(status.userId), status]));
      for (const waiter of waiters) {
        waiter.resolve(
          waiter.ids.map((id) => byId.get(id)).filter((status): status is PresenceStatus => Boolean(status)),
        );
      }
    },
    (error) => {
      for (const waiter of waiters) waiter.reject(error);
    },
  );
}

export function fetchPresenceStatusesBatched(ids: string[]): Promise<PresenceStatus[]> {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) return Promise.resolve([]);
  return new Promise((resolve, reject) => {
    unique.forEach((id) => pendingIds.add(id));
    pendingWaiters.push({ ids: unique, resolve, reject });
    if (batchTimer == null) batchTimer = setTimeout(flushPresenceBatch, BATCH_WINDOW_MS);
  });
}
