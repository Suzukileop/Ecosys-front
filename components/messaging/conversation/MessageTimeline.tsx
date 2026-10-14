'use client';

import type { ReactNode } from 'react';
import { DateSeparator } from '@/components/messaging/conversation/DateSeparator';
import { LinkifiedText } from '@/components/messaging/conversation/LinkifiedText';
import { MessageCard } from '@/components/messaging/conversation/MessageCard';
import { MessageIdentity } from '@/components/messaging/conversation/MessageIdentity';
import { buildMessageTimeline } from '@/components/messaging/conversation/timeline-utils';
import { MessageAttachmentView, attachmentIsVisualMedia } from '@/components/messaging/MessageAttachmentView';
import { MessageActionsMenu } from '@/components/messaging/MessageActionsMenu';
import type { MessageStatusType } from '@/components/messaging/MessageStatusIndicator';
import { MessageProductPreview } from '@/components/messaging/conversation/MessageProductPreview';
import { isGuestSessionTrace } from '@/lib/guest-session-trace';
import { extractProductLink } from '@/lib/marketplace-api';
import type { DirectMessage } from '@/types/messaging';
import { useT } from '@/lib/i18n/I18nProvider';

type MessageTimelineProps = {
  messages: DirectMessage[];
  conversationId: string;
  currentUserId?: string | null;
  resolveAvatarUrl: (message: DirectMessage) => string | null | undefined;
  getOutgoingStatus: (message: DirectMessage) => MessageStatusType | null;
  onTransfer: (message: DirectMessage) => void;
  onDelete?: (message: DirectMessage) => void;
  emptyLabel: string;
  /** Replaces the one-line empty label (a new conversation's intro). */
  emptyState?: ReactNode;
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
  emptyState,
  loading = false,
  highlightedMessageId = null,
}: MessageTimelineProps) {
  const t = useT();
  const timeline = buildMessageTimeline(messages);

  // Keep inbox switches fluid: no centered spinner while history loads.
  if (loading && messages.length === 0) {
    return <div className="min-h-[4rem]" aria-busy="true" />;
  }

  if (messages.length === 0) {
    return (
      emptyState ?? <p className="px-6 py-20 text-center text-[15px] leading-5 text-[var(--msg-ink-faint)]">{emptyLabel}</p>
    );
  }

  /*
   * Runs: consecutive messages from the same sender within 5 minutes read as one block (X DM) —
   * tight 2px gaps, the avatar and the time only on the last bubble of the run.
   */
  const RUN_GAP_MS = 5 * 60 * 1000;
  const sameRun = (a: DirectMessage, b: DirectMessage | undefined) => {
    if (!b || b.messageType === 'SYSTEM' || a.messageType === 'SYSTEM') return false;
    if (a.senderId !== b.senderId) return false;
    const gap = new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
    return Number.isFinite(gap) && gap >= 0 && gap < RUN_GAP_MS;
  };

  return (
    <div className="relative px-0 py-4 sm:px-1">
      <div>
        {timeline.map((item, index) => {
          if (item.kind === 'date') {
            return <DateSeparator key={item.key} label={t(item.label)} />;
          }

          const m = item.message;
          const isSystem = m.messageType === 'SYSTEM';
          if (isSystem) {
            const guestTrace = isGuestSessionTrace(m.content);
            return (
              /* The room speaking, not a participant: centred meta line, no pill. */
              <p key={m.id} className="msg-micro py-3 text-center text-[var(--msg-ink-faint)]">
                <span className={guestTrace ? 'inline-block max-w-[80%] leading-[1.5]' : undefined}>
                  {m.content}
                </span>
              </p>
            );
          }

          const nextItem = timeline[index + 1];
          const prevItem = timeline[index - 1];
          const next = nextItem?.kind === 'message' ? nextItem.message : undefined;
          const prev = prevItem?.kind === 'message' ? prevItem.message : undefined;
          const continuesRun = sameRun(m, next);
          const continuesPrev = prev ? sameRun(prev, m) : false;
          const mine = currentUserId != null && m.senderId === currentUserId;
          const status = getOutgoingStatus(m);
          const visualAttachments = (m.attachments ?? []).filter(attachmentIsVisualMedia);
          const fileAttachments = (m.attachments ?? []).filter((a) => !attachmentIsVisualMedia(a));
          const productLink = extractProductLink(m.content);
          const caption = productLink ? productLink.rest : m.content;
          const hasCaption = Boolean(caption?.trim());

          return (
            <div
              key={m.id}
              data-message-id={m.id}
              className={`relative flex items-end gap-2 ${continuesPrev ? 'pt-0.5' : 'pt-3'} ${
                m.clientPending ? 'opacity-90' : m.clientFailed ? 'opacity-60' : 'opacity-100'
              }`}
            >
              {!mine ? (
                continuesRun ? (
                  <span aria-hidden className="w-8 shrink-0" />
                ) : (
                  <div className="mb-[22px] shrink-0">
                    <MessageIdentity
                      name={m.senderName || 'Member'}
                      avatarUrl={resolveAvatarUrl(m)}
                    />
                  </div>
                )
              ) : null}
              <div className={`min-w-0 ${mine ? 'ml-auto' : ''} max-w-[88%] sm:max-w-[min(100%,560px)]`}>
                <MessageCard
                  mine={mine}
                  showMeta={!continuesRun}
                  groupedWithNext={continuesRun}
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
                    visualAttachments.length > 0 || productLink ? (
                      <>
                        {productLink && <MessageProductPreview productId={productLink.productId} />}
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
                      {hasCaption && caption ? <LinkifiedText text={caption} /> : null}
                    </>
                  ) : visualAttachments.length === 0 && !productLink ? (
                    t('Message')
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
