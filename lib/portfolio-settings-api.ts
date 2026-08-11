import api from '@/lib/api';
import {
  isPortfolioSettingsLocalNewer,
  mergePortfolioSettings,
  portfolioSettingsStorageKey,
  stampPortfolioSettingsUpdatedAt,
  type PortfolioSettings,
} from '@/components/portfolio/portfolio-settings-types';
import { prunePortfolioSettingsForPersist } from '@/components/portfolio/portfolio-settings-persist';

/** Keep in sync with backend PortfolioSettingsSupport.MAX_JSON_BYTES. */
export const PORTFOLIO_SETTINGS_MAX_JSON_BYTES = 512_000;

export type PortfolioSettingsPersistStatus = 'idle' | 'saving' | 'saved' | 'error';

export function isPortfolioSettingsEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.keys(value).length === 0;
}

export function readLocalPortfolioSettings(creatorId: string): PortfolioSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(portfolioSettingsStorageKey(creatorId));
    if (!raw) return null;
    return mergePortfolioSettings(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeLocalPortfolioSettings(creatorId: string, settings: PortfolioSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(portfolioSettingsStorageKey(creatorId), JSON.stringify(settings));
  } catch {
    // Quota / private mode — keep in-memory only.
  }
}

function estimateJsonBytes(value: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

/**
 * Prepare settings for PUT: ensure updatedAt, drop values identical to defaults,
 * and fail early on oversized payloads.
 * Does not strip unknown keys — backend is an opaque JSON document.
 */
export function preparePortfolioSettingsForPersist(
  settings: PortfolioSettings
): PortfolioSettings {
  const stamped =
    settings.updatedAt && Number.isFinite(Date.parse(settings.updatedAt))
      ? settings
      : stampPortfolioSettingsUpdatedAt(settings);
  const compact = prunePortfolioSettingsForPersist(stamped);
  const bytes = estimateJsonBytes(compact);
  if (bytes > PORTFOLIO_SETTINGS_MAX_JSON_BYTES) {
    throw new Error(
      `Portfolio settings are too large to save (${Math.round(bytes / 1024)} KB). Remove unused custom themes or large background images.`
    );
  }
  return compact;
}

export async function getCreatorPortfolioSettings(): Promise<Record<string, unknown>> {
  const res = await api.get<Record<string, unknown>>('/api/creator/profile/portfolio-settings');
  return res.data ?? {};
}

export async function updateCreatorPortfolioSettings(
  settings: PortfolioSettings
): Promise<Record<string, unknown>> {
  const payload = preparePortfolioSettingsForPersist(settings);
  const res = await api.put<Record<string, unknown>>(
    '/api/creator/profile/portfolio-settings',
    payload
  );
  return res.data ?? {};
}

function axiosErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Could not save portfolio settings.';
  const record = error as {
    message?: string;
    response?: { data?: { message?: string; error?: string; code?: string } };
  };
  const apiMessage =
    record.response?.data?.message ||
    record.response?.data?.error ||
    (typeof record.message === 'string' ? record.message : null);
  if (apiMessage?.includes('PORTFOLIO_SETTINGS_TOO_LARGE') || apiMessage?.includes('too large')) {
    return 'Portfolio settings are too large to save. Remove unused custom themes or large images.';
  }
  if (apiMessage?.trim()) return apiMessage.trim();
  return 'Could not save portfolio settings. Check your connection and try again.';
}

export async function updateCreatorPortfolioSettingsWithRetry(
  settings: PortfolioSettings,
  attempts = 2
): Promise<Record<string, unknown>> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await updateCreatorPortfolioSettings(settings);
    } catch (error) {
      lastError = error;
      // Don't retry client validation / payload size errors.
      if (error instanceof Error && error.message.includes('too large')) {
        throw error;
      }
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 350 * (i + 1)));
      }
    }
  }
  throw new Error(axiosErrorMessage(lastError));
}

/** Push localStorage settings to backend when the server copy is still empty. */
export async function migrateLocalPortfolioSettingsIfNeeded(
  creatorId: string,
  serverSettings: unknown
): Promise<PortfolioSettings | null> {
  if (!isPortfolioSettingsEmpty(serverSettings)) return null;
  const local = readLocalPortfolioSettings(creatorId);
  if (!local) return null;
  await updateCreatorPortfolioSettings(local);
  return local;
}

/**
 * Owner sync:
 * - Prefer a strictly newer local draft (covers silent PUT failures).
 * - Otherwise prefer server.
 * - Migrate local → server when server is empty.
 */
export async function syncOwnerPortfolioSettings(
  creatorId: string,
  serverSnapshot: unknown
): Promise<PortfolioSettings> {
  const local = readLocalPortfolioSettings(creatorId);

  let serverMerged: PortfolioSettings | null = null;
  if (!isPortfolioSettingsEmpty(serverSnapshot)) {
    serverMerged = mergePortfolioSettings(serverSnapshot);
  } else {
    try {
      const remote = await getCreatorPortfolioSettings();
      if (!isPortfolioSettingsEmpty(remote)) {
        serverMerged = mergePortfolioSettings(remote);
      }
    } catch {
      // fall through
    }
  }

  if (serverMerged && isPortfolioSettingsLocalNewer(local, serverMerged) && local) {
    try {
      await updateCreatorPortfolioSettings(local);
    } catch {
      // Keep local draft; next debounce/retry will push again.
    }
    return local;
  }

  if (serverMerged) {
    return serverMerged;
  }

  const migrated = await migrateLocalPortfolioSettingsIfNeeded(creatorId, serverSnapshot);
  if (migrated) return migrated;

  if (local) return local;

  return mergePortfolioSettings(serverSnapshot);
}
