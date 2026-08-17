'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Client, IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken, onAccessTokenChange } from '@/lib/accessToken';
import { getApiErrorMessage } from '@/lib/api-error';
import { isConversationAccessDenied } from '@/lib/messaging-access';
import {
  cancelOutgoingGuestInvite,
  leaveConversationAsGuest,
  listConversationGuests,
  listConversationMessages,
  listConversationParticipants,
  listOutgoingGuestInvites,
  markConversationRead,
  normalizeDirectMessage,
  revokeConversationGuest,
  deleteConversationMessage,
  sendFileMessage,
  startCall,
} from '@/lib/messaging';
import { getSockJsEndpoint } from '@/lib/ws-url';
import type {
  CallSession,
  CallType,
  ConversationParticipant,
  ConversationGuestSession,
  ConversationReadReceipt,
  ConversationType,
  DirectMessage,
  MessageDeliveryReceipt,
  OutgoingGuestInvite,
  TypingIndicator,
} from '@/types/messaging';
import { useAuth } from '@/context/AuthContext';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { DiscussionCallPanel } from '@/components/messaging/DiscussionCallPanel';
import { type MessageStatusType } from '@/components/messaging/MessageStatusIndicator';
import { ConversationHeader } from '@/components/messaging/conversation/ConversationHeader';
import {
  MessageComposer,
  type ComposerPendingFile,
} from '@/components/messaging/conversation/MessageComposer';
import { MessageTimeline } from '@/components/messaging/conversation/MessageTimeline';
import { GuestSessionTraceMenu } from '@/components/messaging/GuestSessionTraceMenu';
import { PendingGuestInviteStrip } from '@/components/messaging/PendingGuestInviteStrip';
import { filterGuestSessionTraces } from '@/lib/guest-session-trace';
import { clearAttachmentLoadFailuresForConversation } from '@/lib/messaging-attachments';
import { removePinnedMessage } from '@/lib/discussion-pins';
import { SHOW_CALL_BUTTONS, SHOW_GROUP_CHAT } from '@/lib/messaging-feature-flags';

const AddGroupMemberModal = dynamic(
  () => import('@/components/messaging/AddGroupMemberModal').then((module) => module.AddGroupMemberModal),
  { ssr: false }
);

const TransferMessageModal = dynamic(
  () => import('@/components/messaging/TransferMessageModal').then((module) => module.TransferMessageModal),
  { ssr: false }
);

const TemporaryGuestInviteModal = dynamic(
  () =>
    import('@/components/messaging/TemporaryGuestInviteModal').then(
      (module) => module.TemporaryGuestInviteModal
    ),
  { ssr: false }
);

interface DiscussionChatPanelProps {
  conversationId: string;
  title?: string;
  partnerAvatarUrl?: string | null;
  partnerUserId?: string | null;
  conversationType?: ConversationType;
  showComposer?: boolean;
  readOnlyGuestHistory?: boolean;
  temporarySession?: boolean;
  detailsOpen?: boolean;
  onToggleDetails?: () => void;
  onBack?: () => void;
  onConversationUpdated?: () => void;
  onConversationRead?: (conversationId: string) => void;
  onGuestSessionEnded?: () => void;
  incomingDeliveryReceipt?: MessageDeliveryReceipt | null;
  incomingReadReceipt?: ConversationReadReceipt | null;
}

function parseRealtimeTimestamp(value: string | unknown): string {
  if (typeof value === 'string' && value.trim()) return value;
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value as number[];
    const date = new Date(year, month - 1, day, hour, minute, second);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return new Date().toISOString();
}

function isNearBottom(container: HTMLElement, threshold = 80): boolean {
  const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
  return distanceFromBottom < threshold;
}

function sortBySentAt(a: DirectMessage, b: DirectMessage): number {
  return new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
}

function isMessageSeenByOthers(
  message: DirectMessage,
  participants: ConversationParticipant[],
  currentUserId: string | undefined
): boolean {
  if (!currentUserId) return false;
  const others = participants.filter((participant) => participant.userId !== currentUserId);
  if (others.length === 0) return false;
  const sentAt = new Date(message.sentAt).getTime();
  if (Number.isNaN(sentAt)) return false;
  return others.every((participant) => {
    if (!participant.lastReadAt) return false;
    const readAt = new Date(participant.lastReadAt).getTime();
    return !Number.isNaN(readAt) && readAt >= sentAt;
  });
}

function isMessageDeliveredToOthers(
  message: DirectMessage,
  deliveredReceipts: Map<string, Set<string>>,
  participants: ConversationParticipant[],
  currentUserId: string | undefined
): boolean {
  if (!currentUserId || !message.id) return false;
  const others = participants.filter((participant) => participant.userId !== currentUserId);
  if (others.length === 0) return false;
  const deliveredUsers = deliveredReceipts.get(message.id) ?? new Set<string>();
  return others.every((participant) => deliveredUsers.has(participant.userId));
}

function getOutgoingMessageStatusType(
  message: DirectMessage,
  showStatus: boolean,
  sending: boolean,
  participants: ConversationParticipant[],
  deliveredReceipts: Map<string, Set<string>>,
  currentUserId: string | undefined
): MessageStatusType | null {
  if (!showStatus) return null;
  if (sending) return 'sending';
  if (isMessageSeenByOthers(message, participants, currentUserId)) return 'seen';
  if (isMessageDeliveredToOthers(message, deliveredReceipts, participants, currentUserId)) return 'delivered';
  if (message.id) return 'sent';
  return 'sent';
}

function HeaderIcon({ children }: { children: ReactNode }) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      {children}
    </svg>
  );
}

function PhoneIcon() {
  return (
    <HeaderIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </HeaderIcon>
  );
}

function VideoIcon() {
  return (
    <HeaderIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </HeaderIcon>
  );
}

