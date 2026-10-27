'use client';

/**
 * Building blocks of the Navigation settings panel, in the spirit of pro editors (CapCut, Framer,
 * Figma): dark, airy, one accent. Colours, radii and the accent live as `--np-*` tokens on
 * `.np-panel` (globals.css), so the accent is changed in one place.
 *
 * Reusable on their own: NpToggle, NpToggleRow, NpSegmentedControl, NpOptionCard, NpStepSlider,
 * NpCollapsibleSection. NpPanelShell is the frame: fixed header, tabs, scrolling body, fixed footer.
 */

import localFont from 'next/font/local';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleHalfStroke, faSun, faMoon, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useT } from '@/lib/i18n/I18nProvider';

const geist = localFont({
  src: '../../app/fonts/GeistVF.woff',
  weight: '100 900',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

/* ------------------------------------------------------------------------------------------------
 * Icons — stroke 1.8, currentColor.
 * --------------------------------------------------------------------------------------------- */

function NpIcon({ children, className = 'h-[18px] w-[18px]' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const UndoIcon = () => (
  <NpIcon>
    <path d="m15 6-6 6 6 6" />
  </NpIcon>
);

const RedoIcon = () => (
  <NpIcon>
    <path d="m9 6 6 6-6 6" />
  </NpIcon>
);

const CloseIcon = () => (
  <NpIcon>
    <path d="M6 6l12 12M18 6 6 18" />
  </NpIcon>
);

const BackIcon = () => (
  <NpIcon>
    <path d="m15 6-6 6 6 6" />
  </NpIcon>
);

const ResetIcon = () => (
  <NpIcon className="h-4 w-4">
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </NpIcon>
);

const ChevronIcon = ({ className }: { className?: string }) => (
  <NpIcon className={className}>
    <path d="m6 9 6 6 6-6" />
  </NpIcon>
);

/**
 * True inside NpPanelShell. Shared settings blocks (switch rows, preview-card grids, sections) read it
 * to take this panel's look, so the per-layout editors nested in it match without being rewritten.
 */
const NpPanelContext = createContext(false);

export function useInNpPanel() {
  return useContext(NpPanelContext);
}

/* ------------------------------------------------------------------------------------------------
 * Panel frame
 * --------------------------------------------------------------------------------------------- */

export type NpPanelChrome = {
  /** Below lg the dock shows one screen at a time: the way back to the section list. */
  onBack?: () => void;
  onClose: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDone: () => void;
  hideClose?: boolean;
};

export type NpTab<T extends string> = { id: T; label: string };

function NpIconButton({
  label,
  onClick,
  disabled,
  className = '',
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`np-icon-btn ${className}`}
    >
      {children}
    </button>
  );
}

/** Underline tabs; arrow keys move between them (WAI-ARIA tabs pattern). */
function NpTabs<T extends string>({
  tabs,
  value,
  onChange,
  idBase,
  label,
}: {
  tabs: NpTab<T>[];
  value: T;
  onChange: (value: T) => void;
  idBase: string;
  label: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex((tab) => tab.id === value);
    let next = -1;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    if (next < 0) return;
    event.preventDefault();
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="np-tabs" onKeyDown={onKeyDown}>
      {tabs.map((tab, index) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${idBase}-tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`${idBase}-panel`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className="np-tab"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Header (title, default / modified status, undo · redo | close), tabs, scrolling body and footer
 * (reset · done). Without `chrome` it is just the tabs and the body, for hosts that bring their own.
 */
export function NpPanelShell<T extends string>({
  title,
  modified,
  tabs,
  activeTab,
  onTabChange,
  onReset,
  chrome,
  tone = 'studio',
  children,
}: {
  title: string;
  modified: boolean;
  tabs: NpTab<T>[];
  activeTab: T;
  onTabChange: (value: T) => void;
  onReset: () => void;
  chrome?: NpPanelChrome;
  /** `studio` (default): the studio chrome's palette and type scale, pure black like the Sections
   *  pane. `classic`: the original #121214 panel grey. */
  tone?: 'studio' | 'classic';
  children: ReactNode;
}) {
  const t = useT();
  const idBase = useId();
  const tabList = <NpTabs tabs={tabs} value={activeTab} onChange={onTabChange} idBase={idBase} label={title} />;
  const body = (
    <div
      role="tabpanel"
      id={`${idBase}-panel`}
      aria-labelledby={`${idBase}-tab-${activeTab}`}
      className={chrome ? 'np-scroll' : 'np-body'}
    >
      <NpPanelContext.Provider value>{children}</NpPanelContext.Provider>
    </div>
  );

  if (!chrome) {
    return (
      <div className={`np-panel np-panel--embedded ${geist.className}`} data-np-tone={tone}>
        {tabList}
        {body}
      </div>
    );
  }

  return (
    <div className={`np-panel ${geist.className}`} data-np-tone={tone}>
      <header className="np-header">
        {chrome.onBack ? (
          <NpIconButton label={t('All sections')} onClick={chrome.onBack} className="-ml-2 lg:hidden">
            <BackIcon />
          </NpIconButton>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="np-title">{title}</h2>
          <p className="np-status" aria-live="polite">
            <span className="np-status-dot" data-modified={modified ? 'true' : 'false'} aria-hidden />
            {modified ? t('Modified') : t('Default values')}
          </p>
        </div>
        <div className="np-header-actions">
          <NpIconButton label={t('Undo')} onClick={chrome.onUndo} disabled={!chrome.canUndo} className="np-history-btn">
            <UndoIcon />
          </NpIconButton>
          <NpIconButton label={t('Redo')} onClick={chrome.onRedo} disabled={!chrome.canRedo} className="np-history-btn">
            <RedoIcon />
          </NpIconButton>
          {chrome.hideClose ? null : (
            <>
              <span className="np-vsep" aria-hidden />
              <NpIconButton label={t('Close')} onClick={chrome.onClose}>
                <CloseIcon />
              </NpIconButton>
            </>
          )}
        </div>
      </header>

      {tabList}
      {body}

      <footer className="np-footer">
        <button type="button" onClick={onReset} disabled={!modified} className="np-ghost-btn">
          <ResetIcon />
          {t('Reset')}
        </button>
        <button type="button" onClick={chrome.onDone} className="np-primary-btn">
          {t('Done')}
        </button>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Controls
 * --------------------------------------------------------------------------------------------- */

/** 42×24 switch; its hit area extends to 44px. */
export function NpToggle({
  checked,
  onChange,
  labelledBy,
  describedBy,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelledBy?: string;
  describedBy?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-label={labelledBy ? undefined : label}
      onClick={() => onChange(!checked)}
      className="np-switch"
    >
      <span className="np-switch-knob" aria-hidden />
    </button>
  );
}

const NpContentShownContext = createContext(false);

/** Title + optional subtitle with a switch on the right; `card` frames it as the panel's lead card. */
export function NpToggleRow({
  title,
  description,
  checked,
  onChange,
  card = false,
  adornment,
  disabled = false,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  card?: boolean;
  /** Small element after the title, e.g. an info tooltip. */
  adornment?: ReactNode;
  /** Dimmed and inert, e.g. a sub-switch whose parent is off. */
  disabled?: boolean;
}) {
  const id = useId();
  const visibilityControl = useContext(NpContentShownContext) && !card;
  return (
    <div
      className={`${card ? 'np-toggle-card' : 'np-toggle-row'} np-dimmable`}
      data-disabled={disabled ? 'true' : 'false'}
      inert={disabled}
    >
      <div className="min-w-0 flex-1">
        <p className={`flex items-center gap-1.5 ${card ? 'np-card-title' : 'np-field-label !mb-0'}`}>
          <span id={`${id}-title`}>{title}</span>
          {adornment}
        </p>
        {description ? (
          <p id={`${id}-desc`} className="np-subtle mt-0.5">
            {description}
          </p>
        ) : null}
      </div>
      {visibilityControl ? <button
        type="button"
        className="np-visibility-btn"
        aria-pressed={checked}
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <FontAwesomeIcon icon={checked ? faEye : faEyeSlash} className="h-4 w-4" aria-hidden="true" />
      </button> : <NpToggle
        checked={checked}
        onChange={onChange}
        labelledBy={`${id}-title`}
        describedBy={description ? `${id}-desc` : undefined}
      />}
    </div>
  );
}

/**
 * Shared body for section-level General tabs. It brings the pro-editor tokens and context without
 * replacing a panel's existing tabs, then keeps every General tab on the same activation pattern.
 */
export function NpGeneralSettings({
  title,
  description,
  checked,
  onChange,
  children,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <div className={`np-panel np-panel--embedded ${geist.className}`} data-np-tone="studio">
      <NpPanelContext.Provider value>
        <div className="np-stack">
          <NpToggleRow
            card
            title={title}
            description={description}
            checked={checked}
            onChange={onChange}
          />
          <div
            className="np-dimmable"
            data-disabled={checked ? 'false' : 'true'}
            aria-disabled={!checked}
            inert={!checked}
          >
            {children}
          </div>
        </div>
      </NpPanelContext.Provider>
    </div>
  );
}

/** One-line segmented control with an optional live help sentence under it. */
export function NpSegmentedControl<T extends string>({
  label,
  hideLabel = false,
  options,
  value,
  onChange,
  help,
}: {
  label: string;
  hideLabel?: boolean;
  options: { value: T; label: string; title?: string; sizePx?: number }[];
  value: T;
  onChange: (value: T) => void;
  help?: string;
}) {
  const id = useId();
  // Shared by global appearance and every section override, regardless of locale.
  const colorModeOptions = options.some(option => option.value === 'light')
    && options.some(option => option.value === 'dark')
    && options.every(option => ['auto', 'light', 'dark'].includes(option.value));
  return (
    <div className="np-field">
      <p id={`${id}-label`} className={hideLabel ? 'sr-only' : 'np-field-label'}>
        {label}
      </p>
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        aria-describedby={help ? `${id}-help` : undefined}
        className="np-seg"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            title={option.title}
            onClick={() => onChange(option.value)}
            className="np-seg-btn"
            style={option.sizePx ? { fontSize: `${option.sizePx}px` } : undefined}
          >
            <span className="relative inline-flex max-w-full items-center justify-center gap-2">
              {colorModeOptions ? <FontAwesomeIcon icon={option.value === 'auto' ? faCircleHalfStroke : option.value === 'light' ? faSun : faMoon} className="h-3 w-3 shrink-0" aria-hidden="true" /> : null}
              <span className="truncate">{option.label}</span>
            </span>
          </button>
        ))}
      </div>
      {help ? (
        <p id={`${id}-help`} className="np-help" aria-live="polite">
          {help}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Visual option: mini illustration, title, optional subtitle; selected = accent ring + check badge.
 * `compact` is the three-per-row size (shorter illustration, title only).
 */
export function NpOptionCard({
  selected,
  title,
  subtitle,
  illustration,
  onClick,
  compact = false,
  largeIllustration = false,
}: {
  selected: boolean;
  title: string;
  subtitle?: string;
  illustration: ReactNode;
  onClick: () => void;
  compact?: boolean;
  /** Taller artwork area for real previews displayed one card per row. */
  largeIllustration?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="np-option"
      data-compact={compact ? 'true' : undefined}
      data-large-illustration={largeIllustration ? 'true' : undefined}
    >
      <span className="np-option-illus" aria-hidden>
        {illustration}
      </span>
      <span className="np-option-title">{title}</span>
      {subtitle ? <span className="np-option-sub">{subtitle}</span> : null}
    </button>
  );
}

/** Option cards in a grid (two per row by default) under a field label. */
const NP_GRID_COLUMNS = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' } as const;

export function NpOptionCardGroup({
  label,
  columns = 2,
  action,
  children,
}: {
  label: string;
  columns?: 2 | 3 | 4;
  /** Optional control at the end of the label row. */
  action?: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="np-field">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p id={id} className="np-field-label !mb-0">
          {label}
        </p>
        {action}
      </div>
      <div role="group" aria-labelledby={id} className={`np-option-group grid gap-3 ${NP_GRID_COLUMNS[columns]}`}>
        {children}
      </div>
    </div>
  );
}

/** Wraps a 64×34 settings glyph (the shared `pf-stack-mini` drawings) as a card illustration. */
export function NpGlyph({ children }: { children: ReactNode }) {
  return (
    <span className="np-illus np-illus--glyph">
      <svg viewBox="0 0 64 34" className="pf-stack-mini np-glyph" aria-hidden>
        {children}
      </svg>
    </span>
  );
}

/**
 * Current choice with a thumbnail, opening a fuller picker (e.g. the navigation layout).
 * Reads as one row: preview, name, "Change" + chevron.
 */
export function NpPickerRow({
  label,
  value,
  thumbnail,
  onClick,
}: {
  label: string;
  value: string;
  thumbnail: ReactNode;
  onClick: () => void;
}) {
  const t = useT();
  return (
    <button type="button" onClick={onClick} aria-label={`${label} : ${value}. ${t('Change')}`} className="np-picker-row">
      <span className="np-picker-thumb" aria-hidden>
        {thumbnail}
      </span>
      <span className="min-w-0 flex-1">
        <span className="np-option-title block truncate !p-0">{value}</span>
        <span className="np-option-sub block !p-0">{t('Change')}</span>
      </span>
      <ChevronIcon className="np-picker-chevron h-4 w-4 shrink-0" />
    </button>
  );
}

/** Back link at the top of a sub-view (e.g. the full layout list). */
export function NpBackRow({ title, onBack }: { title: string; onBack: () => void }) {
  const t = useT();
  return (
    <div className="np-back-row">
      <button type="button" onClick={onBack} className="np-ghost-btn">
        <BackIcon />
        {t('Back')}
      </button>
      <span className="np-back-title">{title}</span>
    </div>
  );
}

/** Thumb diameter in px — the fill and the step labels follow the thumb's centre, not the track ends. */
const NP_THUMB = 18;

function npTrackPosition(fraction: number) {
  return `calc(${NP_THUMB / 2}px + (100% - ${NP_THUMB}px) * ${fraction})`;
}

/** Notched slider: accent-filled track, white thumb with an accent halo, value badge, clickable steps. */
export function NpStepSlider<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; px: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const id = useId();
  const found = options.findIndex((option) => option.value === value);
  const index = found < 0 ? 0 : found;
  const current = options[index];
  const last = Math.max(1, options.length - 1);
  const valueText = `${current.label} · ${current.px} px`;

  return (
    <div className="np-field">
      <div className="mb-3 flex items-center justify-between gap-3">
        <label htmlFor={id} className="np-field-label !mb-0">
          {label}
        </label>
        <span className="np-value-badge" aria-hidden>
          {valueText}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={options.length - 1}
        step={1}
        value={index}
        aria-valuetext={valueText}
        onChange={(event) => onChange(options[Number(event.target.value)].value)}
        className="np-range"
        style={{ '--np-fill': npTrackPosition(index / last) } as CSSProperties}
      />
      {/* Pointer shortcut only: the range input above is the accessible control. */}
      <div className="np-steps" aria-hidden>
        {options.map((option, step) => (
          <button
            key={option.value}
            type="button"
            tabIndex={-1}
            data-active={step === index ? 'true' : 'false'}
            onClick={() => onChange(option.value)}
            className="np-step"
            style={{
              left: `${(step / last) * 100}%`,
              transform: `translateX(-${(step / last) * 100}%)`,
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Continuous slider in the same style as NpStepSlider, with its value in the badge. */
export function NpRangeField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const fraction = max > min ? (value - min) / (max - min) : 0;
  const valueText = `${value}${unit ? ` ${unit}` : ''}`;
  return (
    <div className="np-field">
      <div className="mb-3 flex items-center justify-between gap-3">
        <label htmlFor={id} className="np-field-label !mb-0">
          {label}
        </label>
        <span className="np-value-badge" aria-hidden>
          {valueText}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(event) => onChange(Number(event.target.value))}
        className="np-range"
        style={{ '--np-fill': npTrackPosition(fraction) } as CSSProperties}
      />
    </div>
  );
}

/** Section with a 48px clickable header (small caps title, rotating chevron) and a top divider. */
export function NpCollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const t = useT();
  const contentShown = title === t('Content shown');
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className={`np-section${contentShown ? ' np-section--content-shown' : ''}`}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
          className="np-section-head"
        >
          <span>{title}</span>
          <ChevronIcon className="np-section-chevron h-4 w-4" />
        </button>
      </h3>
      <div id={id} className="np-section-body" data-open={open ? 'true' : 'false'} inert={!open}>
        <div className="np-section-clip">
          <div className="np-section-content"><NpContentShownContext.Provider value={contentShown}>{children}</NpContentShownContext.Provider></div>
        </div>
      </div>
    </section>
  );
}

/** Same look as NpCollapsibleSection, without folding; `action` sits at the end of the header. */
export function NpStaticSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="np-section">
      <div className="np-section-head np-section-head--static">
        <h3>{title}</h3>
        {action}
      </div>
      <div className="np-section-content">{children}</div>
    </section>
  );
}

/** Live strip of menu labels; size and spacing animate as the sliders move. */
export function NpLinksPreview({ items, fontPx, gapPx }: { items: string[]; fontPx: number; gapPx: number }) {
  return (
    <div className="np-preview" aria-hidden>
      <div className="np-preview-links" style={{ fontSize: `${fontPx}px`, gap: `${gapPx}px` }}>
        {items.map((item, index) => (
          <span key={item} data-active={index === 0 ? 'true' : 'false'}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Mini illustrations (pure CSS boxes)
 * --------------------------------------------------------------------------------------------- */

/** Fixed bar on top: logo and three links, page lines below. */
export function NpIllustrationTopBar() {
  return (
    <span className="np-illus np-illus--page">
      <span className="np-illus-bar">
        <span className="np-illus-logo" />
        <span className="ml-auto flex gap-[3px]">
          <span className="np-illus-link" />
          <span className="np-illus-link" />
          <span className="np-illus-link" />
        </span>
      </span>
      <span className="np-illus-line w-[70%]" />
      <span className="np-illus-line w-[85%]" />
      <span className="np-illus-line w-[55%]" />
    </span>
  );
}

/** A page of its own: menu dot in the corner, centred lines. */
export function NpIllustrationPages() {
  return (
    <span className="np-illus np-illus--page items-center justify-center">
      <span className="np-illus-corner" />
      <span className="np-illus-line np-illus-line--strong w-[34%]" />
      <span className="np-illus-line w-[26%]" />
      <span className="np-illus-line w-[30%]" />
    </span>
  );
}

/** Phone with a full-width bar: logo left, menu icon right. */
export function NpIllustrationPhoneBar() {
  return (
    <span className="np-illus np-illus--stage">
      <span className="np-phone">
        <span className="np-illus-bar np-illus-bar--phone">
          <span className="np-illus-logo" />
          <span className="np-illus-burger ml-auto" />
        </span>
        <span className="np-illus-line w-[80%]" />
        <span className="np-illus-line w-[60%]" />
      </span>
    </span>
  );
}

/** Phone with the menu open as a side drawer. */
export function NpIllustrationPhoneDrawer() {
  return (
    <span className="np-illus np-illus--stage">
      <span className="np-phone">
        <span className="np-illus-burger ml-auto" />
        <span className="np-illus-line w-[60%]" />
        <span className="np-phone-drawer">
          <span className="np-illus-line np-illus-line--strong w-[70%]" />
          <span className="np-illus-line w-[55%]" />
          <span className="np-illus-line w-[62%]" />
        </span>
      </span>
    </span>
  );
}
