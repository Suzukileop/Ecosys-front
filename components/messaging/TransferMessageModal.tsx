'use client';

import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import { createOrGetConversation, listConversations, searchMessagingUsers, sendTextMessage } from '@/lib/messaging';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import type { ConversationSummary, DirectMessage, MessagingUserSummary } from '@/types/messaging';
import { ContentPostDialogShell } from '@/components/creator/ContentPostDialogShell';
import {
  X_EMPTY,
  X_KICKER,
  X_KICKER_MARK,
  X_LIST_ROW,
  X_ROW_ACTION,
  X_ROW_META,
  X_ROW_NAME,
  X_SEARCH_ICON,
  X_SEARCH_PILL,
} from '@/components/messaging/messaging-x';
import { useT } from '@/lib/i18n/I18nProvider';

type TransferMessageModalProps = {
  message: DirectMessage;
  sourceConversationId: string;
  onClose: () => void;
  onTransferred?: () => void;
};

function buildTransferContent(message: DirectMessage): string {
  const text = message.content?.trim();
  if (text) return text;
  if (message.attachments?.length) {
    const names = message.attachments.map((attachment) => attachment.fileName).join(', ');
    return `[Attachment: ${names}]`;
  }
  return 'Message';
}

export function TransferMessageModal({
  message,
  sourceConversationId,
  onClose,
  onTransferred,
}: TransferMessageModalProps) {
  const t = useT();
  const [search, setSearch] = useState('');
  const [inbox, setInbox] = useState<ConversationSummary[]>([]);
  const [userResults, setUserResults] = useState<MessagingUserSummary[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [transferringId, setTransferringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => {
    const content = buildTransferContent(message);
    return content.length > 120 ? `${content.slice(0, 120)}…` : content;
  }, [message]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingInbox(true);
      try {
        const conversations = await listConversations();
        if (!cancelled) {
          setInbox(conversations.filter((conversation) => conversation.id !== sourceConversationId));
        }
      } catch (e) {
        if (!cancelled) {
          setError(getApiErrorMessage(e, t('Unable to load inbox.')));
          setInbox([]);
        }
      } finally {
        if (!cancelled) setLoadingInbox(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceConversationId, t]);

  useEffect(() => {
    const query = search.trim();
    if (query.length < 2) {
      setUserResults([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setSearchLoading(true);
      void (async () => {
        try {
          const users = await searchMessagingUsers(query, 0, 12);
          if (!cancelled) setUserResults(users);
        } catch {
          if (!cancelled) setUserResults([]);
        } finally {
          if (!cancelled) setSearchLoading(false);
        }
      })();
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search]);

  const filteredInbox = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return inbox;
    return inbox.filter((conversation) => conversation.otherUserName.toLowerCase().includes(query));
  }, [inbox, search]);

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length < 2) return [];
    const inboxNames = new Set(inbox.map((conversation) => conversation.otherUserName.toLowerCase()));
    return userResults.filter((user) => {
      const name = user.fullName.toLowerCase();
      return name.includes(query) && !inboxNames.has(name);
    });
  }, [inbox, search, userResults]);

  const transferToConversation = async (targetConversationId: string, targetLabel: string) => {
    if (transferringId) return;
    setTransferringId(targetConversationId);
    setError(null);
    try {
      await sendTextMessage(targetConversationId, buildTransferContent(message));
      pushFlashFeedback({
        variant: 'success',
        title: t('Message forwarded'),
        description: t('Sent to {targetLabel}.', { targetLabel }),
      });
      onTransferred?.();
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to transfer message.')));
    } finally {
      setTransferringId(null);
    }
  };

  const transferToUser = async (user: MessagingUserSummary) => {
    if (!user.id || transferringId) return;
    setTransferringId(user.id);
    setError(null);
    try {
      const conversation = await createOrGetConversation(user.id);
      await sendTextMessage(conversation.id, buildTransferContent(message));
      pushFlashFeedback({
        variant: 'success',
        title: t('Message forwarded'),
        description: t('Sent to {fullName}.', { fullName: user.fullName }),
      });
      onTransferred?.();
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to transfer message.')));
    } finally {
      setTransferringId(null);
    }
  };

  return (
    <ContentPostDialogShell open title={t('Forward message')} onClose={onClose} busy={transferringId != null}>
      <p className="mx-5 mb-3 line-clamp-2 bg-[#F7F9F9] px-4 py-3 text-[15px] leading-5 text-[#0F1419] dark:bg-[#16181C] dark:text-[#E7E9EA]">
        {preview}
      </p>
      <div className="px-5 pb-2">
        <div className="relative">
          <svg className={X_SEARCH_ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M20 20l-4.2-4.2" />
            </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('Search people')}
            aria-label={t('Search people')}
            className={X_SEARCH_PILL}
            autoFocus
          />
        </div>
      </div>

      {error ? (
        <div className="px-5 pb-2">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      ) : null}

      <div className="pb-3">
        {search.trim().length >= 2 ? (
          <section>
            <h3 className={X_KICKER}><span aria-hidden className={X_KICKER_MARK} />{t('People')}</h3>
            {searchLoading ? (
              <div className="flex justify-center py-6">
                <LoadingSpinner size="sm" />
              </div>
            ) : visibleUsers.length === 0 ? (
              <p className={X_EMPTY}>{t('No people found.')}</p>
            ) : (
              <ul>
                {visibleUsers.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => void transferToUser(user)}
                      disabled={transferringId != null}
                      className={X_LIST_ROW}
                    >
                      <Avatar avatarUrl={user.avatarUrl} name={user.fullName} size="md" tone="muted" />
                      <span className={`min-w-0 flex-1 ${X_ROW_NAME}`}>{user.fullName}</span>
                      <span className={X_ROW_ACTION}>{transferringId === user.id ? '…' : t('Send')}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        <section>
          <h3 className={X_KICKER}><span aria-hidden className={X_KICKER_MARK} />{t('Recent conversations')}</h3>
          {loadingInbox ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="sm" />
            </div>
          ) : filteredInbox.length === 0 ? (
            <p className={X_EMPTY}>
              {search.trim() ? t('No conversations match your search.') : t('No conversations available.')}
            </p>
          ) : (
            <ul>
              {filteredInbox.map((conversation) => (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => void transferToConversation(conversation.id, conversation.otherUserName)}
                    disabled={transferringId != null}
                    className={X_LIST_ROW}
                  >
                    <Avatar
                      avatarUrl={conversation.otherUserAvatarUrl}
                      name={conversation.otherUserName}
                      size="md"
                      tone="muted"
                    />
                    <span className="min-w-0 flex-1">
                      <span className={`block ${X_ROW_NAME}`}>{conversation.otherUserName}</span>
                      {conversation.lastMessagePreview ? (
                        <span className={`block ${X_ROW_META}`}>{conversation.lastMessagePreview}</span>
                      ) : null}
                    </span>
                    <span className={X_ROW_ACTION}>{transferringId === conversation.id ? '…' : t('Send')}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </ContentPostDialogShell>
  );
}
