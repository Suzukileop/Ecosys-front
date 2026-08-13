'use client';

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faPenToSquare,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { portfolioInlineInputClass } from '@/components/portfolio/portfolio-section-shared';
import { ProfileSectionItemCount } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';
import { MAX_SERVICES } from '@/components/creator/studio/ProfileServicesField';

export type PortfolioServiceItem = {
  id: string;
  title: string;
  description: string;
  basePriceCents: number | null;
  deadline: string;
  tasks: Array<{ value: string }>;
};

export type PortfolioServiceDraft = {
  title: string;
  description: string;
  basePriceCents: number | null;
  deadline: string;
  tasks: Array<{ value: string }>;
};

const MAX_TASKS_PER_SERVICE = 12;

/** Visible on touch devices; hover/focus only on fine-pointer desktops. */
const cardActionVisibilityClass =
  'opacity-100 transition-opacity ' +
  '[@media(hover:hover)_and_(pointer:fine)]:opacity-0 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100';

function isFreePrice(cents: number | null | undefined): boolean {
  return cents != null && !Number.isNaN(cents) && cents === 0;
}

function formatPrice(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents)) return '';
  if (cents === 0) return 'Free';
  return `${(cents / 100).toFixed(2)} €`;
}

function eurosInputFromCents(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents) || cents === 0) return '';
  const euros = cents / 100;
  if (!Number.isFinite(euros)) return '';
  return String(Number(euros.toFixed(2)));
}

function centsFromEurosInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(',', '.');
  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) return null;
  return Math.round(parsed * 100);
}

function toDraft(item: PortfolioServiceItem): PortfolioServiceDraft {
  return {
    title: item.title,
    description: item.description ?? '',
    basePriceCents: item.basePriceCents,
    deadline: item.deadline ?? '',
    tasks: (item.tasks ?? []).map((task) => ({ value: task.value })),
  };
}

function normalizeDraft(draft: PortfolioServiceDraft): PortfolioServiceDraft {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    basePriceCents: draft.basePriceCents,
    deadline: draft.deadline.trim(),
    tasks: draft.tasks
      .map((task) => ({ value: task.value.trim() }))
      .filter((task) => task.value.length > 0),
  };
}

function draftsEqual(left: PortfolioServiceDraft, right: PortfolioServiceDraft): boolean {
  const a = normalizeDraft(left);
  const b = normalizeDraft(right);
  if (
    a.title !== b.title ||
    a.description !== b.description ||
    a.basePriceCents !== b.basePriceCents ||
    a.deadline !== b.deadline ||
    a.tasks.length !== b.tasks.length
  ) {
    return false;
  }
  return a.tasks.every((task, index) => task.value === b.tasks[index]?.value);
}

function isServiceEmpty(draft: PortfolioServiceDraft): boolean {
  const normalized = normalizeDraft(draft);
  return (
    !normalized.title &&
    !normalized.description &&
    !normalized.deadline &&
    normalized.basePriceCents == null &&
    normalized.tasks.length === 0
  );
}

function TaskBullet() {
  return (
    <span
      className="mt-[0.3rem] inline-flex h-3 w-3 shrink-0 items-center justify-center text-[#EA580C]"
      aria-hidden
    >
      <svg viewBox="0 0 12 12" className="h-full w-full" fill="currentColor">
        <path d="M3.2 1.4v9.2L10.4 6 3.2 1.4z" />
      </svg>
    </span>
  );
}

