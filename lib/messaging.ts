import api from '@/lib/api';
import { normalizeSpringPage } from '@/lib/ecosystem';
import type { PagedResponse, SpringPageRaw } from '@/types/ecosystem';
import type {
  AttachmentAccess,
  CallSession,
  CallType,
  ConversationGuestSession,
  ConversationInvite,
  ConversationParticipant,
  ConversationSummary,
  CreateConversationRequest,
  CreateGroupRequest,
  DirectMessage,
  MessageType,
  MessagingUserSummary,
  OutgoingGuestInvite,
  PendingConversationInvite,
  TemporaryInboxEntry,
} from '@/types/messaging';

type RawConversationSummary = Partial<ConversationSummary> & {
  otherUserFullName?: string | null;
  lastMessageContent?: string | null;
};

type RawDirectMessage = Partial<DirectMessage> & {
  messageType?: MessageType;
};

function normalizeConversationSummary(raw: RawConversationSummary): ConversationSummary {
  const isGroup = raw.type === 'GROUP';
  const otherUserName =
    (isGroup ? raw.title?.trim() : null) ||
    raw.otherUserName?.trim() ||
    raw.otherUserFullName?.trim() ||
    'Member';

  return {
    id: String(raw.id ?? ''),
    type: raw.type ?? 'DIRECT',
    title: raw.title ?? null,
    coverUrl: raw.coverUrl ?? null,
    otherUserId: String(raw.otherUserId ?? ''),
    otherUserName,
    otherUserAvatarUrl: raw.otherUserAvatarUrl ?? (isGroup ? raw.coverUrl ?? null : null),
    participantCount: raw.participantCount ?? (isGroup ? 0 : 2),
    lastMessagePreview: raw.lastMessagePreview ?? raw.lastMessageContent ?? null,
    lastMessageId: raw.lastMessageId != null ? String(raw.lastMessageId) : null,
    lastMessageSenderId: raw.lastMessageSenderId != null ? String(raw.lastMessageSenderId) : null,
    lastMessageAt: raw.lastMessageAt ?? null,
    otherUserLastReadAt: raw.otherUserLastReadAt ?? null,
    unreadCount: Number(raw.unreadCount ?? 0),
    guestSession: Boolean(raw.guestSession),
    guestExpiresAt: raw.guestExpiresAt ?? null,
  };
}

export function normalizeDirectMessage(raw: Partial<DirectMessage> & { messageType?: MessageType }): DirectMessage {
  return normalizeMessage(raw as RawDirectMessage);
}

function normalizeMessage(raw: RawDirectMessage): DirectMessage {
  return {
    id: String(raw.id ?? ''),
    conversationId: String(raw.conversationId ?? ''),
    senderId: String(raw.senderId ?? ''),
    senderName: raw.senderName?.trim() || 'Member',
    senderAvatarUrl: raw.senderAvatarUrl ?? null,
    content: raw.content ?? null,
    messageType: raw.messageType ?? 'TEXT',
    attachments: raw.attachments ?? [],
    sentAt: String(raw.sentAt ?? ''),
  };
}

function unwrapConversationList(
  data: RawConversationSummary[] | SpringPageRaw<RawConversationSummary>
): ConversationSummary[] {
  const items = Array.isArray(data) ? data : data.content ?? [];
  return items.map(normalizeConversationSummary);
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const res = await api.get<RawConversationSummary[] | SpringPageRaw<RawConversationSummary>>(
    '/api/messaging/conversations'
  );
  return unwrapConversationList(res.data);
}

export async function createOrGetConversation(otherUserId: string): Promise<ConversationSummary> {
  const body: CreateConversationRequest = { otherUserId };
  const res = await api.post<RawConversationSummary>('/api/messaging/conversations', body);
  return normalizeConversationSummary(res.data);
}

