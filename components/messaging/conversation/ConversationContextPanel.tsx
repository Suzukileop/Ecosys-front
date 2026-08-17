'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ContextShortcut, ContextSummary } from '@/components/messaging/conversation/ContextSummary';
import { useAuth } from '@/context/AuthContext';
import { SHOW_GROUP_CHAT } from '@/lib/messaging-feature-flags';
import { getApiErrorMessage } from '@/lib/api-error';
import { getPinnedMessageIds, togglePinnedMessage } from '@/lib/discussion-pins';
import {
  getAttachmentDownloadUrl,
  getAttachmentViewUrl,
  listConversationMessages,
  listConversationParticipants,
  uploadGroupCover,
} from '@/lib/messaging';
import { buildSearchPreview, filterMessagesBySearchQuery } from '@/lib/messaging-message-search';
import {
  isAttachmentLoadFailed,
  isAttachmentNotFoundError,
  markAttachmentLoadFailed,
} from '@/lib/messaging-attachments';
import { marketplaceCreatorProfileHref } from '@/lib/marketplace-nav';
import type {
  ConversationParticipant,
  ConversationSummary,
  ConversationType,
  DirectMessage,
  MessageAttachment,
} from '@/types/messaging';

const AddGroupMemberModal = dynamic(
  () => import('@/components/messaging/AddGroupMemberModal').then((module) => module.AddGroupMemberModal),
  { ssr: false }
);

type ConversationContextPanelProps = {
  conversation: ConversationSummary;
  embedded?: boolean;
  onClose?: () => void;
  onConversationUpdated?: () => void;
};

type MediaItem = {
  attachment: MessageAttachment;
  messageId: string;
  sentAt: string;
};

type DetailsView = 'overview' | 'pins' | 'media' | 'media-viewer' | 'people' | 'search';

function isVisualMedia(contentType: string): boolean {
  return contentType.startsWith('image/') || contentType.startsWith('video/');
}

