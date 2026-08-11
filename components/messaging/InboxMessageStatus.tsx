import type { OutgoingMessageStatus } from '@/lib/messaging-status';
import { MessageStatusIndicator } from '@/components/messaging/MessageStatusIndicator';

export function InboxMessageStatus({ status }: { status: OutgoingMessageStatus | null }) {
  if (!status) return null;
  return <MessageStatusIndicator status={status} variant="inbox" />;
}
