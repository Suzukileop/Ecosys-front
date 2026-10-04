'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { usePauseOffscreenVideo } from '@/lib/use-pause-offscreen-video';

const SPEEDS = [1, 1.25, 1.5, 2, 0.75] as const;
const TOUCH_HIDE_MS = 2800;
const DOUBLE_CLICK_MS = 220;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatSpeed(speed: number) {
  return `${speed}×`;
}

/** Shared media state for the feed players (play, seek, volume, speed). */
function useMediaControls<T extends HTMLMediaElement>() {
  const mediaRef = useRef<T>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [scrubbing, setScrubbing] = useState(false);

  const togglePlay = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;
    if (media.paused) void media.play().catch(() => undefined);
    else media.pause();
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const media = mediaRef.current;
    if (!media || !Number.isFinite(media.duration)) return;
    media.currentTime = Math.max(0, Math.min(media.duration, seconds));
    setCurrent(media.currentTime);
  }, []);

  const seekToRatio = useCallback(
    (ratio: number) => {
      const media = mediaRef.current;
      if (!media || !Number.isFinite(media.duration)) return;
      seekTo(ratio * media.duration);
    },
    [seekTo]
  );

  const skip = useCallback(
    (delta: number) => {
      const media = mediaRef.current;
      if (!media) return;
      seekTo(media.currentTime + delta);
    },
    [seekTo]
  );

  const setVolumeLevel = useCallback((level: number) => {
    const media = mediaRef.current;
    if (!media) return;
    const next = Math.max(0, Math.min(1, level));
    media.volume = next;
    media.muted = next === 0;
    setVolume(next);
    setMuted(next === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;
    const next = !media.muted;
    media.muted = next;
    if (!next && media.volume === 0) {
      media.volume = 1;
      setVolume(1);
    }
    setMuted(next);
  }, []);

  const cycleSpeed = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;
    const index = SPEEDS.indexOf(media.playbackRate as (typeof SPEEDS)[number]);
    const next = SPEEDS[(index + 1) % SPEEDS.length];
    media.playbackRate = next;
    setSpeed(next);
  }, []);

  const mediaProps = {
    ref: mediaRef,
    preload: 'metadata' as const,
    onLoadedMetadata: (e: { currentTarget: HTMLMediaElement }) => {
      setDuration(e.currentTarget.duration);
      setVolume(e.currentTarget.volume);
      setMuted(e.currentTarget.muted);
    },
    onDurationChange: (e: { currentTarget: HTMLMediaElement }) => setDuration(e.currentTarget.duration),
    onTimeUpdate: (e: { currentTarget: HTMLMediaElement }) => {
      if (!scrubbing) setCurrent(e.currentTarget.currentTime);
    },
    onPlay: () => {
      setPlaying(true);
      setStarted(true);
    },
    onPause: () => setPlaying(false),
    onEnded: () => setPlaying(false),
  };

  return {
    mediaRef,
    mediaProps,
    playing,
    started,
    current,
    duration,
    volume,
    muted,
    speed,
    scrubbing,
    setScrubbing,
    togglePlay,
    seekToRatio,
    skip,
    setVolumeLevel,
    toggleMute,
    cycleSpeed,
  };
}

/** Pointer-driven horizontal track; reports a 0–1 ratio while dragging. */
function useTrackDrag(onRatio: (ratio: number) => void, onDragChange?: (dragging: boolean) => void) {
  const ratioFromEvent = (e: ReactPointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return rect.width > 0 ? Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) : 0;
  };

  return {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      onDragChange?.(true);
      onRatio(ratioFromEvent(e));
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      onRatio(ratioFromEvent(e));
    },
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
      onDragChange?.(false);
    },
    onClick: (e: ReactMouseEvent) => e.stopPropagation(),
  };
}

function PlayGlyph({ playing, className = 'h-4 w-4' }: { playing: boolean; className?: string }) {
  return playing ? (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1.2" />
      <rect x="14" y="5" width="4" height="14" rx="1.2" />
    </svg>
  ) : (
    <svg className={`${className} translate-x-[1px]`} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5.14v13.72a1 1 0 001.52.85l10.6-6.86a1 1 0 000-1.7L9.52 4.29A1 1 0 008 5.14z" />
    </svg>
  );
}

