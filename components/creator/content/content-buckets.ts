import type { ContentPostBucket } from '@/types/creator-content';

export type ContentBucketMeta = {
  id: ContentPostBucket;
  label: string;
  empty: string;
};

export const CONTENT_POST_BUCKETS: ContentBucketMeta[] = [
  { id: 'active', label: 'Published', empty: 'No published content yet.' },
  { id: 'pinned', label: 'Pinned', empty: 'No pinned content yet.' },
  { id: 'archived', label: 'Archived', empty: 'No archived content.' },
  { id: 'trash', label: 'Trash', empty: 'Trash is empty.' },
];

const BUCKET_BY_ID = new Map(CONTENT_POST_BUCKETS.map((entry) => [entry.id, entry]));

export function contentBucketMeta(bucket: ContentPostBucket): ContentBucketMeta {
  return BUCKET_BY_ID.get(bucket) ?? CONTENT_POST_BUCKETS[0];
}
