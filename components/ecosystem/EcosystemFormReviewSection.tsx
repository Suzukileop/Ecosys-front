'use client';

import { EcosystemPlatformBadges } from '@/components/ecosystem/EcosystemPlatformBadges';
import type { NicheRequestResponse } from '@/types/ecosystem';

type Props = {
  request: NicheRequestResponse;
};

export function EcosystemFormReviewSection({ request }: Props) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-neutral-100 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Submitted request</h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Read-only summary of your initial form.
      </p>

      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="font-semibold text-neutral-700 dark:text-neutral-300">Theme</dt>
          <dd className="mt-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-white">
            {request.nicheTheme}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-neutral-700 dark:text-neutral-300">Description</dt>
          <dd className="mt-1 whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-white">
            {request.description}
          </dd>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-neutral-700 dark:text-neutral-300">Languages</dt>
            <dd className="mt-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-white">
              {request.language.split(',').join(', ')}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-neutral-700 dark:text-neutral-300">Frequency</dt>
            <dd className="mt-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-white">
              {request.nbPostsPerWeek} posts / week
            </dd>
          </div>
        </div>
        <div>
          <dt className="font-semibold text-neutral-700 dark:text-neutral-300">Target platforms</dt>
          <dd className="mt-3">
            <EcosystemPlatformBadges row={request} />
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-neutral-700 dark:text-neutral-300">Monthly estimate</dt>
          <dd className="mt-1 text-lg font-bold text-[#EA580C]">{request.monthlyAmountFormatted}</dd>
        </div>
      </dl>
    </section>
  );
}
