'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  PortfolioDesignLivePreviewCard,
  usePortfolioDesignPreviewSource,
} from '@/components/portfolio/PortfolioDesignLivePreview';
import { withDesignPreview } from '@/lib/portfolio-design-preview';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  PORTFOLIO_NAV_TRI_ZONE_SOCIAL_LINK_GAP_OPTIONS,
  PORTFOLIO_NAV_TRI_ZONE_SOCIAL_LINK_SIZE_OPTIONS,
} from '@/components/portfolio/portfolio-nav-tri-zone-social';
import { LinkBrandIcon } from '@/components/portfolio/PortfolioLinksChrome';
import { PORTFOLIO_SECTION_COLOR_MODE_OPTIONS } from '@/components/portfolio/portfolio-section-color-mode';
import { PortfolioNavContactCtaGlyph } from '@/components/portfolio/portfolio-nav-contact-cta-icons';
import type { PortfolioNavMenuGroup } from '@/components/portfolio/portfolio-nav-menu-groups';
import { type PortfolioNavChromeLink } from '@/components/portfolio/portfolio-nav-extras';
import type { PortfolioFooterSectionLinkOption } from '@/components/portfolio/portfolio-footer-design-layout';
import { createDefaultPortfolioSettings, PORTFOLIO_SETTINGS_SECTIONS, PORTFOLIO_NAV_CONTACT_BUTTON_ICON_POSITION_OPTIONS, PORTFOLIO_NAV_CONTACT_BUTTON_SHAPE_OPTIONS, portfolioNavContactButtonShellPresentation, DEFAULT_EDITORIAL_BAR_MAIL_CONTACT, DEFAULT_EDITORIAL_BAR_PHONE_CONTACT, mergeEditorialBarContactChannelSettings, portfolioNavContactCtaIconOptionsForEditorialChannel, clampPortfolioNavCustomExtraLogoSizePx, type PortfolioNavSettings, type PortfolioNavContactButtonDisplay, type PortfolioNavContactButtonShape, type PortfolioNavContactCtaIcon, type PortfolioNavEditorialBarContactChannelSettings, type PortfolioSettings, type PortfolioSettingsSectionId, type PortfolioSettingsSectionMeta, PORTFOLIO_NAV_EDITORIAL_BAR_BUTTON_INK_OPTIONS } from '@/components/portfolio/portfolio-settings-types';
import { PORTFOLIO_NAV_ACTIVE_INDICATOR_OPTIONS, PORTFOLIO_NAV_FLOATING_PILL_MENU_MODE_OPTIONS, normalizePortfolioNavFloatingPillMenuMode, PORTFOLIO_NAV_DISPLAY_OPTIONS, PORTFOLIO_NAV_VISIBILITY_MODE_OPTIONS, resolvePortfolioNavVisibilityMode, PORTFOLIO_NAV_MENU_CONTROL_ICON_OPTIONS, PORTFOLIO_NAV_BAR_SURFACE_OPTIONS, PORTFOLIO_NAV_BAR_HEIGHT_OPTIONS, PORTFOLIO_NAV_ITEM_GAP_OPTIONS, PORTFOLIO_NAV_LABEL_FONT_SIZE_OPTIONS, PORTFOLIO_NAV_MOBILE_BRAND_OPTIONS, PORTFOLIO_NAV_MOBILE_DRAWER_SIDE_OPTIONS, type PortfolioNavActiveStyle } from '@/components/portfolio/portfolio-nav-settings';
import {
  PORTFOLIO_NAV_IN_BAR_BRAND_LABEL,
  PORTFOLIO_NAV_LAYOUT_DESIGN_OPTIONS,
  portfolioNavLayoutDesignPatch,
  type PortfolioNavLayoutDesign,
} from '@/components/portfolio/portfolio-nav-layout-design';
import { PortfolioNavIcon } from '@/components/portfolio/portfolio-nav-icons';
import {
  NpBackRow,
  NpCollapsibleSection,
  NpGlyph,
  NpIllustrationPages,
  NpIllustrationPhoneBar,
  NpIllustrationPhoneDrawer,
  NpIllustrationTopBar,
  NpLinksPreview,
  NpOptionCard,
  NpOptionCardGroup,
  NpPickerRow,
  NpRangeField,
  NpPanelShell,
  NpSegmentedControl,
  NpStepSlider,
  NpToggleRow,
  useInNpPanel,
  type NpPanelChrome,
} from '@/components/portfolio/portfolio-nav-panel-ui';
import { DEFAULT_HERO_PALETTE, LIGHT_HERO_PALETTE, INDIGO_DARK_HERO_PALETTE, INDIGO_LIGHT_HERO_PALETTE, VERDANT_DARK_HERO_PALETTE, VERDANT_LIGHT_HERO_PALETTE, VIVE_DARK_HERO_PALETTE, VIVE_LIGHT_HERO_PALETTE, SAFRAN_DARK_HERO_PALETTE, SAFRAN_LIGHT_HERO_PALETTE, CITRON_DARK_HERO_PALETTE, CITRON_LIGHT_HERO_PALETTE, ROUGE_DARK_HERO_PALETTE, ROUGE_LIGHT_HERO_PALETTE, ECARLATE_DARK_HERO_PALETTE, ECARLATE_LIGHT_HERO_PALETTE, ARDOISE_DARK_HERO_PALETTE, ARDOISE_LIGHT_HERO_PALETTE, PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS, resolveHeroPaletteColor, type PortfolioHeroPalette } from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  resolveActivePortfolioPalette,
  inferPaletteFamily,
  type PortfolioColorMode,
} from '@/components/portfolio/portfolio-color-mode';
import { applyNavPaletteToSettings, DEFAULT_NAV_COLOR_BINDINGS, DEFAULT_NAV_PALETTE, mergeNavColorBindings, mergeNavPalette } from '@/components/portfolio/portfolio-nav-palette-settings';
import {
  PORTFOLIO_NAV_ICON_OPTIONS,
  PORTFOLIO_NAV_LABEL_PRESETS,
  PORTFOLIO_NAV_SECTION_META,
  type PortfolioNavIconVariant,
  type PortfolioNavItemIcons,
  type PortfolioNavItemLabels,
  type PortfolioNavSectionKey,
} from '@/components/portfolio/portfolio-nav-items';
import {
  HeroSettingsPanel,
  normalizeHeroSettingsSubSection,
  type HeroSettingsSubSection,
} from '@/components/portfolio/portfolio-hero-settings-panel';
import {
  WorkSettingsPanel,
  normalizeWorkSettingsSubSection,
  type WorkSettingsSubSection,
} from '@/components/portfolio/portfolio-work-settings-panel';
import {
  GallerySettingsPanel,
  normalizeGallerySubSection,
  type GallerySettingsSubSection,
} from '@/components/portfolio/portfolio-gallery-settings-panel';
import {
  ServicesSettingsPanel,
  normalizeServicesSubSection,
  type ServicesSubSection,
} from '@/components/portfolio/portfolio-services-settings-panel';
import {
  AboutUsSettingsPanel,
  type AboutUsSubSection,
} from '@/components/portfolio/portfolio-about-us-settings-panel';
import {
  InfoSettingsPanel,
  type InfoSubSection,
} from '@/components/portfolio/portfolio-info-settings-panel';
import {
  ExperienceSettingsPanel,
  normalizeExperienceSubSection,
  type ExperienceSubSection,
} from '@/components/portfolio/portfolio-experience-settings-panel';
import {
  FaqSettingsPanel,
  normalizeFaqSubSection,
  type FaqSubSection,
} from '@/components/portfolio/portfolio-faq-settings-panel';
import {
  TeamSettingsPanel,
  normalizeTeamSubSection,
  type TeamSubSection,
} from '@/components/portfolio/portfolio-team-settings-panel';
import {
  StackSettingsPanel,
  normalizeStackSubSection,
  type StackSubSection,
} from '@/components/portfolio/portfolio-stack-settings-panel';
import {
  ToolsSettingsPanel,
  normalizeToolsSubSection,
  type ToolsSubSection,
} from '@/components/portfolio/portfolio-tools-settings-panel';
import {
  ContactSettingsPanel,
  normalizeContactSubSection,
  type ContactSubSection,
} from '@/components/portfolio/portfolio-contact-settings-panel';
import {
  FooterSettingsPanel,
  normalizeFooterSubSection,
  type FooterSubSection,
} from '@/components/portfolio/portfolio-footer-settings-panel';
import { PORTFOLIO_UPGRADE_PATH } from '@/components/portfolio/portfolio-pricing-upgrade-panel';
import { useTheme } from '@/components/landing/ThemeProvider';
import {
  getVisiblePortfolioSettingsSections,
  PortfolioStudioSectionList,
  readStoredPortfolioSettingsSection,
  storePortfolioSettingsSection,
} from '@/components/portfolio/PortfolioStudioSectionList';
import {
  GLOBAL_SETTINGS_SUB_SECTIONS,
  type GlobalSettingsSubSection,
} from '@/components/portfolio/portfolio-global-settings-guide';

/** Short, one-word tab labels — GLOBAL_SETTINGS_SUB_SECTIONS.label stays full-length for search. */
const GLOBAL_SETTINGS_TAB_LABELS: Record<GlobalSettingsSubSection, string> = {
  theme: msg('Foundations'),
  background: msg('Backdrop'),
  order: msg('Section order'),
};
import {
  searchPortfolioSettings,
  type PortfolioSettingsSearchEntry,
} from '@/components/portfolio/portfolio-settings-search';
import { PORTFOLIO_GLOBAL_CONTENT_GUTTER_OPTIONS, PORTFOLIO_GLOBAL_CONTENT_WIDTH_OPTIONS, PORTFOLIO_GLOBAL_SECTION_TOP_SPACING_OPTIONS, PORTFOLIO_GLOBAL_SECTION_BOTTOM_SPACING_OPTIONS, type PortfolioGlobalSectionTitleTopSpacing, backgroundImagePositionCss, backgroundImageSizeCss, DEFAULT_CONTENT_SECTION_ORDER, MAX_PORTFOLIO_BACKGROUND_IMAGES, type PortfolioGlobalSettings, type PortfolioGlobalSettingsPatch } from '@/components/portfolio/portfolio-global-settings';
import { resolvePortfolioContentSectionOrder } from '@/components/portfolio/portfolio-services-block-settings';
import type { PortfolioServicesSectionOrganization } from '@/components/portfolio/portfolio-services-settings';
import { PortfolioBackgroundImageUpload, PortfolioBackgroundLibrary } from '@/components/portfolio/portfolio-background-image-upload';
import { PortfolioBackgroundLibraryProvider } from '@/components/portfolio/portfolio-background-library-context';
import { PortfolioGlobalMotionProvider } from '@/components/portfolio/portfolio-header-design-lock';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

const MODAL_OPACITY_STORAGE_KEY = 'portfolio-settings-modal-opacity';

type PanelSubSections = {
  theme?: GlobalSettingsSubSection;
  hero?: HeroSettingsSubSection;
  work?: WorkSettingsSubSection;
  services?: ServicesSubSection;
  aboutUs?: AboutUsSubSection;
  info?: InfoSubSection;
  experience?: ExperienceSubSection;
  team?: TeamSubSection;
  stack?: StackSubSection;
  tools?: ToolsSubSection;
  gallery?: GallerySettingsSubSection;
  faq?: FaqSubSection;
  contact?: ContactSubSection;
  footer?: FooterSubSection;
};

/** Settings blob keys mapped 1:1 to portfolio sections in the modal nav. */
type PortfolioSettingsContentKey = Exclude<PortfolioSettingsSectionId, 'theme' | 'navigation'>;

function PortfolioSettingsSearchBar({
  onSelect,
  appearance = 'pill',
}: {
  onSelect: (entry: PortfolioSettingsSearchEntry) => void;
  appearance?: 'pill' | 'underline';
}) {
  const t = useT();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const suggestions = useMemo(() => searchPortfolioSettings(query, 8), [query]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const pick = (entry: PortfolioSettingsSearchEntry) => {
    onSelect(entry);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <label htmlFor="portfolio-settings-search" className="sr-only">
        {t('Search settings')}
      </label>
      <div className="relative">
        <svg
          className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 ${
            appearance === 'underline' ? 'left-2.5' : 'left-3'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={appearance === 'underline' ? 1.5 : 2}
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
        </svg>
        <input
          id="portfolio-settings-search"
          type="search"
          value={query}
          autoComplete="off"
          placeholder={t('Search settings...')}
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && suggestions[highlight] ? `${listId}-option-${highlight}` : undefined
          }
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (!suggestions.length) return;
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setOpen(true);
              setHighlight((index) => (index + 1) % suggestions.length);
              return;
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setOpen(true);
              setHighlight((index) => (index - 1 + suggestions.length) % suggestions.length);
              return;
            }
            if (event.key === 'Enter' && open) {
              event.preventDefault();
              const entry = suggestions[highlight] ?? suggestions[0];
              if (entry) pick(entry);
              return;
            }
            if (event.key === 'Escape') {
              if (open) {
                event.stopPropagation();
                setOpen(false);
              }
            }
          }}
          className={
            appearance === 'underline'
              ? 'portfolio-studio-dock-search w-full appearance-none border-0 bg-transparent py-2.5 pl-7 pr-1 text-sm text-neutral-900 shadow-none outline-hidden ring-0 placeholder:text-neutral-400 transition-[background-color] focus:outline-hidden focus:ring-0 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden'
              : 'w-full rounded-full border border-neutral-200/90 bg-neutral-50/90 py-2 pl-9 pr-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-neutral-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10'
          }
        />
      </div>
      {open && query.trim() ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-neutral-200 bg-white py-1 shadow-xl"
        >
          {suggestions.length === 0 ? (
            <li className="px-3.5 py-3 text-sm text-neutral-500">{t('No matching settings')}</li>
          ) : (
            suggestions.map((item, index) => {
              const active = index === highlight;
              return (
                <li key={`${item.id}-${index}`} role="presentation">
                  <button
                    type="button"
                    id={`${listId}-option-${index}`}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => pick(item)}
                    className={`flex w-full flex-col gap-0.5 px-3.5 py-2.5 text-left transition ${
                      active ? 'bg-neutral-100' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-sm font-semibold text-neutral-950">{t(item.label)}</span>
                    <span className="text-xs text-neutral-500">{item.path}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}

/** The save state as one small dot after the open section's name (pulses while saving). */
function DockSaveDot({ persistStatus }: { persistStatus: 'idle' | 'saving' | 'saved' | 'error' }) {
  const t = useT();
  return (
    <span
      className={`h-1.5 w-1.5 shrink-0 rounded-full ${persistStatus === 'saving' ? 'pf-dock-save-dot-saving' : ''}`}
      style={{
        backgroundColor:
          persistStatus === 'error'
            ? '#f87171'
            : persistStatus === 'saving'
              ? '#34d399'
              : persistStatus === 'saved'
                ? 'color-mix(in srgb, #34d399 40%, transparent)'
                : 'color-mix(in srgb, var(--pf-palette-texte-fort) 40%, transparent)',
      }}
      title={
        persistStatus === 'saving' ? t('Saving') : persistStatus === 'saved' ? t('Saved') : persistStatus === 'error' ? t('Not saved') : t('Synced')
      }
      aria-hidden
    />
  );
}

function readStoredModalOpacity(): number {
  if (typeof window === 'undefined') return 100;
  const stored = window.localStorage.getItem(MODAL_OPACITY_STORAGE_KEY);
  if (!stored) return 100;
  const value = Number(stored);
  if (!Number.isFinite(value)) return 100;
  return Math.min(100, Math.max(35, value));
}

function ModalPreviewTransparencyControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const t = useT();
  return (
    <div className="hidden items-center gap-2.5 rounded-full border border-neutral-200/90 bg-neutral-50/80 px-3 py-1.5 sm:flex">
      <input
        type="range"
        min={35}
        max={100}
        step={5}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 w-20 cursor-pointer accent-neutral-700 sm:w-24"
        aria-label={t('Settings panel transparency')}
      />
      <span className="min-w-[2.25rem] text-right text-xs font-semibold tabular-nums text-neutral-600">
        {value}%
      </span>
    </div>
  );
}

function ModalHistoryControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  tone = 'light',
}: {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  tone?: 'light' | 'dark' | 'palette';
}) {
  const t = useT();
  const dark = tone === 'dark';
  const palette = tone === 'palette';
  const buttonClass = palette
    ? 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--pf-palette-bordure)] bg-[color:var(--pf-palette-neutre)] text-[color:var(--pf-palette-texte-fort)] transition hover:border-[color:var(--pf-palette-principal)] disabled:cursor-not-allowed disabled:opacity-35'
    : dark
      ? 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-35'
      : 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35';
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        title={t('Undo (Ctrl+Z)')}
        aria-label={t('Undo')}
        className={buttonClass}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14L4 9l5-5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h10.5a5.5 5.5 0 010 11H12" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        title={t('Redo (Ctrl+Y)')}
        aria-label={t('Redo')}
        className={buttonClass}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 14l5-5-5-5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 9H9.5a5.5 5.5 0 000 11H12" />
        </svg>
      </button>
    </div>
  );
}

function ModalPeekPreviewButton({
  onClick,
  className = '',
}: {
  onClick: () => void;
  className?: string;
}) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50 ${className}`}
    >
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {t('Preview')}
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const inNavPanel = useInNpPanel();
  if (inNavPanel) {
    return <NpToggleRow title={label} description={description} checked={checked} onChange={onChange} />;
  }
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-4">
      <span className="min-w-0">
        <span
          className="block cursor-pointer text-sm font-semibold text-neutral-900"
          onClick={() => onChange(!checked)}
        >
          {label}
        </span>
        {description ? <span className="mt-1 block text-sm text-neutral-500">{description}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="mt-1 shrink-0"
      >
        <GlobalSwitchTrack checked={checked} />
      </button>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const className =
    'mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-orange-300 focus:outline-hidden focus:ring-2 focus:ring-orange-200';

  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={className}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={className}
        />
      )}
    </label>
  );
}

/** Moves `key` to `targetIndex` (the index it should end up at) — the drag-and-drop counterpart of moveSectionInOrder. */
function moveSectionToIndex(order: PortfolioNavSectionKey[], key: PortfolioNavSectionKey, targetIndex: number) {
  const from = order.indexOf(key);
  if (from === -1 || from === targetIndex) return order;
  const next = order.filter((item) => item !== key);
  next.splice(Math.max(0, Math.min(next.length, targetIndex)), 0, key);
  return next;
}

/**
 * Global → Section order: one quiet list, one 44px row per section (no cards). Drag a row by its grip,
 * or use the arrows (also Alt+↑ / Alt+↓ on a focused row); the eye shows or hides the section on the
 * page. Hero and Footer are fixed: they sit at the ends as muted rows. A moved row flashes briefly so
 * the eye can follow where it landed.
 */
function GlobalSectionOrderBlock({
  sectionOrder,
  servicesSectionOrganization,
  onChange,
  sectionEnabled,
  onSectionEnabledChange,
  hiddenFromMenu = [],
}: {
  /** Sections on the page but left out of the menu (Navigation → Labels). */
  hiddenFromMenu?: PortfolioNavSectionKey[];
  sectionOrder: PortfolioNavSectionKey[];
  servicesSectionOrganization: PortfolioServicesSectionOrganization;
  onChange: (sectionOrder: PortfolioNavSectionKey[]) => void;
  sectionEnabled?: Partial<Record<PortfolioNavSectionKey, boolean>>;
  onSectionEnabledChange?: (key: PortfolioNavSectionKey, enabled: boolean) => void;
}) {
  const t = useT();
  const savedOrder = resolvePortfolioContentSectionOrder(sectionOrder, servicesSectionOrganization);
  const defaultOrder = resolvePortfolioContentSectionOrder(DEFAULT_CONTENT_SECTION_ORDER, servicesSectionOrganization);
  const [dragKey, setDragKey] = useState<PortfolioNavSectionKey | null>(null);
  const [draftOrder, setDraftOrder] = useState<PortfolioNavSectionKey[] | null>(null);
  const [flashKey, setFlashKey] = useState<PortfolioNavSectionKey | null>(null);
  const flashTimer = useRef<number | null>(null);
  const orderedSections = draftOrder ?? savedOrder;
  const isDefaultOrder = savedOrder.join('|') === defaultOrder.join('|');
  const sectionLabels = Object.fromEntries(
    PORTFOLIO_NAV_SECTION_META.map((section) => [section.key, section.title])
  ) as Record<PortfolioNavSectionKey, string>;

  useEffect(() => () => {
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
  }, []);

  const commit = (next: PortfolioNavSectionKey[], moved: PortfolioNavSectionKey) => {
    if (next.join('|') !== savedOrder.join('|')) onChange(next);
    setFlashKey(moved);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashKey(null), 900);
  };

  const move = (key: PortfolioNavSectionKey, direction: 'up' | 'down') => {
    const index = orderedSections.indexOf(key);
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= orderedSections.length) return;
    commit(moveSectionToIndex(orderedSections, key, target), key);
  };

  const fixedRow = (label: string, hint: string) => (
    <li className="np-list-row np-list-row--fixed gap-3">
      <LockIcon className="h-4 w-4 shrink-0 opacity-70" />
      <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{label}</span>
      <span className="shrink-0 text-[12px]">{hint}</span>
    </li>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="np-subtle">
          {t('Drag to reorder the sections between Hero and Footer. The eye shows or hides a section on the page.')}
          <span className="mt-1 block text-[12px]">
            {t('Keyboard: focus a section, then Alt + ↑ / ↓ to move it.')}
          </span>
        </p>
        {!isDefaultOrder ? (
          <button type="button" onClick={() => onChange([...defaultOrder])} className="np-link-btn shrink-0">
            {t('Reset')}
          </button>
        ) : null}
      </div>

      <ul aria-label={t('Section display order')} className="np-list">
        {fixedRow(t('Hero'), t('Always first'))}

        {orderedSections.map((sectionKey, index) => {
          const label = t(sectionLabels[sectionKey] ?? sectionKey);
          const enabled = sectionEnabled?.[sectionKey] ?? true;
          const dragging = dragKey === sectionKey;
          return (
            <li
              key={sectionKey}
              draggable
              tabIndex={0}
              aria-label={label}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', sectionKey);
                setDragKey(sectionKey);
                setDraftOrder(orderedSections);
              }}
              onDragOver={(event) => {
                if (!dragKey) return;
                event.preventDefault();
                if (dragKey !== sectionKey) setDraftOrder((current) => moveSectionToIndex(current ?? savedOrder, dragKey, index));
              }}
              onDrop={(event) => event.preventDefault()}
              onDragEnd={() => {
                if (dragKey && draftOrder) commit(draftOrder, dragKey);
                setDragKey(null);
                setDraftOrder(null);
              }}
              onKeyDown={(event) => {
                if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
                event.preventDefault();
                move(sectionKey, event.key === 'ArrowUp' ? 'up' : 'down');
              }}
              data-dragging={dragging ? 'true' : 'false'}
              data-flash={flashKey === sectionKey ? 'true' : 'false'}
              className="group/row np-list-row !min-h-[48px] gap-2 focus-visible:[outline-offset:-2px]"
            >
              <span aria-hidden className="np-list-grip h-8">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <circle cx="9" cy="6" r="1.6" />
                  <circle cx="15" cy="6" r="1.6" />
                  <circle cx="9" cy="12" r="1.6" />
                  <circle cx="15" cy="12" r="1.6" />
                  <circle cx="9" cy="18" r="1.6" />
                  <circle cx="15" cy="18" r="1.6" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="np-list-title" data-muted={enabled ? 'false' : 'true'}>
                  {label}
                </span>
                {!enabled ? (
                  <span className="np-list-sub">{t('Hidden')}</span>
                ) : hiddenFromMenu.includes(sectionKey) ? (
                  <span className="np-list-sub">{t('Not in menu')}</span>
                ) : null}
              </span>
              <span className="flex shrink-0 items-center opacity-100 transition-opacity sm:opacity-0 sm:group-hover/row:opacity-100 sm:group-focus-within/row:opacity-100">
                <button type="button" className="np-row-btn" disabled={index === 0} onClick={() => move(sectionKey, 'up')} aria-label={t('Move {label} up', { label })} title={t('Move up')}>
                  <ChevronUpIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="np-row-btn"
                  disabled={index === orderedSections.length - 1}
                  onClick={() => move(sectionKey, 'down')}
                  aria-label={t('Move {label} down', { label })}
                  title={t('Move down')}
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
              </span>
              {onSectionEnabledChange ? (
                <button
                  type="button"
                  className="np-row-btn"
                  data-on={enabled ? 'true' : 'false'}
                  aria-pressed={!enabled}
                  onClick={() => onSectionEnabledChange(sectionKey, !enabled)}
                  aria-label={enabled ? t('Hide {label}', { label }) : t('Show {label}', { label })}
                  title={enabled ? t('Hide on the page') : t('Show on the page')}
                >
                  <NpEyeIcon open={enabled} />
                </button>
              ) : null}
            </li>
          );
        })}

        {fixedRow(t('Footer'), t('Always last'))}
      </ul>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 11V8a5 5 0 0110 0v3M6 11h12v10H6V11z"
      />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** English names for the palette tokens (their ids stay French: principal, texteFort, …). */
