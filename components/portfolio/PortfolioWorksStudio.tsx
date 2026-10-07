'use client';

import { memo, useCallback, useEffect, useId, useState, type DragEvent } from 'react';
import { ContentMediaPreview, useContentMediaUpload } from '@/components/creator/creator-content-media';
import { toAbsoluteHttpUrl, getHttpUrlFieldError } from '@/components/creator/studio/profile-form-schema';
import { MAX_PORTFOLIO_WORKS } from '@/components/portfolio/PortfolioShowcaseChrome';
import {
  STUDIO_BARE_INPUT_CLASS,
  STUDIO_BLOCK_CLASS,
  STUDIO_EMPTY_CLASS,
  STUDIO_FLOAT_IN_STYLE,
  STUDIO_INLINE_TEXT_CLASS,
  STUDIO_SECONDARY_CLASS,
  STUDIO_VALUE_CLASS,
  StudioField,
  StudioIconAction,
  StudioSaveChrome,
  StudioSectionHeader,
  StudioUnderline,
  useInlineStudio,
  type StudioChangeHandler,
} from '@/components/portfolio/PortfolioStudioKit';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';
import { getApiErrorMessage, UserFacingError } from '@/lib/api-error';
import { updateCreatorProfile } from '@/lib/creator-profile-api';
import { parseSpecialtyTags } from '@/lib/specialties';
import type { CreatorProfileDto, ProfilePortfolioWork } from '@/types/profile';

type WorkEntry = {
  id: string;
  title: string;
  role: string;
  category: string;
  description: string;
  stack: string[];
  imageUrl: string;
  link: string;
};

type WorksDraft = { works: WorkEntry[] };
type WorkChangeHandler = (id: string, next: WorkEntry) => void;

const MAX_STACK = 12;
const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

function emptyWork(): WorkEntry {
  return {
    id: crypto.randomUUID(),
    title: '',
    role: '',
    category: '',
    description: '',
    stack: [],
    imageUrl: '',
    link: '',
  };
}

function toEntry(raw: Record<string, unknown>): WorkEntry {
  const text = (value: unknown) => (value != null ? String(value).trim() : '');
  return {
    id: text(raw.id) || crypto.randomUUID(),
    title: text(raw.title),
    role: text(raw.role),
    category: text(raw.category),
    description: text(raw.description),
    stack: parseSpecialtyTags(Array.isArray(raw.stack) ? raw.stack.map(String) : []).slice(0, MAX_STACK),
    imageUrl: text(raw.imageUrl),
    link: text(raw.link),
  };
}

function parseWorks(raw: unknown): WorkEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
    .map(toEntry)
    .slice(0, MAX_PORTFOLIO_WORKS);
}

function hasContent(work: WorkEntry): boolean {
  return Boolean(
    work.title.trim() ||
      work.imageUrl.trim() ||
      work.description.trim() ||
      work.role.trim() ||
      work.category.trim() ||
      work.link.trim() ||
      work.stack.length
  );
}

function cleanWorks(works: WorkEntry[]): ProfilePortfolioWork[] {
  return works.filter(hasContent).map((work, index) => {
    const link = work.link.trim();
    return {
      id: work.id,
      sortOrder: index,
      title: work.title.trim(),
      role: work.role.trim() || null,
      category: work.category.trim() || null,
      description: work.description.trim() || null,
      stack: parseSpecialtyTags(work.stack).slice(0, MAX_STACK),
      imageUrl: work.imageUrl.trim(),
      link: link ? (toAbsoluteHttpUrl(link) ?? link) : null,
    };
  });
}

function worksSignature(_key: keyof WorksDraft, value: WorksDraft[keyof WorksDraft]): string {
  return JSON.stringify(cleanWorks(value));
}

function workLabel(work: Pick<WorkEntry, 'title'> | undefined): string {
  return work?.title.trim() || '';
}

