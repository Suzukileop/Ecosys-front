import { nationalityLabel } from '@/lib/countries';

export type DetectedLocation = {
  lat: number;
  lng: number;
  timezoneId: string;
  city: string;
  country: string;
};

function geolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Location access was denied. Please allow location in your browser settings.';
    case 2:
      return 'Location is unavailable. Check your device settings and try again.';
    case 3:
      return 'Location request timed out. Please try again.';
    default:
      return 'Unable to detect your location.';
  }
}

/** Requires browser geolocation permission — used for mandatory creator location setup. */
export async function detectUserLocation(): Promise<DetectedLocation> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser.');
  }

  const timezoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 20_000,
      maximumAge: 0,
    });
  });

  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  let city = '';
  let country = '';
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (res.ok) {
      const data = (await res.json()) as {
        address?: Record<string, string>;
      };
      const addr = data.address ?? {};
      city = addr.city || addr.town || addr.village || addr.municipality || '';
      country = addr.country || '';
    }
  } catch {
    // Coordinates and timezone are still valid without reverse geocoding.
  }

  return { lat, lng, timezoneId, city, country };
}

/** Viewer coordinates for catalog sort / coarse uses. */
export type ViewerCoordinates = {
  lat: number;
  lng: number;
  /** Horizontal accuracy in meters when the browser reports it. */
  accuracyM: number | null;
};

function getCurrentPosition(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

function toViewerCoordinates(position: GeolocationPosition): ViewerCoordinates {
  const accuracy = position.coords.accuracy;
  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracyM: Number.isFinite(accuracy) ? accuracy : null,
  };
}

function isFiniteCoords(coords: { lat: number; lng: number }): boolean {
  return Number.isFinite(coords.lat) && Number.isFinite(coords.lng);
}

/**
 * Fast coarse coordinates for marketplace "closest first" sorting.
 * Not suitable for profile distance badges (often network/IP, tens/hundreds of km off).
 */
export async function detectUserCoordinates(): Promise<ViewerCoordinates> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser.');
  }

  const position = await getCurrentPosition({
    enableHighAccuracy: false,
    timeout: 12_000,
    maximumAge: 5 * 60_000,
  }).catch((err) => {
    if (err instanceof GeolocationPositionError) {
      throw new Error(geolocationErrorMessage(err.code));
    }
    throw err instanceof Error ? err : new Error('Unable to detect your location.');
  });

  const coords = toViewerCoordinates(position);
  if (!isFiniteCoords(coords)) {
    throw new Error('Unable to detect your location.');
  }
  return coords;
}

/**
 * Max accepted GPS accuracy (meters) before we publish a distance label.
 * Coarse IP/Wi-Fi fixes often report 2–50 km and produce "Less than 1 km" by chance.
 */
export const DISTANCE_MAX_ACCURACY_M = 500;

export function isReliableDistanceFix(coords: ViewerCoordinates): boolean {
  if (!isFiniteCoords(coords)) return false;
  if (coords.accuracyM == null || !Number.isFinite(coords.accuracyM) || coords.accuracyM <= 0) {
    return false;
  }
  return coords.accuracyM <= DISTANCE_MAX_ACCURACY_M;
}

/**
 * Haversine km only when GPS error cannot flip the displayed bucket.
 * Returns null instead of a guessed "Less than 1 km".
 */
export function computeReliableDistanceKm(
  viewer: ViewerCoordinates,
  place: { lat: number; lng: number }
): number | null {
  if (!isReliableDistanceFix(viewer) || !isFiniteCoords(place)) return null;
  const km = haversineKm(viewer.lat, viewer.lng, place.lat, place.lng);
  if (!Number.isFinite(km) || km < 0) return null;
  const accuracyKm = (viewer.accuracyM as number) / 1000;
  if (km < 1 && accuracyKm > 0.35) return null;
  if (km >= 1 && accuracyKm > km) return null;
  return km;
}

/**
 * Resolve a GPS fix accurate enough for a public distance badge.
 * Watches until accuracy is good; never falls back to IP/network guesses.
 * {@code onUpdate} is only called with reliable fixes.
 */