function IconButton({
  label,
  onClick,
  children,
  active = false,
  disabled = false,
  tone = 'neutral',
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
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
          : active
            ? 'border-[#F97316]/40 bg-[#FFF7ED] text-[#EA580C] dark:border-[#F97316]/30 dark:bg-[#F97316]/10 dark:text-[#FB923C]'
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

function ServiceTasksEditor({
  tasks,
  onChange,
  disabled,
}: {
  tasks: Array<{ value: string }>;
  onChange: (next: Array<{ value: string }>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      {tasks.map((task, taskIndex) => (
        <div key={`task-${taskIndex}`} className="flex items-center gap-2">
          <input
            type="text"
            value={task.value}
            onChange={(event) =>
              onChange(
                tasks.map((item, index) =>
                  index === taskIndex ? { value: event.target.value } : item
                )
              )
            }
            placeholder={`Task ${taskIndex + 1}`}
            className={`${portfolioInlineInputClass} min-w-0 flex-1 font-medium`}
            disabled={disabled}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(tasks.filter((_, index) => index !== taskIndex))}
            className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={disabled || tasks.length >= MAX_TASKS_PER_SERVICE}
        onClick={() => onChange([...tasks, { value: '' }])}
        className="text-sm font-semibold text-[#EA580C] hover:text-[#C2410C] disabled:opacity-40"
      >
        + Add task
      </button>
    </div>
  );
}

export function PortfolioServicesReadOnly({
  items,
  onItemSave,
  onItemsSave: _onItemsSave,
  onRemoveItem,
  fieldSaving = false,
  actionsVisible: _actionsVisible = false,
  composeAdd = false,
  deleteMode: _deleteMode = false,
  onDeleteModeChange: _onDeleteModeChange,
  onCancelNewItem,
  sectionRootRef: _sectionRootRef,
  onGlobalHasChangesChange,
  onRegisterGlobalConfirm,
}: {
  items: PortfolioServiceItem[];
  onItemSave?: (index: number, next: PortfolioServiceDraft) => Promise<void>;
  onItemsSave?: (next: PortfolioServiceDraft[]) => Promise<void>;
  onRemoveItem?: (index: number) => Promise<void> | void;
  fieldSaving?: boolean;
  /** @deprecated Per-card actions; kept for call-site compatibility. */
  actionsVisible?: boolean;
  /** Add-service compose without a section Edit mode. */
  composeAdd?: boolean;
  /** @deprecated Delete is per-card; kept for call-site compatibility. */
  deleteMode?: boolean;
  onDeleteModeChange?: (active: boolean) => void;
  onCancelNewItem?: () => void;
  sectionRootRef?: RefObject<HTMLElement | null>;
  onGlobalHasChangesChange?: (hasChanges: boolean) => void;
  onRegisterGlobalConfirm?: (confirm: (() => Promise<void>) | null) => void;
}) {
  void _sectionRootRef;
  const canEdit = Boolean(onItemSave);
  const canDelete = Boolean(onRemoveItem);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<PortfolioServiceDraft[]>(() => items.map(toDraft));
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const previousCountRef = useRef(items.length);
  const editingCardRef = useRef<HTMLElement | null>(null);
  const cancelEditRef = useRef<() => Promise<void>>(async () => undefined);

  const syncDraftsFromItems = () => {
    setDrafts(items.map(toDraft));
  };

  const composing = editingIndex != null;
  const composingNewItem =
    Boolean(composeAdd) &&
    composing &&
    editingIndex != null &&
    isServiceEmpty(
      toDraft(
        items[editingIndex] ?? {
          id: '',
          title: '',
          description: '',
          basePriceCents: null,
          deadline: '',
          tasks: [],
        }
      )
    );

  useEffect(() => {
    if (!composingNewItem) return;
    editingCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [composingNewItem, editingIndex]);

  useEffect(() => {
    onGlobalHasChangesChange?.(false);
  }, [onGlobalHasChangesChange]);

  useEffect(() => {
    onRegisterGlobalConfirm?.(null);
    return () => onRegisterGlobalConfirm?.(null);
  }, [onRegisterGlobalConfirm]);

  useEffect(() => {
    if (!composeAdd) {
      setPendingDeleteIndex(null);
      if (editingIndex == null) syncDraftsFromItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeAdd]);

  useEffect(() => {
    if (editingIndex != null || composeAdd) return;
    syncDraftsFromItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    const previous = previousCountRef.current;
    previousCountRef.current = items.length;
    if (!composeAdd || fieldSaving) return;
    if (items.length > previous) {
      const nextIndex = items.length - 1;
      if (isServiceEmpty(toDraft(items[nextIndex]))) {
        setDrafts(items.map(toDraft));
        setEditingIndex(nextIndex);
        setPendingDeleteIndex(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, composeAdd]);

  useEffect(() => {
    if (!composeAdd || fieldSaving) return;
    if (editingIndex != null) return;
    const lastIndex = items.length - 1;
    if (lastIndex < 0) return;
    if (isServiceEmpty(toDraft(items[lastIndex]))) {
      setDrafts(items.map(toDraft));
      setEditingIndex(lastIndex);
      setPendingDeleteIndex(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeAdd, items.length]);

  const startEdit = (index: number) => {
    if (!canEdit || fieldSaving) return;
    setPendingDeleteIndex(null);
    syncDraftsFromItems();
    setEditingIndex(index);
  };

  const cancelEdit = async () => {
    if (fieldSaving || editingIndex == null) return;
    const original = items[editingIndex];
    const wasEmpty = original ? isServiceEmpty(toDraft(original)) : true;
    setEditingIndex(null);
    syncDraftsFromItems();
    if (wasEmpty) {
      onCancelNewItem?.();
    }
  };
  cancelEditRef.current = cancelEdit;

  useEffect(() => {
    if (!composing) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (editingCardRef.current?.contains(target)) return;
      void cancelEditRef.current();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [composing]);

  const updateDraft = (index: number, patch: Partial<PortfolioServiceDraft>) => {
    setDrafts((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  };

  const fieldHasChanges =
    editingIndex != null &&
    drafts[editingIndex] != null &&
    items[editingIndex] != null &&
    !draftsEqual(drafts[editingIndex], toDraft(items[editingIndex]));

  const confirmEdit = async () => {
    if (editingIndex == null || !onItemSave || fieldSaving) return;
    const draft = drafts[editingIndex];
    if (!draft) return;
    const normalized = normalizeDraft(draft);
    if (!normalized.title) {
      setEditingIndex(null);
      if (isServiceEmpty(draft)) {
        onCancelNewItem?.();
        return;
      }
      if (onRemoveItem) await onRemoveItem(editingIndex);
      return;
    }
    if (!fieldHasChanges) {
      setEditingIndex(null);
      return;
    }
    try {
      await onItemSave(editingIndex, normalized);
      setEditingIndex(null);
    } catch {
      // Parent surfaces the error.
    }
  };

  const visibleEntries = items
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item, index }) => index === editingIndex || Boolean(item.title.trim()) || composeAdd
    );

  // Keep the new-service composer at the top so title + confirm/cancel stay visible.
  const orderedEntries =
    composingNewItem && editingIndex != null
      ? [
          ...visibleEntries.filter((entry) => entry.index === editingIndex),
          ...visibleEntries.filter((entry) => entry.index !== editingIndex),
        ]
      : visibleEntries;

  if (orderedEntries.length === 0 && !composeAdd) {
    return (
      <div className="-mx-5 -mb-1 -mt-5 rounded-none px-5 py-5 sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-6">
        <ProfileSectionItemCount
          count={items.filter((item) => item.title.trim()).length}
          limit={MAX_SERVICES}
          unit="services"
          className="mb-6"
        />
        <p className="text-center text-sm italic text-neutral-500 dark:text-neutral-400">
          No services yet. Click Add service to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="-mx-5 -mb-1 -mt-5 px-5 pb-8 pt-5 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pb-10 sm:pt-6">
      <ProfileSectionItemCount
        count={items.filter((item) => item.title.trim()).length}
        limit={MAX_SERVICES}
        unit="services"
        className="mb-5"
      />
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-6">
        {orderedEntries.map(({ item, index }) => {
          const draft = drafts[index] ?? toDraft(item);
          const editing = Boolean(canEdit && editingIndex === index);
          const display = editing ? draft : toDraft(item);
          const taskValues = display.tasks.map((task) => task.value.trim()).filter(Boolean);
          const priceDisplay = formatPrice(display.basePriceCents);
          const confirming = fieldSaving && editingIndex === index;
          const cardHasChanges = editingIndex === index && !draftsEqual(draft, toDraft(item));
          const isNewComposer =
            composingNewItem && editingIndex === index && editing;
          const showConfirmActions = Boolean(editing && onItemSave);
          const showCardChrome = Boolean((canEdit || canDelete) && !editing);
          const titleTrimmed = draft.title.trim();
          const canConfirmNew = Boolean(isNewComposer && titleTrimmed);
          const canConfirmExisting = Boolean(!isNewComposer && titleTrimmed && cardHasChanges);
          const canConfirm = canConfirmNew || canConfirmExisting;

          return (
            <article
              key={item.id}
              ref={editing ? editingCardRef : undefined}
              className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-neutral-800 dark:bg-[#121212] ${
                isNewComposer ? 'sm:col-span-2' : ''
              }`}
            >
              {showCardChrome ? (
                <div
                  className={`absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 ${
                    pendingDeleteIndex === index ? 'opacity-100' : cardActionVisibilityClass
                  }`}
                >
                  {pendingDeleteIndex === index ? (
                    <>
                      <IconButton
                        label="Confirm delete service"
                        tone="confirm"
                        disabled={fieldSaving}
                        onClick={() => {
                          void (async () => {
                            if (!onRemoveItem) return;
                            await onRemoveItem(index);
                            setPendingDeleteIndex(null);
                            setEditingIndex(null);
                          })();
                        }}
                      >
                        {fieldSaving && pendingDeleteIndex === index ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
                        )}
                      </IconButton>
                      <IconButton
                        label="Cancel"
                        tone="cancel"
                        disabled={fieldSaving}
                        onClick={() => setPendingDeleteIndex(null)}
                      >
                        <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      {canEdit ? (
                        <IconButton
                          label="Edit service"
                          disabled={fieldSaving}
                          onClick={() => startEdit(index)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
                        </IconButton>
                      ) : null}
                      {canDelete ? (
                        <IconButton
                          label="Delete service"
                          tone="danger"
                          disabled={fieldSaving}
                          onClick={() => {
                            setEditingIndex(null);
                            setPendingDeleteIndex(index);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" fixedWidth />
                        </IconButton>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}

              <div
                className={`px-5 pt-5 ${
                  isNewComposer
                    ? 'sticky top-0 z-10 rounded-t-2xl border-b border-neutral-200/70 bg-white/95 pb-3 backdrop-blur-sm dark:border-white/[0.08] dark:bg-[#121212]/95'
                    : 'mb-3 pb-0'
                }`}
              >
                {showConfirmActions ? (
                  <div className="mb-2 flex items-center justify-end gap-1.5">
                    <IconButton
                      label={
                        titleTrimmed
                          ? canConfirm
                            ? isNewComposer
                              ? 'Confirm new service'
                              : 'Confirm service'
                            : 'No changes'
                          : 'Discard empty service'
                      }
                      tone={canConfirm ? 'confirm' : 'neutral'}
                      disabled={fieldSaving || (Boolean(titleTrimmed) && !canConfirm)}
                      onClick={() => void confirmEdit()}
                    >
                      {confirming ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
                      )}
                    </IconButton>
                    <IconButton
                      label="Cancel"
                      tone="cancel"
                      disabled={fieldSaving}
                      onClick={() => void cancelEdit()}
                    >
                      <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                    </IconButton>
                  </div>
                ) : null}

                <div className="flex items-start justify-between gap-3">
                  {editing ? (
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(event) => updateDraft(index, { title: event.target.value })}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter') return;
                        event.preventDefault();
                        if (!canConfirm && !titleTrimmed) {
                          void cancelEdit();
                          return;
                        }
                        if (canConfirm) void confirmEdit();
                      }}
                      placeholder="Service title"
                      className={`${portfolioInlineInputClass} w-full min-w-0 flex-1 text-base font-bold`}
                      autoFocus={editingIndex === index}
                      disabled={fieldSaving}
                    />
                  ) : (
                    <p
                      className={`min-w-0 flex-1 text-lg font-bold tracking-[-0.02em] text-neutral-950 dark:text-white ${
                        showCardChrome ? 'pr-16' : ''
                      }`}
                    >
                      {item.title.trim() || (
                        <span className="italic text-neutral-400">Untitled service</span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className={`flex flex-1 flex-col px-5 pb-5 ${isNewComposer ? 'pt-4' : ''}`}>
                {editing ? (
                  <div className="flex flex-1 flex-col gap-4">
                    <textarea
                      value={draft.description}
                      onChange={(event) => updateDraft(index, { description: event.target.value })}
                      rows={3}
                      placeholder="Describe what’s included…"
                      className={`${portfolioInlineInputClass} resize-y font-medium leading-relaxed`}
                      disabled={fieldSaving}
                    />
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                        Tasks
                      </p>
                      <ServiceTasksEditor
                        tasks={draft.tasks}
                        onChange={(tasks) => updateDraft(index, { tasks })}
                        disabled={fieldSaving}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                          Base price (€)
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={eurosInputFromCents(draft.basePriceCents)}
                            onChange={(event) =>
                              updateDraft(index, {
                                basePriceCents: centsFromEurosInput(event.target.value),
                              })
                            }
                            placeholder={isFreePrice(draft.basePriceCents) ? 'Free' : 'e.g. 50'}
                            className={`${portfolioInlineInputClass} min-w-0 flex-1`}
                            disabled={fieldSaving || isFreePrice(draft.basePriceCents)}
                          />
                          <button
                            type="button"
                            disabled={fieldSaving}
                            onClick={() =>
                              updateDraft(index, {
                                basePriceCents: isFreePrice(draft.basePriceCents) ? null : 0,
                              })
                            }
                            className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition disabled:opacity-50 ${
                              isFreePrice(draft.basePriceCents)
                                ? 'border-[#F97316]/50 bg-[#FFF7ED] text-[#EA580C] dark:border-[#F97316]/40 dark:bg-[#F97316]/15 dark:text-[#FB923C]'
                                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
                            }`}
                          >
                            Free
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                          Typical deadline
                        </p>
                        <input
                          type="text"
                          value={draft.deadline}
                          onChange={(event) => updateDraft(index, { deadline: event.target.value })}
                          placeholder="e.g. 3–5 days"
                          className={portfolioInlineInputClass}
                          disabled={fieldSaving}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col gap-4">
                    {display.description.trim() ? (
                      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                        {display.description.trim()}
                      </p>
                    ) : (
                      <p className="text-sm italic text-neutral-400">No description</p>
                    )}

                    {taskValues.length > 0 ? (
                      <ul className="space-y-2">
                        {taskValues.map((task, taskIndex) => (
                          <li
                            key={`${item.id}-task-${taskIndex}`}
                            className="flex items-start gap-2.5"
                          >
                            <TaskBullet />
                            <span className="min-w-0 text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
                              {task}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-neutral-200/70 pt-4 dark:border-white/[0.08]">
                      <div>
                        {!isFreePrice(display.basePriceCents) && priceDisplay ? (
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                            From
                          </p>
                        ) : null}
                        {isFreePrice(display.basePriceCents) ? (
                          <p className="text-lg font-extrabold tracking-[-0.02em] text-[#EA580C] dark:text-[#FB923C]">
                            Free
                          </p>
                        ) : priceDisplay ? (
                          <p className="text-lg font-extrabold tracking-[-0.02em] text-neutral-950 dark:text-white">
                            {priceDisplay}
                          </p>
                        ) : (
                          <p className="text-sm font-medium italic text-neutral-400">
                            Price on request
                          </p>
                        )}
                      </div>
                      {display.deadline.trim() ? (
                        <div className="text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                            Deadline
                          </p>
                          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                            {display.deadline.trim()}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
