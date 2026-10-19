'use client';

import { localeTag, trPlural } from '@/lib/i18n/active';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { listPublicCreatorFollowers, type PublicCreatorFollowerPreview } from '@/lib/marketplace-api';
import { usePresence } from '@/hooks/usePresence';
import type { MarketplaceCreatorSummary } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

const MAX_FOLLOWER_AVATARS = 3;

function VerifiedIcon() {
  const t = useT();
  return (
    <svg className="h-4 w-4 shrink-0 text-[color:var(--gn-ink)]" viewBox="0 0 20 20" fill="currentColor" aria-label={t('Verified')}>
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
  const t = useT();
  const profileId = creator.userId ?? creator.id ?? '';
  const profileHref = profileId ? `/providers/${profileId}` : '/marketplace';
  const subtitle = creator.bio?.trim() || creator.specialite?.trim();
  const followerCount = creator.followerCount ?? 0;
  const presenceIds = useMemo(() => (profileId ? [profileId] : []), [profileId]);
  const { isOnline } = usePresence(presenceIds);
  const online = Boolean(profileId) && isOnline(profileId);
  const statusLabel = online ? t('Online') : t('Offline');

  const [followers, setFollowers] = useState<PublicCreatorFollowerPreview[]>([]);

  /* Follower previews only exist for a profile with followers; otherwise nothing is fetched and the
     row shows none (derived, rather than cleared from an effect). */
  const wantsFollowers = Boolean(profileId) && followerCount > 0;
  const shownFollowers = wantsFollowers ? followers : [];

  useEffect(() => {
    if (!wantsFollowers) return;

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
  }, [profileId, wantsFollowers]);

  /* One row of the people block (a tonal square block, rows set apart by space, no hairlines):
     avatar, name and the outlined pill on the right all lead to the profile. Ink only — the
     role-coloured ring around the avatar (sky / red / violet / yellow, the only hues on the page) is
     gone; the presence dot shows only when online. 20px gutter on phones, the fill tone on hover. */
  return (
    <div className="flex min-h-[72px] items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] sm:gap-4 sm:px-6">
      <Link href={profileHref} className="relative shrink-0" title={statusLabel} aria-label={`${creator.fullName}, ${statusLabel}`}>
        <Avatar name={creator.fullName} avatarUrl={creator.avatarUrl} size="lg" tone="muted" />
        {online ? (
          <span
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[color:var(--gn-surface)] bg-[color:var(--gn-ink)]"
            aria-hidden
          />
        ) : null}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <Link
            href={profileHref}
            className="truncate text-[15px] font-bold leading-5 text-[color:var(--gn-ink)] underline-offset-2 hover:underline"
          >
            {creator.fullName}
          </Link>
          {creator.isVerified ? <VerifiedIcon /> : null}
        </div>
        {subtitle ? (
          <p className="mt-0.5 line-clamp-2 text-[14px] leading-5 text-[color:var(--gn-ink2)]">{subtitle}</p>
        ) : null}
        {followerCount > 0 ? (
          <p className="mt-1 flex items-center gap-2 text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
            {shownFollowers.length > 0 ? (
              <span className="flex -space-x-2" aria-hidden>
                {shownFollowers.map((follower, index) => (
                  <span
                    key={follower.id || follower.followerUserId || `${index}`}
                    className="relative rounded-full ring-2 ring-[color:var(--gn-surface)]"
                    style={{ zIndex: shownFollowers.length - index }}
                  >
                    <Avatar
                      name={follower.followerFullName?.trim() || 'Follower'}
                      avatarUrl={follower.followerAvatarUrl}
                      size="sm"
                      tone="muted"
                    />
                  </span>
                ))}
              </span>
            ) : null}
            <span>
              {followerCount.toLocaleString(localeTag())} {trPlural(followerCount, 'follower', 'followers')}
            </span>
          </p>
        ) : null}
      </div>

      {profileId ? (
        <Link href={profileHref} className="inline-flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[color:var(--gn-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] dark:shadow-[inset_0_0_0_1px_#536471] sm:h-9">
          {t('View profile')}
        </Link>
      ) : null}
    </div>
  );
}
