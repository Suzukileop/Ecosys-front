'use client';

import { useState } from 'react';

export function mediaKind(url: string): 'video' | 'image' | 'other' {
  const lower = url.split('?')[0]?.toLowerCase() ?? '';
  if (/\.(mp4|webm|ogg)$/i.test(lower)) return 'video';
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(lower)) return 'image';
  return 'other';
}

function UnknownDemoMedia({ url, className }: { url: string; className?: string }) {
  const [step, setStep] = useState(0);
  if (step === 0) {
    return (
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        className={className ?? 'max-h-[28rem] w-full bg-black'}
        onError={() => setStep(1)}
      >
        <track kind="captions" />
      </video>
    );
  }
  if (step === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt="Validation preview"
        className={className ?? 'max-h-[28rem] w-full object-contain'}
        onError={() => setStep(2)}
      />
    );
  }
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Unable to display the preview here (format, headers, or expired link).
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-semibold text-[#EA580C] underline-offset-2 hover:underline"
      >
        Open in a new tab →
      </a>
    </div>
  );
}

type DemoPreviewProps = {
  demoUrl: string;
  className?: string;
  imageAlt?: string;
};

export function EcosystemDemoPreview({ demoUrl, className, imageAlt = 'Validation preview' }: DemoPreviewProps) {
  const kind = mediaKind(demoUrl);
  const mediaClass = className ?? 'max-h-[28rem] w-full bg-black object-contain';

  if (kind === 'video') {
    return (
      <video src={demoUrl} controls playsInline preload="metadata" className={mediaClass}>
        <track kind="captions" />
      </video>
    );
  }
  if (kind === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={demoUrl} alt={imageAlt} className={mediaClass} />
    );
  }
  return <UnknownDemoMedia url={demoUrl} className={className} />;
}

function MediaPlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

type ValidationPreviewPanelProps = {
  demoUrl: string | null | undefined;
  agentNotes?: string | null;
  uniqueCode?: string;
  waiting?: boolean;
  skipHint?: boolean;
  highlightReady?: boolean;
};

export function ValidationPreviewPanel({
  demoUrl,
  agentNotes,
  uniqueCode,
  waiting = false,
  skipHint = false,
  highlightReady = false,
}: ValidationPreviewPanelProps) {
  const url = demoUrl?.trim() ?? '';
  const hasMedia = url.length > 0;
  const notes = agentNotes?.trim() ?? '';

  return (
    <div className="bg-neutral-50 p-5 dark:bg-neutral-900/40 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Validation sample</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {waiting && !hasMedia
              ? 'Your agent will post a preview here once the model is ready.'
              : 'Content submitted by your agent for validation.'}
            {skipHint && waiting && !hasMedia && (
              <>
                {' '}
                You can <strong className="font-medium text-neutral-600 dark:text-neutral-300">skip model validation</strong> below to go straight to payment.
              </>
            )}
          </p>
        </div>
        {uniqueCode && (
          <span className="shrink-0 rounded-full border border-[#F97316]/20 bg-white px-3 py-1 font-mono text-xs font-semibold text-[#EA580C] dark:border-[#F97316]/30 dark:bg-neutral-950">
            {uniqueCode}
          </span>
        )}
      </div>

      <div
        className={`mt-5 overflow-hidden rounded-2xl border bg-neutral-900 shadow-inner dark:border-neutral-700 ${
          highlightReady && hasMedia
            ? 'border-[#F97316]/40 ring-2 ring-[#F97316]/20 ring-offset-2 ring-offset-neutral-50 dark:ring-offset-neutral-900'
            : 'border-neutral-200'
        }`}
      >
        {hasMedia ? (
          <div className="flex min-h-[12rem] items-center justify-center bg-neutral-950">
            <EcosystemDemoPreview demoUrl={url} className="max-h-[32rem] w-full object-contain" />
          </div>
        ) : (
          <div className="flex min-h-[16rem] flex-col items-center justify-center gap-4 bg-gradient-to-b from-neutral-100 to-neutral-50 px-6 py-12 dark:from-neutral-900 dark:to-neutral-950">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900">
              <MediaPlaceholderIcon className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
            </div>
            <div className="max-w-sm text-center">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {waiting ? 'Preview not available yet' : 'No validation sample yet'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {waiting
                  ? 'Usually delivered within 24–48 hours. This page refreshes automatically.'
                  : 'The agent has not uploaded a sample for this step.'}
              </p>
            </div>
            {waiting && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-500 shadow-sm dark:bg-neutral-900 dark:text-neutral-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#F97316]" aria-hidden />
                In preparation
              </span>
            )}
          </div>
        )}
      </div>

      {notes && (
        <div className="mt-5 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#EA580C]">Agent notes</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {notes}
          </p>
        </div>
      )}
    </div>
  );
}
