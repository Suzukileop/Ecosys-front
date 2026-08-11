'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

const AddGroupMemberModal = dynamic(
  () => import('@/components/messaging/AddGroupMemberModal').then((module) => module.AddGroupMemberModal),
  { ssr: false }
);
import { getApiErrorMessage } from '@/lib/api-error';
import { getPinnedMessageIds, togglePinnedMessage } from '@/lib/discussion-pins';
import {
  getAttachmentViewUrl,
  listConversationMessages,
  listConversationParticipants,
  uploadGroupCover,
} from '@/lib/messaging';
import {
  isAttachmentLoadFailed,
  isAttachmentNotFoundError,
  markAttachmentLoadFailed,
} from '@/lib/messaging-attachments';
import type {
  ConversationParticipant,
  ConversationSummary,
  ConversationType,
  DirectMessage,
  MessageAttachment,
} from '@/types/messaging';
import { ThreadBackgroundPicker } from '@/components/messaging/ThreadBackgroundPicker';

type DiscussionDetailsPanelProps = {
  conversation: ConversationSummary;
  embedded?: boolean;
  onClose?: () => void;
  onConversationUpdated?: () => void;
  onOpenThemesGallery?: () => void;
};

type MediaItem = {
  attachment: MessageAttachment;
  messageId: string;
  sentAt: string;
};

type DetailsTab = 'pins' | 'media' | 'people' | 'files';

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
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function TabButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative shrink-0 px-3 py-2.5 text-xs font-medium transition ${
        active
          ? 'text-neutral-900 dark:text-white'
          : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-1.5 text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500">{count}</span>
      )}
      {active && (
        <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-neutral-900 dark:bg-white" aria-hidden />
      )}
    </button>
  );
}

