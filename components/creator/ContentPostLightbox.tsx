'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { ContentPostFeedMediaFrame } from '@/components/creator/ContentPostFeedMediaFrame';
import { contentMediaKind, isCollageImage } from '@/components/creator/creator-content-media';
import { ContentPostStudioHeader } from '@/components/creator/ContentPostStudioHeader';
import { ContentPostSocialBar } from '@/components/creator/ContentPostSocialBar';
import { SocialVideoPlayer } from '@/components/creator/ContentPostSocialPlayers';
import { CommentThread } from '@/components/marketplace/CommentThread';
import { useAuth } from '@/context/AuthContext';
import { mediaImageResponsive, mediaImageSrc } from '@/lib/media-image-url';
import type { ContentPostBucket } from '@/types/creator-content';
import type { PublicContentFeedItem } from '@/types/marketplace';

export type ContentPostLightboxPost = PublicContentFeedItem;

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

const stageButtonClass =
  'flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30';

function ZoomableImage({
  src,
  onBackdropClick,
  onTap,
}: {
  src: string;
  onBackdropClick: () => void;
  /** When set (phones), a tap anywhere on the stage calls this instead of zooming or closing. */
  onTap?: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number; moved: boolean } | null>(null);

  const applyZoom = useCallback((next: number) => {
    const value = clampZoom(next);
    setZoom(value);
    if (value === 1) setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [src]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') applyZoom(zoom + ZOOM_STEP);
      else if (e.key === '-') applyZoom(zoom - ZOOM_STEP);
      else if (e.key === '0') applyZoom(1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [zoom, applyZoom]);

  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    applyZoom(zoom + (e.deltaY < 0 ? ZOOM_STEP / 2 : -ZOOM_STEP / 2));
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLImageElement>) => {
    if (zoom <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y, moved: false };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLImageElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
    setOffset({ x: drag.ox + dx / zoom, y: drag.oy + dy / zoom });
  };

  const endDrag = () => {
    setDragging(false);
    window.setTimeout(() => {
      dragRef.current = null;
    }, 0);
  };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mediaImageSrc(src, 64)}
        alt=""
        aria-hidden
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-50 blur-3xl saturate-150"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/55" />

      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden p-0 sm:p-10"
        onWheel={onWheel}
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          if (onTap) onTap();
          else onBackdropClick();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          /* 2048 covers the 2x zoom step; the original can be tens of megabytes. */
          src={mediaImageSrc(src, 2048)}
          alt=""
          draggable={false}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={() => {
            if (dragRef.current?.moved) return;
            if (onTap && zoom <= 1) onTap();
            else applyZoom(zoom > 1 ? 1 : 2);
          }}
          style={{
            transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
            transition: dragging ? 'none' : `transform 420ms ${EASE}`,
          }}
          className={`relative max-h-full max-w-full select-none object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ${
            zoom > 1 ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-pointer'
          }`}
        />
      </div>

      <div
        className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 sm:flex items-center gap-0.5 rounded-full bg-black/50 p-1 ring-1 ring-white/10 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => applyZoom(zoom - ZOOM_STEP)}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className={stageButtonClass}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
            <path strokeLinecap="round" d="M5 12h14" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => applyZoom(1)}
          aria-label="Reset zoom"
          title="Reset zoom"
          className="h-9 min-w-[3.75rem] rounded-full px-2 text-[13px] font-medium tabular-nums text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={() => applyZoom(zoom + ZOOM_STEP)}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className={stageButtonClass}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <span aria-hidden className="mx-1 h-5 w-px bg-white/15" />
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open original"
          title="Open original"
          className={stageButtonClass}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
          </svg>
        </a>
      </div>
    </>
  );
}

function LightboxStageMedia({
  mediaUrl,
  mediaType,
  title,
  initialVideoTime,
  onBackdropClick,
  onTap,
}: {
  mediaUrl: string;
  mediaType?: 'FILE' | 'GIF' | null;
  title?: string | null;
  initialVideoTime?: number;
  onBackdropClick: () => void;
  onTap?: () => void;
}) {
  const kind = contentMediaKind(mediaUrl, null, mediaType);

  if (kind === 'video') {
    return (
      <div className="absolute inset-0 bg-black">
        <SocialVideoPlayer src={mediaUrl} className="absolute inset-0" initialTime={initialVideoTime} autoPlay />
      </div>
    );
  }

  if (kind === 'audio' || kind === 'pdf') {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center p-6 sm:p-12"
        onClick={(e) => {
          if (e.target === e.currentTarget) onBackdropClick();
        }}
      >
        <div className="w-full max-w-xl overflow-hidden rounded-xl bg-white dark:bg-[#111111]">
          <ContentPostFeedMediaFrame mediaUrl={mediaUrl} mediaType={mediaType} fit="social" title={title} />
        </div>
      </div>
    );
  }

  return <ZoomableImage src={mediaUrl} onBackdropClick={onBackdropClick} onTap={onTap} />;
}