function formatRole(role: string): string {
  if (role === 'OWNER') return 'Owner';
  if (role === 'GUEST') return 'Guest';
  return 'Member';
}

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaThumb({
  conversationId,
  item,
  onOpen,
}: {
  conversationId: string;
  item: MediaItem;
  onOpen: (item: MediaItem) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const isVideo = item.attachment.contentType.startsWith('video/');

  useEffect(() => {
    let cancelled = false;
    if (isAttachmentLoadFailed(conversationId, item.attachment.id)) {
      setUrl(null);
      return;
    }
    (async () => {
      try {
        const access = await getAttachmentViewUrl(conversationId, item.attachment.id);
        if (!cancelled) setUrl(access.url);
      } catch (error) {
        if (!cancelled) {
          if (isAttachmentNotFoundError(error)) {
            markAttachmentLoadFailed(conversationId, item.attachment.id);
          }
          setUrl(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId, item.attachment.id]);

  return (
    <button
      type="button"
      title={item.attachment.fileName}
      onClick={() => onOpen(item)}
      className="group relative aspect-square w-full overflow-hidden rounded-[10px] bg-[var(--cw-surface-soft)] ring-1 ring-neutral-300 transition hover:ring-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:ring-neutral-700"
    >
      {url && !isVideo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={item.attachment.fileName} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[var(--cw-text-muted)]">
          <span className="text-2xl" aria-hidden>
            {isVideo ? '▶' : '📎'}
          </span>
        </div>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-5 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
        {formatShortDate(item.sentAt)}
      </span>
    </button>
  );
}

function MediaViewerPanel({
  conversationId,
  item,
  onJumpToMessage,
}: {
  conversationId: string;
  item: MediaItem;
  onJumpToMessage: (messageId: string) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const isVideo = item.attachment.contentType.startsWith('video/');
  const canJump = Boolean(item.messageId) && !item.messageId.startsWith('optimistic-');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setUrl(null);
    (async () => {
      try {
        const access = await getAttachmentViewUrl(conversationId, item.attachment.id);
        if (!cancelled) setUrl(access.url);
      } catch (e) {
        if (!cancelled) setError(getApiErrorMessage(e, 'Unable to load media.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId, item.attachment.id]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const access = await getAttachmentDownloadUrl(conversationId, item.attachment.id);
      const link = document.createElement('a');
      link.href = access.url;
      link.download = access.fileName || item.attachment.fileName;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to download media.'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-neutral-100 px-3 py-4 dark:bg-neutral-950">
        {loading ? (
          <div className="h-48 w-full max-w-sm animate-pulse rounded-[10px] bg-neutral-200 dark:bg-neutral-800" />
        ) : error && !url ? (
          <p className="px-4 text-center text-[13px] text-red-600">{error}</p>
        ) : url && isVideo ? (
          <video
            src={url}
            controls
            className="max-h-[min(56vh,420px)] w-full rounded-[10px] bg-black object-contain"
            preload="metadata"
          >
            <track kind="captions" />
          </video>
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={item.attachment.fileName}
            className="max-h-[min(56vh,420px)] w-full rounded-[10px] object-contain"
          />
        ) : null}
      </div>

      <div className="shrink-0 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <p className="truncate text-sm font-semibold text-[var(--cw-text-primary)]">
          {item.attachment.fileName}
        </p>
        <p className="mt-0.5 text-[12px] text-[var(--cw-text-secondary)]">
          {formatShortDate(item.sentAt)}
          {item.attachment.sizeBytes > 0 ? ` · ${formatFileSize(item.attachment.sizeBytes)}` : ''}
        </p>
        {error ? <p className="mt-2 text-[12px] text-red-600">{error}</p> : null}
        <div className="mt-3 flex flex-col gap-2">
          {canJump ? (
            <button
              type="button"
              onClick={() => onJumpToMessage(item.messageId)}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-neutral-300 bg-white px-3 text-[13px] font-medium text-[var(--cw-text-primary)] transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/50 dark:border-neutral-700 dark:bg-transparent dark:hover:bg-neutral-900"
            >
              <svg className="h-4 w-4 shrink-0 text-[var(--cw-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Go to message
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={downloading || loading}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-neutral-900 px-3 text-[13px] font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/50 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {downloading ? 'Downloading…' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConversationContextPanel({
  conversation,
  onClose,
  onConversationUpdated,
}: ConversationContextPanelProps) {
  const { user } = useAuth();
  const conversationId = conversation.id;
  const conversationType: ConversationType = conversation.type ?? 'DIRECT';
  const isGroup = conversationType === 'GROUP';

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [view, setView] = useState<DetailsView>('overview');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [mediaViewerReturnView, setMediaViewerReturnView] = useState<'overview' | 'media'>('media');
  const [peopleSearch, setPeopleSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [coverOverride, setCoverOverride] = useState<string | null | undefined>(undefined);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messageSearchInputRef = useRef<HTMLInputElement>(null);
  const coverUrl = coverOverride !== undefined ? coverOverride : (conversation.coverUrl ?? null);

  const refreshPins = useCallback(() => {
    setPinnedIds(getPinnedMessageIds(conversationId));
  }, [conversationId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [page, members] = await Promise.all([
        listConversationMessages(conversationId, 0, 200),
        listConversationParticipants(conversationId),
      ]);
      setMessages([...page.content].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()));
      setParticipants(members);
      refreshPins();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load conversation details.'));
    } finally {
      setLoading(false);
    }
  }, [conversationId, refreshPins]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const onPinsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ conversationId: string }>).detail;
      if (detail?.conversationId === conversationId) refreshPins();
    };
    window.addEventListener('discussion-pins-updated', onPinsUpdated);
    return () => window.removeEventListener('discussion-pins-updated', onPinsUpdated);
  }, [conversationId, refreshPins]);

  useEffect(() => {
    const onNavigate = (event: Event) => {
      const detail = (event as CustomEvent<{ conversationId?: string; view?: DetailsView }>).detail;
      if (detail?.conversationId && detail.conversationId !== conversationId) return;
      if (detail?.view) {
        if (detail.view !== 'media-viewer') setSelectedMedia(null);
        setView(detail.view);
        if (detail.view === 'people') {
          window.setTimeout(() => searchInputRef.current?.focus(), 50);
        }
        if (detail.view === 'search') {
          window.setTimeout(() => messageSearchInputRef.current?.focus(), 50);
        }
      }
    };
    window.addEventListener('discussion-context-navigate', onNavigate);
    return () => window.removeEventListener('discussion-context-navigate', onNavigate);
  }, [conversationId]);

  useEffect(() => {
    const onOpenMedia = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          conversationId?: string;
          attachment?: MessageAttachment;
          messageId?: string;
          sentAt?: string;
          from?: 'media' | 'chat';
        }>
      ).detail;
      if (detail?.conversationId && detail.conversationId !== conversationId) return;
      if (!detail?.attachment || !isVisualMedia(detail.attachment.contentType)) return;
      setSelectedMedia({
        attachment: detail.attachment,
        messageId: detail.messageId ?? detail.attachment.id,
        sentAt: detail.sentAt ?? new Date().toISOString(),
      });
      setMediaViewerReturnView(detail.from === 'media' ? 'media' : 'overview');
      setView('media-viewer');
    };
    window.addEventListener('discussion-open-media', onOpenMedia);
    return () => window.removeEventListener('discussion-open-media', onOpenMedia);
  }, [conversationId]);

  useEffect(() => {
    setMessageSearch('');
    setPeopleSearch('');
    setSelectedMedia(null);
    setView('overview');
  }, [conversationId]);

  const openMediaViewer = useCallback((item: MediaItem, from: 'media' | 'overview' = 'media') => {
    setSelectedMedia(item);
    setMediaViewerReturnView(from);
    setView('media-viewer');
  }, []);

  const closeMediaViewer = useCallback(() => {
    setSelectedMedia(null);
    setView(mediaViewerReturnView);
  }, [mediaViewerReturnView]);

  const mediaItems = useMemo((): MediaItem[] => {
    const items: MediaItem[] = [];
    for (const message of messages) {
      for (const attachment of message.attachments ?? []) {
        if (isVisualMedia(attachment.contentType)) {
          items.push({ attachment, messageId: message.id, sentAt: message.sentAt });
        }
      }
    }
    return items.reverse();
  }, [messages]);

  const pinnedMessages = useMemo(
    () => messages.filter((m) => pinnedIds.includes(m.id)),
    [messages, pinnedIds]
  );

  const filteredParticipants = useMemo(() => {
    if (!isGroup) return participants;
    const query = peopleSearch.trim().toLowerCase();
    if (!query) return participants;
    return participants.filter((member) => {
      const name = member.fullName.toLowerCase();
      const role = formatRole(member.role).toLowerCase();
      return name.includes(query) || role.includes(query);
    });
  }, [isGroup, participants, peopleSearch]);

  const isOwner = useMemo(
    () => participants.some((member) => member.userId === user?.id && member.role === 'OWNER'),
    [participants, user?.id]
  );

  const handleCoverUpload = async (file: File | null) => {
    if (!file || !isGroup) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Cover image must be 5 MB or smaller.');
      return;
    }
    setUploadingCover(true);
    setError(null);
    try {
      const updated = await uploadGroupCover(conversationId, file);
      setCoverOverride(updated.coverUrl ?? null);
      onConversationUpdated?.();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to update group cover.'));
    } finally {
      setUploadingCover(false);
    }
  };

  const openMessageSearch = () => {
    setView('search');
    window.setTimeout(() => messageSearchInputRef.current?.focus(), 50);
  };

  const messageSearchResults = useMemo(
    () => filterMessagesBySearchQuery(messages, messageSearch),
    [messages, messageSearch]
  );

  const jumpToMessage = (messageId: string) => {
    window.dispatchEvent(
      new CustomEvent('discussion-scroll-to-message', {
        detail: { conversationId, messageId },
      })
    );
    // On small screens details cover the thread — close so the jump is visible.
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      onClose?.();
    }
  };

  return (
    <aside
      className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--cw-surface)]"
      aria-label="Conversation"
    >
      {isGroup && SHOW_GROUP_CHAT && addMemberOpen && (
        <AddGroupMemberModal
          conversationId={conversationId}
          currentUserId={user?.id}
          onClose={() => setAddMemberOpen(false)}
          onAdded={() => {
            void loadData();
            onConversationUpdated?.();
          }}
        />
      )}

      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-neutral-200 px-4 dark:border-neutral-800">
        <div className="min-w-0">
          {view !== 'overview' ? (
            <button
              type="button"
              onClick={() => {
                if (view === 'media-viewer') {
                  closeMediaViewer();
                  return;
                }
                setView('overview');
              }}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-[var(--cw-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {view === 'media-viewer'
                ? mediaViewerReturnView === 'media'
                  ? 'Media'
                  : 'Back'
                : 'Back'}
            </button>
          ) : (
            <h2 className="truncate text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--cw-text-secondary)]">
              Conversation
            </h2>
          )}
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-[var(--cw-text-secondary)] transition hover:bg-[var(--cw-surface-soft)] hover:text-[var(--cw-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cw-accent)]/35"
            aria-label="Close details"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>

      <div
        className={`min-h-0 flex-1 [scrollbar-width:thin] ${
          view === 'media-viewer' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'
        }`}
      >
        {error && view !== 'media-viewer' ? (
          <p className="px-4 pt-3 text-xs text-red-600">{error}</p>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : view === 'media-viewer' && selectedMedia ? (
          <MediaViewerPanel
            conversationId={conversationId}
            item={selectedMedia}
            onJumpToMessage={jumpToMessage}
          />
        ) : view === 'overview' ? (
          <div className="px-4 py-4">
            {isGroup && SHOW_GROUP_CHAT && isOwner ? (
              <label className="mb-4 block cursor-pointer overflow-hidden rounded-[8px] bg-[var(--cw-surface-soft)]">
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverUrl} alt="" className="h-28 w-full object-cover" />
                ) : (
                  <div className="flex h-28 items-center justify-center text-sm text-[var(--cw-text-muted)]">
                    {uploadingCover ? 'Uploading…' : 'Add a cover photo'}
                  </div>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploadingCover}
                  onChange={(e) => void handleCoverUpload(e.target.files?.[0] ?? null)}
                />
              </label>
            ) : null}

            <div className="flex items-center gap-3">
              <Avatar
                avatarUrl={isGroup ? coverUrl ?? conversation.otherUserAvatarUrl : conversation.otherUserAvatarUrl}
                name={conversation.otherUserName}
                size="lg"
                tone="muted"
              />
              <div className="min-w-0 flex-1">
                {!isGroup && conversation.otherUserId ? (
                  <Link
                    href={marketplaceCreatorProfileHref(
                      conversation.otherUserId,
                      `/dashboard/discussions?conversation=${encodeURIComponent(conversation.id)}`
                    )}
                    className="block truncate text-base font-semibold text-[var(--cw-text-primary)] transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40"
                    title="View profile"
                  >
                    {conversation.otherUserName}
                  </Link>
                ) : (
                  <p className="truncate text-base font-semibold text-[var(--cw-text-primary)]">
                    {conversation.otherUserName}
                  </p>
                )}
                {isGroup ? (
                  <p className="mt-0.5 text-[13px] text-[var(--cw-text-secondary)]">
                    {participants.length} participants
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5">
              <h3 className="mb-2 px-0.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--cw-text-secondary)]">
                Summary
              </h3>
              <ContextSummary
                items={[
                  { label: 'Pinned', value: pinnedMessages.length, onClick: () => setView('pins') },
                  { label: 'Media', value: mediaItems.length, onClick: () => setView('media') },
                  { label: 'People', value: participants.length, onClick: () => setView('people') },
                ]}
              />
            </div>

            <div className="mt-6">
              <h3 className="mb-2 px-0.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--cw-text-secondary)]">
                Shortcuts
              </h3>
              <div className="space-y-0.5">
                <ContextShortcut
                  label="Search in conversation"
                  onClick={openMessageSearch}
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
                <ContextShortcut
                  label="Shared media"
                  onClick={() => setView('media')}
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>
        ) : view === 'pins' ? (
          <div className="space-y-2 p-4">
            {pinnedMessages.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--cw-text-secondary)]">No pinned messages.</p>
            ) : (
              pinnedMessages.map((message) => (
                <article key={message.id} className="rounded-[8px] border border-[var(--cw-border)] bg-[var(--cw-surface-soft)] px-3 py-2.5">
                  <p className="text-[10px] font-medium text-[var(--cw-text-muted)]">{message.senderName}</p>
                  <p className="mt-1 line-clamp-3 text-xs text-[var(--cw-text-primary)]">
                    {message.content?.trim() || (message.attachments?.length ? 'Attachment' : 'Message')}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <time className="text-[10px] text-[var(--cw-text-muted)]" dateTime={message.sentAt}>
                      {formatShortDate(message.sentAt)}
                    </time>
                    <button
                      type="button"
                      onClick={() => togglePinnedMessage(conversationId, message.id)}
                      className="text-[10px] font-semibold text-[var(--cw-text-secondary)] hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        ) : view === 'media' ? (
          <div className="p-4">
            {mediaItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--cw-text-secondary)]">No shared media yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {mediaItems.map((item) => (
                  <MediaThumb
                    key={item.attachment.id}
                    conversationId={conversationId}
                    item={item}
                    onOpen={(media) => openMediaViewer(media, 'media')}
                  />
                ))}
              </div>
            )}
          </div>
        ) : view === 'search' ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
            <div className="relative shrink-0">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cw-text-secondary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={messageSearchInputRef}
                type="search"
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                placeholder="Search messages…"
                className="h-11 w-full rounded-[8px] border border-neutral-300 bg-[var(--cw-surface-soft)] py-2.5 pl-9 pr-3 text-sm text-[var(--cw-text-primary)] outline-none placeholder:text-[var(--cw-text-secondary)] focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400/40 dark:border-neutral-700 dark:focus:border-neutral-400"
                autoComplete="off"
              />
            </div>
            {!messageSearch.trim() ? (
              <p className="py-10 text-center text-[13px] text-[var(--cw-text-secondary)]">
                Type a word or phrase to find messages in this conversation.
              </p>
            ) : messageSearchResults.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-[var(--cw-text-secondary)]">
                No messages match “{messageSearch.trim()}”.
              </p>
            ) : (
              <ul className="space-y-1.5" role="listbox" aria-label="Message search results">
                <li className="px-0.5 pb-1 text-[12px] font-medium text-[var(--cw-text-secondary)]">
                  {messageSearchResults.length} result{messageSearchResults.length === 1 ? '' : 's'}
                </li>
                {messageSearchResults.map((message) => {
                  const preview = buildSearchPreview(message, messageSearch);
                  return (
                    <li key={message.id}>
                      <button
                        type="button"
                        onClick={() => jumpToMessage(message.id)}
                        className="flex w-full flex-col gap-1 rounded-[8px] border border-[var(--cw-border)] bg-[var(--cw-surface-soft)] px-3 py-2.5 text-left transition hover:border-[var(--cw-accent)]/35 hover:bg-[var(--cw-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13px] font-semibold text-[var(--cw-text-primary)]">
                            {message.senderName || 'Member'}
                          </span>
                          <time
                            className="shrink-0 text-[12px] text-[var(--cw-text-secondary)]"
                            dateTime={message.sentAt}
                          >
                            {formatShortDate(message.sentAt)}
                          </time>
                        </div>
                        <p className="line-clamp-3 text-[13px] leading-snug text-[var(--cw-text-secondary)]">
                          <span>{preview.before}</span>
                          {preview.match ? (
                            <mark className="rounded-sm bg-[var(--cw-accent-soft)] px-0.5 font-semibold text-[var(--cw-accent)] dark:bg-[var(--cw-accent)]/25">
                              {preview.match}
                            </mark>
                          ) : null}
                          <span>{preview.after}</span>
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {isGroup && SHOW_GROUP_CHAT ? (
              <>
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cw-text-muted)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={peopleSearch}
                    onChange={(e) => setPeopleSearch(e.target.value)}
                    placeholder="Search people…"
                    className="h-11 w-full rounded-[8px] border border-[var(--cw-border)] bg-[var(--cw-surface-soft)] py-2.5 pl-9 pr-3 text-sm text-[var(--cw-text-primary)] outline-none transition-[border-color] placeholder:text-[var(--cw-text-muted)] focus:border-[var(--cw-text-muted)] focus:outline-none focus:ring-0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setAddMemberOpen(true)}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-[var(--cw-border)] bg-[var(--cw-surface)] px-3 text-xs font-medium text-[var(--cw-text-primary)] transition hover:bg-[var(--cw-surface-soft)]"
                >
                  <span className="text-base leading-none">+</span>
                  Add member
                </button>
              </>
            ) : (
              <input
                ref={searchInputRef}
                type="search"
                value={peopleSearch}
                onChange={(e) => setPeopleSearch(e.target.value)}
                placeholder="Search people…"
                className="h-11 w-full rounded-[8px] border border-[var(--cw-border)] bg-[var(--cw-surface-soft)] px-3 text-sm text-[var(--cw-text-primary)] outline-none transition-[border-color] placeholder:text-[var(--cw-text-muted)] focus:border-[var(--cw-text-muted)] focus:outline-none focus:ring-0"
              />
            )}
            {filteredParticipants.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--cw-text-secondary)]">No people found.</p>
            ) : (
              filteredParticipants
                .filter((member) => {
                  if (!peopleSearch.trim() || isGroup) return true;
                  return member.fullName.toLowerCase().includes(peopleSearch.trim().toLowerCase());
                })
                .map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-3 rounded-[8px] border border-[var(--cw-border)] bg-[var(--cw-surface-soft)] px-3 py-2.5"
                  >
                    <Avatar avatarUrl={member.avatarUrl} name={member.fullName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--cw-text-primary)]">{member.fullName}</p>
                      <p className="text-[10px] text-[var(--cw-text-muted)]">{formatRole(member.role)}</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
