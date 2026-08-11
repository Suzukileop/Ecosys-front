'use client';

import type { NicheRequestResponse } from '@/types/ecosystem';
import { EcosystemPlatformBadges } from '@/components/ecosystem/EcosystemPlatformBadges';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type Props = {
  request: NicheRequestResponse;
};

export function ActiveEcosystemSection({ request }: Props) {
  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-green-200/80 bg-gradient-to-br from-green-50 via-white to-orange-50/40 p-6 shadow-sm dark:border-green-900/30 dark:from-green-950/30 dark:via-neutral-900 dark:to-orange-950/10">
        <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-900 dark:bg-green-950/60 dark:text-green-200">
          <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
          Active
          {request.activatedAt && (
            <span className="font-normal text-green-800 dark:text-green-300/90">
              since {formatDate(request.activatedAt)}
            </span>
          )}
        </span>
        <h2 className="mt-3 text-xl font-semibold text-neutral-900 dark:text-white">{request.nicheTheme}</h2>
        <p className="mt-1 font-mono text-sm text-neutral-500 dark:text-neutral-400">{request.uniqueCode}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { label: 'Posts / week', value: String(request.nbPostsPerWeek) },
          { label: 'Subscription', value: `${request.monthlyAmountFormatted}/mo` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-neutral-100 bg-white px-4 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {stat.label}
            </p>
            <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-100 bg-neutral-50/60 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950/40">
        <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Platforms
        </p>
        <div className="mt-2">
          <EcosystemPlatformBadges row={request} />
        </div>
      </div>
    </section>
  );
}
