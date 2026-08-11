'use client';

type CreatorAvailabilityControlProps = {
  isAvailable: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  compact?: boolean;
};

export function CreatorAvailabilityBadge({ isAvailable }: { isAvailable: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isAvailable
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30'
          : 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-neutral-400 dark:bg-neutral-500'}`}
        aria-hidden
      />
      {isAvailable ? 'Available' : 'Unavailable'}
    </span>
  );
}

export function CreatorAvailabilityControl({
  isAvailable,
  onChange,
  disabled = false,
  compact = false,
}: CreatorAvailabilityControlProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900 ${
        compact ? 'py-2.5' : ''
      }`}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutral-900 dark:text-white">Availability status</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Let clients know if you are open to new work right now.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <CreatorAvailabilityBadge isAvailable={isAvailable} />
        <button
          type="button"
          role="switch"
          aria-checked={isAvailable}
          aria-label={isAvailable ? 'Mark as unavailable' : 'Mark as available'}
          disabled={disabled}
          onClick={() => onChange(!isAvailable)}
          className={`relative h-7 w-12 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isAvailable ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-600'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              isAvailable ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
