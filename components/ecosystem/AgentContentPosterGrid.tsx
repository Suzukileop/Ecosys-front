'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ScheduledPostDto } from '@/types/scheduler';
import { mediaKind } from '@/components/ecosystem/EcosystemDemoMedia';
import { ECOSYSTEM_PLATFORMS, PlatformLogoIcon } from '@/components/ecosystem/PlatformLogoIcon';
import type { EcosystemPlatform } from '@/types/ecosystem';
import { downloadStorageMedia, resolveStorageMediaUrl, suggestMediaFilename } from '@/lib/storage-media-url';
import { getAgentContentDisplayTitle, getAgentContentSubtitle } from '@/lib/agent-content-label';
import { notificationContentTargetId } from '@/lib/notification-highlight';
import { useNotificationContentHighlight } from '@/hooks/useNotificationContentHighlight';

const MS_DAY = 86_400_000;
const MS_HOUR = 3_600_000;

function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';

  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return 'Upcoming';

  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;

  const hours = Math.floor(diffMs / MS_HOUR);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(diffMs / MS_DAY);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;

  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

type TimeGroup = 'recent' | 'week' | 'older';

function getTimeGroup(iso: string | null | undefined): TimeGroup {
  if (!iso) return 'older';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'older';
  const diffMs = Date.now() - d.getTime();
  if (diffMs <= MS_DAY) return 'recent';
  if (diffMs <= 7 * MS_DAY) return 'week';
  return 'older';
}

const GROUP_LABELS: Record<TimeGroup, string> = {
  recent: 'Last 24 hours',
  week: 'Last 7 days',
  older: 'Older',
};

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
    </svg>
  );
}

function PosterOverlayButton({
  onClick,
  ariaLabel,
  title,
  className = '',
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  ariaLabel: string;
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`z-10 rounded-md bg-black/55 p-1 text-white/90 transition hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]/50 sm:opacity-80 sm:group-hover/poster:opacity-100 ${className}`}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
    >
      {children}
    </button>
  );
}

function useMediaDownload(url: string, title: string) {
  const [downloading, setDownloading] = useState(false);

  const download = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      if (!url || downloading) return;
      setDownloading(true);
      try {
        const kind = mediaKind(url);
        const ext = kind === 'video' ? '.mp4' : kind === 'image' ? '.png' : '.bin';
        const filename = suggestMediaFilename(url, title, ext);
        await downloadStorageMedia(url, filename);
      } finally {
        setDownloading(false);
      }
    },
    [url, title, downloading]
  );

  return { download, downloading };
}

type LightboxPayload = {
  url: string;
  title: string;
  kind: 'image' | 'video' | 'other';
};

function AgentContentLightbox({
  payload,
  onClose,
  onDownload,
  downloading,
}: {
  payload: LightboxPayload;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (payload.kind !== 'video' || !videoRef.current) return;
    void videoRef.current.play().catch(() => undefined);
  }, [payload.kind, payload.url]);

  const showVideo = payload.kind === 'video' || payload.kind === 'other';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal
      aria-label={`Preview: ${payload.title}`}
      onMouseDown={onClose}
    >
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <button
          type="button"
          disabled={downloading}
          className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 disabled:opacity-50"
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
          aria-label="Download"
          title="Download"
        >
          <DownloadIcon className={`h-5 w-5 ${downloading ? 'animate-pulse' : ''}`} />
        </button>
        <button
          type="button"
          className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          onClick={onClose}
          aria-label="Fermer"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <figure
        className="relative max-h-[90vh] w-full max-w-4xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {showVideo ? (
          <video
            ref={videoRef}
            src={payload.url}
            controls
            playsInline
            className="max-h-[82vh] w-full rounded-lg bg-black object-contain shadow-2xl ring-1 ring-white/10"
          >
            <track kind="captions" />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={payload.url}
            alt={payload.title}
            className="mx-auto max-h-[82vh] w-auto max-w-full rounded-lg object-contain shadow-2xl ring-1 ring-white/10"
          />
        )}
        <figcaption className="mt-3 truncate text-center text-sm text-white/80">{payload.title}</figcaption>
      </figure>
    </div>
  );
}