const PALETTE_TOKEN_DISPLAY_LABELS: Record<string, string> = {
  principal: 'Primary',
  secondaire: 'Secondary',
  texteFort: 'Strong text',
  texteMuted: 'Muted text',
  texteFaint: 'Faint text',
  neutre: 'Neutral',
  fond: 'Background',
  bordure: 'Border',
};

/** Compact colour token: a round swatch (the native picker), the token's name, its hex. */
function FoundationTokenSwatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="np-swatch">
      <span className="np-swatch-dot" style={{ backgroundColor: value }}>
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          className="pf-token-swatch-input"
        />
      </span>
      <span className="min-w-0">
        <span className="np-swatch-name">{label}</span>
        <span className="np-swatch-hex">{value}</span>
      </span>
    </label>
  );
}

/** Same visual-preview picker card as Stack's "Cell style"/"Columns" (StackPickerCard,
 *  compact variant) — reused here so Global's layout controls read as one system. */
function GlobalPreviewCard({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      data-active={active ? 'true' : 'false'}
      onClick={onClick}
      className="pf-stack-design-card pf-stack-preview-card rounded-2xl text-left"
    >
      {active ? <PfSelectedBadge /> : null}
      {children}
      <span className="mt-1.5 block">
        <span className="pf-stack-card-label min-w-0 text-[13px] font-medium leading-none tracking-tight">
          {label}
        </span>
      </span>
    </button>
  );
}

/** Circular check badge, top-right corner — the one "selected" treatment used by every
 *  picker card in Settings (Site color palette, Design/Header grids, preview cards, …). */
function PfSelectedBadge() {
  /* Inside the card's corner (it used to hang off it and get clipped), and the check drawn in the
     panel's background colour so it reads on the ink disc in both modes (white on #E7E9EA did not). */
  return (
    <span
      aria-hidden
      className="absolute right-2 top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full"
      style={{ backgroundColor: 'var(--pf-palette-principal, #f97316)' }}
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-2.5 w-2.5">
        <path
          d="M4 10.5l3.5 3.5L16 6"
          stroke="var(--pf-palette-fond, #ffffff)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Grid-only body (no header) — shared by GlobalPreviewCardGrid and any custom-header variant. */
function GlobalPreviewCardGridBody<T extends string>({
  label,
  value,
  options,
  onChange,
  columns,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; glyph: (active: boolean) => ReactNode }[];
  onChange: (value: T) => void;
  columns?: number;
}) {
  const t = useT();
  const cols = columns ?? Math.min(options.length, 4);
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <GlobalPreviewCard
            key={option.value}
            active={active}
            label={t(option.label)}
            onClick={() => onChange(option.value)}
          >
            <svg viewBox="0 0 64 34" className="pf-stack-mini h-full w-full" aria-hidden>
              <rect className="pf-stack-mini-stage" x="0.75" y="0.75" width="62.5" height="32.5" rx="6" />
              {option.glyph(active)}
            </svg>
          </GlobalPreviewCard>
        );
      })}
    </div>
  );
}

function GlobalPreviewCardGrid<T extends string>({
  label,
  action,
  value,
  options,
  onChange,
  columns,
}: {
  label: string;
  action?: ReactNode;
  value: T;
  options: { value: T; label: string; glyph: (active: boolean) => ReactNode }[];
  onChange: (value: T) => void;
  columns?: number;
}) {
  const t = useT();
  const inNavPanel = useInNpPanel();
  if (inNavPanel) {
    const cols = Math.min(4, Math.max(2, columns ?? Math.min(options.length, 3))) as 2 | 3 | 4;
    return (
      <NpOptionCardGroup label={label} action={action} columns={cols}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <NpOptionCard
              key={option.value}
              compact={cols > 2}
              selected={selected}
              title={t(option.label)}
              illustration={<NpGlyph>{option.glyph(selected)}</NpGlyph>}
              onClick={() => onChange(option.value)}
            />
          );
        })}
      </NpOptionCardGroup>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between gap-3 pf-stack-option-label">
        <p className="pf-stack-block-label !mb-0">{label}</p>
        {action}
      </div>
      <GlobalPreviewCardGridBody
        label={label}
        value={value}
        options={options}
        onChange={onChange}
        columns={columns}
      />
    </div>
  );
}

/** Bar spanning `percent`% of the safe stage width, centered — preview for Content width. */
function globalWidthBarGlyph(percent: number) {
  return (active: boolean) => {
    const barWidth = (48 * percent) / 100;
    const x = 8 + (48 - barWidth) / 2;
    return (
      <rect
        className={active ? 'pf-stack-mini-accent' : 'pf-stack-mini-mute'}
        x={x}
        y={13}
        width={barWidth}
        height={8}
        rx={2}
      />
    );
  };
}

/** Bar inset by `paddingPercent`% on each side — preview for Side margins. */
function globalMarginBarGlyph(paddingPercent: number) {
  return (active: boolean) => {
    const padding = (48 * paddingPercent) / 100;
    return (
      <rect
        className={active ? 'pf-stack-mini-accent' : 'pf-stack-mini-mute'}
        x={8 + padding}
        y={13}
        width={48 - padding * 2}
        height={8}
        rx={2}
      />
    );
  };
}

const GLOBAL_CONTENT_WIDTH_PREVIEW_OPTIONS = PORTFOLIO_GLOBAL_CONTENT_WIDTH_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
  glyph: globalWidthBarGlyph(
    option.value === 'standard' ? 45 : option.value === 'wide' ? 70 : 100
  ),
}));

const GLOBAL_CONTENT_GUTTER_PREVIEW_OPTIONS = PORTFOLIO_GLOBAL_CONTENT_GUTTER_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
  glyph: globalMarginBarGlyph(
    option.value === 'none' ? 0 : option.value === 'wide' ? 8 : option.value === 'medium' ? 16 : 24
  ),
}));

/** Two stacked bars with a gap sized per tier — preview for section top/bottom padding. */
function globalSectionSpacingGlyph(gap: number) {
  return (active: boolean) => {
    const cls = active ? 'pf-stack-mini-accent' : 'pf-stack-mini-mute';
    const barHeight = 5;
    const firstY = 2;
    const secondY = firstY + barHeight + gap;
    return (
      <>
        <rect className={cls} x="10" y={firstY} width="44" height={barHeight} rx="1.5" />
        <rect className={cls} x="10" y={secondY} width="44" height={barHeight} rx="1.5" />
      </>
    );
  };
}

const GLOBAL_SECTION_SPACING_GAP_PX: Record<PortfolioGlobalSectionTitleTopSpacing, number> = {
  compact: 3,
  standard: 6,
  comfortable: 10,
  spacious: 17,
};

const GLOBAL_SECTION_TOP_SPACING_PREVIEW_OPTIONS = PORTFOLIO_GLOBAL_SECTION_TOP_SPACING_OPTIONS.map(
  (option) => ({
    value: option.value,
    label: option.label,
    glyph: globalSectionSpacingGlyph(GLOBAL_SECTION_SPACING_GAP_PX[option.value]),
  })
);

const GLOBAL_SECTION_BOTTOM_SPACING_PREVIEW_OPTIONS = PORTFOLIO_GLOBAL_SECTION_BOTTOM_SPACING_OPTIONS.map(
  (option) => ({
    value: option.value,
    label: option.label,
    glyph: globalSectionSpacingGlyph(GLOBAL_SECTION_SPACING_GAP_PX[option.value]),
  })
);

/** S · M · L · XL — the four spacing tiers, short enough for one segmented row (full name in the tooltip). */
const SPACING_TIER_SHORT: Record<string, string> = {
  compact: 'S',
  standard: 'M',
  comfortable: 'L',
  spacious: 'XL',
};

/** Exaggerated (not to-scale) heights for the live preview box — bigger canvas than the card glyphs. */
const GLOBAL_SECTION_SPACING_LIVE_PX: Record<PortfolioGlobalSectionTitleTopSpacing, number> = {
  compact: 10,
  standard: 20,
  comfortable: 34,
  spacious: 58,
};

/** Shared live preview — one "Section content" block, gaps above/below animate as either slider moves. */
function GlobalSectionSpacingPreview({
  topSpacing,
  bottomSpacing,
}: {
  topSpacing: PortfolioGlobalSectionTitleTopSpacing;
  bottomSpacing: PortfolioGlobalSectionTitleTopSpacing;
}) {
  const t = useT();
  return (
    <div className="np-well px-4">
      <div
        aria-hidden
        className="transition-[height] duration-200 ease-out"
        style={{ height: GLOBAL_SECTION_SPACING_LIVE_PX[topSpacing] }}
      />
      <div className="rounded-lg border border-dashed border-[color:var(--np-illus-strong)] px-3 py-2 text-center text-xs font-medium text-[color:var(--np-muted)]">
        {t('Section content')}
      </div>
      <div
        aria-hidden
        className="transition-[height] duration-200 ease-out"
        style={{ height: GLOBAL_SECTION_SPACING_LIVE_PX[bottomSpacing] }}
      />
    </div>
  );
}

/** Mini "Nav" label mock, decorated per active-indicator style — preview for Active indicator. */
function navIndicatorGlyph(style: PortfolioNavActiveStyle) {
  return (active: boolean) => {
    const accentClass = active ? 'pf-stack-mini-accent' : 'pf-stack-mini-mute';
    switch (style) {
      case 'dot':
        return (
          <>
            <text x="32" y="15" textAnchor="middle" fontSize="9" fontWeight="600" className="pf-stack-mini-type">
              Nav
            </text>
            <circle className={accentClass} cx="32" cy="23" r="1.6" />
          </>
        );
      case 'underline':
        return (
          <>
            <text x="32" y="14" textAnchor="middle" fontSize="9" fontWeight="600" className="pf-stack-mini-type">
              Nav
            </text>
            <rect className={accentClass} x="21" y="19" width="22" height="1.6" rx="0.8" />
          </>
        );
      case 'filled-pill':
        return (
          <>
            <rect className={accentClass} x="13" y="10" width="38" height="14" rx="7" />
            <text
              x="32"
              y="20"
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              className="pf-stack-mini-type"
              style={{ fill: active ? 'var(--pf-palette-fond, #fff)' : undefined }}
            >
              Nav
            </text>
          </>
        );
      case 'dot-left':
        return (
          <>
            <circle className={accentClass} cx="19" cy="17" r="1.6" />
            <text x="36" y="20" textAnchor="middle" fontSize="9" fontWeight="600" className="pf-stack-mini-type">
              Nav
            </text>
          </>
        );
      case 'accent-text':
        return (
          <text x="32" y="20" textAnchor="middle" fontSize="9.5" fontWeight="800" className={accentClass}>
            Nav
          </text>
        );
      case 'underline-animated':
        return (
          <>
            <text x="32" y="14" textAnchor="middle" fontSize="9" fontWeight="600" className="pf-stack-mini-type">
              Nav
            </text>
            <rect className={accentClass} x="25" y="19" width="14" height="1.6" rx="0.8" />
          </>
        );
      default:
        return null;
    }
  };
}

const PORTFOLIO_NAV_ACTIVE_INDICATOR_PREVIEW_OPTIONS = PORTFOLIO_NAV_ACTIVE_INDICATOR_OPTIONS.map(
  (option) => ({
    value: option.value,
    label: option.label,
    glyph: navIndicatorGlyph(option.value),
  })
);

/** Mini nav pill on the mini stage, filled / faded / dashed per surface — preview for Bar background. */
function navBarSurfaceGlyph(mode: 'neutre' | 'fond' | 'transparent') {
  return (active: boolean) => {
    const barClass = active ? 'pf-stack-mini-accent' : 'pf-stack-mini-mute';
    if (mode === 'transparent') {
      return (
        <rect
          x="10"
          y="12"
          width="44"
          height="10"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="2.5 2.5"
          className={barClass}
        />
      );
    }
    return (
      <rect
        x="10"
        y="12"
        width="44"
        height="10"
        rx="5"
        className={barClass}
        opacity={mode === 'fond' ? 0.32 : 1}
      />
    );
  };
}

const PORTFOLIO_NAV_BAR_SURFACE_PREVIEW_OPTIONS = PORTFOLIO_NAV_BAR_SURFACE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
  glyph: navBarSurfaceGlyph(option.value),
}));

type BackgroundInsetKey =
  | 'backgroundImageInsetTop'
  | 'backgroundImageInsetRight'
  | 'backgroundImageInsetBottom'
  | 'backgroundImageInsetLeft';

const BACKGROUND_INSET_MAX = 240;

type BackgroundFocus = PortfolioGlobalSettings['backgroundImagePosition'];

const BACKGROUND_FOCUS_GRID: BackgroundFocus[] = [
  'top-left', 'top', 'top-right',
  'left', 'center', 'right',
  'bottom-left', 'bottom', 'bottom-right',
];

const BACKGROUND_FOCUS_LABELS: Record<BackgroundFocus, string> = {
  'top-left': msg('Top left'),
  top: msg('Top center'),
  'top-right': msg('Top right'),
  left: msg('Center left'),
  center: msg('Center'),
  right: msg('Center right'),
  'bottom-left': msg('Bottom left'),
  bottom: msg('Bottom center'),
  'bottom-right': msg('Bottom right'),
};

/**
 * What the page background looks like, at a glance: the page color, the image with its fit,
 * opacity and margins (scaled from a 1440×900 viewport), and a faint page skeleton on top. With
 * Fill or Fit, the 3×3 grid sets the focal point — the part of the image that stays in view.
 */
function GlobalBackgroundPreview({
  global,
  onFocusChange,
}: {
  global: PortfolioGlobalSettings;
  onFocusChange: (position: BackgroundFocus) => void;
}) {
  const t = useT();
  const url = global.backgroundImageUrl.trim();
  const canFocus = Boolean(url) && global.backgroundImageSize !== 'fill';
  const inset = (value: number, axis: number) =>
    `${(Math.min(BACKGROUND_INSET_MAX, Math.max(0, value || 0)) / axis) * 100}%`;

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[color:var(--pf-palette-fond)] shadow-[inset_0_0_0_1px_var(--pf-palette-bordure)]">
      {url ? (
        <div
          aria-hidden
          className="absolute transition-opacity duration-200"
          style={{
            top: inset(global.backgroundImageInsetTop, 900),
            right: inset(global.backgroundImageInsetRight, 1440),
            bottom: inset(global.backgroundImageInsetBottom, 900),
            left: inset(global.backgroundImageInsetLeft, 1440),
            backgroundImage: `url(${JSON.stringify(url)})`,
            backgroundSize: backgroundImageSizeCss(global.backgroundImageSize),
            backgroundPosition: backgroundImagePositionCss(global.backgroundImagePosition),
            backgroundRepeat: 'no-repeat',
            opacity: Math.min(100, Math.max(0, global.backgroundOpacity)) / 100,
          }}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center px-6 text-center text-[13px] text-[color:var(--pf-palette-texte-muted)]">
          {t('Pick or add an image below.')}
        </span>
      )}

      {/* A page in miniature, so the image reads as a background and not as a photo. */}
      <span aria-hidden className="pointer-events-none absolute inset-x-[7%] top-[8%] flex items-center justify-between">
        <span className="h-1.5 w-[14%] rounded-full bg-[color:var(--pf-palette-texte-fort)] opacity-80" />
        <span className="h-1.5 w-[22%] rounded-full bg-[color:var(--pf-palette-texte-fort)] opacity-40" />
      </span>
      <span aria-hidden className="pointer-events-none absolute inset-x-[7%] top-[36%] flex flex-col gap-2">
        <span className="h-3 w-[58%] rounded-full bg-[color:var(--pf-palette-texte-fort)] opacity-85" />
        <span className="h-1.5 w-[40%] rounded-full bg-[color:var(--pf-palette-texte-fort)] opacity-40" />
      </span>

      {canFocus ? (
        <div role="radiogroup" aria-label={t('Focal point')} className="group/focus absolute inset-0 grid grid-cols-3 grid-rows-3">
          {BACKGROUND_FOCUS_GRID.map((position) => {
            const active = global.backgroundImagePosition === position;
            return (
              <button
                key={position}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={t(BACKGROUND_FOCUS_LABELS[position])}
                title={t(BACKGROUND_FOCUS_LABELS[position])}
                onClick={() => onFocusChange(position)}
                className="flex items-center justify-center focus-visible:outline-hidden"
              >
                <span
                  className={`rounded-full transition-all duration-150 ${
                    active
                      ? 'h-3 w-3 bg-white shadow-[0_0_0_2px_rgba(0,0,0,0.55)]'
                      : 'h-1.5 w-1.5 bg-white/80 opacity-0 shadow-[0_0_0_1px_rgba(0,0,0,0.45)] group-hover/focus:opacity-100 group-focus-within/focus:opacity-100'
                  }`}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/** One compact px field in the panel's tokens (a number the user types, clamped 0–240). */
function GlobalPxField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] font-medium text-[color:var(--pf-palette-texte-muted)]">{label}</span>
      <span className="relative">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={BACKGROUND_INSET_MAX}
          step={4}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value);
            onChange(Number.isFinite(next) ? Math.min(BACKGROUND_INSET_MAX, Math.max(0, Math.round(next))) : 0);
          }}
          className="h-9 w-full rounded-lg bg-[color:var(--pf-surface)] pe-7 ps-2.5 text-[13px] tabular-nums text-[color:var(--pf-palette-texte-fort)] shadow-[inset_0_0_0_1px_var(--pf-palette-bordure)] outline-hidden transition-shadow [appearance:textfield] focus:shadow-[inset_0_0_0_2px_var(--pf-palette-texte-muted)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span aria-hidden className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[color:var(--pf-palette-texte-muted)]">
          px
        </span>
      </span>
    </label>
  );
}

/**
 * Margins between the image and the screen edges: one value for all four sides by default (what
 * almost everyone wants); the link button splits it into Top / Right / Bottom / Left.
 */
function GlobalBackgroundMargins({
  top,
  right,
  bottom,
  left,
  onChange,
}: {
  top: number;
  right: number;
  bottom: number;
  left: number;
  onChange: (patch: Partial<Record<BackgroundInsetKey, number>>) => void;
}) {
  const t = useT();
  const [linked, setLinked] = useState(top === right && right === bottom && bottom === left);
  const all = (value: number) => ({
    backgroundImageInsetTop: value,
    backgroundImageInsetRight: value,
    backgroundImageInsetBottom: value,
    backgroundImageInsetLeft: value,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="np-field-label !mb-0">{t('Margins')}</span>
        <button
          type="button"
          aria-pressed={!linked}
          onClick={() => {
            if (!linked) onChange(all(top));
            setLinked(!linked);
          }}
          className="np-link-btn inline-flex h-8 items-center gap-1.5"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {linked ? (
              <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
            ) : (
              <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7M3 3l18 18" />
            )}
          </svg>
          {linked ? t('Same on all sides') : t('Per side')}
        </button>
      </div>
      {linked ? (
        <GlobalPxField label={t('All sides')} value={top} onChange={(value) => onChange(all(value))} />
      ) : (
        <div className="grid grid-cols-4 gap-2">
          <GlobalPxField label={t('Top')} value={top} onChange={(value) => onChange({ backgroundImageInsetTop: value })} />
          <GlobalPxField label={t('Right')} value={right} onChange={(value) => onChange({ backgroundImageInsetRight: value })} />
          <GlobalPxField label={t('Bottom')} value={bottom} onChange={(value) => onChange({ backgroundImageInsetBottom: value })} />
          <GlobalPxField label={t('Left')} value={left} onChange={(value) => onChange({ backgroundImageInsetLeft: value })} />
        </div>
      )}
    </div>
  );
}

/** Guaranteed-visible animated switch — hardcoded per dock-mode colors (see .pf-global-switch-*
 *  in globals.css) instead of palette-derived ones, which can land near-invisible against the
 *  dock's own chrome in some palette/mode combinations. */
function GlobalSwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span
      data-checked={checked ? 'true' : 'false'}
      className="pf-global-switch-track relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <span
        data-checked={checked ? 'true' : 'false'}
        className="pf-global-switch-thumb absolute top-0.5 h-4 w-4 rounded-full transition-[left,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ left: checked ? '1.125rem' : '0.125rem' }}
      />
    </span>
  );
}

