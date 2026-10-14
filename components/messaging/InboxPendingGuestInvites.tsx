'use client';

import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  INBOX_PRIMARY_PILL_SM,
  INBOX_SECONDARY_PILL_SM,
  InboxSectionKicker,
} from '@/components/messaging/InboxPanel';
import type { PendingConversationInvite } from '@/types/messaging';
import { useT } from '@/lib/i18n/I18nProvider';

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

/**
 * Guest invites waiting for an answer, above the conversations: the section's kicker, then one
 * block per invite on the module tone (tone, not a frame, sets it apart from the list) — who, what,
 * how long is left, and the two answers as News pills (Accept in ink, Decline outlined), 40px tall.
 */
export function InboxPendingGuestInvites({
  invites,
  actingId,
  onAccept,
  onDecline,
}: InboxPendingGuestInvitesProps) {
  const t = useT();
  if (invites.length === 0) return null;

  return (
    <section className="shrink-0 pb-2" aria-label={t('Temporary invites')}>
      <InboxSectionKicker>{t('Temporary invites · {invitesLength}', { invitesLength: invites.length })}</InboxSectionKicker>
      <ul className="flex flex-col gap-2 pt-1 lg:px-3">
        {invites.map((invite) => {
          const busy = actingId === invite.id;
          return (
            <li key={invite.id} className="bg-[color:var(--xm-chip)] px-5 py-4 lg:px-3">
              <div className="flex items-start gap-3">
                <Avatar avatarUrl={invite.inviterAvatarUrl} name={invite.inviterName} size="lg" tone="muted" />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-5 text-[color:var(--gn-ink2)]">
                    <span className="font-bold text-[color:var(--gn-ink)]">{invite.inviterName}</span> {t('invited you to join')} <span className="font-bold text-[color:var(--gn-ink)]">{invite.conversationTitle}</span> {t('as a temporary guest')}
                  </p>
                  <p className="mt-1 text-[13px] leading-5 tabular-nums text-[color:var(--gn-ink2)]">
                    {formatExpiry(invite.expiresAt)}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onAccept(invite.id)}
                      disabled={busy}
                      className={`${INBOX_PRIMARY_PILL_SM} flex-1`}
                    >
                      {busy ? <LoadingSpinner size="sm" /> : t('Accept')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDecline(invite.id)}
                      disabled={busy}
                      className={`${INBOX_SECONDARY_PILL_SM} flex-1`}
                    >
                      {t('Decline')}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
