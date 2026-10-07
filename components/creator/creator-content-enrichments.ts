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
