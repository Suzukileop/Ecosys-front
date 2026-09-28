'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faPenToSquare, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { faArrowUpRightFromSquare, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { updateCreatorProfile } from '@/lib/creator-profile-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { pushFlashFeedback, pushInsertionLimitFeedback } from '@/stores/flashFeedbackStore';
import { uploadContentMedia } from '@/lib/marketplace-api';
import { parseSpecialtyTags } from '@/lib/specialties';
import api from '@/lib/api';
import type { CreatorProfileDto, ProfilePortfolioWork } from '@/types/ecosystem';
import {
  STUDIO_BARE_INPUT_CLASS,
  STUDIO_EMPTY_CLASS,
  STUDIO_FLOAT_IN_STYLE,
  STUDIO_LABEL_CLASS,
  STUDIO_SECONDARY_CLASS,
  STUDIO_VALUE_CLASS,
  StudioIconAction,
  StudioSectionHeader,
  StudioSlashLine,
  StudioUnderline,
} from '@/components/portfolio/PortfolioStudioKit';
import { toAbsoluteHttpUrl } from '@/components/creator/studio/profile-form-schema';

/** Max manual portfolio works (matches backend MAX_PORTFOLIO_WORKS). */
export const MAX_PORTFOLIO_WORKS = 6;
/** @deprecated Use MAX_PORTFOLIO_WORKS */
export const MAX_PORTFOLIO_PICKS = MAX_PORTFOLIO_WORKS;

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

type WorkDraft = {
  role: string;
  category: string;
  title: string;
  description: string;
  stack: string[];
  imageUrl: string;
  link: string;
};

const EMPTY_DRAFT: WorkDraft = {
  role: '',
  category: '',
  title: '',
  description: '',
  stack: [],
  imageUrl: '',
  link: '',
};

const cardActionVisibilityClass =
  'opacity-100 transition-opacity ' +
  '[@media(hover:hover)_and_(pointer:fine)]:opacity-0 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover/item:opacity-100 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-focus-within/item:opacity-100';

function normalizeWork(item: ProfilePortfolioWork, index: number): ProfilePortfolioWork {
  return {
    id: item.id?.trim() || crypto.randomUUID(),
    sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : index,
    role: item.role?.trim() || '',
    category: item.category?.trim() || '',
    title: item.title?.trim() || '',
    description: item.description?.trim() || '',
    stack: parseSpecialtyTags(item.stack ?? []).slice(0, 12),
    imageUrl: item.imageUrl?.trim() || '',
    link: item.link?.trim() || '',
  };
}

function parseWorks(raw: unknown): ProfilePortfolioWork[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      return normalizeWork(
        {
          id: row.id != null ? String(row.id) : crypto.randomUUID(),
          sortOrder: typeof row.sortOrder === 'number' ? row.sortOrder : index,
          role: row.role != null ? String(row.role) : '',
          category: row.category != null ? String(row.category) : '',
          title: row.title != null ? String(row.title) : '',
          description: row.description != null ? String(row.description) : '',
          stack: Array.isArray(row.stack) ? row.stack.map((t) => String(t)) : [],
          imageUrl: row.imageUrl != null ? String(row.imageUrl) : '',
          link: row.link != null ? String(row.link) : '',
        },
        index
      );
    })
    .filter((item): item is ProfilePortfolioWork => Boolean(item))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, MAX_PORTFOLIO_WORKS);
}

function toDraft(item: ProfilePortfolioWork): WorkDraft {
  return {
    role: item.role ?? '',
    category: item.category ?? '',
    title: item.title ?? '',
    description: item.description ?? '',
    stack: [...(item.stack ?? [])],
    imageUrl: item.imageUrl ?? '',
    link: item.link ?? '',
  };
}

function isDraftComplete(draft: WorkDraft): boolean {
  return Boolean(draft.title.trim() && draft.imageUrl.trim());
}

