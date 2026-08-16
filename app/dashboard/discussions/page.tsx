'use client';

import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { DiscussionChatPanel } from '@/components/messaging/DiscussionChatPanel';
import { DiscussionDetailsPanel } from '@/components/messaging/DiscussionDetailsPanel';
import { EmptyConversation } from '@/components/messaging/EmptyConversation';
import { InboxConversationRow } from '@/components/messaging/InboxConversationRow';
import { InboxPanel, type InboxFilterId } from '@/components/messaging/InboxPanel';
import { InboxPendingGuestInvites } from '@/components/messaging/InboxPendingGuestInvites';
import { InboxTemporarySection } from '@/components/messaging/InboxTemporarySection';
import { MessageLayout } from '@/components/messaging/MessageLayout';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  DASHBOARD_SIDEBAR_EXPAND_EVENT,
  notifyMessagingDetailsOpen,
} from '@/lib/dashboard-chrome';
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
import { SHOW_GROUP_CHAT } from '@/lib/messaging-feature-flags';
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

const NewMessageModal = dynamic(
  () => import('@/components/messaging/NewMessageModal').then((module) => module.NewMessageModal),
  { ssr: false }
);

function sortConversations(conversations: ConversationSummary[]): ConversationSummary[] {
  return [...conversations].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });
}

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

