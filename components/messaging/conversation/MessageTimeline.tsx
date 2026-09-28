'use client';

import { DateSeparator } from '@/components/messaging/conversation/DateSeparator';
import { MessageCard } from '@/components/messaging/conversation/MessageCard';
import { MessageIdentity } from '@/components/messaging/conversation/MessageIdentity';
import { buildMessageTimeline } from '@/components/messaging/conversation/timeline-utils';
import { MessageAttachmentView, attachmentIsVisualMedia } from '@/components/messaging/MessageAttachmentView';
import { MessageActionsMenu } from '@/components/messaging/MessageActionsMenu';
import type { MessageStatusType } from '@/components/messaging/MessageStatusIndicator';
import { isGuestSessionTrace } from '@/lib/guest-session-trace';
import type { DirectMessage } from '@/types/messaging';

type MessageTimelineProps = {
  messages: DirectMessage[];
  conversationId: string;
  currentUserId?: string | null;
  resolveAvatarUrl: (message: DirectMessage) => string | null | undefined;
  getOutgoingStatus: (message: DirectMessage) => MessageStatusType | null;
  onTransfer: (message: DirectMessage) => void;
  onDelete?: (message: DirectMessage) => void;
  emptyLabel: string;
  loading?: boolean;
  highlightedMessageId?: string | null;
};

export function MessageTimeline({
  messages,
  conversationId,
  currentUserId,
  resolveAvatarUrl,
  getOutgoingStatus,
  onTransfer,
  onDelete,
  emptyLabel,
  loading = false,
  highlightedMessageId = null,
}: MessageTimelineProps) {
  const timeline = buildMessageTimeline(messages);

  // Keep inbox switches fluid: no centered spinner while history loads.
  if (loading && messages.length === 0) {
    return <div className="min-h-[4rem]" aria-busy="true" />;
  }

  if (messages.length === 0) {
    return (
      <p className="py-20 text-center text-sm font-light text-[var(--msg-ink-faint)]">{emptyLabel}</p>
    );
  }

  return (
    <div className="relative px-1 py-4 sm:px-2">
      {/*
        * The thread spine. It used to be the accent at 35%, which made a coloured line run the
        * full height of the conversation and compete with the words next to it. At hairline
        * weight it still organises the column and is never the thing you look at.
        */}
      <div
        className="pointer-events-none absolute bottom-10 left-[calc(2.5rem+0.5rem)] top-10 hidden w-px bg-[var(--msg-hairline)] sm:left-[calc(2.75rem+0.5rem)] sm:block"
        aria-hidden
      />
      <div className="space-y-0">
        {timeline.map((item) => {
          if (item.kind === 'date') {
            return <DateSeparator key={item.key} label={item.label} />;
          }

          const m = item.message;
          const isSystem = m.messageType === 'SYSTEM';
          if (isSystem) {
            const guestTrace = isGuestSessionTrace(m.content);
            return (
              /*
               * A system line is the room speaking, not a participant. It is set in the same
               * micro-caps as the date rules so it reads as part of the thread's scaffolding,
               * and the pill the guest trace used to sit in is gone — it was a box drawn
               * around one sentence.
               */
              <p key={m.id} className="msg-micro py-4 text-center text-[var(--msg-ink-faint)]">
                <span className={guestTrace ? 'inline-block max-w-[80%] leading-[1.8]' : undefined}>
                  {m.content}
                </span>
              </p>
            );
          }

          const mine = currentUserId != null && m.senderId === currentUserId;
          const status = getOutgoingStatus(m);
          const visualAttachments = (m.attachments ?? []).filter(attachmentIsVisualMedia);
          const fileAttachments = (m.attachments ?? []).filter((a) => !attachmentIsVisualMedia(a));
          const hasCaption = Boolean(m.content?.trim());

          return (
            <div
              key={m.id}
              data-message-id={m.id}
              className={`relative flex items-start gap-3 py-3.5 sm:gap-3.5 ${
                m.clientPending ? 'opacity-90' : m.clientFailed ? 'opacity-60' : 'opacity-100'
              }`}
            >
              {!mine ? (
                <MessageIdentity
                  name={m.senderName || 'Member'}
                  avatarUrl={resolveAvatarUrl(m)}
                />
              ) : null}
              <div className={`min-w-0 ${mine ? 'ml-auto' : ''} max-w-[min(100%,520px)]`}>
                <MessageCard
                  mine={mine}
                  sentAt={m.sentAt}
                  status={status}
                  highlighted={highlightedMessageId === m.id}
                  actions={
                    m.clientPending || m.clientFailed ? null : (
                      <MessageActionsMenu
                        message={m}
                        conversationId={conversationId}
                        mine={mine}
                        onTransfer={onTransfer}
                        onDelete={mine ? onDelete : undefined}
                      />
                    )
                  }
                  media={
                    visualAttachments.length > 0 ? (
                      <>
                        {visualAttachments.map((att) => (
                          <div key={att.id} className="overflow-hidden bg-transparent">
                            <MessageAttachmentView
                              conversationId={conversationId}
                              attachment={att}
                              mine={mine}
                              embedded
                              sentAt={m.sentAt}
                              messageId={m.id}
                            />
                          </div>
                        ))}
                      </>
                    ) : null
                  }
                >
                  {fileAttachments.length > 0 || hasCaption ? (
                    <>
                      {fileAttachments.map((att) => (
                        <div key={att.id} className="mb-2 last:mb-0">
                          <MessageAttachmentView
                            conversationId={conversationId}
                            attachment={att}
                            mine={mine}
                          />
                        </div>
                      ))}
                      {hasCaption ? m.content : null}
                    </>
                  ) : visualAttachments.length === 0 ? (
                    'Message'
                  ) : null}
                </MessageCard>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
