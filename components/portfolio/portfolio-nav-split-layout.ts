import type { PortfolioNavMenuEntry } from '@/components/portfolio/portfolio-nav-menu-groups';
import type { PortfolioNavSectionKey } from '@/components/portfolio/portfolio-nav-items';

function entrySectionIds(entry: PortfolioNavMenuEntry): string[] {
  if (entry.type === 'link') return [entry.item.id];
  return entry.items.map((item) => item.id);
}

function entryTouchesLeft(
  entry: PortfolioNavMenuEntry,
  leftKeys: Set<PortfolioNavSectionKey>
): boolean {
  return entrySectionIds(entry).some((id) => leftKeys.has(id as PortfolioNavSectionKey));
}

/** Split top-level nav entries around a centered logo. Empty `leftSectionKeys` = even auto split. */
export function splitNavMenuEntries(
  entries: PortfolioNavMenuEntry[],
  leftSectionKeys: PortfolioNavSectionKey[] = []
): { left: PortfolioNavMenuEntry[]; right: PortfolioNavMenuEntry[] } {
  if (entries.length === 0) {
    return { left: [], right: [] };
  }

  if (leftSectionKeys.length === 0) {
    const splitAt = Math.ceil(entries.length / 2);
    return {
      left: entries.slice(0, splitAt),
      right: entries.slice(splitAt),
    };
  }

  const leftKeys = new Set(leftSectionKeys);
  const left: PortfolioNavMenuEntry[] = [];
  const right: PortfolioNavMenuEntry[] = [];

  for (const entry of entries) {
    if (entryTouchesLeft(entry, leftKeys)) {
      left.push(entry);
    } else {
      right.push(entry);
    }
  }

  if (left.length === 0) {
    const splitAt = Math.ceil(entries.length / 2);
    return {
      left: entries.slice(0, splitAt),
      right: entries.slice(splitAt),
    };
  }

  return { left, right };
}

const SECTION_KEYS = new Set<PortfolioNavSectionKey>([
  'info',
  'work',
  'services',
  'about',
  'aboutUs',
  'experience',
  'team',
  'gallery',
  'faq',
  'contact',
  'stack',
  'tools',
]);

export function normalizeSplitNavLeftSectionKeys(raw: unknown): PortfolioNavSectionKey[] {
  if (!Array.isArray(raw)) return [];
  const keys: PortfolioNavSectionKey[] = [];
  for (const entry of raw) {
    if (typeof entry !== 'string' || !SECTION_KEYS.has(entry as PortfolioNavSectionKey)) continue;
    if (keys.includes(entry as PortfolioNavSectionKey)) continue;
    keys.push(entry as PortfolioNavSectionKey);
    if (keys.length >= 12) break;
  }
  return keys;
}
