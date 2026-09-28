'use client';

import { Avatar } from '@/components/ui/Avatar';
import type { OutgoingGuestInvite } from '@/types/messaging';

type PendingGuestInviteStripProps = {
  invites: OutgoingGuestInvite[];
  acting: boolean;
  onCancel: (inviteId: string) => void;
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

export function PendingGuestInviteStrip({ invites, acting, onCancel }: PendingGuestInviteStripProps) {
  if (invites.length === 0) return null;

  return (
    <div className="mb-2 space-y-1.5 px-1">
      {invites.map((invite) => (
        <div
          key={invite.id}
          className="flex flex-wrap items-center gap-3 border-t border-[var(--msg-hairline)] px-3 py-2.5"
        >
          <Avatar avatarUrl={invite.inviteeAvatarUrl} name={invite.inviteeName} size="sm" tone="muted" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 dark:text-white">
              Invitation pending · {invite.inviteeName}
            </p>
            <p className="text-[11px] text-gray-600 dark:text-neutral-400">
              Waiting for response · {formatExpiry(invite.expiresAt)}
            </p>
          </div>
          <span
            className="inline-flex h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[var(--msg-coral)]"
            aria-hidden
          />
          <button
            type="button"
            onClick={() => onCancel(invite.id)}
            disabled={acting}
            className="msg-micro shrink-0 border border-[var(--msg-hairline-strong)] px-3 py-1.5 text-[var(--msg-ink-faint)] transition-colors duration-300 hover:border-[var(--msg-ink-soft)] hover:text-[var(--msg-ink)] disabled:opacity-40"
          >
            {acting ? '…' : 'Cancel'}
          </button>
        </div>
      ))}
    </div>
  );
}
