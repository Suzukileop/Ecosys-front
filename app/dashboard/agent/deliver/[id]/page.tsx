'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  deliverAgentContent,
  getAgentNicheRequestDetail,
  listAgentDeliveredContent,
} from '@/lib/ecosystem';
import type { NicheRequestResponse } from '@/types/ecosystem';
import type { ScheduledPostDto } from '@/types/scheduler';
import { ECOSYSTEM_PLATFORMS } from '@/components/ecosystem/PlatformLogoIcon';
import type { EcosystemPlatform } from '@/types/ecosystem';
import { AgentContentPosterGrid } from '@/components/ecosystem/AgentContentPosterGrid';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import { NotificationHighlightTarget } from '@/components/notifications/NotificationHighlightTarget';
import { NOTIFICATION_TARGET } from '@/lib/notification-highlight';

export default function AgentDeliverPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading, hasRole } = useAuth();
  const id = typeof params.id === 'string' ? params.id : '';

  const [request, setRequest] = useState<NicheRequestResponse | null>(null);
  const [posts, setPosts] = useState<ScheduledPostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [platform, setPlatform] = useState('');
  const [caption, setCaption] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && user && !hasRole('ROLE_AGENT')) {
      router.replace('/dashboard/home');
    }
  }, [isLoading, user, hasRole, router]);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [detail, delivered] = await Promise.all([
        getAgentNicheRequestDetail(id),
        listAgentDeliveredContent(id, 0, 50),
      ]);
      if (String(detail.status) !== 'ACTIVE') {
        setError('This niche is not active — delivery is not allowed.');
        setRequest(detail);
        setPosts([]);
        return;
      }
      setRequest(detail);
      setPosts(delivered.content ?? []);
      const firstPlatform = detail.platforms?.[0] ?? 'TIKTOK';
      setPlatform((prev) => prev || firstPlatform);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load this niche.'));
      setRequest(null);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user || !hasRole('ROLE_AGENT')) return;
    void load();
  }, [load, user, hasRole]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !platform) {
      setUploadError('Select a file and a platform.');
      return;
    }
    try {
      setUploading(true);
      setUploadError(null);
      const created = await deliverAgentContent(id, file, platform, caption);
      setPosts((prev) => [created, ...prev]);
      setCaption('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setUploadError(getApiErrorMessage(err, 'Upload failed.'));
    } finally {
      setUploading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasRole('ROLE_AGENT')) return null;

  const platformOptions = (request?.platforms?.length ? request.platforms : ECOSYSTEM_PLATFORMS.map((p) => p.id)) as EcosystemPlatform[];

  return (
    <DashboardHomeShell>
      <div className="space-y-8">
        <div>
          <Link href="/dashboard/agent" className="text-sm text-[#EA580C] hover:text-[#F97316] dark:text-[#FB923C]">
            ← Agent queue
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {request?.nicheTheme ?? 'Deliver content'}
          </h1>
          {request && (
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              Code {request.uniqueCode} · Client {request.clientFullName ?? request.clientEmail ?? '—'}
            </p>
          )}
        </div>

        {error && <ErrorAlert message={error} />}

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : request && String(request.status) === 'ACTIVE' ? (
          <>
            <NotificationHighlightTarget id={NOTIFICATION_TARGET.AGENT_DELIVER} ready={!!request}>
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload content</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                The client will see this content on the Browse page of their active niche.
              </p>

              {uploadError && (
                <p className="mt-4 text-sm text-red-600 dark:text-red-400">{uploadError}</p>
              )}

              <form onSubmit={handleUpload} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
                    File (image or video)
                  </label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,video/*"
                    className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#FFF7ED] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#EA580C] dark:text-neutral-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                  >
                    {platformOptions.map((p) => {
                      const label = ECOSYSTEM_PLATFORMS.find((x) => x.id === p)?.label ?? p;
                      return (
                        <option key={p} value={p}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
                    Caption (optional)
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    maxLength={2200}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                    placeholder="Caption for the post…"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#EA580C] disabled:opacity-60"
                >
                  {uploading ? 'Uploading…' : 'Deliver to client'}
                </button>
              </form>
              </section>
            </NotificationHighlightTarget>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delivered content ({posts.length})
              </h2>
              {posts.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">No content delivered for this niche yet.</p>
              ) : (
                <div className="mt-4">
                  <AgentContentPosterGrid posts={posts} />
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </DashboardHomeShell>
  );
}
