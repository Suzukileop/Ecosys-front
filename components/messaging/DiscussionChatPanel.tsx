'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MessageAttachmentView, attachmentIsVisualMedia } from '@/components/messaging/MessageAttachmentView';
import { DiscussionCallPanel } from '@/components/messaging/DiscussionCallPanel';
import { MessageStatusIndicator, type MessageStatusType } from '@/components/messaging/MessageStatusIndicator';
import { MessageActionsMenu } from '@/components/messaging/MessageActionsMenu';
import { TemporaryGuestBanner } from '@/components/messaging/TemporaryGuestBanner';
import { GuestSessionTraceMenu } from '@/components/messaging/GuestSessionTraceMenu';
import { PendingGuestInviteStrip } from '@/components/messaging/PendingGuestInviteStrip';
import {
  filterGuestSessionTraces,
  isGuestSessionTrace,
} from '@/lib/guest-session-trace';
import { Avatar } from '@/components/ui/Avatar';
import { clearAttachmentLoadFailuresForConversation } from '@/lib/messaging-attachments';
import { useDiscussionThreadTheme } from '@/hooks/useDiscussionThreadTheme';

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
  detailsOpen?: boolean;
  onToggleDetails?: () => void;
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

function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getMessageGrouping(messages: DirectMessage[], index: number) {
  const current = messages[index];
  if (current.messageType === 'SYSTEM') {
    return { groupedWithPrev: false, groupedWithNext: false };
  }

  let prevIndex = index - 1;
  while (prevIndex >= 0 && messages[prevIndex].messageType === 'SYSTEM') prevIndex -= 1;

  let nextIndex = index + 1;
  while (nextIndex < messages.length && messages[nextIndex].messageType === 'SYSTEM') nextIndex += 1;

  const previous = prevIndex >= 0 ? messages[prevIndex] : null;
  const next = nextIndex < messages.length ? messages[nextIndex] : null;
  const sameSender = (a: DirectMessage, b: DirectMessage) => a.senderId === b.senderId;

  return {
    groupedWithPrev: previous != null && sameSender(current, previous),
    groupedWithNext: next != null && sameSender(current, next),
  };
}

function getMessengerBubbleRadius(mine: boolean, groupedWithPrev: boolean, groupedWithNext: boolean): string {
  const base = 'rounded-[18px]';
  if (mine) {
    if (groupedWithPrev) return `${base} rounded-tr-[4px] rounded-br-[4px]`;
    if (groupedWithNext) return `${base} rounded-br-[4px]`;
    return `${base} rounded-br-[4px]`;
  }
  if (groupedWithPrev) return `${base} rounded-tl-[4px] rounded-bl-[4px]`;
  if (groupedWithNext) return `${base} rounded-bl-[4px]`;
  return `${base} rounded-bl-[4px]`;
}

function buildMessengerBubbleClass(mine: boolean, shape: string): string {
  if (mine) {
    return `${shape} bg-[#F97316] px-3 py-1.5 text-[15px] leading-snug text-white`;
  }
  return `${shape} bg-[#E4E6EB] px-3 py-1.5 text-[15px] leading-snug text-gray-900 dark:bg-[#3E4042] dark:text-white`;
}

const MESSAGE_BUBBLE_MAX_WIDTH = 'min-w-0 max-w-[min(85%,520px)]';
const MESSAGE_MEDIA_MAX_WIDTH = 'min-w-0 max-w-[min(85%,480px)]';
const MESSAGE_TEXT_CLASS = 'whitespace-pre-wrap break-words [overflow-wrap:anywhere]';

const composerActionClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-200/80 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white';

const composerBarClass =
  'flex shrink-0 items-center gap-1.5 rounded-2xl bg-white px-2 py-1.5 shadow-sm dark:bg-black dark:ring-1 dark:ring-neutral-800';

function ComposerIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      {children}
    </svg>
  );
}

function PhoneIcon() {
  return (
    <ComposerIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </ComposerIcon>
  );
}

