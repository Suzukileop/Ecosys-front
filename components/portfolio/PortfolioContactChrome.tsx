'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faEnvelope, faLocationDot, faPenToSquare, faPhone, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { ContactVisibilityLevel } from '@/lib/contact-visibility';
import { formatPhoneDisplay } from '@/lib/phone';
import {
  PortfolioSectionIconButton,
  PortfolioSectionVisibilityMenu,
} from '@/components/portfolio/portfolio-section-shared';

export type PortfolioContactKind = 'address' | 'phone' | 'email';

export type PortfolioContactEntry = {
  id: string;
  value: string;
};

export type PortfolioContactLists = {
  addresses: PortfolioContactEntry[];
  phones: PortfolioContactEntry[];
  emails: PortfolioContactEntry[];
};

/** @deprecated Prefer list-based PortfolioContactLists. */
export type PortfolioContactFieldKey = PortfolioContactKind;
/** @deprecated Prefer list-based saves. */
export type PortfolioContactFieldValue = {
  email: string;
  phone: string;
  address: string;
};

type EditingTarget = { kind: PortfolioContactKind; index: number };

const inlineInputClass =
  'w-full bg-transparent px-0 py-0 text-[15px] font-semibold leading-snug text-neutral-900 outline-none placeholder:italic placeholder:font-normal placeholder:text-neutral-400 dark:text-white sm:text-base';

const softCardClass =
  'relative rounded-[1.15rem] border border-transparent bg-white p-5 shadow-[0_4px_16px_-8px_rgba(15,23,42,0.08)] transition-[background-color,box-shadow] duration-200 hover:bg-neutral-50 hover:shadow-[0_6px_20px_-10px_rgba(15,23,42,0.1)] sm:rounded-[1.35rem] sm:p-5 dark:bg-[#0a0a0a] dark:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.35)] dark:hover:bg-neutral-900/80';

function toDraft(entry: PortfolioContactEntry): string {
  return entry.value;
}

function normalizeValue(kind: PortfolioContactKind, value: string): string {
  return value.trim();
}

function displayValue(kind: PortfolioContactKind, value: string): string {
  if (kind === 'phone') return formatPhoneDisplay(value) || value.trim();
  return value.trim();
}

function isEmptyValue(kind: PortfolioContactKind, value: string): boolean {
  if (kind === 'phone') return !formatPhoneDisplay(value) && !value.trim();
  return !value.trim();
}

function placeholderFor(kind: PortfolioContactKind): string {
  switch (kind) {
    case 'address':
      return 'e.g. Paris, France';
    case 'phone':
      return 'Phone number';
    case 'email':
      return 'contact@yourbrand.com';
  }
}

function emptyLabelFor(kind: PortfolioContactKind): string {
  switch (kind) {
    case 'address':
      return 'No addresses yet. Click + to add one.';
    case 'phone':
      return 'No phones yet. Click + to add one.';
    case 'email':
      return 'No emails yet. Click + to add one.';
  }
}

function groupTitle(kind: PortfolioContactKind): string {
  switch (kind) {
    case 'address':
      return 'Addresses';
    case 'phone':
      return 'Phones';
    case 'email':
      return 'Emails';
  }
}

function groupIcon(kind: PortfolioContactKind) {
  switch (kind) {
    case 'address':
      return faLocationDot;
    case 'phone':
      return faPhone;
    case 'email':
      return faEnvelope;
  }
}

