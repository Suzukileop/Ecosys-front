'use client';

import Link from 'next/link';
import {
  creatorAppRoleRingClass,
  normalizeCreatorAppRole,
  type CreatorAppRole,
} from '@/lib/creator-app-role';
import type { TaggedUserRef } from '@/types/creator-content';

function userInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function buildMoodSubtitle(moodLabel?: string | null, taggedUsers?: TaggedUserRef[]) {
  const parts: string[] = [];
  if (moodLabel?.trim()) {
    parts.push(`Feeling ${moodLabel.trim()}`);
  }
  const tagged = taggedUsers?.map((u) => u.fullName).filter(Boolean) ?? [];
  if (tagged.length > 0) {
    parts.push(`w/ ${tagged.join(', ')}`);
  }
  return parts.join(' · ').toUpperCase();
}

type ContentPostStudioHeaderProps = {
  creatorName: string;
  avatarUrl?: string | null;
  /** App role — drives the avatar status ring color. */
  appRole?: CreatorAppRole | string | null;
  /** Profile specialty shown under the name when there is no mood line. */
  specialite?: string | null;
  /** Optional specialty list — first entry used when `specialite` is empty. */
  specialties?: string[] | null;
  moodLabel?: string | null;
  moodEmoji?: string | null;
  taggedUsers?: TaggedUserRef[];
  profileHref?: string | null;
};

export function ContentPostStudioHeader({
  creatorName,
  avatarUrl,
  appRole,
  specialite,
  specialties,
  moodLabel,
  taggedUsers,
  profileHref,
}: ContentPostStudioHeaderProps) {
  const moodSubtitle = buildMoodSubtitle(moodLabel, taggedUsers);
  const specialtyLine =
    specialite?.trim() ||
    specialties?.map((s) => s.trim()).find(Boolean) ||
    null;
  const subtitle = moodSubtitle || (specialtyLine ? specialtyLine.toUpperCase() : null);
  const role = appRole != null ? normalizeCreatorAppRole(appRole) : null;
  const ringClass = creatorAppRoleRingClass(role);

  const avatar = (
    <span
      className={`inline-flex h-11 w-11 shrink-0 overflow-hidden rounded-full ring-[3px] ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 ${ringClass}`}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-orange-500 text-sm font-bold text-white">
          {userInitials(creatorName)}
        </span>
      )}
    </span>
  );

  const content = (
    <>
      {avatar}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">{creatorName}</p>
        {subtitle ? (
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
            {subtitle}
          </p>
        ) : null}
      </div>
    </>
  );

  if (!profileHref) {
    return <div className="flex items-center gap-3">{content}</div>;
  }

  return (
    <Link
      href={profileHref}
      className="flex items-center gap-3 rounded-xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-orange-500/60"
    >
      {content}
    </Link>
  );
}
