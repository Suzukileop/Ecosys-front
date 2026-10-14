'use client';

import { InboxSectionKicker } from '@/components/messaging/InboxPanel';
import { TemporaryInboxList } from '@/components/messaging/TemporaryInboxList';
import type { TemporaryInboxEntry } from '@/types/messaging';
import { useT } from '@/lib/i18n/I18nProvider';

type InboxTemporarySectionProps = {
  entries: TemporaryInboxEntry[];
  actingInviteId: string | null;
  actingCancelId: string | null;
  dismissingEntryKey?: string | null;
  onAcceptInvite: (inviteId: string) => void;
  onDeclineInvite: (inviteId: string) => void;
  onCancelInvite: (conversationId: string, inviteId: string) => void;
  onOpenConversation: (entry: TemporaryInboxEntry) => void;
  onDismissEntry: (entry: TemporaryInboxEntry) => void;
  embedded?: boolean;
  emptyMessage?: string;
};

/** The "Temporary" filter's list: the section kicker, then the temporary entries (or one quiet line). */
export function InboxTemporarySection({
  entries,
  actingInviteId,
  actingCancelId,
  dismissingEntryKey = null,
  onAcceptInvite,
  onDeclineInvite,
  onCancelInvite,
  onOpenConversation,
  onDismissEntry,
  embedded = false,
  emptyMessage,
}: InboxTemporarySectionProps) {
  const t = useT();
  if (entries.length === 0 && embedded) {
    return null;
  }

  return (
    /* The inbox's own scroll area scrolls this list — no nested scroller. */
    <section className="shrink-0 pb-2" aria-label={t('Temporary access')}>
      <InboxSectionKicker>{t('Temporary access · {entriesLength}', { entriesLength: entries.length })}</InboxSectionKicker>

      {entries.length === 0 ? (
        <p className="px-5 py-10 text-center text-[15px] leading-5 text-[color:var(--gn-ink2)] lg:px-6">
          {emptyMessage ?? t('No temporary guest access, invites, or activity yet.')}
        </p>
      ) : (
        <TemporaryInboxList
          entries={entries}
          actingInviteId={actingInviteId}
          actingCancelId={actingCancelId}
          dismissingEntryKey={dismissingEntryKey}
          onAcceptInvite={onAcceptInvite}
          onDeclineInvite={onDeclineInvite}
          onCancelInvite={onCancelInvite}
          onOpenConversation={onOpenConversation}
          onDismissEntry={onDismissEntry}
        />
      )}
    </section>
  );
}
