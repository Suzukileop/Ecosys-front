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
