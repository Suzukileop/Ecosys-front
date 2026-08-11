import type { OutgoingMessageStatus } from '@/lib/messaging-status';
import { getOutgoingStatusLabel } from '@/lib/messaging-status';

export type MessageStatusType = OutgoingMessageStatus | 'sending';

type MessageStatusIndicatorProps = {
  status: MessageStatusType;
  variant?: 'inbox' | 'chat';
};

function SingleCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.25 8.25L6.75 11.75L12.75 4.75"
        stroke="currentColor"
        strokeWidth="1.75"
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
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.25 6.25L9.25 9.25L18.25 1.25"
        stroke="currentColor"
        strokeWidth="1.6"
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

export function MessageStatusIndicator({ status, variant = 'chat' }: MessageStatusIndicatorProps) {
  const isInbox = variant === 'inbox';
  const iconClass = isInbox ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5';
  const ariaLabel = getAriaLabel(status);

  if (status === 'sending') {
    return (
      <span
        className={`inline-flex shrink-0 items-center ${
          isInbox
            ? 'text-gray-400 dark:text-neutral-500'
            : 'gap-1.5 text-[11px] text-gray-400 dark:text-neutral-500'
        }`}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        <SendingDots />
        {!isInbox ? <span className="font-medium">Sending</span> : null}
      </span>
    );
  }

  if (status === 'seen') {
    return (
      <span
        className={`inline-flex shrink-0 items-center ${
          isInbox ? 'text-gray-500 dark:text-neutral-400' : 'text-[#FDBA74]'
        }`}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        <DoubleCheck className={iconClass} />
      </span>
    );
  }

  if (status === 'delivered') {
    return (
      <span
        className={`inline-flex shrink-0 items-center ${
          isInbox ? 'text-gray-400 dark:text-neutral-500' : 'text-white/70'
        }`}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        <DoubleCheck className={iconClass} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center ${
        isInbox ? 'text-gray-400 dark:text-neutral-500' : 'text-white/60'
      }`}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <SingleCheck className={iconClass} />
    </span>
  );
}
