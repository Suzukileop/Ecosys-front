export type CreatorStudioHeaderContentStyle = 'DEFAULT' | 'COMPACT' | 'CENTERED' | 'GRID';

export const CREATOR_STUDIO_HEADER_CONTENT_STYLES: {
  id: CreatorStudioHeaderContentStyle;
  label: string;
}[] = [
  { id: 'DEFAULT', label: 'Default' },
  { id: 'COMPACT', label: 'Compact' },
  { id: 'CENTERED', label: 'Centered' },
  { id: 'GRID', label: 'Grid stats' },
];

const STYLE_SET = new Set<string>(CREATOR_STUDIO_HEADER_CONTENT_STYLES.map((s) => s.id));

export function parseCreatorStudioHeaderContentStyle(value: unknown): CreatorStudioHeaderContentStyle {
  const raw = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (STYLE_SET.has(raw)) return raw as CreatorStudioHeaderContentStyle;
  return 'DEFAULT';
}

export function headerLayoutSupportsContentStyle(layout: string): boolean {
  return layout === 'BANNER' || layout === 'SPLIT';
}
