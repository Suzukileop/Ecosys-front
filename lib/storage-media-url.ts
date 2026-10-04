const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
const STORAGE_PATH_PREFIX = '/api/storage/';

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
  if (process.env.NODE_ENV === 'production') return null;
  if (url.startsWith(STORAGE_PATH_PREFIX)) return url;
  try {
    const parsed = new URL(url);
    if (!BACKEND_ORIGINS.has(parsed.origin) || !parsed.pathname.startsWith(STORAGE_PATH_PREFIX)) return null;
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

/** Rewrites every backend storage URL inside an API payload (dev only; see `toSameOriginStoragePath`). */
export function normalizeStorageUrlsDeep<T>(value: T): T {
  if (process.env.NODE_ENV === 'production') return value;
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

/** URLs médias stockés (local /api/storage ou R2) — chemins absolus pour le navigateur. */
export function resolveStorageMediaUrl(url: string | null | undefined): string {
  const trimmed = url?.trim() ?? '';
  if (!trimmed) return '';
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