function WorksPager({
  labels,
  active,
  onSelect,
}: {
  labels: string[];
  active: number;
  onSelect: (index: number) => void;
}) {
  const count = labels.length;
  const nameOf = (index: number) => labels[index] || `Work ${index + 1}`;

  return (
    <div role="group" aria-label="Works" className="flex items-center gap-2">
      <StudioIconAction
        icon="previous"
        label={active > 0 ? `Previous: ${nameOf(active - 1)}` : 'Previous work'}
        onClick={() => onSelect(active - 1)}
        disabled={active === 0}
      />
      <span
        aria-live="polite"
        title={nameOf(active)}
        className={`min-w-[3.25rem] text-center tabular-nums ${STUDIO_SECONDARY_CLASS}`}
      >
        {active + 1} / {count}
      </span>
      <StudioIconAction
        icon="next"
        label={active < count - 1 ? `Next: ${nameOf(active + 1)}` : 'Next work'}
        onClick={() => onSelect(active + 1)}
        disabled={active >= count - 1}
      />
    </div>
  );
}

function InlineInput({
  label,
  value,
  placeholder,
  maxLength,
  autoFocus,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
  onChange: (next: string) => void;
}) {
  const id = useId();
  return (
    <StudioField label={label} htmlFor={id}>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
        autoComplete="off"
        data-1p-ignore
        data-lpignore="true"
        onChange={(event) => onChange(event.currentTarget.value)}
        className={STUDIO_INLINE_TEXT_CLASS}
      />
    </StudioField>
  );
}

