export type CreatorStudioTabNavAlign = 'LEFT' | 'CENTER' | 'RIGHT';

const TAB_NAV_ALIGN_SET = new Set<string>(['LEFT', 'CENTER', 'RIGHT']);

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
