'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faPenToSquare,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const inlineInputClass =
  'w-full bg-transparent px-0 py-0 text-[15px] font-semibold leading-snug text-neutral-900 outline-none placeholder:italic placeholder:font-normal placeholder:text-neutral-400 dark:text-white sm:text-base';

const inlineTextareaClass =
  'w-full resize-y bg-transparent px-0 py-0 text-sm font-medium leading-relaxed text-neutral-600 outline-none placeholder:italic placeholder:font-normal placeholder:text-neutral-400 dark:text-neutral-300 sm:text-[15px]';

/** Visible on touch devices; hover/focus only on fine-pointer desktops. */
const itemActionVisibilityClass =
  'opacity-100 transition-opacity ' +
  '[@media(hover:hover)_and_(pointer:fine)]:opacity-0 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100';

export type PortfolioFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type PortfolioFaqDraft = {
  question: string;
  answer: string;
};

function toDraft(item: PortfolioFaqItem): PortfolioFaqDraft {
  return {
    question: item.question,
    answer: item.answer,
  };
}

function normalizeDraft(draft: PortfolioFaqDraft): PortfolioFaqDraft {
  return {
    question: draft.question.trim(),
    answer: draft.answer.trim(),
  };
}

function draftsEqual(left: PortfolioFaqDraft, right: PortfolioFaqDraft): boolean {
  const a = normalizeDraft(left);
  const b = normalizeDraft(right);
  return a.question === b.question && a.answer === b.answer;
}

function isFaqEmpty(draft: PortfolioFaqDraft): boolean {
  const normalized = normalizeDraft(draft);
  return !normalized.question && !normalized.answer;
}

