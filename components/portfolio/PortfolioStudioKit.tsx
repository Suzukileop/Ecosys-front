'use client';

import { trPlural } from '@/lib/i18n/active';
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { getApiErrorMessage } from '@/lib/api-error';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { faCheck, faChevronLeft, faChevronRight, faCircleExclamation, faCircleInfo, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useT } from '@/lib/i18n/I18nProvider';

/* Field anatomy (the News composer's field): a small secondary label above a filled, square field on
   the field tone (`--gn-field`), with a 1px frame in the line tone so it still reads as editable on the
   card; hover darkens the frame, focus draws a 2px ink ring inside the edge — no accent colour, and
   every colour from the News tokens (hex fallbacks only for a render outside the News scope). */
export const STUDIO_LABEL_CLASS =
  'block text-[13px] font-medium leading-[18px] text-[color:var(--gn-ink2,#536471)]';
export const STUDIO_INLINE_TEXT_CLASS =
  'block w-full rounded-none bg-[color:var(--gn-field,#EFF3F4)] px-3.5 py-2.5 text-[15px] font-normal text-[color:var(--gn-ink,#0F1419)] caret-[color:var(--gn-ink,#0F1419)] shadow-[inset_0_0_0_1px_var(--gn-line,#EFF3F4)] outline-none transition-[box-shadow] duration-150 placeholder:font-normal placeholder:text-[color:var(--gn-ink3,#8B98A5)] hover:shadow-[inset_0_0_0_1px_var(--gn-ink3,#8B98A5)] focus:shadow-[inset_0_0_0_2px_var(--gn-ink,#0F1419)] focus-visible:shadow-[inset_0_0_0_2px_var(--gn-ink,#0F1419)] disabled:opacity-60';
/**
 * Read-only value: no box at all — the text alone under its label, on the editable fields' 40px
 * line so a row of mixed fields stays level. Only what can be edited is drawn as a field.
 * (Editable fields paint `--gn-inset`, not `#FFFFFF`: the News theme repaints every `bg-[#FFFFFF]`
 * in the card tone, which turned them grey on a white page.)
 */
export const STUDIO_STATIC_BOX_CLASS = 'flex min-h-[44px] w-full items-center';
export const STUDIO_BLOCK_CLASS =
  'grid grid-cols-1 gap-x-6 gap-y-6 py-6 first:pt-2 last:pb-8';
/** Menus and tooltips: the site's menu panel (Products' "Sort by") — a solid fill, a crisp 1px frame and
    a short drop shadow. No glow halo and no blur behind it. */
export const STUDIO_GLASS_PANEL_CLASS =
  'overflow-hidden rounded-2xl bg-[#FEFEFE] shadow-[0_0_0_1px_#E1E8ED,0_8px_20px_-14px_rgba(15,20,25,0.18)] dark:bg-[#000000] dark:shadow-[0_0_0_1px_#2F3336]';
export const STUDIO_BARE_INPUT_CLASS =
  'block w-full bg-transparent p-0 pb-1.5 caret-current outline-none placeholder:font-normal placeholder:not-italic placeholder:text-[#8B98A5] disabled:opacity-60 dark:placeholder:text-[#536471]';
export const STUDIO_VALUE_CLASS = 'text-[15px] font-normal text-[#0F1419] dark:text-[#E7E9EA]';
export const STUDIO_SECONDARY_CLASS = 'text-[14px] text-[#536471] dark:text-[#71767B]';
export const STUDIO_EMPTY_CLASS = 'text-[15px] text-[#8B98A5] dark:text-[#536471]';
/** Rows are separated by spacing, not hairlines (X rollout: no divider lines between blocks). */
export const STUDIO_ROW_RULE = 'border-b border-transparent';
/** Round icon buttons — same resting contrast and inverted hover as the visibility eye. */
export const STUDIO_ICON_BUTTON_TONES = {
  neutral:
    'border-[#CFD9DE] bg-white text-[#0F1419] hover:border-[#0F1419] hover:bg-[#0F1419] hover:text-white dark:border-[#536471] dark:bg-transparent dark:text-[#E7E9EA] dark:hover:border-[#EFF3F4] dark:hover:bg-[#EFF3F4] dark:hover:text-[#0F1419]',
  active:
    'border-[#0F1419] bg-[#0F1419]/[0.06] text-[#0F1419] dark:border-[#E7E9EA] dark:bg-white/10 dark:text-[#E7E9EA]',
  confirm:
    'border-[#0F1419] bg-[#0F1419] text-white hover:border-[#272C30] hover:bg-[#272C30] dark:border-[#EFF3F4] dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:border-[#D7DBDC] dark:hover:bg-[#D7DBDC]',
  cancel:
    'border-[#CFD9DE] bg-white text-[#536471] hover:border-[#0F1419] hover:text-[#0F1419] dark:border-[#536471] dark:bg-transparent dark:text-[#E7E9EA] dark:hover:border-[#E7E9EA] dark:hover:text-white',
  danger:
    'border-[#CFD9DE] bg-white text-[#0F1419] hover:border-[#F4212E] hover:bg-[#F4212E] hover:text-white dark:border-[#536471] dark:bg-transparent dark:text-[#E7E9EA] dark:hover:border-[#F4212E] dark:hover:bg-[#F4212E] dark:hover:text-white',
} as const;
export const STUDIO_FLOAT_IN_STYLE = { animation: 'pf-float-in 220ms cubic-bezier(0.16, 1, 0.3, 1)' } as const;

