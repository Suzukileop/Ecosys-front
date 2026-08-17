export type ConversationType = 'DIRECT' | 'GROUP';
export type MessageType = 'TEXT' | 'FILE' | 'SYSTEM' | 'CALL';
export type CallType = 'VOICE' | 'VIDEO';
export type CallSessionStatus = 'RINGING' | 'ACTIVE' | 'ENDED' | 'MISSED';
export type ParticipantRole = 'OWNER' | 'MEMBER' | 'GUEST';

export interface ConversationParticipant {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  role: ParticipantRole;
  joinedAt: string;
  lastReadAt?: string | null;
}

export interface ConversationReadReceipt {
  userId: string;
  readAt: string;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  typing: boolean;
}

export interface MessageDeliveryReceipt {
  messageId: string;
  userId: string;
  deliveredAt: string;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  /** Local blob URL for optimistic / in-flight media (not from API). */
  localPreviewUrl?: string | null;
}

export interface ConversationSummary {
  id: string;
  type?: ConversationType;
  title?: string | null;
  coverUrl?: string | null;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatarUrl?: string | null;
  participantCount?: number;
  lastMessagePreview?: string | null;
  lastMessageId?: string | null;
  lastMessageSenderId?: string | null;
  lastMessageAt?: string | null;
  otherUserLastReadAt?: string | null;
  unreadCount?: number;
  guestSession?: boolean;
  guestExpiresAt?: string | null;
  /** Isolated temporary guest room (not shown in permanent inbox). */
  temporarySession?: boolean;
  /** Archived for the current user only. */
  archived?: boolean;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  content?: string | null;
  messageType?: MessageType;
  attachments?: MessageAttachment[];
  sentAt: string;
  /** Client-only: message is uploading / not yet confirmed by server. */
  clientPending?: boolean;
  /** Client-only: upload failed. */
  clientFailed?: boolean;
}

export interface CreateConversationRequest {
  otherUserId: string;
}

export interface CreateGroupRequest {
  title: string;
  memberIds: string[];
}

export interface ConversationInvite {
  id: string;
  token: string;
  joinPath: string;
  expiresAt: string;
  maxUses: number;
  useCount: number;
}

export interface PendingConversationInvite {
  id: string;
  conversationId: string;
  conversationType: ConversationType;
  conversationTitle: string;
  inviterName: string;
  inviterAvatarUrl?: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface OutgoingGuestInvite {
  id: string;
  inviteeUserId: string;
  inviteeName: string;
  inviteeAvatarUrl?: string | null;
  expiresAt: string;
  createdAt: string;
}

export type TemporaryInboxEntryType =
  | 'INCOMING_INVITE'
  | 'OUTGOING_INVITE'
  | 'ACTIVE_GUEST'
  | 'ENDED_GUEST';

export interface TemporaryInboxMember {
  name: string;
  avatarUrl?: string | null;
}

export interface TemporaryInboxEntry {
  entryType: TemporaryInboxEntryType;
  id: string;
  conversationId: string;
  conversationTitle: string;
  headline: string;
  subtitle?: string | null;
  avatarUrl?: string | null;
  occurredAt: string;
  inviteId?: string | null;
  canOpen: boolean;
  members?: TemporaryInboxMember[];
}

export interface ConversationGuestSession {
  inviteId: string;
  guestUserId: string;
  guestName: string;
  guestAvatarUrl?: string | null;
  inviterUserId: string;
  inviterName: string;
  expiresAt: string;
  invitedAt: string;
}

export interface MessagingUserSummary {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
}

export interface CallSession {
  id: string;
  conversationId: string;
  initiatorId: string;
  initiatorName: string;
  callType: CallType;
  status: CallSessionStatus;
  startedAt: string;
  endedAt?: string | null;
}

export interface AttachmentAccess {
  url: string;
  fileName: string;
  contentType: string;
}
