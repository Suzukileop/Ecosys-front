'use client';

type ContentComposeAudienceControlsProps = {
  isPublic: boolean;
  commentsEnabled: boolean;
  onPublicChange: (isPublic: boolean) => void;
  onCommentsChange: (enabled: boolean) => void;
  disabled?: boolean;
};

export function ContentComposeAudienceControls({
  isPublic,
  commentsEnabled,
  onPublicChange,
  onCommentsChange,
  disabled = false,
}: ContentComposeAudienceControlsProps) {
  const segmentBase =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50';
  const segmentActive = 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-white';
  const segmentIdle = 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200';

  return (
    <div
      className="inline-flex max-w-full flex-wrap items-center gap-0.5 rounded-full bg-neutral-100/90 p-1 dark:bg-neutral-800/70"
      role="group"
      aria-label="Audience"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onPublicChange(false)}
        className={`${segmentBase} ${!isPublic ? segmentActive : segmentIdle}`}
        aria-pressed={!isPublic}
      >
        <LockIcon className="h-3.5 w-3.5" />
        Private
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onPublicChange(true)}
        className={`${segmentBase} ${isPublic ? segmentActive : segmentIdle}`}
        aria-pressed={isPublic}
      >
        <GlobeIcon className="h-3.5 w-3.5" />
        Public
      </button>

      <span className="mx-0.5 hidden h-3.5 w-px shrink-0 bg-neutral-300/80 sm:block dark:bg-neutral-600/80" aria-hidden />

      <button
        type="button"
        disabled={disabled}
        onClick={() => onCommentsChange(!commentsEnabled)}
        className={`${segmentBase} ${commentsEnabled ? segmentActive : segmentIdle}`}
        aria-pressed={commentsEnabled}
        title={commentsEnabled ? 'Comments enabled' : 'Comments disabled'}
      >
        {commentsEnabled ? <ChatOnIcon className="h-3.5 w-3.5" /> : <ChatOffIcon className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{commentsEnabled ? 'Comments' : 'No comments'}</span>
      </button>
    </div>
  );
}

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
