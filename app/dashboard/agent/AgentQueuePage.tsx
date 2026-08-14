'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { listAgentActiveNiches, listAgentNicheRequests } from '@/lib/ecosystem';
import type { NicheRequestResponse } from '@/types/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NicheStatusBadge } from '@/components/ecosystem/NicheStatusBadge';

type Tab = 'queue' | 'active';

function nextStepLabel(step: string): string {
  switch (step) {
    case 'BOT_CHAT':
      return '💬 Bot';
    case 'WAITING_AGENT':
      return '⏳ Awaiting agent';
    case 'VALIDATE_MODEL':
      return '👀 Validation';
    case 'PAYMENT':
      return '💳 Payment';
    case 'SCHEDULER':
      return '📅 Scheduling';
    case 'ACTIVE':
      return '✅ Active';
    default:
      return step;
  }
}

export default function AgentQueuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab: Tab = searchParams.get('tab') === 'active' ? 'active' : 'queue';

  const { user, isLoading, hasRole } = useAuth();
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{ content: NicheRequestResponse[]; totalPages: number; last: boolean } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const size = 10;

  useEffect(() => {
    if (!isLoading && user && !hasRole('ROLE_AGENT')) {
      router.replace('/dashboard/home');
    }
  }, [isLoading, user, hasRole, router]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res =
        tab === 'active'
          ? await listAgentActiveNiches(page, size)
          : await listAgentNicheRequests(page, size);
      setData(res);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load the agent queue.'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, tab]);

  useEffect(() => {
    setPage(0);
  }, [tab]);

  useEffect(() => {
    if (!user || !hasRole('ROLE_AGENT')) return;
    void load();
  }, [load, user, hasRole]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasRole('ROLE_AGENT')) {
    return null;
  }

  const queueRows = (data?.content ?? []).filter((r) => {
    if (r.status !== 'PENDING') return false;
    const confirmed = r.botConfirmed;
    return confirmed === true || confirmed === undefined;
  });

  const activeRows = tab === 'active' ? (data?.content ?? []) : [];

  return (
    <DashboardHomeShell>
      <div className="space-y-8">
        <div>
          <Link href="/dashboard/home" className="text-sm text-[#EA580C] hover:text-[#F97316] dark:text-[#FB923C]">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Agent queue</h1>
          <p className="text-sm text-gray-600 dark:text-neutral-400">
            Validate new requests and deliver content for active niches.
          </p>
        </div>

        <div className="flex gap-2 border-b border-gray-200 dark:border-neutral-800">
          <Link
            href="/dashboard/agent?tab=queue"
            className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === 'queue'
                ? 'border-[#F97316] text-[#EA580C] dark:text-[#FB923C]'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-neutral-400'
            }`}
          >
            Validation queue
          </Link>
          <Link
            href="/dashboard/agent?tab=active"
            className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === 'active'
                ? 'border-[#F97316] text-[#EA580C] dark:text-[#FB923C]'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-neutral-400'
            }`}
          >
            Active niches
          </Link>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : tab === 'queue' ? (
            queueRows.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <p>No requests to process right now.</p>
                <p className="mt-2 text-sm text-gray-400">Requests appear here after the client confirms the bot chat.</p>
              </div>
            ) : (
              <QueueTable rows={queueRows} />
            )
          ) : activeRows.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <p>No active niches right now.</p>
              <p className="mt-2 text-sm text-gray-400">Active niches appear here after client payment.</p>
            </div>
          ) : (
            <ActiveTable rows={activeRows} />
          )}
        </div>

        {data && data.totalPages > 1 && (
          <nav className="flex items-center justify-between text-sm" aria-label="Agent pagination">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-neutral-700"
            >
              Previous
            </button>
            <span className="text-gray-600 dark:text-neutral-400">
              Page {page + 1} / {data.totalPages}
            </span>
            <button
              type="button"
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-neutral-700"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </DashboardHomeShell>
  );
}

function QueueTable({ rows }: { rows: NicheRequestResponse[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-neutral-800">
        <thead className="bg-gray-50 dark:bg-neutral-950">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-neutral-300">Theme</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-neutral-300">Code</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-neutral-300">Step</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-neutral-300">Created</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-neutral-300">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.nicheTheme}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-neutral-400">{row.uniqueCode}</td>
              <td className="px-4 py-3">
                <span className="mr-2 inline-block">
                  <NicheStatusBadge status={row.status} />
                </span>
                <span className="text-gray-600 dark:text-neutral-400">{nextStepLabel(row.nextStep)}</span>
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-neutral-400">
                {new Date(row.createdAt).toLocaleString('en-US')}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/dashboard/agent/${row.id}`}
                  className="font-semibold text-[#EA580C] hover:text-[#F97316] dark:text-[#FB923C]"
                >
                  Prepare model
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActiveTable({ rows }: { rows: NicheRequestResponse[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-neutral-800">
        <thead className="bg-gray-50 dark:bg-neutral-950">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-neutral-300">Theme</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-neutral-300">Code</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-neutral-300">Client</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-neutral-300">Activated</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-neutral-300">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.nicheTheme}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-neutral-400">{row.uniqueCode}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-neutral-400">
                {row.clientFullName ?? row.clientEmail ?? '—'}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-neutral-400">
                {row.activatedAt ? new Date(row.activatedAt).toLocaleString('en-US') : '—'}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/dashboard/agent/deliver/${row.id}`}
                  className="font-semibold text-[#EA580C] hover:text-[#F97316] dark:text-[#FB923C]"
                >
                  Deliver content
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