function matchesInboxFilter(conversation: ConversationSummary, filter: InboxFilterId): boolean {
  if (isGuestConversation(conversation)) return false;
  if (!SHOW_GROUP_CHAT && conversation.type === 'GROUP') return false;
  switch (filter) {
    case 'unread':
      return (conversation.unreadCount ?? 0) > 0;
    case 'groups':
      return SHOW_GROUP_CHAT && conversation.type === 'GROUP';
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxFilter, setInboxFilter] = useState<InboxFilterId>('all');
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
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
    if (!SHOW_GROUP_CHAT && inboxFilter === 'groups') {
      setInboxFilter('all');
    }
  }, [inboxFilter]);

  useEffect(() => {
    if (!SHOW_GROUP_CHAT && openContext?.conversationType === 'GROUP') {
      setOpenContext(null);
    }
  }, [openContext?.conversationType]);

  useEffect(() => {
    if (!openContext) setDetailsOpen(false);
  }, [openContext]);

  useEffect(() => {
    if (filterParam === 'temporary') {
      setInboxFilter('temporary');
    }
  }, [filterParam]);

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

  const handleConversationRead = useCallback(
    (conversationId: string) => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
        )
      );
      void refreshConversations();
    },
    [refreshConversations]
  );

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

  // Sync open thread from URL + inbox list. Do NOT close Details here:
  // `conversations` refreshes often (realtime / unread), which was auto-closing Details.
  useEffect(() => {
    if (!targetConversationId) return;
    const conversation = conversations.find((item) => item.id === targetConversationId);
    if (!conversation) return;
    setOpenContext((prev) => {
      const next = buildOpenChatContext(conversation);
      if (
        prev &&
        prev.id === next.id &&
        prev.title === next.title &&
        prev.partnerAvatarUrl === next.partnerAvatarUrl &&
        prev.partnerUserId === next.partnerUserId &&
        prev.conversationType === next.conversationType &&
        prev.readOnlyGuestHistory === next.readOnlyGuestHistory
      ) {
        return prev;
      }
      return next;
    });
  }, [targetConversationId, conversations]);

  // Close Details only when the selected conversation (URL) actually changes.
  const prevTargetConversationIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevTargetConversationIdRef.current === targetConversationId) return;
    prevTargetConversationIdRef.current = targetConversationId;
    setDetailsOpen(false);
  }, [targetConversationId]);

  useEffect(() => {
    if (!targetUserId) return;

    let cancelled = false;
    (async () => {
      setOpeningUser(true);
      setError(null);
      try {
        const conversation = await createOrGetConversation(targetUserId);
        if (cancelled) return;
        // Keep the thread visible in the main panel immediately (before list refresh).
        setConversations((prev) => {
          if (prev.some((item) => item.id === conversation.id)) {
            return sortConversations(
              prev.map((item) => (item.id === conversation.id ? { ...item, ...conversation } : item))
            );
          }
          return sortConversations([conversation, ...prev]);
        });
        setOpenContext(buildOpenChatContext(conversation));
        setDetailsOpen(false);
        await refreshConversations();
        if (cancelled) return;
        router.replace(
          `/dashboard/discussions?conversation=${encodeURIComponent(conversation.id)}`,
          { scroll: false }
        );
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
    // Avoid wiping a just-opened Discuss thread while the inbox list is still loading.
    if (loadingList || openingUser) return;
    if (!conversations.some((conversation) => conversation.id === openContext.id)) {
      setOpenContext(null);
    }
  }, [conversations, openContext, loadingList, openingUser]);

  const permanentConversations = useMemo(
    () =>
      conversations.filter(
        (conversation) =>
          !isGuestConversation(conversation) && (SHOW_GROUP_CHAT || conversation.type !== 'GROUP')
      ),
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

  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversations.find((item) => item.id === conversationId);
    if (conversation) {
      setOpenContext(buildOpenChatContext(conversation));
      router.replace(
        `/dashboard/discussions?conversation=${encodeURIComponent(conversationId)}`,
        { scroll: false }
      );
    }
    setConversations((prev) =>
      prev.map((item) =>
        item.id === conversationId ? { ...item, unreadCount: 0 } : item
      )
    );
    setDetailsOpen(false);
  };

  const handleOpenTemporaryConversation = (entry: TemporaryInboxEntry) => {
    setOpenContext({
      id: entry.conversationId,
      title: entry.conversationTitle,
      partnerAvatarUrl: entry.avatarUrl,
      conversationType: 'GROUP',
      readOnlyGuestHistory: entry.entryType === 'ENDED_GUEST',
    });
    setDetailsOpen(false);
  };

  const handleBackToInbox = () => {
    setOpenContext(null);
    setDetailsOpen(false);
    router.replace('/dashboard/discussions', { scroll: false });
  };

  const toggleDetails = () => {
    setDetailsOpen((open) => {
      const next = !open;
      if (next) {
        notifyMessagingDetailsOpen();
      }
      return next;
    });
  };

  useEffect(() => {
    const onSidebarExpand = () => setDetailsOpen(false);
    window.addEventListener(DASHBOARD_SIDEBAR_EXPAND_EVENT, onSidebarExpand);
    return () => window.removeEventListener(DASHBOARD_SIDEBAR_EXPAND_EVENT, onSidebarExpand);
  }, []);

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
      setDetailsOpen(false);
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

  const handleGroupCreated = async (group: ConversationSummary) => {
    setOpenContext(buildOpenChatContext(group));
    setDetailsOpen(false);
    const list = await refreshConversations();
    if (!list.some((conversation) => conversation.id === group.id)) {
      setConversations(sortConversations([group, ...list]));
    }
  };

  const handleNewMessageStarted = async (conversation: ConversationSummary) => {
    setConversations((prev) => {
      if (prev.some((item) => item.id === conversation.id)) {
        return sortConversations(
          prev.map((item) => (item.id === conversation.id ? { ...item, ...conversation } : item))
        );
      }
      return sortConversations([conversation, ...prev]);
    });
    setOpenContext(buildOpenChatContext(conversation));
    setDetailsOpen(false);
    router.replace(
      `/dashboard/discussions?conversation=${encodeURIComponent(conversation.id)}`,
      { scroll: false }
    );
    const list = await refreshConversations();
    if (!list.some((item) => item.id === conversation.id)) {
      setConversations(sortConversations([conversation, ...list]));
    }
  };

  const inboxContent = (
    <InboxPanel
      search={inboxSearch}
      onSearchChange={setInboxSearch}
      filter={inboxFilter}
      onFilterChange={setInboxFilter}
      filterCounts={inboxFilterCounts}
      onNewMessage={() => setNewMessageOpen(true)}
      onNewGroup={SHOW_GROUP_CHAT ? () => setCreateGroupOpen(true) : undefined}
      pendingInvites={
        pendingIncomingInvites.length > 0 ? (
          <InboxPendingGuestInvites
            invites={pendingIncomingInvites}
            actingId={inviteActionId}
            onAccept={(inviteId) => void handleAcceptGuestInvite(inviteId)}
            onDecline={(inviteId) => void handleDeclineGuestInvite(inviteId)}
          />
        ) : null
      }
    >
      {loadingList || openingUser ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : inboxFilter === 'temporary' ? (
        filteredTemporaryInboxWithoutIncoming.length === 0 && pendingIncomingInvites.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[var(--msg-muted)]">
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
      ) : filteredConversations.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-[var(--msg-muted)]">
          {inboxSearch.trim()
            ? 'No conversations match your search.'
            : inboxFilter !== 'all'
              ? 'No conversations match this filter.'
              : 'No conversations yet. Start one from a profile or with “New message”.'}
        </p>
      ) : (
        <ul role="listbox" aria-label="Conversations" className="flex flex-col gap-0.5 py-1">
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
    </InboxPanel>
  );

  const conversationContent = activeChatContext ? (
    <DiscussionChatPanel
      conversationId={activeChatContext.id}
      title={activeChatContext.title}
      partnerAvatarUrl={activeChatContext.partnerAvatarUrl}
      partnerUserId={activeChatContext.partnerUserId}
      conversationType={activeChatContext.conversationType}
      readOnlyGuestHistory={activeChatContext.readOnlyGuestHistory}
      showComposer={!activeChatContext.readOnlyGuestHistory}
      detailsOpen={detailsOpen}
      onToggleDetails={toggleDetails}
      onBack={handleBackToInbox}
      onConversationUpdated={handleConversationUpdated}
      onConversationRead={handleConversationRead}
      onGuestSessionEnded={handleGuestSessionEnded}
      incomingDeliveryReceipt={
        lastDeliveryConversationId === activeChatContext.id ? lastDeliveryReceipt : null
      }
      incomingReadReceipt={lastReadConversationId === activeChatContext.id ? lastReadReceipt : null}
    />
  ) : (
    <EmptyConversation onNewMessage={() => setNewMessageOpen(true)} />
  );

  return (
    <DashboardHomeShell wide fullWidth fillViewport>
      {SHOW_GROUP_CHAT && createGroupOpen && (
        <CreateGroupModal
          open
          currentUserId={user?.id}
          onClose={() => setCreateGroupOpen(false)}
          onCreated={(group) => void handleGroupCreated(group)}
        />
      )}
      <NewMessageModal
        key={newMessageOpen ? 'new-message-open' : 'new-message-closed'}
        open={newMessageOpen}
        currentUserId={user?.id}
        onClose={() => setNewMessageOpen(false)}
        onStarted={(conversation) => void handleNewMessageStarted(conversation)}
      />
      {error ? (
        <div className="shrink-0 px-3 pt-2">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      ) : null}

      <MessageLayout
        showConversationMobile={Boolean(activeChatContext)}
        detailsOpen={detailsOpen && Boolean(selectedConversation)}
        onCloseDetails={() => setDetailsOpen(false)}
        inbox={inboxContent}
        conversation={conversationContent}
        details={
          selectedConversation ? (
            <DiscussionDetailsPanel
              key={selectedConversation.id}
              embedded
              conversation={selectedConversation}
              onClose={() => setDetailsOpen(false)}
              onConversationUpdated={handleConversationUpdated}
            />
          ) : null
        }
      />
    </DashboardHomeShell>
  );
}
