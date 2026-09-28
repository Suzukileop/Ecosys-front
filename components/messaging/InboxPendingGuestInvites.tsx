'use client';

import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { PendingConversationInvite } from '@/types/messaging';

type InboxPendingGuestInvitesProps = {
  invites: PendingConversationInvite[];
  actingId: string | null;
  onAccept: (inviteId: string) => void;
  onDecline: (inviteId: string) => void;
};

function formatExpiry(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) return 'Expired';
  const hours = Math.ceil(diffMs / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h left`;
  const days = Math.ceil(hours / 24);
  return `${days}d left`;
}

export function InboxPendingGuestInvites({
  invites,
  actingId,
  onAccept,
  onDecline,
}: InboxPendingGuestInvitesProps) {
  if (invites.length === 0) return null;

  return (
    <div className="shrink-0 px-3 pb-3">
      <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        Temporary invites
      </p>
      <ul className="space-y-2">
        {invites.map((invite) => {
          const busy = actingId === invite.id;
          return (
            <li
              key={invite.id}
              className="border border-[var(--msg-hairline)] p-3.5"
            >
              <div className="flex items-start gap-3">
                <Avatar avatarUrl={invite.inviterAvatarUrl} name={invite.inviterName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {invite.inviterName}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600 dark:text-neutral-400">
                    invited you to join{' '}
                    <span className="font-medium text-gray-800 dark:text-neutral-200">
                      {invite.conversationTitle}
                    </span>{' '}
                    as a temporary guest
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-500">
                    {formatExpiry(invite.expiresAt)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onAccept(invite.id)}
                  disabled={busy}
                  className="msg-micro inline-flex flex-1 items-center justify-center gap-2 border border-[var(--msg-ink)] px-3 py-2.5 text-[var(--msg-ink)] transition-colors duration-300 hover:bg-[var(--msg-ink)] hover:text-[var(--msg-panel)] disabled:opacity-40"
                >
                  {busy ? <LoadingSpinner size="sm" /> : 'Accept'}
                </button>
                <button
                  type="button"
                  onClick={() => onDecline(invite.id)}
                  disabled={busy}
                  className="msg-micro flex-1 border border-[var(--msg-hairline-strong)] px-3 py-2.5 text-[var(--msg-ink-faint)] transition-colors duration-300 hover:border-[var(--msg-ink-soft)] hover:text-[var(--msg-ink)] disabled:opacity-40"
                >
                  Decline
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
