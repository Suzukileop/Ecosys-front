'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from '@/components/ui/Avatar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import { createOrGetConversation, searchMessagingUsers } from '@/lib/messaging';
import type { ConversationSummary, MessagingUserSummary } from '@/types/messaging';

type NewMessageModalProps = {
  open: boolean;
  currentUserId?: string | null;
  onClose: () => void;
  onStarted: (conversation: ConversationSummary) => void;
};

export function NewMessageModal({ open, currentUserId = null, onClose, onStarted }: NewMessageModalProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<MessagingUserSummary[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const query = search.trim();
    if (query.length < 2) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setSearchLoading(true);
      void (async () => {
        try {
          const users = await searchMessagingUsers(query, 0, 20);
          if (!cancelled) {
            setResults(users.filter((user) => user.id !== currentUserId));
          }
        } catch (e) {
          if (!cancelled) {
            setError(getApiErrorMessage(e, 'Unable to search users.'));
            setResults([]);
          }
        } finally {
          if (!cancelled) setSearchLoading(false);
        }
      })();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, open, currentUserId]);

  const startConversation = async (user: MessagingUserSummary) => {
    setStartingId(user.id);
    setError(null);
    try {
      const conversation = await createOrGetConversation(user.id);
      onStarted(conversation);
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to start conversation.'));
    } finally {
      setStartingId(null);
    }
  };

  if (!open || typeof document === 'undefined') return null;

  const queryTooShort = search.trim().length < 2;
  const showEmpty = !searchLoading && !queryTooShort && results.length === 0;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 dark:bg-black/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-message-title"
        className="relative z-10 flex max-h-[min(90vh,560px)] w-full max-w-md flex-col overflow-hidden rounded-t-[16px] border border-[var(--msg-border)] bg-[var(--msg-card)] sm:rounded-[var(--msg-radius)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--msg-border)] px-4 py-3">
          <h2 id="new-message-title" className="text-base font-semibold text-[var(--msg-text)]">
            New message
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] text-[var(--msg-muted)] transition hover:bg-[var(--msg-bg)] hover:text-[var(--msg-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--msg-brand)]/40"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="shrink-0 px-4 py-3">
          <label htmlFor="new-message-search" className="sr-only">
            Search for a contact
          </label>
          <input
            id="new-message-search"
            type="search"
            value={search}
            autoFocus
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              if (value.trim().length < 2) {
                setResults([]);
                setSearchLoading(false);
              }
            }}
            placeholder="Search for a contact…"
            className="h-11 w-full rounded-[10px] border border-neutral-200 bg-neutral-100 px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-400"
          />
        </div>

        {error ? (
          <div className="px-4 pb-2">
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          {searchLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : queryTooShort ? (
            <p className="px-3 py-8 text-center text-sm text-[var(--msg-muted)]">
              Enter at least 2 characters to search.
            </p>
          ) : showEmpty ? (
            <p className="px-3 py-8 text-center text-sm text-[var(--msg-muted)]">No results.</p>
          ) : (
            <ul className="space-y-0.5" role="listbox" aria-label="Results">
              {results.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={startingId === user.id}
                    disabled={startingId != null}
                    onClick={() => void startConversation(user)}
                    className="flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition hover:bg-[var(--msg-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--msg-brand)]/40 disabled:opacity-60"
                  >
                    <Avatar avatarUrl={user.avatarUrl} name={user.fullName} size="sm" tone="muted" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--msg-text)]">
                      {user.fullName}
                    </span>
                    {startingId === user.id ? <LoadingSpinner size="sm" /> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
