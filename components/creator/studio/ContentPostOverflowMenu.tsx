'use client';

import { useRouter } from 'next/navigation';
import {
  ContentPostActionsMenu,
  PostMenuIcons,
  type ContentPostActionItem,
} from '@/components/creator/ContentPostActionsMenu';
import type { ContentPostBucket } from '@/types/creator-content';
import { useT } from '@/lib/i18n/I18nProvider';

type ContentPostOverflowMenuProps = {
  postId: string;
  bucket: ContentPostBucket;
  pinned: boolean;
  isPublic?: boolean;
  visibilityBusy?: boolean;
  onVisibilityChange?: (isPublic: boolean) => void;
  commentsEnabled?: boolean;
  commentsBusy?: boolean;
  onCommentsEnabledChange?: (enabled: boolean) => void;
  onEdit?: () => void;
  onPin: () => void;
  onUnpin: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onMoveToTrash: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
};

const iconProps = {
  className: 'h-[18px] w-[18px]',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const StudioMenuIcons = {
  edit: (
    <svg {...iconProps}>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  ),
  pin: (
    <svg {...iconProps}>
      <path d="M9 4h6l-1 6 3 3H7l3-3-1-6Z" />
      <path d="M12 13v7" />
    </svg>
  ),
  archive: (
    <svg {...iconProps}>
      <rect x="3.5" y="4.5" width="17" height="4.5" rx="1" />
      <path d="M5 9v9.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V9M10 13h4" />
    </svg>
  ),
  restore: (
    <svg {...iconProps}>
      <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5" />
      <path d="M4 4v4.5h4.5" />
    </svg>
  ),
  globe: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5S9.7 5.9 12 3.5Z" />
    </svg>
  ),
};

/**
 * The studio post's "…" menu — the News post menu (ContentPostActionsMenu: X-style rounded panel,
 * icon + label rows, destructive actions set apart) fed with the owner's actions for the bucket.
 */
export function ContentPostOverflowMenu({
  postId,
  bucket,
  pinned,
  isPublic = true,
  visibilityBusy = false,
  onVisibilityChange,
  commentsEnabled = true,
  commentsBusy = false,
  onCommentsEnabledChange,
  onEdit,
  onPin,
  onUnpin,
  onArchive,
  onUnarchive,
  onMoveToTrash,
  onRestore,
  onPermanentDelete,
}: ContentPostOverflowMenuProps) {
  const t = useT();
  const router = useRouter();
  const items: ContentPostActionItem[] = [];

  if (bucket === 'trash') {
    items.push(
      { id: 'restore', label: t('Restore'), icon: StudioMenuIcons.restore, onSelect: onRestore },
      {
        id: 'permanent',
        label: t('Delete permanently'),
        description: t('This cannot be undone.'),
        icon: PostMenuIcons.trash,
        tone: 'danger',
        separated: true,
        onSelect: onPermanentDelete,
      }
    );
  } else {
    items.push({
      id: 'edit',
      label: t('Edit'),
      icon: StudioMenuIcons.edit,
      onSelect: onEdit ?? (() => router.push(`/profile/content/${postId}/edit`)),
    });
    if (bucket === 'active' || bucket === 'pinned') {
      items.push({
        id: 'pin',
        label: pinned ? t('Unpin from profile') : t('Pin to your profile'),
        icon: StudioMenuIcons.pin,
        onSelect: pinned ? onUnpin : onPin,
      });
    }
    if (onVisibilityChange) {
      items.push({
        id: 'visibility',
        label: isPublic ? t('Make private') : t('Make public'),
        description: isPublic ? t('Only you will see it, from your profile.') : t('Everyone can see it again.'),
        icon: isPublic ? PostMenuIcons.lock : StudioMenuIcons.globe,
        disabled: visibilityBusy,
        onSelect: () => onVisibilityChange(!isPublic),
      });
    }
    if (onCommentsEnabledChange) {
      items.push({
        id: 'comments',
        label: commentsEnabled ? t('Turn off comments') : t('Turn on comments'),
        icon: PostMenuIcons.comments,
        disabled: commentsBusy,
        onSelect: () => onCommentsEnabledChange(!commentsEnabled),
      });
    }
    if (bucket === 'active' || bucket === 'pinned') {
      items.push({
        id: 'archive',
        label: t('Archive'),
        description: t('Hide it from the feed, keep it here.'),
        icon: StudioMenuIcons.archive,
        onSelect: onArchive,
      });
    }
    if (bucket === 'archived') {
      items.push({ id: 'unarchive', label: t('Unarchive'), icon: StudioMenuIcons.restore, onSelect: onUnarchive });
    }
    items.push({
      id: 'trash',
      label: t('Move to trash'),
      icon: PostMenuIcons.trash,
      tone: 'danger',
      separated: true,
      onSelect: onMoveToTrash,
    });
  }

  return <ContentPostActionsMenu items={items} />;
}
