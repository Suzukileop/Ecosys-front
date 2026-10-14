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
  /** Last message of a run from the same sender: shows the time (and status) under it. */
  showMeta?: boolean;
  /** Joins the bubble to the next one of the same run (tail corner stays round). */
  groupedWithNext?: boolean;
};

/**
 * One message: a 15/20 bubble — mine filled in a soft grey (x-messages.css), theirs outlined with no
 * fill, so the two sides read apart by fill as well as by side. No accent hue anywhere. The tail corner (bottom, sender side) is squared on the
 * last bubble of a run; the time sits under that last bubble only, in secondary ink.
 */
export function MessageCard({
  mine,
  sentAt,
  children = null,
  media = null,
  status = null,
  actions,
  highlighted = false,
  showMeta = true,
  groupedWithNext = false,
}: MessageCardProps) {
  const hasBody = children != null && children !== false && children !== '';

  const tail = groupedWithNext ? '' : mine ? 'rounded-br-[4px]' : 'rounded-bl-[4px]';
  const bubbleTone = mine
    ? 'bg-[var(--msg-bubble-mine)] text-[var(--msg-bubble-mine-ink)]'
    : 'bg-[var(--msg-bubble-theirs)] text-[var(--msg-ink)] shadow-[inset_0_0_0_1px_var(--xm-bubble-line)]';
  const highlightRing = highlighted
    ? 'ring-2 ring-[var(--msg-ink)] ring-offset-2 ring-offset-[var(--msg-panel)]'
    : '';

  const meta = showMeta ? (
    <div className={`mt-1 flex items-center gap-1 px-1 ${mine ? 'justify-end' : 'justify-start'}`}>
      <time dateTime={sentAt} className="msg-micro text-[var(--msg-ink-faint)]">
        {formatConversationTime(sentAt)}
      </time>
      {mine && status ? (
        <span className="text-[var(--msg-ink-faint)]">
          <MessageStatusIndicator status={status} variant="chat" />
        </span>
      ) : null}
    </div>
  ) : null;

  const actionSlot = actions ? (
    <div className="shrink-0 self-center text-[var(--msg-ink-faint)] opacity-0 transition-opacity duration-200 group-focus-within/msg:opacity-100 group-hover/msg:opacity-100">
      {actions}
    </div>
  ) : null;

  return (
    <div className={`group/msg relative flex min-w-0 items-start gap-1 ${mine ? 'justify-end' : 'justify-start'}`}>
      {mine ? actionSlot : null}

      <div
        tabIndex={0}
        className={`flex min-w-0 max-w-[min(100%,520px)] flex-col outline-none ${mine ? 'items-end' : 'items-start'}`}
      >
        {media ? (
          <div
            className={`max-w-full overflow-hidden rounded-[16px] transition-shadow duration-300 ${hasBody ? '' : tail} ${highlightRing}`}
          >
            {media}
          </div>
        ) : null}

        {hasBody ? (
          <div
            className={`msg-bubble w-fit max-w-full rounded-[22px] px-4 py-2.5 text-[15px] leading-5 [overflow-wrap:anywhere] whitespace-pre-wrap break-words transition-shadow duration-300 ${bubbleTone} ${tail} ${
              media ? 'mt-1' : ''
            } ${highlightRing}`}
          >
            {children}
          </div>
        ) : null}

        {meta}
      </div>

      {!mine ? actionSlot : null}
    </div>
  );
}
