'use client';

import { Avatar } from '@/components/ui/Avatar';
import type { TemporaryInboxEntry, TemporaryInboxMember } from '@/types/messaging';

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
 * Active temporary guest conversations — full-width avatar rows.
 */
export function TemporaryGuestAvatarStrip({
  entries,
  selectedConversationId = null,
  onOpen,
}: TemporaryGuestAvatarStripProps) {
  if (entries.length === 0) return null;

  return (
    <div className="shrink-0 border-b border-neutral-200 px-3 py-3 dark:border-neutral-800">
      <p className="mb-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
        Temporary
      </p>
      <div className="flex w-full flex-col gap-2" role="list" aria-label="Temporary conversations">
        {entries.map((entry) => {
          const members = membersForEntry(entry);
          const selected = entry.conversationId === selectedConversationId;
          return (
            <button
              key={`temp-bubble-${entry.id}`}
              type="button"
              role="listitem"
              onClick={() => onOpen(entry)}
              disabled={!entry.canOpen}
              title={members.map((m) => m.name).join(' / ') || entry.headline}
              aria-label={`Open temporary conversation: ${entry.headline}`}
              aria-pressed={selected}
              className={`group flex w-full items-center justify-center rounded-[12px] border px-4 py-3 transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/50 disabled:opacity-50 ${
                selected
                  ? 'border-neutral-300 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800'
                  : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900/60 dark:hover:border-neutral-600 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="flex items-center justify-center gap-4">
                {members.map((member, index) => (
                  <span
                    key={`${entry.id}-${member.name}-${index}`}
                    className="inline-flex transition duration-150 group-hover:scale-[1.06]"
                  >
                    <Avatar
                      avatarUrl={member.avatarUrl}
                      name={member.name}
                      size="md"
                      tone="muted"
                    />
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