function VideoIcon() {
  return (
    <ComposerIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </ComposerIcon>
  );
}

function InviteIcon() {
  return (
    <ComposerIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </ComposerIcon>
  );
}

function HashIcon() {
  return (
    <ComposerIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </ComposerIcon>
  );
}

function AtIcon() {
  return (
    <ComposerIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </ComposerIcon>
  );
}

function PlusIcon() {
  return (
    <ComposerIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </ComposerIcon>
  );
}

function InfoPanelIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
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
  detailsOpen = false,
  onToggleDetails,
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
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [activeGuests, setActiveGuests] = useState<ConversationGuestSession[]>([]);
  const [pendingGuestInvites, setPendingGuestInvites] = useState<OutgoingGuestInvite[]>([]);
  const [guestActionLoading, setGuestActionLoading] = useState(false);
  const [inviteActionLoading, setInviteActionLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(() => new Map());
  const [wsReconnectNonce, setWsReconnectNonce] = useState(0);
  const [deliveredReceipts, setDeliveredReceipts] = useState<Map<string, Set<string>>>(() => new Map());
  const clientRef = useRef<Client | null>(null);
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
  const leavingRef = useRef(false);
  const accessRevokedRef = useRef(false);

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

  const handleRevokeGuest = async (guestUserId: string) => {
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
      const page = await listConversationMessages(conversationId, 0, 50);
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

  useEffect(() => {
    leavingRef.current = false;
    accessRevokedRef.current = false;
    clearAttachmentLoadFailuresForConversation(conversationId);
    setMessages([]);
    setInput('');
    setError(null);
    setSending(false);
    setUploading(false);
    setParticipants([]);
    setActiveGuests([]);
    setPendingGuestInvites([]);
    setTypingUsers(new Map());
    setDeliveredReceipts(new Map());
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
    loadActiveGuestsRef.current = loadActiveGuests;
    loadParticipantsRef.current = loadParticipants;
    loadPendingGuestInvitesRef.current = loadPendingGuestInvites;
    scheduleInboxRefreshRef.current = scheduleInboxRefresh;
    tryMarkAsReadIfAtBottomRef.current = tryMarkAsReadIfAtBottom;
    acknowledgeDeliveryOnceRef.current = acknowledgeDeliveryOnce;
  }, [
    acknowledgeDeliveryOnce,
    loadActiveGuests,
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

  useEffect(() => {
    if (!conversationId || accessRevokedRef.current || readOnlyGuestHistory) {
      setConnected(false);
      return;
    }

    const token = getAccessToken();
    setNoToken(!token);

    const stomp = new Client({
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
      webSocketFactory: () => new SockJS(getSockJsEndpoint()) as unknown as WebSocket,
      onConnect: () => {
        setConnected(true);
        setError(null);
        flushPendingDeliveryAcks();
        stomp.subscribe(`/topic/conversations/${conversationId}`, (message: IMessage) => {
          try {
            const raw = JSON.parse(message.body) as DirectMessage;
            const parsed = normalizeDirectMessage({
              ...raw,
              sentAt: parseRealtimeTimestamp(raw.sentAt),
            });
            setSending(false);
            if (sendFallbackTimerRef.current) {
              clearTimeout(sendFallbackTimerRef.current);
              sendFallbackTimerRef.current = null;
            }
            setMessages((prev) => {
              const next = [...prev.filter((m) => m.id !== parsed.id), parsed];
              return next.sort(sortBySentAt);
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
            setError('Received an invalid message.');
          }
        });

        stomp.subscribe(`/topic/conversations/${conversationId}/read`, (message: IMessage) => {
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
        });

        stomp.subscribe(`/topic/conversations/${conversationId}/delivered`, (message: IMessage) => {
          try {
            const receipt = JSON.parse(message.body) as MessageDeliveryReceipt;
            recordDeliveryReceipt(String(receipt.messageId), String(receipt.userId));
          } catch {
            /* ignore */
          }
        });

        stomp.subscribe(`/topic/conversations/${conversationId}/typing`, (message: IMessage) => {
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
        });

        stomp.subscribe(`/topic/conversations/${conversationId}/call`, (message: IMessage) => {
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
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        if (leavingRef.current) return;
        const message = frame.headers['message'] ?? '';
        if (
          message.includes('clientInboundChannel') ||
          message.includes('ExecutorSubscribableChannel')
        ) {
          return;
        }
        setError(message || 'Real-time connection error.');
      },
      onWebSocketError: () => {
        if (leavingRef.current) return;
        setError('WebSocket connection interrupted.');
      },
    });

    clientRef.current = stomp;
    if (token) stomp.activate();

    const typingClearTimers = typingClearTimersRef.current;

    return () => {
      if (sendFallbackTimerRef.current) clearTimeout(sendFallbackTimerRef.current);
      if (inboxRefreshTimerRef.current) clearTimeout(inboxRefreshTimerRef.current);
      if (typingIdleTimerRef.current) clearTimeout(typingIdleTimerRef.current);
      if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
      typingClearTimers.forEach((timer) => clearTimeout(timer));
      typingClearTimers.clear();
      stomp.deactivate();
      clientRef.current = null;
    };
  }, [conversationId, flushPendingDeliveryAcks, readOnlyGuestHistory, recordDeliveryReceipt, user?.id, wsReconnectNonce]);

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
    const text = input.trim();
    const client = clientRef.current;
    if (!text || !client?.connected || sending) return;
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
  };

  const onFileSelected = async (file: File | undefined) => {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    try {
      const msg = await sendFileMessage(conversationId, file, input.trim() || undefined);
      setInput('');
      setMessages((prev) => [...prev.filter((m) => m.id !== msg.id), msg].sort(sortBySentAt));
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to send file.'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
  const { patternClass: threadPatternClass } = useDiscussionThreadTheme();

  const headerIconButtonClass = (disabled: boolean) =>
    `flex h-9 w-9 items-center justify-center rounded-full transition ${
      disabled
        ? 'cursor-not-allowed text-neutral-400 dark:text-neutral-500'
        : 'text-gray-700 hover:bg-[#FFF7ED] hover:text-[#EA580C] dark:text-neutral-200 dark:hover:bg-[#F97316]/15 dark:hover:text-[#FB923C]'
    }`;

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

  const showSenderNames = useMemo(() => {
    if (isGroup) return true;
    const senderIds = new Set(
      messages
        .filter((message) => message.messageType !== 'SYSTEM' && message.senderId !== user?.id)
        .map((message) => message.senderId)
    );
    return senderIds.size > 1;
  }, [isGroup, messages, user?.id]);

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

  const isCurrentUserGuest = useMemo(
    () => participants.some((participant) => participant.userId === user?.id && participant.role === 'GUEST'),
    [participants, user?.id]
  );

  const guestSessionTraces = useMemo(() => filterGuestSessionTraces(messages), [messages]);

  return (
    <section
      className="flex h-full min-h-0 flex-col overflow-hidden bg-white dark:bg-black"
      aria-labelledby="discussion-chat-heading"
      aria-busy={loadingHistory}
    >
      {isGroup && addMemberOpen && (
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
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 px-5">
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#EA580C] dark:text-[#FB923C]">
            Chat
          </p>
          <div className="flex min-w-0 items-center gap-2">
            <h3
              id="discussion-chat-heading"
              className="truncate text-base font-bold text-gray-900 dark:text-white"
            >
              {title}
            </h3>
            {isGroup && <GuestSessionTraceMenu traces={guestSessionTraces} />}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isCurrentUserGuest && (
            <button
              type="button"
              onClick={() => void handleLeaveAsGuest()}
              disabled={guestActionLoading}
              className="rounded-full border border-neutral-300 px-3 py-1.5 text-[11px] font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
              title="Leave this temporary conversation"
            >
              {guestActionLoading ? '…' : 'Leave chat'}
            </button>
          )}
          {!isGroup && (
            <>
              <button
                type="button"
                onClick={() => void initiateCall('VOICE')}
                disabled={callButtonsDisabled}
                className={headerIconButtonClass(callButtonsDisabled)}
                title={callButtonsDisabled && !connected ? 'Waiting for connection…' : 'Voice call'}
                aria-label="Voice call"
              >
                <PhoneIcon />
              </button>
              <button
                type="button"
                onClick={() => void initiateCall('VIDEO')}
                disabled={callButtonsDisabled}
                className={headerIconButtonClass(callButtonsDisabled)}
                title={callButtonsDisabled && !connected ? 'Waiting for connection…' : 'Video call'}
                aria-label="Video call"
              >
                <VideoIcon />
              </button>
            </>
          )}
          {isGroup && (
            <button
              type="button"
              onClick={() => setAddMemberOpen(true)}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-800 transition hover:bg-gray-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              + Member
            </button>
          )}
          {onToggleDetails && (
            <button
              type="button"
              onClick={onToggleDetails}
              aria-pressed={detailsOpen}
              title="Conversation details"
              aria-label="Conversation details"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                detailsOpen
                  ? 'bg-[#FFF7ED] text-[#EA580C] dark:bg-[#F97316]/15 dark:text-[#FB923C]'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              <InfoPanelIcon />
            </button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-3 pb-3 pt-2">
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

        {showWsHint && (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            Real-time messaging requires an active session. Reload or sign in again.
          </p>
        )}

        {readOnlyGuestHistory && (
          <p className="mb-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300">
            Viewing your temporary session history — only messages from when you joined until you left are shown.
          </p>
        )}

        {error && (
          <div className="mb-3">
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <TemporaryGuestBanner
          guests={activeGuests}
          currentUserId={user?.id}
          acting={guestActionLoading}
          onRevoke={(guestUserId) => void handleRevokeGuest(guestUserId)}
          onLeave={() => void handleLeaveAsGuest()}
        />

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
          className={`${threadPatternClass} relative mb-2 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto rounded-2xl px-3 py-3 text-sm [scrollbar-width:thin] [scrollbar-color:#737373_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-500 dark:[scrollbar-color:#525252_transparent] [&::-webkit-scrollbar-thumb]:dark:bg-neutral-600 [&::-webkit-scrollbar-thumb:hover]:bg-neutral-400 [&::-webkit-scrollbar-thumb:hover]:dark:bg-neutral-500`}
          role="log"
          aria-live="polite"
        >
          {loadingHistory ? (
            <div className="flex min-h-[12rem] items-center justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-neutral-400">
              {readOnlyGuestHistory
                ? 'No messages during your temporary session.'
                : 'No messages yet. Say hello!'}
            </p>
          ) : (
            <div ref={messagesContentRef}>
            {messages.map((m, index) => {
              const mine = user?.id != null && m.senderId === user.id;
              const isSystem = m.messageType === 'SYSTEM';

              if (isSystem) {
                const guestTrace = isGuestSessionTrace(m.content);
                return (
                  <p
                    key={m.id}
                    className={`mt-3 text-center ${guestTrace ? 'px-2' : 'break-words text-xs text-gray-500 [overflow-wrap:anywhere] dark:text-neutral-400'}`}
                  >
                    {guestTrace ? (
                      <span className="inline-flex max-w-[92%] flex-col items-center gap-0.5 rounded-full border border-neutral-200/70 bg-neutral-50/90 px-3 py-1.5 text-[11px] leading-snug text-neutral-600 dark:border-neutral-700/80 dark:bg-neutral-900/70 dark:text-neutral-400">
                        <span>{m.content}</span>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          {formatMessageTime(m.sentAt)}
                        </span>
                      </span>
                    ) : (
                      m.content
                    )}
                  </p>
                );
              }

              const { groupedWithPrev, groupedWithNext } = getMessageGrouping(messages, index);
              const bubbleShape = getMessengerBubbleRadius(mine, groupedWithPrev, groupedWithNext);
              const bubbleClass = buildMessengerBubbleClass(mine, bubbleShape);
              const marginClass = groupedWithPrev ? 'mt-0.5' : 'mt-3';
              const showAvatar = !mine && !groupedWithNext;
              const incomingAvatarUrl = resolveSenderAvatarUrl(m);
              const timeClass = mine ? 'text-white/55' : 'text-gray-500 dark:text-white/55';

              const visualAttachments = (m.attachments ?? []).filter(attachmentIsVisualMedia);
              const fileAttachments = (m.attachments ?? []).filter((a) => !attachmentIsVisualMedia(a));
              const hasVisualMedia = visualAttachments.length > 0;
              const hasCaption = Boolean(m.content?.trim());
              const bareMediaLayout = hasVisualMedia && fileAttachments.length === 0;

              const showOutgoingStatus = mine && m.id === lastOutgoingMessageId;
              const outgoingStatus = getOutgoingMessageStatusType(
                m,
                showOutgoingStatus,
                sending && showOutgoingStatus,
                participants,
                deliveredReceipts,
                user?.id
              );

              if (bareMediaLayout) {
                return (
                  <div key={m.id} className={`group/msg flex w-full min-w-0 ${mine ? 'justify-end' : 'justify-start'} ${marginClass}`}>
                    {!mine && (
                      <div className="mr-1.5 flex w-9 shrink-0 items-end self-end">
                        {showAvatar ? (
                          <Avatar
                            name={m.senderName || title}
                            avatarUrl={incomingAvatarUrl}
                            size="xs"
                            tone="muted"
                          />
                        ) : null}
                      </div>
                    )}
                    <div className={`flex items-center gap-0.5 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`relative flex ${MESSAGE_MEDIA_MAX_WIDTH} flex-col gap-0.5 ${mine ? 'items-end' : 'items-start'}`}>
                      {showSenderNames && !groupedWithPrev && (
                        <p className="mb-0.5 max-w-full truncate px-1 text-[10px] font-medium text-gray-500 dark:text-neutral-400">
                          {m.senderName}
                        </p>
                      )}
                      <div className={`relative w-full overflow-hidden ${bubbleShape}`}>
                        {visualAttachments.map((att) => (
                          <MessageAttachmentView
                            key={att.id}
                            conversationId={conversationId}
                            attachment={att}
                            mine={mine}
                            embedded
                            sentAt={m.sentAt}
                          />
                        ))}
                      </div>
                      {hasCaption && (
                        <div className={`w-full ${MESSAGE_BUBBLE_MAX_WIDTH} ${bubbleClass}`}>
                          <p className={MESSAGE_TEXT_CLASS}>{m.content}</p>
                          {outgoingStatus ? (
                            <div className="mt-1 flex items-center justify-end gap-1">
                              <time dateTime={m.sentAt} className="text-[10px] text-white/55">
                                {formatMessageTime(m.sentAt)}
                              </time>
                              <MessageStatusIndicator status={outgoingStatus} variant="chat" />
                            </div>
                          ) : null}
                        </div>
                      )}
                      {outgoingStatus && !hasCaption && (
                        <div className="mt-1 flex items-center justify-end px-0.5">
                          <MessageStatusIndicator status={outgoingStatus} variant="chat" />
                        </div>
                      )}
                    </div>
                    <MessageActionsMenu
                      message={m}
                      conversationId={conversationId}
                      mine={Boolean(mine)}
                      onTransfer={setTransferMessage}
                    />
                    </div>
                  </div>
                );
              }

              const bubbleMediaClass = hasVisualMedia ? 'p-1.5' : '';

              return (
                <div key={m.id} className={`group/msg flex w-full min-w-0 ${mine ? 'justify-end' : 'justify-start'} ${marginClass}`}>
                  {!mine && (
                    <div className="mr-1.5 flex w-9 shrink-0 items-end self-end">
                      {showAvatar ? (
                        <Avatar
                          name={m.senderName || title}
                          avatarUrl={incomingAvatarUrl}
                          size="xs"
                          tone="muted"
                        />
                      ) : null}
                    </div>
                  )}
                  <div className={`flex items-center gap-0.5 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`relative flex ${MESSAGE_BUBBLE_MAX_WIDTH} flex-col ${mine ? 'items-end' : 'items-start'}`}>

                    {showSenderNames && !groupedWithPrev && (
                      <p className="mb-0.5 max-w-full truncate px-1 text-[10px] font-medium text-gray-500 dark:text-neutral-400">
                        {m.senderName}
                      </p>
                    )}

                    <div className={`w-full ${bubbleMediaClass} ${bubbleClass}`}>
                      {m.attachments?.map((att) => (
                        <MessageAttachmentView
                          key={att.id}
                          conversationId={conversationId}
                          attachment={att}
                          mine={mine}
                        />
                      ))}

                      {hasCaption && (
                        <p className={`${MESSAGE_TEXT_CLASS} ${hasVisualMedia ? 'px-1.5 pt-1.5' : ''}`}>
                          {m.content}
                        </p>
                      )}

                      {!hasVisualMedia && hasCaption && (
                        <div className={`mt-1 flex items-center gap-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                          <time dateTime={m.sentAt} className={`shrink-0 text-[10px] leading-none ${timeClass}`}>
                            {formatMessageTime(m.sentAt)}
                          </time>
                          {outgoingStatus ? (
                            <MessageStatusIndicator status={outgoingStatus} variant="chat" />
                          ) : null}
                        </div>
                      )}

                      {hasVisualMedia && (
                        <div
                          className={`mt-0.5 flex items-center gap-1 px-1.5 pb-0.5 ${mine ? 'justify-end' : 'justify-start'}`}
                        >
                          <time dateTime={m.sentAt} className={`text-[10px] ${timeClass}`}>
                            {formatMessageTime(m.sentAt)}
                          </time>
                          {outgoingStatus ? (
                            <MessageStatusIndicator status={outgoingStatus} variant="chat" />
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                  <MessageActionsMenu
                    message={m}
                    conversationId={conversationId}
                    mine={Boolean(mine)}
                    onTransfer={setTransferMessage}
                  />
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
            </div>
          )}
        </div>

        {typingLabel && (
          <p className="mb-2 px-2 text-xs italic text-gray-500 dark:text-neutral-400" aria-live="polite">
            {typingLabel}
          </p>
        )}

        <PendingGuestInviteStrip
          invites={pendingGuestInvites}
          acting={inviteActionLoading}
          onCancel={(inviteId) => void handleCancelGuestInvite(inviteId)}
        />

        {showComposer ? (
          <div className={composerBarClass}>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => void onFileSelected(e.target.files?.[0])}
            />
            <button type="button" className={composerActionClass} title="Tag" aria-label="Tag" disabled>
              <HashIcon />
            </button>
            <button type="button" className={composerActionClass} title="Mention" aria-label="Mention" disabled>
              <AtIcon />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={composerActionClass}
              title="Attach file"
              aria-label="Attach file"
            >
              {uploading ? <span className="text-xs">…</span> : <PlusIcon />}
            </button>
            <button
              type="button"
              onClick={() => setGuestInviteOpen(true)}
              className={composerActionClass}
              title="Invite temporary guest"
              aria-label="Invite temporary guest"
            >
              <InviteIcon />
            </button>
            <label htmlFor="discussion-chat-input" className="sr-only">
              Your message
            </label>
            <input
              id="discussion-chat-input"
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={
                loadingHistory ? 'Loading messages…' : connected ? 'Write a message...' : 'Connecting...'
              }
              className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2 text-sm text-gray-900 outline-none placeholder:text-neutral-400 focus:ring-0 dark:text-white"
              disabled={!connected || sending || loadingHistory}
            />
            <button
              type="button"
              onClick={send}
              disabled={!connected || sending || loadingHistory || !input.trim()}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? '…' : 'Send'}
              <span className="h-1.5 w-1.5 rounded-full bg-white/90" aria-hidden />
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-neutral-400">Read-only conversation.</p>
        )}
      </div>
    </section>
  );
}