function StackBlock({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const isSelected = (tag: string) => selected.some((item) => item.toLowerCase() === tag.toLowerCase());
  const extra = selected.filter((tag) => !options.some((option) => option.toLowerCase() === tag.toLowerCase()));
  const tags = [...options, ...extra];

  return (
    <section className={STUDIO_BLOCK_CLASS} aria-label="Stack">
      <div className="min-w-0">
        <StudioSectionHeader label="Stack">
          <span className={STUDIO_SECONDARY_CLASS}>
            {selected.length} / {MAX_STACK}
          </span>
        </StudioSectionHeader>
        {tags.length === 0 ? (
          <p className={STUDIO_EMPTY_CLASS}>Add tags in About → Specialty first, then pick them here.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const active = isSelected(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  disabled={!active && selected.length >= MAX_STACK}
                  onClick={() =>
                    onChange(
                      active
                        ? selected.filter((item) => item.toLowerCase() !== tag.toLowerCase())
                        : [...selected, tag]
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-[14px] transition-colors duration-200 disabled:opacity-40 ${
                    active
                      ? 'border-black bg-black font-medium text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:text-black dark:border-white/20 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function LinkBlock({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const url = value.trim();
  const error = url ? getHttpUrlFieldError(url) : null;
  return (
    <section className={STUDIO_BLOCK_CLASS} aria-label="Project link">
      <div className="min-w-0">
        <StudioSectionHeader label="Project link" />
        <StudioUnderline>
          <input
            type="text"
            inputMode="url"
            autoComplete="off"
            value={value}
            maxLength={500}
            placeholder="https://"
            aria-label="Project link"
            aria-invalid={error ? true : undefined}
            onChange={(event) => onChange(event.currentTarget.value)}
            className={`${STUDIO_BARE_INPUT_CLASS} pb-3 ${STUDIO_VALUE_CLASS} ${url && !error ? '!text-[#FF5722]' : ''}`}
          />
        </StudioUnderline>
        {error ? <p className="mt-1.5 text-[13px] text-red-600 dark:text-red-400">{error}</p> : null}
      </div>
    </section>
  );
}

function CoverBlock({ imageUrl, onChange }: { imageUrl: string; onChange: (next: string) => void }) {
  const url = imageUrl.trim();
  const [dragging, setDragging] = useState(false);
  const { inputRef, uploading, uploadError, pickFile, onFileChange, uploadFile } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (next) => onChange(next.trim()),
  });

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
    <section className={STUDIO_BLOCK_CLASS} aria-label="Cover image">
      <div className="min-w-0">
        <StudioSectionHeader label="Cover image" />
        <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={onFileChange} />

        {url ? (
          <div
            {...dropHandlers}
            className={`group/media relative aspect-[16/10] w-full overflow-hidden rounded-lg border transition-colors ${
              dragging ? 'border-[#FF5722]' : 'border-black/[0.04] dark:border-white/[0.04]'
            }`}
          >
            <ContentMediaPreview locale="en" mediaUrl={url} mediaType="FILE" large fluid fit="cover" />
            <div className="absolute right-3 top-3 flex gap-2 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover/media:opacity-100 sm:group-focus-within/media:opacity-100">
              <button
                type="button"
                onClick={pickFile}
                disabled={uploading}
                className="rounded-full bg-black/70 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur transition hover:bg-black disabled:opacity-50"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={uploading}
                className="rounded-full bg-black/70 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur transition hover:bg-red-600 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
            {uploading || dragging ? (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 text-sm font-medium text-white">
                {uploading ? <LoadingSpinner size="sm" /> : null}
                {uploading ? 'Uploading…' : 'Drop to replace'}
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={pickFile}
            disabled={uploading}
            {...dropHandlers}
            className={`flex aspect-[16/7] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center transition-colors duration-200 disabled:cursor-wait ${
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
                <span className={`text-[15px] ${STUDIO_VALUE_CLASS}`}>
                  {dragging ? 'Drop to upload' : (
                    <>
                      Drop an image, or <span className="underline underline-offset-4">browse</span>
                    </>
                  )}
                </span>
                <span className={`text-[12px] ${STUDIO_SECONDARY_CLASS}`}>JPG, PNG or WEBP · required</span>
              </>
            )}
          </button>
        )}
        {uploadError ? <p className="mt-2 text-[13px] text-red-600 dark:text-red-400">{uploadError}</p> : null}
      </div>
    </section>
  );
}

const WorkEditor = memo(function WorkEditor({
  defaultValue,
  stackOptions,
  autoFocusTitle,
  onChange,
}: {
  defaultValue: WorkEntry;
  stackOptions: string[];
  autoFocusTitle: boolean;
  onChange: WorkChangeHandler;
}) {
  const [work, setWork] = useState(defaultValue);
  const patch = (partial: Partial<WorkEntry>) => {
    const next = { ...work, ...partial };
    setWork(next);
    onChange(work.id, next);
  };
  const descriptionId = useId();

  return (
    <div style={STUDIO_FLOAT_IN_STYLE} role="tabpanel">
      <section className={STUDIO_BLOCK_CLASS} aria-label="Project">
        <InlineInput
          label="Project title"
          value={work.title}
          placeholder="B2B supplier marketplace"
          maxLength={120}
          autoFocus={autoFocusTitle}
          onChange={(title) => patch({ title })}
        />
        <div className="grid grid-cols-1 items-start gap-x-8 gap-y-10 sm:grid-cols-2">
          <InlineInput
            label="Your role"
            value={work.role}
            placeholder="Lead developer"
            maxLength={80}
            onChange={(role) => patch({ role })}
          />
          <InlineInput
            label="Category"
            value={work.category}
            placeholder="Web, mobile, branding…"
            maxLength={80}
            onChange={(category) => patch({ category })}
          />
        </div>
      </section>

      <section className={STUDIO_BLOCK_CLASS} aria-label="Description">
        <StudioField label="Description" htmlFor={descriptionId}>
          <textarea
            id={descriptionId}
            value={work.description}
            rows={3}
            maxLength={2000}
            placeholder="The problem, what you built and the outcome…"
            onChange={(event) => patch({ description: event.currentTarget.value })}
            className={`${STUDIO_INLINE_TEXT_CLASS} resize-none leading-relaxed [field-sizing:content]`}
          />
        </StudioField>
      </section>

      <StackBlock options={stackOptions} selected={work.stack} onChange={(stack) => patch({ stack })} />
      <LinkBlock value={work.link} onChange={(link) => patch({ link })} />
      <CoverBlock imageUrl={work.imageUrl} onChange={(imageUrl) => patch({ imageUrl })} />
    </div>
  );
});

function WorksBody({
  stackOptions,
  getDraft,
  change,
}: {
  stackOptions: string[];
  getDraft: () => WorksDraft;
  change: StudioChangeHandler<WorksDraft>;
}) {
  const [ids, setIds] = useState(() => getDraft().works.map((work) => work.id));
  const [labels, setLabels] = useState<Record<string, string>>(() =>
    Object.fromEntries(getDraft().works.map((work) => [work.id, workLabel(work)]))
  );
  const [active, setActive] = useState(0);
  const [freshId, setFreshId] = useState<string | null>(null);

  const updateWork = useCallback<WorkChangeHandler>(
    (id, next) => {
      change(
        'works',
        getDraft().works.map((work) => (work.id === id ? next : work))
      );
      const label = workLabel(next);
      setLabels((current) => (current[id] === label ? current : { ...current, [id]: label }));
    },
    [change, getDraft]
  );

  const add = () => {
    if (ids.length >= MAX_PORTFOLIO_WORKS) return;
    const work = emptyWork();
    change('works', [...getDraft().works, work]);
    setIds([...ids, work.id]);
    setLabels((current) => ({ ...current, [work.id]: '' }));
    setActive(ids.length);
    setFreshId(work.id);
  };

  const removeActive = () => {
    const id = ids[active];
    if (!id) return;
    change(
      'works',
      getDraft().works.filter((work) => work.id !== id)
    );
    setIds(ids.filter((item) => item !== id));
    setActive(Math.max(0, active - 1));
  };

  const activeId = ids[Math.min(active, ids.length - 1)];
  const activeWork = getDraft().works.find((work) => work.id === activeId);

  return (
    <>
      <section className={STUDIO_BLOCK_CLASS} aria-label="Works">
        <div className="flex items-center justify-end gap-x-3">
          {ids.length > 1 ? (
            <>
              <WorksPager
                labels={ids.map((id) => labels[id] ?? '')}
                active={Math.min(active, ids.length - 1)}
                onSelect={setActive}
              />
              <span aria-hidden className="mx-1 h-5 w-px bg-neutral-200 dark:bg-white/10" />
            </>
          ) : null}
          {ids.length > 0 ? <StudioIconAction icon="remove" label="Remove work" onClick={removeActive} /> : null}
          <StudioIconAction
            icon="add"
            label="Add work"
            onClick={add}
            disabled={ids.length >= MAX_PORTFOLIO_WORKS}
          />
        </div>
      </section>

      {activeWork ? (
        <WorkEditor
          key={activeWork.id}
          defaultValue={activeWork}
          stackOptions={stackOptions}
          autoFocusTitle={activeWork.id === freshId}
          onChange={updateWork}
        />
      ) : (
        <p className={`py-10 text-center ${STUDIO_EMPTY_CLASS}`}>No work yet — add your first project.</p>
      )}
    </>
  );
}

function WorksStudio({
  initial,
  stackOptions,
  onSaved,
}: {
  initial: WorkEntry[];
  stackOptions: string[];
  onSaved: (count: number) => void;
}) {
  const [draft] = useState<WorksDraft>(() => ({ works: initial }));

  const save = useCallback(
    async (next: WorksDraft) => {
      const filled = next.works.filter(hasContent);
      if (filled.some((work) => !work.title.trim() || !work.imageUrl.trim())) {
        throw new UserFacingError('Each work needs a title and a cover image.');
      }
      if (filled.some((work) => work.link.trim() && getHttpUrlFieldError(work.link.trim()))) {
        throw new UserFacingError('Fix the project link before saving.');
      }
      const cleaned = cleanWorks(filled);
      await updateCreatorProfile({ portfolioWorks: cleaned });
      onSaved(cleaned.length);
    },
    [onSaved]
  );

  const studio = useInlineStudio({ initial: draft, onSave: save, signature: worksSignature });

  return (
    <>
      <WorksBody key={studio.revision} stackOptions={stackOptions} getDraft={studio.getDraft} change={studio.change} />
      <StudioSaveChrome studio={studio} />
    </>
  );
}

/** Portfolio works edited inline, one project at a time — same flow as Experience. */
export function PortfolioWorksStudio({
  stackOptions = [],
  onCountChange,
}: {
  stackOptions?: string[];
  onCountChange?: (count: number) => void;
}) {
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; works: WorkEntry[]; tags: string[] }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    api
      .get<CreatorProfileDto>('/api/creator/profile')
      .then((res) => {
        if (cancelled) return;
        const works = parseWorks(res.data.portfolioWorks);
        onCountChange?.(works.length);
        setState({ status: 'ready', works, tags: parseSpecialtyTags(res.data.specialtyTags) });
      })
      .catch((e: unknown) => {
        if (!cancelled) setState({ status: 'error', message: getApiErrorMessage(e, 'Unable to load portfolio works.') });
      });
    return () => {
      cancelled = true;
    };
  }, [onCountChange]);

  if (state.status === 'loading') {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="py-6">
        <ErrorAlert message={state.message} />
      </div>
    );
  }

  const tags = parseSpecialtyTags([...stackOptions, ...state.tags]).filter(
    (tag, index, all) => all.findIndex((other) => other.toLowerCase() === tag.toLowerCase()) === index
  );

  return <WorksStudio initial={state.works} stackOptions={tags} onSaved={(count) => onCountChange?.(count)} />;
}