function VolumeGlyph({ muted, className = 'h-[18px] w-[18px]' }: { muted: boolean; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5L6 9H3v6h3l5 4V5z" />
      {muted ? <path d="M16 9.5l5 5m0-5l-5 5" /> : <path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />}
    </svg>
  );
}

function SkipGlyph({ direction }: { direction: 'back' | 'forward' }) {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {direction === 'back' ? (
        <>
          <path d="M3 12a9 9 0 109-9 9.2 9.2 0 00-6.4 2.6L3 8" />
          <path d="M3 3v5h5" />
        </>
      ) : (
        <>
          <path d="M21 12a9 9 0 11-9-9 9.2 9.2 0 016.4 2.6L21 8" />
          <path d="M21 3v5h-5" />
        </>
      )}
    </svg>
  );
}

type SocialVideoPlayerProps = {
  src: string;
  className?: string;
  onLoadedMetadata?: (width: number, height: number) => void;
  /** When set, double-clicking the picture opens a larger viewer instead of native fullscreen. */
  onExpand?: (currentTime: number) => void;
  /** Resume position (seconds) applied once metadata is known. */
  initialTime?: number;
  autoPlay?: boolean;
};

/**
 * Feed video: floating glass control capsule on hover, large centered play button while paused,
 * hairline progress line while playing untouched.
 */
