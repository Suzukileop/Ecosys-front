'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

type ProductVideoPlayerProps = {
  src: string;
  className?: string;
};

const SPEEDS = [1, 1.5, 2] as const;
const HIDE_DELAY_MS = 2200;
const SEEK_STEP_S = 5;
const CONTROL_BUTTON =
  'inline-flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

export function ProductVideoPlayer({ src, className = '' }: ProductVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [pointerActive, setPointerActive] = useState(true);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  const wake = () => {
    setPointerActive(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setPointerActive(false), HIDE_DELAY_MS);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
    wake();
  };

  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.min(Math.max(time, 0), video.duration);
    setCurrent(video.currentTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const cycleSpeed = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = (speedIndex + 1) % SPEEDS.length;
    video.playbackRate = SPEEDS[next];
    setSpeedIndex(next);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void container.requestFullscreen?.();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLInputElement) return;
    const video = videoRef.current;
    if (!video) return;
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowRight':
        e.preventDefault();
        seekTo(video.currentTime + SEEK_STEP_S);
        wake();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        seekTo(video.currentTime - SEEK_STEP_S);
        wake();
        break;
      case 'm':
        toggleMute();
        break;
      case 'f':
        toggleFullscreen();
        break;
    }
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;
  const controlsVisible = !playing || pointerActive;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Video player"
      onKeyDown={onKeyDown}
      onMouseMove={wake}
      onMouseLeave={() => setPointerActive(false)}
      className={`group/player relative w-full overflow-hidden rounded-lg bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722] ${
        controlsVisible ? '' : 'cursor-none'
      } ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onProgress={(e) => {
          const ranges = e.currentTarget.buffered;
          if (ranges.length > 0) setBuffered(ranges.end(ranges.length - 1));
        }}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        className={`mx-auto block w-full object-contain ${fullscreen ? 'h-full max-h-none' : 'max-h-[min(72dvh,640px)]'}`}
      />

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play video"
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition hover:bg-black/30 focus:outline-none"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[#111111] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover/player:scale-105 sm:h-20 sm:w-20">
            <svg className="ml-1 h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </span>
        </button>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2.5 pt-10 transition-opacity duration-300 sm:px-4 ${
          controlsVisible && started ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="group/seek relative flex h-4 items-center">
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/20 transition-[height] group-hover/seek:h-1.5">
            <div className="absolute inset-y-0 left-0 bg-white/30" style={{ width: `${bufferedPercent}%` }} />
            <div className="absolute inset-y-0 left-0 bg-[#FF5722]" style={{ width: `${progress}%` }} />
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/seek:opacity-100"
            style={{ left: `${progress}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            aria-label="Seek"
            aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        <div className="mt-1.5 flex items-center gap-1">
          <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} className={CONTROL_BUTTON}>
            {playing ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
              </svg>
            ) : (
              <svg className="ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              const video = videoRef.current;
              if (video) seekTo(video.currentTime - 10);
            }}
            aria-label="Back 10 seconds"
            className={CONTROL_BUTTON}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              const video = videoRef.current;
              if (video) seekTo(video.currentTime + 10);
            }}
            aria-label="Forward 10 seconds"
            className={CONTROL_BUTTON}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />
            </svg>
          </button>
          <span className="ml-1.5 text-[13px] font-medium text-white/90 tabular-nums">
            {formatTime(current)}
            <span className="text-white/50"> / {formatTime(duration)}</span>
          </span>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={cycleSpeed}
              aria-label={`Playback speed ${SPEEDS[speedIndex]}x`}
              className="inline-flex h-9 min-w-[2.75rem] items-center justify-center rounded-full px-2 text-[13px] font-semibold text-white/90 tabular-nums transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]"
            >
              {SPEEDS[speedIndex]}×
            </button>
            <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} className={CONTROL_BUTTON}>
              {muted ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6 9H2v6h4l5 4V5zM22 9l-6 6M16 9l6 6" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
              className={CONTROL_BUTTON}
            >
              {fullscreen ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
