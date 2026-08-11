export type CreatorStudioTabNavAlign = 'LEFT' | 'CENTER' | 'RIGHT';

const TAB_NAV_ALIGN_SET = new Set<string>(['LEFT', 'CENTER', 'RIGHT']);

export const CREATOR_STUDIO_TAB_NAV_ALIGN_OPTIONS: {
  id: CreatorStudioTabNavAlign;
  label: string;
  description: string;
}[] = [
  { id: 'LEFT', label: 'Left', description: 'Tabs start from the left edge.' },
  { id: 'CENTER', label: 'Center', description: 'Tabs are centered above your content.' },
  { id: 'RIGHT', label: 'Right', description: 'Tabs align to the right side.' },
];

export function parseCreatorStudioTabNavAlign(value: unknown): CreatorStudioTabNavAlign {
  const raw = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (TAB_NAV_ALIGN_SET.has(raw)) return raw as CreatorStudioTabNavAlign;
  return 'LEFT';
}

export function creatorStudioTabNavAlignClass(align: CreatorStudioTabNavAlign): string {
  switch (align) {
    case 'CENTER':
      return 'justify-center';
    case 'RIGHT':
      return 'justify-end';
    default:
      return 'justify-start';
  }
}
