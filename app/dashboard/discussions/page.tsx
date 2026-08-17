'use client';

import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { DiscussionChatPanel } from '@/components/messaging/DiscussionChatPanel';
import { DiscussionDetailsPanel } from '@/components/messaging/DiscussionDetailsPanel';
import { EmptyConversation } from '@/components/messaging/EmptyConversation';
import { InboxConversationRow } from '@/components/messaging/InboxConversationRow';
import { InboxFollowersModal } from '@/components/messaging/InboxFollowersModal';
import { InboxFollowersStrip } from '@/components/messaging/InboxFollowersStrip';
import { InboxPanel, type InboxFilterId } from '@/components/messaging/InboxPanel';
import { InboxPendingGuestInvites } from '@/components/messaging/InboxPendingGuestInvites';
import { InboxTemporarySection } from '@/components/messaging/InboxTemporarySection';
import { TemporaryGuestAvatarStrip } from '@/components/messaging/TemporaryGuestAvatarStrip';
import { MessageLayout } from '@/components/messaging/MessageLayout';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import { listCreatorProfileFollowers, type CreatorProfileFollowerItem } from '@/lib/creator-profile-followers-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import {
  DASHBOARD_SIDEBAR_EXPAND_EVENT,
  notifyMessagingDetailsOpen,
} from '@/lib/dashboard-chrome';
import {
  acceptDirectGuestInvite,
  archiveConversation,
  cancelOutgoingGuestInvite,
  createOrGetConversation,
  declineDirectGuestInvite,
  dismissTemporaryInboxEntry,
  hideConversationFromInbox,
  listConversationMessages,
  listConversations,
  listPendingGuestInvites,
  listTemporaryInbox,
  markConversationUnread,
  unarchiveConversation,
} from '@/lib/messaging';
import { formatMessagePreview } from '@/lib/messaging-preview';
import { SHOW_GROUP_CHAT } from '@/lib/messaging-feature-flags';
import { useDiscussionsInboxRealtime } from '@/hooks/useDiscussionsInboxRealtime';
import { usePresence } from '@/hooks/usePresence';
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
  /** Isolated temporary guest room — allowed even when group chat UI is off. */
  temporarySession?: boolean;
};

type InboxConfirmAction =
  | {
      type: 'archive' | 'delete';
      conversationId: string;
      conversationName: string;
    }
  | {
      type: 'dismiss-temporary';
      entry: TemporaryInboxEntry;
    };

function isGuestConversation(conversation: ConversationSummary): boolean {
  return conversation.guestSession === true;
}

function isTemporarySessionConversation(conversation: ConversationSummary): boolean {
  return conversation.temporarySession === true;
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
    case 'archived':
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
    temporarySession: Boolean(conversation.temporarySession),
  };
}

export default function DiscussionsPage() {
  const { user } = useAuth();
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
      {/* Remount inbox state whenever the authenticated identity changes. */}
      <DiscussionsPageContent key={user?.id ?? 'anonymous'} />
    </Suspense>
  );
}

function DiscussionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, hasRole } = useAuth();
  const isCreator = hasRole('ROLE_CREATOR');
  const targetUserId = searchParams.get('user');
  const targetConversationId = searchParams.get('conversation');
  const filterParam = searchParams.get('filter');

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<ConversationSummary[]>([]);
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
  const [dismissingTemporaryKey, setDismissingTemporaryKey] = useState<string | null>(null);
  const [menuActionId, setMenuActionId] = useState<string | null>(null);
  const [inboxConfirm, setInboxConfirm] = useState<InboxConfirmAction | null>(null);
  const [inboxFollowers, setInboxFollowers] = useState<CreatorProfileFollowerItem[]>([]);
  const [inboxFollowersLoading, setInboxFollowersLoading] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [openingFollowerId, setOpeningFollowerId] = useState<string | null>(null);
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
  /**
   * Optimistic inbox select updates openContext before the URL (?conversation=)
   * catches up. Without this guard, the URL-sync effect snaps back to the previous
   * thread (stale searchParams) → double load / flash of the old discussion.
   */
  const pendingOpenConversationIdRef = useRef<string | null>(null);
  /** Ignore stale listConversations responses after rapid refresh / identity change. */
  const conversationsFetchGenRef = useRef(0);
  const authUserIdRef = useRef(user?.id ?? null);
  authUserIdRef.current = user?.id ?? null;

  useLayoutEffect(() => {
    // Never paint the previous account's inbox while a new session is resolving.
    setConversations([]);
    setArchivedConversations([]);
    setTemporaryInbox([]);
    setPendingIncomingInvites([]);
    setOpenContext(null);
    setTypingByConversationId({});
    setDeliveryReceiptsByConversation({});
    setLastDeliveryReceipt(null);
    setLastDeliveryConversationId(null);
    setLastReadReceipt(null);
    setLastReadConversationId(null);
    setLoadingList(true);
    conversationsFetchGenRef.current += 1;
  }, [user?.id]);

  useEffect(() => {
    if (!SHOW_GROUP_CHAT && inboxFilter === 'groups') {
      setInboxFilter('all');
    }
  }, [inboxFilter]);

  useEffect(() => {
    if (!SHOW_GROUP_CHAT && openContext?.conversationType === 'GROUP' && !openContext.temporarySession) {
      setOpenContext(null);
    }
  }, [openContext?.conversationType, openContext?.temporarySession]);

  useEffect(() => {
    if (!openContext) setDetailsOpen(false);
  }, [openContext]);

  useEffect(() => {
    if (filterParam === 'temporary') {
      setInboxFilter('temporary');
    }
  }, [filterParam]);

  const refreshConversations = useCallback(async () => {
    const forUserId = authUserIdRef.current;
    if (!forUserId) {
      setConversations([]);
      setArchivedConversations([]);
      return [];
    }
    const fetchGen = ++conversationsFetchGenRef.current;
    try {
      setError(null);
      const [list, archived] = await Promise.all([
        listConversations(),
        listConversations({ archived: true }),
      ]);
      if (fetchGen !== conversationsFetchGenRef.current || authUserIdRef.current !== forUserId) {
        return list;
      }
      setConversations(sortConversations(list));
      setArchivedConversations(sortConversations(archived));
      return list;
    } catch (e) {
      if (fetchGen === conversationsFetchGenRef.current && authUserIdRef.current === forUserId) {
        setError(getApiErrorMessage(e, 'Unable to load conversations.'));
        setConversations([]);
        setArchivedConversations([]);
      }
      return [];
    }
  }, []);

  const refreshTemporaryInbox = useCallback(async () => {
    const forUserId = user?.id;
    if (!forUserId) {
      setTemporaryInbox([]);
      setPendingIncomingInvites([]);
      return;
    }
    const [entries, invites] = await Promise.all([
      listTemporaryInbox().catch(() => [] as TemporaryInboxEntry[]),
      listPendingGuestInvites().catch(() => [] as PendingConversationInvite[]),
    ]);
    if (authUserIdRef.current !== forUserId) return;
    setTemporaryInbox(entries);
    setPendingIncomingInvites(invites);
  }, [user?.id]);

  const refreshInboxFollowers = useCallback(async () => {
    if (!user?.id || !isCreator) {
      setInboxFollowers([]);
      setInboxFollowersLoading(false);
      return;
    }
    setInboxFollowersLoading(true);
    try {
      const page = await listCreatorProfileFollowers(0, 24);
      if (authUserIdRef.current !== user.id) return;
      setInboxFollowers(page.content);
    } catch {
      if (authUserIdRef.current === user.id) {
        setInboxFollowers([]);
      }
    } finally {
      if (authUserIdRef.current === user.id) {
        setInboxFollowersLoading(false);
      }
    }
  }, [user?.id, isCreator]);

  useEffect(() => {
    void refreshInboxFollowers();
  }, [refreshInboxFollowers]);

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

  const conversationIds = useMemo(
    () => [
      ...conversations.map((conversation) => conversation.id),
      ...archivedConversations.map((conversation) => conversation.id),
    ],
    [conversations, archivedConversations]
  );

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
    if (!user?.id) {
      setLoadingList(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      await Promise.all([refreshConversations(), refreshTemporaryInbox()]);
      if (!cancelled && authUserIdRef.current === user.id) setLoadingList(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, refreshConversations, refreshTemporaryInbox]);

  // Sync open thread from URL + inbox list. Do NOT close Details here:
  // `conversations` refreshes often (realtime / unread), which was auto-closing Details.
  useEffect(() => {
    if (!targetConversationId) return;

    // URL still lagging behind an optimistic click — keep the new thread.
    if (
      pendingOpenConversationIdRef.current &&
      pendingOpenConversationIdRef.current !== targetConversationId
    ) {
      return;
    }
    if (pendingOpenConversationIdRef.current === targetConversationId) {
      pendingOpenConversationIdRef.current = null;
    }

    const conversation =
      conversations.find((item) => item.id === targetConversationId) ??
      archivedConversations.find((item) => item.id === targetConversationId);
    if (conversation) {
      setOpenContext((prev) => {
        const next = buildOpenChatContext(conversation);
        if (
          prev &&
          prev.id === next.id &&
          prev.title === next.title &&
          prev.partnerAvatarUrl === next.partnerAvatarUrl &&
          prev.partnerUserId === next.partnerUserId &&
          prev.conversationType === next.conversationType &&
          prev.readOnlyGuestHistory === next.readOnlyGuestHistory &&
          Boolean(prev.temporarySession) === Boolean(next.temporarySession)
        ) {
          return prev;
        }
        return next;
      });
      return;
    }

    const temporaryEntry = temporaryInbox.find(
      (entry) =>
        entry.conversationId === targetConversationId &&
        (entry.entryType === 'ACTIVE_GUEST' || entry.entryType === 'ENDED_GUEST') &&
        entry.canOpen
    );
    if (!temporaryEntry) return;
    setOpenContext((prev) => {
      const next: OpenChatContext = {
        id: temporaryEntry.conversationId,
        title: temporaryEntry.conversationTitle,
        partnerAvatarUrl: temporaryEntry.avatarUrl,
        conversationType: 'GROUP',
        readOnlyGuestHistory: temporaryEntry.entryType === 'ENDED_GUEST',
        temporarySession: true,
      };
      if (
        prev &&
        prev.id === next.id &&
        prev.title === next.title &&
        prev.partnerAvatarUrl === next.partnerAvatarUrl &&
        prev.conversationType === next.conversationType &&
        prev.readOnlyGuestHistory === next.readOnlyGuestHistory &&
        prev.temporarySession
      ) {
        return prev;
      }
      return next;
    });
  }, [targetConversationId, conversations, archivedConversations, temporaryInbox]);

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
        pendingOpenConversationIdRef.current = conversation.id;
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
    () =>
      conversations.find((c) => c.id === openContext?.id) ??
      archivedConversations.find((c) => c.id === openContext?.id) ??
      null,
    [conversations, archivedConversations, openContext?.id]
  );

  const activeChatContext = openContext;

  useEffect(() => {
    if (!openContext?.id) return;
    // Avoid wiping a just-opened Discuss thread while the inbox list is still loading.
    if (loadingList || openingUser) return;
    if (openContext.temporarySession) return;
    if (temporaryInbox.some((entry) => entry.conversationId === openContext.id && entry.canOpen)) {
      return;
    }
    if (!conversations.some((conversation) => conversation.id === openContext.id)) {
      setOpenContext(null);
    }
  }, [conversations, temporaryInbox, openContext, loadingList, openingUser]);

  const permanentConversations = useMemo(
    () =>
      conversations.filter(
        (conversation) =>
          !isGuestConversation(conversation) &&
          !isTemporarySessionConversation(conversation) &&
          (SHOW_GROUP_CHAT || conversation.type !== 'GROUP')
      ),
    [conversations]
  );

  const activeTemporaryEntries = useMemo(
    () =>
      temporaryInbox.filter(
        (entry) => entry.entryType === 'ACTIVE_GUEST' && entry.canOpen
      ),
    [temporaryInbox]
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
      archived: archivedConversations.filter(
        (c) =>
          !isGuestConversation(c) && (SHOW_GROUP_CHAT || c.type !== 'GROUP')
      ).length,
    }),
    [
      permanentConversations,
      temporaryInbox.length,
      pendingIncomingInvites.length,
      archivedConversations,
    ]
  );

  const filteredConversations = useMemo(() => {
    const query = inboxSearch.trim().toLowerCase();
    const source =
      inboxFilter === 'archived'
        ? archivedConversations.filter(
            (conversation) =>
              !isGuestConversation(conversation) &&
              (SHOW_GROUP_CHAT || conversation.type !== 'GROUP')
          )
        : permanentConversations.filter((conversation) =>
            matchesInboxFilter(conversation, inboxFilter)
          );
    return source.filter((conversation) => {
      if (!query) return true;
      const name = conversation.otherUserName?.toLowerCase() ?? '';
      const preview = conversation.lastMessagePreview?.toLowerCase() ?? '';
      return name.includes(query) || preview.includes(query);
    });
  }, [permanentConversations, archivedConversations, inboxSearch, inboxFilter]);

  const inboxPresenceUserIds = useMemo(
    () =>
      filteredConversations
        .filter((conversation) => conversation.type !== 'GROUP' && conversation.otherUserId)
        .map((conversation) => conversation.otherUserId),
    [filteredConversations]
  );
  const { isOnline: isPartnerOnline } = usePresence(inboxPresenceUserIds);

  const handleSelectConversation = (conversationId: string) => {
    const conversation =
      conversations.find((item) => item.id === conversationId) ??
      archivedConversations.find((item) => item.id === conversationId);
    if (conversation) {
      // Mark optimistic target before URL updates — prevents stale ?conversation= snap-back.
      pendingOpenConversationIdRef.current = conversationId;
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
    setArchivedConversations((prev) =>
      prev.map((item) =>
        item.id === conversationId ? { ...item, unreadCount: 0 } : item
      )
    );
    setDetailsOpen(false);
  };

  const handleOpenTemporaryConversation = (entry: TemporaryInboxEntry) => {
    pendingOpenConversationIdRef.current = entry.conversationId;
    setOpenContext({
      id: entry.conversationId,
      title: entry.conversationTitle,
      partnerAvatarUrl: entry.avatarUrl,
      conversationType: 'GROUP',
      readOnlyGuestHistory: entry.entryType === 'ENDED_GUEST',
      temporarySession: true,
    });
    setDetailsOpen(false);
    if (entry.canOpen && entry.entryType !== 'ENDED_GUEST') {
      router.replace(
        `/dashboard/discussions?conversation=${encodeURIComponent(entry.conversationId)}`,
        { scroll: false }
      );
    }
  };

  const handleBackToInbox = () => {
    pendingOpenConversationIdRef.current = null;
    setOpenContext(null);
    setDetailsOpen(false);
    router.replace('/dashboard/discussions', { scroll: false });
  };

  const toggleDetails = () => {
    const willOpen = !detailsOpen;
    setDetailsOpen(willOpen);
    if (willOpen) {
      notifyMessagingDetailsOpen();
    }
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

  const requestDismissTemporaryEntry = (entry: TemporaryInboxEntry) => {
    setInboxConfirm({ type: 'dismiss-temporary', entry });
  };

  const handleDismissTemporaryEntry = async (entry: TemporaryInboxEntry) => {
    const entryKey = `${entry.entryType}-${entry.id}`;
    setDismissingTemporaryKey(entryKey);
    setError(null);
    try {
      await dismissTemporaryInboxEntry(entry.entryType, entry.id);
      if (openContext?.id === entry.conversationId) {
        setOpenContext(null);
      }
      await refreshTemporaryInbox();
      if (entry.entryType === 'ACTIVE_GUEST') {
        await refreshConversations();
      }
      pushFlashFeedback({
        variant: 'success',
        title: 'Temporary entry deleted',
      });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to delete temporary entry.'));
      pushFlashFeedback({
        variant: 'error',
        title: 'Unable to delete temporary entry',
      });
    } finally {
      setDismissingTemporaryKey(null);
      setInboxConfirm(null);
    }
  };

  const resolveConversationName = (conversationId: string) => {
    const found =
      conversations.find((item) => item.id === conversationId) ??
      archivedConversations.find((item) => item.id === conversationId);
    return found?.otherUserName?.trim() || 'this conversation';
  };

  const requestDeleteConversation = (conversationId: string) => {
    setInboxConfirm({
      type: 'delete',
      conversationId,
      conversationName: resolveConversationName(conversationId),
    });
  };

  const requestArchiveConversation = (conversationId: string) => {
    setInboxConfirm({
      type: 'archive',
      conversationId,
      conversationName: resolveConversationName(conversationId),
    });
  };

  const handleDeleteConversation = async (conversationId: string) => {
    setMenuActionId(conversationId);
    setError(null);
    try {
      await hideConversationFromInbox(conversationId);
      setConversations((prev) => prev.filter((item) => item.id !== conversationId));
      setArchivedConversations((prev) => prev.filter((item) => item.id !== conversationId));
      if (openContext?.id === conversationId) {
        setOpenContext(null);
      }
      await refreshConversations();
      pushFlashFeedback({
        variant: 'success',
        title: 'Conversation deleted',
      });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to delete conversation.'));
      pushFlashFeedback({
        variant: 'error',
        title: 'Unable to delete conversation',
      });
    } finally {
      setMenuActionId(null);
      setInboxConfirm(null);
    }
  };

  const handleMarkConversationUnread = async (conversationId: string) => {
    setMenuActionId(conversationId);
    setError(null);
    try {
      await markConversationUnread(conversationId);
      const bumpUnread = (list: ConversationSummary[]) =>
        list.map((item) =>
          item.id === conversationId
            ? { ...item, unreadCount: Math.max(1, item.unreadCount ?? 0) }
            : item
        );
      setConversations((prev) => bumpUnread(prev));
      setArchivedConversations((prev) => bumpUnread(prev));
      await refreshConversations();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to mark conversation as unread.'));
    } finally {
      setMenuActionId(null);
    }
  };

  const handleArchiveConversation = async (conversationId: string) => {
    setMenuActionId(conversationId);
    setError(null);
    try {
      await archiveConversation(conversationId);
      const moving = conversations.find((item) => item.id === conversationId);
      setConversations((prev) => prev.filter((item) => item.id !== conversationId));
      if (moving) {
        setArchivedConversations((prev) =>
          sortConversations([{ ...moving, archived: true }, ...prev.filter((item) => item.id !== conversationId)])
        );
      }
      if (openContext?.id === conversationId) {
        setOpenContext(null);
      }
      await refreshConversations();
      pushFlashFeedback({
        variant: 'success',
        title: 'Conversation archived',
      });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to archive conversation.'));
      pushFlashFeedback({
        variant: 'error',
        title: 'Unable to archive conversation',
      });
    } finally {
      setMenuActionId(null);
      setInboxConfirm(null);
    }
  };

  const handleUnarchiveConversation = async (conversationId: string) => {
    setMenuActionId(conversationId);
    setError(null);
    try {
      await unarchiveConversation(conversationId);
      const moving = archivedConversations.find((item) => item.id === conversationId);
      setArchivedConversations((prev) => prev.filter((item) => item.id !== conversationId));
      if (moving) {
        setConversations((prev) =>
          sortConversations([{ ...moving, archived: false }, ...prev.filter((item) => item.id !== conversationId)])
        );
      }
      await refreshConversations();
      pushFlashFeedback({
        variant: 'success',
        title: 'Conversation restored',
      });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to unarchive conversation.'));
      pushFlashFeedback({
        variant: 'error',
        title: 'Unable to restore conversation',
      });
    } finally {
      setMenuActionId(null);
    }
  };

  const confirmInboxAction = () => {
    if (!inboxConfirm) return;
    if (inboxConfirm.type === 'dismiss-temporary') {
      if (dismissingTemporaryKey) return;
      void handleDismissTemporaryEntry(inboxConfirm.entry);
      return;
    }
    if (menuActionId) return;
    if (inboxConfirm.type === 'delete') {
      void handleDeleteConversation(inboxConfirm.conversationId);
      return;
    }
    void handleArchiveConversation(inboxConfirm.conversationId);
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
    pendingOpenConversationIdRef.current = conversation.id;
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

  const handleOpenFollower = async (follower: CreatorProfileFollowerItem) => {
    if (!follower.followerUserId || openingFollowerId) return;
    setOpeningFollowerId(follower.followerUserId);
    setError(null);
    try {
      const conversation = await createOrGetConversation(follower.followerUserId);
      setFollowersModalOpen(false);
      await handleNewMessageStarted(conversation);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to start conversation.'));
    } finally {
      setOpeningFollowerId(null);
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
      temporaryAvatars={
        inboxFilter !== 'temporary' && activeTemporaryEntries.length > 0 ? (
          <TemporaryGuestAvatarStrip
            entries={activeTemporaryEntries}
            selectedConversationId={openContext?.id}
            onOpen={handleOpenTemporaryConversation}
          />
        ) : null
      }
      footer={
        isCreator ? (
          <InboxFollowersStrip
            followers={inboxFollowers}
            loading={inboxFollowersLoading}
            openingUserId={openingFollowerId}
            onSeeAll={() => setFollowersModalOpen(true)}
            onOpenFollower={(follower) => void handleOpenFollower(follower)}
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
            dismissingEntryKey={dismissingTemporaryKey}
            onAcceptInvite={(inviteId) => void handleAcceptGuestInvite(inviteId)}
            onDeclineInvite={(inviteId) => void handleDeclineGuestInvite(inviteId)}
            onCancelInvite={(conversationId, inviteId) =>
              void handleCancelOutgoingInvite(conversationId, inviteId)
            }
            onOpenConversation={handleOpenTemporaryConversation}
            onDismissEntry={requestDismissTemporaryEntry}
          />
        )
      ) : filteredConversations.length === 0 ? (
        activeTemporaryEntries.length > 0 && inboxFilter === 'all' ? null : (
          <p className="px-4 py-8 text-center text-sm text-[var(--msg-muted)]">
            {inboxSearch.trim()
              ? 'No conversations match your search.'
              : inboxFilter === 'archived'
                ? 'No archived conversations.'
                : inboxFilter !== 'all'
                  ? 'No conversations match this filter.'
                  : 'No conversations yet. Start one from a profile or with “New message”.'}
          </p>
        )
      ) : (
        <ul role="listbox" aria-label="Conversations" className="flex flex-col gap-0.5 py-1">
          {filteredConversations.map((conversation) => (
            <InboxConversationRow
              key={conversation.id}
              conversation={conversation}
              selected={conversation.id === openContext?.id}
              currentUserId={user?.id}
              partnerOnline={
                conversation.type === 'GROUP' ? null : isPartnerOnline(conversation.otherUserId)
              }
              typingName={typingByConversationId[conversation.id]}
              deliveredUserIds={
                conversation.lastMessageId
                  ? deliveryReceiptsByConversation[conversation.id]?.[conversation.lastMessageId]
                  : undefined
              }
              onSelect={handleSelectConversation}
              onMarkUnread={(id) => void handleMarkConversationUnread(id)}
              onArchive={requestArchiveConversation}
              onUnarchive={(id) => void handleUnarchiveConversation(id)}
              onDelete={requestDeleteConversation}
              menuBusy={menuActionId === conversation.id}
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
      temporarySession={activeChatContext.temporarySession}
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
      <InboxFollowersModal
        open={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        selectingUserId={openingFollowerId}
        onSelectFollower={(follower) => void handleOpenFollower(follower)}
      />
      <ConfirmDialog
        open={Boolean(inboxConfirm)}
        title={
          inboxConfirm?.type === 'dismiss-temporary'
            ? 'Delete this temporary entry?'
            : inboxConfirm?.type === 'delete'
              ? 'Delete this conversation?'
              : 'Archive this conversation?'
        }
        description={
          inboxConfirm?.type === 'dismiss-temporary'
            ? `Remove “${inboxConfirm.entry.headline || 'this temporary entry'}” from your temporary inbox?`
            : inboxConfirm?.type === 'delete'
              ? `Remove “${inboxConfirm.conversationName}” from your inbox? This only removes it for you.`
              : `Move “${inboxConfirm?.type === 'archive' ? inboxConfirm.conversationName : 'this conversation'}” to Archived. You can find it again anytime.`
        }
        confirmLabel={
          inboxConfirm?.type === 'archive' ? 'Archive' : 'Delete'
        }
        cancelLabel="Cancel"
        tone={inboxConfirm?.type === 'archive' ? 'brand' : 'danger'}
        busy={Boolean(menuActionId) || Boolean(dismissingTemporaryKey)}
        onCancel={() => {
          if (!menuActionId && !dismissingTemporaryKey) setInboxConfirm(null);
        }}
        onConfirm={confirmInboxAction}
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
