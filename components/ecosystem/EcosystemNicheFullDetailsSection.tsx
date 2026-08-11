'use client';

import type { ReactNode } from 'react';
import type { NicheRequestResponse } from '@/types/ecosystem';
import { EcosystemPlatformBadges } from '@/components/ecosystem/EcosystemPlatformBadges';
import { NicheStatusBadge } from '@/components/ecosystem/NicheStatusBadge';
import { RequestCodeBadge } from '@/components/ecosystem/RequestCodeBadge';
import { formatRequestDate, getSubscriptionPeriod } from '@/components/ecosystem/ecosystem-request-utils';

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type Props = {
  request: NicheRequestResponse;
};

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm text-neutral-900 dark:text-neutral-100">{children}</dd>
    </div>
  );
}

export function EcosystemNicheFullDetailsSection({ request }: Props) {
  const { startLabel, endLabel } = getSubscriptionPeriod(request);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Niche details</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Complete summary of your active ecosystem.
          </p>
        </div>
        <NicheStatusBadge status={String(request.status)} />
      </div>

      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        <DetailField label="Theme">
          <span className="font-medium">{request.nicheTheme}</span>
        </DetailField>
        <DetailField label="Code">
          <RequestCodeBadge code={request.uniqueCode} />
        </DetailField>
        <div className="sm:col-span-2">
          <DetailField label="Description">
            <p className="whitespace-pre-wrap rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-950/50">
              {request.description}
            </p>
          </DetailField>
        </div>
        <DetailField label="Languages">{request.language.split(',').join(', ')}</DetailField>
        <DetailField label="Posts / week">{request.nbPostsPerWeek}</DetailField>
        <DetailField label="Monthly subscription">{request.monthlyAmountFormatted}</DetailField>
        <DetailField label="Active since">{formatDateTime(request.activatedAt)}</DetailField>
        <DetailField label="Subscription start">{startLabel}</DetailField>
        <DetailField label="Subscription end">
          <span>{endLabel}</span>
          <span className="mt-0.5 block text-xs text-neutral-500">1 month period</span>
        </DetailField>
        <DetailField label="Created">{formatRequestDate(request.createdAt)}</DetailField>
        <div className="sm:col-span-2">
          <DetailField label="Target platforms">
            <EcosystemPlatformBadges row={request} />
          </DetailField>
        </div>
      </dl>
    </section>
  );
}