/** Solid chip that stays legible on top of any cover image. */
function MediaAction({
  label,
  onClick,
  children,
  disabled = false,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-sm backdrop-blur transition-colors duration-200 disabled:pointer-events-none disabled:opacity-30 ${
        danger ? 'hover:bg-red-500 hover:text-white' : 'hover:bg-neutral-900 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function linkLabel(url: string): string {
  try {
    return new URL(toAbsoluteHttpUrl(url) ?? url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

const GHOST_BUTTON_CLASS =
  'inline-flex h-9 items-center rounded-full px-4 text-[14px] font-medium text-neutral-600 transition-colors duration-200 hover:bg-black/[0.04] hover:text-black disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-white/[0.06] dark:hover:text-white';
const PRIMARY_BUTTON_CLASS =
  'inline-flex h-9 items-center gap-2 rounded-full bg-[#FF5722] px-5 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#E64A19] disabled:pointer-events-none disabled:opacity-40';

function WorkField({
  label,
  children,
  control = true,
}: {
  label: string;
  children: ReactNode;
  /** Wrapping multiple buttons in a <label> would forward clicks to the first one. */
  control?: boolean;
}) {
  const Wrapper = control ? 'label' : 'div';
  return (
    <StudioUnderline>
      <Wrapper className={STUDIO_LABEL_CLASS}>
        {label}
        <span className="mt-3 block">{children}</span>
      </Wrapper>
    </StudioUnderline>
  );
}

const workInputClass = `${STUDIO_BARE_INPUT_CLASS} ${STUDIO_VALUE_CLASS}`;

function StackPicker({
  options,
  selected,
  onChange,
  disabled,
}: {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const available = parseSpecialtyTags(options);
  const chosen = parseSpecialtyTags(selected);

  if (available.length === 0) {
    return (
      <p className={`pb-3 ${STUDIO_SECONDARY_CLASS}`}>Add tags in Information → Stack first, then pick them here.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 pb-3">
      {available.map((tag) => {
        const active = chosen.some((item) => item.toLowerCase() === tag.toLowerCase());
        return (
          <button
            key={tag}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (active) {
                onChange(chosen.filter((item) => item.toLowerCase() !== tag.toLowerCase()));
              } else if (chosen.length < 12) {
                onChange([...chosen, tag]);
              }
            }}
            className={`rounded-full border px-3 py-1 text-[14px] transition-colors duration-200 ${
              active
                ? 'border-black bg-black font-medium text-white dark:border-white dark:bg-white dark:text-black'
                : 'border-neutral-300 font-normal text-neutral-700 hover:border-neutral-900 hover:text-black dark:border-white/20 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white'
            } disabled:opacity-40`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

export function PortfolioShowcaseChrome({
  stackOptions = [],
  composeOpen: composeOpenProp,
  onComposeOpenChange: onComposeOpenChangeProp,
  pickerOpen,
  onPickerOpenChange,
  onSelectionCountChange,
  onCancelEditMode: _onCancelEditMode,
  onRegisterDoneConfirm,
  onHasChangesChange,
}: {
  /** Stack tags from the user profile (formerly Skills). */
  stackOptions?: string[];
  composeOpen?: boolean;
  onComposeOpenChange?: (open: boolean) => void;
  onSelectionCountChange?: (count: number) => void;
  onCancelEditMode?: () => void;
  onRegisterDoneConfirm?: (fn: (() => Promise<void>) | null) => void;
  onHasChangesChange?: (hasChanges: boolean) => void;
  /** @deprecated Prefer composeOpen */
  pickerOpen?: boolean;
  onPickerOpenChange?: (open: boolean) => void;
  actionsVisible?: boolean;
  deleteMode?: boolean;
  onDeleteModeChange?: (active: boolean) => void;
}) {
  const composeOpen = composeOpenProp ?? pickerOpen ?? false;
  const onComposeOpenChange = onComposeOpenChangeProp ?? onPickerOpenChange;
  const composeStartedRef = useRef(false);
  const [works, setWorks] = useState<ProfilePortfolioWork[]>([]);
  const [profileStack, setProfileStack] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<WorkDraft | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const composeCardRef = useRef<HTMLDivElement>(null);

  const stackChoices = useMemo(() => {
    const merged = [...parseSpecialtyTags(stackOptions), ...parseSpecialtyTags(profileStack)];
    const seen = new Set<string>();
    return merged.filter((tag) => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [stackOptions, profileStack]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<CreatorProfileDto>('/api/creator/profile');
      const nextWorks = parseWorks(res.data.portfolioWorks);
      setWorks(nextWorks);
      setProfileStack(parseSpecialtyTags(res.data.specialtyTags));
      onSelectionCountChange?.(nextWorks.length);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load portfolio works.'));
    } finally {
      setLoading(false);
    }
  }, [onSelectionCountChange]);

  useEffect(() => {
    void load();
  }, [load]);

  const persist = useCallback(
    async (next: ProfilePortfolioWork[]) => {
      const cleaned = next
        .map((item, index) => normalizeWork(item, index))
        .filter((item) => item.title.trim() && item.imageUrl.trim())
        .slice(0, MAX_PORTFOLIO_WORKS)
        .map((item, index) => ({
          id: item.id,
          sortOrder: index,
          role: item.role?.trim() || null,
          category: item.category?.trim() || null,
          title: item.title.trim(),
          description: item.description?.trim() || null,
          stack: parseSpecialtyTags(item.stack).slice(0, 12),
          imageUrl: item.imageUrl.trim(),
          link: (() => {
            const raw = item.link?.trim() || '';
            if (!raw) return null;
            return toAbsoluteHttpUrl(raw) ?? raw;
          })(),
        }));

      setSaving(true);
      setError(null);
      try {
        const updated = await updateCreatorProfile({ portfolioWorks: cleaned });
        const saved = parseWorks(updated.portfolioWorks ?? cleaned);
        setWorks(saved);
        onSelectionCountChange?.(saved.length);
        return saved;
      } catch (e) {
        setError(getApiErrorMessage(e, 'Unable to save portfolio work.'));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [onSelectionCountChange]
  );

  // Parent "+" opens compose
  useEffect(() => {
    if (!composeOpen) {
      composeStartedRef.current = false;
      return;
    }
    if (composeStartedRef.current || composing || editingId) return;
    if (works.length >= MAX_PORTFOLIO_WORKS) {
      pushInsertionLimitFeedback({ limit: MAX_PORTFOLIO_WORKS, unit: 'portfolio works' });
      onComposeOpenChange?.(false);
      return;
    }
    composeStartedRef.current = true;
    const id = crypto.randomUUID();
    const blank: ProfilePortfolioWork = {
      id,
      sortOrder: works.length,
      role: '',
      category: '',
      title: '',
      description: '',
      stack: [],
      imageUrl: '',
      link: '',
    };
    setWorks((current) => [...current, blank]);
    setEditingId(id);
    setDraft(EMPTY_DRAFT);
    setComposing(true);
    setPendingDeleteId(null);
  }, [composeOpen, composing, editingId, works.length, onComposeOpenChange]);

  useEffect(() => {
    onHasChangesChange?.(Boolean(editingId && draft));
  }, [editingId, draft, onHasChangesChange]);

  useEffect(() => {
    onRegisterDoneConfirm?.(null);
    return () => onRegisterDoneConfirm?.(null);
  }, [onRegisterDoneConfirm]);

  const busy = saving || uploading || loading;

  const startEdit = (item: ProfilePortfolioWork) => {
    if (busy || composing) return;
    setPendingDeleteId(null);
    setEditingId(item.id);
    setDraft(toDraft(item));
  };

  const cancelEdit = () => {
    if (busy) return;
    const wasComposing = composing;
    const id = editingId;
    setEditingId(null);
    setDraft(null);
    setComposing(false);
    onComposeOpenChange?.(false);
    if (wasComposing && id) {
      setWorks((current) => current.filter((item) => item.id !== id));
    }
  };

  const confirmEdit = async () => {
    if (!editingId || !draft || busy) return;
    if (!isDraftComplete(draft)) {
      setError('Title and image are required.');
      return;
    }
    const next = works.map((item) =>
      item.id === editingId
        ? normalizeWork(
            {
              ...item,
              role: draft.role,
              category: draft.category,
              title: draft.title,
              description: draft.description,
              stack: draft.stack,
              imageUrl: draft.imageUrl,
              link: draft.link,
            },
            item.sortOrder
          )
        : item
    );
    const previousCount = works.filter((w) => w.title.trim() && w.imageUrl.trim()).length;
    try {
      const saved = await persist(next);
      setEditingId(null);
      setDraft(null);
      setComposing(false);
      onComposeOpenChange?.(false);
      pushFlashFeedback({
        variant: 'success',
        title: saved.length > previousCount ? 'Portfolio work added' : 'Portfolio work updated',
      });
    } catch {
      /* error already set */
    }
  };

  const removeWork = async (id: string) => {
    if (busy) return;
    const next = works.filter((item) => item.id !== id);
    try {
      await persist(next);
      setPendingDeleteId(null);
      pushFlashFeedback({ variant: 'success', title: 'Portfolio work deleted' });
    } catch {
      /* error already set */
    }
  };

  const moveWork = async (index: number, direction: -1 | 1) => {
    if (busy || editingId) return;
    const target = index + direction;
    if (target < 0 || target >= works.length) return;
    const next = [...works];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    try {
      await persist(next);
    } catch {
      await load();
    }
  };

  const onImageFile = async (file: File | null) => {
    if (!file || !draft) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadContentMedia(file);
      setDraft((current) => (current ? { ...current, imageUrl: url } : current));
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to upload image.'));
    } finally {
      setUploading(false);
    }
  };

  const filledWorks = works.filter((item) => item.title.trim() && item.imageUrl.trim());
  const displayWorks =
    composing && editingId
      ? works
      : works.filter((item) => item.title.trim() && item.imageUrl.trim() || item.id === editingId);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const atLimit = filledWorks.length >= MAX_PORTFOLIO_WORKS;
  const requestAdd = () => {
    if (busy || editingId) return;
    if (atLimit) {
      pushInsertionLimitFeedback({ limit: MAX_PORTFOLIO_WORKS, unit: 'portfolio works' });
      return;
    }
    onComposeOpenChange?.(true);
  };

  return (
    <div className="pb-10 pt-3">
      <StudioSectionHeader label={`Works · ${String(filledWorks.length).padStart(2, '0')}`}>
        <span className={STUDIO_SECONDARY_CLASS}>
          {filledWorks.length} of {MAX_PORTFOLIO_WORKS}
        </span>
        <StudioIconAction icon="add" label="Add work" onClick={requestAdd} disabled={busy || Boolean(editingId) || atLimit} />
      </StudioSectionHeader>

      {error ? (
        <div className="mb-6">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      ) : null}

      {displayWorks.length === 0 && !composing ? (
        <button
          type="button"
          onClick={requestAdd}
          className={`py-8 ${STUDIO_EMPTY_CLASS} transition-colors hover:text-[#FF5722]`}
        >
          No work yet — add your first project.
        </button>
      ) : (
        <div className="grid grid-cols-1 gap-x-10 gap-y-14 pt-2 sm:grid-cols-2">
          {displayWorks.map((work, index) => {
            const editing = editingId === work.id && draft != null;
            const confirmingDelete = pendingDeleteId === work.id;
            const showChrome = !editingId && !composing;
            const coverUrl = editing ? draft?.imageUrl : work.imageUrl;

            return (
              <article
                key={work.id}
                ref={editing ? composeCardRef : undefined}
                style={editing ? STUDIO_FLOAT_IN_STYLE : undefined}
                className={`group/item relative ${
                  editing ? 'grid gap-x-10 gap-y-8 sm:col-span-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]' : 'flex flex-col'
                }`}
              >
                <div className={editing ? 'md:sticky md:top-6 md:self-start' : ''}>
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
                    {coverUrl ? (
                      <ProductThumbnailMedia
                        url={coverUrl}
                        alt=""
                        fit="cover"
                        className={`h-full w-full transition-transform duration-700 ${
                          editing ? '' : 'group-hover/item:scale-[1.02]'
                        }`}
                      />
                    ) : null}

                    {editing ? (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={IMAGE_ACCEPT}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            e.target.value = '';
                            void onImageFile(file);
                          }}
                        />
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => fileInputRef.current?.click()}
                          aria-label={coverUrl ? 'Replace cover image' : 'Upload cover image'}
                          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 transition-colors duration-200 ${
                            coverUrl
                              ? 'bg-black/0 text-transparent hover:bg-black/45 hover:text-white focus-visible:bg-black/45 focus-visible:text-white'
                              : 'm-0 rounded-xl border border-dashed border-neutral-300 text-neutral-500 hover:border-[#FF5722] hover:text-[#FF5722] dark:border-white/15 dark:text-neutral-400'
                          }`}
                        >
                          {uploading ? (
                            <LoadingSpinner size="md" />
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faImage} className="h-5 w-5" />
                              <span className="text-[14px] font-medium">
                                {coverUrl ? 'Replace cover' : 'Upload a cover image'}
                              </span>
                              {coverUrl ? null : (
                                <span className="text-[13px] opacity-70">JPG, PNG or WebP</span>
                              )}
                            </>
                          )}
                        </button>
                      </>
                    ) : null}

                    {showChrome && !confirmingDelete ? (
                      <>
                        <div className={`absolute left-3 top-3 z-10 inline-flex gap-1.5 ${cardActionVisibilityClass}`}>
                          <MediaAction
                            label="Move earlier"
                            disabled={busy || index === 0}
                            onClick={() => void moveWork(index, -1)}
                          >
                            <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" fixedWidth />
                          </MediaAction>
                          <MediaAction
                            label="Move later"
                            disabled={busy || index >= displayWorks.length - 1}
                            onClick={() => void moveWork(index, 1)}
                          >
                            <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" fixedWidth />
                          </MediaAction>
                        </div>
                        <div className={`absolute right-3 top-3 z-10 inline-flex gap-1.5 ${cardActionVisibilityClass}`}>
                          <MediaAction label="Edit work" disabled={busy} onClick={() => startEdit(work)}>
                            <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
                          </MediaAction>
                          <MediaAction
                            label="Delete work"
                            danger
                            disabled={busy}
                            onClick={() => setPendingDeleteId(work.id)}
                          >
                            <FontAwesomeIcon icon={faTrashCan} className="h-3.5 w-3.5" fixedWidth />
                          </MediaAction>
                        </div>
                      </>
                    ) : null}

                    {confirmingDelete ? (
                      <div
                        style={STUDIO_FLOAT_IN_STYLE}
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/70 p-6 text-center backdrop-blur-sm"
                      >
                        <p className="text-[15px] font-semibold text-white">Delete this work?</p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setPendingDeleteId(null)}
                            className="inline-flex h-9 items-center rounded-full px-4 text-[14px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void removeWork(work.id)}
                            className="inline-flex h-9 items-center gap-2 rounded-full bg-red-500 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-40"
                          >
                            {saving ? <LoadingSpinner size="sm" /> : null}
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className={editing ? 'min-w-0' : 'flex flex-1 flex-col gap-2.5 pt-5'}>
                  {editing && draft ? (
                    <div className="grid gap-y-8">
                      <WorkField label="Title">
                        <input
                          type="text"
                          value={draft.title}
                          onChange={(e) =>
                            setDraft((c) => (c ? { ...c, title: e.target.value } : c))
                          }
                          placeholder="Project title"
                          className={workInputClass}
                          autoFocus
                          disabled={busy}
                          maxLength={120}
                        />
                      </WorkField>
                      <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
                        <WorkField label="Role">
                          <input
                            type="text"
                            value={draft.role}
                            onChange={(e) =>
                              setDraft((c) => (c ? { ...c, role: e.target.value } : c))
                            }
                            placeholder="e.g. Lead designer"
                            className={workInputClass}
                            disabled={busy}
                            maxLength={80}
                          />
                        </WorkField>
                        <WorkField label="Category">
                          <input
                            type="text"
                            value={draft.category}
                            onChange={(e) =>
                              setDraft((c) => (c ? { ...c, category: e.target.value } : c))
                            }
                            placeholder="e.g. Business, Lifestyle"
                            className={workInputClass}
                            disabled={busy}
                            maxLength={80}
                          />
                        </WorkField>
                      </div>
                      <WorkField label="Description">
                        <textarea
                          value={draft.description}
                          onChange={(e) =>
                            setDraft((c) => (c ? { ...c, description: e.target.value } : c))
                          }
                          placeholder="Short description"
                          rows={2}
                          className={`${workInputClass} resize-none`}
                          disabled={busy}
                          maxLength={2000}
                        />
                      </WorkField>
                      <WorkField label="Stack" control={false}>
                        <StackPicker
                          options={stackChoices}
                          selected={draft.stack}
                          onChange={(stack) => setDraft((c) => (c ? { ...c, stack } : c))}
                          disabled={busy}
                        />
                      </WorkField>
                      <WorkField label="Link">
                        <input
                          type="url"
                          value={draft.link}
                          onChange={(e) =>
                            setDraft((c) => (c ? { ...c, link: e.target.value } : c))
                          }
                          placeholder="https://…"
                          className={workInputClass}
                          disabled={busy}
                          maxLength={500}
                        />
                      </WorkField>

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <p className={STUDIO_SECONDARY_CLASS}>
                          {isDraftComplete(draft) ? '' : 'A title and a cover image are required.'}
                        </p>
                        <div className="flex items-center gap-2">
                          <button type="button" disabled={busy} onClick={cancelEdit} className={GHOST_BUTTON_CLASS}>
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={busy || !isDraftComplete(draft)}
                            onClick={() => void confirmEdit()}
                            className={PRIMARY_BUTTON_CLASS}
                          >
                            {saving ? <LoadingSpinner size="sm" /> : null}
                            {composing ? 'Add work' : 'Save work'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0">
                        <h3 className="truncate text-[17px] font-semibold text-black dark:text-neutral-100">
                          {work.title || 'Untitled'}
                        </h3>
                        {work.category || work.role ? (
                          <StudioSlashLine
                            className="mt-1"
                            items={[work.category, work.role]
                              .filter((part): part is string => Boolean(part))
                              .map((part) => (
                                <span key={part} className={STUDIO_SECONDARY_CLASS}>
                                  {part}
                                </span>
                              ))}
                          />
                        ) : null}
                      </div>
                      {work.description ? (
                        <p className="line-clamp-2 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                          {work.description}
                        </p>
                      ) : null}
                      {work.stack?.length || work.link ? (
                        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                          {work.stack?.length ? (
                            <StudioSlashLine
                              className=""
                              items={work.stack.map((tag) => (
                                <span key={tag} className="text-[14px] text-neutral-800 dark:text-neutral-200">
                                  {tag}
                                </span>
                              ))}
                            />
                          ) : (
                            <span />
                          )}
                          {work.link ? (
                            <a
                              href={work.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-medium text-neutral-800 transition-colors duration-200 hover:text-[#FF5722] dark:text-neutral-200"
                            >
                              {linkLabel(work.link)}
                              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-2.5 w-2.5 opacity-60" />
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
