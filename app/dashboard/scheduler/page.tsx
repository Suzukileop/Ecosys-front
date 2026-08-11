'use client';

import Link from 'next/link';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';

/** Legacy route — clients no longer schedule posts manually; agents handle publishing. */
export default function SchedulerPage() {
  return (
    <DashboardHomeShell>
      <div className="mx-auto max-w-lg rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">Publishing is agent-managed</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          You don&apos;t schedule posts here. Your assigned agent creates and publishes content on your behalf.
        </p>
        <Link
          href="/dashboard/home"
          className="mt-6 inline-flex rounded-xl bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#EA580C]"
        >
          Back to home
        </Link>
      </div>
    </DashboardHomeShell>
  );
}
