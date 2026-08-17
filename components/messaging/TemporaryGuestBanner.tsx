'use client';

import { Avatar } from '@/components/ui/Avatar';
import type { ConversationGuestSession } from '@/types/messaging';

type TemporaryGuestBannerProps = {
  guests: ConversationGuestSession[];
  currentUserId?: string | null;
  acting: boolean;
  onRevoke: (guestUserId: string) => void;
  onLeave: () => void;
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

export function TemporaryGuestBanner({
  guests,
  currentUserId = null,
  acting,
  onRevoke,
  onLeave,
}: TemporaryGuestBannerProps) {
  if (guests.length === 0) return null;

  return (
    <div className="mb-3 space-y-2">
      {guests.map((guest) => {
        const isInviter = currentUserId === guest.inviterUserId;
        const isGuest = currentUserId === guest.guestUserId;

        return (
          <div
            key={guest.inviteId}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200/80 bg-neutral-50 px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-900/80"
          >
            <Avatar avatarUrl={guest.guestAvatarUrl} name={guest.guestName} size="sm" tone="muted" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Temporary guest</p>
              <p className="text-[11px] text-gray-600 dark:text-neutral-400">
                Invited by <span className="font-medium text-gray-800 dark:text-neutral-200">{guest.inviterName}</span>
                {' · '}
                {formatExpiry(guest.expiresAt)}
              </p>
            </div>
            {isInviter && (
              <button
                type="button"
                onClick={() => onRevoke(guest.guestUserId)}
                disabled={acting}
                className="shrink-0 rounded-full border border-neutral-300 px-3 py-1.5 text-[11px] font-semibold text-neutral-700 transition hover:bg-white disabled:opacity-60 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                {acting ? '…' : 'End guest access'}
              </button>
            )}
            {isGuest && (
              <button
                type="button"
                onClick={onLeave}
                disabled={acting}
                className="shrink-0 rounded-full border border-neutral-300 px-3 py-1.5 text-[11px] font-semibold text-neutral-700 transition hover:bg-white disabled:opacity-60 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                {acting ? '…' : 'Leave chat'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