const TEXT_HEADING_MAX = 140;

/**
 * Text posts often carry their whole body in `title`. Only the first line reads as a heading;
 * everything after it joins the description as body copy.
 */
function splitTextPost(rawTitle: string | null | undefined, rawDescription: string | null | undefined) {
  const title = rawTitle?.trim() || '';
  const description = rawDescription?.trim() || '';
  const [firstLine = '', ...restLines] = title.split(/\r?\n/);
  let heading = firstLine.trim();
  let overflow = restLines.join('\n').trim();
  if (heading.length > TEXT_HEADING_MAX) {
    const sentenceEnd = heading.slice(0, TEXT_HEADING_MAX).search(/[.!?:](\s|$)(?!.*[.!?:](\s|$))/);
    const cut = sentenceEnd > 40 ? sentenceEnd + 1 : heading.lastIndexOf(' ', TEXT_HEADING_MAX);
    if (cut > 0) {
      overflow = `${heading.slice(cut).trim()}${overflow ? `\n${overflow}` : ''}`;
      heading = heading.slice(0, cut).trim();
    }
  }
  const body = [overflow, description].filter(Boolean).join('\n\n');
  return { heading: heading || 'Untitled', body };
}

/** Text-only posts: the stage becomes a reading sheet instead of an empty media frame. */
function LightboxTextArticle({
  post,
  onBackdropClick,
}: {
  post: ContentPostLightboxPost;
  onBackdropClick: () => void;
}) {
  const { heading: title, body: description } = splitTextPost(post.title, post.description);
  const tags = (post.tags ?? []).map((tag) => tag.trim().replace(/^#/, '')).filter(Boolean);
  const date = post.createdAt ? new Date(post.createdAt) : null;
  const dateLabel =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : null;
  const words = `${title} ${description}`.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));

  return (
    <div
      className="absolute inset-0 overflow-y-auto overscroll-contain px-4 py-16 sm:px-10 sm:py-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) onBackdropClick();
      }}
    >
      <article className="mx-auto w-full max-w-2xl rounded-lg bg-white px-6 py-10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] dark:bg-[#161616] sm:px-12 sm:py-14">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-neutral-600 dark:text-neutral-300">
          {dateLabel ? <span>{dateLabel}</span> : null}
          <span aria-hidden className="text-neutral-300 dark:text-neutral-600">·</span>
          <span>{minutes} min read</span>
        </div>
        <h2 className="mt-4 break-words text-[1.375rem] font-semibold leading-[1.3] tracking-[-0.015em] text-[#111111] dark:text-white sm:text-[1.625rem]">
          {title}
        </h2>
        {description ? (
          <div className="mt-8 whitespace-pre-line break-words border-t border-black/[0.06] pt-8 text-[1rem] leading-[1.8] text-neutral-700 dark:border-white/[0.08] dark:text-neutral-200 sm:text-[1.0625rem]">
            {description}
          </div>
        ) : null}
        {tags.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg border border-black/[0.08] px-3 py-1.5 text-[14px] text-neutral-700 dark:border-white/[0.1] dark:text-neutral-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </article>
    </div>
  );
}

const COMPACT_QUERY = '(max-width: 1023px)';