/** Small keyboard-accessible "i" tooltip — shows non-obvious info on hover or focus
 *  instead of a permanent line of text under a toggle. */
function GlobalInfoTooltip({ text }: { text: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  return (
    <span className="relative inline-flex shrink-0">
      <button
        type="button"
        aria-describedby={open ? tooltipId : undefined}
        aria-label={t('More info: {text}', { text })}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[color:var(--np-muted,#a3a3a3)] transition hover:text-[color:var(--np-text,#525252)] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--np-muted,#a3a3a3)]"
      >
        <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="6.1" stroke="currentColor" strokeWidth="1.15" />
          <circle cx="7" cy="4.35" r="0.95" fill="currentColor" />
          <rect x="6.3" y="6.05" width="1.4" height="4.4" rx="0.7" fill="currentColor" />
        </svg>
      </button>
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-[color:var(--np-primary-bg,#171717)] px-2.5 py-1.5 text-xs font-medium leading-snug text-[color:var(--np-primary-ink,#ffffff)] shadow-lg"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

function GlobalSwitchRow({
  label,
  description,
  info,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  description?: string;
  /** Non-obvious info shown as a hover/focus tooltip instead of a permanent description line. */
  info?: string;
  checked: boolean;
  /** Dims the row and ignores clicks (e.g. a sub-switch whose parent switch is off). */
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  const inNavPanel = useInNpPanel();
  if (inNavPanel) {
    return (
      <NpToggleRow
        title={label}
        description={description}
        adornment={info ? <GlobalInfoTooltip text={info} /> : null}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }
  return (
    <div className={`flex w-full flex-col gap-1 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className="min-w-0 cursor-pointer text-sm font-medium text-neutral-950"
            onClick={() => onChange(!checked)}
          >
            {label}
          </span>
          {info ? <GlobalInfoTooltip text={info} /> : null}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className="shrink-0"
        >
          <GlobalSwitchTrack checked={checked} />
        </button>
      </div>
      {description ? (
        <span className="text-sm leading-relaxed text-neutral-500">{description}</span>
      ) : null}
    </div>
  );
}

const PALETTE_FAMILY_OPTIONS = [
  {
    id: 'indigo' as const,
    label: msg('Indigo'),
    dark: INDIGO_DARK_HERO_PALETTE,
    light: INDIGO_LIGHT_HERO_PALETTE,
  },
  {
    id: 'classic' as const,
    label: msg('Classic'),
    dark: DEFAULT_HERO_PALETTE,
    light: LIGHT_HERO_PALETTE,
  },
  {
    id: 'verdant' as const,
    label: msg('Verdant'),
    dark: VERDANT_DARK_HERO_PALETTE,
    light: VERDANT_LIGHT_HERO_PALETTE,
  },
  {
    id: 'vive' as const,
    label: msg('Vivid'),
    dark: VIVE_DARK_HERO_PALETTE,
    light: VIVE_LIGHT_HERO_PALETTE,
  },
  {
    id: 'safran' as const,
    label: msg('Saffron'),
    dark: SAFRAN_DARK_HERO_PALETTE,
    light: SAFRAN_LIGHT_HERO_PALETTE,
  },
  {
    id: 'citron' as const,
    label: msg('Lemon'),
    dark: CITRON_DARK_HERO_PALETTE,
    light: CITRON_LIGHT_HERO_PALETTE,
  },
  {
    id: 'rouge' as const,
    label: msg('Red'),
    dark: ROUGE_DARK_HERO_PALETTE,
    light: ROUGE_LIGHT_HERO_PALETTE,
  },
  {
    id: 'ecarlate' as const,
    label: msg('Scarlet'),
    dark: ECARLATE_DARK_HERO_PALETTE,
    light: ECARLATE_LIGHT_HERO_PALETTE,
  },
  {
    id: 'ardoise' as const,
    label: msg('Slate'),
    dark: ARDOISE_DARK_HERO_PALETTE,
    light: ARDOISE_LIGHT_HERO_PALETTE,
  },
] as const;

function GlobalSettingsPanel({
  settings,
  global,
  servicesSectionOrganization,
  onGlobalChange,
  onColorModeChange,
  onGlobalPaletteChange,
  onGlobalPalettePairChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  sectionEnabled,
  onSectionEnabledChange,
  title,
  chrome,
}: {
  settings: PortfolioSettings;
  global: PortfolioGlobalSettings;
  servicesSectionOrganization: PortfolioServicesSectionOrganization;
  onGlobalChange: (patch: PortfolioGlobalSettingsPatch) => void;
  onColorModeChange: (mode: PortfolioColorMode) => void;
  onGlobalPaletteChange: (patch: Partial<PortfolioHeroPalette>) => void;
  onGlobalPalettePairChange: (
    paletteDark: PortfolioHeroPalette,
    paletteLight?: PortfolioHeroPalette,
    family?: 'indigo' | 'classic' | 'verdant' | 'vive' | 'safran' | 'citron' | 'rouge' | 'ecarlate' | 'ardoise' | 'custom'
  ) => void;
  subSection?: GlobalSettingsSubSection;
  onSubSectionChange?: (value: GlobalSettingsSubSection) => void;
  sectionEnabled?: Partial<Record<PortfolioNavSectionKey, boolean>>;
  onSectionEnabledChange?: (key: PortfolioNavSectionKey, enabled: boolean) => void;
  title: string;
  /** The panel's own header and footer (the studio dock); without it the host frames the tabs. */
  chrome?: NpPanelChrome;
}) {
  const t = useT();
  const [uncontrolledSubSection, setUncontrolledSubSection] =
    useState<GlobalSettingsSubSection>('theme');
  const subSection = controlledSubSection ?? uncontrolledSubSection;
  const setSubSection = (value: GlobalSettingsSubSection) => {
    onSubSectionChange?.(value);
    if (controlledSubSection === undefined) setUncontrolledSubSection(value);
  };
  const activePalette = resolveActivePortfolioPalette(global);
  const activeMode = (global.colorMode ?? 'dark') === 'light' ? 'light' : 'dark';
  const activeFamily = inferPaletteFamily(global);

  // Remembers the last non-custom family so "Reset" can restore that exact pair —
  // editing a token sets paletteFamily to 'custom', which would otherwise lose it.
  const lastFamilyRef = useRef<Exclude<typeof activeFamily, 'custom'>>('classic');
  useEffect(() => {
    if (activeFamily !== 'custom') lastFamilyRef.current = activeFamily;
  }, [activeFamily]);

  const handleResetPaletteTokens = () => {
    const preset =
      PALETTE_FAMILY_OPTIONS.find((family) => family.id === lastFamilyRef.current) ??
      PALETTE_FAMILY_OPTIONS.find((family) => family.id === 'classic')!;
    onGlobalPalettePairChange(preset.dark, preset.light, preset.id);
  };


  const defaults = globalTabDefaults();
  const tabKeys: readonly (keyof PortfolioGlobalSettings)[] = GLOBAL_TAB_KEYS[subSection];
  const modified = tabKeys.some((key) => !sameSetting(global[key], defaults[key]));
  const resetTab = () =>
    onGlobalChange(Object.fromEntries(tabKeys.map((key) => [key, defaults[key]])) as PortfolioGlobalSettingsPatch);
  const fitOptions = [
    { value: 'cover' as const, label: t('Fill screen'), help: t('Fills the screen — may crop the image.') },
    { value: 'contain' as const, label: t('Whole image'), help: t('Shows the whole image — may leave empty space.') },
    { value: 'fill' as const, label: t('Stretch'), help: t('Ignores the image’s proportions — it may look distorted.') },
  ];
  const spacingOptions = (options: typeof GLOBAL_SECTION_TOP_SPACING_PREVIEW_OPTIONS) =>
    options.map((option) => ({
      value: option.value,
      label: SPACING_TIER_SHORT[option.value] ?? t(option.label),
      title: t(option.label),
    }));
  const spacingHelp = (value: PortfolioGlobalSectionTitleTopSpacing) =>
    t(GLOBAL_SECTION_TOP_SPACING_PREVIEW_OPTIONS.find((option) => option.value === value)?.label ?? value);

  return (
    <NpPanelShell
      title={title}
      modified={modified}
      tabs={GLOBAL_SETTINGS_SUB_SECTIONS.map((section) => ({
        id: section.id,
        label: t(GLOBAL_SETTINGS_TAB_LABELS[section.id]),
      }))}
      activeTab={subSection}
      onTabChange={setSubSection}
      onReset={resetTab}
      chrome={chrome}
    >
      {subSection === 'theme' ? (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Colors')}>
            {/* Both modes shown at once: an on/off "Light mode" switch hid what "off" meant. */}
            <NpSegmentedControl
              label={t('Color mode')}
              options={[
                { value: 'dark' as const, label: t('Dark') },
                { value: 'light' as const, label: t('Light') },
              ]}
              value={activeMode}
              onChange={(mode) => onColorModeChange(mode)}
            />

            <NpOptionCardGroup label={t('Site color palette')} columns={3}>
              {PALETTE_FAMILY_OPTIONS.map((family) => (
                <NpOptionCard
                  key={family.id}
                  compact
                  selected={activeFamily === family.id}
                  title={t(family.label)}
                  onClick={() => onGlobalPalettePairChange(family.dark, family.light, family.id)}
                  illustration={
                    /* The palette as one ribbon (its 8 tokens in order) — read at a glance. */
                    <span className="np-illus !p-1.5">
                      <span className="np-ribbon">
                        {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
                          <span
                            key={token.value}
                            style={{
                              backgroundColor:
                                activeMode === 'light' ? family.light[token.value] : family.dark[token.value],
                            }}
                          />
                        ))}
                      </span>
                    </span>
                  }
                />
              ))}
            </NpOptionCardGroup>

            {/* Advanced: the palette's 8 colours, one by one — folded unless the palette is custom. */}
            <GlobalPaletteTokens
              key={activeFamily === 'custom' ? 'custom' : 'preset'}
              defaultOpen={activeFamily === 'custom'}
              modeLabel={activeMode === 'light' ? t('Light mode') : t('Dark mode')}
              onReset={activeFamily === 'custom' ? handleResetPaletteTokens : undefined}
            >
              {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
                <FoundationTokenSwatch
                  key={token.value}
                  label={t(PALETTE_TOKEN_DISPLAY_LABELS[token.value] ?? token.label)}
                  value={resolveHeroPaletteColor(activePalette, token.value)}
                  onChange={(color) => onGlobalPaletteChange({ [token.value]: color })}
                />
              ))}
            </GlobalPaletteTokens>
          </NpCollapsibleSection>

          <NpCollapsibleSection title={t('Layout & width')}>
            <GlobalPreviewCardGrid
              label={t('Content width')}
              options={GLOBAL_CONTENT_WIDTH_PREVIEW_OPTIONS}
              value={global.contentWidth}
              onChange={(contentWidth) => onGlobalChange({ contentWidth })}
              columns={3}
            />
            <GlobalPreviewCardGrid
              label={t('Side margins')}
              options={GLOBAL_CONTENT_GUTTER_PREVIEW_OPTIONS}
              value={global.contentGutter}
              onChange={(contentGutter) => onGlobalChange({ contentGutter })}
              columns={4}
            />
          </NpCollapsibleSection>

          <NpCollapsibleSection title={t('Section spacing')}>
            <GlobalSectionSpacingPreview
              topSpacing={global.sectionTitleTopSpacing}
              bottomSpacing={global.sectionTitleBottomSpacing}
            />
            <NpSegmentedControl
              label={t('Top padding')}
              options={spacingOptions(GLOBAL_SECTION_TOP_SPACING_PREVIEW_OPTIONS)}
              value={global.sectionTitleTopSpacing}
              onChange={(sectionTitleTopSpacing) => onGlobalChange({ sectionTitleTopSpacing })}
              help={spacingHelp(global.sectionTitleTopSpacing)}
            />
            <NpSegmentedControl
              label={t('Bottom padding')}
              options={spacingOptions(GLOBAL_SECTION_BOTTOM_SPACING_PREVIEW_OPTIONS)}
              value={global.sectionTitleBottomSpacing}
              onChange={(sectionTitleBottomSpacing) => onGlobalChange({ sectionTitleBottomSpacing })}
              help={spacingHelp(global.sectionTitleBottomSpacing)}
            />
          </NpCollapsibleSection>

          <NpCollapsibleSection title={t('Animations')}>
            <GlobalSwitchRow
              label={t('Motion effects')}
              description={t('Entrance reveals, scroll and hover animations on every section. Turn off for a fully static page.')}
              checked={global.motionEnabled ?? true}
              onChange={(motionEnabled) => onGlobalChange({ motionEnabled })}
            />
            <GlobalSwitchRow
              label={t('Header animations')}
              description={t('Entrance reveals and scroll effects on the section headers only. Turn off to keep every header static while the rest of the page still animates.')}
              checked={(global.motionEnabled ?? true) && (global.headerMotionEnabled ?? true)}
              disabled={global.motionEnabled === false}
              onChange={(headerMotionEnabled) => onGlobalChange({ headerMotionEnabled })}
            />
          </NpCollapsibleSection>

          <NpCollapsibleSection title={t('Preferences')} defaultOpen={false}>
            <GlobalSwitchRow
              label={t('Settings keyboard shortcut')}
              description={t('Ctrl+, (⌘ on Mac) — owner only.')}
              checked={global.settingsShortcutEnabled ?? true}
              onChange={(settingsShortcutEnabled) => onGlobalChange({ settingsShortcutEnabled })}
            />
          </NpCollapsibleSection>
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="np-stack">
          <NpToggleRow
            card
            title={t('Page background')}
            description={t('An image fixed behind every section. A section’s own image fill still shows on top.')}
            checked={global.backgroundEnabled}
            onChange={(backgroundEnabled) => onGlobalChange({ backgroundEnabled })}
          />

          <div
            className="np-dimmable"
            data-disabled={global.backgroundEnabled ? 'false' : 'true'}
            aria-disabled={!global.backgroundEnabled}
            inert={!global.backgroundEnabled}
          >
            <NpCollapsibleSection title={t('Image')}>
              <div>
                <GlobalBackgroundPreview
                  global={global}
                  onFocusChange={(backgroundImagePosition) => onGlobalChange({ backgroundImagePosition })}
                />
                {global.backgroundImageUrl.trim() && global.backgroundImageSize !== 'fill' ? (
                  <p className="np-help">{t('Click the preview to choose the part of the image that stays in view.')}</p>
                ) : null}
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="np-field-label !mb-0">{t('Image library')}</p>
                  <span className="np-value-badge">
                    {global.backgroundImageLibrary.length}/{MAX_PORTFOLIO_BACKGROUND_IMAGES}
                  </span>
                </div>
                <PortfolioBackgroundLibrary
                  url={global.backgroundImageUrl}
                  onChange={(backgroundImageUrl) => onGlobalChange({ backgroundImageUrl })}
                  library={global.backgroundImageLibrary}
                  onLibraryChange={(backgroundImageLibrary) => onGlobalChange({ backgroundImageLibrary })}
                />
              </div>
            </NpCollapsibleSection>

            <NpCollapsibleSection title={t('Appearance')}>
              <NpSegmentedControl
                label={t('Image fit')}
                options={fitOptions.map(({ value, label, help }) => ({ value, label, title: help }))}
                value={global.backgroundImageSize}
                onChange={(backgroundImageSize) => onGlobalChange({ backgroundImageSize })}
                help={fitOptions.find((option) => option.value === global.backgroundImageSize)?.help}
              />
              <NpRangeField
                label={t('Opacity')}
                value={global.backgroundOpacity}
                min={0}
                max={100}
                unit="%"
                onChange={(backgroundOpacity) => onGlobalChange({ backgroundOpacity })}
              />
            </NpCollapsibleSection>

            {/* Rarely needed: folded. */}
            <NpCollapsibleSection title={t('Advanced')} defaultOpen={false}>
              <GlobalBackgroundMargins
                top={global.backgroundImageInsetTop}
                right={global.backgroundImageInsetRight}
                bottom={global.backgroundImageInsetBottom}
                left={global.backgroundImageInsetLeft}
                onChange={(patch) => onGlobalChange(patch)}
              />
            </NpCollapsibleSection>
          </div>
        </div>
      ) : null}

      {subSection === 'order' ? (
        <GlobalSectionOrderBlock
          hiddenFromMenu={
            (settings.navigation.navMode ?? 'default') === 'pages' ? [] : settings.navigation.hiddenNavItems ?? []
          }
          sectionOrder={global.sectionOrder}
          servicesSectionOrganization={servicesSectionOrganization}
          onChange={(sectionOrder) => onGlobalChange({ sectionOrder })}
          sectionEnabled={sectionEnabled}
          onSectionEnabledChange={onSectionEnabledChange}
        />
      ) : null}
    </NpPanelShell>
  );
}

/** Each Global tab's own settings: what its "Reset" restores and what the header's status compares. */
const GLOBAL_TAB_KEYS = {
  theme: [
    'contentWidth',
    'contentGutter',
    'sectionTitleTopSpacing',
    'sectionTitleBottomSpacing',
    'motionEnabled',
    'headerMotionEnabled',
    'settingsShortcutEnabled',
  ],
  background: [
    'backgroundEnabled',
    'backgroundOpacity',
    'backgroundImageSize',
    'backgroundImagePosition',
    'backgroundImageInsetTop',
    'backgroundImageInsetRight',
    'backgroundImageInsetBottom',
    'backgroundImageInsetLeft',
  ],
  order: ['sectionOrder'],
} as const satisfies Record<GlobalSettingsSubSection, readonly (keyof PortfolioGlobalSettings)[]>;

let globalTabDefaultsCache: PortfolioGlobalSettings | null = null;

function globalTabDefaults(): PortfolioGlobalSettings {
  if (!globalTabDefaultsCache) globalTabDefaultsCache = createDefaultPortfolioSettings().global;
  return globalTabDefaultsCache;
}

/** Equality for a setting value (arrays such as the section order compare by content). */
function sameSetting(a: unknown, b: unknown) {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((item, index) => item === b[index]);
  return a === b;
}

/** "Customize colors": the palette's 8 tokens in a card, behind a disclosure; a reset while custom. */
function GlobalPaletteTokens({
  defaultOpen,
  modeLabel,
  onReset,
  children,
}: {
  defaultOpen: boolean;
  modeLabel: string;
  onReset?: () => void;
  children: ReactNode;
}) {
  const t = useT();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} className="np-disclosure">
          <svg viewBox="0 0 24 24" className="np-disclosure-chevron h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m9 6 6 6-6 6" />
          </svg>
          {t('Customize colors')}
          <span className="np-subtle">· {modeLabel}</span>
        </button>
        {onReset ? (
          <button type="button" onClick={onReset} className="np-link-btn">
            {t('Reset')}
          </button>
        ) : null}
      </div>
      {open ? <div className="np-group-card mt-2 grid grid-cols-2 !gap-1 !p-1.5">{children}</div> : null}
    </div>
  );
}

/** Layouts that come with their own extra settings (shown under Design → Layout options). */
const NAV_LAYOUTS_WITH_OPTIONS: ReadonlySet<string> = new Set([
  'editorial-bar',
  'floating-pill',
  'center-logo-split',
  'case-overlay',
  'duten-panel',
  'half-panel-left',
]);

/**
 * One menu item as a 52px row of the Labels list: its icon and the name visitors read. Opening it
 * shows the name field with a few suggestions, then the icons as a plain grid (the name of each icon
 * in its tooltip — 9px captions under every glyph were unreadable).
 */
function NavItemCustomizer({
  sectionKey,
  title,
  label,
  icon,
  expanded,
  hiddenFromMenu,
  onToggleExpanded,
  onToggleHidden,
  onLabelChange,
  onIconChange,
}: {
  sectionKey: PortfolioNavSectionKey;
  title: string;
  label: string;
  icon: PortfolioNavIconVariant;
  expanded: boolean;
  hiddenFromMenu: boolean;
  onToggleExpanded: () => void;
  /** Absent in pages mode, where every section needs its link. */
  onToggleHidden?: () => void;
  onLabelChange: (label: string) => void;
  onIconChange: (icon: PortfolioNavIconVariant) => void;
}) {
  const t = useT();
  const labelPresets = PORTFOLIO_NAV_LABEL_PRESETS[sectionKey];
  const iconOptions = PORTFOLIO_NAV_ICON_OPTIONS[sectionKey];
  const shown = label.trim() || title;

  return (
    <li>
      <div className="np-list-row" data-open={expanded ? 'true' : 'false'}>
        <button type="button" onClick={onToggleExpanded} aria-expanded={expanded} className="np-list-main">
          <span className="np-list-icon" data-muted={hiddenFromMenu ? 'true' : 'false'}>
            <PortfolioNavIcon variant={icon} className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="np-list-title" data-muted={hiddenFromMenu ? 'true' : 'false'}>
              {shown}
            </span>
            {hiddenFromMenu ? (
              <span className="np-list-sub">{t('Hidden from the menu — still on the page')}</span>
            ) : shown !== title ? (
              <span className="np-list-sub">{title}</span>
            ) : null}
          </span>
          <svg viewBox="0 0 24 24" className="np-list-chevron h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {onToggleHidden ? (
          <button
            type="button"
            onClick={onToggleHidden}
            aria-pressed={!hiddenFromMenu}
            aria-label={hiddenFromMenu ? t('Show in the menu') : t('Hide from the menu')}
            title={hiddenFromMenu ? t('Show in the menu') : t('Hide from the menu')}
            className="np-row-btn"
            data-on={hiddenFromMenu ? 'false' : 'true'}
          >
            <NpEyeIcon open={!hiddenFromMenu} />
          </button>
        ) : null}
      </div>

      {expanded ? (
        <div className="np-list-detail">
          <div>
            <label className="np-field block">
              <span className="np-field-label">{t('Menu name')}</span>
              <input
                type="text"
                value={label}
                maxLength={32}
                onChange={(event) => onLabelChange(event.target.value)}
                placeholder={title}
                className="np-input"
              />
            </label>
            {labelPresets.length > 0 ? (
              <div className="np-chips mt-3" role="group" aria-label={t('Quick suggestions:')}>
                {labelPresets.map((preset, presetIndex) => (
                  <button
                    key={`${sectionKey}-label-${presetIndex}-${preset.value}`}
                    type="button"
                    aria-pressed={label === preset.value}
                    onClick={() => onLabelChange(preset.value)}
                    className="np-chip"
                  >
                    {t(preset.label)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <p className="np-field-label">{t('Icon')}</p>
            <div role="radiogroup" aria-label={t('Icon')} className="np-icon-grid">
              {iconOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={icon === option.value}
                  aria-label={t(option.label)}
                  title={t(option.label)}
                  onClick={() => onIconChange(option.value)}
                  className="np-icon-choice"
                >
                  <PortfolioNavIcon variant={option.value} className="h-[18px] w-[18px]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
}

/** Eye / crossed eye: shown or hidden (menu items, section order). */
function NpEyeIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {open ? (
        <>
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M10.6 5.6A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.6 6.6C3.9 8.4 2.5 12 2.5 12S6 18.5 12 18.5a9 9 0 0 0 4.9-1.4" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
        </>
      )}
    </svg>
  );
}

function NavigationLabelsIconsPanel({
  itemLabels,
  itemIcons,
  hiddenItems,
  pagesMode,
  onChange,
}: {
  itemLabels: PortfolioNavItemLabels;
  itemIcons: PortfolioNavItemIcons;
  hiddenItems: PortfolioNavSectionKey[];
  /** One page per section: every section needs its link, so nothing can be hidden. */
  pagesMode: boolean;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  const t = useT();
  // One item open at a time.
  const [openSection, setOpenSection] = useState<PortfolioNavSectionKey | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <p className="np-subtle">
        {t('The name and icon of each section in the menu. Leave a name empty to keep the default.')}
      </p>
      {pagesMode ? (
        <p className="np-note">{t('In pages mode every section needs its menu link, so none can be hidden.')}</p>
      ) : null}
      <ul className="np-list">
        {PORTFOLIO_NAV_SECTION_META.map((section) => (
          <NavItemCustomizer
            key={section.key}
            sectionKey={section.key}
            title={t(section.title)}
            label={itemLabels[section.key]}
            icon={itemIcons[section.key]}
            expanded={openSection === section.key}
            hiddenFromMenu={!pagesMode && hiddenItems.includes(section.key)}
            onToggleExpanded={() => setOpenSection((current) => (current === section.key ? null : section.key))}
            onToggleHidden={
              pagesMode
                ? undefined
                : () =>
                    onChange({
                      hiddenNavItems: hiddenItems.includes(section.key)
                        ? hiddenItems.filter((key) => key !== section.key)
                        : [...hiddenItems, section.key],
                    })
            }
            onLabelChange={(nextLabel) => onChange({ itemLabels: { ...itemLabels, [section.key]: nextLabel } })}
            onIconChange={(nextIcon) => onChange({ itemIcons: { ...itemIcons, [section.key]: nextIcon } })}
          />
        ))}
      </ul>
    </div>
  );
}

/**
 * Dropdown menus: a named entry in the bar that opens on two or more sections. Each group is a
 * small card — its name, the sections as pills (a section already in another group is greyed),
 * and a quiet remove. Rarely needed, so it comes after the item names.
 */
function NavLayoutDesignPreview({
  design,
  accent,
  strongText,
  muted,
}: {
  design: PortfolioNavLayoutDesign;
  accent: string;
  strongText: string;
  muted: string;
}) {
  const t = useT();
  if (design === 'classic') {
    return (
      <div className="flex justify-center">
        <div className="flex gap-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-1.5 shadow-xs">
          <span className="h-2 w-7 rounded-full bg-neutral-300" />
          <span className="h-2 w-7 rounded-full bg-neutral-300" />
          <span className="h-2 w-7 rounded-full bg-neutral-300" />
        </div>
      </div>
    );
  }

  if (design === 'floating-pill') {
    return (
      <div className="flex w-full justify-center">
        <div className="grid w-full max-w-[280px] grid-cols-[auto_1fr_auto] items-center gap-2 rounded-full border border-neutral-200 bg-white px-2.5 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <span className="text-[10px] font-bold text-neutral-900">{PORTFOLIO_NAV_IN_BAR_BRAND_LABEL}</span>
          <div className="flex items-center justify-center gap-1.5 text-neutral-800">
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-900" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-neutral-300 text-[8px] text-neutral-700">
              ☀
            </span>
            <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[7px] font-medium text-white">
              {t('email')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (design === 'center-logo-split') {
    return (
      <div className="w-full overflow-hidden rounded-lg bg-neutral-900/90 px-2.5 py-2">
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center justify-end gap-2 text-[8px] text-white/90">
            <span>{t('Home')}</span>
            <span className="text-white/60">{t('About')}</span>
          </div>
          <span className="text-[10px] font-bold text-white">{PORTFOLIO_NAV_IN_BAR_BRAND_LABEL}</span>
          <div className="flex items-center justify-start gap-2 text-[8px] text-white/90">
            <span className="text-white/60">{t('Work')}</span>
            <span>{t('Contact')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (design === 'case-overlay') {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <span className="text-[8px] font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
            {t('Stack')}
          </span>
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[7px] font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            L
          </span>
          <span className="justify-self-end text-[8px] font-semibold uppercase tracking-[0.14em] text-white">
            {t('Menu')}
          </span>
        </div>
      </div>
    );
  }

  if (design === 'duten-panel') {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 p-2">
        <div className="rounded-full border border-neutral-300/80 bg-neutral-50 px-3 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[7px] text-neutral-400">{t('Stack')}</span>
            <span className="text-[8px] font-bold text-neutral-900">{t('Logo')}</span>
            <span className="text-[7px] font-medium uppercase tracking-[0.12em] text-neutral-700">{t('Menu')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (design === 'half-panel-left') {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
        <div className="grid grid-cols-2">
          <div className="bg-neutral-300/40 p-2 text-[6px] text-neutral-500">{t('Page')}</div>
          <div className="space-y-1.5 bg-[#C8C9B8] p-2">
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-bold text-neutral-900">{t('Logo')}</span>
              <span className="text-[7px] text-neutral-700">{t('×')}</span>
            </div>
            <p className="text-[6px] text-neutral-600">{t('Discover Pages')}</p>
            <div className="grid grid-cols-2 gap-1 text-[6px] text-neutral-800">
              <span className="underline">{t('Home')}</span>
              <span>{t('Work')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <span className="truncate text-[11px] font-bold" style={{ color: strongText }}>
          {PORTFOLIO_NAV_IN_BAR_BRAND_LABEL}
        </span>
        <div className="flex items-center gap-2 text-[9px]">
          <span
            className="border-b pb-px font-medium"
            style={{ color: accent, borderColor: accent }}
          >
            {t('Stack')}
          </span>
          <span style={{ color: muted }}>{t('Tools')}</span>
        </div>
        <span
          className="justify-self-end rounded border px-1.5 py-0.5 text-[9px]"
          style={{ color: strongText, borderColor: muted }}
        >
          {t('Call me')}
        </span>
      </div>
    </div>
  );
}

/** Single normal-case, medium-weight, muted label — the one typographic
 *  treatment for every section label in the Editorial bar / Social nav panels. */
function NavFieldLabel({ children }: { children: ReactNode }) {
  return <p className="np-field-label !mb-0">{children}</p>;
}

/** Closed-by-default disclosure for the fine-grained, rarely-touched controls. */
function NavAdvancedOptionsDisclosure({ children }: { children: ReactNode }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="np-disclosure"
      >
        <svg viewBox="0 0 24 24" className="np-disclosure-chevron h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m9 6 6 6-6 6" />
        </svg>
        {t('Advanced options')}
      </button>
      {open ? <div className="np-editor mt-4">{children}</div> : null}
    </div>
  );
}

function NavTriZoneSocialLinkPicker({
  options,
  selectedIds,
  onChange,
  maxLinks = 3,
}: {
  options: PortfolioNavChromeLink[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxLinks?: number;
}) {
  const t = useT();
  if (options.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[color:var(--pf-palette-bordure)] bg-transparent px-4 py-3 text-sm text-[color:var(--pf-palette-texte-muted)]">
        {t('No links found — add some in Creator Studio > Links first.')}
      </p>
    );
  }

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((value) => value !== id));
      return;
    }
    if (selectedIds.length >= maxLinks) return;
    onChange([...selectedIds, id]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <NavFieldLabel>{t('Links shown')}</NavFieldLabel>
        <GlobalInfoTooltip text={t('Up to {maxLinks} — leave empty to auto-pick the first available.', { maxLinks })} />
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((link) => {
          const selected = selectedIds.includes(link.id);
          const disabled = !selected && selectedIds.length >= maxLinks;
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => toggle(link.id)}
              disabled={disabled}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                selected
                  ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-palette-texte-fort)] text-[color:var(--pf-palette-fond)]'
                  : disabled
                    ? 'cursor-not-allowed border-[color:var(--pf-palette-bordure)] bg-transparent text-[color:var(--pf-palette-texte-muted)]'
                    : 'border-[color:var(--pf-palette-bordure)] bg-transparent text-[color:var(--pf-palette-texte-muted)] hover:border-[color:var(--pf-palette-texte-muted)]'
              }`}
            >
              <LinkBrandIcon
                url={link.href}
                platform={link.platform}
                iconUrl={link.iconUrl}
                size="compact"
              />
              <span>{t(link.label)}</span>
            </button>
          );
        })}
      </div>
      {selectedIds.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-sm text-[color:var(--pf-palette-texte-muted)] underline-offset-2 hover:text-[color:var(--pf-palette-texte-fort)] hover:underline"
        >
          {t('Reset (automatic display)')}
        </button>
      ) : null}
    </div>
  );
}

const NAV_CONTACT_BUTTON_DISPLAY_OPTIONS: {
  value: PortfolioNavContactButtonDisplay;
  label: string;
  description: string;
}[] = [
  { value: 'icon', label: msg('Icon only'), description: msg('Compact circular icon, no visible label.') },
  { value: 'button', label: msg('Button with label'), description: msg('Icon plus text in a frame — more visible.') },
];

/** Actual rendered mini-button for a given frame style, used inside the "Button frame" picker. */
function NavContactButtonShapePreview({ shape }: { shape: PortfolioNavContactButtonShape }) {
  const t = useT();
  const isMinimal = shape === 'frameless' || shape === 'bottom-line';
  const frame = portfolioNavContactButtonShellPresentation(
    shape,
    isMinimal
      ? { background: 'transparent', color: '#171717', border: '#171717', borderEnabled: false }
      : { background: '#171717', color: '#ffffff', border: '#171717', borderEnabled: false }
  );
  return (
    <span
      className={`inline-flex items-center justify-center px-3.5 py-1.5 text-[11px] font-semibold ${frame.className} ${
        // Minimal shapes have no background of their own, so their text sits directly on
        // whatever surface is behind them — it must follow light/dark mode like every other
        // label in this panel instead of staying hardcoded to a light-mode-only color.
        isMinimal ? 'text-neutral-900' : ''
      }`}
      style={frame.style}
    >
      {t('Label')}
    </span>
  );
}

function NavContactButtonShapeGrid({
  value,
  onChange,
}: {
  value: PortfolioNavContactButtonShape;
  onChange: (value: PortfolioNavContactButtonShape) => void;
}) {
  const t = useT();
  return (
    <div>
      <NavFieldLabel>{t('Button frame')}</NavFieldLabel>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {PORTFOLIO_NAV_CONTACT_BUTTON_SHAPE_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              title={t(option.description)}
              onClick={() => onChange(option.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-2 transition ${
                active ? 'bg-[color:var(--pf-surface)] ring-1 ring-inset ring-[color:var(--pf-palette-texte-fort)]' : 'hover:bg-[color:var(--pf-surface)]'
              }`}
            >
              <NavContactButtonShapePreview shape={option.value} />
              <span className="text-[11px] font-medium text-[color:var(--pf-palette-texte-muted)]">{t(option.label)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavCaseOverlayLogoEditor({
  navigation,
  onChange,
  showColorModeToggleInNav = false,
  onGlobalChange,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
  showColorModeToggleInNav?: boolean;
  onGlobalChange?: (patch: PortfolioGlobalSettingsPatch) => void;
}) {
  const t = useT();
  const menuTrigger = navigation.caseOverlayMenuTrigger ?? 'text';

  return (
    <div className="np-editor">
      <div className="space-y-4">
        <PortfolioBackgroundImageUpload
          label={t('Logo')}
          url={navigation.customExtraLogoUrl ?? ''}
          onChange={(customExtraLogoUrl) => onChange({ customExtraLogoUrl })}
          helperText={t('PNG or SVG, transparent background preferred.')}
        />
        <NpRangeField
          label={t('Logo size')}
          value={navigation.customExtraLogoSizePx ?? 28}
          min={18}
          max={48}
          unit={t('px')}
          onChange={(next) =>
            onChange({ customExtraLogoSizePx: clampPortfolioNavCustomExtraLogoSizePx(next, 28) })
          }
        />
      </div>

      <div className="pf-gs-section">
        <GlobalPreviewCardGrid
          label={t('Menu / logo placement')}
          options={NAV_MENU_LOGO_PLACEMENT_PREVIEW_OPTIONS}
          value={navigation.caseOverlayMenuSide ?? 'right'}
          onChange={(caseOverlayMenuSide) => onChange({ caseOverlayMenuSide })}
          columns={2}
        />
      </div>

      <div className="pf-gs-section space-y-3">
        <GlobalPreviewCardGrid
          label={t('Menu button')}
          options={NAV_MENU_BUTTON_PREVIEW_OPTIONS}
          value={menuTrigger}
          onChange={(caseOverlayMenuTrigger) => onChange({ caseOverlayMenuTrigger })}
          columns={2}
        />

        {menuTrigger === 'icon' ? (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--pf-palette-texte-muted)]">{t('Menu icon')}</p>
            <div className="flex flex-wrap gap-2">
              {PORTFOLIO_NAV_MENU_CONTROL_ICON_OPTIONS.map((option) => {
                const active = (navigation.menuControlIcon ?? 'menu') === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    title={t(option.description)}
                    onClick={() => onChange({ menuControlIcon: option.value })}
                    className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                      active
                        ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-palette-texte-fort)] text-[color:var(--pf-palette-fond)]'
                        : 'border-[color:var(--pf-palette-bordure)] bg-transparent text-[color:var(--pf-palette-texte-muted)] hover:border-[color:var(--pf-palette-texte-muted)]'
                    }`}
                  >
                    {t(option.label)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="pf-gs-section">
        <ToggleRow
          label={t('Light/dark toggle in bar')}
          checked={showColorModeToggleInNav}
          onChange={(next) => onGlobalChange?.({ showColorModeToggleInNav: next })}
        />
      </div>
    </div>
  );
}

/** 1 vs 2 stacked link columns — preview for Link columns. */
function navLinkColumnsGlyph(columns: 1 | 2) {
  return (active: boolean) => {
    const cls = active ? 'pf-stack-mini-accent' : 'pf-stack-mini-mute';
    if (columns === 1) {
      return (
        <>
          <rect className={cls} x="24" y="10" width="16" height="2.6" rx="1.3" />
          <rect className={cls} x="24" y="16.2" width="16" height="2.6" rx="1.3" />
          <rect className={cls} x="24" y="22.4" width="16" height="2.6" rx="1.3" />
        </>
      );
    }
    return (
      <>
        <rect className={cls} x="12" y="10" width="14" height="2.6" rx="1.3" />
        <rect className={cls} x="12" y="16.2" width="14" height="2.6" rx="1.3" />
        <rect className={cls} x="12" y="22.4" width="14" height="2.6" rx="1.3" />
        <rect className={cls} x="38" y="10" width="14" height="2.6" rx="1.3" />
        <rect className={cls} x="38" y="16.2" width="14" height="2.6" rx="1.3" />
        <rect className={cls} x="38" y="22.4" width="14" height="2.6" rx="1.3" />
      </>
    );
  };
}

/** Logo dot + menu lines on opposite sides — preview for Menu / logo placement. */
function navMenuLogoPlacementGlyph(side: 'left' | 'right') {
  return (active: boolean) => {
    const cls = active ? 'pf-stack-mini-accent' : 'pf-stack-mini-mute';
    const logoX = side === 'right' ? 14 : 50;
    const menuX = side === 'right' ? 34 : 10;
    return (
      <>
        <circle className={cls} cx={logoX} cy="17" r="4" />
        <rect className={cls} x={menuX} y="12.6" width="16" height="2.4" rx="1.2" />
        <rect className={cls} x={menuX} y="18.2" width="16" height="2.4" rx="1.2" />
      </>
    );
  };
}

/** "Menu" word vs hamburger bars — preview for Menu button. */
function navMenuButtonGlyph(mode: 'text' | 'icon') {
  return (active: boolean) => {
    const cls = active ? 'pf-stack-mini-accent' : 'pf-stack-mini-mute';
    if (mode === 'icon') {
      return (
        <>
          <rect className={cls} x="24" y="12" width="16" height="2.2" rx="1.1" />
          <rect className={cls} x="24" y="16.4" width="16" height="2.2" rx="1.1" />
          <rect className={cls} x="24" y="20.8" width="16" height="2.2" rx="1.1" />
        </>
      );
    }
    return (
      <text x="32" y="20" textAnchor="middle" fontSize="9" fontWeight="600" className="pf-stack-mini-type">
        Menu
      </text>
    );
  };
}

const NAV_LINK_COLUMNS_PREVIEW_OPTIONS: { value: '2' | '1'; label: string; glyph: (active: boolean) => ReactNode }[] = [
  { value: '2', label: msg('2 columns'), glyph: navLinkColumnsGlyph(2) },
  { value: '1', label: msg('1 column'), glyph: navLinkColumnsGlyph(1) },
];

const NAV_MENU_LOGO_PLACEMENT_PREVIEW_OPTIONS: {
  value: 'left' | 'right';
  label: string;
  glyph: (active: boolean) => ReactNode;
}[] = [
  { value: 'right', label: msg('Menu right'), glyph: navMenuLogoPlacementGlyph('right') },
  { value: 'left', label: msg('Menu left'), glyph: navMenuLogoPlacementGlyph('left') },
];

const NAV_MENU_BUTTON_PREVIEW_OPTIONS: {
  value: 'text' | 'icon';
  label: string;
  glyph: (active: boolean) => ReactNode;
}[] = [
  { value: 'text', label: msg('Text'), glyph: navMenuButtonGlyph('text') },
  { value: 'icon', label: msg('Icon'), glyph: navMenuButtonGlyph('icon') },
];

function NavDutenPanelEditor({
  navigation,
  options,
  onChange,
  showColorModeToggleInNav = false,
  onGlobalChange,
}: {
  navigation: PortfolioNavSettings;
  options: PortfolioNavChromeLink[];
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
  showColorModeToggleInNav?: boolean;
  onGlobalChange?: (patch: PortfolioGlobalSettingsPatch) => void;
}) {
  const t = useT();
  const menuTrigger = navigation.caseOverlayMenuTrigger ?? 'text';
  const showContact = navigation.dutenPanelShowContact ?? false;
  const showSocial = navigation.dutenPanelShowSocial ?? false;
  const showHeroWord = navigation.dutenPanelShowHeroWord ?? false;

  const chipClass = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
      active
        ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-palette-texte-fort)] text-[color:var(--pf-palette-fond)]'
        : 'border-[color:var(--pf-palette-bordure)] bg-transparent text-[color:var(--pf-palette-texte-muted)] hover:border-[color:var(--pf-palette-texte-muted)]'
    }`;

  return (
    <div className="np-editor">
      <div className="space-y-4">
        <PortfolioBackgroundImageUpload
          label={t('Logo')}
          url={navigation.customExtraLogoUrl ?? ''}
          onChange={(customExtraLogoUrl) => onChange({ customExtraLogoUrl })}
          helperText={t('PNG or SVG, transparent background preferred.')}
        />
        <NpRangeField
          label={t('Logo size')}
          value={navigation.customExtraLogoSizePx ?? 32}
          min={18}
          max={56}
          unit={t('px')}
          onChange={(next) =>
            onChange({ customExtraLogoSizePx: clampPortfolioNavCustomExtraLogoSizePx(next, 32) })
          }
        />
      </div>

      <div className="pf-gs-section">
        <GlobalPreviewCardGrid
          label={t('Link columns')}
          options={NAV_LINK_COLUMNS_PREVIEW_OPTIONS}
          value={String(navigation.dutenPanelColumns ?? 2)}
          onChange={(value) => onChange({ dutenPanelColumns: value === '1' ? 1 : 2 })}
          columns={2}
        />
      </div>

      <div className="pf-gs-section">
        <GlobalPreviewCardGrid
          label={t('Menu / logo placement')}
          options={NAV_MENU_LOGO_PLACEMENT_PREVIEW_OPTIONS}
          value={navigation.caseOverlayMenuSide ?? 'right'}
          onChange={(caseOverlayMenuSide) => onChange({ caseOverlayMenuSide })}
          columns={2}
        />
      </div>

      <div className="pf-gs-section space-y-3">
        <GlobalPreviewCardGrid
          label={t('Menu button')}
          options={NAV_MENU_BUTTON_PREVIEW_OPTIONS}
          value={menuTrigger}
          onChange={(caseOverlayMenuTrigger) => onChange({ caseOverlayMenuTrigger })}
          columns={2}
        />

        {menuTrigger === 'icon' ? (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--pf-palette-texte-muted)]">{t('Menu icon')}</p>
            <div className="flex flex-wrap gap-2">
              {PORTFOLIO_NAV_MENU_CONTROL_ICON_OPTIONS.map((option) => {
                const active = (navigation.menuControlIcon ?? 'menu') === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    title={t(option.description)}
                    onClick={() => onChange({ menuControlIcon: option.value })}
                    className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                      active
                        ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-palette-texte-fort)] text-[color:var(--pf-palette-fond)]'
                        : 'border-[color:var(--pf-palette-bordure)] bg-transparent text-[color:var(--pf-palette-texte-muted)] hover:border-[color:var(--pf-palette-texte-muted)]'
                    }`}
                  >
                    {t(option.label)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="pf-gs-section space-y-3">
        <ToggleRow
          label={t('Display word below links')}
          checked={showHeroWord}
          onChange={(next) => onChange({ dutenPanelShowHeroWord: next })}
        />
        {showHeroWord ? (
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--pf-palette-texte-muted)]">
                {t('Displayed text')}
              </span>
              <GlobalInfoTooltip text={t('Shown very large, up to 32 characters.')} />
            </span>
            <input
              type="text"
              value={navigation.dutenPanelHeroWord ?? ''}
              onChange={(event) =>
                onChange({ dutenPanelHeroWord: event.target.value.slice(0, 32) })
              }
              placeholder="VSIUX"
              maxLength={32}
              className="np-input"
            />
          </label>
        ) : null}
      </div>

      <div className="pf-gs-section space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--pf-palette-texte-muted)]">
          {t('Open panel footer')}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={chipClass(showContact)}
            onClick={() => onChange({ dutenPanelShowContact: !showContact })}
          >
            {t('Contact')}
          </button>
          <button
            type="button"
            className={chipClass(showSocial)}
            onClick={() => onChange({ dutenPanelShowSocial: !showSocial })}
          >
            {t('Social links')}
          </button>
        </div>
        {showSocial ? (
          <NavTriZoneSocialLinkPicker
            options={options}
            selectedIds={navigation.dutenPanelSocialLinkIds ?? []}
            onChange={(dutenPanelSocialLinkIds) => onChange({ dutenPanelSocialLinkIds })}
            maxLinks={5}
          />
        ) : null}
      </div>

      <div className="pf-gs-section">
        <ToggleRow
          label={t('Light/dark toggle in panel')}
          checked={showColorModeToggleInNav}
          onChange={(next) => onGlobalChange?.({ showColorModeToggleInNav: next })}
        />
      </div>
    </div>
  );
}

function NavHalfPanelEditor({
  navigation,
  options,
  onChange,
  showColorModeToggleInNav = false,
  onGlobalChange,
}: {
  navigation: PortfolioNavSettings;
  options: PortfolioNavChromeLink[];
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
  showColorModeToggleInNav?: boolean;
  onGlobalChange?: (patch: PortfolioGlobalSettingsPatch) => void;
}) {
  const t = useT();
  const menuTrigger = navigation.caseOverlayMenuTrigger ?? 'text';
  const showContact = navigation.dutenPanelShowContact ?? false;
  const showSocial = navigation.dutenPanelShowSocial ?? false;

  const chipClass = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
      active
        ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-palette-texte-fort)] text-[color:var(--pf-palette-fond)]'
        : 'border-[color:var(--pf-palette-bordure)] bg-transparent text-[color:var(--pf-palette-texte-muted)] hover:border-[color:var(--pf-palette-texte-muted)]'
    }`;

  return (
    <div className="np-editor">
      <div className="space-y-4">
        <PortfolioBackgroundImageUpload
          label={t('Logo')}
          url={navigation.customExtraLogoUrl ?? ''}
          onChange={(customExtraLogoUrl) => onChange({ customExtraLogoUrl })}
          helperText={t('PNG or SVG, transparent background preferred.')}
        />
        <NpRangeField
          label={t('Logo size')}
          value={navigation.customExtraLogoSizePx ?? 32}
          min={18}
          max={56}
          unit={t('px')}
          onChange={(next) =>
            onChange({ customExtraLogoSizePx: clampPortfolioNavCustomExtraLogoSizePx(next, 32) })
          }
        />
      </div>

      <div className="pf-gs-section">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--pf-palette-texte-muted)]">
            {t('Title above the links')}
          </span>
          <input
            type="text"
            value={navigation.halfPanelDiscoverLabel ?? 'Discover Pages'}
            onChange={(event) => onChange({ halfPanelDiscoverLabel: event.target.value })}
            placeholder={t('Discover Pages')}
            className="np-input mt-2"
          />
        </label>
      </div>

      <div className="pf-gs-section">
        <GlobalPreviewCardGrid
          label={t('Link columns')}
          options={NAV_LINK_COLUMNS_PREVIEW_OPTIONS}
          value={String(navigation.dutenPanelColumns ?? 2)}
          onChange={(value) => onChange({ dutenPanelColumns: value === '1' ? 1 : 2 })}
          columns={2}
        />
      </div>

      <div className="pf-gs-section">
        <GlobalPreviewCardGrid
          label={t('Menu / logo placement')}
          options={NAV_MENU_LOGO_PLACEMENT_PREVIEW_OPTIONS}
          value={navigation.caseOverlayMenuSide ?? 'right'}
          onChange={(caseOverlayMenuSide) => onChange({ caseOverlayMenuSide })}
          columns={2}
        />
      </div>

      <div className="pf-gs-section space-y-3">
        <GlobalPreviewCardGrid
          label={t('Menu button')}
          options={NAV_MENU_BUTTON_PREVIEW_OPTIONS}
          value={menuTrigger}
          onChange={(caseOverlayMenuTrigger) => onChange({ caseOverlayMenuTrigger })}
          columns={2}
        />

        {menuTrigger === 'icon' ? (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--pf-palette-texte-muted)]">{t('Menu icon')}</p>
            <div className="flex flex-wrap gap-2">
              {PORTFOLIO_NAV_MENU_CONTROL_ICON_OPTIONS.map((option) => {
                const active = (navigation.menuControlIcon ?? 'menu') === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    title={t(option.description)}
                    onClick={() => onChange({ menuControlIcon: option.value })}
                    className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                      active
                        ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-palette-texte-fort)] text-[color:var(--pf-palette-fond)]'
                        : 'border-[color:var(--pf-palette-bordure)] bg-transparent text-[color:var(--pf-palette-texte-muted)] hover:border-[color:var(--pf-palette-texte-muted)]'
                    }`}
                  >
                    {t(option.label)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="pf-gs-section space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--pf-palette-texte-muted)]">
          {t('Open panel footer')}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={chipClass(showContact)}
            onClick={() => onChange({ dutenPanelShowContact: !showContact })}
          >
            {t('Contact')}
          </button>
          <button
            type="button"
            className={chipClass(showSocial)}
            onClick={() => onChange({ dutenPanelShowSocial: !showSocial })}
          >
            {t('Social links')}
          </button>
        </div>
        {showSocial ? (
          <NavTriZoneSocialLinkPicker
            options={options}
            selectedIds={navigation.dutenPanelSocialLinkIds ?? []}
            onChange={(dutenPanelSocialLinkIds) => onChange({ dutenPanelSocialLinkIds })}
            maxLinks={5}
          />
        ) : null}
      </div>

      <div className="pf-gs-section">
        <ToggleRow
          label={t('Light/dark toggle in panel')}
          checked={showColorModeToggleInNav}
          onChange={(next) => onGlobalChange?.({ showColorModeToggleInNav: next })}
        />
      </div>
    </div>
  );
}

