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

export function ConversationEndMarker({ lastActivityAt }: ConversationEndMarkerProps) {
  if (!lastActivityAt) return null;
  return (
    <div className="flex flex-col items-center gap-2 py-6" role="status">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-[var(--cw-text-muted,#9AA1AA)]">
        END OF DISCUSSION
      </p>
      <span className="rounded-full border border-[var(--cw-border,#E2E5E9)] bg-[var(--cw-surface,#fff)] px-2.5 py-1 text-[10px] font-medium text-[var(--cw-text-secondary,#68707A)]">
        {formatEndActivityLabel(lastActivityAt)}
      </span>
    </div>
  );
}
