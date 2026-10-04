export type UploadPreview = { url: string; video: boolean };

export function createUploadPreview(file: File): UploadPreview {
  return { url: URL.createObjectURL(file), video: file.type.startsWith('video/') };
}

/**
 * Fills its positioned parent while a file uploads: blurred local preview, light sweep and an indeterminate bar.
 * `compact` drops the label pill for small thumbnails.
 */
export function UploadingOverlay({
  preview,
  compact = false,
  label = 'Uploading…',
}: {
  preview?: UploadPreview | null;
  compact?: boolean;
  label?: string;
}) {
  return (
    <span className="absolute inset-0 overflow-hidden bg-neutral-200 dark:bg-neutral-900" role="status" aria-live="polite">
      {preview ? (
        preview.video ? (
          <video
            src={preview.url}
            muted
            playsInline
            className="absolute inset-0 h-full w-full scale-105 object-cover blur-[3px]"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.url} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover blur-[3px]" />
        )
      ) : null}
      <span className="absolute inset-0 bg-black/35" aria-hidden />
      <span
        className="media-upload-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.14] to-transparent"
        aria-hidden
      />
      {compact ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-black/55 px-3.5 py-1.5 text-[13px] font-medium text-white backdrop-blur-md">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
            {label}
          </span>
        </span>
      )}
      <span className={`absolute inset-x-0 bottom-0 overflow-hidden bg-white/15 ${compact ? 'h-[2px]' : 'h-[3px]'}`} aria-hidden>
        <span className="media-upload-bar block h-full w-2/5 rounded-full bg-white" />
      </span>
    </span>
  );
}