function NavFloatingPillVisibilityToggles({
  navigation,
  onChange,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  const t = useT();
  const showLogo = navigation.floatingPillShowLogo ?? false;
  const showContact = navigation.floatingPillShowContact ?? true;

  const chipClass = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
      active
        ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-palette-texte-fort)] text-[color:var(--pf-palette-fond)]'
        : 'border-[color:var(--pf-palette-bordure)] bg-transparent text-[color:var(--pf-palette-texte-muted)] hover:border-[color:var(--pf-palette-texte-muted)]'
    }`;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--pf-palette-texte-muted)]">
          {t('Show in pill')}
        </p>
        <GlobalInfoTooltip text={t('Logo is hidden by default — enable logo and/or contact.')} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={chipClass(showLogo)}
          onClick={() =>
            onChange({
              floatingPillShowLogo: !showLogo,
              customExtraEnabled: !showLogo ? true : navigation.customExtraEnabled,
            })
          }
        >
          {t('Logo')}
        </button>
        <button
          type="button"
          className={chipClass(showContact)}
          onClick={() =>
            onChange({
              floatingPillShowContact: !showContact,
              contactButtonEnabled: !showContact ? true : navigation.contactButtonEnabled,
            })
          }
        >
          {t('Contact')}
        </button>
      </div>
    </div>
  );
}

function NavFloatingPillMenuEditor({
  navigation,
  onChange,
  showColorModeToggleInNav = false,
  onGlobalChange,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
  showColorModeToggleInNav?: boolean;
  onGlobalChange?: (patch: PortfolioGlobalSettingsPatch) => void;
}) {
  const t = useT();
  const menuMode = normalizePortfolioNavFloatingPillMenuMode(navigation.contentMode);

  return (
    <div className="np-editor">
      <NpSegmentedControl
        label={t('Menu style')}
        options={PORTFOLIO_NAV_FLOATING_PILL_MENU_MODE_OPTIONS.map((option) => ({
          value: option.value,
          label: t(option.label),
          title: t(option.description),
        }))}
        value={menuMode}
        onChange={(contentMode) => onChange({ contentMode })}
      />
      <NavFloatingPillVisibilityToggles navigation={navigation} onChange={onChange} />
      <ToggleRow
        label={t('Light/dark toggle in pill')}
        checked={showColorModeToggleInNav}
        onChange={(next) => onGlobalChange?.({ showColorModeToggleInNav: next })}
      />
    </div>
  );
}

function NavEditorialBarSlotEditor({
  navigation,
  options,
  onChange,
}: {
  navigation: PortfolioNavSettings;
  options: PortfolioNavChromeLink[];
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  return (
    <NavEditorialBarSocialElementsEditor navigation={navigation} options={options} onChange={onChange} />
  );
}

/** Small, bold, uppercase, muted label — the "Label on top" half of the Social nav
 *  panel's vertical field pattern (label above, control filling the width below). */
function NavStackedLabel({ children }: { children: ReactNode }) {
  return <p className="np-field-label !mb-0">{children}</p>;
}

/** Bandeau toggle — title + helper copy on the left, switch on the right, inside a
 *  filled rounded panel. Used for the single "Show X" master switch of each
 *  Social nav tab (Social links / Phone / Email). */
function NavToggleBand({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return <NpToggleRow card title={title} description={description} checked={checked} onChange={onChange} />;
}

/** Full-width, label-on-top segmented control — the "value below label" half of the
 *  Social nav panel's vertical field pattern. `sizePx` lets an ordered scale (Icon
 *  size) render each option's own text at that size, so the row previews itself. */
function NavStackedSegment<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; description?: string; sizePx?: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const t = useT();
  return (
    <NpSegmentedControl
      label={label}
      options={options.map((option) => ({
        value: option.value,
        label: t(option.label),
        title: option.description ? t(option.description) : undefined,
        sizePx: option.sizePx,
      }))}
      value={value}
      onChange={onChange}
    />
  );
}

const NAV_ELEMENT_TAB_OPTIONS: { value: 'social' | 'phone' | 'mail'; label: string }[] = [
  { value: 'social', label: msg('Social links') },
  { value: 'phone', label: msg('Phone') },
  { value: 'mail', label: msg('Email') },
];

/** Top-level single-select switch for the Social nav panel — picking a tab swaps the
 *  settings shown below it, independently from whether that element is actually
 *  turned on in the live bar (that is each tab's own "Show X" toggle band). */
function NavElementTabs({
  value,
  onChange,
}: {
  value: 'social' | 'phone' | 'mail';
  onChange: (value: 'social' | 'phone' | 'mail') => void;
}) {
  const t = useT();
  return (
    <NpSegmentedControl
      label={t('Navigation element')}
      options={NAV_ELEMENT_TAB_OPTIONS.map((option) => ({ value: option.value, label: t(option.label) }))}
      value={value}
      onChange={onChange}
    />
  );
}

/** "Links shown" — same up-to-`maxLinks` toggle selection as NavTriZoneSocialLinkPicker,
 *  restyled as a 2-column pill grid (icon + domain) to match the Social nav layout. */
function NavSocialLinksShownGrid({
  options,
  selectedIds,
  onChange,
  maxLinks = 3,
}: {
  options: PortfolioNavChromeLink[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxLinks?: number;
}) {
  const t = useT();
  if (options.length === 0) {
    return (
      <p className="np-note">
        {t('No links found — add some in Creator Studio > Links first.')}
      </p>
    );
  }

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((value) => value !== id));
      return;
    }
    if (selectedIds.length >= maxLinks) return;
    onChange([...selectedIds, id]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <NavStackedLabel>{t('Links shown')}</NavStackedLabel>
        <GlobalInfoTooltip text={t('Up to {maxLinks} — leave empty to auto-pick the first available.', { maxLinks })} />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1 py-1">
        {options.map((link) => {
          const selected = selectedIds.includes(link.id);
          const disabled = !selected && selectedIds.length >= maxLinks;
          return (
            <button
              key={link.id}
              type="button"
              title={t(link.label)}
              aria-label={t(link.label)}
              aria-pressed={selected}
              onClick={() => toggle(link.id)}
              disabled={disabled}
              className={`group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-150 ${
                disabled ? 'cursor-not-allowed' : 'hover:bg-[color:var(--pf-surface)]'
              }`}
            >
              <span
                className={`inline-flex transition-opacity duration-150 ${
                  selected ? 'opacity-100' : disabled ? 'opacity-25' : 'opacity-45 group-hover:opacity-90'
                }`}
              >
                <LinkBrandIcon url={link.href} platform={link.platform} iconUrl={link.iconUrl} size="sm" />
              </span>
              {selected ? (
                <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[color:var(--pf-palette-texte-fort)] ring-2 ring-[color:var(--pf-palette-fond)]">
                  <svg viewBox="0 0 10 10" width="6" height="6" fill="none" aria-hidden>
                    <path
                      d="M1.5 5.2l2.2 2.2L8.5 2.5"
                      stroke="var(--pf-palette-fond)"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {selectedIds.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-[13px] text-[color:var(--pf-palette-texte-muted)] underline-offset-2 hover:text-[color:var(--pf-palette-texte-fort)] hover:underline"
        >
          {t('Reset (automatic display)')}
        </button>
      ) : null}
    </div>
  );
}

/** Two vertical bars whose gap grows with the spacing step — a graphical stand-in for
 *  "Tight / Normal / Wide / Extra wide" so the option reads visually before its label does. */
function NavSpacingGlyph({ gapPx }: { gapPx: number }) {
  const barWidth = 2.5;
  const barHeight = 13;
  const totalWidth = barWidth * 2 + gapPx;
  return (
    <svg
      width={totalWidth}
      height={barHeight}
      viewBox={`0 0 ${totalWidth} ${barHeight}`}
      fill="none"
      aria-hidden
    >
      <rect x={0} y={0} width={barWidth} height={barHeight} rx={1.25} fill="currentColor" />
      <rect x={barWidth + gapPx} y={0} width={barWidth} height={barHeight} rx={1.25} fill="currentColor" />
    </svg>
  );
}

const NAV_SPACING_GLYPH_GAP_PX: Record<(typeof PORTFOLIO_NAV_TRI_ZONE_SOCIAL_LINK_GAP_OPTIONS)[number]['value'], number> = {
  sm: 3,
  md: 7,
  lg: 12,
  xl: 18,
};

/** Connected-pill segmented control for Icon spacing — one rounded-full track where
 *  each stop is a graphical "bar gap" glyph instead of flat text, so the amount of
 *  spacing reads visually before the caption underneath confirms it. */
function NavSpacingPillControl({
  value,
  onChange,
}: {
  value: (typeof PORTFOLIO_NAV_TRI_ZONE_SOCIAL_LINK_GAP_OPTIONS)[number]['value'];
  onChange: (value: (typeof PORTFOLIO_NAV_TRI_ZONE_SOCIAL_LINK_GAP_OPTIONS)[number]['value']) => void;
}) {
  const t = useT();
  return (
    <div className="np-field">
      <p className="np-field-label">{t('Icon spacing')}</p>
      <div
        role="radiogroup"
        aria-label={t('Icon spacing')}
        className="np-seg"
        style={{ gridTemplateColumns: `repeat(${PORTFOLIO_NAV_TRI_ZONE_SOCIAL_LINK_GAP_OPTIONS.length}, minmax(0, 1fr))` }}
      >
        {PORTFOLIO_NAV_TRI_ZONE_SOCIAL_LINK_GAP_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className="np-seg-btn np-seg-btn--stacked"
            >
              <span className="relative">
                <NavSpacingGlyph gapPx={NAV_SPACING_GLYPH_GAP_PX[option.value]} />
              </span>
              <span className="relative text-[11px] leading-none">{t(option.label)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Which nav layout the shared Social/Phone/Email panel is driving — Editorial bar and
 *  Social nav render the exact same panel, differing only in which "show in bar"
 *  fields they read/write (link selection, size, spacing, and contact profiles are
 *  already stored under the same shared keys for both designs). */
/** "Social links" tab of the Editorial bar Social/Phone/Email panel — master toggle,
 *  then (label-on-top, full-width control) Links shown / Icon size / Icon spacing,
 *  with black & white tucked into Advanced options since it is a secondary,
 *  rarely-touched switch. */
function NavElementSocialTabPanel({
  navigation,
  options,
  onChange,
}: {
  navigation: PortfolioNavSettings;
  options: PortfolioNavChromeLink[];
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  const t = useT();
  const showSocial = navigation.editorialBarShowSocial;
  const monochrome = navigation.triZoneSocialLinkMonochrome ?? false;

  return (
    <div className="space-y-6">
      <NavToggleBand
        title={t('Show Social Links')}
        description={t('Display icons in the navigation bar.')}
        checked={showSocial}
        onChange={(next) =>
          onChange({
            editorialBarShowSocial: next,
            linkIconsEnabled: next ? true : navigation.linkIconsEnabled,
          })
        }
      />
      {showSocial ? (
        <>
          <NavSocialLinksShownGrid
            options={options}
            selectedIds={navigation.triZoneSocialLinkIds ?? []}
            onChange={(triZoneSocialLinkIds) => onChange({ triZoneSocialLinkIds })}
          />
          <NavStackedSegment
            label={t('Icon size')}
            options={PORTFOLIO_NAV_TRI_ZONE_SOCIAL_LINK_SIZE_OPTIONS}
            value={navigation.triZoneSocialLinkSize ?? 'sm'}
            onChange={(triZoneSocialLinkSize) => onChange({ triZoneSocialLinkSize })}
          />
          <NavSpacingPillControl
            value={navigation.triZoneSocialLinkGap ?? 'md'}
            onChange={(triZoneSocialLinkGap) => onChange({ triZoneSocialLinkGap })}
          />
          <NavAdvancedOptionsDisclosure>
            <div className="py-5 first:pt-0 last:pb-0">
              <GlobalSwitchRow
                label={t('Black & white icons')}
                description={t('Ignore each platform\'s brand color and render icons in monochrome.')}
                checked={monochrome}
                onChange={(triZoneSocialLinkMonochrome) => onChange({ triZoneSocialLinkMonochrome })}
              />
            </div>
          </NavAdvancedOptionsDisclosure>
        </>
      ) : null}
    </div>
  );
}

/** Phone / Email tab of the Editorial bar Social/Phone/Email panel — master toggle,
 *  Label, Display style, and an icon grid, with Icon position and Button frame
 *  tucked into Advanced options. */
function NavElementContactTabPanel({
  channel,
  navigation,
  onChange,
}: {
  channel: 'phone' | 'mail';
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  const t = useT();
  const showChannel = channel === 'phone' ? navigation.editorialBarShowPhone : navigation.editorialBarShowMail;
  const profile = mergeEditorialBarContactChannelSettings(
    channel === 'phone' ? navigation.editorialBarPhoneContact : navigation.editorialBarMailContact,
    undefined,
    channel === 'phone' ? DEFAULT_EDITORIAL_BAR_PHONE_CONTACT : DEFAULT_EDITORIAL_BAR_MAIL_CONTACT
  );
  const iconOptions = portfolioNavContactCtaIconOptionsForEditorialChannel(channel);
  const iconPosition = profile.iconPosition;

  const patchProfile = (patch: Partial<PortfolioNavEditorialBarContactChannelSettings>) =>
    channel === 'phone'
      ? onChange({ editorialBarPhoneContact: { ...profile, ...patch } })
      : onChange({ editorialBarMailContact: { ...profile, ...patch } });

  return (
    <div className="space-y-6">
      <NavToggleBand
        title={channel === 'phone' ? t('Show Phone Button') : t('Show Email Button')}
        description={
          channel === 'phone'
            ? t('Display a call button in the navigation bar.')
            : t('Display an email button in the navigation bar.')
        }
        checked={showChannel}
        onChange={(next) => {
          const contactButtonEnabled = next ? true : navigation.contactButtonEnabled;
          onChange(
            channel === 'phone'
              ? { editorialBarShowPhone: next, contactButtonEnabled }
              : { editorialBarShowMail: next, contactButtonEnabled }
          );
        }}
      />
      {showChannel ? (
        <>
          <div>
            <NavStackedLabel>{t('Label')}</NavStackedLabel>
            <input
              type="text"
              value={profile.label}
              maxLength={32}
              onChange={(event) => patchProfile({ label: event.target.value.slice(0, 32) })}
              className="np-input mt-2"
            />
          </div>

          <NavStackedSegment
            label={t('Display style')}
            options={NAV_CONTACT_BUTTON_DISPLAY_OPTIONS}
            value={profile.display}
            onChange={(display) => patchProfile({ display })}
          />

          {profile.display === 'icon' || (profile.display === 'button' && iconPosition !== 'none') ? (
            <div className="space-y-2">
              <NavStackedLabel>{t('Select icon')}</NavStackedLabel>
              <div className="flex flex-wrap gap-1.5">
                {iconOptions.map((option) => {
                  const active = profile.icon === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      title={t(option.description)}
                      onClick={() => patchProfile({ icon: option.value as PortfolioNavContactCtaIcon })}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
                        active ? 'bg-[color:var(--pf-palette-texte-fort)] text-[color:var(--pf-palette-fond)]' : 'bg-[color:var(--pf-surface)] text-[color:var(--pf-palette-texte-muted)] hover:bg-[color:var(--pf-surface)]'
                      }`}
                    >
                      <PortfolioNavContactCtaGlyph variant={option.value} className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <NavAdvancedOptionsDisclosure>
            {profile.display === 'button' ? (
              <div className="py-5 first:pt-0 last:pb-0">
                <NavStackedSegment
                  label={t('Icon position')}
                  options={PORTFOLIO_NAV_CONTACT_BUTTON_ICON_POSITION_OPTIONS}
                  value={iconPosition}
                  onChange={(nextIconPosition) => patchProfile({ iconPosition: nextIconPosition })}
                />
              </div>
            ) : null}
            <div className="py-5 first:pt-0 last:pb-0">
              <NavContactButtonShapeGrid value={profile.shape} onChange={(shape) => patchProfile({ shape })} />
            </div>
          </NavAdvancedOptionsDisclosure>
        </>
      ) : null}
    </div>
  );
}

