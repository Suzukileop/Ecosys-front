'use client';

import { useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import { createOrGetConversation, searchMessagingUsers } from '@/lib/messaging';
import type { ConversationSummary, MessagingUserSummary } from '@/types/messaging';
import { ContentPostDialogShell } from '@/components/creator/ContentPostDialogShell';
import {
  X_EMPTY,
  X_KICKER,
  X_KICKER_MARK,
  X_LIST_ROW,
  X_ROW_NAME,
  X_SEARCH_ICON,
  X_SEARCH_PILL,
} from '@/components/messaging/messaging-x';
import { useT } from '@/lib/i18n/I18nProvider';

type NewMessageModalProps = {
  open: boolean;
  currentUserId?: string | null;
  /** People to offer before anything is typed (recent conversation partners). */
  suggestions?: MessagingUserSummary[];
  onClose: () => void;
  onStarted: (conversation: ConversationSummary) => void;
};

/**
 * "New message" — the portalled sheet (a bottom sheet on phones, a centred card from sm). It opens
 * on the people you already write to under a "Recent" kicker, so the common case is one tap; typing
 * two letters switches to a search of everyone. Rows are 56px, the fill tone under the pointer.
 * Outside the messages token scope, so colours are the literal X values (messaging-x).
 */
export function NewMessageModal({
  open,
  currentUserId = null,
  suggestions = [],
  onClose,
  onStarted,
}: NewMessageModalProps) {
  const t = useT();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<MessagingUserSummary[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
            setError(getApiErrorMessage(e, t('Unable to search users.')));
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
  }, [search, open, currentUserId, t]);

  const startConversation = async (user: MessagingUserSummary) => {
    setStartingId(user.id);
    setError(null);
    try {
      const conversation = await createOrGetConversation(user.id);
      onStarted(conversation);
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to start conversation.')));
    } finally {
      setStartingId(null);
    }
  };

  const queryTooShort = search.trim().length < 2;
  const showEmpty = !searchLoading && !queryTooShort && results.length === 0;
  const recent = suggestions.filter((user) => user.id && user.id !== currentUserId);

  const personRow = (user: MessagingUserSummary) => (
    <li key={user.id}>
      <button
        type="button"
        role="option"
        aria-selected={startingId === user.id}
        disabled={startingId != null}
        onClick={() => void startConversation(user)}
        className={X_LIST_ROW}
      >
        <Avatar avatarUrl={user.avatarUrl} name={user.fullName} size="md" tone="muted" />
        <span className={`min-w-0 flex-1 ${X_ROW_NAME}`}>{user.fullName}</span>
        {startingId === user.id ? <LoadingSpinner size="sm" /> : null}
      </button>
    </li>
  );

  return (
    <ContentPostDialogShell open={open} title={t('New message')} onClose={onClose}>
      <div className="news-mono">
        <div className="sticky top-0 z-[1] bg-white px-5 pb-2 pt-1 dark:bg-black">
          <label htmlFor="new-message-search" className="sr-only">
            {t('Search for a contact')}
          </label>
          <div className="relative">
            <svg className={X_SEARCH_ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M20 20l-4.2-4.2" />
            </svg>
            <input
              id="new-message-search"
              type="search"
              value={search}
              autoFocus
              enterKeyHint="search"
              autoComplete="off"
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);
                if (value.trim().length < 2) {
                  setResults([]);
                  setSearchLoading(false);
                }
              }}
              placeholder={t('Search people')}
              className={X_SEARCH_PILL}
            />
          </div>
        </div>

        {error ? (
          <div className="px-5 pb-2">
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          </div>
        ) : null}

        <div className="min-h-[240px] pb-4">
          {searchLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : queryTooShort ? (
            recent.length > 0 ? (
              <>
                <p className={X_KICKER}>
                  <span aria-hidden className={X_KICKER_MARK} />
                  {t('Recent')}
                </p>
                <ul role="listbox" aria-label={t('Recent contacts')}>
                  {recent.map(personRow)}
                </ul>
              </>
            ) : (
              <p className={X_EMPTY}>{t('Type at least 2 characters to find someone.')}</p>
            )
          ) : showEmpty ? (
            <p className={X_EMPTY}>{t('No one matches “{trim}”.', { trim: search.trim() })}</p>
          ) : (
            <>
              <p className={X_KICKER}>
                <span aria-hidden className={X_KICKER_MARK} />
                {t('People')}
              </p>
              <ul role="listbox" aria-label={t('Results')}>
                {results.map(personRow)}
              </ul>
            </>
          )}
        </div>
      </div>
    </ContentPostDialogShell>
  );
}
