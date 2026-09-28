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
    <div className="shrink-0 border-t border-[var(--msg-hairline)] px-6 py-5">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="text-[15px] font-bold text-[var(--msg-ink)]">Audience</h3>
        <button
          type="button"
          onClick={onSeeAll}
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--msg-ink-faint)] transition-colors duration-200 hover:text-[var(--msg-coral)]"
        >
          See all
          <span aria-hidden>&#8594;</span>
        </button>
      </div>

      {loading && followers.length === 0 ? (
        <div className="flex gap-3 overflow-hidden py-1" aria-busy="true" aria-label="Loading audience">
          {Array.from({ length: Math.min(4, maxVisible) }).map((_, index) => (
            <span
              key={`follower-skeleton-${index}`}
              className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-[var(--msg-wash)] ring-1 ring-[var(--msg-hairline)]"
            />
          ))}
        </div>
      ) : (
        <div
          className="msg-scroll flex gap-3.5 overflow-x-auto pb-1"
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
                className="group relative shrink-0 rounded-full focus-visible:outline-none disabled:opacity-50"
              >
                <span className="msg-portrait inline-flex overflow-hidden rounded-full ring-1 ring-[var(--msg-hairline)] group-hover:-translate-y-0.5 group-hover:ring-[var(--msg-hairline-strong)] group-focus-visible:ring-[var(--msg-ink)]">
                  <Avatar
                    avatarUrl={follower.followerAvatarUrl}
                    name={name}
                    size="lg"
                    tone="muted"
                  />
                </span>
                {online ? (
                  <span
                    className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-[var(--msg-panel)] bg-[var(--msg-online)]"
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