export function PortfolioContactReadOnly({
  addresses,
  phones,
  emails,
  visibility,
  onVisibilityChange,
  onSaveContact,
  onRemoveEntry,
  onAddEntry,
  fieldSaving = false,
  actionsVisible: _actionsVisible = false,
  composeAddKind = null,
  deleteMode: _deleteMode = false,
  onDeleteModeChange: _onDeleteModeChange,
  onCancelNewEntry,
  sectionRootRef: _sectionRootRef,
  onGlobalHasChangesChange,
  onRegisterGlobalConfirm,
}: {
  addresses: PortfolioContactEntry[];
  phones: PortfolioContactEntry[];
  emails: PortfolioContactEntry[];
  visibility?: {
    email: ContactVisibilityLevel;
    phone: ContactVisibilityLevel;
    address: ContactVisibilityLevel;
  };
  onVisibilityChange?: (key: PortfolioContactKind, value: ContactVisibilityLevel) => void;
  onSaveContact?: (next: PortfolioContactLists) => Promise<void>;
  onRemoveEntry?: (kind: PortfolioContactKind, index: number) => Promise<void> | void;
  onAddEntry?: (kind: PortfolioContactKind) => void;
  fieldSaving?: boolean;
  /** @deprecated Per-entry actions; kept for call-site compatibility. */
  actionsVisible?: boolean;
  composeAddKind?: PortfolioContactKind | null;
  /** @deprecated Delete is per-entry; kept for call-site compatibility. */
  deleteMode?: boolean;
  onDeleteModeChange?: (active: boolean) => void;
  onCancelNewEntry?: () => void;
  sectionRootRef?: RefObject<HTMLElement | null>;
  onGlobalHasChangesChange?: (hasChanges: boolean) => void;
  onRegisterGlobalConfirm?: (confirm: (() => Promise<void>) | null) => void;
}) {
  void _sectionRootRef;
  void _actionsVisible;
  void _deleteMode;
  void _onDeleteModeChange;
  const canEdit = Boolean(onSaveContact);
  const canDelete = Boolean(onRemoveEntry);
  const composing = Boolean(composeAddKind);

  const [editing, setEditing] = useState<EditingTarget | null>(null);
  const [draftAddresses, setDraftAddresses] = useState(() => addresses.map(toDraft));
  const [draftPhones, setDraftPhones] = useState(() => phones.map(toDraft));
  const [draftEmails, setDraftEmails] = useState(() => emails.map(toDraft));
  const [pendingDelete, setPendingDelete] = useState<EditingTarget | null>(null);

  const prevLengthsRef = useRef({
    address: addresses.length,
    phone: phones.length,
    email: emails.length,
  });
  const editingCardRef = useRef<HTMLDivElement | null>(null);
  const cancelEditRef = useRef<() => Promise<void>>(async () => undefined);

  const listFor = (kind: PortfolioContactKind) => {
    switch (kind) {
      case 'address':
        return addresses;
      case 'phone':
        return phones;
      case 'email':
        return emails;
    }
  };

  const draftsFor = (kind: PortfolioContactKind) => {
    switch (kind) {
      case 'address':
        return draftAddresses;
      case 'phone':
        return draftPhones;
      case 'email':
        return draftEmails;
    }
  };

  const setDraftsFor = (kind: PortfolioContactKind, next: string[]) => {
    switch (kind) {
      case 'address':
        setDraftAddresses(next);
        break;
      case 'phone':
        setDraftPhones(next);
        break;
      case 'email':
        setDraftEmails(next);
        break;
    }
  };

  const syncDraftsFromProps = () => {
    setDraftAddresses(addresses.map(toDraft));
    setDraftPhones(phones.map(toDraft));
    setDraftEmails(emails.map(toDraft));
  };

  const isComposingEdit = Boolean(editing && composeAddKind && editing.kind === composeAddKind);

  useEffect(() => {
    if (!composeAddKind) {
      setPendingDelete(null);
      if (editing == null) syncDraftsFromProps();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeAddKind]);

  useEffect(() => {
    if (editing != null || composeAddKind) return;
    syncDraftsFromProps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses, phones, emails]);

  useEffect(() => {
    const kinds: PortfolioContactKind[] = ['address', 'phone', 'email'];
    for (const kind of kinds) {
      const items = listFor(kind);
      const prevLength = prevLengthsRef.current[kind];
      prevLengthsRef.current[kind] = items.length;
      if (!composeAddKind || composeAddKind !== kind || fieldSaving) continue;
      if (items.length > prevLength) {
        const lastIndex = items.length - 1;
        if (isEmptyValue(kind, toDraft(items[lastIndex]))) {
          syncDraftsFromProps();
          setEditing({ kind, index: lastIndex });
          setPendingDelete(null);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses.length, phones.length, emails.length, composeAddKind]);

  useEffect(() => {
    if (!composeAddKind || fieldSaving) return;
    if (editing != null) return;
    const items = listFor(composeAddKind);
    const lastIndex = items.length - 1;
    if (lastIndex < 0) return;
    if (isEmptyValue(composeAddKind, toDraft(items[lastIndex]))) {
      syncDraftsFromProps();
      setEditing({ kind: composeAddKind, index: lastIndex });
      setPendingDelete(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeAddKind, addresses.length, phones.length, emails.length]);

  const startEdit = (kind: PortfolioContactKind, index: number) => {
    if (!canEdit || fieldSaving) return;
    if (
      kind === 'email' &&
      index === 0 &&
      !isEmptyValue('email', toDraft(listFor('email')[0] ?? { id: '', value: '' }))
    ) {
      return;
    }
    setPendingDelete(null);
    syncDraftsFromProps();
    setEditing({ kind, index });
  };

  const cancelEdit = async () => {
    if (fieldSaving || editing == null) return;
    const original = listFor(editing.kind)[editing.index];
    const wasEmpty = original ? isEmptyValue(editing.kind, toDraft(original)) : true;
    setEditing(null);
    syncDraftsFromProps();
    if (wasEmpty) {
      onCancelNewEntry?.();
    }
  };
  cancelEditRef.current = cancelEdit;

  useEffect(() => {
    if (!editing) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (editingCardRef.current?.contains(target)) return;
      void cancelEditRef.current();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [editing]);

  const updateDraft = (kind: PortfolioContactKind, index: number, value: string) => {
    const current = draftsFor(kind);
    setDraftsFor(
      kind,
      current.map((item, itemIndex) => (itemIndex === index ? value : item))
    );
  };

  const fieldHasChanges =
    editing != null &&
    draftsFor(editing.kind)[editing.index] != null &&
    listFor(editing.kind)[editing.index] != null &&
    normalizeValue(editing.kind, draftsFor(editing.kind)[editing.index]) !==
      normalizeValue(editing.kind, toDraft(listFor(editing.kind)[editing.index]));

  useEffect(() => {
    onGlobalHasChangesChange?.(false);
  }, [onGlobalHasChangesChange]);

  useEffect(() => {
    onRegisterGlobalConfirm?.(null);
    return () => onRegisterGlobalConfirm?.(null);
  }, [onRegisterGlobalConfirm]);

  const buildListsFromDrafts = (): PortfolioContactLists => ({
    addresses: addresses.map((entry, index) => ({
      id: entry.id,
      value: normalizeValue('address', draftAddresses[index] ?? entry.value),
    })),
    phones: phones.map((entry, index) => ({
      id: entry.id,
      value: draftPhones[index] ?? entry.value,
    })),
    emails: emails.map((entry, index) => ({
      id: entry.id,
      value: normalizeValue('email', draftEmails[index] ?? entry.value),
    })),
  });

  const confirmEdit = async () => {
    if (editing == null || !onSaveContact || fieldSaving) return;
    const draft = draftsFor(editing.kind)[editing.index];
    if (draft == null) return;

    if (isEmptyValue(editing.kind, draft)) {
      setEditing(null);
      if (isComposingEdit || isEmptyValue(editing.kind, toDraft(listFor(editing.kind)[editing.index] ?? { id: '', value: '' }))) {
        onCancelNewEntry?.();
        return;
      }
      if (onRemoveEntry) await onRemoveEntry(editing.kind, editing.index);
      return;
    }

    if (!fieldHasChanges) {
      setEditing(null);
      return;
    }

    try {
      const next = buildListsFromDrafts();
      await onSaveContact(next);
      setEditing(null);
    } catch {
      // Parent surfaces the error.
    }
  };

  const renderGroup = (kind: PortfolioContactKind) => {
    const items = listFor(kind);
    const drafts = draftsFor(kind);
    const visibilityKey = kind;
    const visibilityValue = visibility?.[visibilityKey];
    const showAdd = Boolean(onAddEntry) && items.length < 8;
    const useTwoCol = kind === 'phone' || kind === 'email';
    const itemActionVisibilityClass =
      'opacity-100 transition-opacity ' +
      '[@media(hover:hover)_and_(pointer:fine)]:opacity-0 ' +
      '[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 ' +
      '[@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100';

    const visibleEntries = items
      .map((item, index) => ({ item, index }))
      .filter(
        ({ item, index }) =>
          composeAddKind === kind ||
          (editing?.kind === kind && editing.index === index) ||
          !isEmptyValue(kind, item.value)
      );

    return (
      <section key={kind} className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="flex min-w-0 flex-1 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-500">
            <FontAwesomeIcon
              icon={groupIcon(kind)}
              className="h-3.5 w-3.5 shrink-0 text-neutral-400 dark:text-neutral-500"
              fixedWidth
            />
            {groupTitle(kind)}
          </h3>
          {visibilityValue && onVisibilityChange ? (
            <PortfolioSectionVisibilityMenu
              value={visibilityValue}
              onChange={(level) => onVisibilityChange(visibilityKey, level)}
            />
          ) : null}
          {showAdd ? (
            <button
              type="button"
              disabled={fieldSaving || Boolean(composeAddKind)}
              onClick={() => onAddEntry?.(kind)}
              title={`Add ${kind}`}
              aria-label={`Add ${kind}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:border-[#F97316]/40 hover:text-[#EA580C] disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-[#FB923C]"
            >
              <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" fixedWidth />
            </button>
          ) : null}
        </div>

        {visibleEntries.length === 0 ? (
          <p className="py-6 text-center text-sm italic text-neutral-500 dark:text-neutral-400">
            {emptyLabelFor(kind)}
          </p>
        ) : (
          <div className={useTwoCol ? 'grid gap-3 sm:grid-cols-2' : 'space-y-3'}>
            {visibleEntries.map(({ item, index }) => {
              const draft = drafts[index] ?? toDraft(item);
              const isPrimaryEmailLocked =
                kind === 'email' && index === 0 && !isEmptyValue('email', item.value);
              const isEditingRow =
                !isPrimaryEmailLocked &&
                Boolean(canEdit && editing?.kind === kind && editing.index === index);
              const showConfirmActions = Boolean(isEditingRow && onSaveContact);
              const isPendingDelete =
                pendingDelete?.kind === kind && pendingDelete.index === index;
              const showItemChrome = Boolean(
                (canEdit || canDelete) && !isEditingRow && !isPrimaryEmailLocked
              );
              const canConfirm =
                !isEmptyValue(kind, draft) &&
                fieldHasChanges &&
                editing?.kind === kind &&
                editing.index === index;

              return (
                <div
                  key={item.id}
                  ref={isEditingRow ? editingCardRef : undefined}
                  className={`${softCardClass} group`}
                >
                  {showConfirmActions ? (
                    <div className="absolute right-3 top-3 z-10 inline-flex h-8 items-center gap-1.5">
                      <PortfolioSectionIconButton
                        label={
                          isEmptyValue(kind, draft)
                            ? `Discard incomplete ${kind}`
                            : fieldHasChanges
                              ? `Confirm ${kind}`
                              : 'No changes'
                        }
                        tone={canConfirm ? 'confirm' : 'neutral'}
                        disabled={fieldSaving}
                        onClick={() => void confirmEdit()}
                      >
                        {fieldSaving && editing?.kind === kind && editing.index === index ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
                        )}
                      </PortfolioSectionIconButton>
                      <PortfolioSectionIconButton
                        label="Cancel"
                        tone="cancel"
                        disabled={fieldSaving}
                        onClick={() => void cancelEdit()}
                      >
                        <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                      </PortfolioSectionIconButton>
                    </div>
                  ) : showItemChrome ? (
                    <div
                      className={`absolute right-3 top-3 z-10 inline-flex h-8 items-center gap-1.5 ${
                        isPendingDelete ? 'opacity-100' : itemActionVisibilityClass
                      }`}
                    >
                      {isPendingDelete ? (
                        <>
                          <PortfolioSectionIconButton
                            label={`Confirm delete ${kind}`}
                            tone="confirm"
                            disabled={fieldSaving}
                            onClick={() => {
                              void (async () => {
                                if (!onRemoveEntry) return;
                                await onRemoveEntry(kind, index);
                                setPendingDelete(null);
                                setEditing(null);
                              })();
                            }}
                          >
                            {fieldSaving && isPendingDelete ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
                            )}
                          </PortfolioSectionIconButton>
                          <PortfolioSectionIconButton
                            label="Cancel"
                            tone="cancel"
                            disabled={fieldSaving}
                            onClick={() => setPendingDelete(null)}
                          >
                            <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                          </PortfolioSectionIconButton>
                        </>
                      ) : (
                        <>
                          {canEdit ? (
                            <PortfolioSectionIconButton
                              label={`Edit ${kind}`}
                              disabled={fieldSaving}
                              onClick={() => startEdit(kind, index)}
                            >
                              <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
                            </PortfolioSectionIconButton>
                          ) : null}
                          {canDelete ? (
                            <PortfolioSectionIconButton
                              label={`Delete ${kind}`}
                              disabled={fieldSaving}
                              onClick={() => {
                                setEditing(null);
                                setPendingDelete({ kind, index });
                              }}
                            >
                              <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                            </PortfolioSectionIconButton>
                          ) : null}
                        </>
                      )}
                    </div>
                  ) : null}

                  <div className="flex items-start gap-3">
                    <div className={`min-w-0 flex-1 ${showItemChrome || showConfirmActions ? 'pr-16' : ''}`}>
                      {isEditingRow ? (
                        kind === 'phone' ? (
                          <PhoneInput
                            id={`portfolio-contact-phone-${item.id}`}
                            value={draft}
                            onChange={(value) => updateDraft(kind, index, value)}
                            disabled={fieldSaving}
                          />
                        ) : (
                          <input
                            type={kind === 'email' ? 'email' : 'text'}
                            value={draft}
                            onChange={(event) => updateDraft(kind, index, event.target.value)}
                            placeholder={placeholderFor(kind)}
                            className={inlineInputClass}
                            autoFocus={isEditingRow}
                            disabled={fieldSaving}
                          />
                        )
                      ) : (
                        <p className="text-[15px] font-semibold leading-snug text-neutral-900 dark:text-white sm:text-base">
                          {displayValue(kind, item.value) || (
                            <span className="italic text-neutral-400">Empty</span>
                          )}
                          {isPrimaryEmailLocked ? (
                            <span className="mt-1 block text-[11px] font-medium normal-case tracking-normal text-neutral-400 dark:text-neutral-500">
                              Primary email
                            </span>
                          ) : null}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="space-y-8">
      {renderGroup('address')}
      {renderGroup('phone')}
      {renderGroup('email')}
    </div>
  );
}
