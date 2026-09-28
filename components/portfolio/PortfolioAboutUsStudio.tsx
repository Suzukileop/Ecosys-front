'use client';

import { useCallback, useState, type DragEvent, type KeyboardEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { faArrowsRotate, faCamera, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useContentMediaUpload } from '@/components/creator/creator-content-media';
import type { AboutUsForm } from '@/components/creator/studio/profile-form-schema';
import {
  STUDIO_BARE_INPUT_CLASS,
  STUDIO_BLOCK_CLASS,
  STUDIO_FLOAT_IN_STYLE,
  STUDIO_INLINE_TEXT_CLASS,
  STUDIO_LABEL_CLASS,
  STUDIO_SECONDARY_CLASS,
  StudioField,
  StudioIconAction,
  StudioRemoveButton,
  StudioSaveChrome,
  StudioUnderline,
  useInlineStudio,
  type StudioChangeHandler,
} from '@/components/portfolio/PortfolioStudioKit';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type TaskRow = { key: string; value: string };
type AboutUsDraft = {
  title: string;
  description: string;
  tasks: TaskRow[];
  images: [string, string];
  quote: string;
  founder: AboutUsForm['founder'];
};

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';
const MAX_TASKS = 12;

let taskSeq = 0;
const nextTaskKey = () => `task-${++taskSeq}`;

function toForm(draft: AboutUsDraft): AboutUsForm {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    tasks: draft.tasks.map((task) => task.value.trim()).filter(Boolean).slice(0, MAX_TASKS),
    imageUrls: [draft.images[0].trim(), draft.images[1].trim()],
    quote: draft.quote.trim(),
    founder: {
      logoUrl: draft.founder.logoUrl.trim(),
      name: draft.founder.name.trim(),
      function: draft.founder.function.trim(),
    },
  };
}

function aboutUsSignature(key: keyof AboutUsDraft, value: AboutUsDraft[keyof AboutUsDraft]): string {
  if (key === 'tasks') {
    return JSON.stringify((value as TaskRow[]).map((task) => task.value.trim()).filter(Boolean));
  }
  return JSON.stringify(typeof value === 'string' ? value.trim() : value);
}

const HOVER_REVEAL_CLASS =
  'opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover/item:opacity-100 sm:group-focus-within/item:opacity-100';

