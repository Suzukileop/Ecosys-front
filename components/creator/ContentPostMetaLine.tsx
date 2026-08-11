'use client';

import type { TaggedUserRef } from '@/types/creator-content';
import { buildPostMetaLine } from '@/components/creator/creator-content-enrichments';

type ContentPostMetaLineProps = {
  creatorName: string;
  moodLabel?: string | null;
  moodEmoji?: string | null;
  taggedUsers?: TaggedUserRef[];
  className?: string;
};

export function ContentPostMetaLine({
  creatorName,
  moodLabel,
  moodEmoji,
  taggedUsers,
  className = '',
}: ContentPostMetaLineProps) {
  const taggedNames = taggedUsers?.map((u) => u.fullName) ?? [];
  const hasMeta = Boolean(moodLabel) || taggedNames.length > 0;
  if (!hasMeta) return null;

  return (
    <p className={`text-sm text-neutral-600 dark:text-neutral-400 ${className}`}>
      <span className="font-semibold text-neutral-900 dark:text-white">{creatorName}</span>
      {moodLabel && (
        <>
          {' '}
          is feeling <span className="font-medium">{moodLabel}</span>
          {moodEmoji ? ` ${moodEmoji}` : ''}
        </>
      )}
      {taggedNames.length > 0 && (
        <>
          {moodLabel ? ' · ' : ' '}
          with{' '}
          <span className="font-medium text-orange-600 dark:text-orange-400">
            {taggedNames.join(', ')}
          </span>
        </>
      )}
    </p>
  );
}

export function contentPostMetaSummary(opts: {
  creatorName: string;
  moodLabel?: string | null;
  moodEmoji?: string | null;
  taggedUsers?: TaggedUserRef[];
}): string {
  return buildPostMetaLine({
    creatorName: opts.creatorName,
    moodLabel: opts.moodLabel,
    moodEmoji: opts.moodEmoji,
    taggedNames: opts.taggedUsers?.map((u) => u.fullName),
  });
}
