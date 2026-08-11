'use client';

import { useCallback, useEffect, useState } from 'react';
import type { NicheRequestResponse } from '@/types/ecosystem';
import type { ScheduledPostDto } from '@/types/scheduler';
import { AgentContentPosterGrid } from '@/components/ecosystem/AgentContentPosterGrid';
import { getNicheAgentPosts } from '@/lib/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useVisibilityPolling } from '@/hooks/useVisibilityPolling';
import { AGENT_CONTENT_SYNC_EVENT, type AgentContentSyncDetail } from '@/lib/agent-content-sync';

const POLL_MS_DEFAULT = 12_000;
const POLL_MS_WAITING_TARGET = 3_000;

type Props = {
  request: NicheRequestResponse;
  /** ID du contenu ciblé par une notification — force un rechargement immédiat. */
  syncContentId?: string | null;
};

export function EcosystemAgentContentSection({ request, syncContentId }: Props) {
  const [posts, setPosts] = useState<ScheduledPostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  const loadPosts = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;
      try {
        if (!silent) {
          setLoading(true);
          setPostsError(null);
        }
        const res = await getNicheAgentPosts(request.id, 0, 50);
        setPosts(res.content ?? []);
        if (!silent) setPostsError(null);
      } catch (e) {
        if (!silent) {
          setPostsError(getApiErrorMessage(e, 'Unable to load agent content.'));
          setPosts([]);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [request.id],
  );

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (!syncContentId) return;
    void loadPosts({ silent: true });
  }, [syncContentId, loadPosts]);

  useEffect(() => {
    const onSync = (event: Event) => {
      const detail = (event as CustomEvent<AgentContentSyncDetail>).detail;
      if (detail?.nicheId === request.id) {
        void loadPosts({ silent: true });
      }
    };
    window.addEventListener(AGENT_CONTENT_SYNC_EVENT, onSync);
    return () => window.removeEventListener(AGENT_CONTENT_SYNC_EVENT, onSync);
  }, [request.id, loadPosts]);

  const waitingForTarget = Boolean(
    syncContentId && !posts.some((p) => p.id === syncContentId),
  );
  const pollMs = waitingForTarget ? POLL_MS_WAITING_TARGET : POLL_MS_DEFAULT;

  useVisibilityPolling(() => loadPosts({ silent: true }), pollMs, !loading);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void loadPosts({ silent: true });
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loadPosts]);

  const hasPosts = posts.length > 0;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Agent content</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Content prepared and uploaded by your agent for this niche.
          </p>
        </div>
        {waitingForTarget && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-[#EA580C] dark:bg-orange-950/40 dark:text-[#FB923C]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#F97316]" aria-hidden />
            Synchronizing…
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-6 flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : postsError ? (
        <p className="mt-6 text-sm text-red-600 dark:text-red-400">{postsError}</p>
      ) : !hasPosts ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-200 px-6 py-12 text-center dark:border-neutral-700">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">No content yet</p>
          <p className="mt-1 text-xs text-neutral-500">
            Your agent has not uploaded content for this niche yet. New deliveries appear here automatically.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <AgentContentPosterGrid posts={posts} />
        </div>
      )}
    </section>
  );
}
