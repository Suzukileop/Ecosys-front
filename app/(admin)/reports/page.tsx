'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { listAdminReports, updateAdminReport } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { ContentReport, ReportStatus } from '@/types/marketplace';

const STATUS_OPTIONS: ReportStatus[] = ['PENDING', 'REVIEWED', 'ACTIONED'];

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, isLoading, hasRole } = useAuth();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const page = await listAdminReports('PENDING', 0, 50);
      setReports(page.content);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load reports.'));
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && user && hasRole('ROLE_ADMIN')) {
      void load();
    }
  }, [isLoading, user, hasRole, load]);

  useEffect(() => {
    if (!isLoading && user && !hasRole('ROLE_ADMIN')) {
      router.replace('/dashboard');
    }
  }, [isLoading, user, hasRole, router]);

  const onUpdate = async (reportId: string, status: ReportStatus) => {
    setUpdatingId(reportId);
    setError(null);
    try {
      await updateAdminReport(reportId, { status });
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to update report.'));
    } finally {
      setUpdatingId(null);
    }
  };

  if (!hasRole('ROLE_ADMIN')) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-gray-600">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content reports</h1>
        <p className="mt-1 text-sm text-gray-600">Pending reports awaiting review.</p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-gray-700">No pending reports.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <article
              key={report.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {report.targetType} · {report.reason}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Reported by {report.reporterName ?? report.reporterId} ·{' '}
                    {new Date(report.createdAt).toLocaleString('en-US')}
                  </p>
                  {report.details && (
                    <p className="mt-3 text-sm text-gray-700">{report.details}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">Target ID: {report.targetId}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.filter((s) => s !== 'PENDING').map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={updatingId === report.id}
                      onClick={() => void onUpdate(report.id, status)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                      Mark {status.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
