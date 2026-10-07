'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ContentPostActionsMenu, PostMenuIcons, type ContentPostActionItem } from '@/components/creator/ContentPostActionsMenu';
import { ContentPostClampedTitle } from '@/components/creator/ContentPostClampedTitle';
import { ContentPostLightbox } from '@/components/creator/ContentPostLightbox';
import { ContentPostReportDialog } from '@/components/creator/ContentPostReportDialog';
import {
  ContentPostSocialBar,
  REPOST_CHANGE_EVENT,
  type RepostChangeDetail,
} from '@/components/creator/ContentPostSocialBar';
import { CommentThread } from '@/components/marketplace/CommentThread';
import {
  COMMENTS_INLINE_CLASS,
  COMMENTS_SHEET_CLASS,
  PostCommentsSurface,
} from '@/components/creator/PostCommentsSurface';
import {
  EmbeddedOriginal,
  PostMedia,
  PostTextBlock,
  UnavailableOriginal,
  formatPostTime,
  postHasMedia,
} from '@/components/home/NewsFeedPostParts';
import { AvatarImage } from '@/components/ui/PersonAvatar';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  updateContentCommentsEnabled,
  updateContentVisibility,
  moveContentToTrash,
} from '@/lib/creator-content-api';
import { creatorPostAvatarRingClass, normalizeCreatorAppRole } from '@/lib/creator-app-role';
import { hideContentPost, listComments, undoRepostContent, unhideContentPost } from '@/lib/marketplace-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { useAuth } from '@/context/AuthContext';
import { useCreatorAppRole } from '@/hooks/useCreatorAppRole';
import type { PublicContentFeedItem } from '@/types/marketplace';

const NEWS_LOGIN_REDIRECT = '/login?redirect=/feed';

/** Why a card is no longer showing its post. */
type Gone = 'hidden' | 'removed' | 'private' | 'unreposted' | null;

