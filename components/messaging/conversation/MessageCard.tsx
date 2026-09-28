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

/**
 * A message, unboxed.
 *
 * There is no bubble here any more — no fill, no border, no radius behind the words. The
 * orange and grey rectangles that used to sit under every line were carrying one single piece
 * of information, *who said it*, and they were the heaviest objects on the screen to carry it.
 * Two things say it better and cost nothing:
 *
 * - **Side.** Mine sits right, theirs sits left. That is already unambiguous on its own.
 * - **Ink.** Mine is `#111`, theirs is `#444`. Under a glance the column of deep black reads
 *   as one voice and the column of anthracite as the other, which is exactly the job the
 *   fills were doing, done by the type itself.
 *
 * Media still gets a frame, because an image is a real object with its own edges and needs
 * one; text does not.
 */
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

  /* The whole speaker cue, in one value. */
  const inkClass = mine ? 'text-[var(--msg-ink)]' : 'text-[var(--msg-ink-soft)]';

  /*
   * A found message is marked by a coral rule on its own side, never by a ring: a ring would
   * put back the very box this component exists to remove.
   */
  const highlightRuleClass = `absolute inset-y-0 w-[2px] bg-[var(--msg-coral)] transition-opacity duration-500 ${
    mine ? '-right-3' : '-left-3'
  } ${highlighted ? 'opacity-100' : 'opacity-0'}`;

  const timestamp = (
    <div className={`mt-1.5 flex items-center gap-1.5 ${mine ? 'justify-end' : 'justify-start'}`}>
      <time dateTime={sentAt} className="msg-micro text-[var(--msg-ink-faint)]">
        {formatConversationTime(sentAt)}
      </time>
      {mine && status ? (
        <span className="text-[var(--msg-ink-faint)]">
          <MessageStatusIndicator status={status} variant="chat" />
        </span>
      ) : null}
    </div>
  );

  return (
    <div
      className={`group/msg relative flex min-w-0 items-start gap-1 ${mine ? 'justify-end' : 'justify-start'}`}
    >
      {mine && actions ? (
        <div className="mt-0.5 shrink-0 text-[var(--msg-ink-faint)] opacity-0 transition-opacity duration-300 focus-within:opacity-100 group-hover/msg:opacity-100">
          {actions}
        </div>
      ) : null}

      <div className="relative w-fit max-w-[min(100%,520px)] min-w-0">
        <span aria-hidden className={highlightRuleClass} />

        {media ? (
          <div className="overflow-hidden rounded-[var(--cw-radius)] border border-[var(--msg-hairline)]">
            {media}
          </div>
        ) : null}

        {hasBody ? (
          <div className={media ? 'mt-2' : undefined}>
            <div
              className={`text-[0.9375rem] font-light leading-[1.65] [overflow-wrap:anywhere] whitespace-pre-wrap break-words ${inkClass} ${
                mine ? 'text-right' : 'text-left'
              }`}
            >
              {children}
            </div>
            {timestamp}
          </div>
        ) : (
          <div className={mediaOnly ? 'mt-1' : undefined}>{timestamp}</div>
        )}
      </div>

      {!mine && actions ? (
        <div className="mt-0.5 shrink-0 text-[var(--msg-ink-faint)] opacity-0 transition-opacity duration-300 focus-within:opacity-100 group-hover/msg:opacity-100">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
