'use client';

import { localeTag } from '@/lib/i18n/active';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MediaImage } from '@/components/ui/MediaImage';
import { ContextShortcut } from '@/components/messaging/conversation/ContextSummary';
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
import { useT } from '@/lib/i18n/I18nProvider';

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
  return date.toLocaleDateString(localeTag(), { month: 'short', day: 'numeric' });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** The details rows' 20px stroke glyph — News's RailGlyph geometry (24-unit box, round caps). */
function RowGlyph({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
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
      className="group relative aspect-square w-full overflow-hidden bg-[var(--cw-surface-soft)] transition-opacity hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--msg-ink)]"
    >
      {url && !isVideo ? (
        <MediaImage
          src={url}
          width={128}
          privateMedia
          alt={item.attachment.fileName}
          className="h-full w-full object-cover"
        />
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
  const t = useT();
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
        if (!cancelled) setError(getApiErrorMessage(e, t('Unable to load media.')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId, item.attachment.id, t]);

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
      setError(getApiErrorMessage(e, t('Unable to download media.')));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-[var(--msg-field)] px-3 py-4">
        {loading ? (
          <div className="h-48 w-full max-w-sm animate-pulse bg-neutral-200 dark:bg-neutral-800" />
        ) : error && !url ? (
          <p className="px-4 text-center text-[13px] text-[#F4212E]">{error}</p>
        ) : url && isVideo ? (
          <video
            src={url}
            controls
            className="max-h-[min(56vh,420px)] w-full bg-black object-contain"
            preload="metadata"
          >
            <track kind="captions" />
          </video>
        ) : url ? (
          <MediaImage
            src={url}
            widths={[640, 1280]}
            sizes="420px"
            privateMedia
            priority
            alt={item.attachment.fileName}
            className="max-h-[min(56vh,420px)] w-full object-contain"
          />
        ) : null}
      </div>

      <div className="shrink-0 px-4 py-4">
        <p className="truncate text-[15px] font-bold text-[var(--cw-text-primary)]">
          {item.attachment.fileName}
        </p>
        <p className="mt-0.5 text-[13px] text-[var(--cw-text-secondary)]">
          {formatShortDate(item.sentAt)}
          {item.attachment.sizeBytes > 0 ? ` · ${formatFileSize(item.attachment.sizeBytes)}` : ''}
        </p>
        {error ? <p className="mt-2 text-[13px] text-[#F4212E]">{error}</p> : null}
        <div className="mt-3 flex flex-col gap-2">
          {canJump ? (
            <button
              type="button"
              onClick={() => onJumpToMessage(item.messageId)}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--msg-hairline-strong)] px-4 text-[15px] font-bold text-[var(--msg-ink)] transition-colors hover:bg-[var(--msg-wash)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--msg-ink)]"
            >
              <svg className="h-4 w-4 shrink-0 text-[var(--cw-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {t('Go to message')}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={downloading || loading}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[var(--msg-primary)] px-4 text-[15px] font-bold text-[var(--msg-primary-ink)] transition-colors hover:bg-[var(--msg-primary-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--msg-ink)] disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {downloading ? t('Downloading…') : t('Download')}
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
  const t = useT();
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
      setError(getApiErrorMessage(e, t('Unable to load conversation details.')));
    } finally {
      setLoading(false);
    }
  }, [conversationId, refreshPins, t]);

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
      setError(t('Please choose an image file.'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t('Cover image must be 5 MB or smaller.'));
      return;
    }
    setUploadingCover(true);
    setError(null);
    try {
      const updated = await uploadGroupCover(conversationId, file);
      setCoverOverride(updated.coverUrl ?? null);
      onConversationUpdated?.();
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to update group cover.')));
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
      aria-label={t('Conversation')}
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

      {/* Head: phones came here from the thread, so they get a back arrow to it; desktop closes the
          column with an X. Sub-views (pins, media, search…) step back to the overview first. */}
      <div className="flex h-[calc(3.75rem+env(safe-area-inset-top))] shrink-0 items-center justify-between gap-2 px-3 pt-[env(safe-area-inset-top)] lg:h-16 lg:px-5 lg:pt-0">
        <div className="flex min-w-0 items-center gap-1">
          {view === 'overview' && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--cw-text-primary)] transition-colors hover:bg-[var(--msg-wash)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--msg-ink)] lg:hidden"
              aria-label={t('Back to conversation')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
            </button>
          ) : null}
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
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-2.5 text-[15px] font-bold text-[var(--cw-text-primary)] transition-colors hover:bg-[var(--msg-wash)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--msg-ink)] lg:-ml-2.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {view === 'media-viewer'
                ? mediaViewerReturnView === 'media'
                  ? t('Media')
                  : t('Back')
                : t('Back')}
            </button>
          ) : (
            <h2 className="truncate pl-1 text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[var(--cw-text-primary)] lg:pl-0">
              {t('Details')}
            </h2>
          )}
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 hidden h-10 w-10 items-center justify-center rounded-full text-[var(--cw-text-primary)] transition-colors hover:bg-[var(--msg-wash)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--msg-ink)] lg:inline-flex"
            aria-label={t('Close details')}
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
          <p className="px-5 pt-3 text-[13px] text-[#F4212E] lg:px-6">{error}</p>
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
          /* Overview, mobile-first: who this is — a centred 80px portrait, the name in bold 20px,
             "View profile" as the outlined pill — then one list of 48px rail rows (search, pins,
             media, people) with their counts at the right. Replaces the three count tiles plus a
             second "Shortcuts" list that pointed at the same places. */
          <div className="pb-6">
            {isGroup && SHOW_GROUP_CHAT && isOwner ? (
              <label className="mx-5 mb-2 mt-2 block cursor-pointer overflow-hidden bg-[var(--msg-field)] lg:mx-6">
                {coverUrl ? (
                  <MediaImage
                    src={coverUrl}
                    widths={[384, 640]}
                    sizes="360px"
                    className="h-28 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-28 items-center justify-center text-[14px] text-[var(--cw-text-muted)]">
                    {uploadingCover ? t('Uploading…') : t('Add a cover photo')}
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

            <div className="flex flex-col items-center px-5 pb-6 pt-4 text-center lg:px-6">
              <Avatar
                avatarUrl={isGroup ? coverUrl ?? conversation.otherUserAvatarUrl : conversation.otherUserAvatarUrl}
                name={conversation.otherUserName}
                size="xl"
                tone="muted"
              />
              <p className="mt-3 max-w-full truncate text-[20px] font-extrabold leading-6 tracking-[-0.015em] text-[var(--cw-text-primary)]">
                {conversation.otherUserName}
              </p>
              {isGroup ? (
                <p className="mt-1 text-[14px] text-[var(--cw-text-secondary)]">
                  {t('{participantsLength} participants', { participantsLength: participants.length })}
                </p>
              ) : null}
              {!isGroup && conversation.otherUserId ? (
                <Link
                  href={marketplaceCreatorProfileHref(
                    conversation.otherUserId,
                    `/messages?conversation=${encodeURIComponent(conversation.id)}`
                  )}
                  className="mt-4 inline-flex h-10 items-center rounded-full px-5 text-[14px] font-semibold text-[var(--cw-text-primary)] shadow-[inset_0_0_0_1px_var(--msg-hairline-strong)] transition-colors hover:bg-[var(--msg-wash)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--msg-ink)]"
                >
                  {t('View profile')}
                </Link>
              ) : null}
            </div>

            <h3 className="px-5 pb-1 text-[15px] font-semibold leading-5 text-[color:var(--gn-ink)] lg:px-6">
              {t('In this conversation')}
            </h3>
            <nav aria-label={t('Conversation details')} className="flex flex-col">
              <ContextShortcut
                label={t('Search in conversation')}
                onClick={openMessageSearch}
                icon={
                  <RowGlyph>
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4.2-4.2" />
                  </RowGlyph>
                }
              />
              <ContextShortcut
                label={t('Pinned messages')}
                meta={pinnedMessages.length}
                onClick={() => setView('pins')}
                icon={
                  <RowGlyph>
                    <path d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-6.5-4.5L5.5 20V5.5a1 1 0 0 1 1-1z" />
                  </RowGlyph>
                }
              />
              <ContextShortcut
                label={t('Shared media')}
                meta={mediaItems.length}
                onClick={() => setView('media')}
                icon={
                  <RowGlyph>
                    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
                    <circle cx="8.5" cy="10" r="1.6" />
                    <path d="m21 16-5-5-9 8.5" />
                  </RowGlyph>
                }
              />
              <ContextShortcut
                label={t('People')}
                meta={participants.length}
                onClick={() => setView('people')}
                icon={
                  <RowGlyph>
                    <circle cx="9" cy="8" r="3.5" />
                    <path d="M3 19.5a6 6 0 0 1 12 0M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.2a6 6 0 0 1 3 5.3" />
                  </RowGlyph>
                }
              />
            </nav>
          </div>
        ) : view === 'pins' ? (
          <div className="space-y-2 px-5 py-4 lg:px-6">
            {pinnedMessages.length === 0 ? (
              <p className="py-8 text-center text-[15px] text-[var(--cw-text-secondary)]">{t('No pinned messages.')}</p>
            ) : (
              pinnedMessages.map((message) => (
                <article key={message.id} className="bg-[var(--msg-field)] px-4 py-3">
                  <p className="text-[13px] font-bold text-[var(--cw-text-primary)]">{message.senderName}</p>
                  <p className="mt-0.5 line-clamp-3 text-[15px] leading-5 text-[var(--cw-text-primary)]">
                    {message.content?.trim() || (message.attachments?.length ? t('Attachment') : t('Message'))}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <time className="text-[13px] text-[var(--cw-text-muted)]" dateTime={message.sentAt}>
                      {formatShortDate(message.sentAt)}
                    </time>
                    <button
                      type="button"
                      onClick={() => togglePinnedMessage(conversationId, message.id)}
                      className="text-[13px] font-bold text-[var(--cw-text-secondary)] hover:text-[#F4212E]"
                    >
                      {t('Remove')}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        ) : view === 'media' ? (
          <div className="px-5 py-4 lg:px-6">
            {mediaItems.length === 0 ? (
              <p className="py-8 text-center text-[15px] text-[var(--cw-text-secondary)]">{t('No shared media yet.')}</p>
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
          <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-4 lg:px-6">
            <div className="relative shrink-0">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cw-text-secondary)]"
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
                placeholder={t('Search messages…')}
                className="h-10 w-full rounded-full border-0 bg-[var(--msg-field)] py-2 pl-10 pr-4 text-[15px] text-[var(--cw-text-primary)] outline-hidden ring-0 transition placeholder:text-[var(--cw-text-secondary)] focus:ring-1 focus:ring-[var(--msg-ink)]"
                autoComplete="off"
              />
            </div>
            {!messageSearch.trim() ? (
              <p className="py-10 text-center text-[13px] text-[var(--cw-text-secondary)]">
                {t('Type a word or phrase to find messages in this conversation.')}
              </p>
            ) : messageSearchResults.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-[var(--cw-text-secondary)]">
                {t('No messages match “{trim}”.', { trim: messageSearch.trim() })}
              </p>
            ) : (
              <ul className="space-y-1.5" role="listbox" aria-label={t('Message search results')}>
                <li className="px-0.5 pb-1 text-[12px] font-medium text-[var(--cw-text-secondary)]">
                  {messageSearchResults.length} {t('result')}{messageSearchResults.length === 1 ? '' : 's'}
                </li>
                {messageSearchResults.map((message) => {
                  const preview = buildSearchPreview(message, messageSearch);
                  return (
                    <li key={message.id}>
                      <button
                        type="button"
                        onClick={() => jumpToMessage(message.id)}
                        className="flex w-full flex-col gap-1 bg-[var(--msg-field)] px-4 py-3 text-left transition-colors hover:bg-[var(--msg-wash)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--msg-ink)]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13px] font-semibold text-[var(--cw-text-primary)]">
                            {message.senderName || t('Member')}
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
                            <mark className="rounded-xs bg-[var(--msg-wash)] px-0.5 font-bold text-[var(--cw-text-primary)]">
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
          <div className="space-y-2 px-5 py-4 lg:px-6">
            {isGroup && SHOW_GROUP_CHAT ? (
              <>
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cw-text-muted)]"
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
                    placeholder={t('Search people…')}
                    className="h-10 w-full rounded-full border-0 bg-[var(--msg-field)] py-2 pl-10 pr-4 text-[15px] text-[var(--cw-text-primary)] outline-hidden ring-0 transition placeholder:text-[var(--cw-text-secondary)] focus:ring-1 focus:ring-[var(--msg-ink)]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setAddMemberOpen(true)}
                  className="flex min-h-10 w-full items-center justify-center gap-2 rounded-full px-4 text-[14px] font-semibold text-[var(--cw-text-primary)] shadow-[inset_0_0_0_1px_var(--msg-hairline-strong)] transition-colors hover:bg-[var(--msg-wash)]"
                >
                  <span className="text-base leading-none">+</span>
                  {t('Add member')}
                </button>
              </>
            ) : (
              <input
                ref={searchInputRef}
                type="search"
                value={peopleSearch}
                onChange={(e) => setPeopleSearch(e.target.value)}
                placeholder={t('Search people…')}
                className="h-11 w-full rounded-full border-0 bg-[var(--msg-field)] px-4 text-[16px] text-[var(--cw-text-primary)] outline-hidden ring-0 transition-[box-shadow] placeholder:text-[var(--cw-text-secondary)] focus:shadow-[inset_0_0_0_2px_var(--msg-ink)] focus:outline-hidden focus:ring-0 lg:text-[15px]"
              />
            )}
            {filteredParticipants.length === 0 ? (
              <p className="py-8 text-center text-[15px] text-[var(--cw-text-secondary)]">{t('No people found.')}</p>
            ) : (
              filteredParticipants
                .filter((member) => {
                  if (!peopleSearch.trim() || isGroup) return true;
                  return member.fullName.toLowerCase().includes(peopleSearch.trim().toLowerCase());
                })
                .map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-3 bg-[var(--msg-field)] px-4 py-2.5"
                  >
                    <Avatar avatarUrl={member.avatarUrl} name={member.fullName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold text-[var(--cw-text-primary)]">{member.fullName}</p>
                      <p className="text-[13px] text-[var(--cw-text-muted)]">{formatRole(member.role)}</p>
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
