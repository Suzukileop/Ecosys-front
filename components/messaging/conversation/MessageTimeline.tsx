'use client';

import type { ReactNode } from 'react';
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
  loadingNode?: ReactNode;
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
  loadingNode,
}: MessageTimelineProps) {
  const timeline = buildMessageTimeline(messages);

  if (loading) {
    return <div className="flex min-h-[12rem] items-center justify-center py-16">{loadingNode}</div>;
  }

  if (messages.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-[var(--cw-text-secondary,#68707A)]">{emptyLabel}</p>
    );
  }

  return (
    <div className="relative px-1 py-2 sm:px-2">
      <div
        className="pointer-events-none absolute bottom-8 left-[calc(2.5rem+0.5rem)] top-8 hidden w-px bg-[var(--cw-accent,#F47B20)]/35 sm:left-[calc(2.75rem+0.5rem)] sm:block"
        aria-hidden
      />
      <div className="space-y-1">
        {timeline.map((item) => {
          if (item.kind === 'date') {
            return <DateSeparator key={item.key} label={item.label} />;
          }

          const m = item.message;
          const isSystem = m.messageType === 'SYSTEM';
          if (isSystem) {
            const guestTrace = isGuestSessionTrace(m.content);
            return (
              <p
                key={m.id}
                className="py-2 text-center text-xs text-[var(--cw-text-muted,#9AA1AA)]"
              >
                {guestTrace ? (
                  <span className="inline-flex max-w-[92%] flex-col items-center gap-0.5 rounded-[8px] border border-[var(--cw-border)] bg-[var(--cw-surface-soft)] px-3 py-1.5 text-[11px] leading-snug text-[var(--cw-text-secondary)]">
                    <span>{m.content}</span>
                  </span>
                ) : (
                  m.content
                )}
              </p>
            );
          }

          const mine = currentUserId != null && m.senderId === currentUserId;
          const status = getOutgoingStatus(m);
          const visualAttachments = (m.attachments ?? []).filter(attachmentIsVisualMedia);
          const fileAttachments = (m.attachments ?? []).filter((a) => !attachmentIsVisualMedia(a));
          const hasCaption = Boolean(m.content?.trim());

          return (
            <div key={m.id} className="relative flex items-start gap-2 py-2.5 sm:gap-2.5">
              {!mine ? (
                <MessageIdentity
                  name={m.senderName || 'Member'}
                  avatarUrl={resolveAvatarUrl(m)}
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <MessageCard
                  mine={mine}
                  sentAt={m.sentAt}
                  status={status}
                  actions={
                    <MessageActionsMenu
                      message={m}
                      conversationId={conversationId}
                      mine={mine}
                      onTransfer={onTransfer}
                      onDelete={mine ? onDelete : undefined}
                    />
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
