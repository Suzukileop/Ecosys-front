import api from '@/lib/api';
import { UserFacingError } from '@/lib/api-error';
import { detectUserCoordinates, formatPlaceLabel, type ViewerCoordinates } from '@/lib/geolocation';

/**
 * Where the viewer is, for "closest first" and distance badges — without ever leaving the page on a
 * red error. Browser geolocation fails a lot on desktops (no GPS, Windows location service off, no
 * Wi-Fi to triangulate from: Chrome then waits and reports a timeout), so the chain is:
 *   1. the last device fix, kept 30 minutes (no prompt, no wait);
 *   2. a fresh device fix;
 *   3. the location saved on the viewer's own creator profile (captured with GPS at setup).
 * Only when all three are missing does it throw.
 */

export type ViewerLocation = ViewerCoordinates & {
  source: 'device' | 'profile';
  /** "City, Country" of a profile-sourced location, to tell the viewer what the sort is based on. */
  placeLabel: string | null;
};

const CACHE_KEY = 'np_viewer_fix_v2';
const CACHE_TTL_MS = 30 * 60_000;

function readCachedFix(): ViewerCoordinates | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ViewerCoordinates & { at?: number };
    if (!data.at || Date.now() - data.at > CACHE_TTL_MS) return null;
    if (!Number.isFinite(data.lat) || !Number.isFinite(data.lng)) return null;
    return { lat: data.lat, lng: data.lng, accuracyM: data.accuracyM ?? null };
  } catch {
    return null;
  }
}

function writeCachedFix(coords: ViewerCoordinates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...coords, at: Date.now() }));
  } catch {
    // private mode / storage full — the fix simply isn't reused
  }
}

let profileLocationRequest: Promise<ViewerLocation | null> | null = null;

/** The signed-in creator's saved location (one request per page load). */
export function savedProfileLocation(): Promise<ViewerLocation | null> {
  profileLocationRequest ??= api
    .get<Record<string, unknown>>('/api/creator/profile')
    .then((res) => {
      const lat = Number(res.data?.locationLat);
      const lng = Number(res.data?.locationLng);
      if (res.data?.locationLat == null || res.data?.locationLng == null) return null;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return {
        lat,
        lng,
        /* Never published as a distance: the backend only prints km for a measured fix. */
        accuracyM: null,
        source: 'profile' as const,
        placeLabel: formatPlaceLabel(
          res.data?.locationCity as string | null | undefined,
          res.data?.locationCountry as string | null | undefined
        ),
      };
    })
    .catch(() => {
      profileLocationRequest = null;
      return null;
    });
  return profileLocationRequest;
}

/** True when the browser will answer without showing a permission prompt. */
export async function geolocationAlreadyGranted(): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.permissions) return false;
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state === 'granted';
  } catch {
    return false;
  }
}

export async function resolveViewerLocation(options: {
  /** Signed-in creator: their profile location can stand in for the device. */
  profileFallback: boolean;
}): Promise<ViewerLocation> {
  const cached = readCachedFix();
  if (cached) return { ...cached, source: 'device', placeLabel: null };

  try {
    const fix = await detectUserCoordinates();
    writeCachedFix(fix);
    return { ...fix, source: 'device', placeLabel: null };
  } catch (deviceError) {
    if (options.profileFallback) {
      const saved = await savedProfileLocation();
      if (saved) return saved;
    }
    throw deviceError instanceof UserFacingError
      ? deviceError
      : new UserFacingError('Unable to detect your location.');
  }
}
