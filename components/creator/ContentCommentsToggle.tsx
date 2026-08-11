'use client';

type ContentCommentsToggleProps = {
  value: boolean;
  onChange: (enabled: boolean) => void;
  locale?: 'fr' | 'en';
  disabled?: boolean;
  overlay?: boolean;
};

function ChatOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  );
}

function ChatOnIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

export function ContentCommentsToggle({
  value,
  onChange,
  locale = 'fr',
  disabled = false,
  overlay = false,
}: ContentCommentsToggleProps) {
  const label = locale === 'fr' ? 'Commentaires' : 'Comments';
  const enabledLabel = locale === 'fr' ? 'Activés' : 'On';
  const disabledLabel = locale === 'fr' ? 'Désactivés' : 'Off';

  const shellClass = overlay
    ? 'inline-flex flex-row items-center rounded-full border border-white/10 bg-black/45 p-0.5 backdrop-blur-sm'
    : 'inline-flex flex-row items-center rounded-full border border-neutral-200/80 bg-neutral-100/80 p-0.5 dark:border-neutral-700 dark:bg-neutral-800/80';

  const btnBase =
    'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150 disabled:opacity-60';
  const activeOn = 'bg-orange-500 text-white shadow-sm';
  const activeOff = overlay
    ? 'bg-white/20 text-white'
    : 'bg-neutral-900 text-white dark:bg-neutral-950';
  const inactive = overlay
    ? 'text-white/70 hover:bg-white/10 hover:text-white'
    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400';

  return (
    <div className={shellClass} role="group" aria-label={label}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (value) onChange(false);
        }}
        className={`${btnBase} ${!value ? activeOff : inactive}`}
        aria-label={disabledLabel}
        aria-pressed={!value}
        title={disabledLabel}
      >
        <ChatOffIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!value) onChange(true);
        }}
        className={`${btnBase} ${value ? activeOn : inactive}`}
        aria-label={enabledLabel}
        aria-pressed={value}
        title={enabledLabel}
      >
        <ChatOnIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
