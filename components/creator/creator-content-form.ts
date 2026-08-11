import { z } from 'zod';

export const CREATOR_CONTENT_GENRES = [
  'Tech',
  'Lifestyle',
  'Business',
  'Art',
  'Sport',
  'Music',
  'Other',
] as const;

const taggedUserSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1),
  avatarUrl: z.string().nullable().optional(),
});

const stringListItemSchema = z.object({ value: z.string() });

export const creatorContentPublishStep1Schema = z.object({
  title: z.string().max(200).optional(),
  mediaUrl: z.string().min(1, 'Upload a media file to continue.'),
  mediaType: z.enum(['FILE', 'GIF']).optional(),
  moodLabel: z.string().max(100).optional().nullable(),
  moodEmoji: z.string().max(20).optional().nullable(),
  taggedUsers: z.array(taggedUserSchema).max(5),
});

export const creatorContentPublishStep2Schema = z.object({
  genre: z.string().max(100).optional(),
  description: z.string().max(5000).optional(),
  priceInfo: z.string().max(200).optional(),
  toolsUsed: z.array(stringListItemSchema).max(10),
  tags: z.array(stringListItemSchema).max(10),
  isPublic: z.boolean(),
  commentsEnabled: z.boolean(),
});

export const creatorContentPublishSchema = creatorContentPublishStep1Schema.merge(
  creatorContentPublishStep2Schema
);

export type CreatorContentPublishFormValues = z.infer<typeof creatorContentPublishSchema>;

export const creatorContentPublishDefaults: CreatorContentPublishFormValues = {
  title: '',
  genre: '',
  description: '',
  mediaUrl: '',
  mediaType: 'FILE',
  moodLabel: null,
  moodEmoji: null,
  taggedUsers: [],
  priceInfo: '',
  toolsUsed: [],
  tags: [],
  isPublic: true,
  commentsEnabled: true,
};
