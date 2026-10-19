'use client';

import { memo, useCallback, useId, useState, type DragEvent } from 'react';
import { ContentMediaPreview, useContentMediaUpload } from '@/components/creator/creator-content-media';
import { uploadExperienceMedia } from '@/lib/marketplace-api';
import { UserFacingError } from '@/lib/api-error';
import { CreatorToolsPicker } from '@/components/creator/studio/CreatorToolsPicker';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MAX_CUSTOM_EMPLOYMENT_LENGTH, isKnownEmploymentType } from '@/lib/experience-employment';
import {
  createEmptyExperienceProofLink,
  getHttpUrlFieldError,
  inferProfileMediaType,
} from '@/components/creator/studio/profile-form-schema';
import {
  EMPLOYMENT_OPTIONS,
  EXPERIENCE_MEDIA_ACCEPT,
  MAX_EXPERIENCE_ENTRIES,
  blockHasContent,
  cleanDraft,
  collectProofLinkUrlErrors,
  type PortfolioExperienceBlockDraft,
  type PortfolioExperienceStatus,
} from '@/components/portfolio/PortfolioExperienceChrome';
import {
  STUDIO_BARE_INPUT_CLASS,
  STUDIO_BLOCK_CLASS,
  STUDIO_EMPTY_CLASS,
  STUDIO_FLOAT_IN_STYLE,
  STUDIO_ROW_RULE,
  STUDIO_SECONDARY_CLASS,
  STUDIO_VALUE_CLASS,
  STUDIO_INLINE_TEXT_CLASS,
  StudioField,
  StudioIconAction,
  StudioFoldToggle,
  StudioRemoveButton,
  StudioSaveChrome,
  StudioSectionHeader,
  StudioSlashLine,
  StudioUnderline,
  useStudioFold,
  useInlineStudio,
  type StudioChangeHandler,
} from '@/components/portfolio/PortfolioStudioKit';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
type ExperienceEntry = PortfolioExperienceBlockDraft & { key: string };

type ExperienceDraft = {
  blocks: ExperienceEntry[];
};

type ChangeHandler = StudioChangeHandler<ExperienceDraft>;
type EntryChangeHandler = (key: string, next: ExperienceEntry) => void;

const MAX_TASKS = 12;
const MAX_TOOLS = 20;
const MAX_LINKS = 1;

const VALUE_CLASS = STUDIO_VALUE_CLASS;
const SECONDARY_CLASS = STUDIO_SECONDARY_CLASS;
const EMPTY_CLASS = STUDIO_EMPTY_CLASS;

let entrySeq = 0;
const nextEntryKey = () => `experience-${++entrySeq}`;

function emptyEntry(): ExperienceEntry {
  return {
    key: nextEntryKey(),
    title: '',
    organization: '',
    period: '',
    text: '',
    status: null,
    location: '',
    employmentType: null,
    mediaUrl: '',
    mediaType: null,
    tasks: [],
    tools: [],
    links: [],
  };
}

function experienceSignature(_key: keyof ExperienceDraft, value: ExperienceDraft[keyof ExperienceDraft]): string {
  return JSON.stringify(value.map(cleanDraft).filter(blockHasContent));
}

function stripKey({ key: _key, ...block }: ExperienceEntry): PortfolioExperienceBlockDraft {
  return block;
}

function entryLabel(entry: Pick<ExperienceEntry, 'title' | 'organization'> | undefined): string {
  return entry?.title.trim() || entry?.organization.trim() || '';
}

/** Chevron pager — stays one compact row however many experiences there are. */
function ExperiencePager({
  labels,
  active,
  onSelect,
}: {
  labels: string[];
  active: number;
  onSelect: (index: number) => void;
}) {
  const t = useT();
  const count = labels.length;
  const nameOf = (index: number) => labels[index] || `Experience ${index + 1}`;

  return (
    <div role="group" aria-label={t('Experiences')} className="flex items-center gap-2">
      <StudioIconAction
        icon="previous"
        label={active > 0 ? `Previous: ${nameOf(active - 1)}` : t('Previous experience')}
        onClick={() => onSelect(active - 1)}
        disabled={active === 0}
      />
      <span
        aria-live="polite"
        title={nameOf(active)}
        className={`min-w-[3.25rem] text-center tabular-nums ${SECONDARY_CLASS}`}
      >
        {active + 1} / {count}
      </span>
      <StudioIconAction
        icon="next"
        label={active < count - 1 ? `Next: ${nameOf(active + 1)}` : t('Next experience')}
        onClick={() => onSelect(active + 1)}
        disabled={active >= count - 1}
      />
    </div>
  );
}