function isFaqIncomplete(draft: PortfolioFaqDraft): boolean {
  const normalized = normalizeDraft(draft);
  return !normalized.question || !normalized.answer;
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
  children: React.ReactNode;
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

export function PortfolioFaqReadOnly({
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
  items: PortfolioFaqItem[];
  onItemSave?: (index: number, next: PortfolioFaqDraft) => Promise<void>;
  onItemsSave?: (next: PortfolioFaqDraft[]) => Promise<void>;
  onRemoveItem?: (index: number) => Promise<void> | void;
  fieldSaving?: boolean;
  /** @deprecated Per-item actions; kept for call-site compatibility. */
  actionsVisible?: boolean;
  /** Add-FAQ compose without a section Edit mode. */
  composeAdd?: boolean;
  /** @deprecated Delete is per-item; kept for call-site compatibility. */
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
  const [drafts, setDrafts] = useState<PortfolioFaqDraft[]>(() => items.map(toDraft));
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const prevItemsLengthRef = useRef(items.length);
  const editingCardRef = useRef<HTMLDivElement | null>(null);
  const cancelEditRef = useRef<() => Promise<void>>(async () => undefined);

  const syncDraftsFromItems = () => {
    setDrafts(items.map(toDraft));
  };

  const composing = editingIndex != null;

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
    const prevLength = prevItemsLengthRef.current;
    prevItemsLengthRef.current = items.length;
    if (!composeAdd || fieldSaving) return;
    if (items.length > prevLength) {
      const lastIndex = items.length - 1;
      if (isFaqEmpty(toDraft(items[lastIndex]))) {
        setDrafts(items.map(toDraft));
        setEditingIndex(lastIndex);
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
    if (isFaqEmpty(toDraft(items[lastIndex]))) {
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
    const wasEmpty = original ? isFaqEmpty(toDraft(original)) : true;
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

  const updateDraft = (index: number, patch: Partial<PortfolioFaqDraft>) => {
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
    if (isFaqIncomplete(draft)) {
      setEditingIndex(null);
      if (isFaqEmpty(draft)) {
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
      await onItemSave(editingIndex, normalizeDraft(draft));
      setEditingIndex(null);
    } catch {
      // Parent surfaces the error.
    }
  };

  const visibleEntries = items
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item, index }) =>
        index === editingIndex ||
        (Boolean(item.question.trim()) && Boolean(item.answer.trim())) ||
        composeAdd
    );

  if (visibleEntries.length === 0 && !composeAdd) {
    return (
      <p className="py-10 text-center text-sm italic text-neutral-500 dark:text-neutral-400">
        No FAQ items yet. Click Add FAQ to create one.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {visibleEntries.map(({ item, index }) => {
        const draft = drafts[index] ?? toDraft(item);
        const editing = Boolean(canEdit && editingIndex === index);
        const showConfirmActions = Boolean(editing && onItemSave);
        const showItemChrome = Boolean((canEdit || canDelete) && !editing);
        const canConfirm =
          Boolean(draft.question.trim() && draft.answer.trim()) && fieldHasChanges;

        return (
          <div
            key={item.id}
            ref={editing ? editingCardRef : undefined}
            className="group relative rounded-[1.15rem] border border-transparent bg-white p-5 shadow-[0_4px_16px_-8px_rgba(15,23,42,0.08)] transition-[border-color,box-shadow] duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:border-[#F97316]/30 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_6px_20px_-10px_rgba(15,23,42,0.1)] sm:rounded-[1.35rem] sm:p-6 dark:bg-[#0a0a0a] dark:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.35)] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-[#F97316]/30"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-[15px] font-bold leading-snug text-[#F97316] sm:text-base">
                Q.
              </span>
              <div className={`min-w-0 flex-1 space-y-3 ${showItemChrome ? 'pr-16' : ''}`}>
                {editing ? (
                  <input
                    type="text"
                    value={draft.question}
                    onChange={(event) => updateDraft(index, { question: event.target.value })}
                    placeholder="Question"
                    className={inlineInputClass}
                    autoFocus={editingIndex === index}
                    disabled={fieldSaving}
                  />
                ) : (
                  <p className="text-[15px] font-semibold leading-snug text-neutral-900 dark:text-white sm:text-base">
                    {item.question.trim() || (
                      <span className="italic text-neutral-400">Untitled question</span>
                    )}
                  </p>
                )}

                {editing ? (
                  <textarea
                    value={draft.answer}
                    onChange={(event) => updateDraft(index, { answer: event.target.value })}
                    rows={3}
                    placeholder="Answer"
                    className={inlineTextareaClass}
                    disabled={fieldSaving}
                  />
                ) : (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-[15px]">
                    {item.answer.trim() || (
                      <span className="italic text-neutral-400">No answer yet</span>
                    )}
                  </p>
                )}
              </div>

              {showConfirmActions ? (
                <div className="inline-flex h-8 shrink-0 items-center gap-1.5 self-start">
                  <IconButton
                    label={
                      draft.question.trim() && draft.answer.trim()
                        ? fieldHasChanges
                          ? 'Confirm FAQ'
                          : 'No changes'
                        : 'Discard incomplete FAQ'
                    }
                    tone={canConfirm ? 'confirm' : 'neutral'}
                    disabled={fieldSaving}
                    onClick={() => void confirmEdit()}
                  >
                    {fieldSaving && editingIndex === index ? (
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
              ) : showItemChrome ? (
                <div
                  className={`absolute right-3 top-3 z-10 inline-flex h-8 items-center gap-1.5 ${
                    pendingDeleteIndex === index ? 'opacity-100' : itemActionVisibilityClass
                  }`}
                >
                  {pendingDeleteIndex === index ? (
                    <>
                      <span className="hidden text-[11px] font-medium text-red-600 sm:inline dark:text-red-400">
                        Delete?
                      </span>
                      <IconButton
                        label="Confirm delete FAQ"
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
                          label="Edit FAQ"
                          disabled={fieldSaving}
                          onClick={() => startEdit(index)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
                        </IconButton>
                      ) : null}
                      {canDelete ? (
                        <IconButton
                          label="Delete FAQ"
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
