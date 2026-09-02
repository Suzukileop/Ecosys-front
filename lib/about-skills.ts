import type { ProfileSkillEntry } from '@/types/ecosystem';

export type { ProfileSkillEntry };

export const MAX_ABOUT_SKILLS = 12;
export const MAX_ABOUT_SKILL_TITLE = 120;
export const MAX_ABOUT_SKILL_DESCRIPTION = 280;

export function createEmptyAboutSkillEntry(sortOrder: number): ProfileSkillEntry {
  return {
    id: crypto.randomUUID(),
    sortOrder,
    title: '',
    description: '',
  };
}

export function parseAboutSkills(raw: unknown): ProfileSkillEntry[] {
  if (!Array.isArray(raw)) return [];
  const entries: ProfileSkillEntry[] = [];
  raw.forEach((item, index) => {
    if (typeof item === 'string') {
      const title = item.trim();
      if (!title) return;
      entries.push({
        id: crypto.randomUUID(),
        sortOrder: index,
        title,
        description: '',
      });
      return;
    }
    if (!item || typeof item !== 'object') return;
    const row = item as Record<string, unknown>;
    const title = row.title != null ? String(row.title).trim() : '';
    const description = row.description != null ? String(row.description).trim() : '';
    if (!title && !description) return;
    entries.push({
      id: row.id != null ? String(row.id) : crypto.randomUUID(),
      sortOrder: typeof row.sortOrder === 'number' ? row.sortOrder : index,
      title,
      description,
    });
  });
  return entries
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, MAX_ABOUT_SKILLS);
}

export function serializeAboutSkills(items: ProfileSkillEntry[]) {
  return items
    .filter((item) => item.title.trim().length > 0)
    .map((item, index) => ({
      id: item.id,
      sortOrder: index,
      title: item.title.trim(),
      description: item.description.trim(),
    }));
}

export function resolveAboutSkillEntries(
  skills?: ProfileSkillEntry[] | string[] | null
): ProfileSkillEntry[] {
  if (!skills?.length) return [];
  if (typeof skills[0] === 'string') {
    return parseAboutSkills(skills);
  }
  return skills as ProfileSkillEntry[];
}

export function skillEntryLabels(entries: ProfileSkillEntry[]): string[] {
  return entries.map((entry) => entry.title.trim()).filter(Boolean);
}

export function sameAboutSkills(left: ProfileSkillEntry[], right: ProfileSkillEntry[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((item, index) => {
    const other = right[index];
    return (
      item.id === other.id &&
      item.sortOrder === other.sortOrder &&
      item.title.trim() === other.title.trim() &&
      item.description.trim() === other.description.trim()
    );
  });
}
