'use client';

import { useMemo } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { usePresence } from '@/hooks/usePresence';
import type { CreatorProfileFollowerItem } from '@/lib/creator-profile-followers-api';
import { useT } from '@/lib/i18n/I18nProvider';

type InboxFollowersStripProps = {
  followers: CreatorProfileFollowerItem[];
  loading?: boolean;
  onSeeAll: () => void;
  onOpenFollower: (follower: CreatorProfileFollowerItem) => void;
  openingUserId?: string | null;
  /** Max avatars in the strip (See all shows the rest). */
  maxVisible?: number;
};

const DEFAULT_MAX_VISIBLE = 8;

/**
 * A creator's audience as message shortcuts — a swipeable row of faces with their first names
 * under them (Instagram's inbox row), introduced by the section's small-caps line. On phones it
 * opens the scrolling list; on desktop it is the inbox column's sticky footer (InboxPanel decides).
 * The online dot is the Providers card's green, ringed in the ground so it reads on any photo.
 */
export function InboxFollowersStrip({
  followers,
  loading = false,
  onSeeAll,
  onOpenFollower,
  openingUserId = null,
  maxVisible = DEFAULT_MAX_VISIBLE,
}: InboxFollowersStripProps) {
  const t = useT();
  const visibleFollowers = useMemo(
    () => followers.slice(0, Math.max(1, maxVisible)),
    [followers, maxVisible]
  );
  const followerIds = useMemo(
    () => visibleFollowers.map((f) => f.followerUserId).filter(Boolean),
    [visibleFollowers]
  );
  const { isOnline } = usePresence(followerIds);

  if (!loading && followers.length === 0) return null;

  return (
    <section className="shrink-0 pb-3 pt-3 lg:pb-[calc(1rem+env(safe-area-inset-bottom))] lg:pt-4" aria-label={t('Audience')}>
      <div className="flex items-center justify-between gap-2 px-5 lg:px-6">
        <h2 className="text-[15px] font-semibold leading-5 text-[color:var(--gn-ink)]">{t('Audience')}</h2>
        <button
          type="button"
          onClick={onSeeAll}
          className="-mr-3 inline-flex min-h-10 items-center rounded-full px-3 text-[14px] font-semibold text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
        >
          {t('See all')}
        </button>
      </div>

      {loading && followers.length === 0 ? (
        <div className="flex gap-4 overflow-hidden px-5 pt-1 lg:px-6" aria-busy="true" aria-label={t('Loading audience')}>
          {Array.from({ length: Math.min(5, maxVisible) }).map((_, index) => (
            <span key={`follower-skeleton-${index}`} className="flex w-14 shrink-0 flex-col items-center gap-1.5">
              <span className="xm-skeleton h-14 w-14 rounded-full" />
              <span className="xm-skeleton h-2.5 w-10 rounded-full" />
            </span>
          ))}
        </div>
      ) : (
        <ul
          className="flex gap-4 overflow-x-auto scroll-px-5 px-5 pt-1 [scrollbar-width:none] lg:px-6 [&::-webkit-scrollbar]:hidden"
          aria-label={t('Audience')}
        >
          {visibleFollowers.map((follower) => {
            const name = follower.followerFullName?.trim() || 'Contact';
            const firstName = name.split(/\s+/)[0] || name;
            const busy = openingUserId === follower.followerUserId;
            const online = isOnline(follower.followerUserId);
            const statusLabel = online ? t('Online') : t('Offline');
            return (
              <li key={follower.id} className="shrink-0">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onOpenFollower(follower)}
                  title={t('Message {name} ({statusLabel})', { name, statusLabel })}
                  aria-label={t('Message {name}, {statusLabel}', { name, statusLabel })}
                  className="group flex w-14 flex-col items-center gap-1.5 rounded-xl focus-visible:outline-hidden disabled:opacity-50"
                >
                  <span className="relative">
                    <span className="msg-portrait flex h-14 w-14 items-center justify-center overflow-hidden rounded-full ring-2 ring-transparent transition-shadow group-focus-visible:ring-[color:var(--gn-ink)] [&>*]:!h-14 [&>*]:!w-14">
                      <Avatar avatarUrl={follower.followerAvatarUrl} name={name} size="lg" tone="muted" />
                    </span>
                    {online ? (
                      <span
                        className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-[var(--msg-online)] ring-[3px] ring-[color:var(--msg-panel)]"
                        aria-hidden
                      />
                    ) : null}
                  </span>
                  <span className="w-full truncate text-center text-[12px] leading-4 text-[color:var(--gn-ink2)] group-hover:text-[color:var(--gn-ink)]">
                    {firstName}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
