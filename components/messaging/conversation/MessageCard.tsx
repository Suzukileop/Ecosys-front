'use client';

import type { ReactNode } from 'react';
import { MessageStatusIndicator, type MessageStatusType } from '@/components/messaging/MessageStatusIndicator';
import { formatConversationTime } from '@/components/messaging/conversation/timeline-utils';

type MessageCardProps = {
  mine: boolean;
  sentAt: string;
  children?: ReactNode;
  media?: ReactNode;
  status?: MessageStatusType | null;
  actions?: ReactNode;
  highlighted?: boolean;
};

export function MessageCard({
  mine,
  sentAt,
  children = null,
  media = null,
  status = null,
  actions,
  highlighted = false,
}: MessageCardProps) {
  const hasBody = children != null && children !== false && children !== '';
  const mediaOnly = Boolean(media) && !hasBody;

  const incomingShell =
    'bg-[var(--cw-incoming-bg,#F3F4F6)] dark:bg-[var(--cw-incoming-bg,#262626)]';
  const outgoingShell =
    'bg-[var(--cw-accent-soft,#FFF1E6)] dark:bg-[var(--cw-accent-soft,#3a2414)]';
  const highlightShell =
    'ring-2 ring-neutral-500 ring-offset-1 ring-offset-[var(--msg-thread-bg,#FAFAFA)] dark:ring-neutral-400 dark:ring-offset-[var(--msg-thread-bg,#111111)]';

  return (
    <div
      className={`group/msg relative flex min-w-0 items-start gap-1 ${mine ? 'justify-end' : 'justify-start'}`}
    >
      {mine && actions ? (
        <div className="mt-1 shrink-0 opacity-0 transition group-hover/msg:opacity-100 focus-within:opacity-100">
          {actions}
        </div>
      ) : null}
      <div
        className={`relative w-fit max-w-[min(100%,520px)] overflow-hidden rounded-[var(--cw-radius,8px)] transition-[box-shadow] duration-300 ${
          mediaOnly
            ? `border-0 bg-transparent p-0 ${highlighted ? highlightShell : ''}`
            : media && hasBody
              ? `p-0 ${mine ? outgoingShell : incomingShell} ${highlighted ? highlightShell : ''}`
              : `px-3.5 py-2.5 ${mine ? outgoingShell : incomingShell} ${highlighted ? highlightShell : ''}`
        }`}
      >
        {media ? <div className="bg-transparent">{media}</div> : null}
        {hasBody ? (
          <div className={media ? 'px-3.5 py-2.5' : undefined}>
            <div className="text-[14px] leading-relaxed text-[var(--cw-text-primary,#17191C)] [overflow-wrap:anywhere] whitespace-pre-wrap break-words">
              {children}
            </div>
            <div className={`mt-2 flex items-end gap-1.5 ${mine ? 'justify-end' : 'justify-start'}`}>
              <time
                dateTime={sentAt}
                className="text-[13px] leading-none text-[var(--cw-text-secondary,#4B5563)]"
              >
                {formatConversationTime(sentAt)}
              </time>
              {mine && status ? <MessageStatusIndicator status={status} variant="chat" /> : null}
            </div>
          </div>
        ) : (
          <div className={`mt-1.5 flex items-end gap-1.5 ${mine ? 'justify-end' : 'justify-start'}`}>
            <time
              dateTime={sentAt}
              className="text-[13px] leading-none text-[var(--cw-text-secondary,#4B5563)]"
            >
              {formatConversationTime(sentAt)}
            </time>
            {mine && status ? <MessageStatusIndicator status={status} variant="chat" /> : null}
          </div>
        )}
      </div>
      {!mine && actions ? (
        <div className="mt-1 shrink-0 opacity-0 transition group-hover/msg:opacity-100 focus-within:opacity-100">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
