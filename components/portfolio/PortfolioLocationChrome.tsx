'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatLocationLabel } from '@/lib/geolocation';

export type PortfolioLocationFieldKey = 'city' | 'country' | 'timezone';

export type PortfolioLocationFieldValue = {
  city: string;
  country: string;
  timezone: string;
};

export function PortfolioLocationReadOnly({
  city,
  country,
  timezone,
  hasCompleteLocation,
  detectingLocation = false,
  onDetectLocation,
}: {
  city: string;
  country: string;
  timezone: string;
  hasCompleteLocation: boolean;
  detectingLocation?: boolean;
  onDetectLocation?: () => void;
}) {
  const placeLabel = formatLocationLabel(city, country);
  const hasPlace = Boolean(city.trim() || country.trim());

  return (
    <div className="space-y-5">
      <div className="rounded-[1.35rem] bg-neutral-50 px-5 py-5 dark:bg-neutral-900/50 sm:px-6 sm:py-6">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#EA580C] shadow-sm dark:bg-neutral-800 dark:text-[#FB923C]">
            <FontAwesomeIcon icon={faLocationDot} className="h-5 w-5" fixedWidth />
          </span>
          <div className="min-w-0 flex-1">
            {hasCompleteLocation && hasPlace ? (
              <>
                <p className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
                  {placeLabel}
                </p>
                {timezone.trim() ? (
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Timezone · {timezone.trim()}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-neutral-900 dark:text-white">
                  Location not set
                </p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Detect your position from this device to fill city, country, and timezone.
                </p>
              </>
            )}
          </div>
        </div>

        {onDetectLocation ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onDetectLocation}
              disabled={detectingLocation}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#EA580C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#C2410C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {detectingLocation ? (
                <LoadingSpinner size="sm" />
              ) : (
                <FontAwesomeIcon icon={faRotateRight} className="h-3.5 w-3.5" fixedWidth />
              )}
              {detectingLocation
                ? 'Detecting…'
                : hasCompleteLocation
                  ? 'Refresh location'
                  : 'Detect location'}
            </button>
            {hasCompleteLocation ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Updates city, country, and timezone from your device.
              </p>
            ) : (
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Required to show your location on the public portfolio.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
