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
};

export function MessageCard({
  mine,
  sentAt,
  children = null,
  media = null,
  status = null,
  actions,
}: MessageCardProps) {
  const hasBody = children != null && children !== false && children !== '';
  const mediaOnly = Boolean(media) && !hasBody;

  return (
    <div className={`group/msg relative flex w-full min-w-0 items-start gap-1 ${mine ? 'justify-end' : 'justify-start'}`}>
      {mine && actions ? (
        <div className="mt-1 shrink-0 opacity-0 transition group-hover/msg:opacity-100 focus-within:opacity-100">
          {actions}
        </div>
      ) : null}
      <div
        className={`relative max-w-[min(100%,520px)] overflow-hidden rounded-[var(--cw-radius,8px)] ${
          mediaOnly
            ? 'border-0 bg-transparent p-0'
            : media && hasBody
              ? `border p-0 ${
                  mine
                    ? 'border-[var(--cw-accent,#F47B20)]/20 bg-[var(--cw-accent-soft,#FFF1E6)] dark:border-[var(--cw-border,#262626)] dark:bg-[var(--cw-accent-soft,#3a2414)]'
                    : 'border-[var(--cw-border,#E2E5E9)] bg-[var(--cw-surface-soft,#FCFCFB)]'
                }`
              : `border px-3.5 py-2.5 ${
                  mine
                    ? 'border-[var(--cw-accent,#F47B20)]/20 bg-[var(--cw-accent-soft,#FFF1E6)] dark:border-[var(--cw-border,#262626)] dark:bg-[var(--cw-accent-soft,#3a2414)]'
                    : 'border-[var(--cw-border,#E2E5E9)] bg-[var(--cw-surface-soft,#FCFCFB)]'
                }`
        }`}
      >
        {media ? <div className="bg-transparent">{media}</div> : null}
        {hasBody ? (
          <div className={media ? 'px-3.5 py-2.5' : undefined}>
            <div className="text-[14px] leading-relaxed text-[var(--cw-text-primary,#17191C)] [overflow-wrap:anywhere] whitespace-pre-wrap break-words">
              {children}
            </div>
            <div className={`mt-2 flex items-end gap-1.5 ${mine ? 'justify-end' : 'justify-start'}`}>
              <time dateTime={sentAt} className="text-[10px] leading-none text-[var(--cw-text-muted,#9AA1AA)]">
                {formatConversationTime(sentAt)}
              </time>
              {mine && status ? <MessageStatusIndicator status={status} variant="chat" /> : null}
            </div>
          </div>
        ) : (
          <div className={`mt-1.5 flex items-end gap-1.5 ${mine ? 'justify-end' : 'justify-start'}`}>
            <time dateTime={sentAt} className="text-[10px] leading-none text-[var(--cw-text-muted,#9AA1AA)]">
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
