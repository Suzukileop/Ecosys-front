'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { listPublicCreatorFollowers, type PublicCreatorFollowerPreview } from '@/lib/marketplace-api';
import { creatorAppRoleRingClass, normalizeCreatorAppRole } from '@/lib/creator-app-role';
import { usePresence } from '@/hooks/usePresence';
import type { MarketplaceCreatorSummary } from '@/types/marketplace';

const MAX_FOLLOWER_AVATARS = 3;

function VerifiedIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-sky-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type SearchCreatorRowProps = {
  creator: MarketplaceCreatorSummary;
};

export function SearchCreatorRow({ creator }: SearchCreatorRowProps) {
  const profileId = creator.userId ?? creator.id ?? '';
  const profileHref = profileId ? `/providers/${profileId}` : '/marketplace';
  const subtitle = creator.bio?.trim() || creator.specialite?.trim();
  const followerCount = creator.followerCount ?? 0;
  const role = creator.appRole != null ? normalizeCreatorAppRole(creator.appRole) : null;
  const ringClass = creatorAppRoleRingClass(role);
  const presenceIds = useMemo(() => (profileId ? [profileId] : []), [profileId]);
  const { isOnline } = usePresence(presenceIds);
  const online = Boolean(profileId) && isOnline(profileId);
  const statusLabel = online ? 'Online' : 'Offline';

  const [followers, setFollowers] = useState<PublicCreatorFollowerPreview[]>([]);

  useEffect(() => {
    if (!profileId || followerCount <= 0) {
      setFollowers([]);
      return;
    }

    let cancelled = false;
    void listPublicCreatorFollowers(profileId, 0, MAX_FOLLOWER_AVATARS)
      .then((items) => {
        if (!cancelled) setFollowers(items.slice(0, MAX_FOLLOWER_AVATARS));
      })
      .catch(() => {
        if (!cancelled) setFollowers([]);
      });

    return () => {
      cancelled = true;
    };
  }, [profileId, followerCount]);

  return (
    <article className="flex flex-wrap items-center gap-5 border-b border-black/[0.06] py-6 last:border-b-0 dark:border-white/[0.06] sm:flex-nowrap sm:gap-10">
      <div className="flex min-w-0 flex-1 items-center gap-5">
        <Link href={profileHref} className="relative shrink-0" title={statusLabel} aria-label={`${creator.fullName}, ${statusLabel}`}>
          <span
            className={`inline-flex shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#111111] ${ringClass}`}
          >
            <Avatar name={creator.fullName} avatarUrl={creator.avatarUrl} size="lg" tone="muted" />
          </span>
          <span
            className={
              online
                ? 'absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#111111]'
                : 'absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-neutral-400 dark:border-[#111111] dark:bg-neutral-500'
            }
            aria-hidden
          />
        </Link>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={profileHref}
              className="truncate text-lg font-semibold tracking-[-0.01em] text-black transition-colors hover:text-[#FF5722] dark:text-neutral-100"
            >
              {creator.fullName}
            </Link>
            {creator.isVerified ? <VerifiedIcon /> : null}
          </div>
          {subtitle ? (
            <p className="mt-1.5 line-clamp-2 max-w-2xl text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      {followers.length > 0 ? (
        <div
          className="flex shrink-0 items-center -space-x-3"
          title={`${followerCount} ${followerCount === 1 ? 'follower' : 'followers'}`}
          aria-label={`${followerCount} ${followerCount === 1 ? 'follower' : 'followers'}`}
        >
          {followers.map((follower, index) => {
            const name = follower.followerFullName?.trim() || 'Follower';
            return (
              <div
                key={follower.id || follower.followerUserId || `${index}`}
                className="relative rounded-full ring-2 ring-white dark:ring-[#111111]"
                style={{ zIndex: followers.length - index }}
              >
                <Avatar name={name} avatarUrl={follower.followerAvatarUrl} size="md" tone="muted" />
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="ml-auto flex w-full shrink-0 items-center gap-2 sm:w-auto">
        <button
          type="button"
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-black/[0.12] px-5 py-2.5 text-[15px] font-medium text-[#0A0A0A] transition-colors hover:border-black/30 dark:border-white/[0.12] dark:text-neutral-100 dark:hover:border-white/30 sm:flex-none"
          title="Coming soon"
        >
          Portfolio
        </button>
        <Link
          href={profileHref}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#0A0A0A] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-[#0A0A0A] sm:flex-none"
        >
          View profile
        </Link>
      </div>
    </article>
  );
}
