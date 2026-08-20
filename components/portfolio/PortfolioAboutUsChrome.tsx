'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faPenToSquare,
  faPlus,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useContentMediaUpload } from '@/components/creator/creator-content-media';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  portfolioInlineInputClass,
} from '@/components/portfolio/portfolio-section-shared';
import {
  emptyAboutUsForm,
  type AboutUsForm,
} from '@/components/creator/studio/profile-form-schema';

const MEDIA_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';
const MAX_IMAGES = 2;
const MAX_TASKS = 12;

const itemActionVisibilityClass =
  'opacity-100 transition-opacity ' +
  '[@media(hover:hover)_and_(pointer:fine)]:opacity-0 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100';

function cloneAboutUs(value: AboutUsForm): AboutUsForm {
  return {
    title: value.title ?? '',
    description: value.description ?? '',
    tasks: [...(value.tasks ?? [])],
    imageUrls: [value.imageUrls?.[0] ?? '', value.imageUrls?.[1] ?? ''],
    quote: value.quote ?? '',
    founder: {
      logoUrl: value.founder?.logoUrl ?? '',
      name: value.founder?.name ?? '',
      function: value.founder?.function ?? '',
    },
  };
}

function aboutUsEqual(left: AboutUsForm, right: AboutUsForm): boolean {
  return JSON.stringify(cloneAboutUs(left)) === JSON.stringify(cloneAboutUs(right));
}

function IconButton({
  label,
  onClick,
  children,
  tone = 'neutral',
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  tone?: 'neutral' | 'confirm' | 'cancel';
  disabled?: boolean;
}) {
  const toneClass =
    tone === 'confirm'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100'
      : tone === 'cancel'
        ? 'border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50'
        : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700';
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
    >
      {children}
    </button>
  );
}

