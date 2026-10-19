'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePauseOffscreenVideo } from '@/lib/use-pause-offscreen-video';
import { useT } from '@/lib/i18n/I18nProvider';

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
  /** `cover` fills the frame (cropping), `contain` letterboxes. */
  fit?: 'contain' | 'cover';
};

export function ContentPostVideoPlayer({
  src,
  className = '',
  onLoadedMetadata,
  fit = 'contain',
}: ContentPostVideoPlayerProps) {
  const t = useT();
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  usePauseOffscreenVideo(videoRef);
  const touchHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
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
    if (video.paused) void video.play().catch(() => undefined);
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
  // Paused = controls stay up, so the play button is never hidden behind a hover.
  const chromeVisible = hovered || seeking || !playing;

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
        className={fit === 'cover' ? 'h-full w-full object-cover' : 'max-h-full max-w-full object-contain'}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          setDuration(v.duration);
          setVolume(v.muted ? 0 : v.volume);
          onLoadedMetadata?.(v.videoWidth, v.videoHeight);
        }}
        onTimeUpdate={(e) => {
          if (!seeking) setCurrent(e.currentTarget.currentTime);
        }}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      {/* Large centred button while paused — the obvious way to start the video. */}
      {!playing ? (
        <button
          type="button"
          data-player-control
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          aria-label={t('Play')}
          className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0F1419] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xs transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <svg className="ml-0.5 h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M8 5.14v13.72a1 1 0 001.52.85l10.6-6.86a1 1 0 000-1.7L9.52 4.29A1 1 0 008 5.14z" />
          </svg>
        </button>
      ) : null}

      {/* Hairline progress while the controls are hidden. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[2px] bg-white/15 transition-opacity duration-300 ${
          chromeVisible || !started ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="h-full bg-white/90" style={{ width: `${progress}%` }} />
      </div>

      {/* Controls sit at the bottom: seek bar, then play / pause, time, volume, fullscreen. They stay
          visible while the video is paused so play is never hidden. */}
      <div
        data-player-control
        onClick={(e) => e.stopPropagation()}
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pb-2.5 pt-10 text-white transition-opacity duration-300 ${
          chromeVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(progress * 10)}
          aria-label={t('Seek')}
          className="block h-1 w-full cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          style={{
            background: `linear-gradient(to right, #FF5722 ${progress}%, rgba(255,255,255,0.25) ${progress}%)`,
          }}
          onPointerDown={() => setSeeking(true)}
          onPointerUp={() => setSeeking(false)}
          onPointerCancel={() => setSeeking(false)}
          onChange={(e) => seekToRatio(Number(e.target.value) / 1000)}
        />

        <div className="mt-2 flex items-center gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#0F1419] transition-transform hover:scale-105 active:scale-95"
            aria-label={playing ? t('Pause') : t('Play')}
          >
            {playing ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <rect x="6" y="5" width="4" height="14" rx="1.2" />
                <rect x="14" y="5" width="4" height="14" rx="1.2" />
              </svg>
            ) : (
              <svg className="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M8 5.14v13.72a1 1 0 001.52.85l10.6-6.86a1 1 0 000-1.7L9.52 4.29A1 1 0 008 5.14z" />
              </svg>
            )}
          </button>

          <span className="shrink-0 text-[12.5px] tabular-nums text-white/85">
            {formatTime(current)} <span className="text-white/55">/ {formatTime(duration)}</span>
          </span>

          <div className="flex-1" />

          <div className="flex shrink-0 items-center gap-1.5">
            <svg
              className="h-5 w-5 shrink-0 text-white/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M11 5L6 9H3v6h3l5 4V5z" />
              {volume === 0 ? <path d="M16 9.5l5 5m0-5l-5 5" /> : <path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />}
            </svg>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              aria-label={t('Volume')}
              className="hidden h-1 w-16 cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white sm:block sm:w-20"
              style={{
                background: `linear-gradient(to right, #ffffff ${Math.round(volume * 100)}%, rgba(255,255,255,0.25) ${Math.round(volume * 100)}%)`,
              }}
              onChange={(e) => setVolumeLevel(Number(e.target.value) / 100)}
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white"
            aria-label={t('Fullscreen')}
          >
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4M20 15v4a1 1 0 01-1 1h-4" />
            </svg>
          </button>
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
  const t = useT();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => undefined);
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
            aria-label={playing ? t('Pause') : t('Play')}
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
              aria-label={t('Volume')}
              className="h-1 w-14 shrink-0 cursor-pointer appearance-none rounded-full bg-white/20 accent-orange-400 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-400"
              onChange={(e) => setVolumeLevel(Number(e.target.value) / 100)}
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white/85">
                {locale === 'fr' ? t('Piste audio') : t('Audio track')}
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
          aria-label={t('Seek audio')}
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
