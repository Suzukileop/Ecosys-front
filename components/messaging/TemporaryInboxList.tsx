'use client';

import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { INBOX_PRIMARY_PILL_SM, INBOX_SECONDARY_PILL_SM } from '@/components/messaging/InboxPanel';
import { formatGuestTraceTime } from '@/lib/guest-session-trace';
import type { TemporaryInboxEntry } from '@/types/messaging';
import { useT } from '@/lib/i18n/I18nProvider';

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

/**
 * The temporary inbox, one entry per row on the inbox gutters: what happened (small caps), who and
 * where (bold name, secondary line), when, then the entry's one or two answers as 40px News pills.
 * Delete is a quiet 40px glyph at the row's corner that turns X red only under the pointer.
 */
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
  const t = useT();
  return (
    <ul className="flex flex-col" aria-label={t('Temporary inbox')}>
      {entries.map((entry) => {
        const inviteId = entry.inviteId ?? entry.id;
        const entryKey = `${entry.entryType}-${entry.id}`;
        const busy =
          actingInviteId === inviteId ||
          actingCancelId === inviteId ||
          dismissingEntryKey === entryKey;

        return (
          <li key={entryKey} className="px-5 py-4 transition-colors hover:bg-[color:var(--xm-row-hover)] lg:px-6">
            <div className="flex items-start gap-3">
              <Avatar avatarUrl={entry.avatarUrl} name={entry.headline} size="lg" tone="muted" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="gn-kicker pt-0.5">{entryLabel(entry)}</p>
                  <button
                    type="button"
                    onClick={() => onDismissEntry(entry)}
                    disabled={busy}
                    aria-label={t('Delete temporary entry')}
                    title={t('Delete')}
                    className="-mr-2.5 -mt-2.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[color:var(--gn-ink2)] transition-colors hover:bg-[rgba(244,33,46,0.1)] hover:text-[#F4212E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] disabled:opacity-50"
                  >
                    {dismissingEntryKey === entryKey ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 12a2 2 0 0 0 2 1.8h7a2 2 0 0 0 2-1.8l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[15px] font-bold leading-5 text-[color:var(--gn-ink)]">{entry.headline}</p>
                <p className="mt-0.5 text-[15px] leading-5 text-[color:var(--gn-ink2)]">
                  {entry.subtitle ?? entry.conversationTitle}
                </p>
                <p className="mt-1 text-[13px] leading-5 tabular-nums text-[color:var(--gn-ink2)]">
                  {formatGuestTraceTime(entry.occurredAt)}
                </p>

                {entry.entryType === 'INCOMING_INVITE' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onAcceptInvite(inviteId)}
                      disabled={busy}
                      className={`${INBOX_PRIMARY_PILL_SM} flex-1`}
                    >
                      {busy ? <LoadingSpinner size="sm" /> : t('Accept')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeclineInvite(inviteId)}
                      disabled={busy}
                      className={`${INBOX_SECONDARY_PILL_SM} flex-1`}
                    >
                      {t('Decline')}
                    </button>
                  </div>
                )}

                {entry.entryType === 'OUTGOING_INVITE' && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => onCancelInvite(entry.conversationId, inviteId)}
                      disabled={busy}
                      className={INBOX_SECONDARY_PILL_SM}
                    >
                      {busy ? '…' : t('Cancel invite')}
                    </button>
                  </div>
                )}

                {(entry.entryType === 'ACTIVE_GUEST' || entry.entryType === 'ENDED_GUEST') && entry.canOpen && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => onOpenConversation(entry)}
                      disabled={busy}
                      className={INBOX_SECONDARY_PILL_SM}
                    >
                      {entry.entryType === 'ENDED_GUEST' ? t('View session history') : t('Open conversation')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
