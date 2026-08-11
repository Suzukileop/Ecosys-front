'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from '@/components/ui/Avatar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import { createOrGetConversation, listConversations, searchMessagingUsers, sendTextMessage } from '@/lib/messaging';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import type { ConversationSummary, DirectMessage, MessagingUserSummary } from '@/types/messaging';

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
  const [search, setSearch] = useState('');
  const [inbox, setInbox] = useState<ConversationSummary[]>([]);
  const [userResults, setUserResults] = useState<MessagingUserSummary[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [transferringId, setTransferringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const preview = useMemo(() => {
    const content = buildTransferContent(message);
    return content.length > 120 ? `${content.slice(0, 120)}…` : content;
  }, [message]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted]);

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
          setError(getApiErrorMessage(e, 'Unable to load inbox.'));
          setInbox([]);
        }
      } finally {
        if (!cancelled) setLoadingInbox(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceConversationId]);

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
        title: 'Message transferred',
        description: `Sent to ${targetLabel}.`,
      });
      onTransferred?.();
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to transfer message.'));
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
        title: 'Message transferred',
        description: `Sent to ${user.fullName}.`,
      });
      onTransferred?.();
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to transfer message.'));
    } finally {
      setTransferringId(null);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto overscroll-contain p-4 pt-20">
      <button
        type="button"
        className="absolute inset-0 h-[100dvh] w-full bg-black/50 backdrop-blur-[1px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-message-title"
        className="relative z-[201] flex max-h-[min(85vh,620px)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div className="shrink-0 border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
          <h2 id="transfer-message-title" className="text-lg font-bold text-neutral-900 dark:text-white">
            Transfer message
          </h2>
          <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{preview}</p>
        </div>

        <div className="shrink-0 border-b border-neutral-200 px-5 py-3 dark:border-neutral-700">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users..."
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#F97316]/40 focus:ring-2 focus:ring-[#F97316]/15 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
            autoFocus
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <div className="mb-3">
              <ErrorAlert message={error} onDismiss={() => setError(null)} />
            </div>
          )}

          {search.trim().length >= 2 && (
            <section className="mb-5">
              <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Users
              </h3>
              {searchLoading ? (
                <div className="flex justify-center py-6">
                  <LoadingSpinner size="sm" />
                </div>
              ) : visibleUsers.length === 0 ? (
                <p className="py-4 text-center text-xs text-neutral-500 dark:text-neutral-400">No users found.</p>
              ) : (
                <ul className="space-y-1.5">
                  {visibleUsers.map((user) => (
                      <li key={user.id}>
                        <button
                          type="button"
                          onClick={() => void transferToUser(user)}
                          disabled={transferringId != null}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-neutral-100 disabled:opacity-60 dark:hover:bg-neutral-800"
                        >
                          <Avatar avatarUrl={user.avatarUrl} name={user.fullName} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                              {user.fullName}
                            </p>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Start conversation</p>
                          </div>
                          <span className="text-xs font-bold text-[#EA580C] dark:text-[#FB923C]">
                            {transferringId === user.id ? '…' : 'Send'}
                          </span>
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </section>
          )}

          <section>
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Inbox
            </h3>
            {loadingInbox ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : filteredInbox.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                {search.trim() ? 'No conversations match your search.' : 'No conversations available.'}
              </p>
            ) : (
              <ul className="space-y-1.5">
                {filteredInbox.map((conversation) => (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() =>
                        void transferToConversation(conversation.id, conversation.otherUserName)
                      }
                      disabled={transferringId != null}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-neutral-100 disabled:opacity-60 dark:hover:bg-neutral-800"
                    >
                      <Avatar
                        avatarUrl={conversation.otherUserAvatarUrl}
                        name={conversation.otherUserName}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                          {conversation.otherUserName}
                        </p>
                        {conversation.lastMessagePreview && (
                          <p className="truncate text-[10px] text-neutral-500 dark:text-neutral-400">
                            {conversation.lastMessagePreview}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#EA580C] dark:text-[#FB923C]">
                        {transferringId === conversation.id ? '…' : 'Send'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="shrink-0 border-t border-neutral-200 px-5 py-4 dark:border-neutral-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
