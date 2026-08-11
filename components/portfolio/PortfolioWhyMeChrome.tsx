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
  'w-full resize-y bg-transparent px-0 py-0 text-[15px] font-semibold leading-relaxed text-neutral-900 outline-none placeholder:italic placeholder:text-neutral-400 dark:text-white';

/** Visible on touch devices; hover/focus only on fine-pointer desktops. */
const rowActionVisibilityClass =
  'opacity-100 transition-opacity ' +
  '[@media(hover:hover)_and_(pointer:fine)]:opacity-0 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 ' +
  '[@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100';

export type PortfolioWhyMeBlock = {
  id: string;
  title: string;
  text: string;
};

export type PortfolioWhyMeDraft = {
  title: string;
  text: string;
};

function toDraft(block: PortfolioWhyMeBlock): PortfolioWhyMeDraft {
  return {
    title: block.title,
    text: block.text,
  };
}

function normalizeDraft(draft: PortfolioWhyMeDraft): PortfolioWhyMeDraft {
  return {
    title: draft.title.trim(),
    text: draft.text.trim(),
  };
}

function draftsEqual(left: PortfolioWhyMeDraft, right: PortfolioWhyMeDraft): boolean {
  const a = normalizeDraft(left);
  const b = normalizeDraft(right);
  return a.title === b.title && a.text === b.text;
}