function InlineImagePoster({
  url,
  alt,
  onOpen,
  onDownload,
  downloading,
}: {
  url: string;
  alt: string;
  onOpen: () => void;
  onDownload: (e: React.MouseEvent) => void;
  downloading: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-900 px-2 text-center text-xs text-neutral-500">
        Preview unavailable
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <button
        type="button"
        onClick={onOpen}
        className="relative block h-full w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]/50"
        aria-label={`Agrandir : ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
        <span className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover/poster:bg-black/10" />
      </button>

      <PosterOverlayButton
        className="absolute bottom-1.5 right-1.5"
        onClick={onDownload}
        ariaLabel={`Download: ${alt}`}
        title="Download"
      >
        <DownloadIcon className={`h-3.5 w-3.5 ${downloading ? 'animate-pulse' : ''}`} />
      </PosterOverlayButton>
    </div>
  );
}

function InlineVideoPoster({
  url,
  title,
  onExpand,
  onDownload,
  downloading,
}: {
  url: string;
  title: string;
  onExpand: () => void;
  onDownload: (e: React.MouseEvent) => void;
  downloading: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  }, []);

  if (failed) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-900 px-2 text-center text-xs text-neutral-500">
        Vidéo indisponible
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <button
        type="button"
        onClick={togglePlay}
        className="relative block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]/50"
        aria-label={playing ? `Pause : ${title}` : `Lecture : ${title}`}
      >
        <video
          ref={videoRef}
          src={url}
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => setFailed(true)}
        />
        <span
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition ${
            playing ? 'bg-black/10 opacity-0' : 'bg-black/30 opacity-100'
          }`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-lg">
            {playing ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="ml-0.5 h-4 w-4" />}
          </span>
        </span>
      </button>

      <PosterOverlayButton
        className="absolute right-1.5 top-1.5"
        onClick={(e) => {
          e.stopPropagation();
          videoRef.current?.pause();
          setPlaying(false);
          onExpand();
        }}
        ariaLabel={`Agrandir : ${title}`}
        title="Agrandir"
      >
        <ExpandIcon className="h-3.5 w-3.5" />
      </PosterOverlayButton>

      <PosterOverlayButton
        className="absolute bottom-1.5 right-1.5"
        onClick={onDownload}
        ariaLabel={`Download: ${title}`}
        title="Download"
      >
        <DownloadIcon className={`h-3.5 w-3.5 ${downloading ? 'animate-pulse' : ''}`} />
      </PosterOverlayButton>
    </div>
  );
}

function PosterFrame({
  rawUrl,
  title,
  onOpenLightbox,
  onDownload,
  downloading,
}: {
  rawUrl: string;
  title: string;
  onOpenLightbox: (kind: 'image' | 'video' | 'other') => void;
  onDownload: (e: React.MouseEvent) => void;
  downloading: boolean;
}) {
  const resolvedUrl = resolveStorageMediaUrl(rawUrl);
  const kind = mediaKind(resolvedUrl);

  if (!resolvedUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-900 text-xs text-neutral-500">
        Preview unavailable
      </div>
    );
  }

  if (kind === 'video') {
    return (
      <InlineVideoPoster
        url={resolvedUrl}
        title={title}
        onExpand={() => onOpenLightbox('video')}
        onDownload={onDownload}
        downloading={downloading}
      />
    );
  }

  if (kind === 'image') {
    return (
      <InlineImagePoster
        url={resolvedUrl}
        alt={title}
        onOpen={() => onOpenLightbox('image')}
        onDownload={onDownload}
        downloading={downloading}
      />
    );
  }

  return (
    <InlineImagePoster
      url={resolvedUrl}
      alt={title}
      onOpen={() => onOpenLightbox('other')}
      onDownload={onDownload}
      downloading={downloading}
    />
  );
}

