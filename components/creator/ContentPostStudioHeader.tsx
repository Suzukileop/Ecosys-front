'use client';

import Link from 'next/link';
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
  /** Profile specialty shown under the name when there is no mood line. */
  specialite?: string | null;
  moodLabel?: string | null;
  moodEmoji?: string | null;
  taggedUsers?: TaggedUserRef[];
  profileHref?: string | null;
};

export function ContentPostStudioHeader({
  creatorName,
  avatarUrl,
  specialite,
  moodLabel,
  taggedUsers,
  profileHref,
}: ContentPostStudioHeaderProps) {
  const moodSubtitle = buildMoodSubtitle(moodLabel, taggedUsers);
  const specialtyLine = specialite?.trim() || null;
  const subtitle = moodSubtitle || (specialtyLine ? specialtyLine.toUpperCase() : null);

  const content = (
    <>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className="h-11 w-11 shrink-0 rounded-xl object-cover ring-2 ring-white dark:ring-neutral-800"
        />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white shadow-sm">
          {userInitials(creatorName)}
        </div>
      )}
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
