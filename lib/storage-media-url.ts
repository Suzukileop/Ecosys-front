const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
const STORAGE_PATH_PREFIX = '/api/storage/';
// Exact configured aliases only, never all Cloudflare tunnels or all external /api/storage URLs.
const LEGACY_STORAGE_ORIGINS = new Set(
  (process.env.NEXT_PUBLIC_STORAGE_LEGACY_ORIGINS || '').split(',')
    .map((value) => originOf(value.trim())).filter((value): value is string => Boolean(value))
);
const CANONICAL_DEV_STORAGE_ORIGIN = 'http://localhost:8080';

function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

const BACKEND_ORIGINS = new Set(
  [originOf(API_BASE), 'http://localhost:8080'].filter((origin): origin is string => Boolean(origin))
);

/**
 * Dev: backend-hosted files are served same-origin through the Next `/api` rewrite, so `/_next/image`
 * fetches them locally instead of looping out through a tunnel (and times out on large originals).
 */
function toSameOriginStoragePath(url: string): string | null {
  if (url.startsWith(STORAGE_PATH_PREFIX)) return process.env.NODE_ENV === 'production' ? null : url;
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.startsWith(STORAGE_PATH_PREFIX)) return null;
    const legacy = LEGACY_STORAGE_ORIGINS.has(parsed.origin);
    if (!legacy && (process.env.NODE_ENV === 'production' || !BACKEND_ORIGINS.has(parsed.origin))) return null;
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

/** Normalize known storage origins; historical aliases are explicit in every environment. */
export function normalizeStorageUrlsDeep<T>(value: T): T {
  return normalizeValue(value) as T;
}

function normalizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    if (!value.includes(STORAGE_PATH_PREFIX) || !/^https?:\/\//i.test(value)) return value;
    return toSameOriginStoragePath(value) ?? value;
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const normalized = normalizeValue(item);
      if (normalized !== item) changed = true;
      return normalized;
    });
    return changed ? next : value;
  }
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    let changed = false;
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const normalized = normalizeValue(item);
      if (normalized !== item) changed = true;
      next[key] = normalized;
    }
    return changed ? next : value;
  }
  return value;
}

/**
 * Inverse of `normalizeStorageUrlsDeep`, applied to request bodies: the backend only accepts
 * absolute http(s) media URLs, so a same-origin `/api/storage/…` path read from an API payload must go
 * back out as an absolute URL, otherwise saving a profile fails with "Media URL must use http or https".
 */
export function restoreStorageUrlsDeep<T>(value: T): T {
  return restoreValue(value) as T;
}

function restoreValue(value: unknown): unknown {
  if (typeof value === 'string') {
    const storageOrigin = process.env.NODE_ENV === 'production' ? API_BASE : CANONICAL_DEV_STORAGE_ORIGIN;
    return value.startsWith(STORAGE_PATH_PREFIX) ? `${storageOrigin}${value}` : value;
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const restored = restoreValue(item);
      if (restored !== item) changed = true;
      return restored;
    });
    return changed ? next : value;
  }
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    let changed = false;
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const restored = restoreValue(item);
      if (restored !== item) changed = true;
      next[key] = restored;
    }
    return changed ? next : value;
  }
  return value;
}

/** URLs médias stockés (local /api/storage ou R2) — chemins absolus pour le navigateur. */
export function resolveStorageMediaUrl(url: string | null | undefined): string {
  const trimmed = url?.trim() ?? '';
  if (!trimmed) return '';
  // Bundled portfolio demo assets belong to the Next public folder, not API storage.
  if (/^\/(?:images\/portfolio\/|landing\/)/.test(trimmed)) return trimmed;
  const sameOrigin = toSameOriginStoragePath(trimmed);
  if (sameOrigin) return sameOrigin;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return trimmed.startsWith('/') ? `${API_BASE}${trimmed}` : `${API_BASE}/${trimmed}`;
}

/** Nom de fichier suggéré à partir de l’URL ou du titre. */
export function suggestMediaFilename(url: string, title: string, fallbackExt = '.bin'): string {
  try {
    const segment = new URL(url).pathname.split('/').pop();
    if (segment && segment.includes('.')) {
      return decodeURIComponent(segment);
    }
  } catch {
    /* ignore */
  }
  const safe = title.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_').slice(0, 80) || 'content';
  return `${safe}${fallbackExt.startsWith('.') ? fallbackExt : `.${fallbackExt}`}`;
}

/** Télécharge un média (blob si possible, sinon lien direct). */
export async function downloadStorageMedia(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}
