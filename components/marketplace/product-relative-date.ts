import { localeTag, tr } from '@/lib/i18n/active';
/**
 * Compact relative date, as on the News feed (X style): "now", "5m", "3h", "2d", then "Sep 29"
 * (this year) or "Sep 29, 2025".
 */
export function formatCompactDate(iso: string | null | undefined, nowMs = Date.now()): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const diffMin = Math.floor(Math.max(0, nowMs - date.getTime()) / 60_000);
  if (diffMin < 1) return tr('now');
  if (diffMin < 60) return tr('{count}m', { count: diffMin });
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return tr('{count}h', { count: diffH });
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return tr('{count}d', { count: diffD });

  const sameYear = date.getFullYear() === new Date(nowMs).getFullYear();
  return date.toLocaleDateString(localeTag(), sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' });
}
