import {
  formatConversationDateTime,
  formatConversationTime,
} from '@/components/messaging/conversation/timeline-utils';

type ConversationEndMarkerProps = {
  lastActivityAt?: string | null;
};

function formatEndActivityLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) return `Today, ${formatConversationTime(iso)}`;
  return formatConversationDateTime(iso);
}

/**
 * The close of a thread: a full-width hairline with the label sitting on it. The bordered
 * chip that used to hold the timestamp is gone — the rule already says "this is the end",
 * and a second enclosure only restated it.
 */
export function ConversationEndMarker({ lastActivityAt }: ConversationEndMarkerProps) {
  if (!lastActivityAt) return null;
  return (
    <div className="flex flex-col items-center gap-2 py-10" role="status">
      <span className="h-px w-full max-w-[18rem] bg-[var(--msg-hairline-strong)]" aria-hidden />
      <p className="msg-micro pt-2 text-[var(--msg-ink-soft)]">End of discussion</p>
      <p className="msg-micro text-[var(--msg-ink-faint)]">{formatEndActivityLabel(lastActivityAt)}</p>
    </div>
  );
}
