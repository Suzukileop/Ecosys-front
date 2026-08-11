'use client';

import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { DiscussionChatPanel } from '@/components/messaging/DiscussionChatPanel';
import { DiscussionDetailsPanel } from '@/components/messaging/DiscussionDetailsPanel';
import { ThreadBackgroundGallery } from '@/components/messaging/ThreadBackgroundPicker';
import { InboxConversationRow } from '@/components/messaging/InboxConversationRow';
import { InboxPendingGuestInvites } from '@/components/messaging/InboxPendingGuestInvites';
import { InboxTemporarySection } from '@/components/messaging/InboxTemporarySection';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  acceptDirectGuestInvite,
  cancelOutgoingGuestInvite,
  createOrGetConversation,
  declineDirectGuestInvite,
  listConversationMessages,
  listConversations,
  listPendingGuestInvites,
  listTemporaryInbox,
} from '@/lib/messaging';
import { formatMessagePreview } from '@/lib/messaging-preview';
import { useDiscussionsInboxRealtime } from '@/hooks/useDiscussionsInboxRealtime';
import type {
  ConversationReadReceipt,
  ConversationSummary,
  DirectMessage,
  MessageDeliveryReceipt,
  PendingConversationInvite,
  TemporaryInboxEntry,
  TypingIndicator,
} from '@/types/messaging';
import { useAuth } from '@/context/AuthContext';

const CreateGroupModal = dynamic(
  () => import('@/components/messaging/CreateGroupModal').then((module) => module.CreateGroupModal),
  { ssr: false }
);

function sortConversations(conversations: ConversationSummary[]): ConversationSummary[] {
  return [...conversations].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });
}

type InboxFilter = 'all' | 'unread' | 'groups' | 'temporary';

type OpenChatContext = {
  id: string;
  title: string;
  partnerAvatarUrl?: string | null;
  partnerUserId?: string | null;
  conversationType?: ConversationSummary['type'];
  readOnlyGuestHistory?: boolean;
};

function isGuestConversation(conversation: ConversationSummary): boolean {
  return conversation.guestSession === true;
}

function matchesInboxFilter(conversation: ConversationSummary, filter: InboxFilter): boolean {
  if (isGuestConversation(conversation)) return false;
  switch (filter) {
    case 'unread':
      return (conversation.unreadCount ?? 0) > 0;
    case 'groups':
      return conversation.type === 'GROUP';
    case 'temporary':
      return false;
    default:
      return true;
  }
}

function buildOpenChatContext(conversation: ConversationSummary): OpenChatContext {
  return {
    id: conversation.id,
    title:
      conversation.type === 'GROUP'
        ? conversation.title ?? conversation.otherUserName ?? 'Group'
        : conversation.otherUserName ?? 'Chat',
    partnerAvatarUrl: conversation.otherUserAvatarUrl,
    partnerUserId: conversation.otherUserId,
    conversationType: conversation.type,
    readOnlyGuestHistory: false,
  };
}

export default function DiscussionsPage() {
  return (
    <Suspense
      fallback={
        <DashboardHomeShell wide fullWidth>
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </DashboardHomeShell>
      }
    >
      <DiscussionsPageContent />
    </Suspense>
  );
}

function DiscussionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const targetUserId = searchParams.get('user');
  const targetConversationId = searchParams.get('conversation');
  const filterParam = searchParams.get('filter');

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [openingUser, setOpeningUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidePanelTab, setSidePanelTab] = useState<'inbox' | 'thread'>('inbox');
  const [themesGalleryOpen, setThemesGalleryOpen] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>('all');
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [temporaryInbox, setTemporaryInbox] = useState<TemporaryInboxEntry[]>([]);
  const [pendingIncomingInvites, setPendingIncomingInvites] = useState<PendingConversationInvite[]>([]);
  const [inviteActionId, setInviteActionId] = useState<string | null>(null);
  const [cancelInviteId, setCancelInviteId] = useState<string | null>(null);
  const [openContext, setOpenContext] = useState<OpenChatContext | null>(null);
  const [typingByConversationId, setTypingByConversationId] = useState<Record<string, string>>({});
  const [deliveryReceiptsByConversation, setDeliveryReceiptsByConversation] = useState<
    Record<string, Record<string, Set<string>>>
  >({});
  const [lastDeliveryReceipt, setLastDeliveryReceipt] = useState<MessageDeliveryReceipt | null>(null);
  const [lastDeliveryConversationId, setLastDeliveryConversationId] = useState<string | null>(null);
  const [lastReadReceipt, setLastReadReceipt] = useState<ConversationReadReceipt | null>(null);
  const [lastReadConversationId, setLastReadConversationId] = useState<string | null>(null);
  const openContextIdRef = useRef<string | null>(null);
  openContextIdRef.current = openContext?.id ?? null;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const apply = () => setSidePanelOpen(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (sidePanelTab !== 'thread') {
      setThemesGalleryOpen(false);
    }
  }, [sidePanelTab]);

  const refreshConversations = useCallback(async () => {
    try {
      setError(null);
      const list = await listConversations();
      setConversations(sortConversations(list));
      return list;
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load conversations.'));
      return [];
    }
  }, []);

  const refreshTemporaryInbox = useCallback(async () => {
    if (!user?.id) {
      setTemporaryInbox([]);
      setPendingIncomingInvites([]);
      return;
    }
    const [entries, invites] = await Promise.all([
      listTemporaryInbox().catch(() => [] as TemporaryInboxEntry[]),
      listPendingGuestInvites().catch(() => [] as PendingConversationInvite[]),
    ]);
    setTemporaryInbox(entries);
    setPendingIncomingInvites(invites);
  }, [user?.id]);

  useEffect(() => {
    if (filterParam === 'temporary') {
      setInboxFilter('temporary');
      setSidePanelTab('inbox');
      setSidePanelOpen(true);
    }
  }, [filterParam]);

  useEffect(() => {
    if (!user?.id) return;
    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') {
        void refreshTemporaryInbox();
      }
    };
    window.addEventListener('focus', refreshOnVisible);
    document.addEventListener('visibilitychange', refreshOnVisible);
    return () => {
      window.removeEventListener('focus', refreshOnVisible);
      document.removeEventListener('visibilitychange', refreshOnVisible);
    };
  }, [user?.id, refreshTemporaryInbox]);

  const handleConversationUpdated = useCallback(() => {
    void refreshConversations();
    void refreshTemporaryInbox();
  }, [refreshConversations, refreshTemporaryInbox]);

  const handleConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
      )
    );
    void refreshConversations();
  }, [refreshConversations]);

  const conversationIds = useMemo(() => conversations.map((conversation) => conversation.id), [conversations]);

  const handleRealtimeMessage = useCallback(
    (conversationId: string, message: DirectMessage) => {
      const preview = formatMessagePreview(message);
      const skipInboxPreview = preview === null;
      const isFromOthers = message.senderId !== user?.id;
      const isSelected = openContextIdRef.current === conversationId;

      setConversations((prev) => {
        const existing = prev.find((conversation) => conversation.id === conversationId);
        if (!existing) {
          void refreshConversations();
          return prev;
        }

        const updated = prev.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                ...(skipInboxPreview
                  ? {}
                  : {
                      lastMessagePreview: preview,
                      lastMessageId: message.id,
                      lastMessageSenderId: message.senderId,
                      lastMessageAt: message.sentAt,
                    }),
                unreadCount:
                  skipInboxPreview || isSelected || !isFromOthers
                    ? isSelected
                      ? 0
                      : (conversation.unreadCount ?? 0)
                    : (conversation.unreadCount ?? 0) + 1,
              }
            : conversation
        );
        return sortConversations(updated);
      });

      setTypingByConversationId((prev) => {
        if (!(conversationId in prev)) return prev;
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });

    },
    [refreshConversations, user?.id]
  );

  const handleRealtimeTyping = useCallback((conversationId: string, indicator: TypingIndicator | null) => {
    setTypingByConversationId((prev) => {
      if (!indicator?.typing) {
        if (!(conversationId in prev)) return prev;
        const next = { ...prev };
        delete next[conversationId];
        return next;
      }
      return { ...prev, [conversationId]: indicator.userName };
    });
  }, []);

  const handleRealtimeDeliveryReceipt = useCallback(
    (conversationId: string, receipt: MessageDeliveryReceipt) => {
      setLastDeliveryConversationId(conversationId);
      setLastDeliveryReceipt(receipt);
      setDeliveryReceiptsByConversation((prev) => {
        const conversationReceipts = { ...(prev[conversationId] ?? {}) };
        const deliveredUsers = new Set(conversationReceipts[receipt.messageId] ?? []);
        deliveredUsers.add(receipt.userId);
        conversationReceipts[receipt.messageId] = deliveredUsers;
        return { ...prev, [conversationId]: conversationReceipts };
      });
    },
    []
  );

  const handleRealtimeReadReceipt = useCallback((conversationId: string, receipt: ConversationReadReceipt) => {
    setLastReadConversationId(conversationId);
    setLastReadReceipt(receipt);
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId && conversation.otherUserId === receipt.userId
          ? { ...conversation, otherUserLastReadAt: receipt.readAt }
          : conversation
      )
    );
  }, []);

  const { connected: inboxConnected, publishDelivery } = useDiscussionsInboxRealtime({
    conversationIds,
    currentUserId: user?.id,
    enabled: Boolean(user?.id) && !loadingList,
    onMessage: handleRealtimeMessage,
    onTyping: handleRealtimeTyping,
    onDeliveryReceipt: handleRealtimeDeliveryReceipt,
    onReadReceipt: handleRealtimeReadReceipt,
  });

  useEffect(() => {
    if (!inboxConnected || loadingList || !user?.id || conversationIds.length === 0) return;

    let cancelled = false;
    (async () => {
      for (const conversationId of conversationIds) {
        try {
          const page = await listConversationMessages(conversationId, 0, 30);
          if (cancelled) return;
          for (const message of page.content) {
            if (message.messageType === 'SYSTEM' || message.senderId === user.id) continue;
            publishDelivery(conversationId, message.id);
          }
        } catch {
          /* ignore per-conversation failures */
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inboxConnected, loadingList, user?.id, conversationIds, publishDelivery]);

  useEffect(() => {
    if (!user?.id || loadingList) return;
    const interval = setInterval(() => {
      void refreshConversations();
      void refreshTemporaryInbox();
    }, 15000);
    return () => clearInterval(interval);
  }, [user?.id, loadingList, refreshConversations, refreshTemporaryInbox]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      await Promise.all([refreshConversations(), refreshTemporaryInbox()]);
      if (!cancelled) setLoadingList(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshConversations, refreshTemporaryInbox]);

  useEffect(() => {
    if (!targetConversationId) return;
    setSidePanelTab('thread');
    const conversation = conversations.find((item) => item.id === targetConversationId);
    if (conversation) {
      setOpenContext(buildOpenChatContext(conversation));
    }
  }, [targetConversationId, conversations]);

  useEffect(() => {
    if (!targetUserId) return;

    let cancelled = false;
    (async () => {
      setOpeningUser(true);
      setError(null);
      try {
        const conversation = await createOrGetConversation(targetUserId);
        if (cancelled) return;
        setOpenContext(buildOpenChatContext(conversation));
        const list = await refreshConversations();
        if (!list.some((c) => c.id === conversation.id)) {
          setConversations(sortConversations([conversation, ...list]));
        }
        router.replace('/dashboard/discussions', { scroll: false });
      } catch (e) {
        if (!cancelled) {
          setError(getApiErrorMessage(e, 'Unable to start conversation.'));
        }
      } finally {
        if (!cancelled) setOpeningUser(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [targetUserId, refreshConversations, router]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === openContext?.id) ?? null,
    [conversations, openContext?.id]
  );

  const activeChatContext = openContext;

  useEffect(() => {
    if (!openContext?.id) return;
    if (!conversations.some((conversation) => conversation.id === openContext.id)) {
      setOpenContext(null);
    }
  }, [conversations, openContext]);

  const permanentConversations = useMemo(
    () => conversations.filter((conversation) => !isGuestConversation(conversation)),
    [conversations]
  );

  const filteredTemporaryInbox = useMemo(() => {
    const query = inboxSearch.trim().toLowerCase();
    if (!query) return temporaryInbox;
    return temporaryInbox.filter((entry) => {
      const headline = entry.headline.toLowerCase();
      const subtitle = entry.subtitle?.toLowerCase() ?? '';
      const title = entry.conversationTitle.toLowerCase();
      return headline.includes(query) || subtitle.includes(query) || title.includes(query);
    });
  }, [temporaryInbox, inboxSearch]);

  const filteredTemporaryInboxWithoutIncoming = useMemo(
    () => filteredTemporaryInbox.filter((entry) => entry.entryType !== 'INCOMING_INVITE'),
    [filteredTemporaryInbox]
  );

  const inboxFilterCounts = useMemo(
    () => ({
      unread: permanentConversations.filter((c) => (c.unreadCount ?? 0) > 0).length,
      groups: permanentConversations.filter((c) => c.type === 'GROUP').length,
      temporary: Math.max(temporaryInbox.length, pendingIncomingInvites.length),
    }),
    [permanentConversations, temporaryInbox.length, pendingIncomingInvites.length]
  );

  const filteredConversations = useMemo(() => {
    const query = inboxSearch.trim().toLowerCase();
    return permanentConversations.filter((conversation) => {
      if (!matchesInboxFilter(conversation, inboxFilter)) return false;
      if (!query) return true;
      const name = conversation.otherUserName?.toLowerCase() ?? '';
      const preview = conversation.lastMessagePreview?.toLowerCase() ?? '';
      return name.includes(query) || preview.includes(query);
    });
  }, [permanentConversations, inboxSearch, inboxFilter]);

  const showChat = Boolean(activeChatContext);
  const threadActive = sidePanelTab === 'thread' && sidePanelOpen;
  const showSidePanel = !showChat || sidePanelOpen;

  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversations.find((item) => item.id === conversationId);
    if (conversation) {
      setOpenContext(buildOpenChatContext(conversation));
    }
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
      )
    );
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setSidePanelOpen(false);
    }
  };

  const handleOpenTemporaryConversation = (entry: TemporaryInboxEntry) => {
    setOpenContext({
      id: entry.conversationId,
      title: entry.conversationTitle,
      partnerAvatarUrl: entry.avatarUrl,
      conversationType: 'GROUP',
      readOnlyGuestHistory: entry.entryType === 'ENDED_GUEST',
    });
    setSidePanelTab('inbox');
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setSidePanelOpen(false);
    }
  };

  const openThreadPanel = () => {
    setSidePanelTab('thread');
    setSidePanelOpen(true);
  };

  const handleGuestSessionEnded = useCallback(() => {
    setOpenContext(null);
    void refreshConversations();
    void refreshTemporaryInbox();
  }, [refreshConversations, refreshTemporaryInbox]);

  const handleAcceptGuestInvite = async (inviteId: string) => {
    setInviteActionId(inviteId);
    setError(null);
    try {
      const conversation = await acceptDirectGuestInvite(inviteId);
      const list = await refreshConversations();
      if (!list.some((item) => item.id === conversation.id)) {
        setConversations(sortConversations([conversation, ...list]));
      }
      await refreshTemporaryInbox();
      setOpenContext(buildOpenChatContext(conversation));
      setSidePanelTab('inbox');
      if (window.matchMedia('(max-width: 1023px)').matches) {
        setSidePanelOpen(false);
      }
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to accept invite.'));
    } finally {
      setInviteActionId(null);
    }
  };

  const handleDeclineGuestInvite = async (inviteId: string) => {
    setInviteActionId(inviteId);
    setError(null);
    try {
      await declineDirectGuestInvite(inviteId);
      await refreshTemporaryInbox();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to decline invite.'));
    } finally {
      setInviteActionId(null);
    }
  };

  const handleCancelOutgoingInvite = async (conversationId: string, inviteId: string) => {
    setCancelInviteId(inviteId);
    setError(null);
    try {
      await cancelOutgoingGuestInvite(conversationId, inviteId);
      await refreshTemporaryInbox();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to cancel invite.'));
    } finally {
      setCancelInviteId(null);
    }
  };

  const inboxList = (
    <>
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 pb-2 pt-3">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Inbox</h2>
        <button
          type="button"
          onClick={() => void createGroup()}
          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-900 transition hover:bg-gray-50 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
        >
          New group
        </button>
      </div>

      {pendingIncomingInvites.length > 0 && (
        <InboxPendingGuestInvites
          invites={pendingIncomingInvites}
          actingId={inviteActionId}
          onAccept={(inviteId) => void handleAcceptGuestInvite(inviteId)}
          onDecline={(inviteId) => void handleDeclineGuestInvite(inviteId)}
        />
      )}

      <div className="shrink-0 px-3 pb-3">
        <label htmlFor="inbox-search" className="sr-only">
          Search messages
        </label>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="inbox-search"
            type="search"
            value={inboxSearch}
            onChange={(e) => setInboxSearch(e.target.value)}
            placeholder="Search messages..."
            className="w-full rounded-2xl border-0 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-400/15 dark:bg-neutral-800 dark:text-white dark:focus:ring-neutral-600/40"
          />
        </div>
      </div>

      <div className="shrink-0 px-3 pb-3">
        <div
          className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filter conversations"
        >
          {(
            [
              { id: 'all' as const, label: 'All' },
              { id: 'unread' as const, label: 'Unread', count: inboxFilterCounts.unread },
              { id: 'groups' as const, label: 'Groups', count: inboxFilterCounts.groups },
              { id: 'temporary' as const, label: 'Temporary', count: inboxFilterCounts.temporary },
            ] as const
          ).map((chip) => {
            const active = inboxFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setInboxFilter(chip.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'bg-neutral-200 text-gray-900 dark:bg-neutral-700 dark:text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                }`}
              >
                {chip.label}
                {'count' in chip && chip.count > 0 ? (
                  <span className="text-gray-500 dark:text-neutral-400">
                    {' '}
                    {chip.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-transparent pb-2 [scrollbar-width:thin] [scrollbar-color:#a3a3a3_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-400 dark:[scrollbar-color:#525252_transparent] [&::-webkit-scrollbar-thumb]:dark:bg-neutral-600">
        {loadingList || openingUser ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : inboxFilter === 'temporary' ? (
          filteredTemporaryInboxWithoutIncoming.length === 0 && pendingIncomingInvites.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-neutral-400">
              {inboxSearch.trim()
                ? 'No temporary access matches your search.'
                : 'No temporary guest access or pending invites.'}
            </p>
          ) : filteredTemporaryInboxWithoutIncoming.length === 0 ? null : (
            <InboxTemporarySection
              entries={filteredTemporaryInboxWithoutIncoming}
              actingInviteId={inviteActionId}
              actingCancelId={cancelInviteId}
              onAcceptInvite={(inviteId) => void handleAcceptGuestInvite(inviteId)}
              onDeclineInvite={(inviteId) => void handleDeclineGuestInvite(inviteId)}
              onCancelInvite={(conversationId, inviteId) =>
                void handleCancelOutgoingInvite(conversationId, inviteId)
              }
              onOpenConversation={handleOpenTemporaryConversation}
            />
          )
        ) : (
          <>
            <div className="px-2">
              {filteredConversations.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-neutral-400">
                  {inboxSearch.trim()
                    ? 'No conversations match your search.'
                    : inboxFilter !== 'all'
                      ? 'No conversations match this filter.'
                      : 'No conversations yet. Visit a creator profile and tap "Discuss" to start chatting.'}
                </p>
              ) : (
                <ul role="listbox" aria-label="Conversations" className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <InboxConversationRow
                      key={conversation.id}
                      conversation={conversation}
                      selected={conversation.id === openContext?.id}
                      currentUserId={user?.id}
                      typingName={typingByConversationId[conversation.id]}
                      deliveredUserIds={
                        conversation.lastMessageId
                          ? deliveryReceiptsByConversation[conversation.id]?.[conversation.lastMessageId]
                          : undefined
                      }
                      onSelect={handleSelectConversation}
                    />
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );

  const createGroup = () => {
    setCreateGroupOpen(true);
  };

  const handleGroupCreated = async (group: ConversationSummary) => {
    setOpenContext(buildOpenChatContext(group));
    setSidePanelTab('thread');
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setSidePanelOpen(false);
    }
    const list = await refreshConversations();
    if (!list.some((conversation) => conversation.id === group.id)) {
      setConversations(sortConversations([group, ...list]));
    }
  };

  return (
    <DashboardHomeShell wide fullWidth fillViewport>
      {createGroupOpen && (
        <CreateGroupModal
          open
          currentUserId={user?.id}
          onClose={() => setCreateGroupOpen(false)}
          onCreated={(group) => void handleGroupCreated(group)}
        />
      )}
      {error && (
        <div className="mb-3 shrink-0">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-3 p-1">
        <div className={`flex min-h-0 min-w-0 flex-1 ${showChat ? 'flex' : 'hidden lg:flex'}`}>
          {activeChatContext ? (
            <section
              className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-black"
              aria-label="Chat"
            >
              <div className="flex shrink-0 items-center gap-2 px-3 pt-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => {
                    setOpenContext(null);
                    setSidePanelTab('inbox');
                    setSidePanelOpen(true);
                  }}
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition hover:bg-gray-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-700"
                >
                  Inbox
                </button>
                <button
                  type="button"
                  onClick={openThreadPanel}
                  disabled={!selectedConversation}
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-700"
                >
                  Thread
                </button>
              </div>
              <DiscussionChatPanel
                conversationId={activeChatContext.id}
                title={activeChatContext.title}
                partnerAvatarUrl={activeChatContext.partnerAvatarUrl}
                partnerUserId={activeChatContext.partnerUserId}
                conversationType={activeChatContext.conversationType}
                readOnlyGuestHistory={activeChatContext.readOnlyGuestHistory}
                showComposer={!activeChatContext.readOnlyGuestHistory}
                detailsOpen={threadActive}
                onToggleDetails={openThreadPanel}
                onConversationUpdated={handleConversationUpdated}
                onConversationRead={handleConversationRead}
                onGuestSessionEnded={handleGuestSessionEnded}
                incomingDeliveryReceipt={
                  lastDeliveryConversationId === activeChatContext.id ? lastDeliveryReceipt : null
                }
                incomingReadReceipt={
                  lastReadConversationId === activeChatContext.id ? lastReadReceipt : null
                }
              />
            </section>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-gray-100 px-6 py-12 text-center dark:border-neutral-800 dark:bg-black">
              <p className="text-sm font-medium text-gray-700 dark:text-neutral-300">Select a conversation</p>
              <p className="mt-1 max-w-sm text-xs text-gray-500 dark:text-neutral-400">
                Open your inbox on the right to choose a chat, or start one from a creator profile.
              </p>
            </div>
          )}
        </div>

        {sidePanelOpen && showChat && (
          <button
            type="button"
            aria-label="Close side panel"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidePanelOpen(false)}
          />
        )}

        <aside
          className={`flex min-h-0 shrink-0 flex-col overflow-hidden rounded-3xl bg-gray-100 dark:bg-neutral-900 ${
            showSidePanel ? 'flex' : 'hidden'
          } fixed inset-y-0 right-0 z-50 w-[min(100%,480px)] lg:static lg:z-auto lg:flex lg:w-[440px] xl:w-[480px] ${
            !showChat ? 'inset-x-0 w-full max-w-none rounded-none lg:rounded-3xl' : ''
          }`}
          aria-label="Discussions side panel"
        >
          <div className="shrink-0 p-2">
            {!themesGalleryOpen && (
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white p-1 dark:bg-neutral-800">
                <button
                  type="button"
                  onClick={() => setSidePanelTab('inbox')}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    sidePanelTab === 'inbox'
                      ? 'bg-neutral-200 text-gray-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                      : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  }`}
                >
                  Inbox
                </button>
                <button
                  type="button"
                  onClick={() => setSidePanelTab('thread')}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    sidePanelTab === 'thread'
                      ? 'bg-neutral-200 text-gray-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                      : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  }`}
                >
                  Thread
                </button>
              </div>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {themesGalleryOpen ? (
              <ThreadBackgroundGallery onBack={() => setThemesGalleryOpen(false)} />
            ) : sidePanelTab === 'inbox' ? (
              inboxList
            ) : selectedConversation ? (
              <DiscussionDetailsPanel
                key={selectedConversation.id}
                embedded
                conversation={selectedConversation}
                onClose={() => setSidePanelOpen(false)}
                onConversationUpdated={handleConversationUpdated}
                onOpenThemesGallery={() => setThemesGalleryOpen(true)}
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-neutral-300">No conversation selected</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                  Pick a chat from the Inbox tab to see thread details here.
                </p>
                <button
                  type="button"
                  onClick={() => setSidePanelTab('inbox')}
                  className="mt-4 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                >
                  Open Inbox
                </button>
              </div>
            )}
          </div>
        </aside>

        {!sidePanelOpen && showChat && (
          <button
            type="button"
            onClick={() => setSidePanelOpen(true)}
            className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white text-gray-900 shadow-lg transition hover:bg-gray-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 lg:hidden"
            aria-label="Open inbox and thread panel"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>
    </DashboardHomeShell>
  );
}
