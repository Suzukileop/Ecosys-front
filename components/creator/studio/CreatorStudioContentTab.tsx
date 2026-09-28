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
  specialties?: string[] | null;
};

export function CreatorStudioContentTab({
  contentHeadline,
  specialite,
  specialties,
}: CreatorStudioContentTabProps) {
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
    <div className="space-y-10">
      <CreatorContentPublishModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onPublished={() => void load(bucket)}
      />

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="min-w-0 text-[1.5rem] font-bold tracking-[-0.02em] text-[#111111] dark:text-white sm:text-[1.75rem]">
            {resolveStudioContentHeadline(contentHeadline)}
          </h2>
          <button
            type="button"
            onClick={() => setPublishOpen(true)}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#111111] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-[#111111]"
          >
            + Publish content
          </button>
        </div>

        <div role="tablist" aria-label="Content status" className="flex flex-wrap gap-2 lg:hidden">
          {BUCKETS.map((entry) => {
            const active = bucket === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setBucket(entry.id)}
                className={`rounded-full border px-4 py-2 text-[14px] font-medium transition-colors duration-200 ${
                  active
                    ? 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-[#111111]'
                    : 'border-black/[0.1] text-neutral-600 hover:border-black/30 hover:text-[#111111] dark:border-white/[0.12] dark:text-neutral-300 dark:hover:border-white/30 dark:hover:text-white'
                }`}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,640px)_300px] lg:justify-center xl:gap-14">
      <div className="min-w-0">
      {loading ? (
        <CreatorStudioContentTabSkeleton />
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-black/[0.06] bg-white px-6 py-16 text-center dark:border-white/[0.08] dark:bg-[#111111]">
          <p className="text-base text-neutral-500 dark:text-neutral-400">
            {BUCKETS.find((b) => b.id === bucket)?.empty}
          </p>
          {bucket === 'active' && (
            <button
              type="button"
              onClick={() => setPublishOpen(true)}
              className="mt-6 inline-flex rounded-lg bg-[#111111] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-[#111111]"
            >
              Publish your first content
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {items.map((post) => (
            <CreatorContentPostCard
              key={post.id}
              post={post}
              bucket={bucket}
              creatorName={user?.fullName ?? 'You'}
              specialite={specialite}
              specialties={specialties}
              onChanged={() => void load(bucket, true)}
              onError={setError}
            />
          ))}
        </div>
      )}
      </div>

      <aside className="sticky top-24 hidden lg:block" aria-label="Content status">
        <nav role="tablist" aria-label="Content status" className="flex flex-col gap-1">
          {BUCKETS.map((entry) => {
            const active = bucket === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setBucket(entry.id)}
                className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-[15px] transition-colors duration-200 ${
                  active
                    ? 'bg-white font-semibold text-[#111111] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:bg-[#111111] dark:text-white dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                    : 'font-medium text-neutral-500 hover:bg-black/[0.03] hover:text-[#111111] dark:text-neutral-400 dark:hover:bg-white/[0.04] dark:hover:text-white'
                }`}
              >
                {entry.label}
                {active && !loading ? (
                  <span className="text-[13px] font-normal tabular-nums text-neutral-400">{items.length}</span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </aside>
      </div>
    </div>
  );
}