export function SocialVideoPlayer({
  src,
  className = '',
  onLoadedMetadata,
  onExpand,
  initialTime,
  autoPlay = false,
}: SocialVideoPlayerProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hovered, setHovered] = useState(false);
  const controls = useMediaControls<HTMLVideoElement>();
  const { playing, started, current, duration, muted, volume, speed, scrubbing } = controls;
  usePauseOffscreenVideo(controls.mediaRef);

  useEffect(
    () => () => {
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    },
    []
  );

  const revealOnTouch = () => {
    setHovered(true);
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => setHovered(false), TOUCH_HIDE_MS);
  };

  const toggleFullscreen = () => {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void shell.requestFullscreen();
  };

  const seekDrag = useTrackDrag(controls.seekToRatio, controls.setScrubbing);
  const volumeDrag = useTrackDrag(controls.setVolumeLevel);

  const progress = duration > 0 ? (current / duration) * 100 : 0;
  const chromeVisible = hovered || scrubbing;
  const effectiveVolume = muted ? 0 : volume;

  return (
    <div
      ref={shellRef}
      tabIndex={0}
      className={`group/video relative flex h-full w-full cursor-pointer items-center justify-center bg-black outline-none ${className}`}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setHovered(false);
      }}
      onTouchStart={revealOnTouch}
      onClick={(e) => {
        e.stopPropagation();
        if ((e.target as HTMLElement).closest('[data-player-control]')) return;
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        clickTimerRef.current = setTimeout(() => {
          clickTimerRef.current = null;
          controls.togglePlay();
        }, DOUBLE_CLICK_MS);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if ((e.target as HTMLElement).closest('[data-player-control]')) return;
        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
          clickTimerRef.current = null;
        }
        const media = controls.mediaRef.current;
        if (onExpand && media) {
          media.pause();
          onExpand(media.currentTime);
          return;
        }
        toggleFullscreen();
      }}
      onKeyDown={(e) => {
        if (e.key === 'f') {
          e.preventDefault();
          toggleFullscreen();
        } else if (e.key === ' ' || e.key === 'k') {
          e.preventDefault();
          controls.togglePlay();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          controls.skip(5);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          controls.skip(-5);
        } else if (e.key === 'm') {
          controls.toggleMute();
        }
      }}
    >
      <video
        {...controls.mediaProps}
        src={src}
        playsInline
        className="max-h-full max-w-full object-contain"
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          controls.mediaProps.onLoadedMetadata(e);
          onLoadedMetadata?.(video.videoWidth, video.videoHeight);
          if (initialTime && initialTime > 0 && initialTime < video.duration) {
            video.currentTime = initialTime;
          }
          if (autoPlay) void video.play().catch(() => undefined);
        }}
      />

      {!playing ? (
        <span
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#111111] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-transform duration-300 group-hover/video:scale-105 ${
            started ? 'opacity-80' : ''
          }`}
        >
          <PlayGlyph playing={false} className="h-6 w-6" />
        </span>
      ) : null}

      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-white/15 transition-opacity duration-300 ${
          chromeVisible || !started ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="h-full bg-white/90" style={{ width: `${progress}%` }} />
      </div>

      <div
        data-player-control
        onClick={(e) => e.stopPropagation()}
        className={`absolute inset-x-3 bottom-3 flex items-center gap-2.5 rounded-full bg-black/45 py-1.5 pl-1.5 pr-2.5 text-white ring-1 ring-white/10 backdrop-blur-md transition-all duration-300 sm:inset-x-4 sm:bottom-4 ${
          chromeVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={controls.togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#111111] transition-transform hover:scale-105 active:scale-95"
        >
          <PlayGlyph playing={playing} className="h-3.5 w-3.5" />
        </button>

        <span className="shrink-0 text-[12.5px] tabular-nums text-white/85">{formatTime(current)}</span>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(current)}
          {...seekDrag}
          className="group/seek relative flex h-5 min-w-0 flex-1 cursor-pointer touch-none items-center"
        >
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/25 transition-[height] group-hover/seek:h-1.5">
            <div className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: `${progress}%` }} />
          </div>
          <span
            aria-hidden
            className={`absolute h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow transition-transform ${
              scrubbing ? 'scale-100' : 'scale-0 group-hover/seek:scale-100'
            }`}
            style={{ left: `${progress}%` }}
          />
        </div>

        <span className="shrink-0 text-[12.5px] tabular-nums text-white/60">{formatTime(duration)}</span>

        <button
          type="button"
          onClick={controls.cycleSpeed}
          aria-label="Playback speed"
          className="hidden h-7 shrink-0 items-center rounded-full px-2 text-[12.5px] font-semibold tabular-nums text-white/85 transition-colors hover:bg-white/15 hover:text-white sm:flex"
        >
          {formatSpeed(speed)}
        </button>

        <div className="group/vol flex shrink-0 items-center">
          <div
            role="slider"
            tabIndex={0}
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(effectiveVolume * 100)}
            {...volumeDrag}
            className="hidden h-5 w-0 cursor-pointer touch-none items-center overflow-hidden opacity-0 transition-all duration-300 group-hover/vol:mr-1.5 group-hover/vol:w-16 group-hover/vol:opacity-100 sm:flex"
          >
            <div className="relative h-1 w-full rounded-full bg-white/25">
              <div className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: `${effectiveVolume * 100}%` }} />
            </div>
          </div>
          <button
            type="button"
            onClick={controls.toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white"
          >
            <VolumeGlyph muted={effectiveVolume === 0} />
          </button>
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Fullscreen"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white"
        >
          <svg className="h-[17px] w-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4M20 15v4a1 1 0 01-1 1h-4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const WAVE_BARS = 56;

function waveformFor(seed: string) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const bars: number[] = [];
  for (let i = 0; i < WAVE_BARS; i++) {
    hash ^= hash << 13;
    hash ^= hash >>> 17;
    hash ^= hash << 5;
    const noise = ((hash >>> 0) % 1000) / 1000;
    const envelope = 0.55 + 0.45 * Math.sin((i / WAVE_BARS) * Math.PI);
    bars.push(Math.max(0.14, Math.min(1, envelope * (0.35 + noise * 0.65))));
  }
  return bars;
}

type SocialAudioPlayerProps = {
  src: string;
  title?: string | null;
};

/**
 * Feed audio: waveform scrubber with a round play button; skip, speed and volume controls fade in
 * on hover (always shown on touch screens).
 */
