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
  const profileHref = profileId ? `/marketplace/${profileId}` : '/marketplace';
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
    <article className="flex flex-wrap items-center gap-5 rounded-2xl border border-neutral-200 bg-neutral-100 px-5 py-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:flex-nowrap sm:gap-8 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Link href={profileHref} className="relative shrink-0" title={statusLabel} aria-label={`${creator.fullName}, ${statusLabel}`}>
          <span
            className={`inline-flex shrink-0 rounded-full ring-[3px] ring-offset-2 ring-offset-neutral-100 dark:ring-offset-neutral-900 ${ringClass}`}
          >
            <Avatar name={creator.fullName} avatarUrl={creator.avatarUrl} size="lg" tone="muted" />
          </span>
          <span
            className={
              online
                ? 'absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-neutral-100 bg-emerald-500 dark:border-neutral-900'
                : 'absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-neutral-100 bg-neutral-400 dark:border-neutral-900 dark:bg-neutral-500'
            }
            aria-hidden
          />
        </Link>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={profileHref}
              className="truncate text-lg font-bold text-neutral-800 dark:text-white"
            >
              {creator.fullName}
            </Link>
            {creator.isVerified ? <VerifiedIcon /> : null}
          </div>
          {subtitle ? (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
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
                className="relative rounded-full ring-2 ring-white dark:ring-neutral-900"
                style={{ zIndex: followers.length - index }}
              >
                <Avatar name={name} avatarUrl={follower.followerAvatarUrl} size="md" tone="muted" />
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="ml-auto flex w-full shrink-0 flex-col gap-2 sm:w-auto">
        <Link
          href={profileHref}
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          View profile
        </Link>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
          title="Coming soon"
        >
          Portfolio
        </button>
      </div>
    </article>
  );
}