/**
 * Resting hairline that turns coral while focus is inside. A wrapper holding its own underlined
 * inputs (`.studio-underline` or `[data-studio-underline]`) stays neutral so only one line lights up.
 */
export function StudioUnderline({
  className = '',
  quiet = false,
  children,
}: {
  className?: string;
  /** No resting hairline — the line only shows on focus (dense lists). */
  quiet?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`studio-underline group relative min-w-0 ${className}`}>
      {children}
      <span
        aria-hidden
        className={`studio-underline-line pointer-events-none absolute inset-x-0 bottom-0 h-px ${
          quiet ? 'bg-transparent' : 'bg-black/[0.06] dark:bg-white/[0.06]'
        }`}
      />
    </div>
  );
}

export function StudioField({
  label,
  htmlFor,
  aside,
  hint,
  className = '',
  children,
}: {
  label: string;
  htmlFor?: string;
  aside?: ReactNode;
  /** Guidance shown in a "!" tooltip next to the label instead of inline copy. */
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  const t = useT();
  /* No resting underline any more: the field itself is a filled box (STUDIO_INLINE_TEXT_CLASS).
     The aside (the visibility pill) sits right after its own label. Every label line is 28px tall —
     the pill's height — so a field with a pill and one without line up, and the pill keeps an 8px gap
     above its field instead of being pulled down onto it. */
  return (
    <div className={`group relative min-w-0 ${className}`}>
      <div className="mb-2 flex min-h-7 items-center gap-2">
        <label htmlFor={htmlFor} className={STUDIO_LABEL_CLASS}>
          {label}
        </label>
        {hint ? (
          <StudioInfoTip label={t('About {label}', { label })} glyph="exclamation" align="left">
            {hint}
          </StudioInfoTip>
        ) : null}
        {aside ? <div className="relative z-10 shrink-0">{aside}</div> : null}
      </div>
      {children}
    </div>
  );
}

/** Section title row: mono label on the left, quiet actions on the right. */
export function StudioSectionHeader({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className="mb-4 flex min-h-8 items-center justify-between gap-4">
      <h3 className="text-[15px] font-bold text-[#0F1419] dark:text-[#E7E9EA]">{label}</h3>
      {children ? <div className="flex shrink-0 items-center gap-3">{children}</div> : null}
    </div>
  );
}

/** Items floating on one airy line, split by a thin slash. */
export function StudioSlashLine({ items, className = 'pb-3' }: { items: ReactNode[]; className?: string }) {
  return (
    <p className={`flex flex-wrap items-baseline gap-y-1.5 ${className}`}>
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 ? (
            <span aria-hidden className="px-3 text-base font-light text-neutral-300 dark:text-neutral-600">
              /
            </span>
          ) : null}
          {item}
        </Fragment>
      ))}
    </p>
  );
}

const STUDIO_ACTION_ICONS = {
  add: faPlus,
  edit: faPenToSquare,
  done: faCheck,
  remove: faTrashCan,
  previous: faChevronLeft,
  next: faChevronRight,
} as const;

