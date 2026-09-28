'use client';

type EmptyConversationProps = {
  onNewMessage?: () => void;
};

/** The resting state of the right panel: one line of type and the action that resolves it. */
export function EmptyConversation({ onNewMessage }: EmptyConversationProps) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center px-6 py-16 text-center" role="status">
      <div className="flex w-full max-w-sm flex-col items-center">
        <span
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--msg-wash)] text-[var(--msg-ink-faint)]"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-5 4V5.5Z" />
          </svg>
        </span>
        <h2 className="mt-6 text-xl font-bold tracking-[-0.01em] text-[var(--msg-ink)]">No conversation selected</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--msg-ink-faint)]">
          Pick a conversation on the left, or start a new one.
        </p>
        {onNewMessage ? (
          <button
            type="button"
            onClick={onNewMessage}
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[var(--msg-ink)] px-5 py-2.5 text-[15px] font-medium text-[var(--msg-panel)] transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--msg-coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--msg-panel)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            New message
          </button>
        ) : null}
      </div>
    </div>
  );
}
