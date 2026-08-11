'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ServiceRequestDto } from '@/types/ecosystem';
import { EcosystemRequestDetailsPopover } from '@/components/ecosystem/EcosystemRequestDetailsPopover';
import { EcosystemPlatformBadges } from '@/components/ecosystem/EcosystemPlatformBadges';
import { NicheStatusBadge } from '@/components/ecosystem/NicheStatusBadge';
import { ServiceRequestStatusBadge } from '@/components/ui/ServiceRequestStatusBadge';
import {
  formatRequestDate,
  getRowActionHref,
  getRowActionLabel,
  getRowHref,
  getRowId,
  isActiveNicheRow,
  isNicheResponse,
  nextStepLabel,
} from '@/components/ecosystem/ecosystem-request-utils';

function RowActionLink({ row }: { row: unknown }) {
  return (
    <Link
      href={getRowActionHref(row)}
      className="group/link inline-flex items-center gap-0.5 text-sm font-semibold text-neutral-900 transition hover:text-[#EA580C] dark:text-neutral-100 dark:hover:text-[#FB923C]"
    >
      {getRowActionLabel(row)}
      <svg className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function ViewLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="group/link inline-flex items-center gap-0.5 text-sm font-semibold text-neutral-900 transition hover:text-[#EA580C] dark:text-neutral-100 dark:hover:text-[#FB923C]"
    >
      View
      <svg className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function StatusStepCell({ status, stepLabel }: { status: string; stepLabel: string }) {
  if (status === 'ACTIVE') {
    return <NicheStatusBadge status={status} />;
  }

  return (
    <div className="flex w-fit max-w-full flex-wrap items-center gap-2">
      <NicheStatusBadge status={status} />
      <span className="text-base text-neutral-400 dark:text-neutral-500" aria-hidden>
        →
      </span>
      <span className="text-sm text-neutral-700 dark:text-neutral-300">{stepLabel}</span>
    </div>
  );
}

function LegacyStatusStepCell({ status }: { status: ServiceRequestDto['status'] }) {
  if (status === 'COMPLETED') {
    return <ServiceRequestStatusBadge status={status} />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ServiceRequestStatusBadge status={status} />
      <span className="text-base text-neutral-400 dark:text-neutral-500" aria-hidden>
        →
      </span>
      <span className="text-sm text-neutral-500">—</span>
    </div>
  );
}

function NicheCell({ title, row }: { title: string; row: unknown }) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="truncate font-semibold text-neutral-900 dark:text-neutral-100" title={title}>
        {title}
      </p>
      <EcosystemRequestDetailsPopover row={row} />
    </div>
  );
}

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const gridItem = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
  },
};

type Props = {
  rows: unknown[];
};

function stripedRowClass(index: number): string {
  return index % 2 === 1
    ? 'bg-neutral-50 dark:bg-neutral-800/35'
    : 'bg-white dark:bg-neutral-900';
}

function stripedRowHoverClass(): string {
  return 'hover:bg-neutral-100 dark:hover:bg-neutral-800/55';
}

function stripedCardClass(index: number): string {
  return index % 2 === 1
    ? 'border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/35'
    : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900';
}