function MediaThumb({
  conversationId,
  item,
}: {
  conversationId: string;
  item: MediaItem;
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

  const sizeClass = 'h-16 w-16 shrink-0';

  return (
    <a
      href={url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      title={item.attachment.fileName}
      onClick={(e) => {
        if (!url) e.preventDefault();
      }}
      className={`group relative overflow-hidden rounded-lg bg-neutral-200 ring-1 ring-black/5 transition hover:ring-neutral-400 dark:bg-neutral-900 dark:ring-white/10 ${sizeClass}`}
    >
      {url && !isVideo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={item.attachment.fileName} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-neutral-400">
          <span className="text-lg">{isVideo ? '▶' : '📎'}</span>
        </div>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-4 text-[9px] text-white opacity-0 transition group-hover:opacity-100">
        {formatShortDate(item.sentAt)}
      </span>
    </a>
  );
}

function EmptyBlock({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 px-4 py-8 text-center dark:border-neutral-700 dark:bg-neutral-900/40">
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{title}</p>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
    </div>
  );
}

export function DiscussionDetailsPanel({
  conversation,
  embedded = false,
  onClose,
  onConversationUpdated,
  onOpenThemesGallery,
}: DiscussionDetailsPanelProps) {
  const { user } = useAuth();
  const conversationId = conversation.id;
  const conversationType: ConversationType = conversation.type ?? 'DIRECT';
  const isGroup = conversationType === 'GROUP';

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [tab, setTab] = useState<DetailsTab>('media');
  const [peopleSearch, setPeopleSearch] = useState('');
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(conversation.coverUrl ?? null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const refreshPins = useCallback(() => {
    setPinnedIds(getPinnedMessageIds(conversationId));
  }, [conversationId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [page, members] = await Promise.all([
        listConversationMessages(conversationId, 0, 100),
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

  const fileItems = useMemo((): MediaItem[] => {
    const items: MediaItem[] = [];
    for (const message of messages) {
      for (const attachment of message.attachments ?? []) {
        if (!isVisualMedia(attachment.contentType)) {
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

  useEffect(() => {
    setCoverUrl(conversation.coverUrl ?? null);
  }, [conversation.coverUrl, conversation.id]);

  useEffect(() => {
    if (!isGroup) setPeopleSearch('');
  }, [isGroup, conversationId]);

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
      setCoverUrl(updated.coverUrl ?? null);
      onConversationUpdated?.();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to update group cover.'));
    } finally {
      setUploadingCover(false);
    }
  };

  const addMember = () => {
    setAddMemberOpen(true);
  };

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden" aria-label="Conversation overview">
      {isGroup && addMemberOpen && (
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
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {!embedded && (
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 px-5">
        <div className="min-w-0 leading-tight">
          <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Thread
          </p>
          <h2 className="truncate text-base font-semibold text-neutral-900 dark:text-white">Overview</h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white lg:hidden"
            aria-label="Close overview"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      )}

      <div className="shrink-0 px-5 py-4">
        {isGroup ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900">
              {isOwner ? (
                <label className="group relative block cursor-pointer">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt="" className="h-28 w-full object-cover" />
                  ) : (
                    <div className="flex h-28 items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
                      {uploadingCover ? 'Uploading…' : 'Add a cover photo'}
                    </div>
                  )}
                  <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" aria-hidden />
                  <span className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition group-hover:opacity-100">
                    {uploadingCover ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </span>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploadingCover}
                    onChange={(e) => void handleCoverUpload(e.target.files?.[0] ?? null)}
                  />
                </label>
              ) : coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="" className="h-28 w-full object-cover" />
              ) : (
                <div className="flex h-28 items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
                  No cover photo
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Avatar
                avatarUrl={coverUrl ?? conversation.otherUserAvatarUrl}
                name={conversation.otherUserName}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-neutral-900 dark:text-white">
                  {conversation.otherUserName}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  Group · {participants.length} members
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar avatarUrl={conversation.otherUserAvatarUrl} name={conversation.otherUserName} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-neutral-900 dark:text-white">
                {conversation.otherUserName}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">Direct message</p>
            </div>
          </div>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: 'Pinned', value: pinnedMessages.length },
            { label: 'Media', value: mediaItems.length },
            { label: isGroup ? 'Members' : 'People', value: participants.length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-neutral-100 px-2 py-2 text-center dark:bg-neutral-900"
            >
              <p className="text-base font-semibold tabular-nums text-neutral-900 dark:text-white">{stat.value}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <ThreadBackgroundPicker onSeeMore={onOpenThemesGallery} />

      <div className="flex shrink-0 gap-0 overflow-x-auto px-3">
        <TabButton active={tab === 'pins'} label="Pins" count={pinnedMessages.length} onClick={() => setTab('pins')} />
        <TabButton active={tab === 'media'} label="Gallery" count={mediaItems.length} onClick={() => setTab('media')} />
        <TabButton
          active={tab === 'people'}
          label={isGroup ? 'Members' : 'People'}
          count={participants.length}
          onClick={() => setTab('people')}
        />
        {fileItems.length > 0 && (
          <TabButton active={tab === 'files'} label="Files" count={fileItems.length} onClick={() => setTab('files')} />
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white p-4 dark:bg-neutral-900 [scrollbar-width:thin] [scrollbar-color:#a3a3a3_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-400 dark:[scrollbar-color:#525252_transparent] [&::-webkit-scrollbar-thumb]:dark:bg-neutral-600">
        {error && <p className="mb-3 text-xs text-red-600 dark:text-red-400">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {tab === 'pins' && (
              <div className="space-y-2">
                {pinnedMessages.length === 0 ? (
                  <EmptyBlock
                    title="No pinned items"
                    hint="Hover a message in the chat and tap the pin icon to save it here."
                  />
                ) : (
                  pinnedMessages.map((message) => (
                    <article
                      key={message.id}
                      className="rounded-xl bg-neutral-100 px-3 py-2.5 dark:bg-neutral-900"
                    >
                      <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                        {message.senderName}
                      </p>
                      <p className="mt-1 line-clamp-3 text-xs text-neutral-700 dark:text-neutral-300">
                        {message.content?.trim() || (message.attachments?.length ? 'Shared attachment' : 'Message')}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <time className="text-[10px] text-neutral-400" dateTime={message.sentAt}>
                          {formatShortDate(message.sentAt)}
                        </time>
                        <button
                          type="button"
                          onClick={() => togglePinnedMessage(conversationId, message.id)}
                          className="text-[10px] font-semibold text-neutral-500 hover:text-red-600 dark:hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {tab === 'media' && (
              <div>
                {mediaItems.length === 0 ? (
                  <EmptyBlock title="No media yet" hint="Photos and videos shared in this thread appear here." />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {mediaItems.map((item) => (
                      <MediaThumb key={item.attachment.id} conversationId={conversationId} item={item} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'people' && (
              <div className="space-y-2">
                {isGroup && (
                  <>
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
                        type="search"
                        value={peopleSearch}
                        onChange={(e) => setPeopleSearch(e.target.value)}
                        placeholder="Search members..."
                        className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-300 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-500 dark:focus:ring-neutral-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addMember}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      <span className="text-base leading-none">+</span>
                      Add member
                    </button>
                  </>
                )}
                {isGroup && filteredParticipants.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                    No members match your search.
                  </p>
                ) : (
                  filteredParticipants.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center gap-3 rounded-xl bg-neutral-100 px-3 py-2.5 dark:bg-neutral-900"
                    >
                      <Avatar avatarUrl={member.avatarUrl} name={member.fullName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                          {member.fullName}
                        </p>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{formatRole(member.role)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'files' && (
              <ul className="space-y-2">
                {fileItems.map((item) => (
                  <li
                    key={item.attachment.id}
                    className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-sm dark:bg-neutral-800">
                      📄
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-neutral-800 dark:text-neutral-200">
                        {item.attachment.fileName}
                      </p>
                      <p className="text-[10px] text-neutral-400">{formatShortDate(item.sentAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
      </div>
    </aside>
  );
}

export { isMessagePinned, togglePinnedMessage } from '@/lib/discussion-pins';
