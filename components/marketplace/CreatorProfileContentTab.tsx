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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Content</h2>
        <p className="mt-1 text-sm text-neutral-500">{formatContentCountLabel(items.length, creatorName)}</p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-400">No public content yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
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
        loginRedirect={`/login?redirect=/marketplace/${creatorId}`}
      />
    </div>
  );
}
