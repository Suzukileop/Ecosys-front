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

export function formatLocationLabel(city: string | null | undefined, country: string | null | undefined): string {
  const parts = [city, country].filter((p) => p && p.trim().length > 0);
  return parts.length > 0 ? parts.join(', ') : 'Location not set';
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