/** Read-only News feed card — same anatomy as the studio `CreatorContentPostCard`. */
export function NewsFeedPostCard({
  post,
  className = '',
  priority = false,
  onReposted,
}: {
  post: PublicContentFeedItem;
  className?: string;
  /** First card of the feed: its media is the largest thing above the fold. */
  priority?: boolean;
  /** A repost the viewer just created from this card — the feed shows it at the top. */
  onReposted?: (repost: PublicContentFeedItem) => void;
}) {
  const { user, isAuthenticated, hasRole } = useAuth();
  const { appRole, ready: appRoleReady } = useCreatorAppRole();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const closeComments = useCallback(() => setCommentsOpen(false), []);
  /**
   * The feed payload carries the count; `liveCommentCount` only holds a value once this card has
   * a fresher one — a legacy payload it had to fetch, or a comment the viewer just posted.
   */
  const [liveCommentCount, setCommentCount] = useState<number | undefined>(undefined);
  const commentCount = liveCommentCount ?? post.commentCount;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxVideoTime, setLightboxVideoTime] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [gone, setGone] = useState<Gone>(null);
  const [commentsEnabledOverride, setCommentsEnabledOverride] = useState<boolean | null>(null);

  /* A repost shows the original's content under the reposter's own note. */
  const original = post.repostOf ?? null;
  const isRepost = post.repostOf !== undefined && post.repostOf !== null;
  const content = original ?? post;
  const creator = post.creator;
  const creatorName = creator.fullName?.trim() || 'Creator';
  const isOwnPost = Boolean(user?.id && user.id === creator.id);
  const contentIsOwn = Boolean(user?.id && user.id === content.creator.id);
  const commentsEnabled = commentsEnabledOverride ?? post.commentsEnabled !== false;
  /* "Hire" is for people who hire: recruiters / HR / clients — a plain client account, or a creator
     who picked the "RH / Recruiter / Client" role. Everyone else (guests, other creators) never sees it. */
  const canHire =
    !isOwnPost &&
    isAuthenticated &&
    appRoleReady &&
    (appRole === 'RH_RECRUITER' || (!hasRole('ROLE_CREATOR') && hasRole('ROLE_CLIENT')));

  /* The card is reused for another post (feed reload): drop everything that belonged to the old one. */
  const [shownPostId, setShownPostId] = useState(post.id);
  if (shownPostId !== post.id) {
    setShownPostId(post.id);
    setCommentsOpen(false);
    setCommentCount(undefined);
    setLightboxOpen(false);
    setReportOpen(false);
    setGone(null);
    setCommentsEnabledOverride(null);
  }

  /*
   * The viewer's own repost is gone on the server the moment it is undone — from this card or from
   * the original's. A card left on screen would fail every action (save, comments) with "Content not
   * found", so it steps aside here.
   */
  const ownRepostOfId = isRepost && isOwnPost ? (original?.id ?? null) : null;
  useEffect(() => {
    if (!ownRepostOfId) return undefined;
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<RepostChangeDetail>).detail;
      if (detail && !detail.reposted && detail.originalId === ownRepostOfId) {
        setCommentsOpen(false);
        setGone('unreposted');
      }
    };
    window.addEventListener(REPOST_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(REPOST_CHANGE_EVENT, onChange);
  }, [ownRepostOfId]);

  useEffect(() => {
    if (!commentsEnabled) return;
    /* Supplied by the feed — a request per card would only confirm what we already have. */
    if (post.commentCount !== undefined) return;
    let cancelled = false;
    void listComments('POST', post.id, 0, 1)
      .then((page) => {
        if (!cancelled) setCommentCount(page.totalElements);
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, [post.id, post.commentCount, commentsEnabled]);

  const profileHref = creator.id ? `/providers/${creator.id}` : '/marketplace';
  const specialtyLine =
    creator.specialite?.trim() || creator.specialties?.map((s) => s.trim()).find(Boolean) || null;
  const moodLine = [
    post.moodLabel?.trim() ? `Feeling ${post.moodLabel.trim()}${post.moodEmoji ? ` ${post.moodEmoji}` : ''}` : null,
    post.taggedUsers?.length ? `with ${post.taggedUsers.map((u) => u.fullName).join(', ')}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const note = post.title?.trim() || '';
  const hasMedia = postHasMedia(post);
  const hasTextBlock = Boolean(
    post.title?.trim() || (post.tags?.length ?? 0) > 0 || post.priceInfo?.trim()
  );
  const mediaSpacing = hasTextBlock ? 'mt-3' : 'mt-4';
  const shareUrl = `/marketplace/content/${encodeURIComponent(content.id)}`;
  const shareTitle = (content.title?.trim() || note || undefined) as string | undefined;

  const openViewer = (index: number) => {
    setLightboxVideoTime(0);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const openViewerAtVideo = (time: number) => {
    setLightboxVideoTime(time);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  const requireSignIn = useCallback(
    (what: string) => {
      if (isAuthenticated) return true;
      pushFlashFeedback({
        variant: 'info',
        title: `Sign in to ${what}`,
        actionHref: NEWS_LOGIN_REDIRECT,
        actionLabel: 'Sign in',
      });
      return false;
    },
    [isAuthenticated]
  );

  const copyLink = useCallback(async () => {
    const href = new URL(shareUrl, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(href);
      pushFlashFeedback({ variant: 'success', title: 'Link copied' });
    } catch {
      pushFlashFeedback({ variant: 'error', title: 'Unable to copy the link' });
    }
  }, [shareUrl]);

  const hidePost = useCallback(async () => {
    if (!requireSignIn('hide posts')) return;
    setGone('hidden');
    try {
      await hideContentPost(post.id);
    } catch (e) {
      setGone(null);
      pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, 'Unable to hide this post') });
    }
  }, [post.id, requireSignIn]);

  const undoHide = useCallback(async () => {
    setGone(null);
    try {
      await unhideContentPost(post.id);
    } catch (e) {
      setGone('hidden');
      pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, 'Unable to restore this post') });
    }
  }, [post.id]);

  const toggleComments = useCallback(async () => {
    const next = !commentsEnabled;
    setCommentsEnabledOverride(next);
    if (!next) setCommentsOpen(false);
    try {
      await updateContentCommentsEnabled(post.id, next);
      pushFlashFeedback({ variant: 'success', title: next ? 'Comments turned on' : 'Comments turned off' });
    } catch (e) {
      setCommentsEnabledOverride(!next);
      pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, 'Unable to update comments') });
    }
  }, [commentsEnabled, post.id]);

  const makePrivate = useCallback(async () => {
    try {
      await updateContentVisibility(post.id, false);
      setGone('private');
    } catch (e) {
      pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, 'Unable to make this post private') });
    }
  }, [post.id]);

  const trashPost = useCallback(async () => {
    try {
      await moveContentToTrash(post.id);
      setGone('removed');
    } catch (e) {
      pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, 'Unable to delete this post') });
    }
  }, [post.id]);

  const undoOwnRepost = useCallback(async () => {
    try {
      await undoRepostContent(content.id);
      setGone('unreposted');
    } catch (e) {
      pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, 'Unable to remove your repost') });
    }
  }, [content.id]);

  const menuItems = useMemo<ContentPostActionItem[]>(() => {
    const copy: ContentPostActionItem = {
      id: 'copy',
      label: 'Copy link',
      icon: PostMenuIcons.link,
      onSelect: () => void copyLink(),
    };
    if (isOwnPost) {
      if (isRepost) {
        return [
          copy,
          {
            id: 'unrepost',
            label: 'Undo repost',
            description: 'Removes it from your profile and the feed.',
            icon: PostMenuIcons.repost,
            tone: 'danger',
            separated: true,
            onSelect: () => void undoOwnRepost(),
          },
        ];
      }
      return [
        copy,
        {
          id: 'comments',
          label: commentsEnabled ? 'Turn off comments' : 'Turn on comments',
          icon: PostMenuIcons.comments,
          onSelect: () => void toggleComments(),
        },
        {
          id: 'private',
          label: 'Make private',
          description: 'Only you will see it, from your studio.',
          icon: PostMenuIcons.lock,
          onSelect: () => void makePrivate(),
        },
        {
          id: 'trash',
          label: 'Move to trash',
          icon: PostMenuIcons.trash,
          tone: 'danger',
          separated: true,
          onSelect: () => void trashPost(),
        },
      ];
    }
    return [
      copy,
      {
        id: 'hide',
        label: 'Not interested',
        description: 'See fewer posts like this.',
        icon: PostMenuIcons.hide,
        onSelect: () => void hidePost(),
      },
      {
        id: 'report',
        label: 'Report post',
        description: 'Spam, abuse, copyright…',
        icon: PostMenuIcons.flag,
        tone: 'danger',
        separated: true,
        onSelect: () => {
          if (requireSignIn('report posts')) setReportOpen(true);
        },
      },
    ];
  }, [
    commentsEnabled,
    copyLink,
    hidePost,
    isOwnPost,
    isRepost,
    makePrivate,
    requireSignIn,
    toggleComments,
    trashPost,
    undoOwnRepost,
  ]);

  if (gone) {
    const message =
      gone === 'hidden'
        ? 'Post hidden. We’ll show fewer like it.'
        : gone === 'private'
          ? 'Post is now private. Find it in your studio.'
          : gone === 'unreposted'
            ? 'Repost removed.'
            : 'Post moved to the trash.';
    return (
      <div
        className={`flex items-center justify-between gap-4 bg-[#FFFFFF] px-4 py-4 text-[14px] text-neutral-600 dark:bg-[#111111] dark:text-neutral-300 sm:rounded-2xl sm:px-5 ${className}`}
        role="status"
      >
        <span>{message}</span>
        {gone === 'hidden' ? (
          <span className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => void undoHide()}
              className="rounded-full px-3 py-1.5 font-semibold text-[#111111] transition-colors hover:bg-black/[0.05] dark:text-white dark:hover:bg-white/[0.08]"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => {
                if (requireSignIn('report posts')) setReportOpen(true);
              }}
              className="rounded-full px-3 py-1.5 font-medium text-neutral-500 transition-colors hover:bg-black/[0.05] hover:text-[#111111] dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
            >
              Report
            </button>
          </span>
        ) : null}
        <ContentPostReportDialog open={reportOpen} postId={post.id} onClose={() => setReportOpen(false)} />
      </div>
    );
  }

  return (
    <article
      className={`overflow-hidden bg-[#FFFFFF] dark:bg-[#111111] sm:rounded-2xl ${className}`}
    >
      <header className="flex items-center gap-3.5 px-4 pt-4 sm:px-5 sm:pt-5">
        <Link
          href={profileHref}
          className={`inline-flex shrink-0 ${creatorPostAvatarRingClass(normalizeCreatorAppRole(creator.appRole))}`}
          aria-label={creatorName}
        >
          <AvatarImage
            src={creator.avatarUrl}
            className="h-11 w-11 rounded-full object-cover"
            fallback={
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                {creatorName.slice(0, 1).toUpperCase()}
              </span>
            }
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={profileHref}
            className="block truncate text-[15px] font-semibold leading-tight text-[#111111] hover:underline dark:text-white"
          >
            {creatorName}
          </Link>
          <p className="mt-1 flex items-center truncate text-[13px] leading-tight text-neutral-500 dark:text-neutral-400">
            {isRepost ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m17 2 4 4-4 4" />
                  <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                  <path d="m7 22-4-4 4-4" />
                  <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                </svg>
                Reposted
              </span>
            ) : (
              <span className="truncate">{moodLine || specialtyLine || 'Creator'}</span>
            )}
            <span aria-hidden className="mx-1.5 text-neutral-300 dark:text-neutral-600">·</span>
            <time dateTime={post.createdAt} title={new Date(post.createdAt).toLocaleString()} className="shrink-0">
              {formatPostTime(post.createdAt)}
            </time>
          </p>
        </div>
        {canHire ? (
          <Link
            href={profileHref}
            className="gn-inset inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-[13px] font-semibold text-[#111111] transition-colors hover:text-[#FF5722] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 dark:text-white dark:hover:text-[#FF5722]"
          >
            Hire
          </Link>
        ) : null}
        <ContentPostActionsMenu items={menuItems} className="-mr-2 shrink-0" />
      </header>

      <div className="flex flex-col px-4 pb-4 sm:px-5">
        <div className="min-w-0 flex-1">
          {isRepost ? (
            <>
              {note ? (
                <div className="pt-4">
                  <ContentPostClampedTitle title={note} lines={6} />
                </div>
              ) : null}
              {original ? (
                <EmbeddedOriginal
                  original={original}
                  onOpen={openViewer}
                  onExpandVideo={openViewerAtVideo}
                  showTools={false}
                />
              ) : (
                <UnavailableOriginal />
              )}
            </>
          ) : (
            <>
              <PostTextBlock post={post} titleLines={hasMedia ? 2 : 10} showTools={false} />
              {hasMedia ? (
                <PostMedia
                  post={post}
                  bleed
                  spacing={mediaSpacing}
                  priority={priority}
                  onOpen={openViewer}
                  onExpandVideo={openViewerAtVideo}
                />
              ) : null}
            </>
          )}
        </div>

        <aside className="mt-4 flex shrink-0" aria-label="Post actions">
          <ContentPostSocialBar
            variant="rail"
            postId={post.id}
            initialLikes={post.likes}
            initialCommentCount={post.commentCount}
            initialViewerReaction={post.viewerReaction}
            createdAt={post.createdAt}
            commentsOpen={commentsOpen && commentsEnabled}
            onCommentsToggle={(open) => {
              if (commentsEnabled) setCommentsOpen(open);
            }}
            commentCount={commentCount}
            commentsDisabled={!commentsEnabled}
            shareUrl={shareUrl}
            shareTitle={shareTitle}
            saveable
            initialViewerSaved={post.viewerSaved}
            repostTarget={!contentIsOwn && (original ?? post).isPublic !== false ? (original ?? post) : undefined}
            initialRepostCount={post.repostCount}
            initialViewerReposted={post.viewerReposted}
            onReposted={onReposted}
          />
        </aside>
      </div>

      <PostCommentsSurface
        open={commentsOpen && commentsEnabled}
        onClose={closeComments}
        inlineClassName="gn-comments"
      >
        {(mode) => (
          <CommentThread
            variant="panel"
            targetType="POST"
            targetId={post.id}
            isAuthenticated={isAuthenticated}
            loginRedirect={NEWS_LOGIN_REDIRECT}
            commentsEnabled={commentsEnabled}
            moderationMode={isOwnPost}
            onClose={closeComments}
            onCountChange={setCommentCount}
            className={mode === 'sheet' ? COMMENTS_SHEET_CLASS : COMMENTS_INLINE_CLASS}
          />
        )}
      </PostCommentsSurface>

      <ContentPostLightbox
        post={content}
        open={lightboxOpen}
        initialVideoTime={lightboxVideoTime}
        initialIndex={lightboxIndex}
        onClose={() => {
          setLightboxOpen(false);
          setLightboxVideoTime(0);
        }}
        moderationMode={contentIsOwn}
        loginRedirect={NEWS_LOGIN_REDIRECT}
        specialite={content.creator.specialite}
        specialties={content.creator.specialties}
        appRole={content.creator.appRole}
      />

      <ContentPostReportDialog open={reportOpen} postId={post.id} onClose={() => setReportOpen(false)} />
    </article>
  );
}
