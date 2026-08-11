'use client';

import { TemporaryInboxList } from '@/components/messaging/TemporaryInboxList';
import type { TemporaryInboxEntry } from '@/types/messaging';

type InboxTemporarySectionProps = {
  entries: TemporaryInboxEntry[];
  actingInviteId: string | null;
  actingCancelId: string | null;
  onAcceptInvite: (inviteId: string) => void;
  onDeclineInvite: (inviteId: string) => void;
  onCancelInvite: (conversationId: string, inviteId: string) => void;
  onOpenConversation: (entry: TemporaryInboxEntry) => void;
  embedded?: boolean;
  emptyMessage?: string;
};

export function InboxTemporarySection({
  entries,
  actingInviteId,
  actingCancelId,
  onAcceptInvite,
  onDeclineInvite,
  onCancelInvite,
  onOpenConversation,
  embedded = false,
  emptyMessage,
}: InboxTemporarySectionProps) {
  if (entries.length === 0 && embedded) {
    return null;
  }

  return (
    <div className={embedded ? 'shrink-0 px-2 pb-2' : 'min-h-0 flex-1 overflow-y-auto px-2 pb-2'}>
      <div className="rounded-2xl bg-neutral-50/50 p-2 dark:bg-neutral-900/40">
        <p className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Temporary access
        </p>

        {entries.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-gray-500 dark:text-neutral-400">
            {emptyMessage ?? 'No temporary guest access, invites, or activity yet.'}
          </p>
        ) : (
          <TemporaryInboxList
            entries={entries}
            actingInviteId={actingInviteId}
            actingCancelId={actingCancelId}
            onAcceptInvite={onAcceptInvite}
            onDeclineInvite={onDeclineInvite}
            onCancelInvite={onCancelInvite}
            onOpenConversation={onOpenConversation}
          />
        )}
      </div>
    </div>
  );
}
