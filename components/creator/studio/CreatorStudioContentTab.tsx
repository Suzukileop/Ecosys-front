'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getApiErrorMessage } from '@/lib/api-error';
import { listMyContent } from '@/lib/creator-content-api';
import { CreatorContentPublishModal } from '@/components/creator/CreatorContentPublishModal';
import { CreatorContentPostCard } from '@/components/creator/studio/CreatorContentPostCard';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { NewsComposer } from '@/components/home/NewsComposer';
import { creatorStudioContentHeadline, normalizeCreatorAppRole } from '@/lib/creator-app-role';
import { CreatorStudioContentPostsSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import type { ContentPostBucket, CreatorContentItemDto } from '@/types/creator-content';
import { useAuth } from '@/context/AuthContext';

const BUCKETS: { id: ContentPostBucket; label: string; empty: string }[] = [
  { id: 'active', label: 'Published', empty: 'No published content yet.' },
  { id: 'pinned', label: 'Pinned', empty: 'No pinned content yet.' },
  { id: 'archived', label: 'Archived', empty: 'No archived content.' },
  { id: 'trash', label: 'Trash', empty: 'Trash is empty.' },
];

type CreatorStudioContentTabProps = {
  specialite?: string | null;
  specialties?: string[] | null;
  appRole?: string | null;
  /** Controlled publish modal state. */
  publishOpen?: boolean;
  onPublishOpenChange?: (open: boolean) => void;
};

export function CreatorStudioContentTab({
  specialite,
  specialties,
  appRole,
  publishOpen: controlledPublishOpen,
  onPublishOpenChange,
}: CreatorStudioContentTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [items, setItems] = useState<CreatorContentItemDto[]>([]);
  const [bucket, setBucket] = useState<ContentPostBucket>('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localPublishOpen, setLocalPublishOpen] = useState(false);
  const publishOpen = controlledPublishOpen ?? localPublishOpen;
  const setPublishOpen = useCallback(
    (open: boolean) => {
      if (onPublishOpenChange) onPublishOpenChange(open);
      else setLocalPublishOpen(open);
    },
    [onPublishOpenChange]
  );
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
      router.replace('/profile?tab=content', { scroll: false });
    }
  }, [router, searchParams, setPublishOpen]);

  return (
    <div className="space-y-10">
      <CreatorContentPublishModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onPublished={() => void load(bucket)}
        appRole={appRole}
      />

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="w-full">
        <h2 className="min-w-0 px-5 text-[1.5rem] font-bold leading-tight tracking-[-0.01em] text-[#111111] dark:text-white sm:px-0">
          {creatorStudioContentHeadline(normalizeCreatorAppRole(appRole))}
        </h2>

        <div
          role="tablist"
          aria-label="Content status"
          className="mt-6 flex gap-7 overflow-x-auto border-b border-black/[0.08] px-5 [scrollbar-width:none] dark:border-white/[0.1] sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {BUCKETS.map((entry) => {
            const active = bucket === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setBucket(entry.id)}
                className={`relative -mb-px shrink-0 border-b-2 pb-3 text-[15px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 ${
                  active
                    ? 'border-[#111111] text-[#111111] dark:border-white dark:text-white'
                    : 'border-transparent text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
      <div className="min-w-0">
      <div className="mx-auto mb-8 w-full max-w-[760px]">
        <NewsComposer canPublish onCompose={() => setPublishOpen(true)} />
      </div>
      {loading ? (
        <CreatorStudioContentPostsSkeleton />
      ) : items.length === 0 ? (
        <div className="mx-auto w-full max-w-[760px] rounded-xl bg-[#FFFFFF] px-6 py-16 text-center dark:bg-[#111111]">
          <p className="text-[16px] leading-relaxed text-neutral-500 dark:text-neutral-400">
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
        <div className="mx-auto w-full max-w-[760px] space-y-8">
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

      </div>
    </div>
  );
}
