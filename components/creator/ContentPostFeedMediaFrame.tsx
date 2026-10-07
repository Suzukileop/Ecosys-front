'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { contentMediaKind } from '@/components/creator/creator-content-media';
import { mediaImageResponsive, mediaImageSrc } from '@/lib/media-image-url';
import { ContentPostAudioPlayer, ContentPostVideoPlayer } from '@/components/creator/ContentPostMediaPlayer';
import { SocialAudioPlayer, SocialVideoPlayer } from '@/components/creator/ContentPostSocialPlayers';
import type { ContentMediaType } from '@/types/creator-content';

/** Feed frames top out around the post card width; the optimizer picks the closest rung. */
const FRAME_WIDTHS = [384, 640, 828, 1080, 1200] as const;
const FRAME_SIZES = '(min-width: 1024px) 800px, 100vw';
/** The backdrop copy is blurred and scaled 110% — a thumbnail is indistinguishable from the original. */
const BACKDROP_WIDTH = 64;

/** Facebook-style feed frame: fixed width, clamped aspect, letterboxed content. */
const MIN_FRAME_HEIGHT = 200;
const MAX_FRAME_HEIGHT = 480;
const MIN_ASPECT = 9 / 16;
const MAX_ASPECT = 1.91;
const DEFAULT_FRAME_HEIGHT = 360;

function clampAspect(width: number, height: number) {
  if (width <= 0 || height <= 0) return 1;
  const ratio = width / height;
  return Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, ratio));
}

/**
 * Facebook desktop feed bounds: portrait media stops at 1:1, landscape at 1.91:1; beyond that the
 * media is letterboxed.
 */
const SOCIAL_MIN_ASPECT_IMAGE = 1;
const SOCIAL_MIN_ASPECT_VIDEO = 1;
const SOCIAL_MAX_ASPECT = 1.91;

function frameHeightForWidth(
  containerWidth: number,
  mediaWidth: number,
  mediaHeight: number,
  social = false,
  video = false
) {
  if (social) {
    const ratio = mediaWidth > 0 && mediaHeight > 0 ? mediaWidth / mediaHeight : 1;
    const minAspect = video ? SOCIAL_MIN_ASPECT_VIDEO : SOCIAL_MIN_ASPECT_IMAGE;
    const aspect = Math.min(SOCIAL_MAX_ASPECT, Math.max(minAspect, ratio));
    return Math.round(containerWidth / aspect);
  }
  const aspect = clampAspect(mediaWidth, mediaHeight);
  const height = containerWidth / aspect;
  return Math.round(Math.min(MAX_FRAME_HEIGHT, Math.max(MIN_FRAME_HEIGHT, height)));
}

type ContentPostFeedMediaFrameProps = {
  mediaUrl: string;
  mediaType?: ContentMediaType | null;
  fileName?: string | null;
  locale?: 'fr' | 'en';
  /** Fill parent height (Shorts-style slot) instead of capped feed height */
  layout?: 'feed' | 'fill';
  /**
   * `cover` crops images to fill the frame; `backdrop` shows the whole image and fills the
   * leftover space with a blurred copy of it instead of flat bands.
   */
  fit?: 'contain' | 'cover' | 'backdrop' | 'social';
  /** Shown by the social audio player. */
  title?: string | null;
  /** Social video: clicking the picture opens the viewer at the current time. */
  onExpand?: (currentTime: number) => void;
  /**
   * Above the fold: load eagerly at high priority instead of waiting for the lazy observer.
   * Reserved for the first card of a feed — every other one costs more than it saves.
   */
  priority?: boolean;
};

