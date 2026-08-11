'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type ChatShortVideoPlayerProps = {
  src: string;
  label: string;
  onDownload: () => void;
  className?: string;
};

function formatVideoTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Desktop: controls on hover only. Shorts-style minimal bottom bar. */
export function ChatShortVideoPlayer({ src, label, onDownload, className = '' }: ChatShortVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const syncTime = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setCurrent(v.currentTime);
    setDuration(v.duration || 0);
    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
    } else {
      v.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
    syncTime();
  }, [syncTime]);

  const toggleFullscreen = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void v.requestFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => syncTime();
    const onLoaded = () => syncTime();

    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('durationchange', onLoaded);

    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('durationchange', onLoaded);
    };
  }, [syncTime, src]);

  const hoverChrome =
    'opacity-100 transition-opacity duration-200 [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover/media:opacity-100';

  return (
    <div className={`group/media relative bg-black ${className}`}>
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="metadata"
        className="block max-h-[min(480px,75vh)] w-full cursor-pointer object-contain"
        aria-label={label}
        onClick={togglePlay}
      />

      {/* Center play when paused */}
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-opacity duration-200 [@media(hover:hover)_and_(pointer:fine)]:group-hover/media:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:opacity-90"
          aria-label="Play video"
        >
          <svg className="ml-1 h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}

      {/* Shorts-style bottom bar */}
      <div
        className={`absolute inset-x-0 bottom-0 ${hoverChrome}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none h-16 bg-gradient-to-t from-black/80 via-black/35 to-transparent" aria-hidden />

        <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-6">
          <div
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            className="mb-2 h-0.5 cursor-pointer rounded-full bg-white/25"
            onClick={seek}
          >
            <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center gap-2 text-white">
            <span className="min-w-[4.5rem] text-[11px] tabular-nums text-white/90">
              {formatVideoTime(current)}
              {duration > 0 ? ` / ${formatVideoTime(duration)}` : ''}
            </span>

            <div className="flex-1" />

            <button
              type="button"
              onClick={toggleMute}
              className="rounded-full p-1 hover:bg-white/15"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" d="M11 5L6 9H3v6h3l5 4V5z" />
                  <path strokeLinecap="round" d="M15.5 8.5l5 5M20.5 8.5l-5 5" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" d="M11 5L6 9H3v6h3l5 4V5z" />
                  <path strokeLinecap="round" d="M15 9a4 4 0 010 6" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={onDownload}
              className="rounded-full p-1 hover:bg-white/15"
              aria-label="Download video"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-full p-1 hover:bg-white/15"
              aria-label="Fullscreen"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
