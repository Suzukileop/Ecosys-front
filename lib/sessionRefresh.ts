import axios from 'axios';
import { AuthResponse } from '@/types/auth';
import { setAccessToken } from './accessToken';
import { setRefreshCookie } from './refreshCookie';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/** How long a successful refresh result is considered fresh. */
const CACHE_TTL_MS = 30_000;

const SHARED_CACHE_KEY = 'np_auth_session_cache';
const REFRESH_LOCK_KEY = 'np_auth_refresh_lock';
const BROADCAST_CHANNEL = 'np-auth-sync';
const LOCK_TTL_MS = 12_000;
const WAIT_FOR_PEER_MS = 10_000;

let inflightRefresh: Promise<AuthResponse> | null = null;
let cachedAt = 0;
let cachedResult: AuthResponse | null = null;
let broadcastChannel: BroadcastChannel | null = null;

type SharedSessionCache = {
  cachedAt: number;
  authResponse: AuthResponse;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readSharedCache(): SharedSessionCache | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(SHARED_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SharedSessionCache;
    if (!parsed?.authResponse?.accessToken || !parsed.cachedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSharedCache(authResponse: AuthResponse): void {
  if (!isBrowser()) return;
  const payload: SharedSessionCache = { cachedAt: Date.now(), authResponse };
  localStorage.setItem(SHARED_CACHE_KEY, JSON.stringify(payload));
}

export function clearSharedSessionCache(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(SHARED_CACHE_KEY);
  localStorage.removeItem(REFRESH_LOCK_KEY);
}

function applyCachedSession(cache: SharedSessionCache): AuthResponse {
  cachedResult = cache.authResponse;
  cachedAt = cache.cachedAt;
  setAccessToken(cache.authResponse.accessToken);
  return cache.authResponse;
}

function tryAcquireRefreshLock(): boolean {
  if (!isBrowser()) return true;
  const now = Date.now();
  try {
    const raw = localStorage.getItem(REFRESH_LOCK_KEY);
    if (raw) {
      const lock = JSON.parse(raw) as { at: number };
      if (now - lock.at < LOCK_TTL_MS) return false;
    }
    localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify({ at: now }));
    return true;
  } catch {
    return true;
  }
}

function releaseRefreshLock(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(REFRESH_LOCK_KEY);
  } catch {
    /* ignore */
  }
}

function ensureBroadcastChannel(): BroadcastChannel | null {
  if (!isBrowser() || typeof BroadcastChannel === 'undefined') return null;
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL);
    broadcastChannel.onmessage = (event: MessageEvent<{ type?: string; cache?: SharedSessionCache }>) => {
      if (event.data?.type !== 'session_refreshed' || !event.data.cache) return;
      applyCachedSession(event.data.cache);
    };
  }
  return broadcastChannel;
}

function broadcastSessionRefreshed(cache: SharedSessionCache): void {
  ensureBroadcastChannel()?.postMessage({ type: 'session_refreshed', cache });
}

function waitForPeerRefresh(): Promise<AuthResponse | null> {
  if (!isBrowser()) return Promise.resolve(null);

  return new Promise((resolve) => {
    const startedAt = Date.now();

    const tryResolveFromCache = (): AuthResponse | null => {
      const shared = readSharedCache();
      if (shared && Date.now() - shared.cachedAt < CACHE_TTL_MS) {
        return applyCachedSession(shared);
      }
      return null;
    };

    const existing = tryResolveFromCache();
    if (existing) {
      resolve(existing);
      return;
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== SHARED_CACHE_KEY) return;
      const resolved = tryResolveFromCache();
      if (resolved) {
        cleanup();
        resolve(resolved);
      }
    };

    const channel = ensureBroadcastChannel();
    const onMessage = (event: MessageEvent<{ type?: string; cache?: SharedSessionCache }>) => {
      if (event.data?.type !== 'session_refreshed' || !event.data.cache) return;
      const resolved = applyCachedSession(event.data.cache);
      cleanup();
      resolve(resolved);
    };

    const timer = window.setInterval(() => {
      const resolved = tryResolveFromCache();
      if (resolved) {
        cleanup();
        resolve(resolved);
        return;
      }
      if (Date.now() - startedAt >= WAIT_FOR_PEER_MS) {
        cleanup();
        resolve(null);
      }
    }, 150);

    const cleanup = () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', onStorage);
      channel?.removeEventListener('message', onMessage);
    };

    window.addEventListener('storage', onStorage);
    channel?.addEventListener('message', onMessage);
  });
}

/**
 * Single shared refresh — AuthContext, axios interceptor, and auth helpers
 * must all use this so token rotation never creates parallel revocation.
 *
 * Protection layers:
 *  1. in-tab inflightRefresh deduplicates concurrent calls.
 *  2. in-tab cachedResult avoids immediate re-refresh after success.
 *  3. localStorage shared cache + BroadcastChannel syncs across browser tabs.
 *  4. cross-tab lock ensures only one tab hits /api/auth/refresh at a time.
 */
export async function refreshSession(): Promise<AuthResponse> {
  if (cachedResult && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedResult;
  }

  const shared = readSharedCache();
  if (shared && Date.now() - shared.cachedAt < CACHE_TTL_MS) {
    return applyCachedSession(shared);
  }

  if (inflightRefresh) {
    return inflightRefresh;
  }

  const hasLock = tryAcquireRefreshLock();
  if (!hasLock) {
    const peerResult = await waitForPeerRefresh();
    if (peerResult) return peerResult;
  }

  inflightRefresh = axios
    .post<AuthResponse>(`${API_BASE}/api/auth/refresh`, {}, { withCredentials: true })
    .then(async (response) => {
      const data = response.data;
      cachedResult = data;
      cachedAt = Date.now();
      setAccessToken(data.accessToken);

      const sharedCache: SharedSessionCache = { cachedAt: cachedAt, authResponse: data };
      writeSharedCache(data);
      broadcastSessionRefreshed(sharedCache);

      if (data.refreshToken && typeof window !== 'undefined') {
        await setRefreshCookie(data.refreshToken);
      }
      return data;
    })
    .catch((err) => {
      const status = axios.isAxiosError(err) ? err.response?.status : null;
      if (status !== 429) {
        cachedResult = null;
        cachedAt = 0;
        clearSharedSessionCache();
      }
      throw err;
    })
    .finally(() => {
      releaseRefreshLock();
      inflightRefresh = null;
    });

  return inflightRefresh;
}

/** Convenience: resolve only the access token string. */
export async function refreshAccessToken(): Promise<string> {
  const data = await refreshSession();
  return data.accessToken;
}

/** Force-invalidate the cache (e.g. after explicit logout). */
export function invalidateSessionCache(): void {
  cachedResult = null;
  cachedAt = 0;
  inflightRefresh = null;
  clearSharedSessionCache();
}
