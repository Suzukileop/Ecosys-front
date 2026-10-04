'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Pauses a video once it leaves the viewport, and resumes it when it comes back.
 *
 * A feed keeps every card mounted, so a video the reader scrolled past otherwise plays on — audible,
 * burning bandwidth and battery, and competing with whatever is on screen now. Every social feed
 * stops playback instead; this is that behaviour.
 *
 * Only playback this hook paused is resumed. A video the reader paused by hand stays paused when it
 * scrolls back, and one that was never playing is never started: scrolling must not begin playback
 * on its own.
 *
 * Audio is deliberately out of scope — listening while scrolling is the point of an audio post.
 */

/** Below this visible fraction the video is no longer what the reader is looking at. */
const VISIBLE_RATIO = 0.5;

export function usePauseOffscreenVideo(
  ref: RefObject<HTMLVideoElement | null>,
  enabled = true
): void {
  useEffect(() => {
    const video = ref.current;
    if (!enabled || !video || typeof IntersectionObserver === 'undefined') return;

    /*
     * `pause()` flips `video.paused` at once but fires its `pause` event in a later task, so this
     * flag cannot be cleared on the next line — it is cleared by the handler that consumes it.
     * Without that, our own pause arrives looking like the reader's and cancels the resume.
     */
    let ourPausePending = false;
    let autoPaused = false;

    const pause = () => {
      if (video.paused) return;
      ourPausePending = true;
      video.pause();
      autoPaused = true;
    };

    const resume = () => {
      if (!autoPaused) return;
      autoPaused = false;
      ourPausePending = false;
      void video.play().catch(() => undefined);
    };

    const onPause = () => {
      if (ourPausePending) {
        ourPausePending = false;
        return;
      }
      /* The reader pressed pause: their choice outlives the scroll. */
      autoPaused = false;
    };
    /* Reader pressed play again while off screen: that is their call, so leave it running. */
    const onPlay = () => {
      autoPaused = false;
    };

    video.addEventListener('pause', onPause);
    video.addEventListener('play', onPlay);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target !== video) continue;
          if (entry.intersectionRatio >= VISIBLE_RATIO) resume();
          else pause();
        }
      },
      { threshold: [0, VISIBLE_RATIO] }
    );
    observer.observe(video);

    /* Switching tab or minimising hides the video without moving it out of the viewport. */
    const onVisibility = () => {
      if (document.hidden) pause();
      else if (!document.hidden) resume();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('play', onPlay);
    };
  }, [ref, enabled]);
}
