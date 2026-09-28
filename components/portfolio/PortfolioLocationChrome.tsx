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
  const located = hasCompleteLocation && hasPlace;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 items-start gap-3">
        <FontAwesomeIcon
          icon={faLocationDot}
          className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${located ? 'text-[#FF5722]' : 'text-neutral-400 dark:text-neutral-600'}`}
          fixedWidth
          aria-hidden
        />
        <div className="min-w-0">
          {located ? (
            <>
              <p className="truncate text-base font-normal text-black dark:text-neutral-100">{placeLabel}</p>
              {timezone.trim() ? (
                <p className="mt-1 text-[12.5px] tracking-wide text-neutral-600 dark:text-neutral-400">{timezone.trim()}</p>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-[0.9rem] italic text-neutral-500 dark:text-neutral-400">Location not set</p>
              <p className="mt-1 text-[11px] text-amber-700/90 dark:text-amber-300/80">
                Required to show your location on the public portfolio.
              </p>
            </>
          )}
        </div>
      </div>

      {onDetectLocation ? (
        <button
          type="button"
          onClick={onDetectLocation}
          disabled={detectingLocation}
          title="Updates city, country, and timezone from your device."
          className="inline-flex h-9 shrink-0 items-center gap-2 self-start rounded-lg border border-black/[0.08] px-3.5 text-[0.9rem] font-medium text-neutral-700 transition-colors duration-300 hover:border-[#FF5722] hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.08] dark:text-neutral-300 dark:hover:border-[#FF5722] dark:hover:text-white sm:self-auto"
        >
          {detectingLocation ? (
            <LoadingSpinner size="sm" />
          ) : (
            <FontAwesomeIcon icon={faRotateRight} className="h-3 w-3" fixedWidth aria-hidden />
          )}
          {detectingLocation ? 'Detecting…' : located ? 'Refresh location' : 'Detect location'}
        </button>
      ) : null}
    </div>
  );
}
