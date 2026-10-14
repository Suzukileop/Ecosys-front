'use client';

import { Avatar } from '@/components/ui/Avatar';
import type { OutgoingGuestInvite } from '@/types/messaging';
import { useT } from '@/lib/i18n/I18nProvider';

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
  const t = useT();
  if (invites.length === 0) return null;

  return (
    <div className="mx-3 mb-1 space-y-1 sm:mx-5">
      {invites.map((invite) => (
        <div
          key={invite.id}
          className="flex flex-wrap items-center gap-3 bg-[var(--msg-surface)] px-3 py-2.5"
        >
          <Avatar avatarUrl={invite.inviteeAvatarUrl} name={invite.inviteeName} size="sm" tone="muted" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-[var(--msg-ink)]">
              {t('Invitation pending · {inviteeName}', { inviteeName: invite.inviteeName })}
            </p>
            <p className="msg-micro text-[var(--msg-ink-faint)]">
              {t('Waiting for response · {formatExpiry}', { formatExpiry: formatExpiry(invite.expiresAt) })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCancel(invite.id)}
            disabled={acting}
            className="inline-flex h-8 shrink-0 items-center rounded-full border border-[var(--msg-hairline-strong)] px-3.5 text-[13px] font-bold text-[var(--msg-ink)] transition-colors hover:bg-[var(--msg-wash)] disabled:opacity-40"
          >
            {acting ? '…' : t('Cancel')}
          </button>
        </div>
      ))}
    </div>
  );
}
