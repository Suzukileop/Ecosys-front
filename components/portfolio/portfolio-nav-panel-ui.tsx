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
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
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
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H12" />
  </NpIcon>
);

const RedoIcon = () => (
  <NpIcon>
    <path d="m15 14 5-5-5-5" />
    <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H12" />
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
  children,
}: {
  title: string;
  modified: boolean;
  tabs: NpTab<T>[];
  activeTab: T;
  onTabChange: (value: T) => void;
  onReset: () => void;
  chrome?: NpPanelChrome;
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
      {children}
    </div>
  );

  if (!chrome) {
    return (
      <div className={`np-panel np-panel--embedded ${geist.className}`}>
        {tabList}
        {body}
      </div>
    );
  }

  return (
    <div className={`np-panel ${geist.className}`}>
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
          <NpIconButton label={t('Undo')} onClick={chrome.onUndo} disabled={!chrome.canUndo}>
            <UndoIcon />
          </NpIconButton>
          <NpIconButton label={t('Redo')} onClick={chrome.onRedo} disabled={!chrome.canRedo}>
            <RedoIcon />
          </NpIconButton>
          <span className="np-vsep" aria-hidden />
          <NpIconButton label={t('Close')} onClick={chrome.onClose}>
            <CloseIcon />
          </NpIconButton>
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

/** Title + optional subtitle with a switch on the right; `card` frames it as the panel's lead card. */
export function NpToggleRow({
  title,
  description,
  checked,
  onChange,
  card = false,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  card?: boolean;
}) {
  const id = useId();
  return (
    <div className={card ? 'np-toggle-card' : 'np-toggle-row'}>
      <div className="min-w-0 flex-1">
        <p id={`${id}-title`} className={card ? 'np-card-title' : 'np-field-label !mb-0'}>
          {title}
        </p>
        {description ? (
          <p id={`${id}-desc`} className="np-subtle mt-0.5">
            {description}
          </p>
        ) : null}
      </div>
      <NpToggle
        checked={checked}
        onChange={onChange}
        labelledBy={`${id}-title`}
        describedBy={description ? `${id}-desc` : undefined}
      />
    </div>
  );
}

/** One-line segmented control with an optional live help sentence under it. */
export function NpSegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  help,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  help?: string;
}) {
  const id = useId();
  return (
    <div className="np-field">
      <p id={`${id}-label`} className="np-field-label">
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
            onClick={() => onChange(option.value)}
            className="np-seg-btn"
          >
            <span className="relative truncate">{option.label}</span>
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

/** Visual option: mini illustration (60px), title, subtitle; selected = accent ring + check badge. */
export function NpOptionCard({
  selected,
  title,
  subtitle,
  illustration,
  onClick,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  illustration: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className="np-option">
      <span className="np-option-illus" aria-hidden>
        {illustration}
      </span>
      <span className="np-option-title">{title}</span>
      <span className="np-option-sub">{subtitle}</span>
      {selected ? (
        <span className="np-option-badge" aria-hidden>
          <svg viewBox="0 0 20 20" className="h-2.5 w-2.5" fill="none">
            <path d="M4 10.5l3.5 3.5L16 6" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ) : null}
    </button>
  );
}

/** Two option cards side by side under a field label. */
export function NpOptionCardGroup({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <div className="np-field">
      <p id={id} className="np-field-label">
        {label}
      </p>
      <div role="group" aria-labelledby={id} className="grid grid-cols-2 gap-2.5">
        {children}
      </div>
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
      <div className="mb-2.5 flex items-center justify-between gap-3">
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
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className="np-section">
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
          <div className="np-section-content">{children}</div>
        </div>
      </div>
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
