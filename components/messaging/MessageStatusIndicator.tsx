import type { OutgoingMessageStatus } from '@/lib/messaging-status';
import { getOutgoingStatusLabel } from '@/lib/messaging-status';

export type MessageStatusType = OutgoingMessageStatus | 'sending';

type MessageStatusIndicatorProps = {
  status: MessageStatusType;
  variant?: 'inbox' | 'chat';
  /** Use light checks on brand/orange bubbles. */
  tone?: 'default' | 'onBrand';
};

function SingleCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.25 8.25L6.75 11.75L12.75 4.75"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DoubleCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 12" fill="none" aria-hidden>
      <path
        d="M1.25 6.25L4.25 9.25L8.5 3.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.25 6.25L9.25 9.25L18.25 1.25"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendingDots({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className ?? ''}`} aria-hidden>
      <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:0ms]" />
      <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
      <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
    </span>
  );
}

function getAriaLabel(status: MessageStatusType): string {
  if (status === 'sending') return 'Sending';
  return getOutgoingStatusLabel(status);
}

export function MessageStatusIndicator({ status, tone = 'default' }: MessageStatusIndicatorProps) {
  const onBrand = tone === 'onBrand';
  /*
   * Receipts inherit their colour from whatever line they sit on — the timestamp in the thread,
   * the preview in the inbox — so they can never be darker than the message they belong to.
   * "Seen" is the one exception: it steps up to full ink, which is the only difference a reader
   * actually looks for between the two double-checks.
   */
  /* One size in both contexts — the inbox and the thread run the same receipt. */
  const iconClass = 'h-3.5 w-3.5';
  const ariaLabel = getAriaLabel(status);
  const mutedClass = onBrand ? 'text-white/80' : 'text-current';
  const seenClass = onBrand ? 'text-white' : 'text-[var(--msg-ink)]';

  if (status === 'sending') {
    return (
      <span className={`inline-flex shrink-0 items-center ${mutedClass}`} aria-label={ariaLabel} title={ariaLabel}>
        <SendingDots />
      </span>
    );
  }

  if (status === 'seen') {
    return (
      <span className={`inline-flex shrink-0 items-center ${seenClass}`} aria-label={ariaLabel} title={ariaLabel}>
        <DoubleCheck className={iconClass} />
      </span>
    );
  }

  if (status === 'delivered') {
    return (
      <span className={`inline-flex shrink-0 items-center ${mutedClass}`} aria-label={ariaLabel} title={ariaLabel}>
        <DoubleCheck className={iconClass} />
      </span>
    );
  }

  return (
    <span className={`inline-flex shrink-0 items-center ${mutedClass}`} aria-label={ariaLabel} title={ariaLabel}>
      <SingleCheck className={iconClass} />
    </span>
  );
}
