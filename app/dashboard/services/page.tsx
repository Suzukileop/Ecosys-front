'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function MyServicePageInner() {
  const router = useRouter();
  const { user, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading && user && !hasRole('ROLE_CREATOR')) {
      router.replace('/dashboard/home');
    }
  }, [isLoading, user, hasRole, router]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!hasRole('ROLE_CREATOR')) return null;

  return (
    <div className="mx-auto w-full max-w-3xl py-10">
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center dark:border-neutral-700 dark:bg-[#0F0F0F]">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">My Service</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
          Manage the services you offer. This workspace will let you create, edit, and publish your
          service offerings.
        </p>
        <p className="mt-6 text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          Coming soon
        </p>
      </div>
    </div>
  );
}

export default function MyServicePage() {
  return (
    <DashboardHomeShell>
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        }
      >
        <MyServicePageInner />
      </Suspense>
    </DashboardHomeShell>
  );
}
