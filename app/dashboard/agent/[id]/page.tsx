'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  getAgentBotHistory,
  getAgentNicheRequestDetail,
  proposeAgentModel,
  uploadDemoContent,
} from '@/lib/ecosystem';
import type { EcosystemBotMessage, NicheRequestResponse } from '@/types/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';
import { MarkdownBotContent } from '@/components/ecosystem/MarkdownBotContent';
import { stripNicheConfirmedTag } from '@/lib/ecosystem-chat';
import { NotificationHighlightTarget } from '@/components/notifications/NotificationHighlightTarget';
import { NOTIFICATION_TARGET } from '@/lib/notification-highlight';

const proposeSchema = z.object({
  agentNotes: z.string().max(1000).optional(),
});

type ProposeForm = z.infer<typeof proposeSchema>;

function botBubbleClass(m: EcosystemBotMessage): string {
  const t = (m.senderType ?? m.role ?? '').toUpperCase();
  if (t.includes('BOT')) return 'bg-teal-50 text-gray-900';
  return 'bg-gray-100 text-gray-900';
}

function isAgentBotMsg(m: EcosystemBotMessage): boolean {
  const t = (m.senderType ?? m.role ?? '').toUpperCase();
  return t.includes('BOT');
}

function hideHandshake(m: EcosystemBotMessage): boolean {
  const t = (m.senderType ?? m.role ?? '').toUpperCase();
  const human = t.includes('HUMAN') || t.includes('USER');
  return human && m.content?.trim().toUpperCase() === 'START_CONVERSATION';
}

export default function AgentNicheDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';
  const { user, isLoading, hasRole } = useAuth();

  const [detail, setDetail] = useState<NicheRequestResponse | null>(null);
  const [history, setHistory] = useState<EcosystemBotMessage[]>([]);
  const [demoUrl, setDemoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user && !hasRole('ROLE_AGENT')) {
      router.replace('/dashboard');
    }
  }, [isLoading, user, hasRole, router]);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [d, h] = await Promise.all([
        getAgentNicheRequestDetail(id),
        getAgentBotHistory(id).catch(() => [] as EcosystemBotMessage[]),
      ]);
      setDetail(d);
      setHistory(h);
      setDemoUrl(d.demoContentUrl?.trim() ? d.demoContentUrl : null);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load this request.'));
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user || !hasRole('ROLE_AGENT')) return;
    void load();
  }, [load, user, hasRole]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProposeForm>({
    resolver: zodResolver(proposeSchema),
    defaultValues: { agentNotes: '' },
  });

  const onUpload = async (file: File | null) => {
    if (!file || !id) return;
    setUploading(true);
    setFormError(null);
    try {
      const res = await uploadDemoContent(id, file);
      setDemoUrl(res.demoContentUrl);
    } catch (e) {
      setFormError(getApiErrorMessage(e, 'Upload failed.'));
    } finally {
      setUploading(false);
    }
  };

  const onPropose = handleSubmit(async (data) => {
    if (!id || !demoUrl) {
      setFormError('Upload a demo video or image first.');
      return;
    }
    setFormError(null);
    try {
      await proposeAgentModel(id, {
        demoContentUrl: demoUrl,
        agentNotes: data.agentNotes?.trim() ? data.agentNotes.trim() : undefined,
      });
      router.push('/dashboard/agent');
    } catch (e) {
      setFormError(getApiErrorMessage(e, 'Submission failed.'));
    }
  });

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasRole('ROLE_AGENT')) return null;

  return (
    <DashboardHomeShell>
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <Link href="/dashboard/agent" className="text-sm text-[#EA580C] hover:text-[#F97316] dark:text-[#FB923C]">
            ← Agent queue
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">Prepare validation model</h1>
          {detail && (
            <p className="mt-2 font-mono text-sm text-[#EA580C] dark:text-[#FB923C]">{detail.uniqueCode}</p>
          )}
        </div>

        {error && <ErrorAlert message={error} />}
        {formError && <ErrorAlert message={formError} onDismiss={() => setFormError(null)} />}

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : !detail ? (
          <p className="text-gray-600 dark:text-neutral-400">Request not found.</p>
        ) : (
          <>
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Client request</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-gray-500 dark:text-neutral-400">Theme</dt>
                  <dd className="font-medium text-gray-900">{detail.nicheTheme}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Description</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-gray-800">{detail.description}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-neutral-400">Language</dt>
                  <dd>{detail.language}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-neutral-400">Posts / week</dt>
                  <dd>{detail.nbPostsPerWeek}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500 dark:text-neutral-400">Platforms</dt>
                  <dd>{detail.platforms.join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-neutral-400">Reference</dt>
                  <dd className="break-all">
                    {detail.refType === 'URL' && detail.refExternalUrl ? (
                      <a
                        href={detail.refExternalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#EA580C] hover:text-[#F97316] dark:text-[#FB923C]"
                      >
                        {detail.refExternalUrl}
                      </a>
                    ) : detail.refType === 'MCT' && detail.refMctCode ? (
                      <span className="font-mono">{detail.refMctCode}</span>
                    ) : detail.refFileUrl ? (
                      <span className="font-mono text-xs">{detail.refFileUrl}</span>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                {detail.deadline && (
                  <div>
                    <dt className="text-gray-500">Deadline</dt>
                    <dd>{new Date(detail.deadline).toLocaleString('en-US')}</dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Bot chat history (read-only)</h2>
              <div className="mt-4 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
                {history.length === 0 ? (
                  <p className="text-sm text-gray-500">No messages.</p>
                ) : (
                  history
                    .filter((m) => !hideHandshake(m))
                    .map((m) => (
                      <div
                        key={m.id}
                        className={`rounded-lg px-3 py-2 text-sm ${botBubbleClass(m)}`}
                      >
                        {isAgentBotMsg(m) ? (
                          <MarkdownBotContent text={stripNicheConfirmedTag(m.content)} />
                        ) : (
                          <span className="whitespace-pre-wrap">{m.content}</span>
                        )}
                        <div className="mt-1 text-[10px] opacity-70">
                          {new Date(m.sentAt).toLocaleString('en-US')}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </section>

            <NotificationHighlightTarget id={NOTIFICATION_TARGET.AGENT_DEMO} ready={!!detail}>
              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Demo content</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                  Upload a video or image hosted on the platform (URL returned by the backend).
                </p>
                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10">
                  <input
                    type="file"
                    accept="video/*,image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      void onUpload(f ?? null);
                    }}
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {uploading ? 'Uploading…' : 'Drag and drop or click to upload'}
                  </span>
                  {demoUrl && (
                    <span className="mt-2 max-w-full break-all text-xs text-gray-600">{demoUrl}</span>
                  )}
                </label>
              </section>

              <form onSubmit={onPropose} className="mt-8 rounded-2xl border border-orange-100 bg-orange-50/40 p-6 shadow-sm">
                <label htmlFor="agentNotes" className="text-sm font-medium text-gray-900 dark:text-white">
                  Notes for the client
                </label>
                <textarea
                  id="agentNotes"
                  rows={4}
                  {...register('agentNotes')}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                />
                {errors.agentNotes && (
                  <p className="mt-1 text-sm text-red-600">{errors.agentNotes.message}</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || !demoUrl}
                  className="mt-6 rounded-xl bg-[#F97316] px-6 py-3 text-sm font-semibold text-white hover:bg-[#EA580C] disabled:opacity-60"
                >
                  {isSubmitting ? 'Submitting…' : 'Submit validation model'}
                </button>
              </form>
            </NotificationHighlightTarget>
          </>
        )}
      </div>
    </DashboardHomeShell>
  );
}