function isWhyMeEmpty(draft: PortfolioWhyMeDraft): boolean {
  return !normalizeDraft(draft).text;
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

export function PortfolioWhyMeReadOnly({
  blocks,
  onBlockSave,
  onBlocksSave: _onBlocksSave,
  onRemoveBlock,
  fieldSaving = false,
  actionsVisible: _actionsVisible = false,
  composeAdd = false,
  deleteMode: _deleteMode = false,
  onDeleteModeChange: _onDeleteModeChange,
  onComposingChange,
  onCancelNewArgument,
  sectionRootRef: _sectionRootRef,
  onGlobalHasChangesChange,
  onRegisterGlobalConfirm,
}: {
  blocks: PortfolioWhyMeBlock[];
  onBlockSave?: (index: number, next: { title: string; text: string }) => Promise<void>;
  onBlocksSave?: (next: Array<{ title: string; text: string }>) => Promise<void>;
  onRemoveBlock?: (index: number) => Promise<void> | void;
  fieldSaving?: boolean;
  /** @deprecated Per-row actions; kept for call-site compatibility. */
  actionsVisible?: boolean;
  /** Add-argument compose without a section Edit mode. */
  composeAdd?: boolean;
  /** @deprecated Delete is per-row; kept for call-site compatibility. */
  deleteMode?: boolean;
  onDeleteModeChange?: (active: boolean) => void;
  onComposingChange?: (composing: boolean) => void;
  /** Called when canceling a brand-new empty argument (X / discard). */
  onCancelNewArgument?: () => void;
  sectionRootRef?: RefObject<HTMLElement | null>;
  onGlobalHasChangesChange?: (hasChanges: boolean) => void;
  onRegisterGlobalConfirm?: (confirm: (() => Promise<void>) | null) => void;
}) {
  const canEdit = Boolean(onBlockSave);
  const canDelete = Boolean(onRemoveBlock);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<PortfolioWhyMeDraft[]>(() => blocks.map(toDraft));
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const prevBlocksLengthRef = useRef(blocks.length);
  const editingRowRef = useRef<HTMLLIElement | null>(null);
  const cancelEditRef = useRef<() => Promise<void>>(async () => undefined);

  const syncDraftsFromBlocks = () => {
    setDrafts(blocks.map(toDraft));
  };

  const composing = editingIndex != null;
  const composingNewArgument =
    composing &&
    editingIndex != null &&
    isWhyMeEmpty(toDraft(blocks[editingIndex] ?? { id: '', title: '', text: '' }));

  useEffect(() => {
    onComposingChange?.(composingNewArgument);
    return () => onComposingChange?.(false);
  }, [composingNewArgument, onComposingChange]);

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
      if (editingIndex == null) syncDraftsFromBlocks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeAdd]);

  useEffect(() => {
    if (editingIndex != null || composeAdd) return;
    syncDraftsFromBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  useEffect(() => {
    const prevLength = prevBlocksLengthRef.current;
    prevBlocksLengthRef.current = blocks.length;
    if (!composeAdd || fieldSaving) return;
    if (blocks.length > prevLength) {
      const lastIndex = blocks.length - 1;
      if (isWhyMeEmpty(toDraft(blocks[lastIndex]))) {
        setDrafts(blocks.map(toDraft));
        setEditingIndex(lastIndex);
        setPendingDeleteIndex(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks.length, composeAdd]);

  useEffect(() => {
    if (!composeAdd || fieldSaving) return;
    if (editingIndex != null) return;
    const lastIndex = blocks.length - 1;
    if (lastIndex < 0) return;
    if (isWhyMeEmpty(toDraft(blocks[lastIndex]))) {
      setDrafts(blocks.map(toDraft));
      setEditingIndex(lastIndex);
      setPendingDeleteIndex(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeAdd, blocks.length]);

  const startEdit = (index: number) => {
    if (!canEdit || fieldSaving) return;
    setPendingDeleteIndex(null);
    syncDraftsFromBlocks();
    setEditingIndex(index);
  };

  const cancelEdit = async () => {
    if (fieldSaving || editingIndex == null) return;
    const original = blocks[editingIndex];
    const wasEmpty = original ? isWhyMeEmpty(toDraft(original)) : true;
    setEditingIndex(null);
    syncDraftsFromBlocks();
    if (wasEmpty) {
      onCancelNewArgument?.();
    }
  };
  cancelEditRef.current = cancelEdit;

  useEffect(() => {
    if (!composing) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (editingRowRef.current?.contains(target)) return;
      void cancelEditRef.current();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [composing]);

  const updateDraft = (index: number, patch: Partial<PortfolioWhyMeDraft>) => {
    setDrafts((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  };

  const fieldHasChanges =
    editingIndex != null &&
    drafts[editingIndex] != null &&
    blocks[editingIndex] != null &&
    !draftsEqual(drafts[editingIndex], toDraft(blocks[editingIndex]));

  const confirmEdit = async () => {
    if (editingIndex == null || !onBlockSave || fieldSaving) return;
    const draft = drafts[editingIndex];
    if (!draft) return;
    if (isWhyMeEmpty(draft)) {
      const original = blocks[editingIndex];
      const wasOriginallyEmpty = original ? isWhyMeEmpty(toDraft(original)) : true;
      setEditingIndex(null);
      if (wasOriginallyEmpty) {
        onCancelNewArgument?.();
        return;
      }
      if (onRemoveBlock) await onRemoveBlock(editingIndex);
      return;
    }
    if (!fieldHasChanges) {
      setEditingIndex(null);
      return;
    }
    try {
      await onBlockSave(editingIndex, normalizeDraft(draft));
      setEditingIndex(null);
    } catch {
      // Parent surfaces the error.
    }
  };

  const visibleEntries = blocks
    .map((block, index) => ({ block, index }))
    .filter(
      ({ block, index }) => index === editingIndex || Boolean(block.text.trim()) || composeAdd
    );

  if (visibleEntries.length === 0 && !composeAdd) {
    return (
      <p className="py-10 text-center text-sm italic text-neutral-500 dark:text-neutral-400">
        No arguments yet. Click Add argument to create one.
      </p>
    );
  }

  return (
    <div>
      <ul className="space-y-1">
        {visibleEntries.map(({ block, index }) => {
          const draft = drafts[index] ?? toDraft(block);
          const editing = Boolean(canEdit && editingIndex === index);
          const showConfirmActions = Boolean(editing && onBlockSave);
          const showRowChrome = Boolean((canEdit || canDelete) && !editing);

          return (
            <li
              key={block.id}
              ref={editing ? editingRowRef : undefined}
              className="group relative flex items-start gap-3 rounded-xl py-3 transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-neutral-50/70 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-neutral-800/30"
            >
              <span
                className="mt-[0.35rem] inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[#EA580C]"
                aria-hidden
              >
                <svg viewBox="0 0 12 12" className="h-full w-full" fill="currentColor">
                  <path d="M3.2 1.4v9.2L10.4 6 3.2 1.4z" />
                </svg>
              </span>

              <div className={`min-w-0 flex-1 ${showRowChrome ? 'pr-[5.25rem]' : ''}`}>
                {editing ? (
                  <textarea
                    value={draft.text}
                    onChange={(event) => updateDraft(index, { text: event.target.value })}
                    rows={2}
                    placeholder="Describe what makes you stand out…"
                    className={inlineInputClass}
                    autoFocus={editingIndex === index}
                    disabled={fieldSaving}
                  />
                ) : (
                  <p className="text-[15px] font-semibold leading-relaxed text-neutral-900 dark:text-white">
                    {block.text.trim() || (
                      <span className="italic text-neutral-400">
                        Describe what makes you stand out…
                      </span>
                    )}
                  </p>
                )}
              </div>

              {showConfirmActions ? (
                <div className="absolute right-0 top-3 z-10 inline-flex h-8 items-center gap-1.5">
                  <IconButton
                    label={
                      draft.text.trim()
                        ? fieldHasChanges
                          ? 'Confirm argument'
                          : 'No changes'
                        : 'Discard empty argument'
                    }
                    tone={draft.text.trim() && fieldHasChanges ? 'confirm' : 'neutral'}
                    disabled={fieldSaving || (Boolean(draft.text.trim()) && !fieldHasChanges)}
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
              ) : showRowChrome ? (
                <div
                  className={`absolute right-0 top-3 z-10 inline-flex h-8 items-center gap-1.5 ${
                    pendingDeleteIndex === index
                      ? 'opacity-100'
                      : rowActionVisibilityClass
                  }`}
                >
                  {pendingDeleteIndex === index ? (
                    <>
                      <span className="hidden text-[11px] font-medium text-red-600 sm:inline dark:text-red-400">
                        Delete?
                      </span>
                      <IconButton
                        label="Confirm delete argument"
                        tone="confirm"
                        disabled={fieldSaving}
                        onClick={() => {
                          void (async () => {
                            if (!onRemoveBlock) return;
                            await onRemoveBlock(index);
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
                          label="Edit argument"
                          disabled={fieldSaving}
                          onClick={() => startEdit(index)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
                        </IconButton>
                      ) : null}
                      {canDelete ? (
                        <IconButton
                          label="Delete argument"
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
