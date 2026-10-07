import { z } from 'zod';

const taggedUserSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1),
  avatarUrl: z.string().nullable().optional(),
});

const stringListItemSchema = z.object({ value: z.string() });

export const CREATOR_CONTENT_TITLE_MAX = 3000;

const creatorContentPublishStep1Schema = z.object({
  title: z
    .string()
    .max(CREATOR_CONTENT_TITLE_MAX, `Your post is too long (max ${CREATOR_CONTENT_TITLE_MAX} characters).`)
    .optional(),
  mediaUrl: z.string(),
  /** Ordered images of the post; `mediaUrl` mirrors the first one. */
  mediaUrls: z.array(z.string()).max(10, 'A post can hold at most 10 images.'),
  mediaType: z.enum(['FILE', 'GIF']).optional(),
  moodLabel: z.string().max(100).optional().nullable(),
  moodEmoji: z.string().max(20).optional().nullable(),
  taggedUsers: z.array(taggedUserSchema).max(5),
});

const creatorContentPublishStep2Schema = z.object({
  genre: z.string().max(100).optional(),
  description: z.string().max(5000).optional(),
  priceInfo: z.string().max(200).optional(),
  toolsUsed: z.array(stringListItemSchema).max(10),
  tags: z.array(stringListItemSchema).max(10),
  isPublic: z.boolean(),
  commentsEnabled: z.boolean(),
});

export const creatorContentPublishSchema = creatorContentPublishStep1Schema
  .merge(creatorContentPublishStep2Schema)
  .superRefine((data, ctx) => {
    const hasText = Boolean(data.title?.trim() || data.description?.trim());
    if (!hasText && !data.mediaUrl.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Write something or add media.', path: ['title'] });
    }
  });

export type CreatorContentPublishFormValues = z.infer<typeof creatorContentPublishSchema>;

export const creatorContentPublishDefaults: CreatorContentPublishFormValues = {
  title: '',
  genre: '',
  description: '',
  mediaUrl: '',
  mediaUrls: [],
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
