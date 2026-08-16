/** Minimal original chat bubbles illustration for empty conversation state. */
export function ChatEmptyIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="80" cy="80" r="72" className="fill-neutral-100 dark:fill-neutral-950" />
      <rect
        x="28"
        y="52"
        width="72"
        height="48"
        rx="14"
        className="fill-white dark:fill-neutral-900"
        stroke="currentColor"
        strokeWidth="2"
        style={{ color: 'var(--msg-border, #e5e5e5)' }}
      />
      <circle cx="48" cy="76" r="3.5" fill="var(--msg-brand, #F47B20)" />
      <circle cx="64" cy="76" r="3.5" fill="var(--msg-brand, #F47B20)" />
      <circle cx="80" cy="76" r="3.5" fill="var(--msg-brand, #F47B20)" />
      <rect
        x="68"
        y="70"
        width="64"
        height="42"
        rx="14"
        className="fill-white dark:fill-neutral-900"
        stroke="currentColor"
        strokeWidth="2"
        style={{ color: 'var(--msg-border, #e5e5e5)' }}
      />
      <path
        d="M100 112 L108 124 L116 112"
        className="fill-white dark:fill-neutral-900"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        style={{ color: 'var(--msg-border, #e5e5e5)' }}
      />
    </svg>
  );
}
