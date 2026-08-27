'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faPenToSquare,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
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
import { portfolioInlineInputClass } from '@/components/portfolio/portfolio-section-shared';
import { ProfileSectionItemCount } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';
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
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100';

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

function IconButton({
  label,
  onClick,
  children,
  disabled = false,
  tone = 'neutral',
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  tone?: 'neutral' | 'confirm' | 'cancel' | 'danger';
}) {
  const toneClass =
    tone === 'confirm'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'
      : tone === 'cancel'
        ? 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
        : tone === 'danger'
          ? 'border-neutral-200 bg-white text-neutral-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400'
          : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400';

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 ${toneClass}`}
    >
      {children}
    </button>
  );
}

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
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Add tags in Information → Stack first, then select them here.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
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
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
              active
                ? 'bg-[#EA580C] text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'
            } disabled:opacity-50`}
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

  return (
    <div className="space-y-4 pb-2">
      {error ? <ErrorAlert message={error} onDismiss={() => setError(null)} /> : null}

      <ProfileSectionItemCount
        count={filledWorks.length}
        limit={MAX_PORTFOLIO_WORKS}
        unit="portfolio works"
      />

      {displayWorks.length === 0 && !composing ? (
        <p className="py-10 text-center text-sm italic text-neutral-500 dark:text-neutral-400">
          No portfolio works yet. Click + to create one manually.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {displayWorks.map((work, index) => {
            const editing = editingId === work.id && draft != null;
            const confirmingDelete = pendingDeleteId === work.id;
            const showChrome = !composing || editing;

            return (
              <article
                key={work.id}
                ref={editing ? composeCardRef : undefined}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  {(editing ? draft?.imageUrl : work.imageUrl) ? (
                    <ProductThumbnailMedia
                      url={(editing ? draft?.imageUrl : work.imageUrl) || ''}
                      alt=""
                      fit="cover"
                      className="h-full w-full"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-neutral-400">
                      Preview
                    </span>
                  )}

                  {editing ? (
                    <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5">
                      <IconButton
                        label="Save"
                        tone="confirm"
                        disabled={busy || !draft || !isDraftComplete(draft)}
                        onClick={() => void confirmEdit()}
                      >
                        {saving ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
                        )}
                      </IconButton>
                      <IconButton label="Cancel" tone="cancel" disabled={busy} onClick={cancelEdit}>
                        <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                      </IconButton>
                    </div>
                  ) : showChrome ? (
                    <div
                      className={`absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 ${
                        confirmingDelete ? 'opacity-100' : cardActionVisibilityClass
                      }`}
                    >
                      {confirmingDelete ? (
                        <>
                          <IconButton
                            label="Confirm delete"
                            tone="confirm"
                            disabled={busy}
                            onClick={() => void removeWork(work.id)}
                          >
                            {saving ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
                            )}
                          </IconButton>
                          <IconButton
                            label="Cancel"
                            tone="cancel"
                            disabled={busy}
                            onClick={() => setPendingDeleteId(null)}
                          >
                            <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton
                            label="Edit work"
                            disabled={busy}
                            onClick={() => startEdit(work)}
                          >
                            <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
                          </IconButton>
                          <IconButton
                            label="Delete work"
                            tone="danger"
                            disabled={busy}
                            onClick={() => {
                              setEditingId(null);
                              setDraft(null);
                              setPendingDeleteId(work.id);
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" fixedWidth />
                          </IconButton>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  {editing && draft ? (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Role
                        </label>
                        <input
                          type="text"
                          value={draft.role}
                          onChange={(e) =>
                            setDraft((c) => (c ? { ...c, role: e.target.value } : c))
                          }
                          placeholder="e.g. Lead designer"
                          className={`${portfolioInlineInputClass} w-full`}
                          disabled={busy}
                          maxLength={80}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Category
                        </label>
                        <input
                          type="text"
                          value={draft.category}
                          onChange={(e) =>
                            setDraft((c) => (c ? { ...c, category: e.target.value } : c))
                          }
                          placeholder="e.g. Business, Lifestyle"
                          className={`${portfolioInlineInputClass} w-full`}
                          disabled={busy}
                          maxLength={80}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Title
                        </label>
                        <input
                          type="text"
                          value={draft.title}
                          onChange={(e) =>
                            setDraft((c) => (c ? { ...c, title: e.target.value } : c))
                          }
                          placeholder="Project title"
                          className={`${portfolioInlineInputClass} w-full text-base font-bold`}
                          autoFocus
                          disabled={busy}
                          maxLength={120}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Description
                        </label>
                        <textarea
                          value={draft.description}
                          onChange={(e) =>
                            setDraft((c) => (c ? { ...c, description: e.target.value } : c))
                          }
                          placeholder="Short description"
                          rows={3}
                          className={`${portfolioInlineInputClass} w-full resize-y`}
                          disabled={busy}
                          maxLength={2000}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Stack
                        </label>
                        <StackPicker
                          options={stackChoices}
                          selected={draft.stack}
                          onChange={(stack) => setDraft((c) => (c ? { ...c, stack } : c))}
                          disabled={busy}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Image / thumbnail
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
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
                            className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
                          >
                            {uploading ? 'Uploading…' : draft.imageUrl ? 'Replace image' : 'Upload image'}
                          </button>
                          {draft.imageUrl ? (
                            <span className="truncate text-xs text-emerald-600 dark:text-emerald-400">
                              Image ready
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Link
                        </label>
                        <input
                          type="url"
                          value={draft.link}
                          onChange={(e) =>
                            setDraft((c) => (c ? { ...c, link: e.target.value } : c))
                          }
                          placeholder="https://…"
                          className={`${portfolioInlineInputClass} w-full`}
                          disabled={busy}
                          maxLength={500}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1">
                          <h3 className="truncate text-base font-bold text-neutral-900 dark:text-white">
                            {work.title || 'Untitled'}
                          </h3>
                          {work.category ? (
                            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                              {work.category}
                            </p>
                          ) : null}
                          {work.role ? (
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">{work.role}</p>
                          ) : null}
                        </div>
                        {!editingId ? (
                          <div className="flex shrink-0 flex-col gap-1">
                            <button
                              type="button"
                              disabled={busy || index === 0}
                              onClick={() => void moveWork(index, -1)}
                              className="rounded border border-neutral-200 px-1.5 text-xs disabled:opacity-30 dark:border-neutral-700"
                              aria-label="Move up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              disabled={busy || index >= displayWorks.length - 1}
                              onClick={() => void moveWork(index, 1)}
                              className="rounded border border-neutral-200 px-1.5 text-xs disabled:opacity-30 dark:border-neutral-700"
                              aria-label="Move down"
                            >
                              ↓
                            </button>
                          </div>
                        ) : null}
                      </div>
                      {work.description ? (
                        <p className="line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
                          {work.description}
                        </p>
                      ) : null}
                      {work.stack?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {work.stack.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {work.link ? (
                        <a
                          href={work.link}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate text-xs font-medium text-[#EA580C] hover:underline"
                        >
                          {work.link}
                        </a>
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
