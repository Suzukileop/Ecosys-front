'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { contentMediaKind } from '@/components/creator/creator-content-media';
import { ContentPostAudioPlayer, ContentPostVideoPlayer } from '@/components/creator/ContentPostMediaPlayer';
import type { ContentMediaType } from '@/types/creator-content';

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

function frameHeightForWidth(containerWidth: number, mediaWidth: number, mediaHeight: number) {
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
};

export function ContentPostFeedMediaFrame({
  mediaUrl,
  mediaType,
  fileName,
  locale = 'en',
  layout = 'feed',
}: ContentPostFeedMediaFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const kind = contentMediaKind(mediaUrl, fileName, mediaType);
  const [frameHeight, setFrameHeight] = useState(DEFAULT_FRAME_HEIGHT);
  const fillParent = layout === 'fill';

  const updateFrame = useCallback((mediaWidth: number, mediaHeight: number) => {
    const width = containerRef.current?.clientWidth ?? 0;
    if (width <= 0) return;
    setFrameHeight(frameHeightForWidth(width, mediaWidth, mediaHeight));
  }, []);

  useEffect(() => {
    if (fillParent) return;
    if (kind === 'audio') {
      setFrameHeight(128);
      return;
    }
    if (kind === 'pdf') {
      setFrameHeight(240);
      return;
    }

    let cancelled = false;

    if (kind === 'video') {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        if (cancelled) return;
        updateFrame(video.videoWidth, video.videoHeight);
      };
      video.src = mediaUrl;
    } else {
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        updateFrame(img.naturalWidth, img.naturalHeight);
      };
      img.src = mediaUrl;
    }

    return () => {
      cancelled = true;
    };
  }, [kind, mediaUrl, updateFrame, fillParent]);

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

  const mediaClass = 'max-h-full max-w-full object-contain';

  return (
    <div
      ref={containerRef}
      className={`relative flex w-full items-center justify-center overflow-hidden bg-neutral-100 dark:bg-neutral-950 ${
        fillParent ? 'h-full min-h-0' : ''
      }`}
      style={fillParent ? undefined : { height: frameHeight }}
    >
      {kind === 'video' ? (
        <ContentPostVideoPlayer
          src={mediaUrl}
          className="absolute inset-0"
          onLoadedMetadata={updateFrame}
        />
      ) : kind === 'audio' ? (
        <ContentPostAudioPlayer src={mediaUrl} locale={locale} />
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl}
              alt=""
              className={mediaClass}
              onLoad={(e) => {
                const img = e.currentTarget;
                updateFrame(img.naturalWidth, img.naturalHeight);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
