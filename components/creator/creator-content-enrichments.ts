export type ContentMood = {
  id: string;
  label: string;
  emoji: string;
};

export const CONTENT_MOODS: ContentMood[] = [
  { id: 'happy', label: 'happy', emoji: '😊' },
  { id: 'loved', label: 'loved', emoji: '🥰' },
  { id: 'excited', label: 'excited', emoji: '🤩' },
  { id: 'grateful', label: 'grateful', emoji: '🙏' },
  { id: 'motivated', label: 'motivated', emoji: '💪' },
  { id: 'creative', label: 'creative', emoji: '🎨' },
  { id: 'proud', label: 'proud', emoji: '😌' },
  { id: 'relaxed', label: 'relaxed', emoji: '😌' },
  { id: 'thoughtful', label: 'thoughtful', emoji: '🤔' },
  { id: 'celebrating', label: 'celebrating', emoji: '🎉' },
];

export type ContentGifOption = {
  id: string;
  label: string;
  url: string;
};

/** Curated GIFs (no external API key required). */
export const CONTENT_GIF_PRESETS: ContentGifOption[] = [
  {
    id: 'thumbs-up',
    label: 'Thumbs up',
    url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
  },
  {
    id: 'clap',
    label: 'Applause',
    url: 'https://media.giphy.com/media/7rj2ZgTvgocMzDUOKN/giphy.gif',
  },
  {
    id: 'wow',
    label: 'Wow',
    url: 'https://media.giphy.com/media/5VKbvrjxpT6BCYVwfy/giphy.gif',
  },
  {
    id: 'fire',
    label: 'Fire',
    url: 'https://media.giphy.com/media/mXK1tQUMy50V8P9X0N/giphy.gif',
  },
  {
    id: 'heart',
    label: 'Heart',
    url: 'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif',
  },
  {
    id: 'dance',
    label: 'Dance',
    url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
  },
  {
    id: 'yes',
    label: 'Yes!',
    url: 'https://media.giphy.com/media/111ebonMs90Y8w/giphy.gif',
  },
  {
    id: 'mind-blown',
    label: 'Mind blown',
    url: 'https://media.giphy.com/media/5VKbvrjxpT6BCYVwfy/giphy.gif',
  },
];

export function formatTaggedNames(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export function buildPostMetaLine(opts: {
  creatorName: string;
  moodLabel?: string | null;
  moodEmoji?: string | null;
  taggedNames?: string[];
}): string {
  const parts: string[] = [opts.creatorName];
  if (opts.moodLabel) {
    parts.push(`is feeling ${opts.moodLabel}${opts.moodEmoji ? ` ${opts.moodEmoji}` : ''}`);
  }
  if (opts.taggedNames && opts.taggedNames.length > 0) {
    parts.push(`with ${formatTaggedNames(opts.taggedNames)}`);
  }
  return parts.join(' ');
}
