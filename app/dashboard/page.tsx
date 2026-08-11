import { DashboardHomeShell } from '@/components/DashboardHomeShell';

export default function DashboardOverviewPage() {
  return (
    <DashboardHomeShell fullWidth>
      <div className="mx-auto w-full max-w-[1280px] space-y-6 px-4 sm:px-6">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Your overview will appear here soon.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80 px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900/40">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Empty page — content coming later.</p>
        </div>
      </div>
    </DashboardHomeShell>
  );
}