export function ContentPostFeedMediaFrame({
  mediaUrl,
  mediaType,
  fileName,
  locale = 'en',
  layout = 'feed',
  fit = 'contain',
  title,
  onExpand,
  priority = false,
}: ContentPostFeedMediaFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const kind = contentMediaKind(mediaUrl, fileName, mediaType);
  const [frameHeight, setFrameHeight] = useState(DEFAULT_FRAME_HEIGHT);
  const fillParent = layout === 'fill';

  const updateFrame = useCallback((mediaWidth: number, mediaHeight: number) => {
    const width = containerRef.current?.clientWidth ?? 0;
    if (width <= 0) return;
    setFrameHeight(frameHeightForWidth(width, mediaWidth, mediaHeight, fit === 'social', kind === 'video'));
  }, [fit, kind]);

  /*
   * Only audio and PDF need a height up front. Image and video frames learn theirs from the
   * element the user actually sees (`onLoad` / `onLoadedMetadata`); probing the media here would
   * fetch it a second time — a second metadata range request for video, and for images a
   * different srcSet candidate, which is a separate request entirely.
   */
  useEffect(() => {
    if (fillParent) return;
    if (kind === 'audio') {
      setFrameHeight(fit === 'social' ? 176 : 128);
    } else if (kind === 'pdf') {
      setFrameHeight(240);
    }
  }, [kind, fillParent, fit]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || fillParent || kind === 'audio' || kind === 'pdf') return;

    const observer = new ResizeObserver(() => {
      if (kind === 'video') {
        const video = node.querySelector('video');
        if (video && video.videoWidth > 0) {
          updateFrame(video.videoWidth, video.videoHeight);
        }
        return;
      }
      const img = node.querySelector('img');
      if (img && img.naturalWidth > 0) {
        updateFrame(img.naturalWidth, img.naturalHeight);
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [kind, mediaUrl, updateFrame, fillParent]);

  const mediaClass =
    fit === 'cover'
      ? 'h-full w-full object-cover'
      : fit === 'social'
        ? 'h-full w-full object-contain'
        : 'max-h-full max-w-full object-contain';
  const responsiveImage = mediaImageResponsive(mediaUrl, FRAME_WIDTHS);

  return (
    <div
      ref={containerRef}
      className={`relative flex w-full items-center justify-center overflow-hidden ${
        fit === 'social'
          ? kind === 'video'
            ? 'bg-black'
            : 'bg-white dark:bg-[#111111]'
          : 'bg-neutral-100 dark:bg-neutral-950'
      } ${
        fillParent ? 'h-full min-h-0' : ''
      }`}
      style={fillParent ? undefined : { height: frameHeight }}
    >
      {kind === 'video' ? (
        fit === 'social' ? (
          <SocialVideoPlayer
            src={mediaUrl}
            className="absolute inset-0"
            onLoadedMetadata={updateFrame}
            onExpand={onExpand}
          />
        ) : (
          <ContentPostVideoPlayer src={mediaUrl} className="absolute inset-0" onLoadedMetadata={updateFrame} />
        )
      ) : kind === 'audio' ? (
        fit === 'social' ? (
          <SocialAudioPlayer src={mediaUrl} title={title} />
        ) : (
          <ContentPostAudioPlayer src={mediaUrl} locale={locale} />
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          {kind === 'pdf' ? (
            <div className="flex flex-col items-center gap-3 px-6 text-center">
              <span className="text-4xl" aria-hidden>
                📄
              </span>
              <p className="text-sm font-semibold text-neutral-800 dark:text-white/90">
                {fileName ?? (locale === 'fr' ? 'Document PDF' : 'PDF document')}
              </p>
              <a
                href={mediaUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
              >
                {locale === 'fr' ? 'Ouvrir le PDF' : 'Open PDF'}
              </a>
            </div>
          ) : (
            <>
            {fit === 'backdrop' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaImageSrc(mediaUrl, BACKDROP_WIDTH)}
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl saturate-150 dark:opacity-50"
              />
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={responsiveImage.src}
              srcSet={responsiveImage.srcSet}
              sizes={FRAME_SIZES}
              alt=""
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              className={`${mediaClass} ${fit === 'backdrop' ? 'relative drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)]' : ''}`}
              onLoad={(e) => {
                const img = e.currentTarget;
                updateFrame(img.naturalWidth, img.naturalHeight);
              }}
            />
            </>
          )}
        </div>
      )}
    </div>
  );
}