function subscribeCompact(onChange: () => void) {
  const media = window.matchMedia(COMPACT_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

/** Below `lg` the viewer stacks media over info, and comments move into a sheet. */
function useCompactViewer() {
  return useSyncExternalStore(
    subscribeCompact,
    () => window.matchMedia(COMPACT_QUERY).matches,
    () => false,
  );
}

const COMMENT_THREAD_SKIN =
  '!rounded-none !border-0 !bg-transparent !shadow-none [&>div]:px-4 [&>div]:py-4 [&>footer]:border-black/[0.06] [&>footer]:px-4 [&>footer]:py-3 [&>footer]:pb-[calc(0.75rem+env(safe-area-inset-bottom))] dark:[&>footer]:border-white/[0.08] [&>header]:hidden [&_.text-sm]:!text-[15px] [&_.text-xs]:!text-[13px] [&_input]:!py-2.5 [&_input]:!text-[16px] [&_li_p]:!leading-[1.6] [&_ul]:!space-y-5';

function MobileCommentsSheet({
  open,
  count,
  onClose,
  children,
}: {
  open: boolean;
  count?: number;
  onClose: () => void;
  children: ReactNode;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end lg:hidden">
      <button
        type="button"
        aria-label="Close comments"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        style={{ opacity: shown ? 1 : 0, transition: `opacity 260ms ${EASE}` }}
      />
      <div
        role="dialog"
        aria-label="Comments"
        className="relative flex h-[78dvh] flex-col overflow-hidden rounded-t-[22px] bg-white dark:bg-[#111111]"
        style={{ transform: shown ? 'translateY(0)' : 'translateY(100%)', transition: `transform 380ms ${EASE}` }}
      >
        <div className="flex shrink-0 justify-center pt-2.5">
          <span aria-hidden className="h-1 w-9 rounded-full bg-black/[0.12] dark:bg-white/20" />
        </div>
        <div className="flex shrink-0 items-center justify-between border-b border-black/[0.06] px-4 pb-3 pt-2 dark:border-white/[0.08]">
          <p className="text-[17px] font-semibold tracking-[-0.01em] text-[#111111] dark:text-white">
            Comments
            {count != null ? (
              <span className="ml-2 text-[15px] font-normal tabular-nums text-neutral-500 dark:text-neutral-400">{count}</span>
            ) : null}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments"
            className="-mr-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-black/[0.05] dark:text-neutral-300 dark:hover:bg-white/[0.08]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

type ContentPostLightboxProps = {
  post: ContentPostLightboxPost | null;
  open: boolean;
  onClose: () => void;
  loginRedirect?: string;
  bucket?: ContentPostBucket;
  moderationMode?: boolean;
  headerActions?: ReactNode;
  showSocialBar?: boolean;
  specialite?: string | null;
  /** Specialty list — first item is shown under the creator name. */
  specialties?: string[] | null;
  /** Creator app role for the avatar status ring. */
  appRole?: string | null;
  /** Video resume position when opened from a playing feed video. */
  initialVideoTime?: number;
  /** Multi-image posts: which image of the gallery the viewer opens on. */
  initialIndex?: number;
};

export function ContentPostLightbox({
  post,
  open,
  onClose,
  loginRedirect = '/login',
  bucket = 'active',
  moderationMode = false,
  headerActions,
  showSocialBar = true,
  specialite,
  specialties,
  appRole,
  initialVideoTime,
  initialIndex = 0,
}: ContentPostLightboxProps) {
  const { isAuthenticated } = useAuth();
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [commentCount, setCommentCount] = useState<number | undefined>(undefined);
  const [commentsSheetOpen, setCommentsSheetOpen] = useState(false);
  const commentsSheetOpenRef = useRef(false);
  commentsSheetOpenRef.current = commentsSheetOpen;
  const compact = useCompactViewer();
  const [stageExpanded, setStageExpanded] = useState(false);
  const stageRef = useRef<HTMLElement>(null);
  const [galleryIndex, setGalleryIndex] = useState(initialIndex);
  const stageDragRef = useRef<{ startY: number; base: number } | null>(null);
  const [stageDragHeight, setStageDragHeight] = useState<number | null>(null);

  const onStageHandleDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    stageDragRef.current = { startY: e.clientY, base: stage.offsetHeight };
  };

  const onStageHandleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = stageDragRef.current;
    if (!drag) return;
    const next = Math.min(window.innerHeight - 24, Math.max(160, drag.base + e.clientY - drag.startY));
    setStageDragHeight(next);
  };

  const onStageHandleUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = stageDragRef.current;
    stageDragRef.current = null;
    setStageDragHeight(null);
    if (!drag) return;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dy) < 6) setStageExpanded((value) => !value);
    else if (dy > 60) setStageExpanded(true);
    else if (dy < -60) setStageExpanded(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (open) setCommentCount(undefined);
    setCommentsSheetOpen(false);
    setStageExpanded(false);
  }, [open, post?.id]);

  /* Reopened (or reused for another post): start on the requested image. */
  const [galleryKey, setGalleryKey] = useState(`${open}:${post?.id}:${initialIndex}`);
  const nextGalleryKey = `${open}:${post?.id}:${initialIndex}`;
  if (galleryKey !== nextGalleryKey) {
    setGalleryKey(nextGalleryKey);
    if (open) setGalleryIndex(initialIndex);
  }

  /** Multi-image posts only; a single media (or a video / PDF) never gets arrows. */
  const gallery =
    post?.mediaUrls && post.mediaUrls.length > 1 && post.mediaUrls.every((url) => isCollageImage(url))
      ? post.mediaUrls
      : null;
  const galleryLength = gallery?.length ?? 0;
  const stepGallery = useCallback(
    (delta: number) => {
      if (galleryLength < 2) return;
      setGalleryIndex((current) => (current + delta + galleryLength) % galleryLength);
    },
    [galleryLength]
  );

  useEffect(() => {
    if (!open || galleryLength < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') stepGallery(1);
      else if (e.key === 'ArrowLeft') stepGallery(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, galleryLength, stepGallery]);

  const handleClose = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || document.fullscreenElement) return;
      if (commentsSheetOpenRef.current) setCommentsSheetOpen(false);
      else handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, handleClose]);

  if (!mounted || !open || !post) return null;

  const profileHref = post.creator?.id ? `/providers/${post.creator.id}` : '/marketplace';
  const commentsEnabled = post.commentsEnabled !== false && bucket !== 'trash';
  const title = post.title?.trim() || '';
  const activeMediaUrl = gallery ? gallery[Math.min(galleryIndex, gallery.length - 1)]! : post.mediaUrl;
  const stageKind = activeMediaUrl ? contentMediaKind(activeMediaUrl, null, gallery ? 'FILE' : post.mediaType) : null;
  const mobileStageClass =
    stageKind === 'video'
      ? 'aspect-video w-full'
      : stageKind === 'image' || stageKind === 'gif'
        ? 'h-[46dvh]'
        : post.mediaUrl
          ? 'h-[40dvh]'
          : 'h-[58dvh]';
  const stageExpandable = compact && Boolean(post.mediaUrl);
  const stageFull = stageExpandable && stageExpanded;
  const toggleStage = () => setStageExpanded((value) => !value);

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={post.title?.trim() || 'Post'}
      className="fixed inset-0 z-[300] flex h-dvh flex-col bg-[#0B0B0B] lg:flex-row"
      style={{ opacity: shown ? 1 : 0, transition: `opacity 320ms ${EASE}` }}
    >
      <section
        ref={stageRef}
        className={`relative shrink-0 overflow-hidden bg-black pt-[env(safe-area-inset-top)] ${
          stageFull ? 'min-h-0 w-full flex-1' : mobileStageClass
        } lg:aspect-auto lg:h-auto lg:w-auto lg:min-w-0 lg:flex-1 lg:pt-0`}
        style={{
          transform: shown ? 'scale(1)' : 'scale(0.985)',
          transition:
            stageDragHeight != null
              ? `transform 520ms ${EASE}`
              : `transform 520ms ${EASE}, height 360ms ${EASE}`,
          ...(stageDragHeight != null ? { height: stageDragHeight, aspectRatio: 'auto' } : null),
        }}
      >
        {activeMediaUrl ? (
          <LightboxStageMedia
            mediaUrl={activeMediaUrl}
            mediaType={gallery ? 'FILE' : post.mediaType}
            title={post.title}
            initialVideoTime={initialVideoTime}
            onBackdropClick={handleClose}
            onTap={stageExpandable ? toggleStage : undefined}
          />
        ) : (
          <LightboxTextArticle post={post} onBackdropClick={handleClose} />
        )}

        {gallery ? (
          <>
            <span
              className={`pointer-events-none absolute left-3 z-10 rounded-full bg-black/50 px-3 py-1.5 text-[13px] font-medium tabular-nums text-white ring-1 ring-white/10 backdrop-blur-xl sm:left-5 ${
                moderationMode && post.pinned ? 'top-16 sm:top-16' : 'top-[calc(0.75rem+env(safe-area-inset-top))] sm:top-5'
              }`}
              aria-live="polite"
            >
              {Math.min(galleryIndex, gallery.length - 1) + 1} / {gallery.length}
            </span>
            {(['prev', 'next'] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                onClick={() => stepGallery(direction === 'next' ? 1 : -1)}
                aria-label={direction === 'next' ? 'Next photo' : 'Previous photo'}
                data-pf-no-color-transition
                className={`absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white ring-1 ring-white/10 backdrop-blur-xl transition-colors hover:bg-black/70 sm:h-11 sm:w-11 ${
                  direction === 'next' ? 'right-3 sm:right-5' : 'left-3 sm:left-5'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={direction === 'next' ? 'm9 6 6 6-6 6' : 'm15 6-6 6 6 6'} />
                </svg>
              </button>
            ))}
          </>
        ) : null}

        {moderationMode && post.pinned && (bucket === 'active' || bucket === 'pinned') ? (
          <span className="pointer-events-none absolute left-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-[13px] font-medium text-white ring-1 ring-white/10 backdrop-blur-xl">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 4h6l-1 6 3 3H7l3-3-1-6zM12 13v7" />
            </svg>
            Pinned
          </span>
        ) : null}

        <div className="absolute right-3 top-[calc(0.75rem+env(safe-area-inset-top))] z-10 flex items-center gap-2 sm:right-5 sm:top-5">
          {stageExpandable ? (
            <button
              type="button"
              onClick={toggleStage}
              aria-label={stageFull ? 'Exit full screen' : 'Full screen'}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white ring-1 ring-white/10 backdrop-blur-xl transition-colors hover:bg-black/70 lg:hidden"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {stageFull ? (
                  <path d="M9 4v4a1 1 0 01-1 1H4M15 4v4a1 1 0 001 1h4M9 20v-4a1 1 0 00-1-1H4M15 20v-4a1 1 0 011-1h4" />
                ) : (
                  <path d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4M20 15v4a1 1 0 01-1 1h-4" />
                )}
              </svg>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              const root = rootRef.current;
              if (!root) return;
              if (document.fullscreenElement) void document.exitFullscreen();
              else void root.requestFullscreen();
            }}
            aria-label="Toggle fullscreen"
            title="Fullscreen"
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white/80 ring-1 ring-white/10 backdrop-blur-xl transition-colors hover:bg-black/70 hover:text-white sm:flex"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4M20 15v4a1 1 0 01-1 1h-4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center gap-2.5 rounded-full bg-black/50 text-[14px] font-medium text-white ring-1 ring-white/10 backdrop-blur-xl transition-colors hover:bg-black/70 sm:h-10 sm:w-auto sm:justify-start sm:pl-4 sm:pr-3"
          >
            <svg className="h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            <span className="hidden sm:inline">Close</span>
            <kbd className="hidden rounded-md bg-white/10 px-1.5 py-0.5 font-sans text-[11px] font-medium text-white/60 sm:inline">
              Esc
            </kbd>
          </button>
        </div>
      </section>

      {stageExpandable ? (
        <div
          role="slider"
          aria-label={stageFull ? 'Drag up to show details' : 'Drag down to view full screen'}
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={stageFull ? 1 : 0}
          tabIndex={0}
          onPointerDown={onStageHandleDown}
          onPointerMove={onStageHandleMove}
          onPointerUp={onStageHandleUp}
          onPointerCancel={onStageHandleUp}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleStage();
            }
          }}
          className={`flex h-6 shrink-0 touch-none cursor-grab items-center justify-center outline-none active:cursor-grabbing lg:hidden ${
            stageFull ? 'box-content bg-black pb-[env(safe-area-inset-bottom)]' : 'bg-white dark:bg-[#111111]'
          }`}
        >
          <span
            aria-hidden
            className={`h-1 w-10 rounded-full ${stageFull ? 'bg-white/50' : 'bg-black/[0.15] dark:bg-white/25'}`}
          />
        </div>
      ) : null}

      <aside
        className={`min-h-0 flex-1 flex-col bg-white dark:bg-[#111111] lg:flex lg:w-[420px] lg:flex-none xl:w-[460px] ${
          stageFull ? 'hidden' : 'flex'
        }`}
        style={{
          transform: shown ? 'translateX(0)' : 'translateX(24px)',
          transition: `transform 520ms ${EASE}`,
        }}
      >
        <div className="relative order-2 shrink-0 px-4 pb-1 pt-3 lg:order-none lg:px-7 lg:pb-2 lg:pt-7">
          <ContentPostStudioHeader
            creatorName={post.creator?.fullName ?? 'Creator'}
            avatarUrl={post.creator?.avatarUrl}
            appRole={appRole ?? post.creator?.appRole}
            specialite={specialite}
            specialties={specialties}
            moodLabel={post.moodLabel}
            moodEmoji={post.moodEmoji}
            taggedUsers={post.taggedUsers}
            profileHref={profileHref}
          />
          {headerActions ? (
            <div className="absolute right-3 top-3 flex items-center gap-1.5 lg:right-6 lg:top-7">{headerActions}</div>
          ) : null}
        </div>

        {title && post.mediaUrl ? (
          <h2
            title={title}
            className="order-1 line-clamp-2 shrink-0 break-words px-4 pt-3.5 text-[17px] font-semibold leading-[1.35] tracking-[-0.01em] text-[#111111] dark:text-white lg:order-none lg:line-clamp-3 lg:px-7 lg:pt-6 lg:text-[1.125rem] lg:leading-[1.4]"
          >
            {title}
          </h2>
        ) : null}

        {showSocialBar && bucket !== 'trash' ? (
          <div className="order-3 shrink-0 px-4 pb-3 pt-2 lg:order-none lg:px-7 lg:pb-6 lg:pt-5">
            <ContentPostSocialBar
              postId={post.id}
              initialLikes={post.likes}
              createdAt={post.createdAt}
              commentsOpen={false}
              onCommentsToggle={() => undefined}
              commentCount={commentCount}
              hideCommentsButton
            />
          </div>
        ) : (
          <div className="order-3 h-3 shrink-0 lg:order-none lg:h-6" />
        )}

        {compact ? (
          <div className="order-4 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain border-t border-black/[0.06] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 dark:border-white/[0.08]">
            {post.mediaUrl && post.description?.trim() ? (
              <p className="line-clamp-4 whitespace-pre-line break-words text-[15px] leading-[1.6] text-neutral-700 dark:text-neutral-300">
                {post.description.trim()}
              </p>
            ) : null}
            {commentsEnabled ? (
              <button
                type="button"
                onClick={() => setCommentsSheetOpen(true)}
                className="block w-full rounded-xl border border-[#DADDE1] px-4 py-3 text-left transition-colors active:bg-black/[0.03] dark:border-white/[0.14] dark:active:bg-white/[0.04]"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[15px] font-semibold text-[#111111] dark:text-white">
                    Comments
                    {(commentCount ?? post.commentCount) != null ? (
                      <span className="ml-2 font-normal tabular-nums text-neutral-500 dark:text-neutral-400">
                        {commentCount ?? post.commentCount}
                      </span>
                    ) : null}
                  </span>
                  <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                <span className="mt-2.5 flex h-10 items-center rounded-full border border-black/[0.08] px-4 text-[14px] text-neutral-500 dark:border-white/[0.1] dark:text-neutral-400">
                  Add a comment…
                </span>
              </button>
            ) : (
              <p className="py-6 text-center text-[15px] text-neutral-500 dark:text-neutral-400">
                Comments are turned off for this post.
              </p>
            )}
          </div>
        ) : commentsEnabled ? (
          <CommentThread
            key={post.id}
            variant="panel"
            targetType="POST"
            targetId={post.id}
            isAuthenticated={isAuthenticated}
            loginRedirect={loginRedirect}
            commentsEnabled
            moderationMode={moderationMode}
            onCountChange={setCommentCount}
            className="order-4 !h-auto !min-h-0 flex-1 !rounded-none !border-x-0 !border-b-0 !border-t !border-black/[0.06] !bg-transparent !shadow-none dark:!border-white/[0.08] lg:order-none [&>div]:px-4 [&>div]:py-4 lg:[&>div]:px-7 lg:[&>div]:py-5 [&>footer]:border-black/[0.06] [&>footer]:px-4 [&>footer]:py-3 [&>footer]:pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:[&>footer]:px-7 lg:[&>footer]:py-4 dark:[&>footer]:border-white/[0.08] [&>header]:border-black/[0.06] [&>header]:px-4 [&>header]:py-3 lg:[&>header]:px-7 lg:[&>header]:py-4 dark:[&>header]:border-white/[0.08] [&_.text-sm]:!text-[15.5px] [&_.text-xs]:!text-[13.5px] [&_input]:!py-2.5 [&_li_p]:!leading-[1.6] [&_ul]:!space-y-6 [&_.h-8.w-8]:!h-9 [&_.h-8.w-8]:!w-9"
          />
        ) : (
          <div className="order-4 flex flex-1 items-center justify-center border-t border-black/[0.06] px-4 text-[15px] lg:order-none lg:px-7 text-neutral-500 dark:border-white/[0.08] dark:text-neutral-400">
            Comments are turned off for this post.
          </div>
        )}
      </aside>

      {compact && commentsEnabled ? (
        <MobileCommentsSheet
          open={commentsSheetOpen}
          count={commentCount ?? post.commentCount}
          onClose={() => setCommentsSheetOpen(false)}
        >
          <CommentThread
            key={post.id}
            variant="panel"
            targetType="POST"
            targetId={post.id}
            isAuthenticated={isAuthenticated}
            loginRedirect={loginRedirect}
            commentsEnabled
            moderationMode={moderationMode}
            onCountChange={setCommentCount}
            className={`!h-auto !min-h-0 flex-1 ${COMMENT_THREAD_SKIN}`}
          />
        </MobileCommentsSheet>
      ) : null}
    </div>,
    document.body
  );
}

type ContentPostGalleryThumbProps = {
  post: Pick<
    ContentPostLightboxPost,
    'id' | 'title' | 'description' | 'mediaUrl' | 'mediaType' | 'pinned' | 'genre' | 'createdAt'
  >;
  onOpen: () => void;
};

function formatThumbDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PinnedBadge({ tone }: { tone: 'light' | 'dark' }) {
  return (
    <span
      className={`absolute left-3 top-3 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full ${
        tone === 'dark'
          ? 'bg-black/55 text-white backdrop-blur'
          : 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
      }`}
      aria-label="Pinned"
      title="Pinned"
    >
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
        <path d="M10 2l1.5 4.5H16l-3.7 2.7 1.4 4.3L10 11.8 6.3 13.5l1.4-4.3L4 6.5h4.5L10 2z" />
      </svg>
    </span>
  );
}

export function ContentPostGalleryThumb({ post, onOpen }: ContentPostGalleryThumbProps) {
  const title = post.title?.trim() || 'Untitled';
  const mediaUrl = post.mediaUrl?.trim() || '';
  const kind = mediaUrl ? contentMediaKind(mediaUrl, null, post.mediaType) : null;

  if (!mediaUrl) {
    const { heading, body: description } = splitTextPost(post.title, post.description);
    const dateLabel = formatThumbDate(post.createdAt);
    return (
      <button
        type="button"
        onClick={onOpen}
        className="group relative flex aspect-[3/4] w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-black/[0.06] bg-white p-5 text-left outline-none transition-colors duration-300 hover:border-black/[0.16] focus-visible:ring-2 focus-visible:ring-black/15 dark:border-white/[0.08] dark:bg-[#111111] dark:hover:border-white/[0.2] dark:focus-visible:ring-white/25 sm:p-6"
        aria-label={`Open ${title}`}
      >
        {post.pinned ? (
          <>
            <PinnedBadge tone="light" />
            <span aria-hidden className="mb-3 block h-7" />
          </>
        ) : null}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <p className="break-words text-[1rem] font-semibold leading-snug tracking-[-0.01em] text-[#111111] dark:text-white sm:text-[1.0625rem]">
            {heading}
          </p>
          {description ? (
            <p className="mt-3 whitespace-pre-line break-words text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-300">
              {description}
            </p>
          ) : null}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent dark:from-[#111111]"
          />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/[0.06] pt-3 text-[13px] text-neutral-600 dark:border-white/[0.08] dark:text-neutral-300">
          <span className="truncate">{dateLabel ?? 'Post'}</span>
          <span className="inline-flex shrink-0 items-center gap-1 font-medium text-[#111111] dark:text-white">
            Read
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-lg bg-neutral-100 text-left outline-none focus-visible:ring-2 focus-visible:ring-black/15 dark:bg-neutral-900 dark:focus-visible:ring-white/25"
      aria-label={`Open ${title}`}
    >
      {mediaUrl && kind === 'video' ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          src={mediaUrl}
          muted
          playsInline
          preload="metadata"
          className="pointer-events-none h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          {...mediaImageResponsive(mediaUrl, [256, 384, 640])}
          sizes="(min-width: 1024px) 320px, 45vw"
          alt=""
          loading="lazy"
          decoding="async"
          className="pointer-events-none h-full w-full object-cover transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
      )}
      {post.pinned ? <PinnedBadge tone="dark" /> : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 pt-12">
        <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-white">{title}</p>
      </div>
    </button>
  );
}
