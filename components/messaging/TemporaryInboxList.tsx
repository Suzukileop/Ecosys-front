'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatGuestTraceTime } from '@/lib/guest-session-trace';
import type { TemporaryInboxEntry } from '@/types/messaging';

type TemporaryInboxListProps = {
  entries: TemporaryInboxEntry[];
  actingInviteId: string | null;
  actingCancelId: string | null;
  dismissingEntryKey?: string | null;
  onAcceptInvite: (inviteId: string) => void;
  onDeclineInvite: (inviteId: string) => void;
  onCancelInvite: (conversationId: string, inviteId: string) => void;
  onOpenConversation: (entry: TemporaryInboxEntry) => void;
  onDismissEntry: (entry: TemporaryInboxEntry) => void;
};

function entryLabel(entry: TemporaryInboxEntry): string {
  switch (entry.entryType) {
    case 'INCOMING_INVITE':
      return 'Invite received';
    case 'OUTGOING_INVITE':
      return 'Invite sent';
    case 'ACTIVE_GUEST':
      return 'Active guest';
    case 'ENDED_GUEST':
      return 'Guest session ended';
    default:
      return 'Temporary';
  }
}

export function TemporaryInboxList({
  entries,
  actingInviteId,
  actingCancelId,
  dismissingEntryKey = null,
  onAcceptInvite,
  onDeclineInvite,
  onCancelInvite,
  onOpenConversation,
  onDismissEntry,
}: TemporaryInboxListProps) {
  return (
    <ul className="space-y-2 px-1" aria-label="Temporary inbox">
      {entries.map((entry) => {
        const inviteId = entry.inviteId ?? entry.id;
        const entryKey = `${entry.entryType}-${entry.id}`;
        const busy =
          actingInviteId === inviteId ||
          actingCancelId === inviteId ||
          dismissingEntryKey === entryKey;

        return (
          <li
            key={entryKey}
            className="rounded-2xl bg-white p-3 dark:bg-neutral-900"
          >
            <div className="flex items-start gap-3">
              <Avatar avatarUrl={entry.avatarUrl} name={entry.headline} size="sm" tone="muted" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    {entryLabel(entry)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onDismissEntry(entry)}
                    disabled={busy}
                    aria-label="Delete temporary entry"
                    title="Delete"
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-neutral-800 dark:hover:text-red-400"
                  >
                    {dismissingEntryKey === entryKey ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <FontAwesomeIcon icon={faTrashCan} className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                  {entry.headline}
                </p>
                <p className="mt-0.5 text-xs text-gray-600 dark:text-neutral-400">
                  {entry.subtitle ?? entry.conversationTitle}
                </p>
                <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                  {formatGuestTraceTime(entry.occurredAt)}
                </p>
              </div>
            </div>

            {entry.entryType === 'INCOMING_INVITE' && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onAcceptInvite(inviteId)}
                  disabled={busy}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
                >
                  {busy ? <LoadingSpinner size="sm" /> : 'Accept'}
                </button>
                <button
                  type="button"
                  onClick={() => onDeclineInvite(inviteId)}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-200 disabled:opacity-60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  Decline
                </button>
              </div>
            )}

            {entry.entryType === 'OUTGOING_INVITE' && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => onCancelInvite(entry.conversationId, inviteId)}
                  disabled={busy}
                  className="rounded-xl bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-200 disabled:opacity-60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  {busy ? '…' : 'Cancel invite'}
                </button>
              </div>
            )}

            {(entry.entryType === 'ACTIVE_GUEST' || entry.entryType === 'ENDED_GUEST') &&
              entry.canOpen && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => onOpenConversation(entry)}
                  disabled={busy}
                  className="rounded-xl bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-200 disabled:opacity-60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  {entry.entryType === 'ENDED_GUEST' ? 'View session history' : 'Open conversation'}
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