/** Icon-only round action, same shape and contrast as the visibility eye. */
export function StudioIconAction({
  icon,
  label,
  onClick,
  disabled = false,
  pressed,
}: {
  icon: keyof typeof STUDIO_ACTION_ICONS;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
}) {
  const tone = icon === 'remove' ? 'danger' : pressed ? 'active' : 'neutral';
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-expanded={pressed}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40 ${STUDIO_ICON_BUTTON_TONES[tone]}`}
    >
      <FontAwesomeIcon icon={STUDIO_ACTION_ICONS[icon]} className="h-3.5 w-3.5" fixedWidth />
    </button>
  );
}

/** Small info glyph: help text shows on hover, keyboard focus, or tap. */
export function StudioInfoTip({
  label = 'More info',
  glyph = 'info',
  align = 'right',
  children,
}: {
  label?: string;
  glyph?: 'info' | 'exclamation';
  /** Edge of the trigger the tooltip anchors to. */
  align?: 'left' | 'right';
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  return (
    <span ref={rootRef} className="group/tip relative inline-flex shrink-0">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 transition-colors duration-200 hover:text-black focus-visible:text-black dark:text-neutral-500 dark:hover:text-white dark:focus-visible:text-white"
      >
        <FontAwesomeIcon
          icon={glyph === 'exclamation' ? faCircleExclamation : faCircleInfo}
          className="h-3.5 w-3.5"
          fixedWidth
        />
      </button>
      <span
        role="tooltip"
        className={`${STUDIO_GLASS_PANEL_CLASS} absolute bottom-full ${align === 'left' ? 'left-0' : 'right-0'} z-50 mb-2 w-64 p-3 text-[13px] leading-relaxed text-neutral-700 transition-opacity duration-200 dark:text-neutral-300 ${
          open
            ? 'visible opacity-100'
            : 'invisible opacity-0 group-hover/tip:visible group-hover/tip:opacity-100 group-has-[:focus-visible]/tip:visible group-has-[:focus-visible]/tip:opacity-100'
        }`}
      >
        {children}
      </span>
    </span>
  );
}

/** Quiet text trigger + glass listbox, replacing native selects inside the studio. */
export function StudioMenuSelect<T extends string>({
  value,
  options,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: T | null;
  options: Array<{ value: T | null; label: string }>;
  onChange: (next: T | null) => void;
  placeholder: string;
  ariaLabel: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const current = options.find((option) => option.value === value && option.value !== null);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 text-[14px] transition-colors duration-200 hover:text-black dark:hover:text-white ${
          current ? 'text-neutral-600 dark:text-neutral-300' : 'text-neutral-400 dark:text-neutral-500'
        }`}
      >
        {current?.label ?? placeholder}
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          style={STUDIO_FLOAT_IN_STYLE}
          className={`${STUDIO_GLASS_PANEL_CLASS} absolute right-0 top-full z-50 mt-2 w-44 p-1.5`}
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <li key={option.label} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[14px] transition-colors duration-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] ${
                    selected ? 'font-semibold text-black dark:text-white' : 'text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  {t(option.label)}
                  {selected ? <span aria-hidden className="h-1 w-1 rounded-full bg-current" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function StudioFoldToggle({ open, onClick }: { open: boolean; onClick: () => void }) {
  const t = useT();
  return <StudioIconAction icon={open ? 'done' : 'edit'} label={open ? t('Done') : t('Edit')} pressed={open} onClick={onClick} />;
}

export function StudioRemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-400 opacity-0 transition-all duration-300 hover:bg-red-500/10 hover:text-red-500 focus-visible:opacity-100 group-hover/row:opacity-100 group-focus-within/row:opacity-100 dark:text-neutral-500"
    >
      <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
    </button>
  );
}

function FloatingSaveBar({
  visible,
  saving,
  count,
  onDiscard,
  onSave,
}: {
  visible: boolean;
  saving: boolean;
  count: number;
  onDiscard: () => void;
  onSave: () => void;
}) {
  const t = useT();
  const tabIndex = visible ? 0 : -1;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div
        role="region"
        aria-label={t('Unsaved changes')}
        aria-hidden={!visible}
        className={`flex items-center gap-2 rounded-full bg-[#0F1419] py-2 pl-5 pr-2 text-white shadow-[0_10px_32px_-8px_rgba(0,0,0,0.45)] transition-all dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:shadow-[0_10px_32px_-8px_rgba(0,0,0,0.8)] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          visible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
        }`}
      >
        <span className="mr-3 hidden items-center gap-2.5 text-[15px] font-medium opacity-80 sm:inline-flex">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          {count} {t('unsaved')} {trPlural(count, 'change', 'changes')}
        </span>
        <button
          type="button"
          tabIndex={tabIndex}
          disabled={saving}
          onClick={onDiscard}
          className="h-10 rounded-full px-4 text-[15px] font-bold opacity-80 transition-[background-color,opacity] duration-200 hover:bg-white/10 hover:opacity-100 disabled:opacity-40 dark:hover:bg-black/[0.06]"
        >
          {t('Discard')}
        </button>
        <button
          type="button"
          tabIndex={tabIndex}
          disabled={saving}
          onClick={onSave}
          className="h-10 rounded-full bg-white px-5 text-[15px] font-bold text-[#0F1419] transition-colors duration-200 hover:bg-[#D7DBDC] disabled:opacity-60 dark:bg-[#0F1419] dark:text-white dark:hover:bg-[#272C30]"
        >
          {saving ? t('Saving…') : t('Save changes')}
        </button>
      </div>
    </div>
  );
}

type StudioToast = { id: number; tone: 'success' | 'error' | 'idle'; message: string };

