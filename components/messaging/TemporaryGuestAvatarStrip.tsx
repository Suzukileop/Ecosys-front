'use client';

import { Avatar } from '@/components/ui/Avatar';
import { InboxSectionKicker } from '@/components/messaging/InboxPanel';
import type { TemporaryInboxEntry, TemporaryInboxMember } from '@/types/messaging';
import { useT } from '@/lib/i18n/I18nProvider';

type TemporaryGuestAvatarStripProps = {
  entries: TemporaryInboxEntry[];
  selectedConversationId?: string | null;
  onOpen: (entry: TemporaryInboxEntry) => void;
};

function membersForEntry(entry: TemporaryInboxEntry): TemporaryInboxMember[] {
  if (entry.members && entry.members.length > 0) {
    return entry.members;
  }
  return [{ name: entry.headline, avatarUrl: entry.avatarUrl }];
}

/**
 * Active temporary guest rooms, above the conversations. Each is a row in the conversation row's
 * geometry — the overlapping faces, then who is in it and what it is — instead of the old bare
 * avatar slab, which said nothing until hovered. The open room holds the selected fill tone.
 */
export function TemporaryGuestAvatarStrip({
  entries,
  selectedConversationId = null,
  onOpen,
}: TemporaryGuestAvatarStripProps) {
  const t = useT();
  if (entries.length === 0) return null;

  return (
    <section className="shrink-0 pb-1" aria-label={t('Temporary conversations')}>
      <InboxSectionKicker>{t('Temporary')}</InboxSectionKicker>
      <ul className="flex w-full flex-col">
        {entries.map((entry) => {
          const members = membersForEntry(entry);
          const selected = entry.conversationId === selectedConversationId;
          const names = members.map((m) => m.name).filter(Boolean).join(' / ') || entry.headline;
          return (
            <li key={`temp-bubble-${entry.id}`}>
              <button
                type="button"
                onClick={() => onOpen(entry)}
                disabled={!entry.canOpen}
                title={names}
                aria-label={t('Open temporary conversation: {headline}', { headline: entry.headline })}
                aria-current={selected ? 'true' : undefined}
                className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)] disabled:opacity-50 lg:px-6 ${
                  selected
                    ? 'bg-[color:var(--xm-row-selected)]'
                    : 'hover:bg-[color:var(--xm-row-hover)] active:bg-[color:var(--xm-row-selected)]'
                }`}
              >
                <span className="flex shrink-0 items-center -space-x-3">
                  {members.slice(0, 3).map((member, index) => (
                    <span
                      key={`${entry.id}-${member.name}-${index}`}
                      className="inline-flex rounded-full ring-2 ring-[color:var(--msg-panel)]"
                    >
                      <Avatar avatarUrl={member.avatarUrl} name={member.name} size="md" tone="muted" />
                    </span>
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold leading-5 text-[color:var(--gn-ink)]">{names}</span>
                  <span className="mt-0.5 block truncate text-[14px] leading-5 text-[color:var(--gn-ink2)]">
                    {entry.subtitle ?? t('Temporary guest access')}
                  </span>
                </span>
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-[color:var(--gn-ink2)]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
