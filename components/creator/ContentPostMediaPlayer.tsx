'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

type ContentPostVideoPlayerProps = {
  src: string;
  className?: string;
  onLoadedMetadata?: (width: number, height: number) => void;
};

export function ContentPostVideoPlayer({ src, className = '', onLoadedMetadata }: ContentPostVideoPlayerProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);

  useEffect(() => {
    return () => {
      if (touchHideTimerRef.current) clearTimeout(touchHideTimerRef.current);
    };
  }, []);

  const showControlsBrieflyOnTouch = useCallback(() => {
    setHovered(true);
    if (touchHideTimerRef.current) clearTimeout(touchHideTimerRef.current);
    touchHideTimerRef.current = setTimeout(() => setHovered(false), 2800);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }, []);

  const setVolumeLevel = useCallback((next: number) => {
    const video = videoRef.current;
    if (!video) return;
    const level = Math.max(0, Math.min(1, next));
    video.volume = level;
    video.muted = level === 0;
    setVolume(level);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void shell.requestFullscreen();
  }, []);

  const seekToRatio = useCallback((ratio: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.max(0, Math.min(video.duration, ratio * video.duration));
    setCurrent(video.currentTime);
  }, []);

  const progress = duration > 0 ? (current / duration) * 100 : 0;
  const chromeVisible = hovered || seeking;

  return (
    <div
      ref={shellRef}
      className={`group/player relative flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-950 ${className}`}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onTouchStart={showControlsBrieflyOnTouch}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-player-control]')) return;
        togglePlay();
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="metadata"
        className="max-h-full max-w-full object-contain"
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          setDuration(v.duration);
          setVolume(v.muted ? 0 : v.volume);
          onLoadedMetadata?.(v.videoWidth, v.videoHeight);
        }}
        onTimeUpdate={(e) => {
          if (!seeking) setCurrent(e.currentTarget.currentTime);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/70 to-transparent px-3 pb-8 pt-2 transition-opacity duration-300 ${
          chromeVisible ? 'opacity-100' : 'pointer-events-none opacity-0 invisible'
        }`}
      >
        <div
          className={`flex items-center gap-1 text-white ${chromeVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <button
            type="button"
            data-player-control
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div
            data-player-control
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              className="h-5 w-5 shrink-0 text-white/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden
            >
              {volume === 0 ? (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 3v18a1 1 0 01-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-4-4m4 4l4-4M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 3v18a1 1 0 01-1.707.707L5.586 15z" />
              )}
            </svg>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              aria-label="Volume"
              className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/25 accent-orange-400 sm:w-20 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-400"
              onChange={(e) => setVolumeLevel(Number(e.target.value) / 100)}
            />
          </div>

          <span className="ml-1 text-[11px] tabular-nums text-white/75">
            {formatTime(current)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          <button
            type="button"
            data-player-control
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
            aria-label="Fullscreen"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300 ${
          chromeVisible ? 'opacity-100' : 'pointer-events-none opacity-0 invisible'
        }`}
      >
        <div
          data-player-control
          className={`px-0 ${chromeVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(progress * 10)}
            aria-label="Seek"
            className="h-1 w-full cursor-pointer appearance-none bg-white/20 accent-orange-500 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-none [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-400"
            onMouseDown={() => setSeeking(true)}
            onMouseUp={() => setSeeking(false)}
            onTouchEnd={() => setSeeking(false)}
            onChange={(e) => seekToRatio(Number(e.target.value) / 1000)}
          />
        </div>
      </div>
    </div>
  );
}

type ContentPostAudioPlayerProps = {
  src: string;
  locale?: 'fr' | 'en';
};

export function ContentPostAudioPlayer({ src, locale = 'en' }: ContentPostAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const setVolumeLevel = (next: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const level = Math.max(0, Math.min(1, next));
    audio.volume = level;
    audio.muted = level === 0;
    setVolume(level);
  };

  const seekToRatio = (ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, ratio * audio.duration));
    setCurrent(audio.currentTime);
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="flex h-full w-full flex-col justify-end">
      <div className="flex w-full flex-col gap-3 px-4 pb-3 pt-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition hover:bg-orange-600"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
              </svg>
            ) : (
              <svg className="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              aria-label="Volume"
              className="h-1 w-14 shrink-0 cursor-pointer appearance-none rounded-full bg-white/20 accent-orange-400 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-400"
              onChange={(e) => setVolumeLevel(Number(e.target.value) / 100)}
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white/85">
                {locale === 'fr' ? 'Piste audio' : 'Audio track'}
              </p>
              <p className="text-[11px] tabular-nums text-white/55">
                {formatTime(current)} / {formatTime(duration)}
              </p>
            </div>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(progress * 10)}
          aria-label="Seek audio"
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-orange-500 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-400"
          onMouseDown={() => setSeeking(true)}
          onMouseUp={() => setSeeking(false)}
          onChange={(e) => seekToRatio(Number(e.target.value) / 1000)}
        />
      </div>

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="sr-only"
        onLoadedMetadata={(e) => {
          const a = e.currentTarget;
          setDuration(a.duration);
          setVolume(a.muted ? 0 : a.volume);
        }}
        onTimeUpdate={(e) => {
          if (!seeking) setCurrent(e.currentTarget.currentTime);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}