export function SocialAudioPlayer({ src, title }: SocialAudioPlayerProps) {
  const controls = useMediaControls<HTMLAudioElement>();
  const { playing, current, duration, muted, volume, speed, scrubbing } = controls;
  const bars = useMemo(() => waveformFor(src), [src]);
  const seekDrag = useTrackDrag(controls.seekToRatio, controls.setScrubbing);
  const volumeDrag = useTrackDrag(controls.setVolumeLevel);
  const ratio = duration > 0 ? current / duration : 0;
  const effectiveVolume = muted ? 0 : volume;
  const hoverReveal = `transition-opacity duration-300 ${
    playing || scrubbing ? 'opacity-100' : 'opacity-0 group-hover/audio:opacity-100 group-focus-within/audio:opacity-100'
  } [@media(hover:none)]:opacity-100`;

  return (
    <div
      className="group/audio flex h-full w-full items-center gap-5 bg-neutral-50 px-6 dark:bg-white/[0.03] sm:gap-6 sm:px-7"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={controls.togglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-[#111111]"
      >
        <PlayGlyph playing={playing} className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-[15px] font-semibold text-[#111111] dark:text-white">{title?.trim() || 'Audio'}</p>
          <p className="shrink-0 text-[13px] tabular-nums text-neutral-500 dark:text-neutral-400">
            {formatTime(current)} / {formatTime(duration)}
          </p>
        </div>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Seek audio"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(current)}
          {...seekDrag}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') controls.skip(5);
            else if (e.key === 'ArrowLeft') controls.skip(-5);
            else if (e.key === ' ') {
              e.preventDefault();
              controls.togglePlay();
            }
          }}
          className="mt-3 flex h-10 cursor-pointer touch-none items-center gap-[3px] outline-none"
        >
          {bars.map((height, i) => {
            const played = (i + 0.5) / bars.length <= ratio;
            return (
              <span
                key={i}
                aria-hidden
                className={`min-w-[2px] flex-1 rounded-full transition-colors duration-150 ${
                  played ? 'bg-[#111111] dark:bg-white' : 'bg-black/[0.12] dark:bg-white/[0.16]'
                }`}
                style={{ height: `${height * 100}%` }}
              />
            );
          })}
        </div>

        <div className={`mt-2.5 flex items-center gap-1 text-neutral-500 dark:text-neutral-400 ${hoverReveal}`}>
          <button
            type="button"
            onClick={() => controls.skip(-10)}
            aria-label="Back 10 seconds"
            className="flex h-8 items-center gap-1 rounded-full px-2 text-[12.5px] font-medium transition-colors hover:bg-black/[0.05] hover:text-[#111111] dark:hover:bg-white/[0.08] dark:hover:text-white"
          >
            <SkipGlyph direction="back" />
            10
          </button>
          <button
            type="button"
            onClick={() => controls.skip(10)}
            aria-label="Forward 10 seconds"
            className="flex h-8 items-center gap-1 rounded-full px-2 text-[12.5px] font-medium transition-colors hover:bg-black/[0.05] hover:text-[#111111] dark:hover:bg-white/[0.08] dark:hover:text-white"
          >
            10
            <SkipGlyph direction="forward" />
          </button>
          <button
            type="button"
            onClick={controls.cycleSpeed}
            aria-label="Playback speed"
            className="flex h-8 items-center rounded-full px-2.5 text-[12.5px] font-semibold tabular-nums transition-colors hover:bg-black/[0.05] hover:text-[#111111] dark:hover:bg-white/[0.08] dark:hover:text-white"
          >
            {formatSpeed(speed)}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={controls.toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/[0.05] hover:text-[#111111] dark:hover:bg-white/[0.08] dark:hover:text-white"
            >
              <VolumeGlyph muted={effectiveVolume === 0} />
            </button>
            <div
              role="slider"
              tabIndex={0}
              aria-label="Volume"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(effectiveVolume * 100)}
              {...volumeDrag}
              className="hidden h-5 w-20 cursor-pointer touch-none items-center sm:flex"
            >
              <div className="relative h-1 w-full rounded-full bg-black/[0.12] dark:bg-white/[0.16]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[#111111] dark:bg-white"
                  style={{ width: `${effectiveVolume * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <audio {...controls.mediaProps} src={src} className="hidden" />
    </div>
  );
}
