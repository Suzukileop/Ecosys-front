'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faChevronRight,
  faCircleCheck,
  faPenToSquare,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { SkillTagsEditor } from '@/components/creator/studio/SkillTagsEditor';
import type { StrengthToolLevel } from '@/components/creator/studio/profile-form-schema';
import {
  PortfolioFlatField,
  PortfolioLanguageChips,
} from '@/components/portfolio/PortfolioInformationChrome';
import { getSkillUsageDescription } from '@/components/portfolio/skill-usage-descriptions';
import { matchSpecialtyOption, parseSpecialtyTags, specialtyGroupLabel } from '@/lib/specialties';
import { portfolioInlineInputClass } from '@/components/portfolio/portfolio-section-shared';
import { uploadContentMedia } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const MAX_DESCRIPTION = 280;
const MAX_USE_CASES = 8;

const LEVEL_OPTIONS: { value: StrengthToolLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export type PortfolioStrengthItem = {
  id: string;
  value: string;
  description: string;
  category: string;
  level: StrengthToolLevel | null;
  useCases: string[];
  experienceYears: number | null;
  experienceLabel: string;
  currentlyUsed: boolean | null;
  iconUrl?: string | null;
};

export type PortfolioStrengthDraft = {
  value: string;
  description: string;
  category: string;
  level: StrengthToolLevel | null;
  useCases: string[];
  experienceYears: number | null;
  experienceLabel: string;
  currentlyUsed: boolean | null;
  iconUrl?: string | null;
};

function levelLabel(level: StrengthToolLevel | null | undefined): string {
  if (!level) return '';
  return LEVEL_OPTIONS.find((option) => option.value === level)?.label ?? level;
}

function toDraft(item: PortfolioStrengthItem): PortfolioStrengthDraft {
  return {
    value: item.value,
    description: item.description,
    category: item.category ?? '',
    level: item.level ?? null,
    useCases: [...(item.useCases ?? [])],
    experienceYears: item.experienceYears ?? null,
    experienceLabel: item.experienceLabel ?? '',
    currentlyUsed: item.currentlyUsed ?? null,
    iconUrl: item.iconUrl ?? null,
  };
}

function normalizeUseCases(useCases: string[]): string[] {
  return useCases.map((entry) => entry.trim()).filter(Boolean).slice(0, MAX_USE_CASES);
}

function cleanDraft(draft: PortfolioStrengthDraft): PortfolioStrengthDraft {
  return {
    value: draft.value.trim(),
    description: draft.description.trim().slice(0, MAX_DESCRIPTION),
    category: draft.category.trim(),
    level: draft.level ?? null,
    useCases: normalizeUseCases(draft.useCases),
    experienceYears:
      typeof draft.experienceYears === 'number' && Number.isFinite(draft.experienceYears)
        ? Math.max(0, Math.min(40, Math.round(draft.experienceYears)))
        : null,
    experienceLabel: '',
    currentlyUsed: typeof draft.currentlyUsed === 'boolean' ? draft.currentlyUsed : null,
    iconUrl: draft.iconUrl?.trim() ? draft.iconUrl.trim() : null,
  };
}

function draftsEqual(left: PortfolioStrengthDraft, right: PortfolioStrengthDraft): boolean {
  const a = cleanDraft(left);
  const b = cleanDraft(right);
  return (
    a.value === b.value &&
    a.description === b.description &&
    a.category === b.category &&
    a.level === b.level &&
    a.experienceYears === b.experienceYears &&
    a.experienceLabel === b.experienceLabel &&
    a.currentlyUsed === b.currentlyUsed &&
    (a.iconUrl ?? null) === (b.iconUrl ?? null) &&
    a.useCases.length === b.useCases.length &&
    a.useCases.every((entry, index) => entry === b.useCases[index])
  );
}

function currentlyUsedLabel(value: boolean | null | undefined): string {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return '';
}

function skillHasContent(draft: PortfolioStrengthDraft): boolean {
  return Boolean(cleanDraft(draft).value);
}

function isSkillEmpty(draft: PortfolioStrengthDraft): boolean {
  const cleaned = cleanDraft(draft);
  // Category is often pre-filled from profile specialties when composing a new tool —
  // treat "no name yet" as empty so Add (+) can open the compose form.
  return (
    !cleaned.value &&
    !cleaned.description &&
    cleaned.level == null &&
    cleaned.useCases.length === 0 &&
    cleaned.experienceYears == null &&
    cleaned.currentlyUsed == null &&
    !cleaned.iconUrl
  );
}

function experienceSummary(item: PortfolioStrengthItem | PortfolioStrengthDraft): string {
  if (item.experienceYears == null) return '';
  return `${item.experienceYears} year${item.experienceYears === 1 ? '' : 's'}`;
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
  tone?: 'neutral' | 'confirm' | 'cancel';
}) {
  const toneClass =
    tone === 'confirm'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'
      : tone === 'cancel'
        ? 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
        : active
          ? 'border-[#F97316]/40 bg-[#FFF7ED] text-[#EA580C] dark:border-[#F97316]/30 dark:bg-[#F97316]/10 dark:text-[#FB923C]'
          : 'border-neutral-200 bg-white text-neutral-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400';

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

function UseCasesEditor({
  useCases,
  onChange,
  disabled,
}: {
  useCases: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState('');

  const addUseCase = () => {
    const trimmed = draft.trim().slice(0, 60);
    if (!trimmed || useCases.length >= MAX_USE_CASES) return;
    if (useCases.some((entry) => entry.toLowerCase() === trimmed.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...useCases, trimmed]);
    setDraft('');
  };

  return (
    <div className="space-y-2">
      {useCases.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {useCases.map((useCase) => (
            <span
              key={useCase}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-800 dark:border-neutral-700 dark:bg-[#141414] dark:text-neutral-100"
            >
              {useCase}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(useCases.filter((entry) => entry !== useCase))}
                className="text-neutral-400 hover:text-red-500 disabled:opacity-50"
                aria-label={`Remove ${useCase}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={draft}
          maxLength={60}
          disabled={disabled || useCases.length >= MAX_USE_CASES}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addUseCase();
            }
          }}
          placeholder={
            useCases.length >= MAX_USE_CASES ? 'Maximum 8 use cases' : 'Add a use case'
          }
          className={portfolioInlineInputClass}
        />
        <button
          type="button"
          disabled={disabled || !draft.trim() || useCases.length >= MAX_USE_CASES}
          onClick={addUseCase}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export function PortfolioStrengthsReadOnly({
  items,
  skillTags = [],
  onSkillTagsSave,
  allowedSpecialties = [],
  onItemSave,
  onItemsSave,
  onRemoveItem,
  fieldSaving = false,
  actionsVisible = false,
  composeAdd = false,
  deleteMode = false,
  onDeleteModeChange,
  onCancelNewItem,
  sectionRootRef: _sectionRootRef,
  onGlobalHasChangesChange,
  onRegisterGlobalConfirm,
}: {
  items: PortfolioStrengthItem[];
  /** Keyword tags for the Skills band (separate from Tools). */
  skillTags?: string[];
  onSkillTagsSave?: (next: string[]) => Promise<void>;
  allowedSpecialties?: string[];
  onItemSave?: (index: number, next: PortfolioStrengthDraft) => Promise<void>;
  onItemsSave?: (next: PortfolioStrengthDraft[]) => Promise<void>;
  onRemoveItem?: (index: number) => Promise<void> | void;
  fieldSaving?: boolean;
  actionsVisible?: boolean;
  /** Add-tool compose without opening full Edit mode. */
  composeAdd?: boolean;
  deleteMode?: boolean;
  onDeleteModeChange?: (active: boolean) => void;
  onCancelNewItem?: () => void;
  sectionRootRef?: RefObject<HTMLElement | null>;
  onGlobalHasChangesChange?: (hasChanges: boolean) => void;
  onRegisterGlobalConfirm?: (confirm: (() => Promise<void>) | null) => void;
}) {
  // Edit session: cards stay in preview; a pen icon opens fields for one item.
  // Add tool: compose only the new item.
  const editSession = Boolean(actionsVisible && !deleteMode);
  const showFieldActions = Boolean((editSession || composeAdd) && !deleteMode);
  const isGlobal = false;
  const specialtyOptions = allowedSpecialties.filter(Boolean);

  const [draftSkillTags, setDraftSkillTags] = useState(() => parseSpecialtyTags(skillTags));
  const [savingSkillTags, setSavingSkillTags] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<PortfolioStrengthDraft[]>(() => items.map(toDraft));
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const prevItemsLengthRef = useRef(items.length);
  const editingCardRef = useRef<HTMLElement | null>(null);
  const cancelEditRef = useRef<() => Promise<void>>(async () => undefined);

  useEffect(() => {
    if (editingSkills) return;
    setDraftSkillTags(parseSpecialtyTags(skillTags));
  }, [skillTags, editingSkills]);

  useEffect(() => {
    if (composeAdd || deleteMode) {
      setEditingSkills(false);
      setDraftSkillTags(parseSpecialtyTags(skillTags));
    }
  }, [composeAdd, deleteMode, skillTags]);

  const persistSkillTags = async (next: string[]) => {
    const cleaned = parseSpecialtyTags(next);
    setDraftSkillTags(cleaned);
    if (!onSkillTagsSave) return;
    const current = parseSpecialtyTags(skillTags);
    if (
      cleaned.length === current.length &&
      cleaned.every((tag, index) => tag === current[index])
    ) {
      return;
    }
    setSavingSkillTags(true);
    try {
      await onSkillTagsSave(cleaned);
    } catch {
      setDraftSkillTags(parseSpecialtyTags(skillTags));
      throw new Error('skill-tags-save-failed');
    } finally {
      setSavingSkillTags(false);
    }
  };

  const skillsHaveChanges = (() => {
    const current = parseSpecialtyTags(skillTags);
    const draft = parseSpecialtyTags(draftSkillTags);
    if (current.length !== draft.length) return true;
    return draft.some((tag, index) => tag !== current[index]);
  })();

  const syncDraftsFromItems = () => {
    setDrafts(items.map(toDraft));
  };

  const composing = Boolean(showFieldActions && editingIndex != null);

  useEffect(() => {
    if (actionsVisible) {
      setEditingIndex(null);
      syncDraftsFromItems();
      return;
    }
    if (!composeAdd) {
      setEditingIndex(null);
      syncDraftsFromItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsVisible, composeAdd]);

  useEffect(() => {
    if (deleteMode) {
      setPendingDeleteIndex(null);
      setOpenIndex(null);
      setEditingIndex(null);
      setUploadError(null);
    } else {
      setPendingDeleteIndex(null);
    }
  }, [deleteMode]);

  useEffect(() => {
    if (!actionsVisible) return;
    setPendingDeleteIndex(null);
    onDeleteModeChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsVisible]);

  useEffect(() => {
    if (editingIndex != null || composeAdd) return;
    syncDraftsFromItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    const prevLength = prevItemsLengthRef.current;
    prevItemsLengthRef.current = items.length;
    if (!composeAdd || deleteMode || fieldSaving) return;
    if (items.length > prevLength) {
      const lastIndex = items.length - 1;
      if (isSkillEmpty(toDraft(items[lastIndex]))) {
        setDrafts(items.map(toDraft));
        setEditingIndex(lastIndex);
        setOpenIndex(lastIndex);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, composeAdd, deleteMode]);

  useEffect(() => {
    if (!composeAdd || deleteMode || fieldSaving) return;
    if (editingIndex != null) return;
    const lastIndex = items.length - 1;
    if (lastIndex < 0) return;
    const last = toDraft(items[lastIndex]);
    if (isSkillEmpty(last) || !last.value.trim()) {
      setDrafts(items.map(toDraft));
      setEditingIndex(lastIndex);
      setOpenIndex(lastIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeAdd, items.length]);

  useEffect(() => {
    if (!composeAdd || editingIndex == null) return;
    const frame = window.requestAnimationFrame(() => {
      editingCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [composeAdd, editingIndex]);

  const startEdit = (index: number) => {
    if (!editSession || fieldSaving) return;
    syncDraftsFromItems();
    setEditingIndex(index);
    setOpenIndex(index);
    setUploadError(null);
  };

  const cancelEdit = async () => {
    if (fieldSaving || editingIndex == null) return;
    const original = items[editingIndex];
    const wasEmpty = original ? isSkillEmpty(toDraft(original)) : true;
    setEditingIndex(null);
    setUploadError(null);
    syncDraftsFromItems();
    if (wasEmpty) {
      onCancelNewItem?.();
      return;
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

  const updateDraft = (index: number, next: PortfolioStrengthDraft) => {
    setDrafts((prev) => prev.map((item, itemIndex) => (itemIndex === index ? next : item)));
  };

  const fieldHasChanges =
    editingIndex != null &&
    drafts[editingIndex] != null &&
    items[editingIndex] != null &&
    !draftsEqual(drafts[editingIndex], toDraft(items[editingIndex]));

  const globalHasChanges =
    drafts.length === items.length &&
    drafts.some((draft, index) => !draftsEqual(draft, toDraft(items[index])));

  useEffect(() => {
    onGlobalHasChangesChange?.(isGlobal ? globalHasChanges : false);
  }, [globalHasChanges, isGlobal, onGlobalHasChangesChange]);

  const confirmEdit = async () => {
    if (editingIndex == null || !onItemSave || fieldSaving) return;
    const draft = drafts[editingIndex];
    if (!draft) return;
    const cleaned = cleanDraft(draft);
    if (!skillHasContent(cleaned)) {
      setEditingIndex(null);
      setUploadError(null);
      if (isSkillEmpty(draft)) {
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
      await onItemSave(editingIndex, cleaned);
      setEditingIndex(null);
      setUploadError(null);
    } catch {
      // Parent surfaces the error.
    }
  };

  const confirmGlobal = async () => {
    if (!onItemsSave || fieldSaving) return;
    const cleaned = drafts.map(cleanDraft).filter((item) => item.value.length > 0);
    const currentFilled = items.map(toDraft).map(cleanDraft).filter((item) => item.value.length > 0);
    const unchanged =
      cleaned.length === currentFilled.length &&
      cleaned.every((item, index) => draftsEqual(item, currentFilled[index]));
    if (unchanged && cleaned.length === items.length) return;
    try {
      await onItemsSave(cleaned);
    } catch {
      // Parent surfaces the error.
    }
  };

  const confirmGlobalRef = useRef(confirmGlobal);
  confirmGlobalRef.current = confirmGlobal;

  useEffect(() => {
    if (!isGlobal) {
      onRegisterGlobalConfirm?.(null);
      return;
    }
    onRegisterGlobalConfirm?.(async () => {
      await confirmGlobalRef.current();
    });
    return () => onRegisterGlobalConfirm?.(null);
  }, [isGlobal, onRegisterGlobalConfirm]);

  const visibleEntries = items
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item, index }) =>
        actionsVisible || index === editingIndex || item.value.trim()
    )
    .sort((a, b) => {
      // Keep the tool being composed/edited at the top of Tools so the fields are obvious.
      if (editingIndex != null) {
        if (a.index === editingIndex) return -1;
        if (b.index === editingIndex) return 1;
      }
      const rank = (category: string) => {
        const matched = matchSpecialtyOption(category, specialtyOptions);
        if (!matched) return 999;
        const index = specialtyOptions.indexOf(matched);
        return index === -1 ? 998 : index;
      };
      return rank(a.item.category) - rank(b.item.category);
    });

  useEffect(() => {
    if (openIndex == null) return;
    if (editingIndex === openIndex) return;
    const stillVisible = items.some(
      (item, index) =>
        index === openIndex && (actionsVisible || index === editingIndex || item.value.trim())
    );
    if (!stillVisible) {
      const first = items.findIndex(
        (item, index) => actionsVisible || index === editingIndex || item.value.trim()
      );
      setOpenIndex(first >= 0 ? first : null);
    }
  }, [openIndex, items, actionsVisible, editingIndex]);

  const toggleOpen = (index: number) => {
    if (fieldSaving) return;
    if (editingIndex != null && editingIndex !== index) return;
    setOpenIndex((current) => (current === index ? null : index));
    setUploadError(null);
  };

  const skillsBlock = (
    <PortfolioFlatField
      label="Skills"
      emptyLabel="No skill tags"
      className="!py-3"
      editing={editingSkills}
      confirming={savingSkillTags}
      canConfirm={skillsHaveChanges}
      onEdit={
        onSkillTagsSave
          ? () => {
              setDraftSkillTags(parseSpecialtyTags(skillTags));
              setEditingSkills(true);
            }
          : undefined
      }
      onCancelEdit={() => {
        setDraftSkillTags(parseSpecialtyTags(skillTags));
        setEditingSkills(false);
      }}
      onConfirm={() => {
        void (async () => {
          try {
            await persistSkillTags(draftSkillTags);
            setEditingSkills(false);
          } catch {
            // Keep editor open; persistSkillTags already restored draft on failure.
          }
        })();
      }}
      editControl={
        <SkillTagsEditor
          tags={draftSkillTags}
          onChange={setDraftSkillTags}
          disabled={savingSkillTags}
          editable
        />
      }
    >
      <SkillTagsEditor
        tags={parseSpecialtyTags(skillTags)}
        onChange={() => undefined}
        editable={false}
      />
    </PortfolioFlatField>
  );

  if (visibleEntries.length === 0 && !actionsVisible && !composeAdd) {
    return (
      <div className="space-y-4 pb-2">
        {skillsBlock}
        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
            Tools
          </h3>
          <p className="py-6 text-center text-sm italic text-neutral-500 dark:text-neutral-400">
            No tools yet. Click Add tool to create one.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-2">
      {skillsBlock}

      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
          Tools
        </h3>
      <div className="flex flex-col gap-3.5 pb-5">
        {visibleEntries.map(({ item, index }, position) => {
          const composingThis = composeAdd && editingIndex === index;
          const groupLabel = specialtyGroupLabel(item.category, specialtyOptions);
          const previousLabel =
            position > 0
              ? specialtyGroupLabel(visibleEntries[position - 1].item.category, specialtyOptions)
              : null;
          const showGroupHeading =
            !composingThis &&
            groupLabel !== previousLabel &&
            !(position > 0 && composeAdd && visibleEntries[position - 1].index === editingIndex);
          const draft = drafts[index] ?? toDraft(item);
          const editing = !deleteMode && Boolean(showFieldActions && editingIndex === index);
          const open = openIndex === index || editing;
          const display = editing ? draft : toDraft(item);
          const nameValue = display.value.trim();
          const categoryValue = display.category.trim();
          const levelValue = levelLabel(display.level);
          const customDescription = display.description.trim();
          const descriptionDisplay =
            customDescription || (nameValue ? getSkillUsageDescription(nameValue) : '');
          const descriptionMuted = Boolean(nameValue) && !customDescription;
          const experienceLine = experienceSummary(display);
          const confirming = fieldSaving && editingIndex === index;
          const showConfirmActions = Boolean(
            !deleteMode && showFieldActions && editing && onItemSave
          );
          const showEditAffordance = Boolean(editSession && !editing && !deleteMode);
          const canConfirm = Boolean(draft.value.trim()) && fieldHasChanges;

          const onIconFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            setUploadingIcon(true);
            setUploadError(null);
            try {
              const uploaded = await uploadContentMedia(file);
              updateDraft(index, { ...draft, iconUrl: uploaded });
            } catch (e) {
              setUploadError(getApiErrorMessage(e, 'Unable to upload logo.'));
            } finally {
              setUploadingIcon(false);
            }
          };

          return (
            <div key={item.id} className="space-y-2">
              {composingThis ? (
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-600 dark:text-orange-400">
                  New tool
                </p>
              ) : showGroupHeading ? (
                <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                  {groupLabel}
                </h4>
              ) : null}
            <article
              key={item.id}
              ref={editing ? editingCardRef : undefined}
              className={`relative overflow-hidden rounded-xl border transition dark:border-transparent ${
                open
                  ? 'border-neutral-300 bg-transparent dark:bg-white/[0.07]'
                  : 'border-neutral-200/90 bg-transparent hover:border-neutral-300 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]'
              }`}
            >
              <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-4 py-3 sm:grid-cols-[minmax(0,72%)_auto_1fr_auto]">
                <div className="flex min-w-0 items-center gap-2.5">
                  {editing ? (
                    <>
                      <input
                        ref={iconInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                        className="sr-only"
                        onChange={(event) => void onIconFileChange(event)}
                      />
                      <button
                        type="button"
                        disabled={fieldSaving || uploadingIcon}
                        onClick={() => iconInputRef.current?.click()}
                        title="Upload logo"
                        aria-label="Upload logo"
                        className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 transition hover:bg-neutral-200 disabled:opacity-40 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
                      >
                        {uploadingIcon ? (
                          <LoadingSpinner size="sm" />
                        ) : draft.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={draft.iconUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <CreatorToolLogo label={draft.value || '?'} size={16} />
                        )}
                      </button>
                      <input
                        type="text"
                        value={draft.value}
                        onChange={(event) =>
                          updateDraft(index, { ...draft, value: event.target.value })
                        }
                        placeholder="Skill or tool name"
                        className={`${portfolioInlineInputClass} min-w-0 flex-1 py-1.5 text-sm`}
                        autoFocus={editingIndex === index}
                        disabled={fieldSaving}
                      />
                    </>
                  ) : (
                    <>
                      <CreatorToolLogo
                        label={nameValue || 'Tool'}
                        iconUrl={item.iconUrl}
                        size={20}
                      />
                      <button
                        type="button"
                        className="min-w-0 truncate text-left text-sm font-semibold text-neutral-950 dark:text-white"
                        onClick={() => {
                          if (deleteMode) return;
                          toggleOpen(index);
                        }}
                      >
                        {nameValue || (
                          <span className="italic text-neutral-400">Untitled tool</span>
                        )}
                      </button>
                    </>
                  )}
                </div>

                <div className="hidden min-w-0 items-center gap-2 sm:inline-flex">
                  {editing ? (
                    <>
                      <select
                        value={matchSpecialtyOption(draft.category, specialtyOptions)}
                        onChange={(event) =>
                          updateDraft(index, { ...draft, category: event.target.value })
                        }
                        className={`${portfolioInlineInputClass} w-[9.5rem] py-1.5 text-sm`}
                        disabled={fieldSaving || specialtyOptions.length === 0}
                      >
                        <option value="">{specialtyOptions.length === 0 ? 'Add specialties first' : 'Specialty'}</option>
                        {specialtyOptions.map((specialty) => (
                          <option key={specialty} value={specialty}>
                            {specialty}
                          </option>
                        ))}
                      </select>
                      <select
                        value={draft.level ?? ''}
                        onChange={(event) =>
                          updateDraft(index, {
                            ...draft,
                            level: (event.target.value || null) as StrengthToolLevel | null,
                          })
                        }
                        className={`${portfolioInlineInputClass} w-[8.5rem] py-1.5 text-sm`}
                        disabled={fieldSaving}
                      >
                        <option value="">Not set</option>
                        {LEVEL_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex min-w-[5.5rem] justify-start">
                        {categoryValue ? (
                          <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-600 dark:bg-white/[0.06] dark:text-neutral-300">
                            {categoryValue}
                          </span>
                        ) : null}
                      </span>
                      <span className="inline-flex min-w-[6.5rem] justify-start">
                        {levelValue ? (
                          <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-[#EA580C] dark:text-[#FB923C]">
                            {levelValue}
                          </span>
                        ) : null}
                      </span>
                    </>
                  )}
                </div>

                <span aria-hidden className="hidden sm:block" />

                {deleteMode && onRemoveItem ? (
                  pendingDeleteIndex === index ? (
                    <div className="inline-flex shrink-0 items-center gap-1.5 justify-self-end">
                      <span className="hidden text-[11px] font-medium text-red-600 sm:inline dark:text-red-400">
                        Delete?
                      </span>
                      <IconButton
                        label={`Confirm delete ${nameValue || 'tool'}`}
                        tone="confirm"
                        disabled={fieldSaving}
                        onClick={() => {
                          void (async () => {
                            const wasLast = items.length <= 1;
                            await onRemoveItem(index);
                            setPendingDeleteIndex(null);
                            setEditingIndex(null);
                            setOpenIndex((current) => (current === index ? null : current));
                            if (wasLast) onDeleteModeChange?.(false);
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
                    </div>
                  ) : (
                    <IconButton
                      label={`Delete ${nameValue || 'tool'}`}
                      disabled={fieldSaving}
                      onClick={() => {
                        setOpenIndex(null);
                        setEditingIndex(null);
                        setPendingDeleteIndex(index);
                      }}
                    >
                      <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                    </IconButton>
                  )
                ) : showConfirmActions ? (
                  <div className="inline-flex shrink-0 items-center gap-1.5 justify-self-end">
                    <IconButton
                      label={
                        draft.value.trim()
                          ? fieldHasChanges
                            ? 'Confirm skill'
                            : 'No changes'
                          : 'Discard empty skill'
                      }
                      tone={canConfirm ? 'confirm' : 'neutral'}
                      disabled={fieldSaving || (Boolean(draft.value.trim()) && !fieldHasChanges)}
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
                ) : (
                  <div className="inline-flex shrink-0 items-center gap-1.5 justify-self-end">
                    {showEditAffordance ? (
                      <button
                        type="button"
                        disabled={fieldSaving}
                        onClick={() => startEdit(index)}
                        title="Edit skill"
                        aria-label={`Edit ${nameValue || 'skill'}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:border-[#F97316]/40 hover:text-[#EA580C] disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-[#FB923C]"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => toggleOpen(index)}
                      aria-expanded={open}
                      className="inline-flex shrink-0 items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                      <FontAwesomeIcon
                        icon={open ? faChevronDown : faChevronRight}
                        className="h-3 w-3"
                        fixedWidth
                      />
                    </button>
                  </div>
                )}
              </div>

              {open && !deleteMode ? (
                <div className="divide-y divide-neutral-200/40 border-t border-neutral-200/40 px-2 dark:divide-white/[0.05] dark:border-white/[0.05] sm:px-3">
                  {uploadError && editingIndex === index ? (
                    <p className="px-1 py-2 text-xs text-red-600 dark:text-red-400">{uploadError}</p>
                  ) : null}

                  <PortfolioFlatField
                    label="Description"
                    value={descriptionDisplay || null}
                    emptyLabel="Not set"
                    muted={descriptionMuted}
                    editing={editing}
                    editControl={
                      <div className="space-y-1.5">
                        <textarea
                          value={draft.description}
                          onChange={(event) =>
                            updateDraft(index, {
                              ...draft,
                              description: event.target.value.slice(0, MAX_DESCRIPTION),
                            })
                          }
                          rows={3}
                          maxLength={MAX_DESCRIPTION}
                          placeholder={
                            draft.value.trim()
                              ? getSkillUsageDescription(draft.value.trim())
                              : 'Short description (optional)'
                          }
                          className={`${portfolioInlineInputClass} resize-y font-medium leading-relaxed`}
                          disabled={fieldSaving}
                        />
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {draft.description.trim()
                            ? `${draft.description.trim().length}/${MAX_DESCRIPTION}`
                            : 'Leave empty to keep the automatic description.'}
                        </p>
                      </div>
                    }
                  />

                  <PortfolioFlatField
                    label="Use cases"
                    editing={editing}
                    emptyLabel="Not set"
                    editControl={
                      <UseCasesEditor
                        useCases={draft.useCases}
                        onChange={(useCases) => updateDraft(index, { ...draft, useCases })}
                        disabled={fieldSaving}
                      />
                    }
                  >
                    {display.useCases.length > 0 ? (
                      <PortfolioLanguageChips languages={display.useCases} />
                    ) : undefined}
                  </PortfolioFlatField>

                  <div className="grid items-start gap-x-8 sm:grid-cols-2">
                    <PortfolioFlatField
                      label="Experience"
                      value={experienceLine || null}
                      emptyLabel="Not set"
                      editing={editing}
                      editControl={
                        <input
                          type="number"
                          min={0}
                          max={40}
                          value={draft.experienceYears ?? ''}
                          onChange={(event) => {
                            const raw = event.target.value;
                            updateDraft(index, {
                              ...draft,
                              experienceYears:
                                raw === '' ? null : Math.max(0, Math.min(40, Number(raw))),
                            });
                          }}
                          placeholder="e.g. 3"
                          className={portfolioInlineInputClass}
                          disabled={fieldSaving}
                        />
                      }
                    />
                    <PortfolioFlatField
                      label="Currently used"
                      value={currentlyUsedLabel(display.currentlyUsed) || null}
                      emptyLabel="Not set"
                      editing={editing}
                      editControl={
                        <label className="inline-flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={draft.currentlyUsed === true}
                            onChange={(event) =>
                              updateDraft(index, {
                                ...draft,
                                currentlyUsed: event.target.checked ? true : null,
                              })
                            }
                            disabled={fieldSaving}
                            className="h-4 w-4 rounded border-neutral-300 text-[#EA580C]"
                          />
                          <span className="text-[15px] font-semibold text-neutral-900 dark:text-white">
                            Used in current work
                          </span>
                        </label>
                      }
                    />
                  </div>
                </div>
              ) : null}
            </article>
            </div>
          );
        })}
      </div>
      </section>
    </div>
  );
}