/** Editorial bar's Social links / Phone / Email settings panel. */
function NavEditorialBarSocialElementsEditor({
  navigation,
  options,
  onChange,
}: {
  navigation: PortfolioNavSettings;
  options: PortfolioNavChromeLink[];
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  const [activeElement, setActiveElement] = useState<'social' | 'phone' | 'mail'>('social');

  return (
    <div className="np-editor">
      <NavElementTabs value={activeElement} onChange={setActiveElement} />

      <div className="np-editor">
        {activeElement === 'social' ? (
          <NavElementSocialTabPanel navigation={navigation} options={options} onChange={onChange} />
        ) : (
          <NavElementContactTabPanel channel={activeElement} navigation={navigation} onChange={onChange} />
        )}
      </div>
    </div>
  );
}

function NavSplitLogoSectionEditor({
  navigation,
  onChange,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  const t = useT();
  const leftKeys = navigation.splitNavLeftSectionKeys ?? [];
  const autoSplit = leftKeys.length === 0;

  const modeButtonClass = (active: boolean) =>
    `rounded-full border px-2.5 py-1 text-[13px] font-medium transition ${
      active
        ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-palette-texte-fort)] text-[color:var(--pf-palette-fond)]'
        : 'border-[color:var(--pf-palette-bordure)] bg-transparent text-[color:var(--pf-palette-texte-muted)] hover:border-[color:var(--pf-palette-texte-muted)]'
    }`;

  const setSide = (sectionKey: PortfolioNavSectionKey, side: 'left' | 'right') => {
    if (autoSplit) {
      if (side === 'left') {
        onChange({ splitNavLeftSectionKeys: [sectionKey] });
        return;
      }
      const allLeft = PORTFOLIO_NAV_SECTION_META.map((section) => section.key).filter(
        (key) => key !== sectionKey
      );
      onChange({ splitNavLeftSectionKeys: allLeft });
      return;
    }

    const next = new Set(leftKeys);
    if (side === 'left') next.add(sectionKey);
    else next.delete(sectionKey);
    onChange({ splitNavLeftSectionKeys: Array.from(next) });
  };

  return (
    <div className="np-editor">
      <div className="flex items-center gap-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--pf-palette-texte-muted)]">
          {t('Left / right split')}
        </p>
        <GlobalInfoTooltip text={t('Auto splits 50/50 by section order.')} />
      </div>

      {autoSplit ? (
        <p className="np-note">
          {t('Automatic split active.')}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => onChange({ splitNavLeftSectionKeys: [] })}
          className="text-[13px] text-[color:var(--pf-palette-texte-muted)] underline-offset-2 hover:text-[color:var(--pf-palette-texte-fort)] hover:underline"
        >
          {t('Reset (automatic split)')}
        </button>
      )}

      <div className="space-y-2">
        {PORTFOLIO_NAV_SECTION_META.map((section) => {
          const label = navigation.itemLabels[section.key] || section.title;
          const onLeft = leftKeys.includes(section.key);
          return (
            <div
              key={section.key}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3 py-2"
            >
              <span className="text-sm font-medium text-[color:var(--pf-palette-texte-fort)]">{label}</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className={modeButtonClass(!autoSplit && onLeft)}
                  onClick={() => setSide(section.key, 'left')}
                >
                  {t('Left')}
                </button>
                <button
                  type="button"
                  className={modeButtonClass(!autoSplit && !onLeft)}
                  onClick={() => setSide(section.key, 'right')}
                >
                  {t('Right')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Same collapsed-preview / expand-to-grid mechanism as Hero > Design Banner and
 *  Stack > Design/Header design: shows only the active layout, "Change" reveals the grid. */
function NavLayoutDesignGrid({
  value,
  navigation,
  onChange,
  expanded,
  onExpandedChange,
}: {
  value: PortfolioNavLayoutDesign;
  navigation: PortfolioNavSettings;
  onChange: (design: PortfolioNavLayoutDesign) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}) {
  const t = useT();
  const previewSource = usePortfolioDesignPreviewSource();
  const palette = mergeNavPalette(DEFAULT_NAV_PALETTE, navigation.navPalette);
  const accent = resolveHeroPaletteColor(palette, 'principal');
  const strongText = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  // 'classic' predates this picker and is no longer offered as a card, but existing
  // portfolios can still be on it — label it accurately instead of misreporting the
  // first listed card.
  const selectedLabel =
    PORTFOLIO_NAV_LAYOUT_DESIGN_OPTIONS.find((option) => option.value === value)?.label ??
    (value === 'classic' ? t('Classic') : PORTFOLIO_NAV_LAYOUT_DESIGN_OPTIONS[0].label);
  const pick = (design: PortfolioNavLayoutDesign) => {
    onChange(design);
    onExpandedChange(false);
  };

  if (expanded) {
    return (
      <div>
        <NpBackRow title={t('Layout')} onBack={() => onExpandedChange(false)} />
        {previewSource ? (
          /* In the studio: every nav layout rendered for real, one per row. */
          <div className="flex flex-col gap-4">
            {PORTFOLIO_NAV_LAYOUT_DESIGN_OPTIONS.map((option) => (
              <PortfolioDesignLivePreviewCard
                key={option.value}
                cardClassName="pf-stack-design-card"
                labelClassName="pf-stack-card-label"
                active={option.value === value}
                label={t(option.label)}
                src={withDesignPreview(previewSource.portfolioPath, { section: 'navigation', design: option.value })}
                settings={previewSource.settings}
                onClick={() => pick(option.value)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {PORTFOLIO_NAV_LAYOUT_DESIGN_OPTIONS.map((option) => (
              <NpOptionCard
                key={option.value}
                selected={option.value === value}
                title={t(option.label)}
                illustration={
                  <span className="np-illus items-center justify-center overflow-hidden">
                    <span className="flex w-64 shrink-0 origin-center scale-[0.5] items-center justify-center">
                      <NavLayoutDesignPreview design={option.value} accent={accent} strongText={strongText} muted={muted} />
                    </span>
                  </span>
                }
                onClick={() => pick(option.value)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NpPickerRow
      label={t('Layout')}
      value={t(selectedLabel)}
      onClick={() => onExpandedChange(true)}
      thumbnail={
        <span className="flex w-64 shrink-0 origin-center scale-[0.46] items-center justify-center">
          <NavLayoutDesignPreview design={value} accent={accent} strongText={strongText} muted={muted} />
        </span>
      }
    />
  );
}

type NavSettingsTab = 'general' | 'design' | 'labels';

const NAV_SETTINGS_TABS: { id: NavSettingsTab; label: string }[] = [
  { id: 'general', label: msg('General') },
  { id: 'design', label: msg('Design') },
  { id: 'labels', label: msg('Labels') },
];

function NavFloatingOnlyNote() {
  const t = useT();
  return (
    <p className="np-note">
      {t('These options apply to the floating nav bar (Default navigation type). Switch the navigation type in General to use them.')}
    </p>
  );
}

/**
 * Dropdown menus: a named entry in the bar that opens on two or more sections. Each group is a
 * small card — its name, the sections as pills (a section already in another group is greyed),
 * and a quiet remove. Rarely needed, so it comes after the item names.
 */
function NavMenuGroupsEditor({
  groups,
  itemLabels,
  onChange,
}: {
  groups: PortfolioNavMenuGroup[];
  itemLabels: PortfolioNavItemLabels;
  onChange: (groups: PortfolioNavMenuGroup[]) => void;
}) {
  const t = useT();
  const assignedElsewhere = (groupId: string, sectionKey: PortfolioNavSectionKey) =>
    groups.some((group) => group.id !== groupId && group.sectionKeys.includes(sectionKey));

  const toggleSection = (groupId: string, sectionKey: PortfolioNavSectionKey) => {
    onChange(
      groups.map((group) => {
        if (group.id !== groupId) {
          return { ...group, sectionKeys: group.sectionKeys.filter((key) => key !== sectionKey) };
        }
        const has = group.sectionKeys.includes(sectionKey);
        return {
          ...group,
          sectionKeys: has ? group.sectionKeys.filter((key) => key !== sectionKey) : [...group.sectionKeys, sectionKey],
        };
      })
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="np-subtle">{t('Gather several sections under one menu entry that opens on click.')}</p>

      {groups.map((group) => (
        <div key={group.id} className="np-group-card">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={group.label}
              maxLength={48}
              aria-label={t('Menu label')}
              onChange={(event) =>
                onChange(groups.map((entry) => (entry.id === group.id ? { ...entry, label: event.target.value } : entry)))
              }
              placeholder={t('e.g. Portfolio, Resources…')}
              className="np-input"
            />
            <button
              type="button"
              onClick={() => onChange(groups.filter((entry) => entry.id !== group.id))}
              aria-label={t('Remove')}
              title={t('Remove')}
              className="np-icon-btn"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2l1-12M9 7V4.5h6V7" />
              </svg>
            </button>
          </div>

          <div className="np-chips">
            {PORTFOLIO_NAV_SECTION_META.map((section) => {
              const selected = group.sectionKeys.includes(section.key);
              const disabled = !selected && assignedElsewhere(group.id, section.key);
              return (
                <button
                  key={section.key}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  title={disabled ? t('Already in another menu') : undefined}
                  onClick={() => toggleSection(group.id, section.key)}
                  className="np-chip"
                >
                  {itemLabels[section.key]?.trim() || t(section.title)}
                </button>
              );
            })}
          </div>
          {group.sectionKeys.length < 2 ? (
            <p className="np-help !mt-0">{t('Select at least 2 sections to enable this dropdown.')}</p>
          ) : null}
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...groups, { id: crypto.randomUUID(), label: t('Menu'), sectionKeys: [] }])}
        disabled={groups.length >= 8}
        className="np-add-btn"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
        {t('Add a dropdown menu')}
      </button>
    </div>
  );
}

/** Shown on a tab whose settings only matter while the navigation is on — with the way back. */
function NavDisabledNotice({ onEnable }: { onEnable: () => void }) {
  const t = useT();
  return (
    <div className="np-toggle-card flex-col !gap-0 !py-6 text-center">
      <p className="np-card-title">{t('The navigation is hidden')}</p>
      <p className="np-subtle mt-1">{t('Turn it on to choose its design and menu.')}</p>
      <button type="button" onClick={onEnable} className="np-primary-btn mt-5">

        {t('Show navigation')}
      </button>
    </div>
  );
}

/** The General tab's settings: what "Reset" restores and what the header's status compares. */
const NAV_GENERAL_KEYS = [
  'enabled',
  'navMode',
  'displayMode',
  'presence',
  'hideWhenSingle',
  'labelFontSize',
  'itemGap',
  'mobileLayout',
  'mobileDrawerSide',
  'mobileBrand',
  'mobileBrandWord',
] as const satisfies readonly (keyof PortfolioNavSettings)[];

type NavGeneralSettings = Pick<PortfolioNavSettings, (typeof NAV_GENERAL_KEYS)[number]>;

let navGeneralDefaultsCache: NavGeneralSettings | null = null;

function navGeneralDefaults(): NavGeneralSettings {
  if (!navGeneralDefaultsCache) {
    const navigation = createDefaultPortfolioSettings().navigation;
    navGeneralDefaultsCache = Object.fromEntries(
      NAV_GENERAL_KEYS.map((key) => [key, navigation[key]])
    ) as NavGeneralSettings;
  }
  return navGeneralDefaultsCache;
}

/** Rendered sizes (portfolioNavLabelFontSizeClass / portfolioNavItemGapClass) shown on the sliders. */
const NAV_LABEL_FONT_PX: Record<PortfolioNavSettings['labelFontSize'], number> = { xs: 12, sm: 13, md: 15, lg: 16 };
const NAV_ITEM_GAP_PX: Partial<Record<PortfolioNavSettings['itemGap'], number>> = { sm: 6, md: 12, lg: 24, xl: 40 };

/** Short segment labels: one line in a 400px panel. */
const NAV_DISPLAY_LABELS: Record<PortfolioNavSettings['displayMode'], string> = {
  always: msg('Always'),
  'on-scroll': msg('On scroll'),
  'after-hero': msg('After hero'),
};

/**
 * Navigation settings, split by the question each tab answers:
 *  - General: is there a navigation, which kind, when does it show, how it behaves on phones.
 *  - Design: what it looks like — layout, the bar itself, the menu's text and active state.
 *  - Labels: what the menu says — each item's name and icon first, dropdown groups after.
 * Settings that cannot apply (a mode without the floating bar) are not shown; with the navigation
 * off, General stays visible but dimmed and inert. `chrome` gives the panel its own header and
 * footer (the studio dock); without it the host frames the tabs.
 */
function NavigationPanel({
  navigation,
  onChange,
  navSocialLinkOptions = [],
  showColorModeToggleInNav = false,
  onGlobalChange,
  chrome,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
  navSocialLinkOptions?: PortfolioNavChromeLink[];
  showColorModeToggleInNav?: boolean;
  onGlobalChange?: (patch: PortfolioGlobalSettingsPatch) => void;
  chrome?: NpPanelChrome;
}) {
  const t = useT();
  const [navTab, setNavTab] = useState<NavSettingsTab>('general');
  const [layoutGridOpen, setLayoutGridOpen] = useState(false);
  const navMode = navigation.navMode ?? 'default';
  const usesFloatingNavChrome = navMode === 'default' || navMode === 'pages';
  /** Menu-panel layouts (fullscreen / docked / side panel) have their own type scale, presence
   *  and phone menu — the bar-only settings below don't apply to them. */
  const usesMenuPanelLayout = ['case-overlay', 'duten-panel', 'half-panel-left'].includes(
    navigation.navLayoutDesign ?? 'classic'
  );
  /** Layouts whose links sit side by side in the bar. */
  const navLinksSitInBar = usesFloatingNavChrome && !usesMenuPanelLayout;
  const enable = () => onChange({ enabled: true });

  const defaults = navGeneralDefaults();
  const modified = NAV_GENERAL_KEYS.some((key) => (navigation[key] ?? defaults[key]) !== defaults[key]);
  const displayMode = navigation.displayMode ?? 'always';
  const visibility = resolvePortfolioNavVisibilityMode(navigation.presence);
  const labelFontSize = navigation.labelFontSize ?? 'sm';
  const mobileLayout = navigation.mobileLayout ?? 'brand-bar';
  const mobileBrand = navigation.mobileBrand ?? 'none';
  const activeIndicator = PORTFOLIO_NAV_ACTIVE_INDICATOR_OPTIONS.some((option) => option.value === navigation.activeStyle)
    ? navigation.activeStyle
    : PORTFOLIO_NAV_ACTIVE_INDICATOR_OPTIONS[0].value;

  const selectLayoutDesign = (design: PortfolioNavLayoutDesign) => {
    onChange(portfolioNavLayoutDesignPatch(design, navigation));
    if (design === 'floating-pill') {
      onGlobalChange?.({ showColorModeToggleInNav: true });
      onChange({ mobileLayout: 'brand-bar' });
    }
  };

  return (
    <NpPanelShell
      title={t('Navigation')}
      modified={modified}
      tabs={NAV_SETTINGS_TABS.map((tab) => ({ id: tab.id, label: t(tab.label) }))}
      activeTab={navTab}
      onTabChange={setNavTab}
      onReset={() => onChange({ ...defaults })}
      chrome={chrome}
    >
      {navTab === 'general' ? (
        <div className="np-stack">
          <NpToggleRow
            card
            title={t('Show navigation')}
            description={
              navigation.enabled ? t('Menu bar at the top of the site') : t('Visitors scroll the page without a menu.')
            }
            checked={navigation.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />

          <div
            className="np-dimmable"
            data-disabled={navigation.enabled ? 'false' : 'true'}
            aria-disabled={!navigation.enabled}
            inert={!navigation.enabled}
          >
            <NpCollapsibleSection title={t('Behavior')}>
              <NpOptionCardGroup label={t('Navigation type')}>
                <NpOptionCard
                  selected={navMode === 'default'}
                  title={t('Default')}
                  subtitle={t('Fixed bar at the top')}
                  illustration={<NpIllustrationTopBar />}
                  onClick={() => onChange({ navMode: 'default' })}
                />
                <NpOptionCard
                  selected={navMode === 'pages'}
                  title={t('Page')}
                  subtitle={t('One page per section')}
                  illustration={<NpIllustrationPages />}
                  onClick={() => onChange({ navMode: 'pages' })}
                />
              </NpOptionCardGroup>

              <NpSegmentedControl
                label={t('When to appear')}
                options={PORTFOLIO_NAV_DISPLAY_OPTIONS.map((option) => ({
                  value: option.value,
                  label: t(NAV_DISPLAY_LABELS[option.value]),
                }))}
                value={displayMode}
                onChange={(nextDisplayMode) => onChange({ displayMode: nextDisplayMode })}
              />

              {navLinksSitInBar ? (
                <NpSegmentedControl
                  label={t('Bar visibility')}
                  options={PORTFOLIO_NAV_VISIBILITY_MODE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: t(option.label),
                  }))}
                  value={visibility}
                  onChange={(presence) => onChange({ presence })}
                />
              ) : null}

              <NpToggleRow
                title={t('Hide when only one section')}
                checked={navigation.hideWhenSingle}
                onChange={(hideWhenSingle) => onChange({ hideWhenSingle })}
              />
            </NpCollapsibleSection>

            {navLinksSitInBar ? (
              <NpCollapsibleSection title={t('Menu links')}>
                <NpLinksPreview
                  items={[t('Home'), t('Projects'), t('Contact')]}
                  fontPx={NAV_LABEL_FONT_PX[labelFontSize]}
                  gapPx={NAV_ITEM_GAP_PX[navigation.itemGap] ?? 0}
                />
                <NpStepSlider
                  label={t('Text size')}
                  options={PORTFOLIO_NAV_LABEL_FONT_SIZE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: t(option.label),
                    px: NAV_LABEL_FONT_PX[option.value],
                  }))}
                  value={labelFontSize}
                  onChange={(nextSize) => onChange({ labelFontSize: nextSize })}
                />
                <NpStepSlider
                  label={t('Space between links')}
                  options={PORTFOLIO_NAV_ITEM_GAP_OPTIONS.map((option) => ({
                    value: option.value,
                    label: t(option.label),
                    px: NAV_ITEM_GAP_PX[option.value] ?? 0,
                  }))}
                  value={navigation.itemGap}
                  onChange={(itemGap) => onChange({ itemGap })}
                />
              </NpCollapsibleSection>
            ) : null}

            {navLinksSitInBar ? (
              <NpCollapsibleSection title={t('Mobile')}>
                <NpOptionCardGroup label={t('Mobile behavior')}>
                  <NpOptionCard
                    selected={mobileLayout === 'brand-bar'}
                    title={t('Full-width bar')}
                    subtitle={t('Logo + compact menu')}
                    illustration={<NpIllustrationPhoneBar />}
                    onClick={() => onChange({ mobileLayout: 'brand-bar' })}
                  />
                  <NpOptionCard
                    selected={mobileLayout === 'drawer'}
                    title={t('Menu drawer')}
                    subtitle={t('Side panel')}
                    illustration={<NpIllustrationPhoneDrawer />}
                    onClick={() => onChange({ mobileLayout: 'drawer' })}
                  />
                </NpOptionCardGroup>

                {mobileLayout === 'drawer' ? (
                  <>
                    <NpSegmentedControl
                      label={t('Drawer side')}
                      options={PORTFOLIO_NAV_MOBILE_DRAWER_SIDE_OPTIONS.map((option) => ({
                        value: option.value,
                        label: t(option.label),
                      }))}
                      value={navigation.mobileDrawerSide ?? 'right'}
                      onChange={(mobileDrawerSide) => onChange({ mobileDrawerSide })}
                    />
                    <NpSegmentedControl
                      label={t('Brand next to menu')}
                      options={PORTFOLIO_NAV_MOBILE_BRAND_OPTIONS.map((option) => ({
                        value: option.value,
                        label: t(option.label),
                      }))}
                      value={mobileBrand}
                      onChange={(nextBrand) => onChange({ mobileBrand: nextBrand })}
                    />
                    {mobileBrand === 'word' ? (
                      <label className="np-field block">
                        <span className="np-field-label">{t('Brand text')}</span>
                        <input
                          type="text"
                          value={navigation.mobileBrandWord ?? ''}
                          onChange={(event) => onChange({ mobileBrandWord: event.target.value })}
                          placeholder={t('First name or short name')}
                          className="np-input"
                        />
                      </label>
                    ) : null}
                  </>
                ) : null}
              </NpCollapsibleSection>
            ) : null}
          </div>
        </div>
      ) : null}

      {navTab === 'design' ? (
        navigation.enabled ? (
          layoutGridOpen && usesFloatingNavChrome ? (
            <NavLayoutDesignGrid
              value={navigation.navLayoutDesign ?? 'classic'}
              navigation={navigation}
              expanded
              onExpandedChange={setLayoutGridOpen}
              onChange={selectLayoutDesign}
            />
          ) : (
          <div className="np-stack">
            <NpCollapsibleSection title={t('Layout')}>
              {usesFloatingNavChrome ? (
                <NavLayoutDesignGrid
                  value={navigation.navLayoutDesign ?? 'classic'}
                  navigation={navigation}
                  expanded={false}
                  onExpandedChange={setLayoutGridOpen}
                  onChange={selectLayoutDesign}
                />
              ) : (
                <NavFloatingOnlyNote />
              )}
            </NpCollapsibleSection>

            <NpCollapsibleSection title={t('Bar')}>
              <NpOptionCardGroup label={t('Bar background')} columns={3}>
                {PORTFOLIO_NAV_BAR_SURFACE_PREVIEW_OPTIONS.map((option) => {
                  const selected = (navigation.navBarSurface ?? 'neutre') === option.value;
                  return (
                    <NpOptionCard
                      key={option.value}
                      compact
                      selected={selected}
                      title={t(option.label)}
                      illustration={<NpGlyph>{option.glyph(selected)}</NpGlyph>}
                      onClick={() => onChange({ navBarSurface: option.value })}
                    />
                  );
                })}
              </NpOptionCardGroup>
              <NpSegmentedControl
                label={t('Bar height')}
                options={PORTFOLIO_NAV_BAR_HEIGHT_OPTIONS.map((option) => ({ value: option.value, label: t(option.label) }))}
                value={navigation.navBarHeight ?? 'md'}
                onChange={(navBarHeight) => onChange({ navBarHeight })}
              />
              <NpSegmentedControl
                label={t('Color mode')}
                options={PORTFOLIO_SECTION_COLOR_MODE_OPTIONS.map((option) => ({ value: option.value, label: t(option.label) }))}
                value={navigation.colorModeOverride}
                onChange={(colorModeOverride) => onChange({ colorModeOverride })}
              />
              <NpToggleRow
                title={t('Light / dark toggle in bar')}
                checked={showColorModeToggleInNav}
                onChange={(next) => onGlobalChange?.({ showColorModeToggleInNav: next })}
              />
            </NpCollapsibleSection>

            <NpCollapsibleSection title={t('Menu style')}>
              <NpOptionCardGroup label={t('Active indicator')} columns={3}>
                {PORTFOLIO_NAV_ACTIVE_INDICATOR_PREVIEW_OPTIONS.map((option) => {
                  const selected = activeIndicator === option.value;
                  return (
                    <NpOptionCard
                      key={option.value}
                      compact
                      selected={selected}
                      title={t(option.label)}
                      illustration={<NpGlyph>{option.glyph(selected)}</NpGlyph>}
                      onClick={() => onChange({ activeStyle: option.value })}
                    />
                  );
                })}
              </NpOptionCardGroup>
              {navigation.navLayoutDesign === 'editorial-bar' ? (
                <NpSegmentedControl
                  label={t('Button text color')}
                  options={PORTFOLIO_NAV_EDITORIAL_BAR_BUTTON_INK_OPTIONS.map((option) => ({
                    value: option.value,
                    label: t(option.label),
                  }))}
                  value={navigation.editorialBarButtonInk ?? 'principal'}
                  onChange={(editorialBarButtonInk) => {
                    const bindings = mergeNavColorBindings(DEFAULT_NAV_COLOR_BINDINGS, navigation.navColorBindings);
                    const nextBindings = {
                      ...bindings,
                      activeAccent: editorialBarButtonInk,
                      contactText: editorialBarButtonInk,
                      contactBorder: editorialBarButtonInk,
                    };
                    onChange({
                      editorialBarButtonInk,
                      navColorBindings: nextBindings,
                      ...(navigation.useNavPalette !== false
                        ? applyNavPaletteToSettings({ ...navigation, navColorBindings: nextBindings })
                        : null),
                    });
                  }}
                />
              ) : null}
            </NpCollapsibleSection>

            {usesFloatingNavChrome && NAV_LAYOUTS_WITH_OPTIONS.has(navigation.navLayoutDesign ?? 'classic') ? (
              <NpCollapsibleSection title={t('Layout options')}>
                {navigation.navLayoutDesign === 'editorial-bar' ? (
                  <NavEditorialBarSlotEditor navigation={navigation} options={navSocialLinkOptions} onChange={onChange} />
                ) : null}
                {navigation.navLayoutDesign === 'floating-pill' ? (
                  <NavFloatingPillMenuEditor
                    navigation={navigation}
                    onChange={onChange}
                    showColorModeToggleInNav={showColorModeToggleInNav}
                    onGlobalChange={onGlobalChange}
                  />
                ) : null}
                {navigation.navLayoutDesign === 'center-logo-split' ? (
                  <NavSplitLogoSectionEditor navigation={navigation} onChange={onChange} />
                ) : null}
                {navigation.navLayoutDesign === 'case-overlay' ? (
                  <NavCaseOverlayLogoEditor
                    navigation={navigation}
                    onChange={onChange}
                    showColorModeToggleInNav={showColorModeToggleInNav}
                    onGlobalChange={onGlobalChange}
                  />
                ) : null}
                {navigation.navLayoutDesign === 'duten-panel' ? (
                  <NavDutenPanelEditor
                    navigation={navigation}
                    options={navSocialLinkOptions}
                    onChange={onChange}
                    showColorModeToggleInNav={showColorModeToggleInNav}
                    onGlobalChange={onGlobalChange}
                  />
                ) : null}
                {navigation.navLayoutDesign === 'half-panel-left' ? (
                  <NavHalfPanelEditor
                    navigation={navigation}
                    options={navSocialLinkOptions}
                    onChange={onChange}
                    showColorModeToggleInNav={showColorModeToggleInNav}
                    onGlobalChange={onGlobalChange}
                  />
                ) : null}
              </NpCollapsibleSection>
            ) : null}
          </div>
          )
        ) : (
          <NavDisabledNotice onEnable={enable} />
        )
      ) : null}

      {navTab === 'labels' ? (
        navigation.enabled ? (
          <div className="np-stack">
            <NpCollapsibleSection title={t('Menu items')}>
              <NavigationLabelsIconsPanel
                itemLabels={navigation.itemLabels}
                itemIcons={navigation.itemIcons}
                hiddenItems={navigation.hiddenNavItems ?? []}
                pagesMode={navMode === 'pages'}
                onChange={onChange}
              />
            </NpCollapsibleSection>
            <NpCollapsibleSection title={t('Dropdown menus')}>
              <NavMenuGroupsEditor
                groups={navigation.navMenuGroups ?? []}
                itemLabels={navigation.itemLabels}
                onChange={(navMenuGroups) => onChange({ navMenuGroups })}
              />
            </NpCollapsibleSection>
          </div>
        ) : (
          <NavDisabledNotice onEnable={enable} />
        )
      ) : null}
    </NpPanelShell>
  );
}

function SectionPanel({
  section,
  settings,
  onChange,
  onGlobalChange,
  onColorModeChange,
  onGlobalPaletteChange,
  onGlobalPalettePairChange,
  onNavigationChange,
  availableTools,
  availableWorks,
  availableServices = [],
  navSocialLinkOptions = [],
  sectionLinkOptions = [],
  profileAvatarUrl = null,
  panelSubSections,
  onPanelSubSectionChange,
  navigationChrome,
}: {
  section: PortfolioSettingsSectionMeta;
  settings: PortfolioSettings;
  onChange: (
    sectionId: PortfolioSettingsContentKey,
    patch: Partial<PortfolioSettings[PortfolioSettingsContentKey]>
  ) => void;
  onGlobalChange: (patch: PortfolioGlobalSettingsPatch) => void;
  onColorModeChange: (mode: PortfolioColorMode) => void;
  onGlobalPaletteChange: (patch: Partial<PortfolioHeroPalette>) => void;
  onGlobalPalettePairChange: (
    paletteDark: PortfolioHeroPalette,
    paletteLight?: PortfolioHeroPalette,
    family?: 'indigo' | 'classic' | 'verdant' | 'vive' | 'safran' | 'citron' | 'rouge' | 'ecarlate' | 'ardoise' | 'custom'
  ) => void;
  onNavigationChange: (patch: Partial<PortfolioNavSettings>) => void;
  availableTools: string[];
  availableWorks: { id: string; title: string; imageUrl: string }[];
  availableServices?: { id: string; title: string }[];
  navSocialLinkOptions?: PortfolioNavChromeLink[];
  sectionLinkOptions?: PortfolioFooterSectionLinkOption[];
  profileAvatarUrl?: string | null;
  panelSubSections: PanelSubSections;
  onPanelSubSectionChange: <K extends keyof PanelSubSections>(
    sectionId: K,
    value: NonNullable<PanelSubSections[K]>
  ) => void;
  /** The Navigation and Global panels' own header and footer, when the host lets them frame themselves. */
  navigationChrome?: NpPanelChrome;
}) {
  const t = useT();
  const sectionId = section.id;

  if (sectionId === 'theme') {
    return (
      <GlobalSettingsPanel
        settings={settings}
        global={settings.global}
        servicesSectionOrganization={settings.services.sectionOrganization}
        onGlobalChange={onGlobalChange}
        onColorModeChange={onColorModeChange}
        onGlobalPaletteChange={onGlobalPaletteChange}
        onGlobalPalettePairChange={onGlobalPalettePairChange}
        subSection={panelSubSections.theme ?? 'theme'}
        onSubSectionChange={(value) => onPanelSubSectionChange('theme', value)}
        sectionEnabled={Object.fromEntries(
          PORTFOLIO_NAV_SECTION_META.map(({ key }) => [key, (settings[key] as { enabled?: boolean }).enabled !== false])
        )}
        onSectionEnabledChange={(key, enabled) =>
          onChange(key as PortfolioSettingsContentKey, { enabled } as Partial<PortfolioSettings[PortfolioSettingsContentKey]>)
        }
        title={t(section.label)}
        chrome={navigationChrome}
      />
    );
  }

  if (sectionId === 'navigation') {
    return (
      <NavigationPanel
        navigation={settings.navigation}
        onChange={onNavigationChange}
        navSocialLinkOptions={navSocialLinkOptions}
        showColorModeToggleInNav={settings.global.showColorModeToggleInNav ?? false}
        onGlobalChange={onGlobalChange}
        chrome={navigationChrome}
      />
    );
  }

  if (sectionId === 'footer') {
    return (
      <FooterSettingsPanel
        footer={settings.footer}
        onChange={(patch) => onChange('footer', patch)}
        subSection={panelSubSections.footer ?? 'general'}
        onSubSectionChange={(value) => onPanelSubSectionChange('footer', value)}
        sectionLinkOptions={sectionLinkOptions}
        profileAvatarUrl={profileAvatarUrl}
        contactLinkOptions={navSocialLinkOptions}
        chrome={navigationChrome}
      />
    );
  }

  if (sectionId === 'stack') {
    return (
      <StackSettingsPanel
        stack={settings.stack}
        onChange={(patch) => onChange('stack', patch)}
        subSection={panelSubSections.stack ?? 'general'}
        onSubSectionChange={(value) => onPanelSubSectionChange('stack', value)}
        chrome={navigationChrome}
      />
    );
  }

  if (sectionId === 'tools') {
    return (
      <ToolsSettingsPanel
        tools={settings.tools}
        onChange={(patch) => onChange('tools', patch)}
        subSection={panelSubSections.tools ?? 'general'}
        onSubSectionChange={(value) => onPanelSubSectionChange('tools', value)}
        chrome={navigationChrome}
      />
    );
  }

  if (sectionId === 'services') {
    return (
      <ServicesSettingsPanel
        services={settings.services}
        onChange={(patch) => onChange('services', patch)}
        settingsFocus="services"
        subSection={panelSubSections.services ?? 'header'}
        onSubSectionChange={(value) => onPanelSubSectionChange('services', value)}
        availableServices={availableServices}
        chrome={navigationChrome}
      />
    );
  }

  const copy = settings[sectionId];

  if (sectionId === 'hero') {
    return (
      <HeroSettingsPanel
        hero={settings.hero}
        availableTools={availableTools}
        availableWorks={availableWorks}
        onChange={(patch) => onChange('hero', patch)}
        subSection={panelSubSections.hero ?? 'general'}
        onSubSectionChange={(value) => onPanelSubSectionChange('hero', value)}
        chrome={navigationChrome}
      />
    );
  }

  if (sectionId === 'info') {
    return (
      <InfoSettingsPanel
        info={settings.info}
        onChange={(patch) => onChange('info', patch)}
        subSection={panelSubSections.info ?? 'general'}
        onSubSectionChange={(value) => onPanelSubSectionChange('info', value)}
        heroPalette={settings.hero.palette}
        chrome={navigationChrome}
      />
    );
  }

  if (sectionId === 'work') {
    return (
      <WorkSettingsPanel
        work={settings.work}
        onChange={(patch) => onChange('work', patch)}
        subSection={panelSubSections.work ?? 'general'}
        onSubSectionChange={(value) => onPanelSubSectionChange('work', value)}
        chrome={navigationChrome}
      />
    );
  }

  if (sectionId === 'aboutUs') {
    return (
      <AboutUsSettingsPanel
        aboutUs={settings.aboutUs}
        onChange={(patch) => onChange('aboutUs', patch)}
        subSection={panelSubSections.aboutUs ?? 'general'}
        onSubSectionChange={(value) => onPanelSubSectionChange('aboutUs', value)}
        chrome={navigationChrome}
      />
    );
  }

  if (sectionId === 'experience') {
    return (
      <ExperienceSettingsPanel
        experience={settings.experience}
        onChange={(patch) => onChange('experience', patch)}
        subSection={panelSubSections.experience ?? 'design'}
        onSubSectionChange={(value) => onPanelSubSectionChange('experience', value)}
        chrome={navigationChrome}
      />
    );
  }

  if (sectionId === 'gallery') {
    return (
      <GallerySettingsPanel
        gallery={settings.gallery}
        onChange={(patch) => onChange('gallery', patch)}
        subSection={normalizeGallerySubSection(panelSubSections.gallery)}
        onSubSectionChange={(value) => onPanelSubSectionChange('gallery', value)}
        chrome={navigationChrome}
      />
    );
  }

  if (sectionId === 'faq') {
    return (
      <FaqSettingsPanel
        faq={settings.faq}
        onChange={(patch) => onChange('faq', patch)}
        subSection={panelSubSections.faq ?? 'general'}
        onSubSectionChange={(value) => onPanelSubSectionChange('faq', value)}
        chrome={navigationChrome}
      />
    );
  }

  if (sectionId === 'team') {
    return (
      <TeamSettingsPanel
        team={settings.team}
        onChange={(patch) => onChange('team', patch)}
        subSection={normalizeTeamSubSection(panelSubSections.team)}
        onSubSectionChange={(value) => onPanelSubSectionChange('team', value)}
        chrome={navigationChrome}
      />
    );
  }

  if (sectionId === 'contact') {
    return (
      <ContactSettingsPanel
        contact={settings.contact}
        onChange={(patch) => onChange('contact', patch)}
        subSection={panelSubSections.contact ?? 'general'}
        onSubSectionChange={(value) => onPanelSubSectionChange('contact', value)}
        heroPalette={settings.hero.palette}
        profileAvatarUrl={profileAvatarUrl}
        chrome={navigationChrome}
      />
    );
  }

  return (
    <div className="space-y-5">
      <ToggleRow
        label={t('Show section')}
        description={t('Display the {toLowerCase} block on your public portfolio.', { toLowerCase: section.label.toLowerCase() })}
        checked={copy.enabled}
        onChange={(enabled) => onChange(sectionId, { enabled })}
      />

      {'title' in copy ? (
        <TextField
          label={t('Section title')}
          value={copy.title}
          onChange={(title) => onChange(sectionId, { title })}
          placeholder={t(section.label)}
        />
      ) : null}

      {'subtitle' in copy ? (
        <TextField
          label={t('Section subtitle')}
          value={copy.subtitle}
          onChange={(subtitle) => onChange(sectionId, { subtitle })}
          placeholder={t('Optional supporting line under the title')}
          multiline
        />
      ) : null}

      <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
        {t('Content for this section is edited in Creator Studio → Information. These settings control visibility and presentation on the portfolio page.')}
      </p>
    </div>
  );
}

type PortfolioSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  /** Overlay dialog (public page) or inline atelier dock (dashboard Live Preview). */
  variant?: 'modal' | 'dock';
  /** The host already renders a permanent section rail, so the dock never needs its drill-down list. */
  directDockNavigation?: boolean;
  settings: PortfolioSettings;
  persistStatus?: 'idle' | 'saving' | 'saved' | 'error';
  onChange: (
    sectionId: PortfolioSettingsContentKey,
    patch: Partial<PortfolioSettings[PortfolioSettingsContentKey]>
  ) => void;
  onGlobalChange: (patch: PortfolioGlobalSettingsPatch) => void;
  onColorModeChange: (mode: PortfolioColorMode) => void;
  onGlobalPaletteChange: (patch: Partial<PortfolioHeroPalette>) => void;
  onGlobalPalettePairChange: (
    paletteDark: PortfolioHeroPalette,
    paletteLight?: PortfolioHeroPalette,
    family?: 'indigo' | 'classic' | 'verdant' | 'vive' | 'safran' | 'citron' | 'rouge' | 'ecarlate' | 'ardoise' | 'custom'
  ) => void;
  onNavigationChange: (patch: Partial<PortfolioNavSettings>) => void;
  onReset: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  availableTools: string[];
  availableWorks?: { id: string; title: string; imageUrl: string }[];
  availableServices?: { id: string; title: string }[];
  navSocialLinkOptions?: PortfolioNavChromeLink[];
  /** Sections currently visible in the live preview (Footer → Layout settings link picker). */
  sectionLinkOptions?: PortfolioFooterSectionLinkOption[];
  /** Account profile photo (Footer → General → Photo reference). */
  profileAvatarUrl?: string | null;
  /** Live Preview: scroll the iframe to the matching portfolio section. */
  onPreviewSectionFocus?: (sectionId: PortfolioSettingsSectionId) => void;
  /**
   * Controlled open section (the live preview's three-pane studio owns it: its section list on the
   * left, clicks in the preview). Without it the panel keeps its own.
   */
  activeSectionId?: PortfolioSettingsSectionId;
  onActiveSectionChange?: (sectionId: PortfolioSettingsSectionId) => void;
};

export function PortfolioSettingsModal({
  open,
  onClose,
  variant = 'modal',
  directDockNavigation = false,
  settings,
  persistStatus = 'idle',
  onChange,
  onGlobalChange,
  onColorModeChange,
  onGlobalPaletteChange,
  onGlobalPalettePairChange,
  onNavigationChange,
  onReset,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  availableTools,
  availableWorks = [],
  availableServices = [],
  navSocialLinkOptions = [],
  sectionLinkOptions = [],
  profileAvatarUrl = null,
  onPreviewSectionFocus,
  activeSectionId,
  onActiveSectionChange,
}: PortfolioSettingsModalProps) {
  const t = useT();
  const router = useRouter();
  const { theme: appTheme } = useTheme();
  const appColorMode = appTheme === 'light' ? 'light' : 'dark';
  const [mounted, setMounted] = useState(variant === 'dock');
  const [ownActiveSection, setOwnActiveSection] = useState<PortfolioSettingsSectionId>('theme');
  const activeSection = activeSectionId ?? ownActiveSection;
  const setActiveSection = useCallback(
    (sectionId: PortfolioSettingsSectionId) => {
      if (onActiveSectionChange) onActiveSectionChange(sectionId);
      else setOwnActiveSection(sectionId);
    },
    [onActiveSectionChange]
  );
  /*
   * Below lg the dock is one screen at a time, Shopify's mobile editor: the section list first, then a
   * section's settings with a way back. From lg the list is the studio's left pane, so this is unused.
   */
  const [dockShowsList, setDockShowsList] = useState(!directDockNavigation);
  const controlledSectionRef = useRef(activeSectionId);
  useEffect(() => {
    // A section opened from outside (the left pane, a click in the preview) goes straight to its settings.
    if (activeSectionId !== undefined && controlledSectionRef.current !== activeSectionId) {
      controlledSectionRef.current = activeSectionId;
      setDockShowsList(false);
    }
  }, [activeSectionId]);
  const [panelSubSections, setPanelSubSections] = useState<PanelSubSections>({});
  const [panelOpacity, setPanelOpacity] = useState(100);
  /** Temporarily hide the settings panel to inspect the live portfolio. */
  const [peekPreview, setPeekPreview] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPanelOpacity(readStoredModalOpacity());
    if (activeSectionId === undefined) setOwnActiveSection(readStoredPortfolioSettingsSection());
    // Mount only: a controlled panel is seeded by its owner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;
    window.localStorage.setItem(MODAL_OPACITY_STORAGE_KEY, String(panelOpacity));
  }, [mounted, panelOpacity]);

  useEffect(() => {
    if (!mounted) return;
    storePortfolioSettingsSection(activeSection);
  }, [mounted, activeSection]);

  useEffect(() => {
    if (!open) setPeekPreview(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;

      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;

      const key = event.key.toLowerCase();
      if (key === 'z' && !event.shiftKey) {
        if (!canUndo || !onUndo) return;
        event.preventDefault();
        onUndo();
        return;
      }
      if ((key === 'z' && event.shiftKey) || key === 'y') {
        if (!canRedo || !onRedo) return;
        event.preventDefault();
        onRedo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, canUndo, canRedo, onUndo, onRedo]);

  const handleClose = useCallback(() => {
    setPeekPreview(false);
    onClose();
  }, [onClose]);

  const openUpgradePage = useCallback(() => {
    handleClose();
    router.push(PORTFOLIO_UPGRADE_PATH);
  }, [handleClose, router]);

  const selectSection = useCallback((sectionId: PortfolioSettingsSectionId) => {
    setActiveSection(sectionId);
    onPreviewSectionFocus?.(sectionId);
  }, [onPreviewSectionFocus, setActiveSection]);

  const setPanelSubSection = useCallback(
    <K extends keyof PanelSubSections>(sectionId: K, value: NonNullable<PanelSubSections[K]>) => {
      setPanelSubSections((prev) => ({ ...prev, [sectionId]: value }));
    },
    []
  );

  const handleSearchSelect = useCallback((entry: PortfolioSettingsSearchEntry) => {
    setActiveSection(entry.sectionId);
    onPreviewSectionFocus?.(entry.sectionId);
    if (!entry.subSection) return;
    if (entry.sectionId === 'theme') {
      setPanelSubSections((prev) => ({ ...prev, theme: entry.subSection as GlobalSettingsSubSection }));
    } else if (entry.sectionId === 'hero') {
      setPanelSubSections((prev) => ({
        ...prev,
        hero: normalizeHeroSettingsSubSection(entry.subSection),
      }));
    } else if (entry.sectionId === 'work') {
      setPanelSubSections((prev) => ({
        ...prev,
        work: normalizeWorkSettingsSubSection(entry.subSection),
      }));
    } else if (entry.sectionId === 'services') {
      setPanelSubSections((prev) => ({
        ...prev,
        services: normalizeServicesSubSection(entry.subSection),
      }));
    } else if (entry.sectionId === 'aboutUs') {
      setPanelSubSections((prev) => ({
        ...prev,
        aboutUs: (entry.subSection as AboutUsSubSection) ?? 'general',
      }));
    } else if (entry.sectionId === 'info') {
      setPanelSubSections((prev) => ({
        ...prev,
        info: (entry.subSection as InfoSubSection) ?? 'general',
      }));
    } else if (entry.sectionId === 'experience') {
      setPanelSubSections((prev) => ({
        ...prev,
        experience: normalizeExperienceSubSection(entry.subSection),
      }));
    } else if (entry.sectionId === 'faq') {
      setPanelSubSections((prev) => ({ ...prev, faq: normalizeFaqSubSection(entry.subSection) }));
    } else if (entry.sectionId === 'stack') {
      setPanelSubSections((prev) => ({
        ...prev,
        stack: normalizeStackSubSection(entry.subSection),
      }));
    } else if (entry.sectionId === 'tools') {
      setPanelSubSections((prev) => ({
        ...prev,
        tools: normalizeToolsSubSection(entry.subSection),
      }));
    } else if (entry.sectionId === 'contact') {
      setPanelSubSections((prev) => ({ ...prev, contact: normalizeContactSubSection(entry.subSection) }));
    } else if (entry.sectionId === 'footer') {
      setPanelSubSections((prev) => ({ ...prev, footer: normalizeFooterSubSection(entry.subSection) }));
    }
  }, [onPreviewSectionFocus, setActiveSection]);

  // Global, Navigation and Hero lead, then the content sections in the page's order, then Footer.
  const visibleSettingsSections = useMemo(
    () =>
      getVisiblePortfolioSettingsSections({
        presenceKind: settings.global.presenceKind,
        sectionOrder: settings.global.sectionOrder,
      }),
    [settings.global.presenceKind, settings.global.sectionOrder]
  );

  useEffect(() => {
    if (!open) return;
    if (variant === 'dock') {
      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') handleClose();
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = peekPreview ? '' : 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (peekPreview) {
        setPeekPreview(false);
        return;
      }
      handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, handleClose, peekPreview, variant]);

  if (!open || !mounted) return null;

  const activeMeta =
    visibleSettingsSections.find((section) => section.id === activeSection) ??
    visibleSettingsSections[0] ??
    PORTFOLIO_SETTINGS_SECTIONS[0];

  const sectionPanel = (
    <PortfolioGlobalMotionProvider
      value={settings.global.motionEnabled !== false && settings.global.headerMotionEnabled !== false}
    >
    <PortfolioBackgroundLibraryProvider
      library={settings.global.backgroundImageLibrary ?? []}
      onLibraryChange={(backgroundImageLibrary) => onGlobalChange({ backgroundImageLibrary })}
    >
      <SectionPanel
        section={activeMeta}
        settings={settings}
        onChange={onChange}
        onGlobalChange={onGlobalChange}
        onColorModeChange={onColorModeChange}
        onGlobalPaletteChange={onGlobalPaletteChange}
        onGlobalPalettePairChange={onGlobalPalettePairChange}
        onNavigationChange={onNavigationChange}
        availableTools={availableTools}
        availableWorks={availableWorks}
        availableServices={availableServices}
        navSocialLinkOptions={navSocialLinkOptions}
        sectionLinkOptions={sectionLinkOptions}
        profileAvatarUrl={profileAvatarUrl}
        panelSubSections={panelSubSections}
        onPanelSubSectionChange={setPanelSubSection}
        navigationChrome={
          variant === 'dock'
            ? {
                onBack: directDockNavigation ? undefined : () => setDockShowsList(true),
                onClose: handleClose,
                onUndo: () => onUndo?.(),
                onRedo: () => onRedo?.(),
                canUndo,
                canRedo,
                onDone: handleClose,
                hideClose: directDockNavigation,
              }
            : undefined
        }
      />
    </PortfolioBackgroundLibraryProvider>
    </PortfolioGlobalMotionProvider>
  );

  if (variant === 'dock') {
    /*
     * The dock is the app's chrome, not part of the portfolio. It follows the application's own
     * light / dark mode and neutral palette, whatever palette and mode the portfolio itself uses.
     *
     * Navigation, Global, Stack, Tools, Info, Portfolio, Footer and Hero frame themselves (title, status, history, tabs,
     * reset · done): the dock's own header and footer step aside, except around the section list below lg.
     */
    const panelFramesItself =
      activeMeta.id === 'navigation' ||
      activeMeta.id === 'theme' ||
      activeMeta.id === 'stack' ||
      activeMeta.id === 'tools' ||
      activeMeta.id === 'info' ||
      activeMeta.id === 'work' ||
      activeMeta.id === 'services' ||
      activeMeta.id === 'aboutUs' ||
      activeMeta.id === 'experience' ||
      activeMeta.id === 'team' ||
      activeMeta.id === 'gallery' ||
      activeMeta.id === 'faq' ||
      activeMeta.id === 'contact' ||
      activeMeta.id === 'footer' ||
      activeMeta.id === 'hero';
    const dockChromeClass = panelFramesItself ? (dockShowsList ? 'lg:hidden' : 'hidden') : '';
    return (
      <div className="portfolio-studio-dock flex h-full min-h-0 flex-col" data-color-mode={appColorMode}>
        <div
          className={`relative z-20 flex h-16 shrink-0 items-center border-b border-[color:var(--pf-palette-bordure)] px-5 ${dockChromeClass}`}
        >
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex h-9 min-w-0 items-center">
              <h2 id="portfolio-settings-title" className="sr-only">
                {t('Settings')}
              </h2>
              {/* From lg: the open section's name (the list is the studio's left pane). */}
              <p className="hidden min-w-0 items-center gap-2 lg:flex">
                <span className="truncate text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--pf-palette-texte-fort)]">
                  {t(activeMeta.label)}
                </span>
                <DockSaveDot persistStatus={persistStatus} />
              </p>
              {/* Below lg: "Sections", or the open section with the way back to the list. */}
              {dockShowsList ? (
                <p className="flex min-w-0 items-center gap-2 lg:hidden">
                  <span className="truncate text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--pf-palette-texte-fort)]">
                    {t('Sections')}
                  </span>
                  <DockSaveDot persistStatus={persistStatus} />
                </p>
              ) : (
                <div className="flex min-w-0 items-center gap-1.5 lg:hidden">
                  <button
                    type="button"
                    onClick={() => setDockShowsList(true)}
                    aria-label={t('All sections')}
                    className="-ml-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[color:var(--pf-palette-texte-fort)] transition hover:bg-[color:var(--pf-palette-neutre)]"
                  >
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M15 6l-6 6 6 6" />
                    </svg>
                  </button>
                  <span className="truncate text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--pf-palette-texte-fort)]">
                    {t(activeMeta.label)}
                  </span>
                  <DockSaveDot persistStatus={persistStatus} />
                </div>
              )}
              <p className="sr-only" aria-live="polite">
                {persistStatus === 'saving'
                  ? t('Saving')
                  : persistStatus === 'saved'
                    ? t('Saved')
                    : persistStatus === 'error'
                      ? t('Not saved — retrying')
                      : t('Synced with your account')}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <ModalHistoryControls
                tone="palette"
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={() => onUndo?.()}
                onRedo={() => onRedo?.()}
              />
            </div>
          </div>
        </div>

        {panelFramesItself ? (
          <>
            {dockShowsList ? (
              <div className="min-h-0 flex-1 overflow-y-auto lg:hidden">
                <PortfolioStudioSectionList
                  sections={visibleSettingsSections}
                  activeId={activeSection}
                  tone="palette"
                  variant="drill"
                  onSelect={(sectionId) => {
                    selectSection(sectionId);
                    setDockShowsList(false);
                  }}
                />
              </div>
            ) : null}
            <div
              className={`portfolio-studio-dock-surface min-h-0 flex-1 flex-col ${dockShowsList ? 'hidden lg:flex' : 'flex'}`}
            >
              {sectionPanel}
            </div>
          </>
        ) : (
        <div className="portfolio-studio-dock-surface min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {dockShowsList ? (
            <div className="-mx-5 -mt-3 lg:hidden">
              <PortfolioStudioSectionList
                sections={visibleSettingsSections}
                activeId={activeSection}
                tone="palette"
                variant="drill"
                onSelect={(sectionId) => {
                  selectSection(sectionId);
                  setDockShowsList(false);
                }}
              />
            </div>
          ) : null}
          <div className={dockShowsList ? 'hidden lg:block' : ''}>
            <div className="mb-8">
              <PortfolioSettingsSearchBar
                appearance="underline"
                onSelect={(entry) => {
                  handleSearchSelect(entry);
                  setDockShowsList(false);
                }}
              />
            </div>
            {sectionPanel}
          </div>
        </div>
        )}

        <div
          className={`flex h-16 shrink-0 items-center justify-between gap-4 border-t border-[color:var(--pf-palette-bordure)] px-5 ${dockChromeClass}`}
        >
          <button
            type="button"
            onClick={onReset}
            className="rounded-full px-1 text-[14px] font-semibold text-[color:var(--pf-palette-texte-muted)] underline-offset-4 transition-colors hover:text-[color:var(--pf-palette-texte-fort)] hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--pf-palette-texte-muted)]"
          >
            {t('Reset defaults')}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="portfolio-studio-dock-done rounded-full transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--pf-palette-texte-muted)]"
          >
            {t('Done')}
          </button>
        </div>
      </div>
    );
  }

  const previewMode = panelOpacity < 98;
  const backdropAlpha = previewMode ? 0.04 + (panelOpacity / 100) * 0.22 : 0.6;
  const backdropBlur = previewMode ? Math.max(2, Math.round((panelOpacity / 100) * 8)) : 4;
  const panelAlpha = panelOpacity / 100;

  return createPortal(
    <>
      {peekPreview ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[210] flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-full border border-neutral-200/90 bg-white/95 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.14)] backdrop-blur-md">
            <p className="pl-2 text-sm font-semibold text-neutral-800">{t('Previewing portfolio')}</p>
            <button
              type="button"
              onClick={() => setPeekPreview(false)}
              className="inline-flex min-h-11 items-center rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-bold text-white"
            >
              {t('Back to settings')}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              aria-label={t('Close settings')}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}

      <div
        className={`fixed inset-0 z-[200] flex items-stretch justify-center lg:items-center lg:p-6 ${
          peekPreview ? 'pointer-events-none invisible' : ''
        }`}
        aria-hidden={peekPreview}
      >
      <button
        type="button"
        className="absolute inset-0 hidden backdrop-blur-xs transition-[background-color,backdrop-filter] duration-200 lg:block"
        style={{
          backgroundColor: `rgba(10, 10, 10, ${backdropAlpha})`,
          backdropFilter: `blur(${backdropBlur}px)`,
          WebkitBackdropFilter: `blur(${backdropBlur}px)`,
        }}
        aria-label={t('Close settings')}
        onClick={handleClose}
        tabIndex={peekPreview ? -1 : undefined}
      />
      <div
        role="dialog"
        aria-modal={peekPreview ? undefined : true}
        aria-labelledby="portfolio-settings-title"
        className="relative z-10 flex h-[100dvh] w-full max-w-none flex-col overflow-hidden rounded-none border-0 bg-white shadow-none transition-[background-color,backdrop-filter] duration-200 lg:h-[min(82vh,760px)] lg:max-w-5xl lg:rounded-[1.75rem] lg:border lg:border-neutral-200/80 lg:shadow-2xl"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${panelAlpha})`,
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          ...(previewMode
            ? {
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
              }
            : {}),
        }}
      >
        <div className="border-b border-neutral-200/80 px-5 py-3.5 sm:px-7 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2
                id="portfolio-settings-title"
                className="text-lg font-extrabold tracking-tight text-neutral-950 sm:text-xl"
              >
                {t('Portfolio settings')}
              </h2>
              <p
                className={`mt-0.5 text-xs font-medium ${
                  persistStatus === 'error'
                    ? 'text-red-600'
                    : persistStatus === 'saving'
                      ? 'text-neutral-500'
                      : persistStatus === 'saved'
                        ? 'text-emerald-700'
                        : 'text-neutral-400'
                }`}
                aria-live="polite"
              >
                {persistStatus === 'saving'
                  ? t('Saving to your account…')
                  : persistStatus === 'saved'
                    ? t('Saved to your account')
                    : persistStatus === 'error'
                      ? t('Not saved — kept on this device, retrying…')
                      : t('Synced with your account')}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <ModalHistoryControls
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={() => onUndo?.()}
                onRedo={() => onRedo?.()}
              />
              <div className="hidden lg:block">
                <ModalPeekPreviewButton onClick={() => setPeekPreview(true)} />
              </div>
              <ModalPreviewTransparencyControl value={panelOpacity} onChange={setPanelOpacity} />
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
                aria-label={t('Close')}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2.5 sm:mt-3.5 sm:flex-row sm:items-center sm:gap-3">
            <div className="min-w-0 flex-1">
              <PortfolioSettingsSearchBar onSelect={handleSearchSelect} />
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <ModalPeekPreviewButton onClick={() => setPeekPreview(true)} className="shrink-0" />
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-neutral-200/90 bg-neutral-50/80 px-3 py-1.5 sm:hidden">
                <input
                  type="range"
                  min={35}
                  max={100}
                  step={5}
                  value={panelOpacity}
                  onChange={(event) => setPanelOpacity(Number(event.target.value))}
                  className="h-1 min-w-0 flex-1 cursor-pointer accent-neutral-700"
                  aria-label={t('Settings panel transparency')}
                />
                <span className="text-xs font-semibold tabular-nums text-neutral-600">{panelOpacity}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)] lg:grid-rows-none">
          <nav
            className={`border-b border-neutral-200/80 p-3 lg:border-b-0 lg:border-r lg:overflow-y-auto ${
              previewMode ? 'bg-neutral-50/35' : 'bg-neutral-50/50'
            }`}
            aria-label={t('Portfolio sections')}
          >
            <ul className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto sm:max-h-48 sm:grid-cols-3 lg:flex lg:max-h-none lg:flex-col lg:overflow-visible">
              {visibleSettingsSections.map((section) => {
                const active = section.id === activeSection;
                return (
                  <li key={section.id} className="lg:w-full">
                    <button
                      type="button"
                      onClick={() => selectSection(section.id)}
                      className={`flex min-h-11 w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        active
                          ? 'bg-white font-semibold text-neutral-950 shadow-xs ring-1 ring-neutral-200/80'
                          : 'font-medium text-neutral-600 hover:bg-white/70 hover:text-neutral-900'
                      }`}
                    >
                      {t(section.label)}
                    </button>
                  </li>
                );
              })}
              <li className="lg:mt-2 lg:w-full lg:border-t lg:border-neutral-200/80 lg:pt-2">
                <button
                  type="button"
                  onClick={openUpgradePage}
                  className="flex min-h-11 w-full items-center justify-between rounded-xl bg-red-500/10 px-3 py-2.5 text-left text-sm font-semibold text-red-500 transition hover:bg-red-500/15"
                >
                  <span>{t('Upgrade')}</span>
                  <span aria-hidden className="text-xs font-bold opacity-70">
                    ↗
                  </span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            {activeSection !== 'hero' && activeSection !== 'theme' ? (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-neutral-950">{t(activeMeta.label)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">{t(activeMeta.description)}</p>
              </div>
            ) : null}
            {sectionPanel}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-200/80 px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onReset}
            className="min-h-11 text-sm font-semibold text-neutral-500 transition hover:text-neutral-800"
          >
            {t('Reset defaults')}
          </button>
          <div className="flex items-center gap-2">
            <div className="lg:hidden">
              <ModalPeekPreviewButton onClick={() => setPeekPreview(true)} />
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex min-h-11 items-center rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800"
            >
              {t('Done')}
            </button>
          </div>
        </div>
      </div>
      </div>
    </>,
    document.body
  );
}
