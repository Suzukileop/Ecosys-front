'use client';

import { useMemo } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { usePresence } from '@/hooks/usePresence';
import type { CreatorProfileFollowerItem } from '@/lib/creator-profile-followers-api';

export type InboxFollowersStripProps = {
  followers: CreatorProfileFollowerItem[];
  loading?: boolean;
  onSeeAll: () => void;
  onOpenFollower: (follower: CreatorProfileFollowerItem) => void;
  openingUserId?: string | null;
  /** Max avatars in the strip (See all shows the rest). */
  maxVisible?: number;
};

const DEFAULT_MAX_VISIBLE = 6;

/**
 * Bottom inbox strip — horizontal follower avatars (message shortcuts).
 */
export function InboxFollowersStrip({
  followers,
  loading = false,
  onSeeAll,
  onOpenFollower,
  openingUserId = null,
  maxVisible = DEFAULT_MAX_VISIBLE,
}: InboxFollowersStripProps) {
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
    <div className="shrink-0 border-t border-neutral-200 px-3 py-3 dark:border-neutral-800 sm:px-4">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Audience</h3>
        <button
          type="button"
          onClick={onSeeAll}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--msg-brand,#F47B20)] transition hover:text-[var(--msg-brand-hover,#E06E18)]"
        >
          See all
          <span aria-hidden className="text-[10px]">
            ›
          </span>
        </button>
      </div>

      {loading && followers.length === 0 ? (
        <div className="flex gap-3 overflow-hidden py-1" aria-busy="true" aria-label="Loading audience">
          {Array.from({ length: Math.min(4, maxVisible) }).map((_, index) => (
            <span
              key={`follower-skeleton-${index}`}
              className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : (
        <div
          className="flex gap-3 overflow-x-auto pb-0.5 [scrollbar-width:thin] [scrollbar-color:#a3a3a3_transparent] dark:[scrollbar-color:#525252_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-400 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600"
          role="list"
          aria-label="Audience"
        >
          {visibleFollowers.map((follower) => {
            const name = follower.followerFullName?.trim() || 'Contact';
            const busy = openingUserId === follower.followerUserId;
            const online = isOnline(follower.followerUserId);
            const statusLabel = online ? 'Online' : 'Offline';
            return (
              <button
                key={follower.id}
                type="button"
                role="listitem"
                disabled={busy}
                onClick={() => onOpenFollower(follower)}
                title={`Message ${name} (${statusLabel})`}
                aria-label={`Message ${name}, ${statusLabel}`}
                className="group relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--msg-brand)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 dark:focus-visible:ring-offset-neutral-950"
              >
                <span className="inline-flex transition duration-150 group-hover:scale-[1.06]">
                  <Avatar
                    avatarUrl={follower.followerAvatarUrl}
                    name={name}
                    size="lg"
                    tone="muted"
                  />
                </span>
                <span
                  className={
                    online
                      ? 'absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-neutral-950'
                      : 'absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-neutral-400 dark:border-neutral-950 dark:bg-neutral-500'
                  }
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