export function AgentContentPosterCard({
  post,
  highlighted = false,
}: {
  post: ScheduledPostDto;
  highlighted?: boolean;
}) {
  const rawUrl = post.contentUrl?.trim() || post.externalUrl?.trim() || '';
  const resolvedUrl = resolveStorageMediaUrl(rawUrl);
  const platformId = post.platform as EcosystemPlatform;
  const platformLabel = ECOSYSTEM_PLATFORMS.find((p) => p.id === platformId)?.label ?? post.platform;
  const deliveredAt = post.publishedAt ?? post.createdAt ?? post.scheduledAt;
  const title = getAgentContentDisplayTitle(post, platformLabel);
  const subtitle = getAgentContentSubtitle(post, title);
  const [lightbox, setLightbox] = useState<LightboxPayload | null>(null);
  const { download, downloading } = useMediaDownload(resolvedUrl, title);

  const openLightbox = useCallback(
    (kind: 'image' | 'video' | 'other') => {
      if (!resolvedUrl) return;
      setLightbox({ url: resolvedUrl, title, kind });
    },
    [resolvedUrl, title]
  );

  return (
    <>
      <article
        id={notificationContentTargetId(post.id)}
        className={`group w-[140px] shrink-0 scroll-mt-28 sm:w-[160px] md:w-[172px] ${
          highlighted ? 'notification-highlight-ring rounded-lg p-1' : ''
        }`}
      >
        <div className="group/poster relative aspect-[2/3] overflow-hidden rounded-md bg-neutral-950 shadow-md ring-1 ring-neutral-800 transition duration-200 group-hover:scale-[1.03] group-hover:ring-[#F97316]/40">
          {resolvedUrl ? (
            <PosterFrame
              rawUrl={rawUrl}
              title={title}
              onOpenLightbox={openLightbox}
              onDownload={download}
              downloading={downloading}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-neutral-900 text-xs text-neutral-500">
              Preview unavailable
            </div>
          )}
        </div>

        <div className="mt-2.5 space-y-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">{subtitle}</p>
          )}
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatRelativeTime(deliveredAt)}</p>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <PlatformLogoIcon platform={platformId} className="h-3.5 w-3.5 shrink-0 opacity-80" />
            <span className="truncate">{platformLabel}</span>
            <span className="text-neutral-600 dark:text-neutral-500">·</span>
            <span className="text-green-600 dark:text-green-400">Delivered</span>
          </div>
          {resolvedUrl && (
            <button
              type="button"
              onClick={() => void download()}
              disabled={downloading}
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#EA580C] transition hover:text-[#F97316] disabled:opacity-50 dark:text-[#FB923C]"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              {downloading ? 'Downloading…' : 'Download'}
            </button>
          )}
        </div>
      </article>

      {lightbox && (
        <AgentContentLightbox
          payload={lightbox}
          onClose={() => setLightbox(null)}
          onDownload={() => void download()}
          downloading={downloading}
        />
      )}
    </>
  );
}

export function AgentContentPosterGrid({ posts }: { posts: ScheduledPostDto[] }) {
  const searchParams = useSearchParams();
  const contentIdParam = searchParams.get('contentId');
  const activeContentId = useNotificationContentHighlight(contentIdParam, posts.length > 0);

  const grouped = useMemo(() => {
    const buckets: Record<TimeGroup, ScheduledPostDto[]> = {
      recent: [],
      week: [],
      older: [],
    };
    for (const post of posts) {
      const at = post.publishedAt ?? post.createdAt ?? post.scheduledAt;
      buckets[getTimeGroup(at)].push(post);
    }
    return (['recent', 'week', 'older'] as TimeGroup[]).filter((g) => buckets[g].length > 0).map((g) => ({
      key: g,
      label: GROUP_LABELS[g],
      items: buckets[g],
    }));
  }, [posts]);

  return (
    <div className="space-y-8">
      {grouped.map(({ key, label, items }) => (
        <div key={key}>
          <h3 className="mb-4 text-base font-bold text-neutral-900 dark:text-white">{label}</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 sm:gap-5 md:flex-wrap md:overflow-visible">
            {items.map((post) => (
              <AgentContentPosterCard
                key={post.id}
                post={post}
                highlighted={activeContentId === post.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
