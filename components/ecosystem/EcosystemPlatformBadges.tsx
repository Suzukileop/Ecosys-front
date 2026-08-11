import type { EcosystemPlatform } from '@/types/ecosystem';
import { ECOSYSTEM_PLATFORMS, PlatformLogoIcon } from '@/components/ecosystem/PlatformLogoIcon';
import { isNicheResponse } from '@/components/ecosystem/ecosystem-request-utils';

export type PlatformBadgeItem = {
  id: EcosystemPlatform;
  label: string;
};

export function getSortedPlatformItems(platforms: string[]): PlatformBadgeItem[] {
  return [...platforms]
    .map((platform) => {
      const id = platform as EcosystemPlatform;
      const label = ECOSYSTEM_PLATFORMS.find((item) => item.id === id)?.label ?? platform;
      return { id, label };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }));
}

export function getSortedRowPlatforms(row: unknown): PlatformBadgeItem[] {
  if (!isNicheResponse(row) || !row.platforms.length) return [];
  return getSortedPlatformItems(row.platforms);
}

type Props = {
  row: unknown;
  className?: string;
  /** When set, only the first N platforms are shown, followed by "..." if there are more. */
  maxVisible?: number;
};

function PlatformBadge({ id, label }: PlatformBadgeItem) {
  return (
    <span
      role="listitem"
      title={label}
      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
    >
      <PlatformLogoIcon platform={id} className="h-4 w-4 shrink-0" />
      {label}
    </span>
  );
}

export function EcosystemPlatformBadges({ row, className = '', maxVisible }: Props) {
  const items = getSortedRowPlatforms(row);

  if (!items.length) {
    return <span className="text-neutral-400">—</span>;
  }

  const visibleItems = maxVisible != null ? items.slice(0, maxVisible) : items;
  const hasMore = maxVisible != null && items.length > maxVisible;
  const hiddenCount = hasMore ? items.length - maxVisible! : 0;
  const hiddenLabels = hasMore ? items.slice(maxVisible).map((item) => item.label).join(', ') : '';
  const allLabels = items.map((item) => item.label).join(', ');

  return (
    <div
      className={`flex items-center gap-2 ${maxVisible != null ? 'flex-nowrap' : 'flex-wrap'} ${className}`}
      role="list"
      aria-label={`Target platforms: ${allLabels}`}
    >
      {visibleItems.map((item) => (
        <PlatformBadge key={item.id} {...item} />
      ))}
      {hasMore && (
        <span
          role="listitem"
          title={`${hiddenCount} more: ${hiddenLabels}`}
          className="inline-flex items-center rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
        >
          ...
        </span>
      )}
    </div>
  );
}
