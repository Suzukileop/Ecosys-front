import type { PublicContentFeedItem } from '@/types/marketplace';

export type ContentPostBucket = 'active' | 'pinned' | 'archived' | 'trash';

export type ContentMediaType = 'FILE' | 'GIF';

export interface TaggedUserRef {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
}

export interface CreatorContentCreateBody {
  title?: string | null;
  genre?: string | null;
  description?: string | null;
  mediaUrl?: string | null;
  /** Ordered images of a multi-image post (max 10); the first one becomes the cover. */
  mediaUrls?: string[];
  mediaType?: ContentMediaType;
  textColor?: string | null;
  moodLabel?: string | null;
  moodEmoji?: string | null;
  taggedUserIds?: string[];
  priceInfo?: string | null;
  toolsUsed?: string[];
  tags?: string[];
  isPublic: boolean;
  commentsEnabled?: boolean;
}

export interface CreatorContentItemDto {
  id: string;
  title: string | null;
  genre: string | null;
  description: string | null;
  mediaUrl: string | null;
  mediaUrls?: string[];
  mediaType?: ContentMediaType | null;
  textColor?: string | null;
  moodLabel?: string | null;
  moodEmoji?: string | null;
  taggedUsers?: TaggedUserRef[];
  priceInfo: string | null;
  toolsUsed: string[];
  tags?: string[];
  isPublic: boolean;
  commentsEnabled?: boolean;
  pinned?: boolean;
  archivedAt?: string | null;
  views: number;
  likes: number;
  createdAt: string;
  /** Set when this entry is a repost of someone else's post. */
  repostOf?: PublicContentFeedItem | null;
}
