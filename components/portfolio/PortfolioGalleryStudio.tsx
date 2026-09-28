'use client';

import { memo, useCallback, useState, type DragEvent, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { faArrowsRotate, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { ContentMediaPreview, useContentMediaUpload } from '@/components/creator/creator-content-media';
import { inferProfileMediaType } from '@/components/creator/studio/profile-form-schema';
import { MAX_GALLERY } from '@/components/creator/studio/ProfileGalleryField';
import {
  STUDIO_BARE_INPUT_CLASS,
  STUDIO_FLOAT_IN_STYLE,
  STUDIO_SECONDARY_CLASS,
  StudioIconAction,
  StudioSaveChrome,
  StudioSectionHeader,
  StudioUnderline,
  useInlineStudio,
  type StudioChangeHandler,
} from '@/components/portfolio/PortfolioStudioKit';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type MediaType = 'IMAGE' | 'VIDEO' | null;
type GalleryItem = { id?: string; title: string; mediaUrl: string; mediaType: MediaType };
type GalleryRow = GalleryItem & { key: string };
type GalleryDraft = { items: GalleryRow[] };
type RowChangeHandler = (key: string, patch: Partial<GalleryItem>) => void;

const MEDIA_ACCEPT =
  'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov';
const MAX_CAPTION = 120;

let rowSeq = 0;
const nextRowKey = () => `gallery-${++rowSeq}`;

function mediaFromUrl(url: string): Pick<GalleryItem, 'mediaUrl' | 'mediaType'> {
  const mediaUrl = url.trim();
  return { mediaUrl, mediaType: mediaUrl ? inferProfileMediaType(mediaUrl) : null };
}

function cleanItems(rows: GalleryRow[]): GalleryItem[] {
  return rows
    .filter((row) => row.mediaUrl.trim())
    .map(({ id, title, mediaUrl, mediaType }) => ({ id, title: title.trim(), mediaUrl: mediaUrl.trim(), mediaType }));
}

function gallerySignature(_key: keyof GalleryDraft, value: GalleryDraft[keyof GalleryDraft]): string {
  return JSON.stringify(cleanItems(value).map(({ title, mediaUrl }) => ({ title, mediaUrl })));
}

/** Solid chip that stays legible on top of any image. */
function MediaChip({
  label,
  onClick,
  disabled = false,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-sm backdrop-blur transition-colors duration-200 disabled:pointer-events-none disabled:opacity-30 ${
        danger ? 'hover:bg-red-500 hover:text-white' : 'hover:bg-neutral-900 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function useDropUpload(uploading: boolean, uploadFile: (file: File) => Promise<void>) {
  const [dragging, setDragging] = useState(false);
  const handlers = {
    onDragOver: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      if (!uploading) setDragging(true);
    },
    onDragLeave: (event: DragEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file && !uploading) void uploadFile(file);
    },
  };
  return { dragging, handlers };
}

const GalleryTile = memo(function GalleryTile({
  row,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  row: GalleryRow;
  index: number;
  total: number;
  onChange: RowChangeHandler;
  onMove: (key: string, direction: -1 | 1) => void;
  onRemove: (key: string) => void;
}) {
  const { inputRef, uploading, uploadError, pickFile, onFileChange, uploadFile } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (url) => onChange(row.key, mediaFromUrl(url)),
  });
  const { dragging, handlers } = useDropUpload(uploading, uploadFile);
  const kind = row.mediaType === 'VIDEO' ? 'Video' : 'Image';

  return (
    <li className="group/item min-w-0">
      <input ref={inputRef} type="file" accept={MEDIA_ACCEPT} className="hidden" onChange={onFileChange} />
      <div
        {...handlers}
        className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-black/[0.03] transition-colors dark:bg-white/[0.04] ${
          dragging ? 'border-[#FF5722]' : 'border-black/[0.04] dark:border-white/[0.04]'
        }`}
      >
        <ContentMediaPreview locale="en" mediaUrl={row.mediaUrl} mediaType="FILE" large fluid fit="cover" />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-black/55 via-black/20 via-45% to-transparent opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover/item:opacity-100 sm:group-focus-within/item:opacity-100"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/55 via-black/20 via-45% to-transparent opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover/item:opacity-100 sm:group-focus-within/item:opacity-100"
        />
        <div className="pointer-events-none absolute inset-x-4 bottom-3 flex items-baseline justify-between text-[12px] font-medium tracking-wide text-white/90 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover/item:opacity-100 sm:group-focus-within/item:opacity-100">
          <span className="tabular-nums">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span>{kind}</span>
        </div>

        <div className="absolute inset-x-3 top-3 flex justify-between opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover/item:opacity-100 sm:group-focus-within/item:opacity-100">
          <div className="flex gap-1.5">
            <MediaChip label="Move earlier" disabled={index === 0} onClick={() => onMove(row.key, -1)}>
              <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
            </MediaChip>
            <MediaChip label="Move later" disabled={index >= total - 1} onClick={() => onMove(row.key, 1)}>
              <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
            </MediaChip>
          </div>
          <div className="flex gap-1.5">
            <MediaChip label="Replace media" disabled={uploading} onClick={pickFile}>
              <FontAwesomeIcon icon={faArrowsRotate} className="h-3 w-3" />
            </MediaChip>
            <MediaChip label="Remove media" danger disabled={uploading} onClick={() => onRemove(row.key)}>
              <FontAwesomeIcon icon={faTrashCan} className="h-3.5 w-3.5" />
            </MediaChip>
          </div>
        </div>

        {uploading || dragging ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 text-sm font-medium text-white">
            {uploading ? <LoadingSpinner size="sm" /> : null}
            {uploading ? 'Uploading…' : 'Drop to replace'}
          </div>
        ) : null}
      </div>

      <div className="mt-3">
        <StudioUnderline quiet>
          <input
            type="text"
            value={row.title}
            maxLength={MAX_CAPTION}
            placeholder="Add a caption"
            aria-label={`Caption for item ${index + 1}`}
            autoComplete="off"
            onChange={(event) => onChange(row.key, { title: event.currentTarget.value })}
            className={`${STUDIO_BARE_INPUT_CLASS} text-[15px] font-medium text-black dark:text-neutral-100`}
          />
        </StudioUnderline>
      </div>
      {uploadError ? <p className="mt-1.5 text-[13px] text-red-600 dark:text-red-400">{uploadError}</p> : null}
    </li>
  );
});

function AddTile({
  uploading,
  uploadError,
  pickFile,
  uploadFile,
}: {
  uploading: boolean;
  uploadError: string | null;
  pickFile: () => void;
  uploadFile: (file: File) => Promise<void>;
}) {
  const { dragging, handlers } = useDropUpload(uploading, uploadFile);

  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={pickFile}
        disabled={uploading}
        {...handlers}
        className={`flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 text-center transition-colors duration-200 disabled:cursor-wait ${
          dragging
            ? 'border-[#FF5722] bg-[#FF5722]/[0.06]'
            : 'border-neutral-300 hover:border-neutral-500 hover:bg-black/[0.02] dark:border-white/15 dark:hover:border-white/35 dark:hover:bg-white/[0.02]'
        }`}
      >
        {uploading ? (
          <>
            <LoadingSpinner size="sm" />
            <span className={STUDIO_SECONDARY_CLASS}>Uploading…</span>
          </>
        ) : (
          <>
            <svg
              aria-hidden
              className="h-6 w-6 text-neutral-400 dark:text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
            <span className="text-[15px] text-black dark:text-neutral-100">
              {dragging ? 'Drop to upload' : (
                <>
                  Drop a file, or <span className="underline underline-offset-4">browse</span>
                </>
              )}
            </span>
            <span className={`text-[12px] ${STUDIO_SECONDARY_CLASS}`}>JPG, PNG, WEBP, MP4, MOV or WEBM</span>
          </>
        )}
      </button>
      {uploadError ? <p className="mt-1.5 text-[13px] text-red-600 dark:text-red-400">{uploadError}</p> : null}
    </li>
  );
}

function GalleryGrid({ getDraft, change }: { getDraft: () => GalleryDraft; change: StudioChangeHandler<GalleryDraft> }) {
  const [rows, setRows] = useState(() => getDraft().items);

  const commitRows = useCallback(
    (next: GalleryRow[]) => {
      setRows(next);
      change('items', next);
    },
    [change]
  );

  const updateRow = useCallback<RowChangeHandler>(
    (key, patch) => commitRows(getDraft().items.map((row) => (row.key === key ? { ...row, ...patch } : row))),
    [commitRows, getDraft]
  );

  const moveRow = useCallback(
    (key: string, direction: -1 | 1) => {
      const next = [...getDraft().items];
      const from = next.findIndex((row) => row.key === key);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= next.length) return;
      [next[from], next[to]] = [next[to], next[from]];
      commitRows(next);
    },
    [commitRows, getDraft]
  );

  const removeRow = useCallback(
    (key: string) => commitRows(getDraft().items.filter((row) => row.key !== key)),
    [commitRows, getDraft]
  );

  const { inputRef, uploading, uploadError, pickFile, onFileChange, uploadFile } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (url) => {
      const current = getDraft().items;
      if (current.length >= MAX_GALLERY) return;
      commitRows([...current, { key: nextRowKey(), title: '', ...mediaFromUrl(url) }]);
    },
  });

  const canAdd = rows.length < MAX_GALLERY;

  return (
    <section className="pb-10 pt-3" aria-label="Gallery">
      <StudioSectionHeader label={`Media · ${String(rows.length).padStart(2, '0')}`}>
        <span className={STUDIO_SECONDARY_CLASS}>
          {rows.length} of {MAX_GALLERY}
        </span>
        <StudioIconAction
          icon="add"
          label="Add media"
          onClick={pickFile}
          disabled={!canAdd || uploading}
        />
      </StudioSectionHeader>

      <input ref={inputRef} type="file" accept={MEDIA_ACCEPT} className="hidden" onChange={onFileChange} />
      <ul style={STUDIO_FLOAT_IN_STYLE} className="grid grid-cols-1 gap-x-8 gap-y-10 pt-2 sm:grid-cols-2">
        {rows.map((row, index) => (
          <GalleryTile
            key={row.key}
            row={row}
            index={index}
            total={rows.length}
            onChange={updateRow}
            onMove={moveRow}
            onRemove={removeRow}
          />
        ))}
        {canAdd ? (
          <AddTile uploading={uploading} uploadError={uploadError} pickFile={pickFile} uploadFile={uploadFile} />
        ) : null}
      </ul>
    </section>
  );
}

/** Gallery edited inline: a media grid with captions, saved through the floating bar. */
export function PortfolioGalleryStudio({
  items,
  onSave,
}: {
  items: GalleryItem[];
  onSave: (next: GalleryItem[]) => Promise<void>;
}) {
  const [initial] = useState<GalleryDraft>(() => ({
    items: items
      .filter((item) => item.mediaUrl.trim())
      .slice(0, MAX_GALLERY)
      .map((item) => ({ ...item, key: nextRowKey() })),
  }));

  const save = useCallback((draft: GalleryDraft) => onSave(cleanItems(draft.items)), [onSave]);
  const studio = useInlineStudio({ initial, onSave: save, signature: gallerySignature });

  return (
    <>
      <GalleryGrid key={studio.revision} getDraft={studio.getDraft} change={studio.change} />
      <StudioSaveChrome studio={studio} />
    </>
  );
}
