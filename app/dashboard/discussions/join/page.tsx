'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { acceptConversationInvite } from '@/lib/messaging';
import { getApiErrorMessage } from '@/lib/api-error';

export default function JoinDiscussionPage() {
  return (
    <Suspense
      fallback={
        <DashboardHomeShell wide fullWidth>
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </DashboardHomeShell>
      }
    >
      <JoinDiscussionContent />
    </Suspense>
  );
}

function JoinDiscussionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const conversation = await acceptConversationInvite(token);
        if (cancelled) return;
        router.replace(`/dashboard/discussions?conversation=${encodeURIComponent(conversation.id)}`);
      } catch (e) {
        if (!cancelled) setError(getApiErrorMessage(e, 'Unable to join conversation.'));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <DashboardHomeShell wide fullWidth>
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        {error ? (
          <ErrorAlert message={error} onDismiss={() => router.push('/dashboard/discussions')} />
        ) : (
          <>
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-600 dark:text-neutral-400">Joining conversation…</p>
          </>
        )}
      </div>
    </DashboardHomeShell>
  );
}
