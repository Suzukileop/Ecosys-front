'use client';

type ContentVisibilityToggleProps = {
  value: boolean;
  onChange: (isPublic: boolean) => void;
  locale?: 'fr' | 'en';
  align?: 'start' | 'end';
  disabled?: boolean;
  variant?: 'default' | 'studio' | 'icon';
  /** Dark circular buttons for image overlays */
  overlay?: boolean;
};

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function ContentVisibilityToggle({
  value,
  onChange,
  locale = 'en',
  align = 'end',
  disabled = false,
  variant = 'default',
  overlay = false,
}: ContentVisibilityToggleProps) {
  const copy =
    locale === 'fr'
      ? { label: 'Visibilité', private: 'Privé', public: 'Public' }
      : { label: 'Visibility', private: 'Private', public: 'Public' };

  if (variant === 'icon') {
    const shellClass = overlay
      ? 'inline-flex flex-row items-center rounded-full border border-white/10 bg-black/45 p-0.5 backdrop-blur-sm'
      : 'inline-flex flex-row items-center rounded-full border border-neutral-200/80 bg-neutral-100/80 p-0.5 dark:border-neutral-700 dark:bg-neutral-800/80';

    const btnBase =
      'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150 disabled:opacity-60';
    const privateActive = overlay
      ? 'bg-white/20 text-white'
      : 'bg-neutral-900 text-white dark:bg-neutral-950';
    const publicActive = 'bg-orange-500 text-white shadow-sm';
    const inactive = overlay
      ? 'text-white/70 hover:bg-white/10 hover:text-white'
      : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400';

    return (
      <div className={shellClass} role="group" aria-label={copy.label}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (value) onChange(false);
          }}
          className={`${btnBase} ${!value ? privateActive : inactive}`}
          aria-label={copy.private}
          aria-pressed={!value}
        >
          <LockIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!value) onChange(true);
          }}
          className={`${btnBase} ${value ? publicActive : inactive}`}
          aria-label={copy.public}
          aria-pressed={value}
        >
          <GlobeIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const studio = variant === 'studio';
  const privateLabel = studio ? copy.private.toUpperCase() : copy.private;
  const publicLabel = studio ? copy.public.toUpperCase() : copy.public;

  return (
    <div className={`flex flex-col gap-1 ${align === 'start' ? 'items-start' : 'items-end'}`}>
      {!studio && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{copy.label}</span>
      )}
      <div
        className={`inline-flex p-0.5 ${
          studio
            ? 'rounded-full border border-neutral-700 bg-neutral-900'
            : 'rounded-lg border border-neutral-200/80 bg-neutral-100/80 dark:border-neutral-700 dark:bg-neutral-800/80'
        }`}
        role="group"
        aria-label={copy.label}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(false)}
          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition ${
            studio ? 'rounded-full' : 'rounded-md py-1.5 text-xs font-semibold normal-case'
          } ${
            !value
              ? studio
                ? 'bg-neutral-800 text-white'
                : 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-white'
              : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'
          }`}
        >
          {privateLabel}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(true)}
          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition ${
            studio ? 'rounded-full' : 'rounded-md py-1.5 text-xs font-semibold normal-case'
          } ${
            value
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'
          }`}
        >
          {publicLabel}
        </button>
      </div>
    </div>
  );
}