export async function detectUserCoordinatesForDistance(
  onUpdate?: (coords: ViewerCoordinates) => void,
  options?: { timeoutMs?: number; maxAccuracyM?: number; signal?: AbortSignal }
): Promise<ViewerCoordinates> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser.');
  }

  const timeoutMs = options?.timeoutMs ?? 18_000;
  const maxAccuracyM = options?.maxAccuracyM ?? DISTANCE_MAX_ACCURACY_M;

  const goodEnough = (coords: ViewerCoordinates) =>
    isFiniteCoords(coords) &&
    coords.accuracyM != null &&
    Number.isFinite(coords.accuracyM) &&
    coords.accuracyM > 0 &&
    coords.accuracyM <= maxAccuracyM;

  return await new Promise<ViewerCoordinates>((resolve, reject) => {
    let best: ViewerCoordinates | null = null;
    let settled = false;
    let watchId: number | null = null;

    const finish = (coords: ViewerCoordinates | null, error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      options?.signal?.removeEventListener('abort', onAbort);
      if (coords && goodEnough(coords)) {
        onUpdate?.(coords);
        resolve(coords);
        return;
      }
      reject(error ?? new Error('Location accuracy is too low to show distance.'));
    };

    const onAbort = () => {
      finish(null, new Error('Distance measurement cancelled.'));
    };
    if (options?.signal?.aborted) {
      onAbort();
      return;
    }
    options?.signal?.addEventListener('abort', onAbort, { once: true });

    const consider = (position: GeolocationPosition) => {
      const next = toViewerCoordinates(position);
      if (!isFiniteCoords(next)) return;
      const better =
        !best ||
        (next.accuracyM != null &&
          (best.accuracyM == null || next.accuracyM < best.accuracyM));
      if (better) best = next;
      if (goodEnough(next)) {
        finish(next);
      }
    };

    const timer = window.setTimeout(() => {
      finish(
        best && goodEnough(best) ? best : null,
        new Error('Location accuracy is too low to show distance.')
      );
    }, timeoutMs);

    watchId = navigator.geolocation.watchPosition(
      consider,
      (err) => {
        if (err.code === 1) {
          finish(null, new Error(geolocationErrorMessage(err.code)));
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: timeoutMs,
      }
    );
  });
}

export function formatLocationLabel(
  city: string | null | undefined,
  country: string | null | undefined,
  nationality?: string | null
): string {
  const place = formatPlaceLabel(city, country, nationality);
  return place ?? 'Location not set';
}

/** City + country/nation for public UI. Returns null when nothing useful is set. */
export function formatPlaceLabel(
  city: string | null | undefined,
  country: string | null | undefined,
  nationality?: string | null
): string | null {
  const cityPart = typeof city === 'string' ? city.trim() : '';
  const countryPart = typeof country === 'string' ? country.trim() : '';
  const nationFromNationality = nationalityLabel(nationality) || (typeof nationality === 'string' ? nationality.trim() : '');
  const nationPart = countryPart || nationFromNationality;

  const parts: string[] = [];
  if (cityPart) parts.push(cityPart);
  if (nationPart && nationPart.toLowerCase() !== cityPart.toLowerCase()) parts.push(nationPart);
  return parts.length > 0 ? parts.join(', ') : null;
}


export async function requestDetectedLocation(): Promise<DetectedLocation> {
  try {
    return await detectUserLocation();
  } catch (err) {
    if (err instanceof GeolocationPositionError) {
      throw new Error(geolocationErrorMessage(err.code));
    }
    throw err instanceof Error ? err : new Error('Unable to detect your location.');
  }
}

export type GeocodedPlace = {
  lat: number;
  lng: number;
  displayName: string;
};

/** Forward-geocode a city/zone label for static map previews (city-level only). */
const geocodeCache = new Map<string, GeocodedPlace | null>();
const geocodeInflight = new Map<string, Promise<GeocodedPlace | null>>();

export async function geocodePlaceLabel(query: string): Promise<GeocodedPlace | null> {
  const q = query.trim();
  if (!q) return null;
  const cacheKey = q.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) ?? null;
  }
  const pending = geocodeInflight.get(cacheKey);
  if (pending) return pending;

  const request = (async (): Promise<GeocodedPlace | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!res.ok) return null;
      const data = (await res.json()) as Array<{
        lat?: string;
        lon?: string;
        display_name?: string;
      }>;
      const hit = data[0];
      const lat = hit?.lat != null ? Number(hit.lat) : NaN;
      const lng = hit?.lon != null ? Number(hit.lon) : NaN;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return {
        lat,
        lng,
        displayName: hit.display_name?.trim() || q,
      };
    } catch {
      return null;
    }
  })().then((result) => {
    geocodeCache.set(cacheKey, result);
    geocodeInflight.delete(cacheKey);
    return result;
  });

  geocodeInflight.set(cacheKey, request);
  return request;
}

/** OpenStreetMap embed URL centered on coordinates (city zoom). */
export function openStreetMapEmbedUrl(lat: number, lng: number, delta = 0.12): string {
  const west = lng - delta;
  const south = lat - delta * 0.65;
  const east = lng + delta;
  const north = lat + delta * 0.65;
  const bbox = [west, south, east, north].join('%2C');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

/** Great-circle distance in km (Haversine). */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadiusKm * c * 10) / 10;
}
