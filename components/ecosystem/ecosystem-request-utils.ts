import type { NicheRequestResponse, ServiceRequestDto } from '@/types/ecosystem';

export function isNicheResponse(row: unknown): row is NicheRequestResponse {
  return typeof row === 'object' && row !== null && 'nicheTheme' in row && 'nextStep' in row;
}

export function nextStepLabel(step: string): string {
  switch (step) {
    case 'BOT_CHAT':
      return 'Bot chat';
    case 'WAITING_AGENT':
      return 'Waiting for agent';
    case 'VALIDATE_MODEL':
      return 'Model review';
    case 'PAYMENT':
      return 'Payment';
    case 'SCHEDULER':
      return 'Scheduling';
    case 'ACTIVE':
      return 'Active';
    default:
      return step;
  }
}

export function formatRequestDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Période d'abonnement mensuel (1 mois) — début = activatedAt ou createdAt si actif. */
export function getSubscriptionPeriod(row: unknown): {
  startLabel: string;
  endLabel: string;
} {
  let startIso: string | null | undefined = null;

  if (isNicheResponse(row)) {
    startIso =
      row.activatedAt ??
      (['ACTIVE', 'PAID'].includes(String(row.status)) ? row.createdAt : null);
  } else {
    const legacy = row as ServiceRequestDto;
    startIso = legacy.createdAt;
  }

  if (!startIso) {
    return { startLabel: '—', endLabel: '—' };
  }

  const end = new Date(startIso);
  end.setMonth(end.getMonth() + 1);

  return {
    startLabel: formatRequestDate(startIso),
    endLabel: formatRequestDate(end.toISOString()),
  };
}

export type RequestRow = NicheRequestResponse | ServiceRequestDto;

export function getRowId(row: unknown): string {
  return String((row as { id: string }).id);
}

export function getRowCode(row: unknown): string {
  return (row as { uniqueCode: string }).uniqueCode;
}

export function getRowHref(row: unknown): string {
  return `/dashboard/ecosystem/${getRowId(row)}`;
}

export function isActiveNicheRow(row: unknown): boolean {
  return isNicheResponse(row) && String(row.status) === 'ACTIVE';
}

export function getRowConsultHref(row: unknown): string {
  return `/dashboard/ecosystem/${getRowId(row)}/consult`;
}

export function getRowActionHref(row: unknown): string {
  if (isActiveNicheRow(row)) return getRowConsultHref(row);
  return getRowHref(row);
}

export function getRowActionLabel(row: unknown): string {
  if (isActiveNicheRow(row)) return 'Browse';
  return 'View';
}

export type StatusSegment = {
  key: string;
  label: string;
  value: number;
  color: string;
};

export function buildStatusCounts(rows: unknown[]): {
  total: number;
  active: number;
  inProgress: number;
} {
  const nicheRows = rows.filter(isNicheResponse);
  const legacyCount = rows.length - nicheRows.length;
  const active = nicheRows.filter((r) => r.status === 'ACTIVE').length;
  const inProgress =
    nicheRows.filter((r) => !['ACTIVE', 'REJECTED', 'CANCELLED'].includes(String(r.status))).length +
    legacyCount;

  return {
    total: rows.length,
    active,
    inProgress,
  };
}

export function buildStatusSegments(rows: unknown[]): StatusSegment[] {
  const nicheRows = rows.filter(isNicheResponse);
  const legacyCount = rows.length - nicheRows.length;

  const active = nicheRows.filter((r) => r.status === 'ACTIVE').length;
  const inProgress = nicheRows.filter(
    (r) => !['ACTIVE', 'REJECTED', 'CANCELLED'].includes(String(r.status))
  ).length;
  const closed = nicheRows.filter((r) => ['REJECTED', 'CANCELLED'].includes(String(r.status))).length;

  const segments: StatusSegment[] = [];
  if (active > 0) segments.push({ key: 'active', label: 'Active', value: active, color: '#10b981' });
  if (inProgress + legacyCount > 0) {
    segments.push({
      key: 'in_progress',
      label: 'In progress',
      value: inProgress + legacyCount,
      color: '#2563eb',
    });
  }
  if (closed > 0) segments.push({ key: 'closed', label: 'Closed', value: closed, color: '#f59e0b' });

  return segments;
}

export type EcosystemStatusFilter = 'all' | 'inProgress' | 'active';

const NICHE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PROPOSED: 'Proposed',
  VALIDATED: 'Validated',
  PAID: 'Paid',
  ACTIVE: 'Active',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

const LEGACY_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  IN_PROGRESS: 'En cours',
  PROPOSED: 'Proposition',
  VALIDATED: 'Validé',
  REJECTED: 'Rejeté',
  COMPLETED: 'Terminé',
};

const ECOSYSTEM_PLATFORM_LABELS: Record<string, string> = {
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube',
  FACEBOOK: 'Facebook',
  TWITTER: 'X',
};

/** Texte searchable agrégé (toutes colonnes visibles du tableau). */
export function getRowSearchBlob(row: unknown): string {
  const parts: string[] = [getRowCode(row)];

  if (isNicheResponse(row)) {
    parts.push(
      row.nicheTheme,
      ...row.platforms.map(
        (p) => ECOSYSTEM_PLATFORM_LABELS[p] ?? p
      ),
      String(row.status),
      NICHE_STATUS_LABELS[String(row.status)] ?? '',
      row.nextStep,
      nextStepLabel(row.nextStep),
      row.monthlyAmountFormatted,
      formatRequestDate(row.createdAt),
      row.createdAt
    );
  } else {
    const legacy = row as ServiceRequestDto;
    parts.push(
      legacy.type,
      String(legacy.status),
      LEGACY_STATUS_LABELS[String(legacy.status)] ?? '',
      formatRequestDate(legacy.createdAt),
      legacy.createdAt
    );
  }

  return parts.join(' ').toLowerCase();
}

export function matchesRowSearch(row: unknown, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  const blob = getRowSearchBlob(row);
  return trimmed.split(/\s+/).every((token) => blob.includes(token));
}

export function matchesStatusFilter(row: unknown, filter: EcosystemStatusFilter): boolean {
  if (filter === 'all') return true;
  if (isNicheResponse(row)) {
    if (filter === 'active') return row.status === 'ACTIVE';
    return !['ACTIVE', 'REJECTED', 'CANCELLED'].includes(String(row.status));
  }
  return filter === 'inProgress';
}

export function filterEcosystemRows(
  rows: unknown[],
  opts: { search: string; statusFilter: EcosystemStatusFilter }
): unknown[] {
  return rows.filter(
    (row) => matchesStatusFilter(row, opts.statusFilter) && matchesRowSearch(row, opts.search)
  );
}
