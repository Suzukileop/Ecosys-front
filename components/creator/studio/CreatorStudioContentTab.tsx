'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getApiErrorMessage } from '@/lib/api-error';
import { listMyContent } from '@/lib/creator-content-api';
import { CreatorContentPublishModal } from '@/components/creator/CreatorContentPublishModal';
import { CreatorContentPostCard } from '@/components/creator/studio/CreatorContentPostCard';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioContentTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { resolveStudioContentHeadline } from '@/components/creator/studio/studio-content-headline';
import type { ContentPostBucket, CreatorContentItemDto } from '@/types/creator-content';
import { useAuth } from '@/context/AuthContext';

const BUCKETS: { id: ContentPostBucket; label: string; empty: string }[] = [
  { id: 'active', label: 'Published', empty: 'No published content yet.' },
  { id: 'pinned', label: 'Pinned', empty: 'No pinned content yet.' },
  { id: 'archived', label: 'Archived', empty: 'No archived content.' },
  { id: 'trash', label: 'Trash', empty: 'Trash is empty.' },
];

type CreatorStudioContentTabProps = {
  contentHeadline?: string | null;
  specialite?: string | null;
};

export function CreatorStudioContentTab({ contentHeadline, specialite }: CreatorStudioContentTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [items, setItems] = useState<CreatorContentItemDto[]>([]);
  const [bucket, setBucket] = useState<ContentPostBucket>('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);

  const load = useCallback(async (selectedBucket: ContentPostBucket, silent = false) => {
    try {
      setError(null);
      if (!silent) setLoading(true);
      const list = await listMyContent(selectedBucket);
      setItems(list.content);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load your content.'));
      if (!silent) {
        setItems([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(bucket);
  }, [bucket, load]);

  useEffect(() => {
    if (searchParams.get('publish') === '1') {
      setPublishOpen(true);
      router.replace('/dashboard/creator?tab=content', { scroll: false });
    }
  }, [router, searchParams]);

  return (
    <div className="space-y-6">
      <CreatorContentPublishModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onPublished={() => void load(bucket)}
      />

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <h1 className="max-w-3xl text-center text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl dark:text-white">
            {resolveStudioContentHeadline(contentHeadline)}
          </h1>
          <button
            type="button"
            onClick={() => setPublishOpen(true)}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            + Publish content
          </button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-800">
          {BUCKETS.map((entry) => {
            const active = bucket === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setBucket(entry.id)}
                className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
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
      </div>

      {loading ? (
        <CreatorStudioContentTabSkeleton />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-400">
            {BUCKETS.find((b) => b.id === bucket)?.empty}
          </p>
          {bucket === 'active' && (
            <button
              type="button"
              onClick={() => setPublishOpen(true)}
              className="mt-6 inline-flex rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
            >
              Publish your first content
            </button>
          )}
        </div>
      ) : (
        <div className="snap-y snap-proximity">
          {items.map((post) => (
            <section
              key={post.id}
              className="flex min-h-0 snap-center snap-always scroll-mt-6 items-center justify-center pb-10 pt-2"
            >
              <CreatorContentPostCard
                post={post}
                bucket={bucket}
                creatorName={user?.fullName ?? 'You'}
                specialite={specialite}
                onChanged={() => void load(bucket, true)}
                onError={setError}
                className="w-full"
              />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
