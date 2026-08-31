import type { PortfolioNavIconVariant } from '@/components/portfolio/portfolio-nav-items';
import type { PortfolioNavSectionKey } from '@/components/portfolio/portfolio-nav-items';

export type PortfolioNavMenuGroup = {
  id: string;
  label: string;
  sectionKeys: PortfolioNavSectionKey[];
};

export type PortfolioNavMenuNavItem = {
  id: string;
  label: string;
  icon: PortfolioNavIconVariant;
};

export type PortfolioNavMenuEntry =
  | { type: 'link'; item: PortfolioNavMenuNavItem }
  | { type: 'group'; id: string; label: string; items: PortfolioNavMenuNavItem[] };

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

export function normalizePortfolioNavMenuGroups(raw: unknown): PortfolioNavMenuGroup[] {
  if (!Array.isArray(raw)) return [];
  const usedSections = new Set<PortfolioNavSectionKey>();
  const groups: PortfolioNavMenuGroup[] = [];

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    const label = typeof record.label === 'string' ? record.label.trim().slice(0, 48) : '';
    if (!label) continue;

    const sectionKeys = Array.isArray(record.sectionKeys)
      ? record.sectionKeys
          .filter((key): key is PortfolioNavSectionKey => {
            if (typeof key !== 'string' || !SECTION_KEYS.has(key as PortfolioNavSectionKey)) {
              return false;
            }
            if (usedSections.has(key as PortfolioNavSectionKey)) return false;
            usedSections.add(key as PortfolioNavSectionKey);
            return true;
          })
          .slice(0, 12)
      : [];

    const id =
      typeof record.id === 'string' && record.id.trim().length > 0
        ? record.id.trim()
        : `nav-group-${groups.length + 1}`;

    groups.push({ id, label, sectionKeys });
    if (groups.length >= 8) break;
  }

  return groups;
}

/** Collapse configured section keys into dropdown groups; ungrouped links stay flat. */
export function resolveNavMenuEntries(
  items: PortfolioNavMenuNavItem[],
  groups: PortfolioNavMenuGroup[]
): PortfolioNavMenuEntry[] {
  const activeGroups = groups.filter(
    (group) => group.label.trim().length > 0 && group.sectionKeys.length >= 2
  );
  if (!activeGroups.length) {
    return items.map((item) => ({ type: 'link', item }));
  }

  const itemById = new Map(items.map((item) => [item.id, item]));
  const groupBySection = new Map<string, PortfolioNavMenuGroup>();
  for (const group of activeGroups) {
    for (const key of group.sectionKeys) {
      if (!groupBySection.has(key)) {
        groupBySection.set(key, group);
      }
    }
  }

  const emittedGroups = new Set<string>();
  const entries: PortfolioNavMenuEntry[] = [];

  for (const item of items) {
    const group = groupBySection.get(item.id);
    if (!group) {
      entries.push({ type: 'link', item });
      continue;
    }
    if (emittedGroups.has(group.id)) continue;
    emittedGroups.add(group.id);

    const groupItems = group.sectionKeys
      .map((key) => itemById.get(key))
      .filter((entry): entry is PortfolioNavMenuNavItem => Boolean(entry));

    if (groupItems.length === 0) continue;
    if (groupItems.length === 1) {
      entries.push({ type: 'link', item: groupItems[0] });
      continue;
    }

    entries.push({
      type: 'group',
      id: group.id,
      label: group.label.trim() || 'Menu',
      items: groupItems,
    });
  }

  return entries;
}
