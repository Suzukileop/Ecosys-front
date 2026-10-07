'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ContentPostGalleryThumb,
  ContentPostLightbox,
} from '@/components/creator/ContentPostLightbox';
import { PublicCreatorProfileContentTabSkeleton } from '@/components/marketplace/PublicCreatorProfileSkeleton';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { getApiErrorMessage } from '@/lib/api-error';
import { listPublicContentFeed } from '@/lib/marketplace-api';
import type { PublicContentFeedItem } from '@/types/marketplace';

function formatContentCountLabel(count: number, creatorName: string): string {
  if (count === 0) {
    return `No public content from ${creatorName} yet.`;
  }
  if (count === 1) {
    return `1 public post by ${creatorName}.`;
  }
  return `${count} public posts by ${creatorName}.`;
}

type CreatorProfileContentTabProps = {
  creatorId: string;
  creatorName: string;
};

export function CreatorProfileContentTab({ creatorId, creatorName }: CreatorProfileContentTabProps) {
  const searchParams = useSearchParams();
  const deepLinkPostId = searchParams.get('post');
  const [items, setItems] = useState<PublicContentFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<PublicContentFeedItem | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listPublicContentFeed({ creatorId, page: 0, size: 50 });
      setItems(result.content);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load content.'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!deepLinkPostId || items.length === 0) return;
    const match = items.find((item) => item.id === deepLinkPostId);
    if (match) {
      setActivePost(match);
    }
  }, [deepLinkPostId, items]);

  if (loading) {
    return <PublicCreatorProfileContentTabSkeleton />;
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-[1.375rem] font-semibold tracking-[-0.015em] text-[#111111] dark:text-white sm:text-[1.5rem]">
          Content
        </h2>
        <p className="mt-2 text-[1rem] text-neutral-600 dark:text-neutral-300">
          {formatContentCountLabel(items.length, creatorName)}
        </p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {items.length === 0 ? (
        <div className="rounded-lg border border-black/[0.06] bg-white px-6 py-16 text-center dark:border-white/[0.08] dark:bg-[#111111]">
          <p className="text-[1.0625rem] text-neutral-600 dark:text-neutral-300">No public content yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {items.map((post) => (
            <ContentPostGalleryThumb
              key={post.id}
              post={post}
              onOpen={() => setActivePost(post)}
            />
          ))}
        </div>
      )}

      <ContentPostLightbox
        post={activePost}
        open={Boolean(activePost)}
        onClose={() => setActivePost(null)}
        loginRedirect={`/login?redirect=/providers/${creatorId}`}
      />
    </div>
  );
}
