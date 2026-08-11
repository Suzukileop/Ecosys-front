export type DiscussionThreadPatternId =
  | 'none'
  | 'bubbles'
  | 'dots'
  | 'waves'
  | 'minimal'
  | 'crosshatch'
  | 'stripes'
  | 'stars'
  | 'hex'
  | 'diagonal'
  | 'confetti'
  | 'slate';

export const DISCUSSION_THREAD_PATTERN_STORAGE_KEY = 'discussion-thread-pattern';

export type DiscussionThreadPattern = {
  id: DiscussionThreadPatternId;
  label: string;
  description: string;
};

export const DISCUSSION_THREAD_PATTERNS: DiscussionThreadPattern[] = [
  { id: 'none', label: 'None', description: 'Solid background' },
  { id: 'bubbles', label: 'Bubbles', description: 'Chat bubble motif' },
  { id: 'dots', label: 'Dots', description: 'Soft dot grid' },
  { id: 'waves', label: 'Waves', description: 'Flowing curves' },
  { id: 'minimal', label: 'Minimal', description: 'Fine grid' },
  { id: 'crosshatch', label: 'Crosshatch', description: 'Light cross lines' },
  { id: 'stripes', label: 'Stripes', description: 'Diagonal stripes' },
  { id: 'stars', label: 'Stars', description: 'Tiny star field' },
  { id: 'hex', label: 'Hex', description: 'Honeycomb mesh' },
  { id: 'diagonal', label: 'Diagonal', description: 'Bold diagonal lines' },
  { id: 'confetti', label: 'Confetti', description: 'Scattered accents' },
  { id: 'slate', label: 'Slate', description: 'Subtle stone texture' },
];

export const DISCUSSION_THREAD_BASIC_PATTERN_IDS: DiscussionThreadPatternId[] = [
  'none',
  'bubbles',
  'dots',
  'waves',
  'minimal',
];

export const DISCUSSION_THREAD_BASIC_PATTERNS = DISCUSSION_THREAD_PATTERNS.filter((pattern) =>
  DISCUSSION_THREAD_BASIC_PATTERN_IDS.includes(pattern.id)
);

export const DISCUSSION_THREAD_PATTERN_CHANGED = 'discussion-thread-pattern-changed';

export function isDiscussionThreadPatternId(value: string): value is DiscussionThreadPatternId {
  return DISCUSSION_THREAD_PATTERNS.some((pattern) => pattern.id === value);
}

export function getDiscussionThreadPatternClass(patternId: DiscussionThreadPatternId): string {
  if (patternId === 'none') return 'discussion-thread-plain';
  return `discussion-thread-pattern-${patternId}`;
}

export function readStoredDiscussionThreadPattern(): DiscussionThreadPatternId {
  if (typeof window === 'undefined') return 'bubbles';
  const stored = window.localStorage.getItem(DISCUSSION_THREAD_PATTERN_STORAGE_KEY);
  if (stored && isDiscussionThreadPatternId(stored)) return stored;
  return 'bubbles';
}

export function storeDiscussionThreadPattern(patternId: DiscussionThreadPatternId): void {
  window.localStorage.setItem(DISCUSSION_THREAD_PATTERN_STORAGE_KEY, patternId);
  window.dispatchEvent(new CustomEvent(DISCUSSION_THREAD_PATTERN_CHANGED, { detail: patternId }));
}
