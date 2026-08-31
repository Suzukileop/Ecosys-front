'use client';

import type { ContentPostBucket } from '@/types/creator-content';
import {
  CONTENT_POST_BUCKETS,
  contentBucketMeta,
} from '@/components/creator/content/content-buckets';

type ContentBucketListScreenProps = {
  bucket: ContentPostBucket;
  onBucketChange: (bucket: ContentPostBucket) => void;
  className?: string;
};

export function ContentBucketListScreen({
  bucket,
  onBucketChange,
  className = '',
}: ContentBucketListScreenProps) {
  return (
    <div
      className={`flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-800 ${className}`}
      role="tablist"
      aria-label="Content folders"
    >
      {CONTENT_POST_BUCKETS.map((entry) => {
        const active = bucket === entry.id;
        return (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onBucketChange(entry.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-normal transition ${
              active
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            {entry.label}
          </button>
        );
      })}
    </div>
  );
}

export { contentBucketMeta, CONTENT_POST_BUCKETS };
