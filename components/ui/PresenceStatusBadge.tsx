'use client';

type PresenceStatusBadgeProps = {
  online: boolean;
  /** Compact for action rows next to Discuss / Follow. */
  className?: string;
};

/**
 * Online / Offline chip for public profile headers.
 * Distinct from marketplace "Open to work" availability.
 */
export function PresenceStatusBadge({ online, className = '' }: PresenceStatusBadgeProps) {
  const label = online ? 'Online' : 'Offline';
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium ${
        online
          ? 'border-emerald-500/35 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300'
          : 'border-neutral-300 bg-transparent text-neutral-500 dark:border-neutral-600 dark:text-neutral-400'
      } ${className}`}
      role="status"
      aria-label={label}
      title={label}
    >
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
          online ? 'bg-emerald-500' : 'bg-neutral-400 dark:bg-neutral-500'
        }`}
        aria-hidden
      />
      {label}
    </span>
  );
}