export function DiscussionChatPanel({
  conversationId,
  title = 'Chat',
  partnerAvatarUrl = null,
  partnerUserId = null,
  conversationType = 'DIRECT',
  showComposer = true,
  readOnlyGuestHistory = false,
  temporarySession = false,
  detailsOpen = false,
  onToggleDetails,
  onBack,
  onConversationUpdated,
  onConversationRead,
  onGuestSessionEnded,
  incomingDeliveryReceipt = null,
  incomingReadReceipt = null,
}: DiscussionChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [noToken, setNoToken] = useState(false);
  const [guestInviteOpen, setGuestInviteOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [transferMessage, setTransferMessage] = useState<DirectMessage | null>(null);
  const [pendingFiles, setPendingFiles] = useState<ComposerPendingFile[]>([]);
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [activeGuests, setActiveGuests] = useState<ConversationGuestSession[]>([]);
  const [pendingGuestInvites, setPendingGuestInvites] = useState<OutgoingGuestInvite[]>([]);
  const [guestActionLoading, setGuestActionLoading] = useState(false);
  const [inviteActionLoading, setInviteActionLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(() => new Map());
  const [wsReconnectNonce, setWsReconnectNonce] = useState(0);
  const [deliveredReceipts, setDeliveredReceipts] = useState<Map<string, Set<string>>>(() => new Map());
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [pendingDeleteMessage, setPendingDeleteMessage] = useState<DirectMessage | null>(null);
  const [deletingMessage, setDeletingMessage] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const topicSubsRef = useRef<StompSubscription[]>([]);
  const attachConversationTopicsRef = useRef<(() => void) | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const forceStickToBottomRef = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onConversationUpdatedRef = useRef(onConversationUpdated);
  const onConversationReadRef = useRef(onConversationRead);
  const onGuestSessionEndedRef = useRef(onGuestSessionEnded);
  const historyLoadSeqRef = useRef(0);
  const loadingHistoryRef = useRef(loadingHistory);
  const loadHistoryRef = useRef<((options?: { switching?: boolean }) => Promise<void>) | null>(null);
  const loadActiveGuestsRef = useRef<(() => Promise<void>) | null>(null);
  const loadParticipantsRef = useRef<(() => Promise<void>) | null>(null);
  const loadPendingGuestInvitesRef = useRef<(() => Promise<void>) | null>(null);
  const scheduleInboxRefreshRef = useRef<(() => void) | null>(null);
  const tryMarkAsReadIfAtBottomRef = useRef<(() => void) | null>(null);
  const acknowledgeDeliveryOnceRef = useRef<(messageId: string) => void>(() => {});
  const inboxRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingClearTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastTypingSentRef = useRef(false);
  const deliveredAckSentRef = useRef<Set<string>>(new Set());
  const pendingDeliveryAcksRef = useRef<Set<string>>(new Set());
  const markReadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leavingRef = useRef(false);
  const accessRevokedRef = useRef(false);
  const mountedRef = useRef(true);
  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    onConversationUpdatedRef.current = onConversationUpdated;
    onConversationReadRef.current = onConversationRead;
    onGuestSessionEndedRef.current = onGuestSessionEnded;
  }, [onConversationUpdated, onConversationRead, onGuestSessionEnded]);

  useEffect(() => {
    loadingHistoryRef.current = loadingHistory;
  }, [loadingHistory]);

  const scheduleInboxRefresh = useCallback(() => {
    if (inboxRefreshTimerRef.current) clearTimeout(inboxRefreshTimerRef.current);
    inboxRefreshTimerRef.current = setTimeout(() => {
      onConversationUpdatedRef.current?.();
      inboxRefreshTimerRef.current = null;
    }, 400);
  }, []);

  const notifyConversationRead = useCallback(
    async (id: string) => {
      if (readOnlyGuestHistory) return;
      try {
        await markConversationRead(id);
      } catch (e) {
        if (isConversationAccessDenied(e)) return;
        throw e;
      }
      const readAt = new Date().toISOString();
      if (user?.id) {
        setParticipants((prev) =>
          prev.map((participant) =>
            participant.userId === user.id ? { ...participant, lastReadAt: readAt } : participant
          )
        );
      }
      onConversationReadRef.current?.(id);
      scheduleInboxRefresh();
    },
    [readOnlyGuestHistory, scheduleInboxRefresh, user?.id]
  );

  const tryMarkAsReadIfAtBottom = useCallback(() => {
    if (readOnlyGuestHistory) return;
    const container = scrollContainerRef.current;
    if (!container || loadingHistoryRef.current) return;
    if (!isNearBottom(container)) return;

    if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
    markReadTimerRef.current = setTimeout(() => {
      const current = scrollContainerRef.current;
      if (current && isNearBottom(current)) {
        void notifyConversationRead(conversationId);
      }
      markReadTimerRef.current = null;
    }, 400);
  }, [conversationId, notifyConversationRead, readOnlyGuestHistory]);

  const acknowledgeDelivery = useCallback(
    (messageId: string) => {
      if (!messageId || leavingRef.current) return;
      const client = clientRef.current;
      if (!client?.connected) {
        pendingDeliveryAcksRef.current.add(messageId);
        return;
      }
      try {
        client.publish({
          destination: `/app/conversations/${conversationId}/delivered`,
          body: JSON.stringify({ messageId }),
        });
      } catch {
        /* ignore publish errors while disconnecting */
      }
    },
    [conversationId]
  );

  const flushPendingDeliveryAcks = useCallback(() => {
    if (leavingRef.current) return;
    const client = clientRef.current;
    if (!client?.connected || pendingDeliveryAcksRef.current.size === 0) return;
    for (const messageId of Array.from(pendingDeliveryAcksRef.current)) {
      try {
        client.publish({
          destination: `/app/conversations/${conversationId}/delivered`,
          body: JSON.stringify({ messageId }),
        });
      } catch {
        /* ignore publish errors while disconnecting */
      }
    }
    pendingDeliveryAcksRef.current.clear();
  }, [conversationId]);

  const acknowledgeDeliveryOnce = useCallback(
    (messageId: string) => {
      if (!messageId || deliveredAckSentRef.current.has(messageId)) return;
      deliveredAckSentRef.current.add(messageId);
      acknowledgeDelivery(messageId);
    },
    [acknowledgeDelivery]
  );

  const acknowledgeAllIncomingDeliveries = useCallback(
    (items: DirectMessage[]) => {
      if (!user?.id) return;
      for (const message of items) {
        if (message.messageType === 'SYSTEM' || message.senderId === user.id) continue;
        acknowledgeDeliveryOnce(message.id);
      }
    },
    [acknowledgeDeliveryOnce, user?.id]
  );

  const recordDeliveryReceipt = useCallback((messageId: string, userId: string) => {
    setDeliveredReceipts((prev) => {
      const next = new Map(prev);
      const deliveredUsers = new Set(next.get(messageId) ?? []);
      deliveredUsers.add(userId);
      next.set(messageId, deliveredUsers);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!incomingDeliveryReceipt) return;
    recordDeliveryReceipt(incomingDeliveryReceipt.messageId, incomingDeliveryReceipt.userId);
  }, [incomingDeliveryReceipt, recordDeliveryReceipt]);

  useEffect(() => {
    if (!incomingReadReceipt) return;
    setParticipants((prev) =>
      prev.map((participant) =>
        participant.userId === incomingReadReceipt.userId
          ? { ...participant, lastReadAt: incomingReadReceipt.readAt }
          : participant
      )
    );
  }, [incomingReadReceipt]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const container = scrollContainerRef.current;
    if (!container) {
      bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
      return;
    }
    const top = container.scrollHeight;
    if (behavior === 'auto') {
      container.scrollTop = top;
      return;
    }
    container.scrollTo({ top, behavior });
  }, []);

  const handleConversationAccessLost = useCallback(() => {
    if (accessRevokedRef.current) return;
    accessRevokedRef.current = true;
    leavingRef.current = true;
    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch {
        /* ignore */
      }
      clientRef.current = null;
    }
    onGuestSessionEndedRef.current?.();
  }, []);

  const loadParticipants = useCallback(async () => {
    if (!conversationId || readOnlyGuestHistory) return;
    try {
      const list = await listConversationParticipants(conversationId);
      setParticipants(list);
    } catch (e) {
      if (isConversationAccessDenied(e)) {
        handleConversationAccessLost();
        return;
      }
      setParticipants([]);
    }
  }, [conversationId, handleConversationAccessLost, readOnlyGuestHistory]);

  const loadActiveGuests = useCallback(async () => {
    if (!conversationId || readOnlyGuestHistory) return;
    try {
      const guests = await listConversationGuests(conversationId);
      setActiveGuests(guests);
    } catch (e) {
      if (isConversationAccessDenied(e)) {
        handleConversationAccessLost();
        return;
      }
      setActiveGuests([]);
    }
  }, [conversationId, handleConversationAccessLost, readOnlyGuestHistory]);

  const loadPendingGuestInvites = useCallback(async () => {
    if (!conversationId || readOnlyGuestHistory) return;
    try {
      const invites = await listOutgoingGuestInvites(conversationId);
      setPendingGuestInvites(invites);
    } catch {
      setPendingGuestInvites([]);
    }
  }, [conversationId, readOnlyGuestHistory]);

  const handleCancelGuestInvite = async (inviteId: string) => {
    setInviteActionLoading(true);
    setError(null);
    try {
      await cancelOutgoingGuestInvite(conversationId, inviteId);
      await loadPendingGuestInvites();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to cancel invite.'));
    } finally {
      setInviteActionLoading(false);
    }
  };

  const handleEndGuestAccess = async (guestUserId: string) => {
    setGuestActionLoading(true);
    setError(null);
    try {
      await revokeConversationGuest(conversationId, guestUserId);
      await Promise.all([loadActiveGuests(), loadParticipants(), loadHistory()]);
      scheduleInboxRefresh();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to end guest access.'));
    } finally {
      setGuestActionLoading(false);
    }
  };

  const handleLeaveAsGuest = async () => {
    setGuestActionLoading(true);
    setError(null);
    leavingRef.current = true;
    if (typingIdleTimerRef.current) clearTimeout(typingIdleTimerRef.current);
    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch {
        /* ignore */
      }
      clientRef.current = null;
    }
    try {
      await leaveConversationAsGuest(conversationId);
      onGuestSessionEnded?.();
      scheduleInboxRefresh();
    } catch (e) {
      leavingRef.current = false;
      setError(getApiErrorMessage(e, 'Unable to leave this conversation.'));
    } finally {
      setGuestActionLoading(false);
    }
  };

  const loadHistory = useCallback(async (options?: { switching?: boolean }) => {
    if (!conversationId) return;
    const switching = options?.switching ?? false;
    const loadSeq = ++historyLoadSeqRef.current;
    try {
      if (switching) {
        setLoadingHistory(true);
        setError(null);
        forceStickToBottomRef.current = true;
        shouldStickToBottomRef.current = true;
      }
      const page = await listConversationMessages(conversationId, 0, 200);
      if (loadSeq !== historyLoadSeqRef.current) return;
      const sorted = [...page.content].sort(sortBySentAt);
      setMessages(sorted);
      acknowledgeAllIncomingDeliveries(sorted);
    } catch (e) {
      if (loadSeq !== historyLoadSeqRef.current) return;
      if (isConversationAccessDenied(e)) {
        handleConversationAccessLost();
        return;
      }
      if (switching) {
        setError(getApiErrorMessage(e, 'Unable to load messages.'));
        setMessages([]);
      }
    } finally {
      if (loadSeq === historyLoadSeqRef.current && switching) {
        setLoadingHistory(false);
      }
    }
  }, [acknowledgeAllIncomingDeliveries, conversationId, handleConversationAccessLost]);

  useEffect(() => {
    return onAccessTokenChange(() => {
      if (accessRevokedRef.current) return;
      setWsReconnectNonce((value) => value + 1);
    });
  }, []);

  useEffect(() => {
    if (!conversationId || loadingHistory) return;
    const interval = window.setInterval(() => {
      void loadParticipants();
      void loadActiveGuests();
      void loadPendingGuestInvites();
    }, 12000);
    return () => window.clearInterval(interval);
  }, [conversationId, loadActiveGuests, loadParticipants, loadPendingGuestInvites, loadingHistory]);

  // Reset + load before paint so the previous thread never flashes under the new header.
  useLayoutEffect(() => {
    leavingRef.current = false;
    accessRevokedRef.current = false;
    clearAttachmentLoadFailuresForConversation(conversationId);
    setMessages((prev) => {
      revokeMessageLocalPreviews(prev);
      return [];
    });
    setInput('');
    setError(null);
    setSending(false);
    setUploading(false);
    setParticipants([]);
    setActiveGuests([]);
    setPendingGuestInvites([]);
    setTypingUsers(new Map());
    setDeliveredReceipts(new Map());
    setActiveCall(null);
    lastTypingSentRef.current = false;
    deliveredAckSentRef.current = new Set();
    pendingDeliveryAcksRef.current = new Set();
    forceStickToBottomRef.current = true;
    shouldStickToBottomRef.current = true;
    void loadHistory({ switching: true });
    void loadParticipants();
    void loadActiveGuests();
    void loadPendingGuestInvites();
    // Reload only when switching conversations — callback identities must not retrigger this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, readOnlyGuestHistory]);

  useEffect(() => {
    loadHistoryRef.current = loadHistory;
    loadActiveGuestsRef.current = loadActiveGuests;
    loadParticipantsRef.current = loadParticipants;
    loadPendingGuestInvitesRef.current = loadPendingGuestInvites;
    scheduleInboxRefreshRef.current = scheduleInboxRefresh;
    tryMarkAsReadIfAtBottomRef.current = tryMarkAsReadIfAtBottom;
    acknowledgeDeliveryOnceRef.current = acknowledgeDeliveryOnce;
  }, [
    acknowledgeDeliveryOnce,
    loadActiveGuests,
    loadHistory,
    loadParticipants,
    loadPendingGuestInvites,
    scheduleInboxRefresh,
    tryMarkAsReadIfAtBottom,
  ]);

  useLayoutEffect(() => {
    if (loadingHistory || messages.length === 0) return;

    const scrollNow = () => scrollToBottom('auto');

    scrollNow();
    const frame = requestAnimationFrame(scrollNow);
    const timers = [50, 150, 400, 900].map((delay) =>
      setTimeout(() => {
        scrollNow();
        if (delay === 900) tryMarkAsReadIfAtBottom();
      }, delay)
    );
    const releaseTimer = setTimeout(() => {
      forceStickToBottomRef.current = false;
    }, 1200);

    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      clearTimeout(releaseTimer);
    };
  }, [conversationId, loadingHistory, messages.length, scrollToBottom, tryMarkAsReadIfAtBottom]);

  useEffect(() => {
    const content = messagesContentRef.current;
    if (!content) return;

    const observer = new ResizeObserver(() => {
      if (forceStickToBottomRef.current || shouldStickToBottomRef.current) {
        scrollToBottom('auto');
      }
    });

    observer.observe(content);
    return () => observer.disconnect();
  }, [conversationId, loadingHistory, messages.length, scrollToBottom]);

  useEffect(() => {
    if (loadingHistory || !user?.id || messages.length === 0) return;
    acknowledgeAllIncomingDeliveries(messages);
  }, [acknowledgeAllIncomingDeliveries, loadingHistory, messages, user?.id]);

  useEffect(() => {
    if (!connected) return;
    flushPendingDeliveryAcks();
    if (!loadingHistory && messages.length > 0) {
      acknowledgeAllIncomingDeliveries(messages);
    }
  }, [acknowledgeAllIncomingDeliveries, connected, flushPendingDeliveryAcks, loadingHistory, messages]);

  useEffect(() => {
    if (loadingHistory || !shouldStickToBottomRef.current) return;
    requestAnimationFrame(() => scrollToBottom('smooth'));
  }, [messages, loadingHistory, scrollToBottom]);

  // Keep one STOMP socket for the panel lifetime — switching chats only swaps topic subscriptions
  // so the composer never flips to "Connecting…" on inbox navigation.
  useEffect(() => {
    if (readOnlyGuestHistory) {
      setConnected(false);
      for (const sub of topicSubsRef.current) {
        try {
          sub.unsubscribe();
        } catch {
          /* ignore */
        }
      }
      topicSubsRef.current = [];
      try {
        void clientRef.current?.deactivate();
      } catch {
        /* ignore */
      }
      clientRef.current = null;
      return;
    }

    let disposed = false;
    const token = getAccessToken();
    setNoToken(!token);

    const stomp = new Client({
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
      webSocketFactory: () => new SockJS(getSockJsEndpoint()) as unknown as WebSocket,
      onConnect: () => {
        if (disposed) return;
        setConnected(true);
        setError((prev) =>
          prev === 'WebSocket connection interrupted.' ||
          prev === 'Real-time connection error.' ||
          (prev?.startsWith('Real-time session') ?? false)
            ? null
            : prev
        );
        flushPendingDeliveryAcks();
        attachConversationTopicsRef.current?.();
      },
      onDisconnect: () => {
        if (disposed || leavingRef.current) return;
        setConnected(false);
      },
      onStompError: (frame) => {
        if (disposed || leavingRef.current) return;
        const message = frame.headers['message'] ?? '';
        if (
          message.includes('clientInboundChannel') ||
          message.includes('ExecutorSubscribableChannel') ||
          /connection closed|broken pipe|whoami/i.test(message)
        ) {
          return;
        }
        if (/unauthorized|forbidden|access denied|invalid token|jwt/i.test(message)) {
          setError('Real-time session expired. Reload or sign in again.');
          setConnected(false);
        }
        // Transient broker errors: let STOMP reconnect quietly — keep composer frozen.
      },
      onWebSocketError: () => {
        if (disposed || leavingRef.current) return;
      },
      onWebSocketClose: () => {
        if (disposed || leavingRef.current) return;
        setConnected(false);
      },
    });

    clientRef.current = stomp;
    if (token) stomp.activate();

    return () => {
      disposed = true;
      for (const sub of topicSubsRef.current) {
        try {
          sub.unsubscribe();
        } catch {
          /* ignore */
        }
      }
      topicSubsRef.current = [];
      try {
        void stomp.deactivate();
      } catch {
        /* ignore teardown errors */
      }
      if (clientRef.current === stomp) {
        clientRef.current = null;
      }
    };
  }, [flushPendingDeliveryAcks, readOnlyGuestHistory, user?.id, wsReconnectNonce]);

  useEffect(() => {
    if (!conversationId || accessRevokedRef.current || readOnlyGuestHistory) {
      return;
    }

    let disposed = false;
    const activeConversationId = conversationId;

    const clearTopicSubs = () => {
      for (const sub of topicSubsRef.current) {
        try {
          sub.unsubscribe();
        } catch {
          /* ignore */
        }
      }
      topicSubsRef.current = [];
    };

    const attachTopics = () => {
      const stomp = clientRef.current;
      if (!stomp?.connected || disposed) return;
      clearTopicSubs();

      topicSubsRef.current = [
        stomp.subscribe(`/topic/conversations/${activeConversationId}`, (message: IMessage) => {
          if (disposed) return;
          try {
            const raw = JSON.parse(message.body) as DirectMessage;
            const parsed = normalizeDirectMessage({
              ...raw,
              sentAt: parseRealtimeTimestamp(raw.sentAt),
            });
            if (
              parsed.conversationId &&
              String(parsed.conversationId) !== activeConversationId
            ) {
              return;
            }
            if (conversationIdRef.current !== activeConversationId || disposed) return;
            setSending(false);
            if (sendFallbackTimerRef.current) {
              clearTimeout(sendFallbackTimerRef.current);
              sendFallbackTimerRef.current = null;
            }
            setMessages((prev) => {
              const withoutDup = prev.filter((m) => m.id !== parsed.id);
              const optimisticMatch = withoutDup.find(
                (m) =>
                  m.clientPending &&
                  m.senderId === parsed.senderId &&
                  (m.attachments?.[0]?.fileName ?? null) === (parsed.attachments?.[0]?.fileName ?? null)
              );
              const nextBase = optimisticMatch
                ? withoutDup.filter((m) => m.id !== optimisticMatch.id)
                : withoutDup;
              const localPreviewUrl = optimisticMatch?.attachments?.[0]?.localPreviewUrl;
              const merged =
                localPreviewUrl && parsed.attachments?.length
                  ? {
                      ...parsed,
                      attachments: parsed.attachments.map((att, index) =>
                        index === 0 ? { ...att, localPreviewUrl } : att
                      ),
                    }
                  : parsed;
              return [...nextBase, merged].sort(sortBySentAt);
            });
            if (parsed.senderId !== user?.id) {
              acknowledgeDeliveryOnceRef.current(parsed.id);
            }
            if (parsed.messageType === 'SYSTEM') {
              void loadActiveGuestsRef.current?.();
              void loadParticipantsRef.current?.();
              void loadPendingGuestInvitesRef.current?.();
            }
            scheduleInboxRefreshRef.current?.();
            requestAnimationFrame(() => tryMarkAsReadIfAtBottomRef.current?.());
          } catch {
            if (!disposed) setError('Received an invalid message.');
          }
        }),

        stomp.subscribe(`/topic/conversations/${activeConversationId}/read`, (message: IMessage) => {
          if (disposed) return;
          try {
            const receipt = JSON.parse(message.body) as ConversationReadReceipt;
            const readerId = String(receipt.userId);
            const readAt = parseRealtimeTimestamp(receipt.readAt);
            setParticipants((prev) =>
              prev.map((participant) =>
                participant.userId === readerId ? { ...participant, lastReadAt: readAt } : participant
              )
            );
          } catch {
            /* ignore */
          }
        }),

        stomp.subscribe(`/topic/conversations/${activeConversationId}/delivered`, (message: IMessage) => {
          if (disposed) return;
          try {
            const receipt = JSON.parse(message.body) as MessageDeliveryReceipt;
            recordDeliveryReceipt(String(receipt.messageId), String(receipt.userId));
          } catch {
            /* ignore */
          }
        }),

        stomp.subscribe(`/topic/conversations/${activeConversationId}/deleted`, (message: IMessage) => {
          if (disposed) return;
          try {
            const payload = JSON.parse(message.body) as { messageId?: string };
            const deletedId = payload.messageId ? String(payload.messageId) : null;
            if (!deletedId) return;
            setMessages((prev) => prev.filter((m) => m.id !== deletedId));
            removePinnedMessage(activeConversationId, deletedId);
            scheduleInboxRefreshRef.current?.();
          } catch {
            /* ignore */
          }
        }),

        stomp.subscribe(`/topic/conversations/${activeConversationId}/typing`, (message: IMessage) => {
          if (disposed) return;
          try {
            const indicator = JSON.parse(message.body) as TypingIndicator;
            const typingUserId = String(indicator.userId);
            if (typingUserId === user?.id) return;

            const existingClearTimer = typingClearTimersRef.current.get(typingUserId);
            if (existingClearTimer) clearTimeout(existingClearTimer);

            if (indicator.typing) {
              setTypingUsers((prev) => {
                const next = new Map(prev);
                next.set(typingUserId, indicator.userName?.trim() || 'Someone');
                return next;
              });
              const clearTimer = setTimeout(() => {
                setTypingUsers((prev) => {
                  const next = new Map(prev);
                  next.delete(typingUserId);
                  return next;
                });
                typingClearTimersRef.current.delete(typingUserId);
              }, 4000);
              typingClearTimersRef.current.set(typingUserId, clearTimer);
            } else {
              setTypingUsers((prev) => {
                const next = new Map(prev);
                next.delete(typingUserId);
                return next;
              });
            }
          } catch {
            /* ignore */
          }
        }),

        stomp.subscribe(`/topic/conversations/${activeConversationId}/call`, (message: IMessage) => {
          if (disposed) return;
          try {
            const session = JSON.parse(message.body) as CallSession;
            if (session.status === 'ENDED' || session.status === 'MISSED') {
              setActiveCall(null);
            } else {
              setActiveCall(session);
            }
          } catch {
            /* ignore */
          }
        }),
      ];
    };

    attachConversationTopicsRef.current = attachTopics;
    attachTopics();

    const typingClearTimers = typingClearTimersRef.current;

    return () => {
      disposed = true;
      if (sendFallbackTimerRef.current) clearTimeout(sendFallbackTimerRef.current);
      if (inboxRefreshTimerRef.current) clearTimeout(inboxRefreshTimerRef.current);
      if (typingIdleTimerRef.current) clearTimeout(typingIdleTimerRef.current);
      if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
      typingClearTimers.forEach((timer) => clearTimeout(timer));
      typingClearTimers.clear();
      setTypingUsers(new Map());
      clearTopicSubs();
      if (attachConversationTopicsRef.current === attachTopics) {
        attachConversationTopicsRef.current = null;
      }
    };
  }, [conversationId, readOnlyGuestHistory, recordDeliveryReceipt, user?.id]);

  const publishTyping = useCallback(
    (typing: boolean) => {
      if (leavingRef.current) return;
      const client = clientRef.current;
      if (!client?.connected) return;
      try {
        client.publish({
          destination: `/app/conversations/${conversationId}/typing`,
          body: JSON.stringify({ typing }),
        });
        lastTypingSentRef.current = typing;
      } catch {
        /* ignore publish errors while disconnecting */
      }
    },
    [conversationId]
  );

  const handleInputChange = (value: string) => {
    setInput(value);
    if (!connected) return;
    if (value.trim()) {
      publishTyping(true);
      if (typingIdleTimerRef.current) clearTimeout(typingIdleTimerRef.current);
      typingIdleTimerRef.current = setTimeout(() => {
        publishTyping(false);
        lastTypingSentRef.current = false;
      }, 2000);
    } else {
      publishTyping(false);
      lastTypingSentRef.current = false;
    }
  };

  const lastOutgoingMessageId = useMemo(() => {
    if (!user?.id) return null;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.messageType !== 'SYSTEM' && message.senderId === user.id) {
        return message.id;
      }
    }
    return null;
  }, [messages, user?.id]);

  const typingLabel = useMemo(() => {
    const names = Array.from(typingUsers.values());
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} is typing…`;
    return `${names.length} people are typing…`;
  }, [typingUsers]);

  const send = () => {
    void sendMessage();
  };

  const clearPendingFiles = useCallback(() => {
    setPendingFiles((prev) => {
      for (const item of prev) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      }
      return [];
    });
  }, []);

  const queuePendingFile = useCallback((file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const needsPreview = file.type.startsWith('image/') || file.type.startsWith('video/');
    const previewUrl = needsPreview ? URL.createObjectURL(file) : null;
    setPendingFiles((prev) => [...prev, { id, file, previewUrl }]);
  }, []);

  const removePendingFile = useCallback((id: string) => {
    setPendingFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const revokeMessageLocalPreviews = useCallback((list: DirectMessage[]) => {
    for (const message of list) {
      for (const attachment of message.attachments ?? []) {
        if (attachment.localPreviewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(attachment.localPreviewUrl);
        }
      }
    }
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    const files = pendingFiles;
    const client = clientRef.current;
    if ((!text && files.length === 0) || sending || uploading) return;

    if (files.length === 0) {
      if (!client?.connected) return;
      try {
        setSending(true);
        publishTyping(false);
        client.publish({
          destination: `/app/conversations/${conversationId}/send`,
          body: JSON.stringify({ content: text }),
        });
        setInput('');
        if (sendFallbackTimerRef.current) clearTimeout(sendFallbackTimerRef.current);
        sendFallbackTimerRef.current = setTimeout(() => {
          setSending(false);
          void loadHistory();
          sendFallbackTimerRef.current = null;
        }, 1200);
      } catch (e) {
        setSending(false);
        setError(getApiErrorMessage(e, 'Unable to send message.'));
      }
      return;
    }

    if (!user?.id) return;

    // Optimistic UI: show media in the thread immediately, free the composer.
    const filesToSend = files.map((item) => ({ ...item }));
    const captionText = text;
    const optimisticMessages: DirectMessage[] = filesToSend.map((item, index) => ({
      id: `optimistic-${item.id}`,
      conversationId,
      senderId: user.id,
      senderName: user.fullName?.trim() || 'You',
      senderAvatarUrl: user.avatarUrl ?? null,
      content: index === 0 ? captionText || null : null,
      messageType: 'FILE',
      attachments: [
        {
          id: `optimistic-att-${item.id}`,
          fileName: item.file.name,
          contentType: item.file.type || 'application/octet-stream',
          sizeBytes: item.file.size,
          localPreviewUrl: item.previewUrl,
        },
      ],
      sentAt: new Date().toISOString(),
      clientPending: true,
    }));

    setInput('');
    setPendingFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    publishTyping(false);
    setError(null);
    setMessages((prev) => [...prev, ...optimisticMessages].sort(sortBySentAt));
    forceStickToBottomRef.current = true;
    shouldStickToBottomRef.current = true;
    requestAnimationFrame(() => scrollToBottom('smooth'));

    setUploading(true);
    const uploadForConversationId = conversationId;
    try {
      for (let index = 0; index < filesToSend.length; index += 1) {
        const item = filesToSend[index];
        const optimisticId = `optimistic-${item.id}`;
        const caption = index === 0 ? captionText || undefined : undefined;
        try {
          const msg = await sendFileMessage(uploadForConversationId, item.file, caption);
          if (!mountedRef.current || conversationIdRef.current !== uploadForConversationId) {
            if (item.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl);
            continue;
          }
          const localPreviewUrl = item.previewUrl;
          const merged: DirectMessage = {
            ...msg,
            attachments: (msg.attachments ?? []).map((att, attIndex) =>
              attIndex === 0 && localPreviewUrl ? { ...att, localPreviewUrl } : att
            ),
          };
          setMessages((prev) =>
            [...prev.filter((m) => m.id !== optimisticId && m.id !== merged.id), merged].sort(sortBySentAt)
          );
        } catch (fileError) {
          if (mountedRef.current && conversationIdRef.current === uploadForConversationId) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === optimisticId ? { ...m, clientPending: false, clientFailed: true } : m
              )
            );
          } else if (item.previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(item.previewUrl);
          }
          throw fileError;
        }
      }
      scheduleInboxRefresh();
    } catch (e) {
      if (mountedRef.current && conversationIdRef.current === uploadForConversationId) {
        setError(getApiErrorMessage(e, 'Unable to send media.'));
      }
    } finally {
      if (mountedRef.current && conversationIdRef.current === uploadForConversationId) {
        setUploading(false);
      }
    }
  };

  const onFileSelected = (fileList: FileList | null) => {
    if (!fileList?.length || sending) return;
    const files = Array.from(fileList);
    for (const file of files) {
      queuePendingFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    clearPendingFiles();
  }, [conversationId, clearPendingFiles]);

  const requestDeleteMessage = (message: DirectMessage) => {
    if (!message.id) return;
    setPendingDeleteMessage(message);
  };

  const handleDeleteMessage = async (message: DirectMessage) => {
    if (!message.id) return;
    setDeletingMessage(true);
    const previous = messages;
    setMessages((prev) => prev.filter((m) => m.id !== message.id));
    removePinnedMessage(conversationId, message.id);
    try {
      await deleteConversationMessage(conversationId, message.id);
      scheduleInboxRefresh();
      pushFlashFeedback({
        variant: 'success',
        title: 'Message deleted',
      });
      setPendingDeleteMessage(null);
    } catch (e) {
      setMessages(previous);
      setError(getApiErrorMessage(e, 'Unable to delete message.'));
      pushFlashFeedback({
        variant: 'error',
        title: 'Unable to delete message',
      });
    } finally {
      setDeletingMessage(false);
    }
  };

  const initiateCall = async (callType: CallType) => {
    if (activeCall) return;
    try {
      const session = await startCall(conversationId, callType);
      setActiveCall(session);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to start call.'));
    }
  };

  const callButtonsDisabled = !connected || Boolean(activeCall);

  const showWsHint = noToken && !connected;
  const isGroup = conversationType === 'GROUP';

  const participantAvatarsByUserId = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const participant of participants) {
      map.set(participant.userId, participant.avatarUrl ?? null);
    }
    for (const guest of activeGuests) {
      map.set(guest.guestUserId, guest.guestAvatarUrl ?? null);
    }
    for (const message of messages) {
      if (message.messageType === 'SYSTEM') continue;
      if (!map.has(message.senderId) && message.senderAvatarUrl) {
        map.set(message.senderId, message.senderAvatarUrl);
      }
    }
    return map;
  }, [activeGuests, messages, participants]);

  const resolveSenderAvatarUrl = (message: DirectMessage): string | null | undefined => {
    if (participantAvatarsByUserId.has(message.senderId)) {
      return participantAvatarsByUserId.get(message.senderId);
    }
    if (message.senderAvatarUrl) return message.senderAvatarUrl;
    if (!isGroup && partnerUserId && message.senderId === partnerUserId) {
      return partnerAvatarUrl;
    }
    return null;
  };

  const getOutgoingStatus = useCallback(
    (message: DirectMessage): MessageStatusType | null => {
      const mine = user?.id != null && message.senderId === user.id;
      if (!mine || message.messageType === 'SYSTEM') return null;
      if (message.clientPending || message.clientFailed) return 'sending';
      const showOutgoingStatus = message.id === lastOutgoingMessageId;
      return getOutgoingMessageStatusType(
        message,
        showOutgoingStatus,
        sending && showOutgoingStatus,
        participants,
        deliveredReceipts,
        user?.id
      );
    },
    [deliveredReceipts, lastOutgoingMessageId, participants, sending, user?.id]
  );

  const openContextView = useCallback(
    (view: 'people' | 'pins' | 'search') => {
      if (!detailsOpen) onToggleDetails?.();
      window.dispatchEvent(
        new CustomEvent('discussion-context-navigate', {
          detail: { conversationId, view },
        })
      );
    },
    [conversationId, detailsOpen, onToggleDetails]
  );

  useEffect(() => {
    const onRequestDetailsOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ conversationId?: string }>).detail;
      if (detail?.conversationId && detail.conversationId !== conversationId) return;
      if (!detailsOpen) onToggleDetails?.();
    };
    window.addEventListener('discussion-request-details-open', onRequestDetailsOpen);
    return () => window.removeEventListener('discussion-request-details-open', onRequestDetailsOpen);
  }, [conversationId, detailsOpen, onToggleDetails]);

  useEffect(() => {
    const onScrollToMessage = (event: Event) => {
      const detail = (event as CustomEvent<{ conversationId?: string; messageId?: string }>).detail;
      if (detail?.conversationId && detail.conversationId !== conversationId) return;
      const messageId = detail?.messageId;
      if (!messageId) return;

      const highlight = () => {
        setHighlightedMessageId(messageId);
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = setTimeout(() => setHighlightedMessageId(null), 2200);
      };

      const tryScroll = (attempt: number) => {
        const container = scrollContainerRef.current;
        const target = container?.querySelector(
          `[data-message-id="${CSS.escape(messageId)}"]`
        ) as HTMLElement | null;
        if (target) {
          shouldStickToBottomRef.current = false;
          forceStickToBottomRef.current = false;
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          highlight();
          return;
        }
        if (attempt === 2) {
          void loadHistoryRef.current?.().then(() => {
            window.setTimeout(() => tryScroll(attempt + 1), 60);
          });
          return;
        }
        if (attempt < 10) {
          window.setTimeout(() => tryScroll(attempt + 1), 80);
        }
      };

      requestAnimationFrame(() => tryScroll(0));
    };

    window.addEventListener('discussion-scroll-to-message', onScrollToMessage);
    return () => {
      window.removeEventListener('discussion-scroll-to-message', onScrollToMessage);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, [conversationId]);

  const isCurrentUserGuest = useMemo(
    () => participants.some((participant) => participant.userId === user?.id && participant.role === 'GUEST'),
    [participants, user?.id]
  );

  const guestSessionTraces = useMemo(() => filterGuestSessionTraces(messages), [messages]);

  const isTemporarySession = temporarySession || activeGuests.length > 0 || isCurrentUserGuest;

  const headerTitle = useMemo(() => {
    if (!isTemporarySession) return title;
    const firstNames = participants
      .map((participant) => participant.fullName?.trim().split(/\s+/)[0])
      .filter((name): name is string => Boolean(name));
    if (firstNames.length > 0) return firstNames.join(' / ');
    const cleaned = title.replace(/^Temporary\s*[·•\-–]\s*/i, '').trim();
    return cleaned.split(/\s+/)[0] || cleaned || title;
  }, [isTemporarySession, participants, title]);

  const headerSubtitle = typingLabel ?? (isGroup ? 'Group' : null);

  const headerLeadingActions = isTemporarySession ? (
    <GuestSessionTraceMenu traces={guestSessionTraces} />
  ) : null;

  const headerExtraActions = (
    <>
      {isCurrentUserGuest && (
        <button
          type="button"
          onClick={() => void handleLeaveAsGuest()}
          disabled={guestActionLoading}
          className="rounded-[8px] border border-[var(--cw-border)] px-3 py-2 text-[11px] font-semibold text-[var(--cw-text-primary)] transition hover:bg-[var(--cw-surface-soft)] disabled:opacity-60"
          title="Leave this temporary conversation"
        >
          {guestActionLoading ? '…' : 'Leave'}
        </button>
      )}
      {!isCurrentUserGuest &&
        activeGuests
          .filter((guest) => guest.inviterUserId === user?.id)
          .map((guest) => (
            <button
              key={guest.inviteId}
              type="button"
              onClick={() => void handleEndGuestAccess(guest.guestUserId)}
              disabled={guestActionLoading}
              className="rounded-[8px] border border-[var(--cw-border)] px-3 py-2 text-[11px] font-semibold text-[var(--cw-text-primary)] transition hover:bg-[var(--cw-surface-soft)] disabled:opacity-60"
              title={`End guest access for ${guest.guestName}`}
            >
              {guestActionLoading ? '…' : 'End access'}
            </button>
          ))}
      {!isGroup && SHOW_CALL_BUTTONS && (
        <>
          <button
            type="button"
            onClick={() => void initiateCall('VOICE')}
            disabled={callButtonsDisabled}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-[var(--cw-text-secondary)] transition hover:bg-[var(--cw-surface-soft)] hover:text-[var(--cw-text-primary)] disabled:opacity-40"
            title={callButtonsDisabled && !connected ? 'Waiting for connection…' : 'Voice call'}
            aria-label="Voice call"
          >
            <PhoneIcon />
          </button>
          <button
            type="button"
            onClick={() => void initiateCall('VIDEO')}
            disabled={callButtonsDisabled}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-[var(--cw-text-secondary)] transition hover:bg-[var(--cw-surface-soft)] hover:text-[var(--cw-text-primary)] disabled:opacity-40"
            title={callButtonsDisabled && !connected ? 'Waiting for connection…' : 'Video call'}
            aria-label="Video call"
          >
            <VideoIcon />
          </button>
        </>
      )}
      {isGroup && SHOW_GROUP_CHAT && (
        <button
          type="button"
          onClick={() => setAddMemberOpen(true)}
          className="rounded-[8px] border border-[var(--cw-border)] bg-[var(--cw-surface)] px-3 py-2 text-[11px] font-semibold text-[var(--cw-text-primary)] transition hover:bg-[var(--cw-surface-soft)]"
        >
          + Member
        </button>
      )}
      {!isTemporarySession && isGroup ? <GuestSessionTraceMenu traces={guestSessionTraces} /> : null}
    </>
  );

  return (
    <section
      className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--cw-surface,#fff)]"
      aria-labelledby="discussion-chat-heading"
      aria-busy={loadingHistory}
    >
      {isGroup && SHOW_GROUP_CHAT && addMemberOpen && (
        <AddGroupMemberModal
          conversationId={conversationId}
          currentUserId={user?.id}
          onClose={() => setAddMemberOpen(false)}
          onAdded={scheduleInboxRefresh}
        />
      )}
      {transferMessage && (
        <TransferMessageModal
          message={transferMessage}
          sourceConversationId={conversationId}
          onClose={() => setTransferMessage(null)}
        />
      )}
      {guestInviteOpen && (
        <TemporaryGuestInviteModal
          conversationId={conversationId}
          conversationTitle={title}
          currentUserId={user?.id}
          onClose={() => setGuestInviteOpen(false)}
          onInvited={() => {
            scheduleInboxRefresh();
            void loadActiveGuests();
            void loadPendingGuestInvites();
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(pendingDeleteMessage)}
        title="Delete this message?"
        description="This cannot be undone. The message will be removed from the conversation."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        busy={deletingMessage}
        onCancel={() => {
          if (!deletingMessage) setPendingDeleteMessage(null);
        }}
        onConfirm={() => {
          if (pendingDeleteMessage) void handleDeleteMessage(pendingDeleteMessage);
        }}
      />

      <ConversationHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        titleCentered={isTemporarySession}
        leadingActions={headerLeadingActions}
        detailsOpen={detailsOpen}
        onBack={onBack}
        onSearch={() => openContextView('search')}
        onPin={() => openContextView('pins')}
        onToggleDetails={onToggleDetails}
        extraActions={headerExtraActions}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {activeCall && (
          <DiscussionCallPanel
            conversationId={conversationId}
            callSession={activeCall}
            isInitiator={user?.id === activeCall.initiatorId}
            callType={activeCall.callType}
            currentUserId={user?.id}
            stompClient={clientRef.current}
            connected={connected}
            onEnded={() => setActiveCall(null)}
          />
        )}

        <div className="space-y-2 px-3 pt-2 sm:px-4">
          {showWsHint && (
            <p className="rounded-[8px] bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              Real-time messaging requires an active session. Reload or sign in again.
            </p>
          )}

          {readOnlyGuestHistory && (
            <p className="rounded-[8px] border border-[var(--cw-border)] bg-[var(--cw-surface-soft)] px-3 py-2 text-xs text-[var(--cw-text-secondary)]">
              Viewing your temporary session history — only messages from when you joined until you left are shown.
            </p>
          )}

          {error && (
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          )}
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={() => {
            const container = scrollContainerRef.current;
            if (!container) return;
            const nearBottom = isNearBottom(container);
            shouldStickToBottomRef.current = nearBottom;
            if (!nearBottom) {
              forceStickToBottomRef.current = false;
            } else {
              tryMarkAsReadIfAtBottom();
            }
          }}
          className="relative mb-0 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[var(--msg-thread-bg,#FAFAFA)] px-3 py-2 text-sm dark:bg-[var(--msg-thread-bg,#111111)] [scrollbar-width:thin] [scrollbar-color:#a3a3a3_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-400 sm:px-4"
          role="log"
          aria-live="polite"
        >
          <div ref={messagesContentRef} key={conversationId} className="discussion-thread-content-in">
            <MessageTimeline
              messages={messages}
              conversationId={conversationId}
              currentUserId={user?.id}
              resolveAvatarUrl={resolveSenderAvatarUrl}
              getOutgoingStatus={getOutgoingStatus}
              onTransfer={setTransferMessage}
              onDelete={requestDeleteMessage}
              loading={loadingHistory}
              highlightedMessageId={highlightedMessageId}
              emptyLabel={
                readOnlyGuestHistory
                  ? 'No messages during your temporary session.'
                  : 'No messages yet. Say hello!'
              }
            />
            <div ref={bottomRef} />
          </div>
        </div>

        {typingLabel && (
          <p className="mb-1 px-4 text-[13px] italic text-[var(--cw-text-secondary)]" aria-live="polite">
            {typingLabel}
          </p>
        )}

        <PendingGuestInviteStrip
          invites={pendingGuestInvites}
          acting={inviteActionLoading}
          onCancel={(inviteId) => void handleCancelGuestInvite(inviteId)}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
          multiple
          className="hidden"
          onChange={(e) => onFileSelected(e.target.files)}
        />

        <MessageComposer
          value={input}
          onChange={handleInputChange}
          onSend={send}
          onAttach={showComposer && !readOnlyGuestHistory ? () => fileInputRef.current?.click() : undefined}
          onInviteGuest={showComposer && !readOnlyGuestHistory ? () => setGuestInviteOpen(true) : undefined}
          onFilesDropped={
            showComposer && !readOnlyGuestHistory
              ? (files) => {
                  for (const file of Array.from(files)) {
                    queuePendingFile(file);
                  }
                }
              : undefined
          }
          pendingFiles={pendingFiles}
          onRemovePendingFile={removePendingFile}
          disabled={false}
          sending={sending}
          uploading={uploading}
          placeholder={
            pendingFiles.length > 0 ? 'Add a caption, then send…' : 'Write your message…'
          }
          readOnlyLabel={
            showComposer
              ? null
              : readOnlyGuestHistory
                ? 'Read-only temporary session history.'
                : 'Read-only conversation.'
          }
        />
      </div>
    </section>
  );
}
