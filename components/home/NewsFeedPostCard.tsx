'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
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
  COMMENTS_INLINE_PREVIEW,
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
import { SaveToCollectionDialog } from '@/components/home/SaveToCollectionDialog';
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
import { useT } from '@/lib/i18n/I18nProvider';

const NEWS_LOGIN_REDIRECT = '/login?redirect=/feed';

const PHONE_QUERY = '(max-width: 639px)';

function subscribePhone(onChange: () => void) {
  const media = window.matchMedia(PHONE_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

/** Phones read a shorter fold: long text-only posts open on 5 body lines instead of 9. */
function useIsPhone() {
  return useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE_QUERY).matches, () => false);
}

/** Why a card is no longer showing its post. */
type Gone = 'hidden' | 'removed' | 'private' | 'unreposted' | null;

/** Read-only News feed card — same anatomy as the studio `CreatorContentPostCard`. */
export function NewsFeedPostCard({
  post,
  className = '',
  priority = false,
  onReposted,
  extraMenuItems,
  autoOpenComments = false,
  focusCommentId = null,
}: {
  post: PublicContentFeedItem;
  className?: string;
  /** First card of the feed: its media is the largest thing above the fold. */
  priority?: boolean;
  /** A repost the viewer just created from this card — the feed shows it at the top. */
  onReposted?: (repost: PublicContentFeedItem) => void;
  /** Surface-specific menu entries, listed after "Add to collection" (e.g. a collection's "Remove"). */
  extraMenuItems?: ContentPostActionItem[];
  /** Opens with the comments unfolded (a notification deep link). */
  autoOpenComments?: boolean;
  /** Comment to scroll to and highlight once the thread has loaded. */
  focusCommentId?: string | null;
}) {
  const t = useT();
  const { user, isAuthenticated, hasRole } = useAuth();
  const isPhone = useIsPhone();
  const { appRole, ready: appRoleReady } = useCreatorAppRole();
  const [commentsOpen, setCommentsOpen] = useState(autoOpenComments);
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
  const [collectionsOpen, setCollectionsOpen] = useState(false);
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
    setCollectionsOpen(false);
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
    post.moodLabel?.trim() ? `${t('Feeling {mood}', { mood: t(post.moodLabel.trim()) })}${post.moodEmoji ? ` ${post.moodEmoji}` : ''}` : null,
    post.taggedUsers?.length ? t('with {names}', { names: post.taggedUsers.map((u) => u.fullName).join(', ') }) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const note = post.title?.trim() || '';
  const hasMedia = postHasMedia(post);
  const mediaSpacing = 'mt-3';
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
        title: t('Sign in to {what}', { what }),
        actionHref: NEWS_LOGIN_REDIRECT,
        actionLabel: t('Sign in'),
      });
      return false;
    },
    [isAuthenticated, t]
  );

  const copyLink = useCallback(async () => {
    const href = new URL(shareUrl, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(href);
      pushFlashFeedback({ variant: 'success', title: t('Link copied') });
    } catch {
      pushFlashFeedback({ variant: 'error', title: t('Unable to copy the link') });
    }
  }, [shareUrl, t]);

  const hidePost = useCallback(async () => {
    if (!requireSignIn('hide posts')) return;
    setGone('hidden');
    try {
      await hideContentPost(post.id);
    } catch (e) {
      setGone(null);
      pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, t('Unable to hide this post')) });
    }
  }, [post.id, requireSignIn, t]);

  const undoHide = useCallback(async () => {
    setGone(null);
    try {
      await unhideContentPost(post.id);
    } catch (e) {
      setGone('hidden');
      pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, t('Unable to restore this post')) });
    }
  }, [post.id, t]);

  const toggleComments = useCallback(async () => {
    const next = !commentsEnabled;
    setCommentsEnabledOverride(next);
    if (!next) setCommentsOpen(false);
    try {
      await updateContentCommentsEnabled(post.id, next);
      pushFlashFeedback({ variant: 'success', title: next ? t('Comments turned on') : t('Comments turned off') });
    } catch (e) {
      setCommentsEnabledOverride(!next);
      pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, t('Unable to update comments')) });
    }
  }, [commentsEnabled, post.id, t]);

  const makePrivate = useCallback(async () => {
    try {
      await updateContentVisibility(post.id, false);
      setGone('private');
    } catch (e) {
      pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, t('Unable to make this post private')) });
    }
  }, [post.id, t]);

  const trashPost = useCallback(async () => {
    try {
      await moveContentToTrash(post.id);
      setGone('removed');
    } catch (e) {
      pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, t('Unable to delete this post')) });
    }
  }, [post.id, t]);

  const undoOwnRepost = useCallback(async () => {
    try {
      await undoRepostContent(content.id);
      setGone('unreposted');
    } catch (e) {
      pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, t('Unable to remove your repost')) });
    }
  }, [content.id, t]);

  const menuItems = useMemo<ContentPostActionItem[]>(() => {
    const copy: ContentPostActionItem = {
      id: 'copy',
      label: t('Copy link'),
      icon: PostMenuIcons.link,
      onSelect: () => void copyLink(),
    };
    const lead: ContentPostActionItem[] = [
      copy,
      {
        id: 'collection',
        label: t('Add to collection'),
        description: t('Saves it and files it in a collection.'),
        icon: PostMenuIcons.collection,
        onSelect: () => {
          if (requireSignIn('save posts')) setCollectionsOpen(true);
        },
      },
      ...(extraMenuItems ?? []),
    ];
    if (isOwnPost) {
      if (isRepost) {
        return [
          ...lead,
          {
            id: 'unrepost',
            label: t('Undo repost'),
            description: t('Removes it from your profile and the feed.'),
            icon: PostMenuIcons.repost,
            tone: 'danger',
            separated: true,
            onSelect: () => void undoOwnRepost(),
          },
        ];
      }
      return [
        ...lead,
        {
          id: 'comments',
          label: commentsEnabled ? t('Turn off comments') : t('Turn on comments'),
          icon: PostMenuIcons.comments,
          onSelect: () => void toggleComments(),
        },
        {
          id: 'private',
          label: t('Make private'),
          description: t('Only you will see it, from your studio.'),
          icon: PostMenuIcons.lock,
          onSelect: () => void makePrivate(),
        },
        {
          id: 'trash',
          label: t('Move to trash'),
          icon: PostMenuIcons.trash,
          tone: 'danger',
          separated: true,
          onSelect: () => void trashPost(),
        },
      ];
    }
    return [
      ...lead,
      {
        id: 'hide',
        label: t('Not interested'),
        description: t('See fewer posts like this.'),
        icon: PostMenuIcons.hide,
        onSelect: () => void hidePost(),
      },
      {
        id: 'report',
        label: t('Report post'),
        description: t('Spam, abuse, copyright…'),
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
    extraMenuItems,
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
        ? t('Post hidden. We’ll show fewer like it.')
        : gone === 'private'
          ? t('Post is now private. Find it in your studio.')
          : gone === 'unreposted'
            ? t('Repost removed.')
            : t('Post moved to the trash.');
    return (
      <div
        className={`gn-card flex min-h-14 items-center justify-between gap-4 px-4 py-2 text-[14px] leading-5 text-[color:var(--gn-ink2)] ${className}`}
        role="status"
      >
        <span>{message}</span>
        {gone === 'hidden' ? (
          <span className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => void undoHide()}
              className="h-9 rounded-full px-3.5 font-semibold text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover)]"
            >
              {t('Undo')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (requireSignIn('report posts')) setReportOpen(true);
              }}
              className="h-9 rounded-full px-3.5 font-medium text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)]"
            >
              {t('Report')}
            </button>
          </span>
        ) : null}
        <ContentPostReportDialog open={reportOpen} postId={post.id} onClose={() => setReportOpen(false)} />
      </div>
    );
  }

  return (
    <article
      className={`gn-post overflow-hidden bg-[#FFFFFF] dark:bg-[#111111] sm:rounded-xl ${className}`}
    >
      {/* Header — 40px avatar; name 15/20 semibold over meta 13/18, together exactly the avatar's
          height so the row is optically centred. Hire + menu sit on the same centre line. */}
      <header className="flex items-center gap-3 px-4 pt-4">
        <Link
          href={profileHref}
          className={`inline-flex shrink-0 ${creatorPostAvatarRingClass(normalizeCreatorAppRole(creator.appRole))}`}
          aria-label={creatorName}
        >
          <AvatarImage
            src={creator.avatarUrl}
            className="h-10 w-10 rounded-full object-cover"
            displayWidth={40}
            fallback={
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-[14px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                {creatorName.slice(0, 1).toUpperCase()}
              </span>
            }
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={profileHref}
            className="block truncate text-[15px] font-semibold leading-5 text-[color:var(--gn-ink)] hover:underline"
          >
            {creatorName}
          </Link>
          <p className="mt-0.5 flex items-center truncate text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
            {isRepost ? (
              <span className="inline-flex shrink-0 items-center gap-1 font-medium text-[color:var(--gn-ink)]">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m17 2 4 4-4 4" />
                  <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                  <path d="m7 22-4-4 4-4" />
                  <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                </svg>
                {t('Reposted')}
              </span>
            ) : (
              <span className="truncate">{moodLine || (specialtyLine ? t(specialtyLine) : t('Creator'))}</span>
            )}
            <span aria-hidden className="mx-1.5 text-[color:var(--gn-ink3)]">·</span>
            <time dateTime={post.createdAt} title={new Date(post.createdAt).toLocaleString()} className="shrink-0">
              {formatPostTime(post.createdAt)}
            </time>
          </p>
        </div>
        {canHire ? (
          <Link
            href={profileHref}
            className="inline-flex h-8 shrink-0 items-center rounded-full bg-[color:var(--gn-inset)] px-3.5 text-[13px] font-semibold leading-4 text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-accent-fill)] hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
          >
            {t('Hire')}
          </Link>
        ) : null}
        <ContentPostActionsMenu items={menuItems} className="-mr-2 shrink-0" />
      </header>

      <div className="flex flex-col px-4">
        <div className="min-w-0 flex-1">
          {isRepost ? (
            <>
              {note ? (
                <div className="pt-3">
                  <ContentPostClampedTitle title={note} lines={6} editorial />
                </div>
              ) : null}
              {original ? (
                <EmbeddedOriginal
                  original={original}
                  onOpen={openViewer}
                  onExpandVideo={openViewerAtVideo}
                />
              ) : (
                <UnavailableOriginal />
              )}
            </>
          ) : (
            <>
              <PostTextBlock
                post={post}
                titleLines={hasMedia ? 2 : isPhone ? 6 : 10}
                hidePrice={hasMedia}
                headline={hasMedia}
                editorial
              />
              {hasMedia ? (
                <PostMedia
                  post={post}
                  priceLabel={post.priceInfo ?? ''}
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

      </div>

      {/* Action bar — equal-width cells, aligned to the card (8px inset so each 40px hit area's
          hover disc lines up with the 16px text gutter). */}
      <footer className="px-2 pb-1.5 pt-1.5">
          <ContentPostSocialBar
            variant="feed"
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
            onAddToCollection={() => setCollectionsOpen(true)}
          />
      </footer>

      <PostCommentsSurface
        open={commentsOpen && commentsEnabled}
        onClose={closeComments}
        inlineClassName="gn-comments"
      >
        {(mode) => (
          <CommentThread
            key={focusCommentId ?? 'thread'}
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
            previewCount={mode === 'inline' ? COMMENTS_INLINE_PREVIEW : undefined}
            focusCommentId={focusCommentId}
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
      {collectionsOpen ? (
        <SaveToCollectionDialog open postId={post.id} onClose={() => setCollectionsOpen(false)} />
      ) : null}
    </article>
  );
}
