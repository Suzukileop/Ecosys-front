import type { NicheStatus } from '@/types/ecosystem';

const styles: Record<string, { pill: string; dot: string }> = {
  PENDING: {
    pill: 'border-[#F97316]/40 bg-white text-[#EA580C] dark:border-[#F97316]/45 dark:bg-[#F97316]/10 dark:text-[#FB923C]',
    dot: 'bg-[#F97316]',
  },
  PROPOSED: {
    pill: 'border-violet-400 bg-white text-violet-700 dark:border-violet-500/50 dark:bg-violet-950/40 dark:text-violet-300',
    dot: 'bg-violet-500',
  },
  VALIDATED: {
    pill: 'border-emerald-400 bg-white text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  PAID: {
    pill: 'border-emerald-400 bg-white text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  ACTIVE: {
    pill: 'border-emerald-500 bg-white text-emerald-600 dark:border-emerald-400/60 dark:bg-emerald-950/40 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  REJECTED: {
    pill: 'border-red-400 bg-white text-red-700 dark:border-red-500/50 dark:bg-red-950/40 dark:text-red-300',
    dot: 'bg-red-500',
  },
  CANCELLED: {
    pill: 'border-neutral-300 bg-white text-neutral-600 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-400',
    dot: 'bg-neutral-400',
  },
};

const labels: Record<string, string> = {
  PENDING: 'Pending',
  PROPOSED: 'Proposed',
  VALIDATED: 'Validated',
  PAID: 'Paid',
  ACTIVE: 'Active',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

const fallback = {
  pill: 'border-neutral-300 bg-white text-neutral-600 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-400',
  dot: 'bg-neutral-400',
};

type Props = {
  status: NicheStatus | string;
  variant?: 'light' | 'dark';
};

export function NicheStatusBadge({ status }: Props) {
  const key = String(status);
  const cfg = styles[key] ?? fallback;

  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.pill}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} aria-hidden />
      {labels[key] ?? key}
    </span>
  );
}
