import { create } from 'zustand';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const PROBE_TIMEOUT_MS = 4000;

type ServerStatusState = {
  /** True once a failed request has been confirmed by a probe: the backend cannot be reached at all. */
  unreachable: boolean;
  offline: boolean;
};

export const useServerStatusStore = create<ServerStatusState>(() => ({
  unreachable: false,
  offline: false,
}));

let probeInFlight: Promise<boolean> | null = null;

/**
 * Any HTTP answer — even a 404 or 401 — proves the server is up. `no-cors` keeps a response without
 * CORS headers from being reported as a network failure; only a real connection failure rejects.
 */
function probeServer(): Promise<boolean> {
  if (probeInFlight) return probeInFlight;
  probeInFlight = (async () => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    try {
      await fetch(`${API_BASE}/api/reference/ping?t=${Date.now()}`, {
        method: 'GET',
        mode: 'no-cors',
        credentials: 'omit',
        cache: 'no-store',
        signal: controller.signal,
      });
      return true;
    } catch {
      return false;
    } finally {
      window.clearTimeout(timer);
      probeInFlight = null;
    }
  })();
  return probeInFlight;
}

/** Called for requests that got no HTTP response. A single dropped request never flips the screen on its own. */
export async function reportNetworkFailure(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (useServerStatusStore.getState().unreachable) return;
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  if (offline) {
    useServerStatusStore.setState({ unreachable: true, offline: true });
    return;
  }
  const reachable = await probeServer();
  if (!reachable) useServerStatusStore.setState({ unreachable: true, offline: false });
}

/** Retry entry point for the server-down screen. Resolves true when the app can resume. */
export async function recheckServer(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  if (offline) {
    useServerStatusStore.setState({ unreachable: true, offline: true });
    return false;
  }
  const reachable = await probeServer();
  useServerStatusStore.setState({ unreachable: !reachable, offline: false });
  return reachable;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (useServerStatusStore.getState().unreachable) void recheckServer();
  });
  window.addEventListener('offline', () => {
    useServerStatusStore.setState({ unreachable: true, offline: true });
  });
}