function ImageChip({
  label,
  onClick,
  danger = false,
  icon,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  icon: typeof faTrashCan;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-sm backdrop-blur transition-colors duration-200 ${
        danger ? 'hover:bg-red-500 hover:text-white' : 'hover:bg-neutral-900 hover:text-white'
      }`}
    >
      <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
    </button>
  );
}

function ImageSlot({ url, index, onChange }: { url: string; index: number; onChange: (url: string) => void }) {
  const { inputRef, uploading, uploadError, pickFile, onFileChange, uploadFile } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (next) => onChange(next.trim()),
  });
  const [dragging, setDragging] = useState(false);
  const hasImage = Boolean(url.trim());

  const dropHandlers = {
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

  return (
    <div className="group/item min-w-0">
      <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={onFileChange} />
      <div
        {...dropHandlers}
        className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border transition-colors ${
          dragging
            ? 'border-[#FF5722] bg-[#FF5722]/[0.06]'
            : hasImage
              ? 'border-black/[0.04] bg-black/[0.03] dark:border-white/[0.04] dark:bg-white/[0.04]'
              : 'border-dashed border-neutral-300 dark:border-white/15'
        }`}
      >
        {hasImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-black/55 via-black/20 via-45% to-transparent ${HOVER_REVEAL_CLASS}`}
            />
            <div className={`absolute right-3 top-3 flex gap-1.5 ${HOVER_REVEAL_CLASS}`}>
              <ImageChip label={`Replace image ${index + 1}`} icon={faArrowsRotate} onClick={pickFile} />
              <ImageChip label={`Remove image ${index + 1}`} icon={faTrashCan} danger onClick={() => onChange('')} />
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={pickFile}
            disabled={uploading}
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
          >
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
            <span className="text-[14px] text-black dark:text-neutral-100">
              Drop an image, or <span className="underline underline-offset-4">browse</span>
            </span>
            <span className={`text-[12px] ${STUDIO_SECONDARY_CLASS}`}>JPG, PNG or WEBP</span>
          </button>
        )}

        {uploading || (dragging && hasImage) ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 text-sm font-medium text-white">
            {uploading ? <LoadingSpinner size="sm" /> : null}
            {uploading ? 'Uploading…' : 'Drop to replace'}
          </div>
        ) : null}
      </div>
      {uploadError ? <p className="mt-1.5 text-[13px] text-red-600 dark:text-red-400">{uploadError}</p> : null}
    </div>
  );
}

function FounderAvatar({ url, name, onChange }: { url: string; name: string; onChange: (url: string) => void }) {
  const { inputRef, uploading, pickFile, onFileChange } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (next) => onChange(next.trim()),
  });
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <>
      <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={onFileChange} />
      <button
        type="button"
        onClick={pickFile}
        disabled={uploading}
        title={url ? 'Replace photo' : 'Add photo'}
        aria-label={url ? 'Replace founder photo' : 'Add founder photo'}
        className="group/avatar relative inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black/[0.05] text-lg font-semibold text-neutral-500 dark:bg-white/[0.07] dark:text-neutral-400"
      >
        {uploading ? (
          <LoadingSpinner size="sm" />
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : initial ? (
          initial
        ) : (
          <FontAwesomeIcon icon={faCamera} className="h-4 w-4" />
        )}
        {!uploading ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity duration-200 group-hover/avatar:opacity-100">
            <FontAwesomeIcon icon={faCamera} className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </button>
    </>
  );
}

function TasksBlock({ initial, onChange }: { initial: TaskRow[]; onChange: (next: TaskRow[]) => void }) {
  const [rows, setRows] = useState(initial);
  const [freshKey, setFreshKey] = useState<string | null>(null);

  const commit = (next: TaskRow[]) => {
    setRows(next);
    onChange(next);
  };

  const add = (afterKey?: string) => {
    if (rows.length >= MAX_TASKS) return;
    const row = { key: nextTaskKey(), value: '' };
    setFreshKey(row.key);
    const at = afterKey ? rows.findIndex((task) => task.key === afterKey) + 1 : rows.length;
    commit([...rows.slice(0, at), row, ...rows.slice(at)]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>, row: TaskRow) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      add(row.key);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className={STUDIO_LABEL_CLASS}>Tasks</span>
        <div className="flex items-center gap-3">
          <span className={STUDIO_SECONDARY_CLASS}>
            {rows.length} of {MAX_TASKS}
          </span>
          <StudioIconAction icon="add" label="Add task" onClick={() => add()} disabled={rows.length >= MAX_TASKS} />
        </div>
      </div>
      {rows.length === 0 ? (
        <button
          type="button"
          onClick={() => add()}
          className="text-base text-neutral-400 transition-colors hover:text-[#FF5722] dark:text-neutral-600"
        >
          List what your team does — one task per line.
        </button>
      ) : (
        <ul style={STUDIO_FLOAT_IN_STYLE} className="space-y-2">
          {rows.map((row, index) => (
            <li key={row.key} className="group/row flex items-center gap-3">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5722]" />
              <StudioUnderline quiet className="flex-1">
                <input
                  type="text"
                  value={row.value}
                  maxLength={200}
                  placeholder="A service or mission"
                  aria-label={`Task ${index + 1}`}
                  autoFocus={row.key === freshKey}
                  autoComplete="off"
                  onKeyDown={(event) => onKeyDown(event, row)}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    commit(rows.map((task) => (task.key === row.key ? { ...task, value } : task)));
                  }}
                  className={`${STUDIO_BARE_INPUT_CLASS} text-base text-black dark:text-neutral-100`}
                />
              </StudioUnderline>
              <StudioRemoveButton
                label={`Remove task ${index + 1}`}
                onClick={() => commit(rows.filter((task) => task.key !== row.key))}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AboutUsBody({ getDraft, change }: { getDraft: () => AboutUsDraft; change: StudioChangeHandler<AboutUsDraft> }) {
  const [draft, setDraft] = useState(getDraft);

  const patch = <K extends keyof AboutUsDraft>(key: K, value: AboutUsDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    change(key, value);
  };

  const imageCount = draft.images.filter((url) => url.trim()).length;

  return (
    <div className="pb-10">
      <div className={STUDIO_BLOCK_CLASS}>
        <StudioField label="Title" htmlFor="about-us-title">
          <input
            id="about-us-title"
            type="text"
            value={draft.title}
            maxLength={150}
            placeholder="What your team stands for"
            autoComplete="off"
            onChange={(event) => patch('title', event.currentTarget.value)}
            className={`${STUDIO_INLINE_TEXT_CLASS} !text-xl !font-semibold tracking-[-0.01em]`}
          />
        </StudioField>

        <StudioField label="Description" htmlFor="about-us-description">
          <textarea
            id="about-us-description"
            value={draft.description}
            maxLength={4000}
            rows={2}
            placeholder="Who you are, what you do and for whom."
            onChange={(event) => patch('description', event.currentTarget.value)}
            className={`${STUDIO_INLINE_TEXT_CLASS} resize-none leading-relaxed [field-sizing:content]`}
          />
        </StudioField>

        <TasksBlock initial={draft.tasks} onChange={(tasks) => patch('tasks', tasks)} />

        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <span className={STUDIO_LABEL_CLASS}>Images</span>
            <span className={STUDIO_SECONDARY_CLASS}>{imageCount} of 2</span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {([0, 1] as const).map((slot) => (
              <ImageSlot
                key={slot}
                index={slot}
                url={draft.images[slot]}
                onChange={(url) => {
                  const next: [string, string] = [...draft.images];
                  next[slot] = url;
                  patch('images', next);
                }}
              />
            ))}
          </div>
        </div>

        <StudioField label="Quote" htmlFor="about-us-quote">
          <div className="flex gap-4">
            <span aria-hidden className="w-0.5 shrink-0 self-stretch rounded-full bg-[#FF5722]/70" />
            <textarea
              id="about-us-quote"
              value={draft.quote}
              maxLength={500}
              rows={1}
              placeholder="A short line from the founder or the brand."
              onChange={(event) => patch('quote', event.currentTarget.value)}
              className={`${STUDIO_INLINE_TEXT_CLASS} resize-none italic leading-relaxed [field-sizing:content]`}
            />
          </div>
        </StudioField>

        <div>
          <span className={`${STUDIO_LABEL_CLASS} mb-4`}>Founder</span>
          <div className="flex items-center gap-4">
            <FounderAvatar
              url={draft.founder.logoUrl}
              name={draft.founder.name}
              onChange={(logoUrl) => patch('founder', { ...draft.founder, logoUrl })}
            />
            <div className="min-w-0 flex-1">
              <StudioUnderline quiet>
                <input
                  type="text"
                  value={draft.founder.name}
                  maxLength={100}
                  placeholder="Full name"
                  aria-label="Founder name"
                  autoComplete="off"
                  onChange={(event) => patch('founder', { ...draft.founder, name: event.currentTarget.value })}
                  className={`${STUDIO_BARE_INPUT_CLASS} text-base font-semibold text-black dark:text-neutral-100`}
                />
              </StudioUnderline>
              <StudioUnderline quiet className="mt-0.5">
                <input
                  type="text"
                  value={draft.founder.function}
                  maxLength={120}
                  placeholder="Role, e.g. CEO"
                  aria-label="Founder role"
                  autoComplete="off"
                  onChange={(event) => patch('founder', { ...draft.founder, function: event.currentTarget.value })}
                  className={`${STUDIO_BARE_INPUT_CLASS} text-[14px] text-neutral-500 dark:text-neutral-400`}
                />
              </StudioUnderline>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** About us edited inline: title, story, tasks, images, quote and founder, saved through the floating bar. */
export function PortfolioAboutUsStudio({
  value,
  onSave,
}: {
  value: AboutUsForm;
  onSave: (next: AboutUsForm) => Promise<void>;
}) {
  const [initial] = useState<AboutUsDraft>(() => ({
    title: value.title ?? '',
    description: value.description ?? '',
    tasks: (value.tasks ?? [])
      .filter((task) => task.trim())
      .slice(0, MAX_TASKS)
      .map((task) => ({ key: nextTaskKey(), value: task })),
    images: [value.imageUrls?.[0] ?? '', value.imageUrls?.[1] ?? ''],
    quote: value.quote ?? '',
    founder: {
      logoUrl: value.founder?.logoUrl ?? '',
      name: value.founder?.name ?? '',
      function: value.founder?.function ?? '',
    },
  }));

  const save = useCallback((draft: AboutUsDraft) => onSave(toForm(draft)), [onSave]);
  const studio = useInlineStudio({ initial, onSave: save, signature: aboutUsSignature });

  return (
    <>
      <AboutUsBody key={studio.revision} getDraft={studio.getDraft} change={studio.change} />
      <StudioSaveChrome studio={studio} />
    </>
  );
}