export async function createGroupConversation(
  body: CreateGroupRequest,
  cover?: File | null
): Promise<ConversationSummary> {
  if (cover) {
    const form = new FormData();
    form.append('title', body.title.trim());
    form.append('memberIds', JSON.stringify(body.memberIds));
    form.append('cover', cover);
    const res = await api.post<RawConversationSummary>('/api/messaging/conversations/group', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeConversationSummary(res.data);
  }

  const res = await api.post<RawConversationSummary>('/api/messaging/conversations/group', body);
  return normalizeConversationSummary(res.data);
}

export async function uploadGroupCover(conversationId: string, cover: File): Promise<ConversationSummary> {
  const form = new FormData();
  form.append('cover', cover);
  const res = await api.post<RawConversationSummary>(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/cover`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return normalizeConversationSummary(res.data);
}

export async function addConversationMember(conversationId: string, userId: string): Promise<ConversationSummary> {
  const res = await api.post<RawConversationSummary>(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/members`,
    { userId }
  );
  return normalizeConversationSummary(res.data);
}

export async function listConversationParticipants(conversationId: string): Promise<ConversationParticipant[]> {
  const res = await api.get<ConversationParticipant[]>(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/participants`
  );
  return (res.data ?? []).map((p) => ({
    userId: String(p.userId),
    fullName: p.fullName?.trim() || 'Member',
    avatarUrl: p.avatarUrl ?? null,
    role: p.role ?? 'MEMBER',
    joinedAt: String(p.joinedAt ?? ''),
    lastReadAt: p.lastReadAt ? String(p.lastReadAt) : null,
  }));
}

export async function listConversationMessages(
  conversationId: string,
  page = 0,
  size = 50
): Promise<PagedResponse<DirectMessage>> {
  const res = await api.get<SpringPageRaw<RawDirectMessage>>(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/messages`,
    { params: { page, size } }
  );
  const pageNorm = normalizeSpringPage(res.data);
  return { ...pageNorm, content: pageNorm.content.map(normalizeMessage) };
}

export async function sendFileMessage(
  conversationId: string,
  file: File,
  content?: string
): Promise<DirectMessage> {
  const form = new FormData();
  form.append('file', file);
  if (content?.trim()) form.append('content', content.trim());
  const res = await api.post<RawDirectMessage>(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/messages`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return normalizeMessage(res.data);
}

export async function sendTextMessage(conversationId: string, content: string): Promise<DirectMessage> {
  const res = await api.post<RawDirectMessage>(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/messages`,
    { content: content.trim() }
  );
  return normalizeMessage(res.data);
}

export async function deleteConversationMessage(conversationId: string, messageId: string): Promise<void> {
  await api.delete(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`
  );
}

export async function markConversationRead(conversationId: string): Promise<void> {
  await api.post(`/api/messaging/conversations/${encodeURIComponent(conversationId)}/read`);
}

export async function getAttachmentViewUrl(
  conversationId: string,
  attachmentId: string
): Promise<AttachmentAccess> {
  const res = await api.get<AttachmentAccess>(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/attachments/${encodeURIComponent(attachmentId)}/view`
  );
  return res.data;
}

export async function getAttachmentDownloadUrl(
  conversationId: string,
  attachmentId: string
): Promise<AttachmentAccess> {
  const res = await api.get<AttachmentAccess>(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/attachments/${encodeURIComponent(attachmentId)}/download`
  );
  return res.data;
}

export async function createConversationInvite(
  conversationId: string,
  expiresInHours = 48,
  maxUses = 5
): Promise<ConversationInvite> {
  const res = await api.post<ConversationInvite>(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/invites`,
    { expiresInHours, maxUses }
  );
  return res.data;
}

export async function acceptConversationInvite(token: string): Promise<ConversationSummary> {
  const res = await api.post<RawConversationSummary>(
    `/api/messaging/invites/${encodeURIComponent(token)}/accept`
  );
  return normalizeConversationSummary(res.data);
}

export async function createDirectGuestInvite(
  conversationId: string,
  inviteeUserId: string,
  expiresInHours = 48
): Promise<PendingConversationInvite> {
  const res = await api.post<PendingConversationInvite>(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/invites/direct`,
    { inviteeUserId, expiresInHours }
  );
  return {
    ...res.data,
    id: String(res.data.id),
    conversationId: String(res.data.conversationId),
  };
}

export async function listTemporaryInbox(): Promise<TemporaryInboxEntry[]> {
  const res = await api.get<TemporaryInboxEntry[]>('/api/messaging/temporary/inbox');
  return (res.data ?? []).map((entry) => ({
    ...entry,
    id: String(entry.id),
    conversationId: String(entry.conversationId),
    inviteId: entry.inviteId != null ? String(entry.inviteId) : null,
  }));
}

export async function listPendingGuestInvites(): Promise<PendingConversationInvite[]> {
  const res = await api.get<PendingConversationInvite[]>('/api/messaging/invites/pending');
  return (res.data ?? []).map((invite) => ({
    ...invite,
    id: String(invite.id),
    conversationId: String(invite.conversationId),
  }));
}

export async function acceptDirectGuestInvite(inviteId: string): Promise<ConversationSummary> {
  const res = await api.post<RawConversationSummary>(
    `/api/messaging/invites/direct/${encodeURIComponent(inviteId)}/accept`
  );
  return normalizeConversationSummary(res.data);
}

export async function declineDirectGuestInvite(inviteId: string): Promise<void> {
  await api.post(`/api/messaging/invites/direct/${encodeURIComponent(inviteId)}/decline`);
}

export async function listOutgoingGuestInvites(conversationId: string): Promise<OutgoingGuestInvite[]> {
  const res = await api.get<OutgoingGuestInvite[]>(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/invites/outgoing`
  );
  return (res.data ?? []).map((invite) => ({
    ...invite,
    id: String(invite.id),
    inviteeUserId: String(invite.inviteeUserId),
  }));
}

export async function cancelOutgoingGuestInvite(conversationId: string, inviteId: string): Promise<void> {
  await api.delete(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/invites/${encodeURIComponent(inviteId)}`
  );
}

export async function listConversationGuests(conversationId: string): Promise<ConversationGuestSession[]> {
  const res = await api.get<ConversationGuestSession[]>(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/guests`
  );
  return (res.data ?? []).map((guest) => ({
    ...guest,
    inviteId: String(guest.inviteId),
    guestUserId: String(guest.guestUserId),
    inviterUserId: String(guest.inviterUserId),
  }));
}

export async function revokeConversationGuest(conversationId: string, guestUserId: string): Promise<void> {
  await api.delete(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/guests/${encodeURIComponent(guestUserId)}`
  );
}

export async function leaveConversationAsGuest(conversationId: string): Promise<void> {
  await api.post(`/api/messaging/conversations/${encodeURIComponent(conversationId)}/guests/leave`);
}

export async function searchMessagingUsers(query: string, page = 0, size = 20): Promise<MessagingUserSummary[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const res = await api.get<Array<{ id: string; fullName: string; avatarUrl?: string | null }>>(
    '/api/messaging/users/search',
    { params: { q, page, size } }
  );
  return (res.data ?? []).map((user) => ({
    id: String(user.id),
    fullName: user.fullName?.trim() || 'Member',
    avatarUrl: user.avatarUrl ?? null,
  }));
}

export async function startCall(conversationId: string, callType: CallType = 'VOICE'): Promise<CallSession> {
  const res = await api.post<CallSession>(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/calls`,
    { callType }
  );
  return res.data;
}

export async function answerCall(conversationId: string, callId: string): Promise<CallSession> {
  const res = await api.post<CallSession>(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/calls/${encodeURIComponent(callId)}/answer`
  );
  return res.data;
}

export async function endCall(conversationId: string, callId: string): Promise<CallSession> {
  const res = await api.post<CallSession>(
    `/api/messaging/conversations/${encodeURIComponent(conversationId)}/calls/${encodeURIComponent(callId)}/end`
  );
  return res.data;
}
