import { msg } from '@/lib/i18n/config';
export type CreatorStudioHeaderContentStyle = 'DEFAULT' | 'COMPACT' | 'CENTERED' | 'GRID';

const CREATOR_STUDIO_HEADER_CONTENT_STYLES: {
  id: CreatorStudioHeaderContentStyle;
  label: string;
}[] = [
  { id: 'DEFAULT', label: msg('Default') },
  { id: 'COMPACT', label: msg('Compact') },
  { id: 'CENTERED', label: msg('Centered') },
  { id: 'GRID', label: msg('Grid stats') },
];

const STYLE_SET = new Set<string>(CREATOR_STUDIO_HEADER_CONTENT_STYLES.map((s) => s.id));

export function parseCreatorStudioHeaderContentStyle(value: unknown): CreatorStudioHeaderContentStyle {
  const raw = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (STYLE_SET.has(raw)) return raw as CreatorStudioHeaderContentStyle;
  return 'DEFAULT';
}