/** Text-only option row: the chosen value in ink with a coral rule, the rest in grey. */
function QuietChoice<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ value: T; label: string }>;
  value: T | null;
  onChange: (next: T | null) => void;
  label: string;
}) {
  const t = useT();
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap items-baseline gap-x-5 gap-y-2 pb-2">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(selected ? null : option.value)}
            className={`relative pb-1.5 text-[15px] transition-colors duration-200 ${
              selected
                ? 'font-semibold text-black dark:text-white'
                : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            {t(option.label)}
            <span
              aria-hidden
              className={`absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#0F1419] dark:bg-[#E7E9EA] ${selected ? '' : 'invisible'}`}
            />
          </button>
        );
      })}
    </div>
  );
}

const CUSTOM_EMPLOYMENT = '__custom__';

/** The known types plus "Custom", which opens a free-text field for the creator's own wording. */
function EmploymentChoice({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  const t = useT();
  const [customOpen, setCustomOpen] = useState(() => value != null && !isKnownEmploymentType(value));
  const customValue = value != null && !isKnownEmploymentType(value) ? value : '';

  return (
    <div>
      <QuietChoice
        label={t('Employment type')}
        options={[...EMPLOYMENT_OPTIONS, { value: CUSTOM_EMPLOYMENT, label: t('Custom') }]}
        value={customOpen ? CUSTOM_EMPLOYMENT : value}
        onChange={(next) => {
          if (next === CUSTOM_EMPLOYMENT) {
            setCustomOpen(true);
            onChange(null);
            return;
          }
          setCustomOpen(false);
          onChange(next);
        }}
      />
      {customOpen ? (
        <div style={STUDIO_FLOAT_IN_STYLE} className="mt-3 max-w-sm">
          <StudioUnderline quiet>
            <input
              type="text"
              value={customValue}
              autoFocus
              autoComplete="off"
              maxLength={MAX_CUSTOM_EMPLOYMENT_LENGTH}
              placeholder={t('e.g. Volunteer, Co-founder, Seasonal')}
              aria-label={t('Custom employment type')}
              onChange={(event) => onChange(event.currentTarget.value.trim() ? event.currentTarget.value : null)}
              className={`${STUDIO_BARE_INPUT_CLASS} ${VALUE_CLASS}`}
            />
          </StudioUnderline>
        </div>
      ) : null}
    </div>
  );
}

const STATUS_OPTIONS: Array<{ value: PortfolioExperienceStatus; label: string }> = [
  { value: 'ONGOING', label: msg('Ongoing') },
  { value: 'FINISHED', label: msg('Finished') },
];

function InlineInput({
  label,
  value,
  placeholder,
  className = '',
  inputClassName = '',
  autoFocus,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  onChange: (next: string) => void;
}) {
  const id = useId();
  return (
    <StudioField label={label} htmlFor={id} className={className}>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        data-1p-ignore
        data-lpignore="true"
        onChange={(event) => onChange(event.currentTarget.value)}
        className={`${STUDIO_INLINE_TEXT_CLASS} ${inputClassName}`}
      />
    </StudioField>
  );
}

function TasksBlock({
  tasks,
  onChange,
}: {
  tasks: Array<{ value: string }>;
  onChange: (next: Array<{ value: string }>) => void;
}) {
  const t = useT();
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const add = () => {
    if (tasks.length >= MAX_TASKS) return;
    setFocusIndex(tasks.length);
    onChange([...tasks, { value: '' }]);
  };

  return (
    <section className={STUDIO_BLOCK_CLASS} aria-label={t('Tasks')}>
      <div className="min-w-0">
        <StudioSectionHeader label={t('Tasks')}>
          <StudioIconAction icon="add" label={t('Add task')} onClick={add} disabled={tasks.length >= MAX_TASKS} />
        </StudioSectionHeader>
        {tasks.length === 0 ? (
          <p className={EMPTY_CLASS}>{t('No task yet')}</p>
        ) : (
          <ul>
            {tasks.map((task, index) => (
              <li key={index} className={`group/row flex items-baseline py-3 first:pt-0 ${STUDIO_ROW_RULE}`}>
                <span aria-hidden className="mr-3 select-none text-neutral-400">
                  —
                </span>
                <StudioUnderline quiet className="flex-1">
                  <input
                    type="text"
                    value={task.value}
                    placeholder={t('Describe a mission')}
                    aria-label={`Task ${index + 1}`}
                    autoFocus={index === focusIndex}
                    autoComplete="off"
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      onChange(tasks.map((item, itemIndex) => (itemIndex === index ? { value } : item)));
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        add();
                      }
                    }}
                    className={`${STUDIO_BARE_INPUT_CLASS} leading-relaxed ${VALUE_CLASS}`}
                  />
                </StudioUnderline>
                <StudioRemoveButton
                  label={`Remove task ${index + 1}`}
                  onClick={() => onChange(tasks.filter((_, itemIndex) => itemIndex !== index))}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ToolsBlock({
  tools,
  onChange,
}: {
  tools: PortfolioExperienceBlockDraft['tools'];
  onChange: (next: PortfolioExperienceBlockDraft['tools']) => void;
}) {
  const t = useT();
  const [open, setOpen] = useStudioFold();
  const filled = tools.filter((tool) => tool.value.trim());
  return (
    <section className={STUDIO_BLOCK_CLASS} aria-label={t('Tools')}>
      <StudioUnderline>
        <StudioSectionHeader label={t('Tools')}>
          <StudioFoldToggle open={open} onClick={() => setOpen(!open)} />
        </StudioSectionHeader>
        {open ? null : filled.length > 0 ? (
          <StudioSlashLine
            items={filled.map((tool) => (
              <span key={tool.value} className={VALUE_CLASS}>
                {tool.value}
              </span>
            ))}
          />
        ) : (
          <p className={`pb-3 ${EMPTY_CLASS}`}>{t('No tool yet')}</p>
        )}
        {open ? (
          <div style={STUDIO_FLOAT_IN_STYLE} className="pb-5">
            <CreatorToolsPicker
              value={filled.map((tool) => ({ value: tool.value, iconUrl: tool.iconUrl ?? null }))}
              max={MAX_TOOLS}
              variant="studio"
              onChange={(next) =>
                onChange(
                  next.map((item) => {
                    const existing = tools.find(
                      (tool) => tool.value.trim().toLowerCase() === item.value.trim().toLowerCase()
                    );
                    return { value: item.value, description: existing?.description ?? '', iconUrl: item.iconUrl ?? null };
                  })
                )
              }
            />
          </div>
        ) : null}
      </StudioUnderline>
    </section>
  );
}

function LinksBlock({
  links,
  onChange,
}: {
  links: PortfolioExperienceBlockDraft['links'];
  onChange: (next: PortfolioExperienceBlockDraft['links']) => void;
}) {
  const t = useT();
  const [focusId, setFocusId] = useState<string | null>(null);
  const update = (id: string, patch: { label?: string; url?: string }) =>
    onChange(links.map((link) => (link.id === id ? { ...link, ...patch } : link)));
  const add = () => {
    if (links.length >= MAX_LINKS) return;
    const link = createEmptyExperienceProofLink(links.length);
    setFocusId(link.id);
    onChange([...links, link]);
  };

  return (
    <section className={STUDIO_BLOCK_CLASS} aria-label={t('Proof link')}>
      <div className="min-w-0">
        <StudioSectionHeader label={t('Proof link')}>
          {links.length < MAX_LINKS ? (
            <StudioIconAction icon="add" label={t('Add proof link')} onClick={add} />
          ) : null}
        </StudioSectionHeader>
        {links.length === 0 ? (
          <p className={EMPTY_CLASS}>{t('No link yet')}</p>
        ) : (
          <ul>
            {links.map((link) => {
              const url = link.url.trim();
              const error = url ? getHttpUrlFieldError(url) : link.label.trim() ? t('URL is required.') : null;
              return (
                <li key={link.id} className={`py-3 first:pt-0 ${STUDIO_ROW_RULE}`}>
                  <div className="group/row grid grid-cols-1 items-baseline gap-x-8 gap-y-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
                    <StudioUnderline quiet>
                      <input
                        type="text"
                        value={link.label}
                        placeholder={t('Label')}
                        aria-label={t('Link label')}
                        autoComplete="off"
                        autoFocus={link.id === focusId}
                        onChange={(event) => update(link.id, { label: event.currentTarget.value })}
                        className={`${STUDIO_BARE_INPUT_CLASS} ${VALUE_CLASS}`}
                      />
                    </StudioUnderline>
                    <StudioUnderline quiet>
                      <input
                        type="text"
                        inputMode="url"
                        autoComplete="off"
                        value={link.url}
                        placeholder="https://"
                        aria-label={t('Link URL')}
                        aria-invalid={error ? true : undefined}
                        onChange={(event) => update(link.id, { url: event.currentTarget.value })}
                        className={`${STUDIO_BARE_INPUT_CLASS} ${SECONDARY_CLASS} ${url && !error ? '!text-[#0F1419] underline decoration-[#CFD9DE] underline-offset-4 dark:!text-[#E7E9EA] dark:decoration-[#536471]' : ''}`}
                      />
                    </StudioUnderline>
                    <StudioRemoveButton
                      label={t('Remove link')}
                      onClick={() => onChange(links.filter((item) => item.id !== link.id))}
                    />
                  </div>
                  {error ? <p className="mt-1.5 text-[13px] text-red-600 dark:text-red-400">{error}</p> : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function MediaBlock({
  mediaUrl,
  onChange,
}: {
  mediaUrl: string;
  onChange: (next: { mediaUrl: string; mediaType: 'IMAGE' | 'VIDEO' | null }) => void;
}) {
  const t = useT();
  const url = mediaUrl.trim();
  const [dragging, setDragging] = useState(false);
  const { inputRef, uploading, uploadError, pickFile, onFileChange, uploadFile } = useContentMediaUpload({
    locale: 'en',
    upload: uploadExperienceMedia,
    onUrlChange: (next) => {
      const trimmed = next.trim();
      onChange({ mediaUrl: trimmed, mediaType: trimmed ? inferProfileMediaType(trimmed) : null });
    },
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
    <section className={STUDIO_BLOCK_CLASS} aria-label={t('Media')}>
      <div className="min-w-0">
        <StudioSectionHeader label={t('Media')} />
        <input ref={inputRef} type="file" accept={EXPERIENCE_MEDIA_ACCEPT} className="hidden" onChange={onFileChange} />

        {url ? (
          <div
            {...dropHandlers}
            className={`group/media relative aspect-[16/10] w-full overflow-hidden rounded-lg border transition-colors ${
              dragging ? 'border-[#0F1419] dark:border-[#E7E9EA]' : 'border-black/[0.04] dark:border-white/[0.04]'
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
                {t('Replace')}
              </button>
              <button
                type="button"
                onClick={() => onChange({ mediaUrl: '', mediaType: null })}
                disabled={uploading}
                className="rounded-full bg-black/70 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur transition hover:bg-red-600 disabled:opacity-50"
              >
                {t('Remove')}
              </button>
            </div>
            {uploading || dragging ? (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 text-sm font-medium text-white">
                {uploading ? <LoadingSpinner size="sm" /> : null}
                {uploading ? t('Uploading…') : t('Drop to replace')}
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
                ? 'border-[#0F1419] bg-[#0F1419]/[0.04] dark:border-[#E7E9EA] dark:bg-white/[0.06]'
                : 'border-neutral-300 hover:border-neutral-500 hover:bg-black/[0.02] dark:border-white/15 dark:hover:border-white/35 dark:hover:bg-white/[0.02]'
            }`}
          >
            {uploading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className={SECONDARY_CLASS}>{t('Uploading…')}</span>
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
                <span className={`text-[15px] ${VALUE_CLASS}`}>
                  {dragging ? t('Drop to upload') : (
                    <>
                      {t('Drop an image or video, or')} <span className="underline underline-offset-4">{t('browse')}</span>
                    </>
                  )}
                </span>
                <span className={`text-[12px] ${SECONDARY_CLASS}`}>{t('JPG, PNG, WEBP, GIF, MP4 or WEBM')}</span>
              </>
            )}
          </button>
        )}
        {uploadError ? <p className="mt-2 text-[13px] text-red-600 dark:text-red-400">{uploadError}</p> : null}
      </div>
    </section>
  );
}

const EntryEditor = memo(function EntryEditor({
  defaultValue,
  autoFocusTitle,
  onChange,
}: {
  defaultValue: ExperienceEntry;
  autoFocusTitle: boolean;
  onChange: EntryChangeHandler;
}) {
  const t = useT();
  const [entry, setEntry] = useState(defaultValue);
  const patch = (partial: Partial<PortfolioExperienceBlockDraft>) => {
    const next = { ...entry, ...partial };
    setEntry(next);
    onChange(entry.key, next);
  };

  return (
    <div style={STUDIO_FLOAT_IN_STYLE} role="tabpanel">
      <section className={STUDIO_BLOCK_CLASS} aria-label={t('Role')}>
        <div className="grid grid-cols-1 items-start gap-y-6">
          <InlineInput
            label={t('Job title')}
            value={entry.title}
            placeholder={t('Video director & editor')}
            autoFocus={autoFocusTitle}
            onChange={(title) => patch({ title })}
          />
          <StudioField label={t('Status')}>
            <QuietChoice
              label={t('Status')}
              options={STATUS_OPTIONS}
              value={entry.status}
              onChange={(status) => patch({ status })}
            />
          </StudioField>
        </div>
        <div className="grid grid-cols-1 items-start gap-y-6">
          <InlineInput
            label={t('Period')}
            value={entry.period}
            placeholder={t('2021 — present')}
            inputClassName="tabular-nums"
            onChange={(period) => patch({ period })}
          />
          <InlineInput
            label={t('Organization')}
            value={entry.organization}
            placeholder={t('Studio, agency…')}
            onChange={(organization) => patch({ organization })}
          />
          <InlineInput
            label={t('Location')}
            value={entry.location}
            placeholder={t('City, country or remote')}
            onChange={(location) => patch({ location })}
          />
        </div>
        <div className="grid grid-cols-1 items-start gap-y-6">
          <StudioField label={t('Employment')}>
            <EmploymentChoice
              value={entry.employmentType}
              onChange={(employmentType) => patch({ employmentType })}
            />
          </StudioField>
          <CvVisibilityField
            shown={!entry.hideFromCv}
            onChange={(shown) => patch({ hideFromCv: !shown })}
          />
        </div>
      </section>

      <section className={STUDIO_BLOCK_CLASS} aria-label={t('Description')}>
        <DescriptionField value={entry.text} onChange={(text) => patch({ text })} />
      </section>

      <TasksBlock tasks={entry.tasks} onChange={(tasks) => patch({ tasks })} />
      <ToolsBlock tools={entry.tools} onChange={(tools) => patch({ tools })} />
      <LinksBlock links={entry.links} onChange={(links) => patch({ links })} />
      <MediaBlock mediaUrl={entry.mediaUrl} onChange={(media) => patch(media)} />
    </div>
  );
});

function CvVisibilityField({ shown, onChange }: { shown: boolean; onChange: (shown: boolean) => void }) {
  const t = useT();
  const id = useId();
  return (
    <StudioField label="CV" htmlFor={id} hint={t('Choose whether this experience appears in your generated CV.')}>
      <div className="flex items-center gap-3 pb-3">
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={shown}
          onClick={() => onChange(!shown)}
          className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-300 outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F1419]/40 dark:focus-visible:ring-[#E7E9EA]/40 ${
            shown ? 'bg-[#0F1419] dark:bg-[#EFF3F4]' : 'bg-black/[0.12] dark:bg-white/[0.14]'
          }`}
        >
          <span
            aria-hidden
            className={`inline-block h-3 w-3 rounded-full bg-white shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              shown ? 'translate-x-3.5 dark:bg-[#0F1419]' : 'translate-x-0.5'
            }`}
          />
        </button>
        <span className={`truncate text-base font-normal ${shown ? 'text-black dark:text-neutral-100' : EMPTY_CLASS}`}>
          {shown ? t('Shown in CV') : t('Hidden from CV')}
        </span>
      </div>
    </StudioField>
  );
}

function DescriptionField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const t = useT();
  const id = useId();
  return (
    <StudioField label={t('Description')} htmlFor={id}>
      <textarea
        id={id}
        value={value}
        rows={3}
        placeholder={t('What you did, outcomes, scope of work…')}
        onChange={(event) => onChange(event.currentTarget.value)}
        className={`${STUDIO_INLINE_TEXT_CLASS} resize-none leading-relaxed [field-sizing:content]`}
      />
    </StudioField>
  );
}

function ExperienceBody({
  getDraft,
  change,
}: {
  getDraft: () => ExperienceDraft;
  change: ChangeHandler;
}) {
  const t = useT();
  const [keys, setKeys] = useState(() => getDraft().blocks.map((block) => block.key));
  const [labels, setLabels] = useState<Record<string, string>>(() =>
    Object.fromEntries(getDraft().blocks.map((block) => [block.key, entryLabel(block)]))
  );
  const [active, setActive] = useState(0);
  const [freshKey, setFreshKey] = useState<string | null>(null);

  const updateEntry = useCallback<EntryChangeHandler>(
    (key, next) => {
      change(
        'blocks',
        getDraft().blocks.map((block) => (block.key === key ? next : block))
      );
      const label = entryLabel(next);
      setLabels((current) => (current[key] === label ? current : { ...current, [key]: label }));
    },
    [change, getDraft]
  );

  const add = () => {
    if (keys.length >= MAX_EXPERIENCE_ENTRIES) return;
    const entry = emptyEntry();
    change('blocks', [...getDraft().blocks, entry]);
    setKeys([...keys, entry.key]);
    setLabels((current) => ({ ...current, [entry.key]: '' }));
    setActive(keys.length);
    setFreshKey(entry.key);
  };

  const removeActive = () => {
    const key = keys[active];
    if (!key) return;
    change(
      'blocks',
      getDraft().blocks.filter((block) => block.key !== key)
    );
    setKeys(keys.filter((item) => item !== key));
    setActive(Math.max(0, active - 1));
  };

  const activeKey = keys[Math.min(active, keys.length - 1)];
  const activeEntry = getDraft().blocks.find((block) => block.key === activeKey);

  return (
    <>
      <section className={STUDIO_BLOCK_CLASS} aria-label={t('Experiences')}>
        <div className="flex items-center justify-end gap-x-3">
          {keys.length > 1 ? (
            <>
              <ExperiencePager
                labels={keys.map((key) => labels[key] ?? '')}
                active={Math.min(active, keys.length - 1)}
                onSelect={setActive}
              />
              <span aria-hidden className="mx-1 h-5 w-px bg-neutral-200 dark:bg-white/10" />
            </>
          ) : null}
          {keys.length > 0 ? (
            <StudioIconAction icon="remove" label={t('Remove experience')} onClick={removeActive} />
          ) : null}
          <StudioIconAction
            icon="add"
            label={t('Add experience')}
            onClick={add}
            disabled={keys.length >= MAX_EXPERIENCE_ENTRIES}
          />
        </div>
      </section>

      {activeEntry ? (
        <EntryEditor
          key={activeEntry.key}
          defaultValue={activeEntry}
          autoFocusTitle={activeEntry.key === freshKey}
          onChange={updateEntry}
        />
      ) : (
        <p className={`py-10 text-center ${EMPTY_CLASS}`}>{t('No experience yet — add your first one.')}</p>
      )}
    </>
  );
}

export function PortfolioExperienceStudio({
  blocks,
  onSave,
}: {
  blocks: PortfolioExperienceBlockDraft[];
  onSave: (next: { blocks: PortfolioExperienceBlockDraft[] }) => Promise<void>;
}) {
  const [initial] = useState<ExperienceDraft>(() => ({
    blocks: blocks.filter(blockHasContent).map((block) => ({ ...block, key: nextEntryKey() })),
  }));

  const save = useCallback(
    async (draft: ExperienceDraft) => {
      if (draft.blocks.some((block) => Object.keys(collectProofLinkUrlErrors(block.links)).length > 0)) {
        throw new UserFacingError('Fix the highlighted links before saving.');
      }
      await onSave({
        blocks: draft.blocks.map(stripKey).map(cleanDraft).filter(blockHasContent),
      });
    },
    [onSave]
  );

  const studio = useInlineStudio({ initial, onSave: save, signature: experienceSignature });

  return (
    <>
      <ExperienceBody
        key={studio.revision}
        getDraft={studio.getDraft}
        change={studio.change}
      />
      <StudioSaveChrome studio={studio} />
    </>
  );
}