function ImageSlot({
  imageUrl,
  label,
  onChange,
  disabled,
}: {
  imageUrl: string;
  label: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  const { inputRef, uploading, pickFile, onFileChange } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: onChange,
  });
  const hasPhoto = Boolean(imageUrl.trim());

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={MEDIA_ACCEPT}
        className="hidden"
        onChange={onFileChange}
      />
      <div className="relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
        <button
          type="button"
          onClick={pickFile}
          disabled={disabled || uploading}
          className="group relative block aspect-[4/3] w-full overflow-hidden disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={hasPhoto ? `Replace ${label}` : `Add ${label}`}
        >
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-3 px-4">
              {uploading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-neutral-300 bg-white text-[#EA580C]">
                  <FontAwesomeIcon icon={faPlus} className="h-5 w-5" fixedWidth />
                </span>
              )}
              <span className="text-sm font-semibold text-neutral-500">
                {uploading ? 'Uploading…' : label}
              </span>
            </span>
          )}
          {hasPhoto ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-semibold text-white opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
              {uploading ? 'Uploading…' : 'Replace image'}
            </span>
          ) : null}
        </button>
        {hasPhoto ? (
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={disabled || uploading}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm"
            aria-label={`Remove ${label}`}
          >
            <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" fixedWidth />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function PortfolioAboutUsReadOnly({
  value,
  onSave,
  saving = false,
  editMode = 'individual',
}: {
  value: AboutUsForm;
  onSave: (next: AboutUsForm) => Promise<void> | void;
  saving?: boolean;
  editMode?: 'individual' | 'global';
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AboutUsForm>(() => cloneAboutUs(value));

  useEffect(() => {
    if (!editing) setDraft(cloneAboutUs(value));
  }, [value, editing]);

  const dirty = editing && !aboutUsEqual(draft, value);
  const tasks = draft.tasks.filter((task) => task.trim().length > 0);
  const images = (draft.imageUrls ?? []).filter((url) => url.trim().length > 0);
  const hasContent =
    Boolean(value.title.trim()) ||
    Boolean(value.description.trim()) ||
    value.tasks.some((task) => task.trim()) ||
    value.imageUrls.some((url) => url.trim()) ||
    Boolean(value.quote.trim()) ||
    Boolean(value.founder.name.trim()) ||
    Boolean(value.founder.function.trim()) ||
    Boolean(value.founder.logoUrl.trim());

  const startEdit = () => {
    setDraft(cloneAboutUs(value));
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(cloneAboutUs(value));
    setEditing(false);
  };

  const confirmEdit = async () => {
    const next = cloneAboutUs(draft);
    next.tasks = next.tasks.map((task) => task.trim()).filter(Boolean).slice(0, MAX_TASKS);
    next.imageUrls = [next.imageUrls[0] ?? '', next.imageUrls[1] ?? ''];
    await onSave(next);
    setEditing(false);
  };

  if (editMode === 'global') {
    return <AboutUsFields draft={draft} onChange={setDraft} disabled={saving} />;
  }

  return (
    <div className="group relative space-y-6">
      <div className={`absolute right-0 top-0 flex items-center gap-1 ${itemActionVisibilityClass}`}>
        {editing ? (
          <>
            <IconButton label="Cancel" tone="cancel" onClick={cancelEdit} disabled={saving}>
              <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
            </IconButton>
            <IconButton
              label="Save"
              tone="confirm"
              onClick={() => void confirmEdit()}
              disabled={saving || !dirty}
            >
              {saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <FontAwesomeIcon icon={faCircleCheck} className="h-3.5 w-3.5" fixedWidth />
              )}
            </IconButton>
          </>
        ) : (
          <IconButton label="Edit About us" onClick={startEdit}>
            <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
          </IconButton>
        )}
      </div>

      {editing ? (
        <AboutUsFields draft={draft} onChange={setDraft} disabled={saving} />
      ) : hasContent ? (
        <AboutUsPreview value={value} />
      ) : (
        <button
          type="button"
          onClick={startEdit}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-sm font-semibold text-neutral-500 transition hover:border-[#EA580C]/40 hover:bg-[#FFF7ED] hover:text-[#EA580C]"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-current">
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" fixedWidth />
          </span>
          Add About us
        </button>
      )}

      {!editing && hasContent ? (
        <p className="text-xs text-neutral-400">
          {tasks.length} task{tasks.length === 1 ? '' : 's'}
          {images.length ? ` · ${images.length} image${images.length === 1 ? '' : 's'}` : ''}
        </p>
      ) : null}
    </div>
  );
}

function AboutUsPreview({ value }: { value: AboutUsForm }) {
  const images = (value.imageUrls ?? []).filter((url) => url.trim());
  const tasks = value.tasks.filter((task) => task.trim());
  return (
    <div className="space-y-5 pr-10">
      {value.title.trim() ? (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">Title</p>
          <p className="mt-1 text-[15px] font-semibold text-neutral-900 dark:text-white">{value.title}</p>
        </div>
      ) : null}
      {value.description.trim() ? (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">Description</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {value.description}
          </p>
        </div>
      ) : null}
      {tasks.length > 0 ? (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">Tasks</p>
          <ul className="mt-2 space-y-1.5 text-sm text-neutral-700 dark:text-neutral-200">
            {tasks.map((task) => (
              <li key={task} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#EA580C]" />
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {images.length > 0 ? (
        <div className={`grid gap-3 ${images.length > 1 ? 'grid-cols-2' : 'max-w-xs'}`}>
          {images.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
          ))}
        </div>
      ) : null}
      {value.quote.trim() ? (
        <blockquote className="border-l-2 border-neutral-300 pl-4 text-sm italic text-neutral-700 dark:text-neutral-200">
          {value.quote}
        </blockquote>
      ) : null}
      {value.founder.name.trim() || value.founder.function.trim() || value.founder.logoUrl.trim() ? (
        <div className="flex items-center gap-3">
          {value.founder.logoUrl.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.founder.logoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">
              {(value.founder.name || '?').slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
            {value.founder.name.trim() ? (
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{value.founder.name}</p>
            ) : null}
            {value.founder.function.trim() ? (
              <p className="text-xs text-neutral-500">{value.founder.function}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AboutUsFields({
  draft,
  onChange,
  disabled,
}: {
  draft: AboutUsForm;
  onChange: (next: AboutUsForm) => void;
  disabled?: boolean;
}) {
  const patch = (partial: Partial<AboutUsForm>) => onChange({ ...draft, ...partial });
  const canAddTask = draft.tasks.filter((task) => task.trim()).length < MAX_TASKS;

  return (
    <div className="space-y-5 pr-10">
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">Title</span>
        <input
          value={draft.title}
          maxLength={150}
          disabled={disabled}
          onChange={(event) => patch({ title: event.target.value })}
          className={`mt-1 ${portfolioInlineInputClass}`}
          placeholder="About our studio"
        />
      </label>
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">Description</span>
        <textarea
          value={draft.description}
          maxLength={4000}
          rows={4}
          disabled={disabled}
          onChange={(event) => patch({ description: event.target.value })}
          className={`mt-1 min-h-[6.5rem] resize-y ${portfolioInlineInputClass}`}
          placeholder="Who you are and what you offer."
        />
      </label>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">Tasks</p>
        <div className="mt-2 space-y-2">
          {draft.tasks.map((task, index) => (
            <div key={`task-${index}`} className="flex items-center gap-2">
              <input
                value={task}
                maxLength={200}
                disabled={disabled}
                onChange={(event) => {
                  const next = [...draft.tasks];
                  next[index] = event.target.value;
                  patch({ tasks: next });
                }}
                className={portfolioInlineInputClass}
                placeholder="A service or mission"
              />
              <IconButton
                label="Remove task"
                onClick={() => patch({ tasks: draft.tasks.filter((_, taskIndex) => taskIndex !== index) })}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" fixedWidth />
              </IconButton>
            </div>
          ))}
          {canAddTask ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => patch({ tasks: [...draft.tasks, ''] })}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#EA580C]"
            >
              <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" fixedWidth />
              Add task
            </button>
          ) : null}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">Images (max 2)</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <ImageSlot
            imageUrl={draft.imageUrls[0] ?? ''}
            label="Image 1"
            disabled={disabled}
            onChange={(url) => patch({ imageUrls: [url, draft.imageUrls[1] ?? ''] })}
          />
          <ImageSlot
            imageUrl={draft.imageUrls[1] ?? ''}
            label="Image 2"
            disabled={disabled}
            onChange={(url) => patch({ imageUrls: [draft.imageUrls[0] ?? '', url] })}
          />
        </div>
      </div>
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">Quote</span>
        <textarea
          value={draft.quote}
          maxLength={500}
          rows={3}
          disabled={disabled}
          onChange={(event) => patch({ quote: event.target.value })}
          className={`mt-1 min-h-[4.5rem] resize-y ${portfolioInlineInputClass}`}
          placeholder="A short founder or brand quote."
        />
      </label>
      <div className="space-y-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">Founder</p>
        <div className="max-w-[8.5rem]">
          <ImageSlot
            imageUrl={draft.founder.logoUrl}
            label="Logo"
            disabled={disabled}
            onChange={(logoUrl) => patch({ founder: { ...draft.founder, logoUrl } })}
          />
        </div>
        <input
          value={draft.founder.name}
          maxLength={100}
          disabled={disabled}
          onChange={(event) => patch({ founder: { ...draft.founder, name: event.target.value } })}
          className={portfolioInlineInputClass}
          placeholder="Name"
        />
        <input
          value={draft.founder.function}
          maxLength={120}
          disabled={disabled}
          onChange={(event) => patch({ founder: { ...draft.founder, function: event.target.value } })}
          className={portfolioInlineInputClass}
          placeholder="Function"
        />
      </div>
    </div>
  );
}

export function createEmptyAboutUsForm(): AboutUsForm {
  return emptyAboutUsForm();
}