function StudioSaveToast({ toast }: { toast: StudioToast | null }) {
  if (!toast) return null;
  const dot =
    toast.tone === 'success' ? 'bg-current' : toast.tone === 'error' ? 'bg-[#F4212E]' : 'bg-current opacity-50';
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[61] flex justify-center px-4" role="status">
      <div
        key={toast.id}
        style={STUDIO_FLOAT_IN_STYLE}
        className="flex items-center gap-2.5 rounded-xl bg-[#0F1419] px-4 py-3 text-[15px] font-medium leading-5 text-white shadow-[0_10px_32px_-8px_rgba(0,0,0,0.45)] dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:shadow-[0_10px_32px_-8px_rgba(0,0,0,0.8)]"
      >
        <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {toast.message}
      </div>
    </div>
  );
}

export type StudioChangeHandler<T> = <K extends keyof T>(key: K, value: T[K]) => void;

const defaultSignature = (_key: PropertyKey, value: unknown) =>
  typeof value === 'string' ? value : JSON.stringify(value ?? null);

/**
 * Draft store for an inline studio: edits live in a ref, so typing never re-renders the
 * studio — only the dirty-field count is state. Also binds Cmd/Ctrl+S to save.
 */
/** Fired after a successful save or a discard so open inline editors can fold back. */
const STUDIO_SETTLED_EVENT = 'studio:settled';

/** Open/closed state for a foldable inline editor; closes itself on save or discard. */
export function useStudioFold(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener(STUDIO_SETTLED_EVENT, close);
    return () => window.removeEventListener(STUDIO_SETTLED_EVENT, close);
  }, []);
  return [open, setOpen] as const;
}

export function useInlineStudio<T extends object>({
  initial,
  onSave,
  signature = defaultSignature,
}: {
  initial: T;
  onSave: (draft: T) => Promise<void>;
  signature?: (key: keyof T, value: T[keyof T]) => string;
}) {
  const t = useT();
  const baselineRef = useRef(initial);
  const draftRef = useRef<T>(initial);
  const dirtyKeysRef = useRef(new Set<keyof T>());
  const savingRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);
  const [baseline, setBaseline] = useState(initial);
  const [dirtyCount, setDirtyCount] = useState(0);
  const [revision, setRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<StudioToast | null>(null);

  const change = useCallback<StudioChangeHandler<T>>(
    (key, value) => {
      draftRef.current = { ...draftRef.current, [key]: value };
      const dirty = dirtyKeysRef.current;
      if (signature(key, value) === signature(key, baselineRef.current[key])) dirty.delete(key);
      else dirty.add(key);
      setDirtyCount(dirty.size);
    },
    [signature]
  );

  const showToast = useCallback((tone: StudioToast['tone'], message: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ id: Date.now(), tone, message });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const discard = useCallback(() => {
    draftRef.current = baselineRef.current;
    dirtyKeysRef.current.clear();
    setDirtyCount(0);
    setRevision((current) => current + 1);
    window.dispatchEvent(new Event(STUDIO_SETTLED_EVENT));
  }, []);

  const save = useCallback(async () => {
    if (savingRef.current) return;
    if (dirtyKeysRef.current.size === 0) {
      showToast('idle', 'Everything is up to date');
      return;
    }
    savingRef.current = true;
    setSaving(true);
    const snapshot = draftRef.current;
    try {
      await onSave(snapshot);
      baselineRef.current = snapshot;
      setBaseline(snapshot);
      const dirty = dirtyKeysRef.current;
      dirty.clear();
      (Object.keys(snapshot) as Array<keyof T>).forEach((key) => {
        if (signature(key, draftRef.current[key]) !== signature(key, snapshot[key])) dirty.add(key);
      });
      setDirtyCount(dirty.size);
      window.dispatchEvent(new Event(STUDIO_SETTLED_EVENT));
      showToast('success', 'Changes saved');
    } catch (e) {
      showToast('error', getApiErrorMessage(e, t('Could not save changes')));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [onSave, showToast, signature, t]);

  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const commit = useCallback(() => {
    void saveRef.current();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void saveRef.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const getDraft = useCallback(() => draftRef.current, []);

  return { baseline, revision, change, commit, discard, getDraft, dirtyCount, saving, toast };
}

/** Floating bar + toast pair, wired to a `useInlineStudio` instance. */
export function StudioSaveChrome({
  studio,
}: {
  studio: Pick<ReturnType<typeof useInlineStudio>, 'dirtyCount' | 'saving' | 'toast' | 'discard' | 'commit'>;
}) {
  return (
    <>
      <FloatingSaveBar
        visible={(studio.dirtyCount > 0 || studio.saving) && !studio.toast}
        saving={studio.saving}
        count={studio.dirtyCount}
        onDiscard={studio.discard}
        onSave={studio.commit}
      />
      <StudioSaveToast toast={studio.toast} />
    </>
  );
}