export function EcosystemRequestsGrid({ rows }: Props) {
  return (
    <motion.div
      className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-2"
      variants={gridContainer}
      initial="hidden"
      animate="show"
    >
      {rows.map((row, index) => {
        if (isNicheResponse(row)) {
          return (
            <motion.div key={getRowId(row)} variants={gridItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <div className={`flex h-full flex-col gap-4 rounded-2xl border p-5 shadow-sm ${stripedCardClass(index)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-neutral-900 dark:text-white">{row.nicheTheme}</p>
                    <EcosystemRequestDetailsPopover row={row} className="mt-1" />
                  </div>
                  <div className="shrink-0">
                    <EcosystemPlatformBadges row={row} maxVisible={2} />
                  </div>
                </div>
                <div className="self-start">
                  <StatusStepCell status={String(row.status)} stepLabel={nextStepLabel(row.nextStep)} />
                </div>
                <div className="flex items-end justify-between gap-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                  <div>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">{row.monthlyAmountFormatted}</p>
                    <p className="text-xs text-neutral-500">{formatRequestDate(row.createdAt)}</p>
                  </div>
                  <RowActionLink row={row} />
                </div>
              </div>
            </motion.div>
          );
        }

        const legacy = row as ServiceRequestDto;
        return (
          <motion.div key={getRowId(legacy)} variants={gridItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <div className={`flex h-full flex-col gap-4 rounded-2xl border p-5 shadow-sm ${stripedCardClass(index)}`}>
              <div className="space-y-1">
                <p className="text-base font-semibold text-neutral-900 dark:text-white">{legacy.type}</p>
                <EcosystemRequestDetailsPopover row={legacy} />
              </div>
              <LegacyStatusStepCell status={legacy.status} />
              <div className="flex items-end justify-between gap-3">
                <p className="text-xs text-neutral-500">{formatRequestDate(legacy.createdAt)}</p>
                <ViewLink href={getRowHref(legacy)} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function EcosystemRequestsTable({ rows }: Props) {
  const hasActiveRows = rows.some(isActiveNicheRow);
  const lastColumnLabel = hasActiveRows ? 'Browse' : 'Open';
  const columns = ['Niche', 'Platforms', 'Status', 'Amount', 'Date', lastColumnLabel] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="hidden overflow-x-auto md:block"
    >
      <table className="min-w-full table-fixed text-sm">
        <colgroup>
          <col className="w-[30%] min-w-[200px]" />
          <col className="w-[18%] min-w-[140px]" />
          <col className="w-[22%]" />
          <col className="w-[10%]" />
          <col className="w-[12%]" />
          <col className="w-[8%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/80">
            {columns.map((col, i) => (
              <th
                key={col}
                scope="col"
                className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 ${i === columns.length - 1 ? 'text-right' : ''}`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            if (isNicheResponse(row)) {
              return (
                <motion.tr
                  key={getRowId(row)}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`border-b border-neutral-100 transition-colors dark:border-neutral-800 ${stripedRowClass(index)} ${stripedRowHoverClass()}`}
                >
                  <td className="px-4 py-4">
                    <NicheCell title={row.nicheTheme} row={row} />
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <EcosystemPlatformBadges row={row} maxVisible={2} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusStepCell status={String(row.status)} stepLabel={nextStepLabel(row.nextStep)} />
                  </td>
                  <td className="px-4 py-4 text-neutral-900 dark:text-neutral-200">{row.monthlyAmountFormatted}</td>
                  <td className="px-4 py-4 text-neutral-500">{formatRequestDate(row.createdAt)}</td>
                  <td className="px-4 py-4 text-right">
                    <RowActionLink row={row} />
                  </td>
                </motion.tr>
              );
            }

            const legacy = row as ServiceRequestDto;
            return (
              <motion.tr
                key={getRowId(legacy)}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`border-b border-neutral-100 transition-colors dark:border-neutral-800 ${stripedRowClass(index)} ${stripedRowHoverClass()}`}
              >
                <td className="px-4 py-4">
                  <NicheCell title={legacy.type} row={legacy} />
                </td>
                <td className="px-4 py-4 text-neutral-400">—</td>
                <td className="px-4 py-4">
                  <LegacyStatusStepCell status={legacy.status} />
                </td>
                <td className="px-4 py-4 text-neutral-400">—</td>
                <td className="px-4 py-4 text-neutral-500">{formatRequestDate(legacy.createdAt)}</td>
                <td className="px-4 py-4 text-right">
                  <ViewLink href={getRowHref(legacy)} />
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );
}

export function EcosystemRequestsMobileList({ rows }: Props) {
  return (
    <ul className="md:hidden">
      {rows.map((row, index) => {
        if (isNicheResponse(row)) {
          return (
            <li
              key={getRowId(row)}
              className={`border-b border-neutral-100 dark:border-neutral-800 ${stripedRowClass(index)}`}
            >
              <div className="flex flex-col gap-3 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link href={getRowActionHref(row)} className="block font-medium text-neutral-900 dark:text-white">
                      {row.nicheTheme}
                    </Link>
                    <EcosystemRequestDetailsPopover row={row} className="mt-1" />
                    <div className="mt-2">
                      <EcosystemPlatformBadges row={row} maxVisible={2} />
                    </div>
                    <div className="mt-2">
                      <StatusStepCell status={String(row.status)} stepLabel={nextStepLabel(row.nextStep)} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">{row.monthlyAmountFormatted}/mo</span>
                      <span aria-hidden>·</span>
                      <span>{formatRequestDate(row.createdAt)}</span>
                    </div>
                  </div>
                  <RowActionLink row={row} />
                </div>
              </div>
            </li>
          );
        }

        const legacy = row as ServiceRequestDto;
        return (
          <li
            key={getRowId(legacy)}
            className={`border-b border-neutral-100 dark:border-neutral-800 ${stripedRowClass(index)}`}
          >
            <div className="flex items-start justify-between gap-3 px-4 py-4">
              <div className="min-w-0 flex-1">
                <Link href={getRowHref(legacy)} className="font-medium text-neutral-900 dark:text-white">
                  {legacy.type}
                </Link>
                <EcosystemRequestDetailsPopover row={legacy} className="mt-1" />
                <div className="mt-2">
                  <LegacyStatusStepCell status={legacy.status} />
                </div>
                <p className="mt-2 text-xs text-neutral-500">{formatRequestDate(legacy.createdAt)}</p>
              </div>
              <ViewLink href={getRowHref(legacy)} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
