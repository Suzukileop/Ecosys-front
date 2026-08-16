'use client';

import { ChatEmptyIllustration } from '@/components/messaging/ChatEmptyIllustration';

type EmptyConversationProps = {
  onNewMessage?: () => void;
};

export function EmptyConversation({ onNewMessage }: EmptyConversationProps) {
  return (
    <div
      className="flex h-full min-h-0 flex-col items-center justify-center bg-white px-6 py-12 text-center dark:bg-neutral-900"
      role="status"
    >
      <div className="flex max-w-sm flex-col items-center">
        <ChatEmptyIllustration className="h-36 w-36 sm:h-40 sm:w-40" />
        <h2 className="mt-6 text-base font-semibold text-[var(--msg-text)]">
          Select a conversation
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--msg-muted)]">
          Choose a conversation from your inbox to start messaging.
        </p>
        {onNewMessage ? (
          <button
            type="button"
            onClick={onNewMessage}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[var(--msg-border)] bg-[var(--msg-card)] px-4 text-sm font-medium text-[var(--msg-text)] transition hover:bg-[var(--msg-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--msg-brand)]/40"
          >
            New message
          </button>
        ) : null}
      </div>
    </div>
  );
}
