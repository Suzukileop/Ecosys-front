'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  PORTFOLIO_NAV_TRI_ZONE_SOCIAL_LINK_GAP_OPTIONS,
  PORTFOLIO_NAV_TRI_ZONE_SOCIAL_LINK_SIZE_OPTIONS,
} from '@/components/portfolio/portfolio-nav-tri-zone-social';
import { LinkBrandIcon } from '@/components/portfolio/PortfolioLinksChrome';
import { PortfolioNavContactCtaGlyph } from '@/components/portfolio/portfolio-nav-contact-cta-icons';
import type { PortfolioNavMenuGroup } from '@/components/portfolio/portfolio-nav-menu-groups';
import type { PortfolioNavChromeLink } from '@/components/portfolio/portfolio-nav-extras';
import {
  PORTFOLIO_FLOATING_CHROME,
} from '@/components/portfolio/portfolio-section-primitives';
import {
  PORTFOLIO_SETTINGS_SECTIONS,
  DEFAULT_PORTFOLIO_NAV_LINK_ICON_SOURCES,
  PORTFOLIO_NAV_CONTACT_CTA_ICON_OPTIONS,
  PORTFOLIO_NAV_CONTACT_BUTTON_ICON_POSITION_OPTIONS,
  PORTFOLIO_NAV_CONTACT_BUTTON_SHAPE_OPTIONS,
  DEFAULT_EDITORIAL_BAR_MAIL_CONTACT,
  DEFAULT_EDITORIAL_BAR_PHONE_CONTACT,
  mergeEditorialBarContactChannelSettings,
  portfolioNavContactCtaIconOptionsForEditorialChannel,
  PORTFOLIO_NAV_EXTRAS_PLACEMENT_OPTIONS,
  PORTFOLIO_NAV_CUSTOM_EXTRA_DISPLAY_OPTIONS,
  PORTFOLIO_NAV_CUSTOM_EXTRA_FONT_WEIGHT_OPTIONS,
  clampPortfolioNavCustomExtraFontSizePx,
  clampPortfolioNavCustomExtraGapPx,
  clampPortfolioNavCustomExtraLogoSizePx,
  clampPortfolioNavCustomExtraPaddingX,
  clampPortfolioNavCustomExtraPaddingY,
  type PortfolioNavSettings,
  type PortfolioNavLinkIconSource,
  type PortfolioNavExtrasSide,
  type PortfolioNavExtrasPlacement,
  type PortfolioNavCustomExtraDisplay,
  type PortfolioNavCustomExtraFontWeight,
  type PortfolioNavCustomExtraPlacement,
  type PortfolioNavCustomExtraShape,
  type PortfolioNavContactButtonDisplay,
  type PortfolioNavContactButtonIconPosition,
  type PortfolioNavContactButtonShape,
  type PortfolioNavContactCtaIcon,
  type PortfolioNavEditorialBarContactChannelSettings,
  type PortfolioSettings,
  type PortfolioSettingsSectionId,
  type PortfolioSettingsSectionMeta,
  PORTFOLIO_NAV_EDITORIAL_BAR_BUTTON_INK_OPTIONS,
} from '@/components/portfolio/portfolio-settings-types';
import {
  PORTFOLIO_NAV_ACTIVE_INDICATOR_OPTIONS,
  PORTFOLIO_NAV_BAR_DESIGN_OPTIONS,
  PORTFOLIO_NAV_BAR_PADDING_OPTIONS,
  PORTFOLIO_NAV_BUTTON_PADDING_OPTIONS,
  PORTFOLIO_NAV_EFFECT_STRENGTH_OPTIONS,
  PORTFOLIO_NAV_BAR_THICKNESS_OPTIONS,
  PORTFOLIO_NAV_BAR_WIDTH_OPTIONS,
  PORTFOLIO_NAV_BUTTON_DESIGN_OPTIONS,
  PORTFOLIO_NAV_FLOATING_PILL_MENU_MODE_OPTIONS,
  normalizePortfolioNavFloatingPillMenuMode,
  PORTFOLIO_NAV_DISPLAY_OPTIONS,
  PORTFOLIO_NAV_VISIBILITY_MODE_OPTIONS,
  resolvePortfolioNavVisibilityMode,
  PORTFOLIO_NAV_MENU_HANDLE_OPTIONS,
  PORTFOLIO_NAV_MENU_CONTROL_ICON_OPTIONS,
  PORTFOLIO_NAV_MENU_CONTROL_ALIGN_OPTIONS,
  PORTFOLIO_NAV_EDGE_OFFSET_OPTIONS,
  PORTFOLIO_NAV_BAR_SURFACE_OPTIONS,
  PORTFOLIO_NAV_BAR_HEIGHT_OPTIONS,
  PORTFOLIO_NAV_ITEM_GAP_OPTIONS,
  PORTFOLIO_NAV_LABEL_CASE_OPTIONS,
  PORTFOLIO_NAV_LABEL_FONT_SIZE_OPTIONS,
  PORTFOLIO_NAV_LOOK_PRESET_OPTIONS,
  PORTFOLIO_NAV_MODE_OPTIONS,
  PORTFOLIO_NAV_MOBILE_LAYOUT_OPTIONS,
  PORTFOLIO_NAV_MOBILE_BRAND_OPTIONS,
  PORTFOLIO_NAV_MOBILE_DRAWER_SIDE_OPTIONS,
  PORTFOLIO_NAV_PLACEMENT_OPTIONS,
  type PortfolioNavLookPreset,
} from '@/components/portfolio/portfolio-nav-settings';
import {
  PORTFOLIO_NAV_IN_BAR_BRAND_LABEL,
  PORTFOLIO_NAV_LAYOUT_DESIGN_OPTIONS,
  portfolioNavLayoutDesignPatch,
  type PortfolioNavLayoutDesign,
} from '@/components/portfolio/portfolio-nav-layout-design';
import { PortfolioNavIcon } from '@/components/portfolio/portfolio-nav-icons';
import {
  DEFAULT_HERO_PALETTE,
  LIGHT_HERO_PALETTE,
  INDIGO_DARK_HERO_PALETTE,
  INDIGO_LIGHT_HERO_PALETTE,
  VERDANT_DARK_HERO_PALETTE,
  VERDANT_LIGHT_HERO_PALETTE,
  VIVE_DARK_HERO_PALETTE,
  VIVE_LIGHT_HERO_PALETTE,
  SAFRAN_DARK_HERO_PALETTE,
  SAFRAN_LIGHT_HERO_PALETTE,
  CITRON_DARK_HERO_PALETTE,
  CITRON_LIGHT_HERO_PALETTE,
  ROUGE_DARK_HERO_PALETTE,
  ROUGE_LIGHT_HERO_PALETTE,
  ECARLATE_DARK_HERO_PALETTE,
  ECARLATE_LIGHT_HERO_PALETTE,
  ARDOISE_DARK_HERO_PALETTE,
  ARDOISE_LIGHT_HERO_PALETTE,
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  resolveActivePortfolioPalette,
  inferPaletteFamily,
  type PortfolioColorMode,
} from '@/components/portfolio/portfolio-color-mode';
import {
  applyNavPaletteToSettings,
  DEFAULT_NAV_COLOR_BINDINGS,
  DEFAULT_NAV_PALETTE,
  mergeNavColorBindings,
  mergeNavPalette,
  navSlotHexField,
  patchNavColorBinding,
  patchNavPalette,
  patchNavSlotColor,
  PORTFOLIO_NAV_COLOR_SLOT_OPTIONS,
  type NavColorSlot,
} from '@/components/portfolio/portfolio-nav-palette-settings';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';
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
  type HeroSettingsSubSection,
} from '@/components/portfolio/portfolio-hero-settings-panel';
import {
  WorkSettingsPanel,
  normalizeWorkSettingsSubSection,
  type WorkSettingsSubSection,
} from '@/components/portfolio/portfolio-work-settings-panel';
import {
  GallerySettingsPanel,
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
  type ContactSubSection,
} from '@/components/portfolio/portfolio-contact-settings-panel';
import {
  FooterSettingsPanel,
  type FooterSubSection,
} from '@/components/portfolio/portfolio-footer-settings-panel';
import { PORTFOLIO_UPGRADE_PATH } from '@/components/portfolio/portfolio-pricing-upgrade-panel';
import { portfolioPresenceShowsAboutUs } from '@/components/portfolio/portfolio-presence';
import {
  GLOBAL_SETTINGS_SUB_SECTIONS,
  GlobalSettingsGuideMockup,
  GlobalSettingsTip,
  type GlobalSettingsSubSection,
} from '@/components/portfolio/portfolio-global-settings-guide';
import {
  searchPortfolioSettings,
  type PortfolioSettingsSearchEntry,
} from '@/components/portfolio/portfolio-settings-search';
import { PORTFOLIO_THEMES, isCustomPortfolioThemeId, type PortfolioBuiltinThemeId, type PortfolioThemeId } from '@/components/portfolio/portfolio-themes';
import { customThemeToPickerTheme, customThemeHasPendingChanges, type PortfolioCustomTheme } from '@/components/portfolio/portfolio-custom-themes';
import {
  DEFAULT_GLOBAL_HIGHLIGHT_COLOR,
  DEFAULT_GLOBAL_SUBTITLE_COLOR,
  DEFAULT_GLOBAL_TITLE_COLOR,
  PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_POSITION_OPTIONS,
  PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_SIZE_OPTIONS,
  PORTFOLIO_GLOBAL_BACKGROUND_PATTERN_OPTIONS,
  GLOBAL_BACKGROUND_PATTERN_GAP_MAX,
  GLOBAL_BACKGROUND_PATTERN_UNIT_SIZE_MAX,
  GLOBAL_BACKGROUND_PATTERN_UNIT_SIZE_MIN,
  GLOBAL_BACKGROUND_PATTERN_UNITS_PER_ROW_MAX,
  globalBackgroundPatternSwatchStyle,
  globalBackgroundPatternUsesSecondaryColor,
  PORTFOLIO_GLOBAL_CONTENT_GUTTER_OPTIONS,
  PORTFOLIO_GLOBAL_CONTENT_WIDTH_OPTIONS,
  PORTFOLIO_GLOBAL_BODY_FONT_OPTIONS,
  PORTFOLIO_GLOBAL_HEADER_FONT_OPTIONS,
  PORTFOLIO_GLOBAL_SECTION_TOP_SPACING_OPTIONS,
  PORTFOLIO_GLOBAL_SECTION_BOTTOM_SPACING_OPTIONS,
  PORTFOLIO_GLOBAL_SUBTITLE_SIZE_OPTIONS,
  PORTFOLIO_GLOBAL_TEXT_DECORATION_OPTIONS,
  PORTFOLIO_GLOBAL_TITLE_ALIGNMENT_OPTIONS,
  PORTFOLIO_GLOBAL_TITLE_CHROME_BORDER_WIDTH_OPTIONS,
  PORTFOLIO_GLOBAL_TITLE_CHROME_PADDING_OPTIONS,
  PORTFOLIO_GLOBAL_TITLE_CHROME_RADIUS_OPTIONS,
  PORTFOLIO_GLOBAL_TITLE_FONT_WEIGHT_OPTIONS,
  PORTFOLIO_GLOBAL_TITLE_ORIENTATION_OPTIONS,
  PORTFOLIO_GLOBAL_TITLE_SCROLL_OPTIONS,
  PORTFOLIO_GLOBAL_SPLIT_TITLE_MOTION_OPTIONS,
  PORTFOLIO_GLOBAL_SPLIT_CONTENT_TOP_SPACING_OPTIONS,
  PORTFOLIO_GLOBAL_SPLIT_CONTENT_BOTTOM_SPACING_OPTIONS,
  PORTFOLIO_GLOBAL_SPLIT_TITLE_FRAME_BORDER_BLUR_OPTIONS,
  PORTFOLIO_GLOBAL_SPLIT_TITLE_FRAME_BORDER_DOUBLE_GAP_OPTIONS,
  PORTFOLIO_GLOBAL_SPLIT_TITLE_FRAME_BORDER_SIDE_OPTIONS,
  DEFAULT_GLOBAL_SPLIT_TITLE_FRAME,
  DEFAULT_GLOBAL_SPLIT_TITLE_FRAME_BORDER_SIDES,
  GLOBAL_SPLIT_TITLE_OFFSET_X_MAX,
  GLOBAL_SPLIT_TITLE_OFFSET_X_MIN,
  GLOBAL_SPLIT_CONTENT_TOP_EXTRA_PX_MAX,
  GLOBAL_SPLIT_CONTENT_TOP_EXTRA_PX_MIN,
  GLOBAL_SPLIT_CONTENT_BOTTOM_EXTRA_PX_MAX,
  GLOBAL_SPLIT_CONTENT_BOTTOM_EXTRA_PX_MIN,
  GLOBAL_SECTION_TITLE_TOP_EXTRA_PX_MAX,
  GLOBAL_SECTION_TITLE_TOP_EXTRA_PX_MIN,
  GLOBAL_SECTION_TITLE_BOTTOM_EXTRA_PX_MAX,
  GLOBAL_SECTION_TITLE_BOTTOM_EXTRA_PX_MIN,
  clampGlobalSplitTitleOffsetX,
  clampGlobalSplitContentTopExtraPx,
  clampGlobalSplitContentBottomExtraPx,
  clampGlobalSectionTitleTopExtraPx,
  clampGlobalSectionTitleBottomExtraPx,
  PORTFOLIO_GLOBAL_TITLE_SIZE_OPTIONS,
  PORTFOLIO_GLOBAL_TYPOGRAPHY_SCOPE_OPTIONS,
  PORTFOLIO_GLOBAL_COLOR_SOURCE_OPTIONS,
  moveSectionInOrder,
  type PortfolioGlobalSettings,
  type PortfolioGlobalSettingsPatch,
  type PortfolioGlobalSubtitleTypography,
  type PortfolioGlobalTitleOrientationTargets,
  type PortfolioGlobalTitleChrome,
  type PortfolioGlobalSplitTitleFrame,
  type PortfolioGlobalTitleTypography,
  type PortfolioGlobalHeaderFont,
  type PortfolioGlobalBodyFont,
  type PortfolioGlobalColorSource,
  resolveGlobalTypographyTextColor,
  globalTitleFontWeightValue,
} from '@/components/portfolio/portfolio-global-settings';
import { resolvePortfolioContentSectionOrder } from '@/components/portfolio/portfolio-services-block-settings';
import type { PortfolioServicesSectionOrganization } from '@/components/portfolio/portfolio-services-settings';
import {
  PORTFOLIO_GLOBAL_MOTION_PROFILE_OPTIONS,
  MOTION_TIMING_DELAY_MAX,
  MOTION_TIMING_DELAY_MIN,
  MOTION_TIMING_DISTANCE_MAX,
  MOTION_TIMING_DISTANCE_MIN,
  MOTION_TIMING_DURATION_MAX,
  MOTION_TIMING_DURATION_MIN,
  MOTION_TIMING_HOVER_LIFT_MAX,
  MOTION_TIMING_HOVER_LIFT_MIN,
  MOTION_TIMING_HOVER_SHADOW_OPACITY_MAX,
  MOTION_TIMING_HOVER_SHADOW_OPACITY_MIN,
  MOTION_TIMING_HOVER_SHADOW_SIZE_MAX,
  MOTION_TIMING_HOVER_SHADOW_SIZE_MIN,
  MOTION_TIMING_STAGGER_MAX,
  MOTION_TIMING_STAGGER_MIN,
  clampMotionHoverLift,
  clampMotionHoverShadowOpacity,
  clampMotionHoverShadowSize,
  clampMotionTimingDelay,
  clampMotionTimingDistance,
  clampMotionTimingDuration,
  clampMotionTimingStagger,
  defaultMotionTimingForProfile,
  formatMotionHoverRecipe,
  formatMotionSeconds,
  isMotionProfileActive,
  motionProfileSupportsHover,
  resolveMotionTiming,
  type PortfolioGlobalMotionProfile,
  type PortfolioMotionTiming,
} from '@/components/portfolio/portfolio-motion-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { PortfolioBackgroundImageUpload } from '@/components/portfolio/portfolio-background-image-upload';
import { PortfolioBackgroundLibraryProvider } from '@/components/portfolio/portfolio-background-library-context';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';

const MODAL_OPACITY_STORAGE_KEY = 'portfolio-settings-modal-opacity';
const MODAL_SECTION_STORAGE_KEY = 'portfolio-settings-active-section';

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
}: {
  onSelect: (entry: PortfolioSettingsSearchEntry) => void;
}) {
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
        Search settings
      </label>
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
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
          placeholder="Search settingsâ€¦"
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
          className="w-full rounded-full border border-neutral-200/90 bg-neutral-50/90 py-2 pl-9 pr-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-neutral-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
        />
      </div>
      {open && query.trim() ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-neutral-200 bg-white py-1 shadow-xl"
        >
          {suggestions.length === 0 ? (
            <li className="px-3.5 py-3 text-sm text-neutral-500">No matching settings</li>
          ) : (
            suggestions.map((item, index) => {
              const active = index === highlight;
              return (
                <li key={item.id} role="presentation">
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
                    <span className="text-sm font-semibold text-neutral-950">{item.label}</span>
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

function readStoredModalOpacity(): number {
  if (typeof window === 'undefined') return 100;
  const stored = window.localStorage.getItem(MODAL_OPACITY_STORAGE_KEY);
  if (!stored) return 100;
  const value = Number(stored);
  if (!Number.isFinite(value)) return 100;
  return Math.min(100, Math.max(35, value));
}

function isPortfolioSettingsSectionId(value: string): value is PortfolioSettingsSectionId {
  return PORTFOLIO_SETTINGS_SECTIONS.some((section) => section.id === value);
}

function readStoredActiveSection(): PortfolioSettingsSectionId {
  if (typeof window === 'undefined') return 'theme';
  const stored = window.sessionStorage.getItem(MODAL_SECTION_STORAGE_KEY);
  // Legacy: Infos / Why choose me / About settings nav removed.
  if (stored === 'about' || stored === 'infos' || stored === 'whyChooseMe') return 'hero';
  if (stored === 'info') return 'info';
  // Legacy: Skills settings nav was replaced by Tools.
  if (stored === 'skills') return 'tools';
  if (stored && isPortfolioSettingsSectionId(stored)) return stored;
  return 'theme';
}

function ModalPreviewTransparencyControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
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
        aria-label="Settings panel transparency"
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
}: {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
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
        title="Redo (Ctrl+Y)"
        aria-label="Redo"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
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
      Preview
    </button>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
      />
    </svg>
  );
}

export function PortfolioSettingsButton({
  onClick,
  shortcutHint,
  storageKey = 'portfolio-settings-btn',
}: {
  onClick: () => void;
  shortcutHint?: string | null;
  /** localStorage key for the dragged position (per portfolio). */
  storageKey?: string;
}) {
  const buttonSize = 44;
  const margin = 16;
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [ready, setReady] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
    moved: boolean;
  } | null>(null);

  const clampPos = useCallback((left: number, top: number) => {
    const maxLeft = Math.max(margin, window.innerWidth - buttonSize - margin);
    const maxTop = Math.max(margin, window.innerHeight - buttonSize - margin);
    return {
      left: Math.min(maxLeft, Math.max(margin, left)),
      top: Math.min(maxTop, Math.max(margin, top)),
    };
  }, []);

  const defaultPos = useCallback(() => {
    return clampPos(
      window.innerWidth - buttonSize - margin,
      margin + 72
    );
  }, [clampPos]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { left?: number; top?: number };
        if (typeof parsed.left === 'number' && typeof parsed.top === 'number') {
          setPos(clampPos(parsed.left, parsed.top));
          setReady(true);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    setPos(defaultPos());
    setReady(true);
  }, [storageKey, clampPos, defaultPos]);

  useEffect(() => {
    if (!ready || !pos) return;
    const onResize = () => setPos((current) => (current ? clampPos(current.left, current.top) : current));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [ready, pos, clampPos]);

  const persist = (next: { left: number; top: number }) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !pos) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originLeft: pos.left,
      originTop: pos.top,
      moved: false,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.moved = true;
    if (!drag.moved) return;
    setPos(clampPos(drag.originLeft + dx, drag.originTop + dy));
  };

  const endDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    if (drag.moved) {
      setPos((current) => {
        if (!current) return current;
        persist(current);
        return current;
      });
      return;
    }
    onClick();
  };

  if (!ready || !pos) return null;

  return createPortal(
    <button
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`pointer-events-auto fixed z-[220] inline-flex h-11 w-11 cursor-grab items-center justify-center text-neutral-700 transition hover:text-neutral-950 active:cursor-grabbing ${PORTFOLIO_FLOATING_CHROME}`}
      style={{ left: pos.left, top: pos.top }}
      aria-label={shortcutHint ? `Portfolio settings (${shortcutHint})` : 'Portfolio settings'}
      title={
        shortcutHint
          ? `Settings Â· ${shortcutHint} â€” drag to move`
          : 'Portfolio settings â€” drag to move'
      }
    >
      <SettingsIcon className="h-5 w-5" />
    </button>,
    document.body
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
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-4">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-neutral-900">{label}</span>
        {description ? <span className="mt-1 block text-sm text-neutral-500">{description}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-orange-600 focus:ring-orange-500"
      />
    </label>
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
    'mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200';

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

function GlobalColorField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (isValidProfileHexColor(next)) onChange(next);
          }}
          className="w-28 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-mono text-neutral-900"
          aria-label={`${label} hex`}
        />
        <span
          className="h-11 w-20 rounded-xl border border-neutral-200/80 shadow-inner"
          style={{ backgroundColor: value }}
          aria-hidden
        />
      </div>
    </div>
  );
}

/** Text color for Global section titles/subtitles â€” palette token or free hex. */
function GlobalTypographyTextColorField({
  typography,
  global,
  defaultColor,
  defaultColorToken,
  onChange,
}: {
  typography: PortfolioGlobalTitleTypography | PortfolioGlobalSubtitleTypography;
  global: PortfolioGlobalSettings;
  defaultColor: string;
  defaultColorToken: HeroPaletteTokenId;
  onChange: (
    partial: Partial<PortfolioGlobalTitleTypography | PortfolioGlobalSubtitleTypography>
  ) => void;
}) {
  const colorSource: PortfolioGlobalColorSource = typography.colorSource ?? 'manual';
  const colorToken = typography.colorToken ?? defaultColorToken;
  const activePalette = resolveActivePortfolioPalette(global);
  const resolved =
    colorSource === 'palette'
      ? resolveHeroPaletteColor(activePalette, colorToken)
      : typography.color || defaultColor;

  return (
    <div className="space-y-3">
      <OptionGrid
        label="Text color"
        options={PORTFOLIO_GLOBAL_COLOR_SOURCE_OPTIONS}
        value={colorSource}
        onChange={(nextSource) => {
          if (nextSource === 'palette') {
            const hex = resolveHeroPaletteColor(activePalette, colorToken);
            onChange({ colorSource: nextSource, colorToken, color: hex });
            return;
          }
          onChange({ colorSource: nextSource });
        }}
        columns={2}
      />

      {colorSource === 'palette' ? (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Palette token
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Follows the active Global theme (dark / light).
              </p>
            </div>
            <span
              className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-neutral-200"
              style={{ backgroundColor: resolved }}
              title={resolved}
              aria-hidden
            />
          </div>
          <select
            value={colorToken}
            onChange={(event) => {
              const nextToken = event.target.value as HeroPaletteTokenId;
              const hex = resolveHeroPaletteColor(activePalette, nextToken);
              onChange({ colorToken: nextToken, color: hex, colorSource: 'palette' });
            }}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
            aria-label="Text color palette token"
          >
            {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-neutral-500">
            Edit token hex under{' '}
            <span className="font-semibold text-neutral-700">Global â†’ Theme</span>
          </p>
        </div>
      ) : (
        <GlobalColorField
          label="Hex color"
          description="Manual color â€” independent from the Global theme palette."
          value={typography.color || defaultColor}
          onChange={(color) => onChange({ color, colorSource: 'manual' })}
        />
      )}
    </div>
  );
}

function GlobalHeaderFontMockups({
  value,
  onChange,
  selected = true,
  kind = 'title',
}: {
  value: PortfolioGlobalHeaderFont;
  onChange: (font: PortfolioGlobalHeaderFont) => void;
  /** When false, show cards but none highlighted as active (per-section mode). */
  selected?: boolean;
  kind?: 'title' | 'subtitle';
}) {
  const isTitle = kind === 'title';
  const subtitlePreview = 'A selection of recent work.';
  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-white p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          {isTitle ? 'Title font' : 'Subtitle font'}
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          {isTitle
            ? 'Clique une maquette pour appliquer une Google Font Ã  tous les titres de section.'
            : 'Clique une maquette pour appliquer une Google Font Ã  toutes les descriptions de section.'}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PORTFOLIO_GLOBAL_HEADER_FONT_OPTIONS.map((option) => {
          const isActive = selected && value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border px-3 py-3 text-left transition ${
                isActive
                  ? 'border-neutral-950 bg-neutral-950 text-white shadow-sm'
                  : 'border-neutral-200/80 bg-neutral-50 hover:border-neutral-400 hover:bg-white'
              }`}
            >
              <p
                className={`truncate leading-snug ${
                  isTitle ? 'text-[1.65rem] leading-none tracking-[-0.03em]' : 'text-sm tracking-[-0.02em]'
                } ${
                  option.value === 'display' || option.value === 'condensed' ? 'uppercase' : ''
                } ${isActive ? 'text-white' : 'text-neutral-950'}`}
                style={{ fontFamily: option.fontFamily }}
              >
                {isTitle ? option.previewText : subtitlePreview}
              </p>
              <p
                className={`mt-2 text-xs font-semibold ${
                  isActive ? 'text-white/90' : 'text-neutral-900'
                }`}
              >
                {option.label}
              </p>
              <p className={`mt-0.5 text-[11px] leading-snug ${isActive ? 'text-white/65' : 'text-neutral-500'}`}>
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GlobalSectionTypographySettings({
  global,
  onGlobalChange,
}: {
  global: PortfolioGlobalSettings;
  onGlobalChange: (patch: Partial<PortfolioGlobalSettings>) => void;
}) {
  const bodyFont = global.bodyFont ?? 'plusJakarta';

  return (
    <>
      <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
        <div>
          <p className="text-sm font-semibold text-neutral-950">Police principale</p>
          <p className="mt-1 text-sm text-neutral-500">
            Unique typeface du portfolio public â€” appliquÃ©e partout (hero, titres, cartes,
            contact, footerâ€¦). Les polices par section ont Ã©tÃ© retirÃ©es.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {PORTFOLIO_GLOBAL_BODY_FONT_OPTIONS.filter((option) => option.value !== 'default').map(
            (option) => {
              const active =
                bodyFont === option.value ||
                (option.value === 'geist' && bodyFont === 'default');
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    onGlobalChange({
                      bodyFont: option.value as PortfolioGlobalBodyFont,
                      bodyFontForceAll: true,
                    })
                  }
                  className={`rounded-2xl border px-3.5 py-3 text-left transition ${
                    active
                      ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                      : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                  }`}
                >
                  <p
                    className="text-base font-semibold text-neutral-950"
                    style={option.fontFamily ? { fontFamily: option.fontFamily } : undefined}
                  >
                    {option.previewText}
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-neutral-800">{option.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                    {option.description}
                  </p>
                </button>
              );
            }
          )}
        </div>
      </div>

      <GlobalHeaderTypographyBlock
        label="Section titles"
        typography={global.titleTypography}
        global={global}
        sizeOptions={PORTFOLIO_GLOBAL_TITLE_SIZE_OPTIONS}
        defaultColor={DEFAULT_GLOBAL_TITLE_COLOR}
        defaultHighlightColor={DEFAULT_GLOBAL_HIGHLIGHT_COLOR}
        defaultColorToken="texteFort"
        colorKind="title"
        hideFontPicker
        onChange={(titleTypography) =>
          onGlobalChange({ titleTypography: titleTypography as PortfolioGlobalTitleTypography })
        }
      />

      <GlobalHeaderTypographyBlock
        label="Section subtitles"
        typography={global.subtitleTypography}
        global={global}
        sizeOptions={PORTFOLIO_GLOBAL_SUBTITLE_SIZE_OPTIONS}
        defaultColor={DEFAULT_GLOBAL_SUBTITLE_COLOR}
        defaultHighlightColor="#fef3c7"
        defaultColorToken="texteMuted"
        colorKind="subtitle"
        hideFontPicker
        onChange={(subtitleTypography) =>
          onGlobalChange({
            subtitleTypography: subtitleTypography as PortfolioGlobalSubtitleTypography,
          })
        }
      />
    </>
  );
}

function GlobalHeaderTypographyBlock({
  label,
  typography,
  global,
  sizeOptions,
  defaultColor,
  defaultHighlightColor,
  defaultColorToken,
  colorKind,
  onChange,
  hideFontPicker = false,
}: {
  label: string;
  typography: PortfolioGlobalTitleTypography | PortfolioGlobalSubtitleTypography;
  global: PortfolioGlobalSettings;
  sizeOptions: { value: string; label: string; description: string }[];
  defaultColor: string;
  defaultHighlightColor: string;
  defaultColorToken: HeroPaletteTokenId;
  colorKind: 'title' | 'subtitle';
  onChange: (
    next: PortfolioGlobalTitleTypography | PortfolioGlobalSubtitleTypography
  ) => void;
  /** When true, font mockups / font grid are rendered outside this block. */
  hideFontPicker?: boolean;
}) {
  type Typography = PortfolioGlobalTitleTypography | PortfolioGlobalSubtitleTypography;
  const patch = (partial: Partial<Typography>) =>
    onChange({ ...typography, ...partial } as Typography);

  const globalActive = typography.scope === 'global';
  const isTitleBlock = label === 'Section titles';
  const selectedFont =
    PORTFOLIO_GLOBAL_HEADER_FONT_OPTIONS.find((option) => option.value === typography.font) ??
    PORTFOLIO_GLOBAL_HEADER_FONT_OPTIONS[0];
  const previewColor = resolveGlobalTypographyTextColor(global, colorKind);

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
        <p className="mt-1 text-sm text-neutral-500">
          {isTitleBlock
            ? 'Color, size, weight, underline, highlight, and emphasis for every section title. Font family comes from Police principale.'
            : 'Color, size, underline, highlight, and emphasis for every section description. Font family comes from Police principale.'}
        </p>
      </div>

      <OptionGrid
        label="Style source"
        options={PORTFOLIO_GLOBAL_TYPOGRAPHY_SCOPE_OPTIONS}
        value={typography.scope}
        onChange={(scope) => patch({ scope })}
        columns={2}
      />

      {isTitleBlock && !hideFontPicker ? (
        <GlobalHeaderFontMockups
          kind="title"
          value={typography.font}
          selected={globalActive}
          onChange={(font) => patch({ font, scope: 'global' })}
        />
      ) : null}

      {globalActive ? (
        <>
          {!isTitleBlock && !hideFontPicker ? (
            <OptionGrid
              label="Font"
              options={PORTFOLIO_GLOBAL_HEADER_FONT_OPTIONS}
              value={typography.font}
              onChange={(font) => patch({ font })}
              columns={3}
            />
          ) : null}

          <OptionGrid
            label="Size"
            options={sizeOptions}
            value={typography.size}
            onChange={(size) => patch({ size: size as Typography['size'] })}
            columns={sizeOptions.length === 4 ? 2 : 3}
          />

          {isTitleBlock ? (
            <OptionGrid
              label="Font weight"
              options={PORTFOLIO_GLOBAL_TITLE_FONT_WEIGHT_OPTIONS}
              value={
                'weight' in typography && typography.weight
                  ? typography.weight
                  : 'bold'
              }
              onChange={(weight) =>
                patch({ weight } as Partial<PortfolioGlobalTitleTypography>)
              }
              columns={3}
            />
          ) : null}

          <GlobalTypographyTextColorField
            typography={typography}
            global={global}
            defaultColor={defaultColor}
            defaultColorToken={defaultColorToken}
            onChange={patch}
          />

          <OptionGrid
            label="Decoration"
            options={PORTFOLIO_GLOBAL_TEXT_DECORATION_OPTIONS}
            value={typography.decoration}
            onChange={(decoration) => patch({ decoration })}
            columns={3}
          />

          {typography.decoration === 'highlight' ? (
            <GlobalColorField
              label="Highlight color"
              description="Marker-style background behind the text."
              value={typography.highlightColor}
              onChange={(highlightColor) => patch({ highlightColor })}
            />
          ) : null}

          <ToggleRow
            label="Italic"
            description="Apply italic styling to the text."
            checked={typography.italic}
            onChange={(italic) => patch({ italic })}
          />

          {typography.font !== 'display' && typography.font !== 'condensed' ? (
            <ToggleRow
              label="Uppercase"
              description="Transform text to all caps."
              checked={typography.uppercase}
              onChange={(uppercase) => patch({ uppercase })}
            />
          ) : null}

          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">Preview</p>
            <p
              className={`mt-2 tracking-[-0.04em] ${
                typography.font === 'display' || typography.font === 'condensed' ? 'uppercase' : ''
              } ${typography.italic ? 'italic' : ''} ${
                typography.uppercase &&
                typography.font !== 'display' &&
                typography.font !== 'condensed'
                  ? 'uppercase'
                  : ''
              }`}
              style={{
                color: previewColor,
                fontFamily: selectedFont.fontFamily,
                fontWeight: isTitleBlock
                  ? globalTitleFontWeightValue(
                      'weight' in typography && typography.weight
                        ? typography.weight
                        : 'bold'
                    )
                  : typography.font === 'display'
                    ? 400
                    : 500,
                fontSize:
                  typography.size === 'xl'
                    ? '2rem'
                    : typography.size === 'lg'
                      ? '1.5rem'
                      : typography.size === 'sm'
                        ? '0.875rem'
                        : '1.125rem',
              }}
            >
              <span
                style={
                  typography.decoration === 'underline'
                    ? {
                        textDecoration: 'underline',
                        textDecorationThickness: '2px',
                        textUnderlineOffset: '0.18em',
                      }
                    : typography.decoration === 'highlight'
                      ? {
                          display: 'inline',
                          backgroundImage: `linear-gradient(transparent 58%, ${typography.highlightColor || defaultHighlightColor}8c 58%)`,
                          backgroundRepeat: 'no-repeat',
                          boxDecorationBreak: 'clone',
                          WebkitBoxDecorationBreak: 'clone',
                          padding: '0 0.08em',
                          margin: '0 -0.08em',
                        }
                      : undefined
                }
              >
                {isTitleBlock ? 'PROJECTS' : 'A selection of recent work.'}
              </span>
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}

function GlobalTitleChromeBlock({
  chrome,
  onChange,
}: {
  chrome: PortfolioGlobalTitleChrome;
  onChange: (next: PortfolioGlobalTitleChrome) => void;
}) {
  const patch = (partial: Partial<PortfolioGlobalTitleChrome>) => onChange({ ...chrome, ...partial });
  const globalActive = chrome.scope === 'global';

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Section title box</p>
        <p className="mt-1 text-sm text-neutral-500">
          Background, border, and padding around section titles.
        </p>
      </div>

      <OptionGrid
        label="Style source"
        options={PORTFOLIO_GLOBAL_TYPOGRAPHY_SCOPE_OPTIONS}
        value={chrome.scope}
        onChange={(scope) => patch({ scope })}
        columns={2}
      />

      {globalActive ? (
        <>
          <ToggleRow
            label="Title background"
            description="Fill a solid color behind the title text."
            checked={chrome.backgroundEnabled}
            onChange={(backgroundEnabled) => patch({ backgroundEnabled })}
          />
          {chrome.backgroundEnabled ? (
            <GlobalColorField
              label="Background color"
              value={chrome.backgroundColor}
              onChange={(backgroundColor) => patch({ backgroundColor })}
            />
          ) : null}

          <ToggleRow
            label="Title border"
            description="Draw a stroke around the title box."
            checked={chrome.borderEnabled}
            onChange={(borderEnabled) => patch({ borderEnabled })}
          />
          {chrome.borderEnabled ? (
            <>
              <GlobalColorField
                label="Border color"
                value={chrome.borderColor}
                onChange={(borderColor) => patch({ borderColor })}
              />
              <OptionGrid
                label="Border width"
                options={PORTFOLIO_GLOBAL_TITLE_CHROME_BORDER_WIDTH_OPTIONS}
                value={chrome.borderWidth}
                onChange={(borderWidth) => patch({ borderWidth })}
                columns={2}
              />
            </>
          ) : null}

          <OptionGrid
            label="Title padding"
            options={PORTFOLIO_GLOBAL_TITLE_CHROME_PADDING_OPTIONS}
            value={chrome.padding}
            onChange={(padding) => patch({ padding })}
            columns={2}
          />

          <OptionGrid
            label="Corner radius"
            options={PORTFOLIO_GLOBAL_TITLE_CHROME_RADIUS_OPTIONS}
            value={chrome.borderRadius}
            onChange={(borderRadius) => patch({ borderRadius })}
            columns={3}
          />
        </>
      ) : null}
    </div>
  );
}

function GlobalSplitTitleFrameBlock({
  frame,
  onChange,
}: {
  frame: PortfolioGlobalSplitTitleFrame;
  onChange: (next: PortfolioGlobalSplitTitleFrame) => void;
}) {
  const sides = frame.borderSides ?? DEFAULT_GLOBAL_SPLIT_TITLE_FRAME_BORDER_SIDES;
  const patch = (partial: Partial<PortfolioGlobalSplitTitleFrame>) =>
    onChange({
      ...DEFAULT_GLOBAL_SPLIT_TITLE_FRAME,
      ...frame,
      borderSides: { ...sides },
      ...partial,
    });

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Split title frame
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Cadre autour du titre, de la description et du bouton Ã©ventuel dans la colonne gauche.
        </p>
      </div>

      <ToggleRow
        label="Enable title frame"
        description="Show a compact card around the title block (not a full-height column)."
        checked={frame.enabled}
        onChange={(enabled) => patch({ enabled })}
      />

      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            Horizontal offset
          </p>
          <span className="tabular-nums text-sm font-semibold text-neutral-700">
            {clampGlobalSplitTitleOffsetX(frame.offsetX, 0)}px
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          DÃ©cale le titre Ã  gauche (âˆ’) ou Ã  droite (+) dans la colonne split pour le centrer prÃ©cisÃ©ment.
        </p>
        <input
          type="range"
          min={GLOBAL_SPLIT_TITLE_OFFSET_X_MIN}
          max={GLOBAL_SPLIT_TITLE_OFFSET_X_MAX}
          step={1}
          value={clampGlobalSplitTitleOffsetX(frame.offsetX, 0)}
          onChange={(event) =>
            patch({ offsetX: clampGlobalSplitTitleOffsetX(Number(event.target.value), 0) })
          }
          className="mt-3 w-full accent-neutral-900"
        />
        <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
          <span>Left</span>
          <button
            type="button"
            className="font-semibold text-neutral-600 underline-offset-2 hover:underline"
            onClick={() => patch({ offsetX: 0 })}
          >
            Reset
          </button>
          <span>Right</span>
        </div>
      </div>

      {frame.enabled ? (
        <>
          <ToggleRow
            label="Background"
            description="Solid fill behind the title block."
            checked={frame.backgroundEnabled}
            onChange={(backgroundEnabled) => patch({ backgroundEnabled })}
          />
          {frame.backgroundEnabled ? (
            <GlobalColorField
              label="Background color"
              value={frame.backgroundColor}
              onChange={(backgroundColor) => patch({ backgroundColor })}
            />
          ) : null}

          <ToggleRow
            label="Border"
            description="Solid stroke on selected sides only."
            checked={frame.borderEnabled}
            onChange={(borderEnabled) => patch({ borderEnabled })}
          />
          {frame.borderEnabled ? (
            <>
              <GlobalColorField
                label="Border color"
                value={frame.borderColor}
                onChange={(borderColor) => patch({ borderColor })}
              />
              <OptionGrid
                label="Border width"
                options={PORTFOLIO_GLOBAL_TITLE_CHROME_BORDER_WIDTH_OPTIONS}
                value={frame.borderWidth}
                onChange={(borderWidth) => patch({ borderWidth })}
                columns={2}
              />
            </>
          ) : null}

          {(frame.borderEnabled ||
            frame.borderDoubleEnabled ||
            (frame.borderBlur ?? 'none') !== 'none') && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Border sides
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Styles (trait, doublure, blur) sâ€™appliquent uniquement aux cÃ´tÃ©s cochÃ©s.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PORTFOLIO_GLOBAL_SPLIT_TITLE_FRAME_BORDER_SIDE_OPTIONS.map((side) => {
                  const checked = sides[side.key];
                  return (
                    <button
                      key={side.key}
                      type="button"
                      onClick={() =>
                        patch({
                          borderSides: { ...sides, [side.key]: !checked },
                        })
                      }
                      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                        checked
                          ? 'border-neutral-950 bg-neutral-950 text-white'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      {side.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <ToggleRow
            label="Double border (doublure)"
            description="Second border line on selected sides, with adjustable gap."
            checked={frame.borderDoubleEnabled ?? false}
            onChange={(borderDoubleEnabled) => patch({ borderDoubleEnabled })}
          />
          {frame.borderDoubleEnabled ? (
            <>
              <GlobalColorField
                label="Doublure color"
                value={frame.borderDoubleColor ?? DEFAULT_GLOBAL_SPLIT_TITLE_FRAME.borderDoubleColor}
                onChange={(borderDoubleColor) => patch({ borderDoubleColor })}
              />
              <OptionGrid
                label="Space between borders"
                options={PORTFOLIO_GLOBAL_SPLIT_TITLE_FRAME_BORDER_DOUBLE_GAP_OPTIONS}
                value={frame.borderDoubleGap ?? 'standard'}
                onChange={(borderDoubleGap) => patch({ borderDoubleGap })}
                columns={3}
              />
            </>
          ) : null}

          <OptionGrid
            label="Outer border blur"
            options={PORTFOLIO_GLOBAL_SPLIT_TITLE_FRAME_BORDER_BLUR_OPTIONS}
            value={frame.borderBlur ?? 'none'}
            onChange={(borderBlur) => patch({ borderBlur })}
            columns={2}
          />

          <OptionGrid
            label="Padding"
            options={PORTFOLIO_GLOBAL_TITLE_CHROME_PADDING_OPTIONS}
            value={frame.padding}
            onChange={(padding) => patch({ padding })}
            columns={2}
          />

          <OptionGrid
            label="Corner radius"
            options={PORTFOLIO_GLOBAL_TITLE_CHROME_RADIUS_OPTIONS}
            value={frame.borderRadius}
            onChange={(borderRadius) => patch({ borderRadius })}
            columns={3}
          />
        </>
      ) : null}
    </div>
  );
}

function GlobalOrientationTargets({
  targets,
  onChange,
}: {
  targets: PortfolioGlobalTitleOrientationTargets;
  onChange: (targets: PortfolioGlobalTitleOrientationTargets) => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
        Vertical title sections
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        Choose which section titles use the vertical floating rail. Only selected sections are affected.
      </p>
      <div className="mt-4 space-y-2">
        {PORTFOLIO_NAV_SECTION_META.map((section) => {
          const checked = targets[section.key];
          return (
            <label
              key={section.key}
              className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-neutral-200/80 bg-white px-4 py-3"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-neutral-900">{section.title}</span>
                <span className="mt-0.5 block text-xs text-neutral-500">{section.description}</span>
              </span>
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) =>
                  onChange({ ...targets, [section.key]: event.target.checked })
                }
                className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-orange-600 focus:ring-orange-500"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}

function MotionProfileSketch({ profile }: { profile: PortfolioGlobalMotionProfile }) {
  if (profile === 'none') {
    return (
      <div className="flex h-8 items-end gap-1" aria-hidden>
        {[1, 1, 1, 1].map((_, i) => (
          <span key={i} className="h-full w-2 rounded-sm bg-neutral-300" />
        ))}
      </div>
    );
  }
  if (profile === 'editorial') {
    return (
      <div className="flex h-8 items-end gap-1" aria-hidden>
        {[0.45, 0.65, 0.85, 1].map((h, i) => (
          <span
            key={i}
            className="w-2 rounded-sm bg-sky-400/80"
            style={{ height: `${h * 100}%`, opacity: 0.45 + i * 0.15 }}
          />
        ))}
      </div>
    );
  }
  if (profile === 'dynamic') {
    return (
      <div className="flex h-8 items-end gap-1" aria-hidden>
        {[0.55, 0.75, 0.95, 0.7].map((h, i) => (
          <span
            key={i}
            className="w-2 rounded-sm bg-orange-400 shadow-[0_6px_10px_-6px_rgba(249,115,22,0.8)]"
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="flex h-8 items-end gap-1.5" aria-hidden>
      {[0.35, 0.55, 0.78, 1].map((h, i) => (
        <span
          key={i}
          className="w-2.5 rounded-sm bg-violet-500/80"
          style={{ height: `${h * 100}%`, opacity: 0.35 + i * 0.2 }}
        />
      ))}
    </div>
  );
}

function GlobalSectionRevealBlock({
  motionProfile,
  motionTiming,
  onChange,
}: {
  motionProfile: PortfolioGlobalSettings['motionProfile'];
  motionTiming: PortfolioGlobalSettings['motionTiming'];
  onChange: (patch: Partial<PortfolioGlobalSettings>) => void;
}) {
  const timing = resolveMotionTiming(motionProfile, motionTiming);
  const active = isMotionProfileActive(motionProfile);
  const selectedMeta = PORTFOLIO_GLOBAL_MOTION_PROFILE_OPTIONS.find(
    (option) => option.value === motionProfile
  );

  const patchTiming = (partial: Partial<PortfolioMotionTiming>) => {
    onChange({
      motionTiming: {
        ...timing,
        ...partial,
      },
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Profil de motion
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Chaque profil a une signature diffÃ©rente. Affinez ensuite dÃ©lai, durÃ©e, dÃ©calage et
          distance.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {PORTFOLIO_GLOBAL_MOTION_PROFILE_OPTIONS.map((option) => {
          const selected = option.value === motionProfile;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onChange({
                  motionProfile: option.value,
                  motionTiming: defaultMotionTimingForProfile(option.value),
                })
              }
              className={`rounded-2xl border px-4 py-3.5 text-left transition ${
                selected
                  ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                  : 'border-neutral-200/80 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                    {option.description}
                  </p>
                </div>
                <MotionProfileSketch profile={option.value} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {option.traits.map((trait) => (
                  <span
                    key={trait}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      selected
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {selectedMeta ? (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600">
          <span className="font-semibold text-neutral-800">{selectedMeta.label} Â· </span>
          {motionProfileSupportsHover(motionProfile)
            ? `${timing.duration.toFixed(2).replace('.', ',')}s Â· stagger ${Math.round(timing.stagger * 1000)}ms Â· ${clampMotionTimingDistance(timing.distance)}px Â· ${formatMotionHoverRecipe(timing)}`
            : selectedMeta.recipe}
        </p>
      ) : null}

      {active ? (
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-neutral-950">RÃ©glages de timing</p>
              <p className="mt-1 text-sm text-neutral-500">
                AppliquÃ©s aux cartes / blocs au scroll. Changer de profil recharge les valeurs
                recommandÃ©es.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onChange({ motionTiming: defaultMotionTimingForProfile(motionProfile) })
              }
              className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Reset profil
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                DÃ©lai de base
              </p>
              <span className="tabular-nums text-sm font-semibold text-neutral-700">
                {formatMotionSeconds(timing.delay)}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">Attente avant la premiÃ¨re carte.</p>
            <input
              type="range"
              min={MOTION_TIMING_DELAY_MIN}
              max={MOTION_TIMING_DELAY_MAX}
              step={0.02}
              value={clampMotionTimingDelay(timing.delay)}
              onChange={(event) =>
                patchTiming({ delay: clampMotionTimingDelay(Number(event.target.value)) })
              }
              className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
              aria-label="DÃ©lai de base"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                DurÃ©e
              </p>
              <span className="tabular-nums text-sm font-semibold text-neutral-700">
                {formatMotionSeconds(timing.duration)}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">Longueur de lâ€™animation dâ€™entrÃ©e.</p>
            <input
              type="range"
              min={MOTION_TIMING_DURATION_MIN}
              max={MOTION_TIMING_DURATION_MAX}
              step={0.05}
              value={clampMotionTimingDuration(timing.duration)}
              onChange={(event) =>
                patchTiming({ duration: clampMotionTimingDuration(Number(event.target.value)) })
              }
              className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
              aria-label="DurÃ©e dâ€™animation"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                DÃ©calage (stagger)
              </p>
              <span className="tabular-nums text-sm font-semibold text-neutral-700">
                {formatMotionSeconds(timing.stagger)}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Ã‰cart entre chaque carte (effet cascade).
            </p>
            <input
              type="range"
              min={MOTION_TIMING_STAGGER_MIN}
              max={MOTION_TIMING_STAGGER_MAX}
              step={0.005}
              value={clampMotionTimingStagger(timing.stagger)}
              onChange={(event) =>
                patchTiming({ stagger: clampMotionTimingStagger(Number(event.target.value)) })
              }
              className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
              aria-label="DÃ©calage stagger"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Distance
              </p>
              <span className="tabular-nums text-sm font-semibold text-neutral-700">
                {clampMotionTimingDistance(timing.distance)}px
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              DÃ©placement vertical au dÃ©marrage de lâ€™entrÃ©e.
            </p>
            <input
              type="range"
              min={MOTION_TIMING_DISTANCE_MIN}
              max={MOTION_TIMING_DISTANCE_MAX}
              step={1}
              value={clampMotionTimingDistance(timing.distance)}
              onChange={(event) =>
                patchTiming({ distance: clampMotionTimingDistance(Number(event.target.value)) })
              }
              className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
              aria-label="Distance dâ€™entrÃ©e"
            />
          </div>

          {motionProfileSupportsHover(motionProfile) ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">Survol (lift & ombre)</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Effet au survol des cartes â€” lift vertical, taille et couleur de lâ€™ombrage.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Lift au survol
                  </p>
                  <span className="tabular-nums text-sm font-semibold text-neutral-700">
                    âˆ’{clampMotionHoverLift(timing.hoverLift)}px
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  DÃ©calage vertical quand la souris passe sur une carte.
                </p>
                <input
                  type="range"
                  min={MOTION_TIMING_HOVER_LIFT_MIN}
                  max={MOTION_TIMING_HOVER_LIFT_MAX}
                  step={1}
                  value={clampMotionHoverLift(timing.hoverLift)}
                  onChange={(event) =>
                    patchTiming({ hoverLift: clampMotionHoverLift(Number(event.target.value)) })
                  }
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                  aria-label="Lift au survol"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Taille de lâ€™ombre
                  </p>
                  <span className="tabular-nums text-sm font-semibold text-neutral-700">
                    {clampMotionHoverShadowSize(timing.hoverShadowSize)}px
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  Flou / ampleur de lâ€™ombre sous la carte (0 = pas dâ€™ombre).
                </p>
                <input
                  type="range"
                  min={MOTION_TIMING_HOVER_SHADOW_SIZE_MIN}
                  max={MOTION_TIMING_HOVER_SHADOW_SIZE_MAX}
                  step={1}
                  value={clampMotionHoverShadowSize(timing.hoverShadowSize)}
                  onChange={(event) =>
                    patchTiming({
                      hoverShadowSize: clampMotionHoverShadowSize(Number(event.target.value)),
                    })
                  }
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                  aria-label="Taille de lâ€™ombre au survol"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    OpacitÃ© de lâ€™ombre
                  </p>
                  <span className="tabular-nums text-sm font-semibold text-neutral-700">
                    {clampMotionHoverShadowOpacity(timing.hoverShadowOpacity)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={MOTION_TIMING_HOVER_SHADOW_OPACITY_MIN}
                  max={MOTION_TIMING_HOVER_SHADOW_OPACITY_MAX}
                  step={1}
                  value={clampMotionHoverShadowOpacity(timing.hoverShadowOpacity)}
                  onChange={(event) =>
                    patchTiming({
                      hoverShadowOpacity: clampMotionHoverShadowOpacity(Number(event.target.value)),
                    })
                  }
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                  aria-label="OpacitÃ© de lâ€™ombre au survol"
                />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Couleur de lâ€™ombre
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input
                    type="color"
                    value={timing.hoverShadowColor}
                    onChange={(event) => patchTiming({ hoverShadowColor: event.target.value })}
                    className="h-11 w-14 cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
                    aria-label="Couleur de lâ€™ombre au survol"
                  />
                  <input
                    type="text"
                    value={timing.hoverShadowColor}
                    onChange={(event) => {
                      const next = event.target.value.trim();
                      if (isValidProfileHexColor(next)) patchTiming({ hoverShadowColor: next });
                    }}
                    className="w-28 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-mono text-neutral-900"
                  />
                  <span
                    className="h-11 w-20 rounded-xl border border-neutral-200/80 shadow-inner"
                    style={{ backgroundColor: timing.hoverShadowColor }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-neutral-500">
          Les cartes apparaissent sans animation. Choisissez Ã‰ditorial, Dynamique ou CinÃ©matique
          pour activer les rÃ©glages de timing.
        </p>
      )}

      <p className="text-sm text-neutral-500">
        Les titres de section et la navigation sticky ne sont pas animÃ©s â€” plus stable avec vos
        personnalisations.
      </p>
    </div>
  );
}

function GlobalSectionOrderBlock({
  sectionOrder,
  servicesSectionOrganization,
  onChange,
}: {
  sectionOrder: PortfolioNavSectionKey[];
  servicesSectionOrganization: PortfolioServicesSectionOrganization;
  onChange: (sectionOrder: PortfolioNavSectionKey[]) => void;
}) {
  const orderedSections = resolvePortfolioContentSectionOrder(sectionOrder, servicesSectionOrganization);
  const sectionLabels = Object.fromEntries(
    PORTFOLIO_NAV_SECTION_META.map((section) => [section.key, section.title])
  ) as Record<PortfolioNavSectionKey, string>;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Section display order</p>
      <p className="mt-2 text-sm text-neutral-500">
        Hero stays at the top and Footer at the bottom. Reorder the content sections in between.
      </p>
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-200/70 text-neutral-500">
            <LockIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-neutral-700">Hero</span>
            <span className="mt-0.5 block text-xs text-neutral-500">Always first</span>
          </span>
        </div>

        {orderedSections.map((sectionKey, index) => {
          const label = sectionLabels[sectionKey] ?? sectionKey;
          const canMoveUp = index > 0;
          const canMoveDown = index < orderedSections.length - 1;

          return (
            <div
              key={sectionKey}
              className="flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white px-4 py-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs font-bold tabular-nums text-neutral-500">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-neutral-900">{label}</span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onChange(moveSectionInOrder(orderedSections, sectionKey, 'up'))}
                  disabled={!canMoveUp}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label={`Move ${label} up`}
                >
                  <ChevronUpIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(moveSectionInOrder(orderedSections, sectionKey, 'down'))}
                  disabled={!canMoveDown}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label={`Move ${label} down`}
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        <div className="flex items-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-200/70 text-neutral-500">
            <LockIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-neutral-700">Footer</span>
            <span className="mt-0.5 block text-xs text-neutral-500">Always last</span>
          </span>
        </div>
      </div>
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

function GlobalSettingsPanel({
  themeId,
  customThemes,
  settings,
  global,
  servicesSectionOrganization,
  onThemeChange,
  onGlobalChange,
  onColorModeChange,
  onGlobalPaletteChange,
  onGlobalPalettePairChange,
  onSaveCustomTheme,
  onRenameCustomTheme,
  onDuplicateTheme,
  onResetBuiltinTheme,
  onDeleteCustomTheme,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  themeId: PortfolioThemeId;
  customThemes: PortfolioCustomTheme[];
  settings: PortfolioSettings;
  global: PortfolioGlobalSettings;
  servicesSectionOrganization: PortfolioServicesSectionOrganization;
  onThemeChange: (themeId: PortfolioThemeId) => void;
  onGlobalChange: (patch: PortfolioGlobalSettingsPatch) => void;
  onColorModeChange: (mode: PortfolioColorMode) => void;
  onGlobalPaletteChange: (patch: Partial<PortfolioHeroPalette>) => void;
  onGlobalPalettePairChange: (
    paletteDark: PortfolioHeroPalette,
    paletteLight?: PortfolioHeroPalette,
    family?: 'indigo' | 'classic' | 'verdant' | 'vive' | 'safran' | 'citron' | 'rouge' | 'ecarlate' | 'ardoise' | 'custom'
  ) => void;
  onSaveCustomTheme: (themeId: string, name?: string) => boolean;
  onRenameCustomTheme: (themeId: string, name: string) => boolean;
  onDuplicateTheme: (themeId: PortfolioThemeId) => void;
  onResetBuiltinTheme: (themeId: PortfolioBuiltinThemeId) => void;
  onDeleteCustomTheme: (themeId: string) => void;
  subSection?: GlobalSettingsSubSection;
  onSubSectionChange?: (value: GlobalSettingsSubSection) => void;
}) {
  const [uncontrolledSubSection, setUncontrolledSubSection] =
    useState<GlobalSettingsSubSection>('theme');
  const subSection = controlledSubSection ?? uncontrolledSubSection;
  const setSubSection = (value: GlobalSettingsSubSection) => {
    onSubSectionChange?.(value);
    if (controlledSubSection === undefined) setUncontrolledSubSection(value);
  };
  const activeMeta =
    GLOBAL_SETTINGS_SUB_SECTIONS.find((section) => section.id === subSection) ??
    GLOBAL_SETTINGS_SUB_SECTIONS[0];
  const activePalette = resolveActivePortfolioPalette(global);
  const activeMode = (global.colorMode ?? 'dark') === 'light' ? 'light' : 'dark';
  const activeFamily = inferPaletteFamily(global);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-neutral-200/80 pb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-neutral-950">{activeMeta.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-500">{activeMeta.description}</p>
        </div>
        <div className="relative w-full min-w-0 sm:w-auto sm:max-w-xs sm:shrink-0">
          <label htmlFor="global-settings-subsection" className="sr-only">
            Global settings section
          </label>
          <select
            id="global-settings-subsection"
            value={subSection}
            onChange={(event) => setSubSection(event.target.value as GlobalSettingsSubSection)}
            className="min-h-11 w-full appearance-none rounded-full border border-neutral-300 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-neutral-900 shadow-sm transition hover:border-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          >
            {GLOBAL_SETTINGS_SUB_SECTIONS.map((section) => (
              <option key={section.id} value={section.id}>
                {section.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <nav className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:hidden" aria-label="Global subsections">
        {GLOBAL_SETTINGS_SUB_SECTIONS.map((section) => {
          const active = section.id === subSection;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setSubSection(section.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80'
              }`}
            >
              {section.label.split('&')[0].trim()}
            </button>
          );
        })}
      </nav>

      <GlobalSettingsGuideMockup section={subSection} />
      <GlobalSettingsTip>{activeMeta.tip}</GlobalSettingsTip>

      {subSection === 'theme' ? (
        <div className="space-y-5">
          <ToggleRow
            label="Light mode"
            description="Off = dark half of the selected palette pair. On = light half of the same pair (Indigo, Classic, Verdant, Vive, Safran, Citron, Rouge, Ã‰carlate, or Ardoise stay in their own pair)."
            checked={activeMode === 'light'}
            onChange={(light) => onColorModeChange(light ? 'light' : 'dark')}
          />

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Site color palette
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Pick one coupled pair below. Light mode only flips sombre â†” clair inside that pair â€”
                it never jumps to another family. Token edits update the{' '}
                <span className="font-semibold text-neutral-800">
                  {activeMode === 'light' ? 'light' : 'dark'}
                </span>{' '}
                side and apply to Hero, Nav, and every section that follows the global palette.
              </p>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Palette pairs
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  {
                    id: 'indigo' as const,
                    label: 'Indigo / Ambre',
                    description:
                      'Pair: sombre #6366F1 / #F59E0B sur #0F172A Â· clair #4338CA / orange #EA580C sur #F8FAFC.',
                    dark: INDIGO_DARK_HERO_PALETTE,
                    light: INDIGO_LIGHT_HERO_PALETTE,
                    darkClass: 'border-slate-600 bg-[#0F172A] hover:border-indigo-400',
                    labelClass: 'text-[#F8FAFC]',
                    descClass: 'text-[#94A3B8]',
                    swatchBorder: 'border-white/20',
                  },
                  {
                    id: 'classic' as const,
                    label: 'Classic orange / teal',
                    description:
                      'Pair: sombre #e2572e / #22c48f sur #0F172A Â· clair #c2410c / #00875f sur #F8FAFC (slate).',
                    dark: DEFAULT_HERO_PALETTE,
                    light: LIGHT_HERO_PALETTE,
                    darkClass: 'border-slate-600 bg-[#0F172A] hover:border-orange-400',
                    labelClass: 'text-[#FAFAFA]',
                    descClass: 'text-[#94A3B8]',
                    swatchBorder: 'border-white/20',
                  },
                  {
                    id: 'verdant' as const,
                    label: 'Verdant / Rose',
                    description:
                      'Pair: clair vert #2A9608 / rubis #BE123C sur #F8FAFC Â· sombre lime #43E00B / coral sur #020617.',
                    dark: VERDANT_DARK_HERO_PALETTE,
                    light: VERDANT_LIGHT_HERO_PALETTE,
                    darkClass: 'border-slate-700/80 bg-[#020617] hover:border-lime-400',
                    labelClass: 'text-[#F8FAFC]',
                    descClass: 'text-[#94A3B8]',
                    swatchBorder: 'border-white/20',
                  },
                  {
                    id: 'vive' as const,
                    label: 'Vive â€” jaune / violet',
                    description:
                      'Pair: fond #FEE685 + violet #6C1BB9 / magenta #D01C82, neutre blanc + Zinc. Light mode stays in this pair.',
                    dark: VIVE_DARK_HERO_PALETTE,
                    light: VIVE_LIGHT_HERO_PALETTE,
                    darkClass: 'border-yellow-700/60 bg-[#12100A] hover:border-yellow-400',
                    labelClass: 'text-[#FEE685]',
                    descClass: 'text-[#C9B56E]',
                    swatchBorder: 'border-white/20',
                  },
                  {
                    id: 'safran' as const,
                    label: 'Safran â€” jaune / violet / Ã©meraude',
                    description:
                      'Pair: fond #FCE96A + violet #3D2B84 / Ã©meraude #0E7C6B, neutre blanc + Stone. Sombre: jaune #FCE96A / Ã©meraude sur #0C0A09.',
                    dark: SAFRAN_DARK_HERO_PALETTE,
                    light: SAFRAN_LIGHT_HERO_PALETTE,
                    darkClass: 'border-stone-700/50 bg-[#0C0A09] hover:border-[#FCE96A]',
                    labelClass: 'text-[#FCE96A]',
                    descClass: 'text-[#A8A29E]',
                    swatchBorder: 'border-white/15',
                  },
                  {
                    id: 'citron' as const,
                    label: 'Citron â€” vert-citron / violet / bleu',
                    description:
                      'Pair: fond #C8E01A + violet #4C1D6B / bleu #2563EB, neutres slate. Sombre: violet #A78BFA / orange #F0985A sur #0F172A.',
                    dark: CITRON_DARK_HERO_PALETTE,
                    light: CITRON_LIGHT_HERO_PALETTE,
                    darkClass: 'border-slate-700/60 bg-[#0F172A] hover:border-[#C8E01A]',
                    labelClass: 'text-[#C8E01A]',
                    descClass: 'text-[#94A3B8]',
                    swatchBorder: 'border-white/15',
                  },
                  {
                    id: 'rouge' as const,
                    label: 'Rouge / Cyan',
                    description:
                      'Pair: clair #DC2626 / #0EA5E9 sur #F4F4F5 Â· sombre #EF4444 / #38BDF8 sur #020202 (Cyber-Rouge).',
                    dark: ROUGE_DARK_HERO_PALETTE,
                    light: ROUGE_LIGHT_HERO_PALETTE,
                    darkClass: 'border-zinc-700 bg-[#020202] hover:border-red-400',
                    labelClass: 'text-[#FAFAFA]',
                    descClass: 'text-[#A1A1AA]',
                    swatchBorder: 'border-white/15',
                  },
                  {
                    id: 'ecarlate' as const,
                    label: 'Ã‰carlate / Ã‰meraude',
                    description:
                      'Pair: clair #DF1C1C / #10B981 sur #FFFFFF Â· sombre #FF3333 / #34D399 sur #000000.',
                    dark: ECARLATE_DARK_HERO_PALETTE,
                    light: ECARLATE_LIGHT_HERO_PALETTE,
                    darkClass: 'border-neutral-700 bg-[#000000] hover:border-red-400',
                    labelClass: 'text-[#F5F5F5]',
                    descClass: 'text-[#A3A3A3]',
                    swatchBorder: 'border-white/15',
                  },
                  {
                    id: 'ardoise' as const,
                    label: 'Ardoise â€” rouge / bleu',
                    description:
                      'Pair: clair #EF4444 / #2563EB sur #D4DBE7 Â· sombre #F87171 / #60A5FA sur #030712.',
                    dark: ARDOISE_DARK_HERO_PALETTE,
                    light: ARDOISE_LIGHT_HERO_PALETTE,
                    darkClass: 'border-slate-700 bg-[#030712] hover:border-red-400',
                    labelClass: 'text-[#F9FAFB]',
                    descClass: 'text-[#9CA3AF]',
                    swatchBorder: 'border-white/15',
                  },
                ] as const
              ).map((family) => {
                const active = activeFamily === family.id;
                return (
                  <button
                    key={family.id}
                    type="button"
                    onClick={() =>
                      onGlobalPalettePairChange(family.dark, family.light, family.id)
                    }
                    className={`rounded-2xl border px-4 py-3 text-left transition ${family.darkClass} ${
                      active ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                    }`}
                  >
                    <span className={`text-sm font-bold ${family.labelClass}`}>{family.label}</span>
                    <span className={`mt-1 block text-xs ${family.descClass}`}>
                      {family.description}
                    </span>
                    <span className="mt-2 flex gap-1.5">
                      {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
                        <span
                          key={token.value}
                          className={`h-4 w-4 rounded-full border ${family.swatchBorder}`}
                          style={{
                            backgroundColor:
                              activeMode === 'light'
                                ? family.light[token.value]
                                : family.dark[token.value],
                          }}
                          title={token.label}
                        />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeFamily === 'custom' ? (
              <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-500">
                Custom pair â€” Light mode still flips between your edited dark and light tokens.
                Pick Indigo, Classic, Verdant, Vive, Safran, Citron, Rouge, Ã‰carlate, or Ardoise above to reset to a named pair.
              </p>
            ) : null}

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Active mode tokens ({activeMode === 'light' ? 'Light' : 'Dark'}
              {activeFamily !== 'custom' ? ` Â· ${activeFamily}` : ' Â· custom'})
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
                <GlobalColorField
                  key={token.value}
                  label={token.label}
                  description={token.description}
                  value={resolveHeroPaletteColor(activePalette, token.value)}
                  onChange={(color) => onGlobalPaletteChange({ [token.value]: color })}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Theme chrome
            </p>
            <div className="mt-3">
              <ThemePickerPanel
                themeId={themeId}
                customThemes={customThemes}
                settings={settings}
                onChange={onThemeChange}
                onSaveCustomTheme={onSaveCustomTheme}
                onRenameCustomTheme={onRenameCustomTheme}
                onDuplicateTheme={onDuplicateTheme}
                onResetBuiltinTheme={onResetBuiltinTheme}
                onDeleteCustomTheme={onDeleteCustomTheme}
              />
            </div>
            <div className="mt-3 flex gap-3 rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50 to-white px-4 py-3.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white">
                <ThemeInfoIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900">Editorial Warm reste intact</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                  Seul Editorial Warm est verrouillÃ© : toute personnalisation crÃ©e automatiquement une
                  copie. Noir / Blanc se modifie directement. Les copies (ex. Â« Noir / Blanc copie Â»)
                  restent indÃ©pendantes.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Preferences
            </p>
            <ToggleRow
              label="Settings keyboard shortcut"
              description="Press Ctrl+, (âŒ˜, on Mac) to open or close portfolio settings. Owner only."
              checked={global.settingsShortcutEnabled ?? true}
              onChange={(settingsShortcutEnabled) => onGlobalChange({ settingsShortcutEnabled })}
            />
          </div>
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
          <OptionGrid
            label="Page background"
            options={[
              {
                value: 'none',
                label: 'None',
                description: 'Default theme chrome â€” section fills keep working.',
              },
              {
                value: 'solid',
                label: 'Solid color',
                description: 'One page color. Replaces per-section background fills.',
              },
              {
                value: 'image',
                label: 'Fixed image',
                description: 'Viewport wallpaper. Section fills can still sit on top.',
              },
            ]}
            value={
              global.backgroundImageEnabled ? 'image' : global.backgroundEnabled ? 'solid' : 'none'
            }
            onChange={(mode) => {
              if (mode === 'solid') {
                onGlobalChange({ backgroundEnabled: true, backgroundImageEnabled: false });
              } else if (mode === 'image') {
                onGlobalChange({ backgroundEnabled: false, backgroundImageEnabled: true });
              } else {
                onGlobalChange({ backgroundEnabled: false, backgroundImageEnabled: false });
              }
            }}
            columns={3}
          />

          {global.backgroundEnabled && !global.backgroundImageEnabled ? (
            <GlobalColorField
              label="Background color"
              value={global.backgroundColor}
              onChange={(backgroundColor) => onGlobalChange({ backgroundColor })}
            />
          ) : null}

          {global.backgroundImageEnabled ? (
            <>
              <PortfolioBackgroundImageUpload
                url={global.backgroundImageUrl}
                onChange={(backgroundImageUrl) => onGlobalChange({ backgroundImageUrl })}
                library={global.backgroundImageLibrary}
                onLibraryChange={(backgroundImageLibrary) => onGlobalChange({ backgroundImageLibrary })}
                helperText="This fixed wallpaper shows behind every section. A section can override it with its own image fill â€” only that section is affected."
              />

              <OptionGrid
                label="Image size"
                options={PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_SIZE_OPTIONS}
                value={global.backgroundImageSize}
                onChange={(backgroundImageSize) => onGlobalChange({ backgroundImageSize })}
                columns={3}
              />

              <OptionGrid
                label="Image position"
                options={PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_POSITION_OPTIONS}
                value={global.backgroundImagePosition}
                onChange={(backgroundImagePosition) => onGlobalChange({ backgroundImagePosition })}
                columns={3}
              />

              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Image opacity
                  </p>
                  <span className="text-xs font-semibold tabular-nums text-neutral-600">
                    {global.backgroundImageOpacity}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={global.backgroundImageOpacity}
                  onChange={(event) =>
                    onGlobalChange({ backgroundImageOpacity: Number(event.target.value) })
                  }
                  className="mt-2 h-1.5 w-full cursor-pointer accent-neutral-900"
                  aria-label="Background image opacity"
                />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Insets from edges
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Pull the image in from each side of the screen (px).
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(
                    [
                      ['Top', 'backgroundImageInsetTop', global.backgroundImageInsetTop],
                      ['Right', 'backgroundImageInsetRight', global.backgroundImageInsetRight],
                      ['Bottom', 'backgroundImageInsetBottom', global.backgroundImageInsetBottom],
                      ['Left', 'backgroundImageInsetLeft', global.backgroundImageInsetLeft],
                    ] as const
                  ).map(([label, key, value]) => (
                    <label key={key} className="block">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        {label}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={240}
                        step={4}
                        value={value}
                        onChange={(event) => {
                          const next = Number(event.target.value);
                          onGlobalChange({
                            [key]: Number.isFinite(next)
                              ? Math.min(240, Math.max(0, Math.round(next)))
                              : 0,
                          });
                        }}
                        className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm tabular-nums text-neutral-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          <div className="space-y-4 border-t border-neutral-200/80 pt-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Background pattern
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Repeating geometric motif painted over the page fill.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PORTFOLIO_GLOBAL_BACKGROUND_PATTERN_OPTIONS.map((option) => {
                const active = global.backgroundPattern === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onGlobalChange({ backgroundPattern: option.value })}
                    className={`overflow-hidden rounded-2xl border text-left transition ${
                      active
                        ? 'border-neutral-900 ring-2 ring-neutral-900/10'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    aria-pressed={active}
                  >
                    <div
                      className="h-16 w-full bg-white"
                      style={globalBackgroundPatternSwatchStyle(
                        option.value,
                        global.backgroundPatternColor,
                        global.backgroundPatternSecondaryColor
                      )}
                    />
                    <div className="border-t border-neutral-100 bg-white px-3 py-2">
                      <p className="text-sm font-semibold text-neutral-900">{option.label}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {global.backgroundPattern !== 'none' ? (
              <>
              <div
                className={`grid gap-4 ${
                  globalBackgroundPatternUsesSecondaryColor(global.backgroundPattern)
                    ? 'sm:grid-cols-3'
                    : 'sm:grid-cols-2'
                }`}
              >
                <GlobalColorField
                  label="Pattern color A"
                  value={global.backgroundPatternColor}
                  onChange={(backgroundPatternColor) => onGlobalChange({ backgroundPatternColor })}
                />
                {globalBackgroundPatternUsesSecondaryColor(global.backgroundPattern) ? (
                  <GlobalColorField
                    label="Pattern color B"
                    value={global.backgroundPatternSecondaryColor}
                    onChange={(backgroundPatternSecondaryColor) =>
                      onGlobalChange({ backgroundPatternSecondaryColor })
                    }
                  />
                ) : null}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Pattern opacity
                    </p>
                    <span className="text-xs font-semibold tabular-nums text-neutral-600">
                      {global.backgroundPatternOpacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={60}
                    step={1}
                    value={global.backgroundPatternOpacity}
                    onChange={(event) =>
                      onGlobalChange({ backgroundPatternOpacity: Number(event.target.value) })
                    }
                    className="mt-3 h-1.5 w-full cursor-pointer accent-neutral-900"
                    aria-label="Background pattern opacity"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Units per row
                    </p>
                    <span className="text-xs font-semibold tabular-nums text-neutral-600">
                      {(global.backgroundPatternUnitsPerRow ?? 0) === 0
                        ? 'Auto'
                        : global.backgroundPatternUnitsPerRow}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={GLOBAL_BACKGROUND_PATTERN_UNITS_PER_ROW_MAX}
                    step={1}
                    value={global.backgroundPatternUnitsPerRow ?? 0}
                    onChange={(event) =>
                      onGlobalChange({ backgroundPatternUnitsPerRow: Number(event.target.value) })
                    }
                    className="mt-3 h-1.5 w-full cursor-pointer accent-neutral-900"
                    aria-label="Pattern units per row"
                  />
                  <p className="mt-1.5 text-xs text-neutral-500">
                    {(global.backgroundPatternUnitsPerRow ?? 0) === 1
                      ? 'One unit centered on the page â€” no repetition. Adjust size below.'
                      : (global.backgroundPatternUnitsPerRow ?? 0) === 0
                        ? 'Auto keeps the natural tile size and repeats across the page.'
                        : 'How many units fit across the page.'}
                  </p>
                </div>
                {(global.backgroundPatternUnitsPerRow ?? 0) === 1 ? (
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Unit size
                      </p>
                      <span className="text-xs font-semibold tabular-nums text-neutral-600">
                        {global.backgroundPatternUnitSize ?? 40}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={GLOBAL_BACKGROUND_PATTERN_UNIT_SIZE_MIN}
                      max={GLOBAL_BACKGROUND_PATTERN_UNIT_SIZE_MAX}
                      step={1}
                      value={global.backgroundPatternUnitSize ?? 40}
                      onChange={(event) =>
                        onGlobalChange({ backgroundPatternUnitSize: Number(event.target.value) })
                      }
                      className="mt-3 h-1.5 w-full cursor-pointer accent-neutral-900"
                      aria-label="Pattern unit size"
                    />
                    <p className="mt-1.5 text-xs text-neutral-500">
                      Width of the centered motif as a percentage of the screen.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                          Gap horizontal
                        </p>
                        <span className="text-xs font-semibold tabular-nums text-neutral-600">
                          {global.backgroundPatternGapX ?? 0}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={GLOBAL_BACKGROUND_PATTERN_GAP_MAX}
                        step={2}
                        value={global.backgroundPatternGapX ?? 0}
                        onChange={(event) =>
                          onGlobalChange({ backgroundPatternGapX: Number(event.target.value) })
                        }
                        className="mt-3 h-1.5 w-full cursor-pointer accent-neutral-900"
                        aria-label="Pattern horizontal gap"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                          Gap vertical
                        </p>
                        <span className="text-xs font-semibold tabular-nums text-neutral-600">
                          {global.backgroundPatternGapY ?? 0}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={GLOBAL_BACKGROUND_PATTERN_GAP_MAX}
                        step={2}
                        value={global.backgroundPatternGapY ?? 0}
                        onChange={(event) =>
                          onGlobalChange({ backgroundPatternGapY: Number(event.target.value) })
                        }
                        className="mt-3 h-1.5 w-full cursor-pointer accent-neutral-900"
                        aria-label="Pattern vertical gap"
                      />
                    </div>
                  </>
                )}
              </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {subSection === 'order' ? (
        <GlobalSectionOrderBlock
          sectionOrder={global.sectionOrder}
          servicesSectionOrganization={servicesSectionOrganization}
          onChange={(sectionOrder) => onGlobalChange({ sectionOrder })}
        />
      ) : null}

      {subSection === 'titles' ? (
        <div className="space-y-5">
          <GlobalSectionTypographySettings global={global} onGlobalChange={onGlobalChange} />

          <div className="space-y-5 border-t border-neutral-200/80 pt-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Layout & motion
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Alignment, orientation, sticky behavior, and scroll reveal for section headers.
              </p>
            </div>

          <OptionGrid
            label="Section titles alignment"
            options={PORTFOLIO_GLOBAL_TITLE_ALIGNMENT_OPTIONS}
            value={global.titleAlignment}
            onChange={(titleAlignment) => onGlobalChange({ titleAlignment })}
          />

          <OptionGrid
            label="Section title orientation"
            options={PORTFOLIO_GLOBAL_TITLE_ORIENTATION_OPTIONS}
            value={global.titleOrientation}
            onChange={(titleOrientation) => onGlobalChange({ titleOrientation })}
            columns={2}
          />

          {global.titleOrientation === 'vertical' ? (
            <GlobalOrientationTargets
              targets={global.titleOrientationTargets}
              onChange={(titleOrientationTargets) => onGlobalChange({ titleOrientationTargets })}
            />
          ) : null}

          <OptionGrid
            label="Section title scroll behavior"
            options={PORTFOLIO_GLOBAL_TITLE_SCROLL_OPTIONS}
            value={global.titleScroll}
            onChange={(titleScroll) => onGlobalChange({ titleScroll })}
          />

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <OptionGrid
              label="Split screen title motion"
              options={PORTFOLIO_GLOBAL_SPLIT_TITLE_MOTION_OPTIONS}
              value={global.splitTitleMotion ?? 'fade-up'}
              onChange={(splitTitleMotion) => onGlobalChange({ splitTitleMotion })}
              columns={3}
            />
            <OptionGrid
              label="Split screen content top spacing"
              options={PORTFOLIO_GLOBAL_SPLIT_CONTENT_TOP_SPACING_OPTIONS}
              value={global.splitContentTopSpacing ?? 'compact'}
              onChange={(splitContentTopSpacing) => onGlobalChange({ splitContentTopSpacing })}
              columns={2}
            />
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Extra spacing (px)
                </p>
                <span className="tabular-nums text-sm font-semibold text-neutral-700">
                  {clampGlobalSplitContentTopExtraPx(global.splitContentTopExtraPx, 0)}px
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                Ajoute des pixels au preset ci-dessus pour affiner lâ€™Ã©cart entre les blocs Ã  droite.
              </p>
              <input
                type="range"
                min={GLOBAL_SPLIT_CONTENT_TOP_EXTRA_PX_MIN}
                max={GLOBAL_SPLIT_CONTENT_TOP_EXTRA_PX_MAX}
                step={4}
                value={clampGlobalSplitContentTopExtraPx(global.splitContentTopExtraPx, 0)}
                onChange={(event) =>
                  onGlobalChange({
                    splitContentTopExtraPx: clampGlobalSplitContentTopExtraPx(
                      Number(event.target.value),
                      0
                    ),
                  })
                }
                className="mt-3 w-full accent-neutral-900"
              />
              <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                <span>{GLOBAL_SPLIT_CONTENT_TOP_EXTRA_PX_MIN}px</span>
                <span>{GLOBAL_SPLIT_CONTENT_TOP_EXTRA_PX_MAX}px</span>
              </div>
            </div>
            <OptionGrid
              label="Split screen content bottom spacing"
              options={PORTFOLIO_GLOBAL_SPLIT_CONTENT_BOTTOM_SPACING_OPTIONS}
              value={global.splitContentBottomSpacing ?? 'compact'}
              onChange={(splitContentBottomSpacing) => onGlobalChange({ splitContentBottomSpacing })}
              columns={2}
            />
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Extra bottom spacing (px)
                </p>
                <span className="tabular-nums text-sm font-semibold text-neutral-700">
                  {clampGlobalSplitContentBottomExtraPx(global.splitContentBottomExtraPx, 0)}px
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                Ajoute des pixels au preset ci-dessus pour affiner lâ€™espace sous chaque bloc Ã  droite.
              </p>
              <input
                type="range"
                min={GLOBAL_SPLIT_CONTENT_BOTTOM_EXTRA_PX_MIN}
                max={GLOBAL_SPLIT_CONTENT_BOTTOM_EXTRA_PX_MAX}
                step={4}
                value={clampGlobalSplitContentBottomExtraPx(global.splitContentBottomExtraPx, 0)}
                onChange={(event) =>
                  onGlobalChange({
                    splitContentBottomExtraPx: clampGlobalSplitContentBottomExtraPx(
                      Number(event.target.value),
                      0
                    ),
                  })
                }
                className="mt-3 w-full accent-neutral-900"
              />
              <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                <span>{GLOBAL_SPLIT_CONTENT_BOTTOM_EXTRA_PX_MIN}px</span>
                <span>{GLOBAL_SPLIT_CONTENT_BOTTOM_EXTRA_PX_MAX}px</span>
              </div>
            </div>
            <GlobalSplitTitleFrameBlock
              frame={global.splitTitleFrame ?? DEFAULT_GLOBAL_SPLIT_TITLE_FRAME}
              onChange={(splitTitleFrame) => onGlobalChange({ splitTitleFrame })}
            />
            <p className="text-sm text-neutral-500">
              Title motion, frame, and right-column section gaps apply only when Navigation type is
              Split screen.
            </p>
          </div>

          <GlobalSectionRevealBlock
            motionProfile={global.motionProfile}
            motionTiming={global.motionTiming}
            onChange={(patch) => onGlobalChange(patch)}
          />

          <OptionGrid
            label="Space above section titles"
            options={PORTFOLIO_GLOBAL_SECTION_TOP_SPACING_OPTIONS}
            value={global.sectionTitleTopSpacing}
            onChange={(sectionTitleTopSpacing) => onGlobalChange({ sectionTitleTopSpacing })}
            columns={2}
          />
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Extra spacing (px)
              </p>
              <span className="tabular-nums text-sm font-semibold text-neutral-700">
                {clampGlobalSectionTitleTopExtraPx(global.sectionTitleTopExtraPx, 0)}px
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Ajoute des pixels au preset ci-dessus pour affiner lâ€™espace au-dessus de chaque titre
              de section.
            </p>
            <input
              type="range"
              min={GLOBAL_SECTION_TITLE_TOP_EXTRA_PX_MIN}
              max={GLOBAL_SECTION_TITLE_TOP_EXTRA_PX_MAX}
              step={4}
              value={clampGlobalSectionTitleTopExtraPx(global.sectionTitleTopExtraPx, 0)}
              onChange={(event) =>
                onGlobalChange({
                  sectionTitleTopExtraPx: clampGlobalSectionTitleTopExtraPx(
                    Number(event.target.value),
                    0
                  ),
                })
              }
              className="mt-3 w-full accent-neutral-900"
            />
            <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
              <span>{GLOBAL_SECTION_TITLE_TOP_EXTRA_PX_MIN}px</span>
              <span>{GLOBAL_SECTION_TITLE_TOP_EXTRA_PX_MAX}px</span>
            </div>
          </div>
          <OptionGrid
            label="Space below sections"
            options={PORTFOLIO_GLOBAL_SECTION_BOTTOM_SPACING_OPTIONS}
            value={global.sectionTitleBottomSpacing}
            onChange={(sectionTitleBottomSpacing) => onGlobalChange({ sectionTitleBottomSpacing })}
            columns={2}
          />
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Extra bottom spacing (px)
              </p>
              <span className="tabular-nums text-sm font-semibold text-neutral-700">
                {clampGlobalSectionTitleBottomExtraPx(global.sectionTitleBottomExtraPx, 0)}px
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Ajoute des pixels au preset ci-dessus pour affiner lâ€™espace sous chaque section
              (Stack, Tools, Portfolio, etc.).
            </p>
            <input
              type="range"
              min={GLOBAL_SECTION_TITLE_BOTTOM_EXTRA_PX_MIN}
              max={GLOBAL_SECTION_TITLE_BOTTOM_EXTRA_PX_MAX}
              step={4}
              value={clampGlobalSectionTitleBottomExtraPx(global.sectionTitleBottomExtraPx, 0)}
              onChange={(event) =>
                onGlobalChange({
                  sectionTitleBottomExtraPx: clampGlobalSectionTitleBottomExtraPx(
                    Number(event.target.value),
                    0
                  ),
                })
              }
              className="mt-3 w-full accent-neutral-900"
            />
            <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
              <span>{GLOBAL_SECTION_TITLE_BOTTOM_EXTRA_PX_MIN}px</span>
              <span>{GLOBAL_SECTION_TITLE_BOTTOM_EXTRA_PX_MAX}px</span>
            </div>
          </div>
          </div>
        </div>
      ) : null}

      {subSection === 'layout' ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <p className="text-sm text-neutral-500">
              Content width caps how wide the column can grow on large screens (Standard / Wide / Full).
              Side margins add padding inside that column. Change Side margins to None to see width caps
              more clearly. On phones the layout stays fluid.
            </p>
          </div>
          <OptionGrid
            label="Content width"
            options={PORTFOLIO_GLOBAL_CONTENT_WIDTH_OPTIONS}
            value={global.contentWidth}
            onChange={(contentWidth) => onGlobalChange({ contentWidth })}
            columns={3}
          />

          <OptionGrid
            label="Side margins"
            options={PORTFOLIO_GLOBAL_CONTENT_GUTTER_OPTIONS}
            value={global.contentGutter}
            onChange={(contentGutter) => onGlobalChange({ contentGutter })}
            columns={2}
          />
        </div>
      ) : null}

      {subSection === 'typography' ? (
        <div className="space-y-5">
          <GlobalSectionTypographySettings global={global} onGlobalChange={onGlobalChange} />

          <GlobalTitleChromeBlock
            chrome={global.titleChrome}
            onChange={(titleChrome) => onGlobalChange({ titleChrome })}
          />
        </div>
      ) : null}
    </div>
  );
}

function ThemePickerPanel({
  themeId,
  customThemes,
  settings,
  onChange,
  onSaveCustomTheme,
  onRenameCustomTheme,
  onDuplicateTheme,
  onResetBuiltinTheme,
  onDeleteCustomTheme,
}: {
  themeId: PortfolioThemeId;
  customThemes: PortfolioCustomTheme[];
  settings: PortfolioSettings;
  onChange: (themeId: PortfolioThemeId) => void;
  onSaveCustomTheme: (themeId: string, name?: string) => boolean;
  onRenameCustomTheme: (themeId: string, name: string) => boolean;
  onDuplicateTheme: (themeId: PortfolioThemeId) => void;
  onResetBuiltinTheme: (themeId: PortfolioBuiltinThemeId) => void;
  onDeleteCustomTheme: (themeId: string) => void;
}) {
  const [nameEditor, setNameEditor] = useState<{
    id: string;
    mode: 'save' | 'rename';
    value: string;
  } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const builtin = PORTFOLIO_THEMES;
  const customs = customThemes.map(customThemeToPickerTheme);

  const openNameEditor = (id: string, mode: 'save' | 'rename', currentName: string) => {
    setPendingDeleteId(null);
    setNameEditor({ id, mode, value: currentName });
  };

  const closeNameEditor = () => setNameEditor(null);

  const commitNameEditor = () => {
    if (!nameEditor) return;
    const name = nameEditor.value.trim();
    if (!name) return;

    if (nameEditor.mode === 'save') {
      const changed = onSaveCustomTheme(nameEditor.id, name);
      if (changed) {
        pushFlashFeedback({
          variant: 'success',
          title: 'ThÃ¨me enregistrÃ©',
          description: `Â« ${name} Â» a Ã©tÃ© sauvegardÃ© avec toutes vos personnalisations.`,
          durationMs: 4500,
        });
      }
    } else {
      const changed = onRenameCustomTheme(nameEditor.id, name);
      if (changed) {
        pushFlashFeedback({
          variant: 'success',
          title: 'ThÃ¨me renommÃ©',
          description: `Le thÃ¨me sâ€™appelle maintenant Â« ${name} Â».`,
          durationMs: 4000,
        });
      }
      // Same name â†’ close quietly, no toast (nothing happened).
    }
    setNameEditor(null);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {builtin.map((theme) => {
        const active = theme.id === themeId;
        const badge = theme.id === 'editorial' ? 'Default' : 'Editable';
        return (
          <div
            key={theme.id}
            className={`rounded-2xl border p-4 text-left transition ${
              active
                ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
            }`}
          >
            <button type="button" onClick={() => onChange(theme.id)} className="w-full text-left">
              <div className="mb-4 flex gap-1.5">
                {theme.swatches.map((color) => (
                  <span
                    key={`${theme.id}-${color}`}
                    className="h-8 flex-1 rounded-lg border border-black/5"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                ))}
              </div>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-neutral-950">{theme.label}</p>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                  {badge}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{theme.description}</p>
              {active ? (
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Active</p>
              ) : null}
            </button>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-neutral-100 pt-3">
              <ThemeActionButton
                label="Dupliquer"
                onClick={() => {
                  onDuplicateTheme(theme.id);
                  pushFlashFeedback({
                    variant: 'success',
                    title: 'ThÃ¨me dupliquÃ©',
                    description: `Une copie personnalisable a Ã©tÃ© crÃ©Ã©e Ã  partir de Â« ${theme.label} Â».`,
                    durationMs: 4000,
                  });
                }}
                icon={<ThemeCopyIcon className="h-3.5 w-3.5" />}
              />
              {theme.id === 'noir' ? (
                <ThemeActionButton
                  label="RÃ©initialiser"
                  onClick={() => {
                    onResetBuiltinTheme('noir');
                    pushFlashFeedback({
                      variant: 'success',
                      title: 'Noir / Blanc rÃ©initialisÃ©',
                      description: 'Le thÃ¨me a Ã©tÃ© restaurÃ© Ã  ses rÃ©glages dâ€™usine.',
                      durationMs: 4000,
                    });
                  }}
                  icon={<ThemeResetIcon className="h-3.5 w-3.5" />}
                />
              ) : null}
            </div>
          </div>
        );
      })}

      {customs.map((theme) => {
        const active = theme.id === themeId;
        const source = customThemes.find((item) => item.id === theme.id);
        const editorOpen = nameEditor?.id === theme.id;
        const deletePending = pendingDeleteId === theme.id;
        const statusLabel = source?.saved
          ? active
            ? 'Actif Â· EnregistrÃ©'
            : 'EnregistrÃ©'
          : active
            ? 'Actif Â· Brouillon'
            : 'Brouillon';
        const hasPendingChanges = source
          ? customThemeHasPendingChanges(source, settings)
          : false;

        return (
          <div
            key={theme.id}
            className={`rounded-2xl border p-4 text-left transition ${
              active
                ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/15'
                : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
            }`}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                if (editorOpen || deletePending) return;
                onChange(theme.id);
              }}
              onKeyDown={(event) => {
                if (editorOpen || deletePending) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onChange(theme.id);
                }
              }}
              className="w-full cursor-pointer text-left"
            >
              <div className="mb-4 flex gap-1.5">
                {theme.swatches.map((color) => (
                  <span
                    key={`${theme.id}-${color}`}
                    className="h-8 flex-1 rounded-lg border border-black/5"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                ))}
              </div>
              <p className="text-sm font-bold text-neutral-950">{theme.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{theme.description}</p>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
                {statusLabel}
              </p>
            </div>

            {editorOpen ? (
              <div
                className="mt-3 rounded-xl border border-neutral-200 bg-white p-2.5 shadow-sm"
                onClick={(event) => event.stopPropagation()}
              >
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                  {nameEditor.mode === 'save' ? 'Nommer et enregistrer' : 'Renommer le thÃ¨me'}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    value={nameEditor.value}
                    onChange={(event) =>
                      setNameEditor((prev) => (prev ? { ...prev, value: event.target.value } : prev))
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        commitNameEditor();
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        closeNameEditor();
                      }
                    }}
                    placeholder="Nom du thÃ¨me"
                    className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-semibold text-neutral-950 outline-none ring-orange-500/30 focus:border-orange-400 focus:ring-2"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={commitNameEditor}
                    disabled={!nameEditor.value.trim()}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-950 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Valider"
                    title="Valider"
                  >
                    <ThemeCheckIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={closeNameEditor}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50"
                    aria-label="Annuler"
                    title="Annuler"
                  >
                    <ThemeCloseIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : deletePending ? (
              <div
                className="mt-3 rounded-xl border border-red-200 bg-red-50/70 p-2.5"
                onClick={(event) => event.stopPropagation()}
              >
                <p className="text-xs font-medium text-red-700">
                  Supprimer Â« {source?.name || theme.label} Â» ?
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const deletedName = source?.name || theme.label;
                      onDeleteCustomTheme(theme.id);
                      setPendingDeleteId(null);
                      pushFlashFeedback({
                        variant: 'info',
                        title: 'ThÃ¨me supprimÃ©',
                        description: `Â« ${deletedName} Â» a Ã©tÃ© retirÃ© de votre palette.`,
                        durationMs: 4000,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-red-500"
                  >
                    <ThemeTrashIcon className="h-3.5 w-3.5" />
                    Confirmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(null)}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-600 transition hover:bg-neutral-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-neutral-100 pt-3">
                {/*
                  Save / Update only for the ACTIVE theme â€” inactive themes must not
                  absorb the live settings (avoids overwriting an unselected snapshot).
                */}
                {active ? (
                  !source?.saved ? (
                    <ThemeActionButton
                      label="Enregistrer"
                      tone="primary"
                      onClick={() => openNameEditor(theme.id, 'save', source?.name || theme.label)}
                      icon={<ThemeSaveIcon className="h-3.5 w-3.5" />}
                    />
                  ) : (
                    <ThemeActionButton
                      label={hasPendingChanges ? 'Mettre Ã  jour' : 'Ã€ jour'}
                      disabled={!hasPendingChanges}
                      onClick={() => {
                        const changed = onSaveCustomTheme(theme.id);
                        if (!changed) return;
                        pushFlashFeedback({
                          variant: 'success',
                          title: 'ThÃ¨me mis Ã  jour',
                          description: `Â« ${source?.name || theme.label} Â» a Ã©tÃ© synchronisÃ© avec vos rÃ©glages actuels.`,
                          durationMs: 4500,
                        });
                      }}
                      icon={<ThemeSaveIcon className="h-3.5 w-3.5" />}
                    />
                  )
                ) : null}
                <ThemeActionButton
                  label="Renommer"
                  onClick={() => openNameEditor(theme.id, 'rename', source?.name || theme.label)}
                  icon={<ThemePencilIcon className="h-3.5 w-3.5" />}
                />
                <ThemeActionButton
                  label="Dupliquer"
                  onClick={() => {
                    onDuplicateTheme(theme.id);
                    pushFlashFeedback({
                      variant: 'success',
                      title: 'ThÃ¨me dupliquÃ©',
                      description: `Une copie de Â« ${source?.name || theme.label} Â» a Ã©tÃ© crÃ©Ã©e.`,
                      durationMs: 4000,
                    });
                  }}
                  icon={<ThemeCopyIcon className="h-3.5 w-3.5" />}
                />
                {isCustomPortfolioThemeId(theme.id) ? (
                  <ThemeActionButton
                    label="Supprimer"
                    tone="danger"
                    onClick={() => {
                      setNameEditor(null);
                      setPendingDeleteId(theme.id);
                    }}
                    icon={<ThemeTrashIcon className="h-3.5 w-3.5" />}
                  />
                ) : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ThemeActionButton({
  label,
  onClick,
  icon,
  tone = 'neutral',
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
  tone?: 'neutral' | 'primary' | 'danger';
  disabled?: boolean;
}) {
  const toneClass =
    tone === 'primary'
      ? 'border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800'
      : tone === 'danger'
        ? 'border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:border-neutral-100 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:hover:bg-neutral-50 ${toneClass}`}
      title={disabled ? 'Aucune modification Ã  enregistrer' : label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ThemeInfoIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 11v5M12 8h.01" />
    </svg>
  );
}

function ThemeSaveIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5h11l3 3v11H5V5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5v5h7V5M8 19v-6h8v6" />
    </svg>
  );
}

function ThemePencilIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10.5-10.5a2.1 2.1 0 00-3-3L5 17v3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6.5l3 3" />
    </svg>
  );
}

function ThemeCopyIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15V5a2 2 0 012-2h10" />
    </svg>
  );
}

function ThemeResetIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 0114.95-4.05M20 12a8 8 0 01-14.95 4.05" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5v5h5M20 19v-5h-5" />
    </svg>
  );
}

function ThemeTrashIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V5h6v2M8 7l1 12h6l1-12" />
    </svg>
  );
}

function ThemeCheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
    </svg>
  );
}

function ThemeCloseIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function OptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 2,
}: {
  label: string;
  options: { value: T; label: string; description: string }[];
  value: T | '';
  onChange: (value: T) => void;
  columns?: number;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div
        className={`mt-3 grid gap-2 ${
          columns === 4
            ? 'grid-cols-2 sm:grid-cols-4'
            : columns === 3
              ? 'sm:grid-cols-2 lg:grid-cols-3'
              : columns === 1
                ? 'grid-cols-1'
                : 'sm:grid-cols-2'
        }`}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                  : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
              }`}
            >
              <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavItemCustomizer({
  sectionKey,
  title,
  description,
  label,
  icon,
  onLabelChange,
  onIconChange,
}: {
  sectionKey: PortfolioNavSectionKey;
  title: string;
  description: string;
  label: string;
  icon: PortfolioNavIconVariant;
  onLabelChange: (label: string) => void;
  onIconChange: (icon: PortfolioNavIconVariant) => void;
}) {
  const labelPresets = PORTFOLIO_NAV_LABEL_PRESETS[sectionKey];
  const iconOptions = PORTFOLIO_NAV_ICON_OPTIONS[sectionKey];
  const presetValues = new Set(labelPresets.map((preset) => preset.value));
  const usesCustomLabel = label.trim().length > 0 && !presetValues.has(label);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-neutral-950">{title}</p>
          <p className="mt-1 text-xs text-neutral-500">{description}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-800 shadow-sm">
          <PortfolioNavIcon variant={icon} className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">
            Nom dans le menu
          </p>
          <input
            type="text"
            value={label}
            maxLength={32}
            onChange={(event) => onLabelChange(event.target.value)}
            placeholder="Ex. Projects, Expertise…"
            className="mt-2 w-full rounded-xl border border-neutral-200/80 bg-white px-3 py-2.5 text-sm font-medium text-neutral-900 shadow-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/10"
          />
          <p className="mt-1.5 text-[11px] text-neutral-500">
            {usesCustomLabel ? 'Libellé personnalisé actif.' : 'Suggestions rapides :'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {labelPresets.map((preset, presetIndex) => {
              const active = label === preset.value;
              return (
                <button
                  key={`${sectionKey}-label-${presetIndex}-${preset.value}`}
                  type="button"
                  onClick={() => onLabelChange(preset.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-neutral-950 text-white'
                      : 'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">
            Icône ({iconOptions.length} choix)
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {iconOptions.map((option) => {
              const active = icon === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onIconChange(option.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-1.5 py-2.5 transition ${
                    active
                      ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                      : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                  }`}
                >
                  <PortfolioNavIcon variant={option.value} className="h-5 w-5 text-neutral-800" />
                  <span className="text-center text-[9px] font-semibold leading-tight text-neutral-600">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavigationLabelsIconsPanel({
  itemLabels,
  itemIcons,
  onChange,
}: {
  itemLabels: PortfolioNavItemLabels;
  itemIcons: PortfolioNavItemIcons;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Libellés & icônes du menu
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Personnalisez le nom affiché et l&apos;icône de chaque section dans la barre de navigation et
          le menu mobile.
        </p>
      </div>
      <div className="space-y-3">
        {PORTFOLIO_NAV_SECTION_META.map((section) => (
          <NavItemCustomizer
            key={section.key}
            sectionKey={section.key}
            title={section.title}
            description={section.description}
            label={itemLabels[section.key]}
            icon={itemIcons[section.key]}
            onLabelChange={(nextLabel) =>
              onChange({ itemLabels: { ...itemLabels, [section.key]: nextLabel } })
            }
            onIconChange={(nextIcon) =>
              onChange({ itemIcons: { ...itemIcons, [section.key]: nextIcon } })
            }
          />
        ))}
      </div>
    </div>
  );
}

function navPreviewLuminance(hex: string): number {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return 0;
  const r = Number.parseInt(raw.slice(0, 2), 16) / 255;
  const g = Number.parseInt(raw.slice(2, 4), 16) / 255;
  const b = Number.parseInt(raw.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function navPreviewContrast(against: string, a: string, b: string): string {
  const base = navPreviewLuminance(against);
  return Math.abs(navPreviewLuminance(a) - base) >= Math.abs(navPreviewLuminance(b) - base) ? a : b;
}

function navPreviewHexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return `rgba(255,90,31,${alpha})`;
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function NavLookPresetPreview({
  preset,
  accent,
  surface,
  strongText,
  pageFill,
  muted,
  barFill,
  barBorder,
  hoverIcon,
  hoverText,
  hoverBackground,
}: {
  preset: PortfolioNavLookPreset;
  accent: string;
  surface: string;
  strongText: string;
  pageFill: string;
  muted: string;
  barFill: string;
  barBorder: string;
  hoverIcon: string;
  hoverText: string;
  hoverBackground: string;
}) {
  const slots = [0, 1, 2, 3, 4] as const;
  const onAccent = navPreviewContrast(accent, surface, strongText);
  const contrastFill =
    navPreviewLuminance(pageFill) <= navPreviewLuminance(strongText) ? pageFill : strongText;
  const onContrast = navPreviewContrast(contrastFill, surface, strongText);
  const hoverWash = navPreviewHexToRgba(hoverBackground, 0.18);

  const activeChrome = (index: number): CSSProperties => {
    if (index !== 0) {
      return {
        color: muted,
        backgroundColor: 'transparent',
        // CSS vars so inactive pills can hover without fighting inline hex.
        ['--nav-mock-icon' as string]: muted,
        ['--nav-mock-hover-icon' as string]: hoverIcon,
        ['--nav-mock-hover-bg' as string]: hoverWash,
        ['--nav-mock-hover-text' as string]: hoverText,
      };
    }
    switch (preset) {
      case 'accent-fill':
        return { backgroundColor: accent, color: onAccent };
      case 'accent-outline':
        return {
          backgroundColor: surface,
          color: accent,
          boxShadow: `inset 0 0 0 1.5px ${accent}`,
        };
      case 'dark-fill':
        return { backgroundColor: contrastFill, color: onContrast };
      case 'soft-badge': {
        const raw = accent.replace('#', '');
        const r = Number.parseInt(raw.slice(0, 2), 16);
        const g = Number.parseInt(raw.slice(2, 4), 16);
        const b = Number.parseInt(raw.slice(4, 6), 16);
        return {
          backgroundColor: Number.isFinite(r) ? `rgba(${r},${g},${b},0.18)` : accent,
          color: accent,
        };
      }
      case 'dot':
        return { color: strongText };
    }
  };

  return (
    <div
      className="mt-3 flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 shadow-sm"
      style={{
        backgroundColor: barFill,
        boxShadow: `inset 0 0 0 1px ${barBorder}`,
      }}
    >
      {slots.map((index) => {
        const isActive = index === 0;
        return (
          <span
            key={index}
            className={`relative inline-flex h-6 w-6 items-center justify-center rounded-full transition-[background-color,color,transform] duration-200 ${
              isActive
                ? ''
                : 'hover:scale-105 hover:bg-[var(--nav-mock-hover-bg)] hover:[color:var(--nav-mock-hover-icon)]'
            }`}
            style={activeChrome(index)}
            aria-hidden
            title={isActive ? 'Active item' : 'Hover preview'}
          >
            <span className="block h-2 w-2 rounded-[2px] bg-current opacity-90" />
            {preset === 'dot' && isActive ? (
              <span
                className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                style={{ backgroundColor: accent }}
              />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

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
  if (design === 'classic') {
    return (
      <div className="mt-3 flex justify-center">
        <div className="flex gap-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-1.5 shadow-sm">
          <span className="h-2 w-7 rounded-full bg-neutral-300" />
          <span className="h-2 w-7 rounded-full bg-neutral-300" />
          <span className="h-2 w-7 rounded-full bg-neutral-300" />
        </div>
      </div>
    );
  }

  if (design === 'floating-pill') {
    return (
      <div className="mt-3 flex justify-center">
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
              email
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (design === 'nav-logo-social') {
    return (
      <div className="mt-3 overflow-hidden rounded-none border-y border-neutral-200 bg-white">
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-[8px] text-neutral-800">
            <span>Stack</span>
            <span className="text-neutral-400">Tools</span>
          </div>
          <span className="text-[10px] font-bold text-neutral-900">{PORTFOLIO_NAV_IN_BAR_BRAND_LABEL}</span>
          <div className="flex items-center justify-end gap-1">
            <span className="h-4 w-4 rounded-full border border-neutral-200 bg-white" />
            <span className="h-4 w-4 rounded-full border border-neutral-200 bg-white" />
            <span className="h-4 w-4 rounded-full border border-neutral-200 bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (design === 'center-logo-split') {
    return (
      <div className="mt-3 overflow-hidden rounded-lg bg-neutral-900/90 px-2.5 py-2">
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center justify-end gap-2 text-[8px] text-white/90">
            <span>Home</span>
            <span className="text-white/60">About</span>
          </div>
          <span className="text-[10px] font-bold text-white">{PORTFOLIO_NAV_IN_BAR_BRAND_LABEL}</span>
          <div className="flex items-center justify-start gap-2 text-[8px] text-white/90">
            <span className="text-white/60">Work</span>
            <span>Contact</span>
          </div>
        </div>
      </div>
    );
  }

  if (design === 'logo-left-nav-contact') {
    return (
      <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-white px-2.5 py-2 shadow-sm">
        <div className="flex w-full items-center justify-between gap-3">
          <span className="text-[11px] font-bold text-neutral-900">{PORTFOLIO_NAV_IN_BAR_BRAND_LABEL}</span>
          <div className="flex items-center gap-2 text-[8px] text-neutral-700">
            <span className="border-b border-neutral-900 pb-px">About</span>
            <span>Blog</span>
            <span className="inline-flex items-center gap-0.5 rounded-md bg-neutral-900 px-1.5 py-0.5 text-[7px] font-semibold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white/90" aria-hidden />
              Contact
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (design === 'case-overlay') {
    return (
      <div className="mt-3 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <span className="text-[8px] font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
            Stack
          </span>
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[7px] font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            L
          </span>
          <span className="justify-self-end text-[8px] font-semibold uppercase tracking-[0.14em] text-white">
            Menu
          </span>
        </div>
      </div>
    );
  }

  if (design === 'duten-panel') {
    return (
      <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 p-2">
        <div className="rounded-full border border-neutral-300/80 bg-neutral-50 px-3 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[7px] text-neutral-400">Stack</span>
            <span className="text-[8px] font-bold text-neutral-900">Logo</span>
            <span className="text-[7px] font-medium uppercase tracking-[0.12em] text-neutral-700">Menu</span>
          </div>
        </div>
        <p className="mt-1.5 text-center text-[7px] text-neutral-400">La pilule se déplie en panneau</p>
      </div>
    );
  }

  if (design === 'half-panel-left') {
    return (
      <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
        <div className="grid grid-cols-2">
          <div className="bg-neutral-300/40 p-2 text-[6px] text-neutral-500">Page</div>
          <div className="space-y-1.5 bg-[#C8C9B8] p-2">
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-bold text-neutral-900">Logo</span>
              <span className="text-[7px] text-neutral-700">×</span>
            </div>
            <p className="text-[6px] text-neutral-600">Discover Pages</p>
            <div className="grid grid-cols-2 gap-1 text-[6px] text-neutral-800">
              <span className="underline">Home</span>
              <span>Work</span>
            </div>
          </div>
        </div>
        <p className="py-1 text-center text-[6px] text-neutral-400">Icône menu en haut à droite</p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <span className="truncate text-[11px] font-bold" style={{ color: strongText }}>
          {PORTFOLIO_NAV_IN_BAR_BRAND_LABEL}
        </span>
        <div className="flex items-center gap-2 text-[9px]">
          <span
            className="border-b pb-px font-medium"
            style={{ color: accent, borderColor: accent }}
          >
            Stack
          </span>
          <span style={{ color: muted }}>Tools</span>
        </div>
        <span
          className="justify-self-end rounded border px-1.5 py-0.5 text-[9px]"
          style={{ color: strongText, borderColor: muted }}
        >
          Call me
        </span>
      </div>
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
  if (options.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
        Aucun lien trouvé dans la section Links du profil. Ajoutez-les dans Creator Studio pour les
        afficher dans la barre.
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
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Liens affichés
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Choisissez jusqu&apos;à {maxLinks} liens de la section Links. Laissez tout désélectionné pour
          afficher automatiquement les premiers liens disponibles.
        </p>
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
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : disabled
                    ? 'cursor-not-allowed border-neutral-200 bg-white text-neutral-300'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <LinkBrandIcon
                url={link.href}
                platform={link.platform}
                iconUrl={link.iconUrl}
                size="compact"
              />
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>
      {selectedIds.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-sm text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline"
        >
          Réinitialiser (affichage automatique)
        </button>
      ) : null}
    </div>
  );
}

function NavTriZoneSocialLinkStyleEditor({
  navigation,
  onChange,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  const size = navigation.triZoneSocialLinkSize ?? 'sm';
  const gap = navigation.triZoneSocialLinkGap ?? 'md';
  const monochrome = navigation.triZoneSocialLinkMonochrome ?? false;

  const chipClass = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-medium transition ${
      active
        ? 'border-neutral-900 bg-neutral-900 text-white'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
    }`;

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Style des icônes de lien
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Taille, espacement et rendu noir &amp; blanc des logos de profil (max. 3).
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-700">Taille</p>
        <div className="flex flex-wrap gap-2">
          {PORTFOLIO_NAV_TRI_ZONE_SOCIAL_LINK_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={chipClass(size === option.value)}
              onClick={() => onChange({ triZoneSocialLinkSize: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-700">Espacement</p>
        <div className="flex flex-wrap gap-2">
          {PORTFOLIO_NAV_TRI_ZONE_SOCIAL_LINK_GAP_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={chipClass(gap === option.value)}
              onClick={() => onChange({ triZoneSocialLinkGap: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/60 px-3 py-2.5">
        <div>
          <p className="text-sm font-medium text-neutral-800">Noir &amp; blanc</p>
          <p className="text-xs text-neutral-500">Désactive les couleurs de marque des plateformes.</p>
        </div>
        <input
          type="checkbox"
          checked={monochrome}
          onChange={(event) => onChange({ triZoneSocialLinkMonochrome: event.target.checked })}
          className="h-4 w-4 rounded border-neutral-300"
        />
      </label>
    </div>
  );
}

function NavContactButtonProfileEditor({
  title,
  profile,
  onChange,
  editorialChannel,
}: {
  title: string;
  profile: PortfolioNavEditorialBarContactChannelSettings;
  onChange: (patch: Partial<PortfolioNavEditorialBarContactChannelSettings>) => void;
  /** When set, icon picker is limited to phone or mail glyphs only. */
  editorialChannel?: 'phone' | 'mail';
}) {
  const display = profile.display;
  const iconPosition = profile.iconPosition;
  const shape = profile.shape;
  const iconOptions = editorialChannel
    ? portfolioNavContactCtaIconOptionsForEditorialChannel(editorialChannel)
    : PORTFOLIO_NAV_CONTACT_CTA_ICON_OPTIONS;

  const chipClass = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-medium transition ${
      active
        ? 'border-neutral-900 bg-neutral-900 text-white'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
    }`;

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{title}</p>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-neutral-700">Libellé</span>
        <input
          type="text"
          value={profile.label}
          maxLength={32}
          onChange={(event) => onChange({ label: event.target.value.slice(0, 32) })}
          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Affichage</span>
          <select
            value={display}
            onChange={(event) =>
              onChange({
                display: event.target.value as PortfolioNavContactButtonDisplay,
              })
            }
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
          >
            <option value="icon">Icône seule</option>
            <option value="button">Bouton avec libellé</option>
          </select>
        </label>
        {display === 'button' ? (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-neutral-700">Position icône</span>
            <select
              value={iconPosition}
              onChange={(event) =>
                onChange({
                  iconPosition: event.target.value as PortfolioNavContactButtonIconPosition,
                })
              }
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
            >
              {PORTFOLIO_NAV_CONTACT_BUTTON_ICON_POSITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-700">Cadre du bouton</p>
        <div className="flex flex-wrap gap-2">
          {PORTFOLIO_NAV_CONTACT_BUTTON_SHAPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              title={option.description}
              className={chipClass(shape === option.value)}
              onClick={() => onChange({ shape: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {display === 'icon' || (display === 'button' && iconPosition !== 'none') ? (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Icône</p>
          <div className="flex flex-wrap gap-2">
            {iconOptions.map((option) => {
              const active = profile.icon === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  title={option.description}
                  onClick={() =>
                    onChange({
                      icon: option.value as PortfolioNavContactCtaIcon,
                    })
                  }
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                    active
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <PortfolioNavContactCtaGlyph variant={option.value} className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NavEditorialBarContactChannelsEditor({
  navigation,
  onChange,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  const phoneProfile = mergeEditorialBarContactChannelSettings(
    navigation.editorialBarPhoneContact,
    undefined,
    DEFAULT_EDITORIAL_BAR_PHONE_CONTACT
  );
  const mailProfile = mergeEditorialBarContactChannelSettings(
    navigation.editorialBarMailContact,
    undefined,
    DEFAULT_EDITORIAL_BAR_MAIL_CONTACT
  );

  return (
    <div className="space-y-4">
      <NavContactButtonProfileEditor
        title="Réglages · Téléphone"
        profile={phoneProfile}
        editorialChannel="phone"
        onChange={(patch) =>
          onChange({
            editorialBarPhoneContact: { ...phoneProfile, ...patch },
          })
        }
      />

      <NavContactButtonProfileEditor
        title="Réglages · E-mail"
        profile={mailProfile}
        editorialChannel="mail"
        onChange={(patch) =>
          onChange({
            editorialBarMailContact: { ...mailProfile, ...patch },
          })
        }
      />
    </div>
  );
}

function NavEditorialBarVisibilityToggles({
  navigation,
  onChange,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  const showSocial = navigation.editorialBarShowSocial ?? false;
  const showPhone = navigation.editorialBarShowPhone ?? false;
  const showMail = navigation.editorialBarShowMail ?? false;

  const chipClass = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
      active
        ? 'border-neutral-900 bg-neutral-900 text-white'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
    }`;

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
        Afficher dans la barre
      </p>
      <p className="text-sm text-neutral-500">
        Activez un ou plusieurs éléments — liens sociaux, téléphone et e-mail peuvent coexister.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={chipClass(showSocial)}
          onClick={() =>
            onChange({
              editorialBarShowSocial: !showSocial,
              linkIconsEnabled: !showSocial ? true : navigation.linkIconsEnabled,
            })
          }
        >
          Liens sociaux
        </button>
        <button
          type="button"
          className={chipClass(showPhone)}
          onClick={() =>
            onChange({
              editorialBarShowPhone: !showPhone,
              contactButtonEnabled: !showPhone ? true : navigation.contactButtonEnabled,
            })
          }
        >
          Téléphone
        </button>
        <button
          type="button"
          className={chipClass(showMail)}
          onClick={() =>
            onChange({
              editorialBarShowMail: !showMail,
              contactButtonEnabled: !showMail ? true : navigation.contactButtonEnabled,
            })
          }
        >
          E-mail
        </button>
      </div>
    </div>
  );
}

function NavContactButtonStyleEditor({
  navigation,
  onChange,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  const display = navigation.contactButtonDisplay ?? 'button';
  const iconPosition = navigation.contactButtonIconPosition ?? 'left';
  const shape = navigation.contactButtonShape ?? 'rounded';

  const chipClass = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-medium transition ${
      active
        ? 'border-neutral-900 bg-neutral-900 text-white'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
    }`;

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-neutral-700">Libellé</span>
        <input
          type="text"
          value={navigation.contactButtonLabel ?? 'Contact'}
          maxLength={32}
          onChange={(event) =>
            onChange({ contactButtonLabel: event.target.value.slice(0, 32) })
          }
          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Affichage</span>
          <select
            value={display}
            onChange={(event) =>
              onChange({
                contactButtonDisplay: event.target.value as PortfolioNavContactButtonDisplay,
              })
            }
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
          >
            <option value="icon">Icône seule</option>
            <option value="button">Bouton avec libellé</option>
          </select>
        </label>
        {display === 'button' ? (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-neutral-700">Position icône</span>
            <select
              value={iconPosition}
              onChange={(event) =>
                onChange({
                  contactButtonIconPosition: event.target.value as PortfolioNavContactButtonIconPosition,
                })
              }
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
            >
              {PORTFOLIO_NAV_CONTACT_BUTTON_ICON_POSITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-700">Cadre du bouton</p>
        <div className="flex flex-wrap gap-2">
          {PORTFOLIO_NAV_CONTACT_BUTTON_SHAPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              title={option.description}
              className={chipClass(shape === option.value)}
              onClick={() => onChange({ contactButtonShape: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {display === 'icon' || (display === 'button' && iconPosition !== 'none') ? (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Icône</p>
          <div className="flex flex-wrap gap-2">
            {PORTFOLIO_NAV_CONTACT_CTA_ICON_OPTIONS.map((option) => {
              const active = (navigation.contactButtonIcon ?? 'phone') === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  title={option.description}
                  onClick={() =>
                    onChange({
                      contactButtonIcon: option.value as PortfolioNavContactCtaIcon,
                    })
                  }
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                    active
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <PortfolioNavContactCtaGlyph variant={option.value} className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
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
  const menuTrigger = navigation.caseOverlayMenuTrigger ?? 'text';

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Barre du menu plein écran
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Logo, emplacement du bouton menu et style du déclencheur.
        </p>
      </div>

      <PortfolioBackgroundImageUpload
        label="Logo"
        url={navigation.customExtraLogoUrl ?? ''}
        onChange={(customExtraLogoUrl) => onChange({ customExtraLogoUrl })}
        helperText="PNG, SVG ou WebP recommandé — fond transparent de préférence."
      />
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
          Taille du logo
        </span>
        <input
          type="range"
          min={18}
          max={48}
          step={1}
          value={navigation.customExtraLogoSizePx ?? 28}
          onChange={(event) =>
            onChange({
              customExtraLogoSizePx: clampPortfolioNavCustomExtraLogoSizePx(
                Number(event.target.value),
                28
              ),
            })
          }
          className="mt-2 w-full"
        />
        <p className="mt-1 text-xs text-neutral-500">
          {navigation.customExtraLogoSizePx ?? 28}px
        </p>
      </label>

      <OptionGrid
        label="Emplacement menu / logo"
        options={[
          {
            value: 'right',
            label: 'Menu à droite',
            description: 'Logo au centre, menu à droite (défaut).',
          },
          {
            value: 'left',
            label: 'Menu à gauche',
            description: 'Menu à gauche, logo à droite — section active au centre.',
          },
        ]}
        value={navigation.caseOverlayMenuSide ?? 'right'}
        onChange={(caseOverlayMenuSide) => onChange({ caseOverlayMenuSide })}
        columns={2}
      />

      <OptionGrid
        label="Bouton menu"
        options={[
          {
            value: 'text',
            label: 'Texte',
            description: 'Menu / Close avec animation.',
          },
          {
            value: 'icon',
            label: 'Icône',
            description: 'Hamburger, points ou autre glyphe simple.',
          },
        ]}
        value={menuTrigger}
        onChange={(caseOverlayMenuTrigger) => onChange({ caseOverlayMenuTrigger })}
        columns={2}
      />

      {menuTrigger === 'icon' ? (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Icône du menu</p>
          <div className="flex flex-wrap gap-2">
            {PORTFOLIO_NAV_MENU_CONTROL_ICON_OPTIONS.map((option) => {
              const active = (navigation.menuControlIcon ?? 'menu') === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  title={option.description}
                  onClick={() => onChange({ menuControlIcon: option.value })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <ToggleRow
        label="Bascule clair / sombre dans la barre"
        description="Affiche une icône soleil / lune à côté du bouton menu."
        checked={showColorModeToggleInNav}
        onChange={(next) => onGlobalChange?.({ showColorModeToggleInNav: next })}
      />
    </div>
  );
}

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
  const menuTrigger = navigation.caseOverlayMenuTrigger ?? 'text';
  const showContact = navigation.dutenPanelShowContact ?? false;
  const showSocial = navigation.dutenPanelShowSocial ?? false;
  const showHeroWord = navigation.dutenPanelShowHeroWord ?? false;

  const chipClass = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
      active
        ? 'border-neutral-900 bg-neutral-900 text-white'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
    }`;

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Panneau Duten
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Panneau clair arrondi : logo, colonnes de liens, marge extérieure et déclencheur menu.
        </p>
      </div>

      <PortfolioBackgroundImageUpload
        label="Logo"
        url={navigation.customExtraLogoUrl ?? ''}
        onChange={(customExtraLogoUrl) => onChange({ customExtraLogoUrl })}
        helperText="PNG, SVG ou WebP recommandé — fond transparent de préférence."
      />
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
          Taille du logo
        </span>
        <input
          type="range"
          min={18}
          max={56}
          step={1}
          value={navigation.customExtraLogoSizePx ?? 32}
          onChange={(event) =>
            onChange({
              customExtraLogoSizePx: clampPortfolioNavCustomExtraLogoSizePx(
                Number(event.target.value),
                32
              ),
            })
          }
          className="mt-2 w-full"
        />
        <p className="mt-1 text-xs text-neutral-500">
          {navigation.customExtraLogoSizePx ?? 32}px
        </p>
      </label>

      <OptionGrid
        label="Colonnes de liens"
        options={[
          {
            value: '2',
            label: '2 colonnes',
            description: 'Grille éditoriale comme la référence Duten.',
          },
          {
            value: '1',
            label: '1 colonne',
            description: 'Liste verticale pour peu de sections.',
          },
        ]}
        value={String(navigation.dutenPanelColumns ?? 2)}
        onChange={(value) =>
          onChange({ dutenPanelColumns: value === '1' ? 1 : 2 })
        }
        columns={2}
      />

      <OptionGrid
        label="Emplacement menu / logo"
        options={[
          {
            value: 'right',
            label: 'Menu à droite',
            description: 'Logo au centre, menu à droite (défaut).',
          },
          {
            value: 'left',
            label: 'Menu à gauche',
            description: 'Menu à gauche, logo à droite.',
          },
        ]}
        value={navigation.caseOverlayMenuSide ?? 'right'}
        onChange={(caseOverlayMenuSide) => onChange({ caseOverlayMenuSide })}
        columns={2}
      />

      <OptionGrid
        label="Bouton menu"
        options={[
          {
            value: 'text',
            label: 'Texte',
            description: 'Menu / Close avec animation.',
          },
          {
            value: 'icon',
            label: 'Icône',
            description: 'Hamburger, points ou autre glyphe simple.',
          },
        ]}
        value={menuTrigger}
        onChange={(caseOverlayMenuTrigger) => onChange({ caseOverlayMenuTrigger })}
        columns={2}
      />

      {menuTrigger === 'icon' ? (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Icône du menu</p>
          <div className="flex flex-wrap gap-2">
            {PORTFOLIO_NAV_MENU_CONTROL_ICON_OPTIONS.map((option) => {
              const active = (navigation.menuControlIcon ?? 'menu') === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  title={option.description}
                  onClick={() => onChange({ menuControlIcon: option.value })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-3 border-t border-neutral-200/80 pt-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            Mot d&apos;affichage
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Grand mot personnalisable sous les liens — comme un sigle ou un nom de marque.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={chipClass(showHeroWord)}
            onClick={() => onChange({ dutenPanelShowHeroWord: !showHeroWord })}
          >
            Afficher le mot
          </button>
        </div>
        {showHeroWord ? (
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
              Texte affiché
            </span>
            <input
              type="text"
              value={navigation.dutenPanelHeroWord ?? ''}
              onChange={(event) =>
                onChange({ dutenPanelHeroWord: event.target.value.slice(0, 32) })
              }
              placeholder="VSIUX"
              maxLength={32}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Jusqu&apos;à 32 caractères — affiché en très grande taille en bas du panneau.
            </p>
          </label>
        ) : null}
      </div>

      <div className="space-y-2 border-t border-neutral-200/80 pt-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Bas du panneau ouvert
        </p>
        <p className="text-sm text-neutral-500">
          Contact et réseaux sociaux en bas du menu déplié — activables séparément.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={chipClass(showContact)}
            onClick={() => onChange({ dutenPanelShowContact: !showContact })}
          >
            Contact
          </button>
          <button
            type="button"
            className={chipClass(showSocial)}
            onClick={() => onChange({ dutenPanelShowSocial: !showSocial })}
          >
            Social links
          </button>
        </div>
      </div>

      {showSocial ? (
        <NavTriZoneSocialLinkPicker
          options={options}
          selectedIds={navigation.dutenPanelSocialLinkIds ?? []}
          onChange={(dutenPanelSocialLinkIds) => onChange({ dutenPanelSocialLinkIds })}
          maxLinks={5}
        />
      ) : null}

      <ToggleRow
        label="Bascule clair / sombre dans le panneau"
        description="Affiche une icône soleil / lune à côté du bouton menu."
        checked={showColorModeToggleInNav}
        onChange={(next) => onGlobalChange?.({ showColorModeToggleInNav: next })}
      />
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
  const menuTrigger = navigation.caseOverlayMenuTrigger ?? 'text';
  const showContact = navigation.dutenPanelShowContact ?? false;
  const showSocial = navigation.dutenPanelShowSocial ?? false;

  const chipClass = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
      active
        ? 'border-neutral-900 bg-neutral-900 text-white'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
    }`;

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Demi-panneau droit
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Icône menu en haut à droite — tiroir éditorial depuis la droite (50 %), contact et réseaux en bas.
        </p>
      </div>

      <PortfolioBackgroundImageUpload
        label="Logo"
        url={navigation.customExtraLogoUrl ?? ''}
        onChange={(customExtraLogoUrl) => onChange({ customExtraLogoUrl })}
        helperText="PNG, SVG ou WebP recommandé — fond transparent de préférence."
      />
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
          Taille du logo
        </span>
        <input
          type="range"
          min={18}
          max={56}
          step={1}
          value={navigation.customExtraLogoSizePx ?? 32}
          onChange={(event) =>
            onChange({
              customExtraLogoSizePx: clampPortfolioNavCustomExtraLogoSizePx(
                Number(event.target.value),
                32
              ),
            })
          }
          className="mt-2 w-full"
        />
        <p className="mt-1 text-xs text-neutral-500">
          {navigation.customExtraLogoSizePx ?? 32}px
        </p>
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
          Titre au-dessus des liens
        </span>
        <input
          type="text"
          value={navigation.halfPanelDiscoverLabel ?? 'Discover Pages'}
          onChange={(event) => onChange({ halfPanelDiscoverLabel: event.target.value })}
          placeholder="Discover Pages"
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
        />
      </label>

      <OptionGrid
        label="Colonnes de liens"
        options={[
          {
            value: '2',
            label: '2 colonnes',
            description: 'Grille éditoriale comme la référence.',
          },
          {
            value: '1',
            label: '1 colonne',
            description: 'Liste verticale pour peu de sections.',
          },
        ]}
        value={String(navigation.dutenPanelColumns ?? 2)}
        onChange={(value) =>
          onChange({ dutenPanelColumns: value === '1' ? 1 : 2 })
        }
        columns={2}
      />

      <OptionGrid
        label="Emplacement menu / logo"
        options={[
          {
            value: 'right',
            label: 'Menu à droite',
            description: 'Logo au centre, menu à droite (défaut).',
          },
          {
            value: 'left',
            label: 'Menu à gauche',
            description: 'Menu à gauche, logo à droite.',
          },
        ]}
        value={navigation.caseOverlayMenuSide ?? 'right'}
        onChange={(caseOverlayMenuSide) => onChange({ caseOverlayMenuSide })}
        columns={2}
      />

      <OptionGrid
        label="Bouton menu"
        options={[
          {
            value: 'text',
            label: 'Texte',
            description: 'Menu / Close avec animation.',
          },
          {
            value: 'icon',
            label: 'Icône',
            description: 'Hamburger, points ou autre glyphe simple.',
          },
        ]}
        value={menuTrigger}
        onChange={(caseOverlayMenuTrigger) => onChange({ caseOverlayMenuTrigger })}
        columns={2}
      />

      {menuTrigger === 'icon' ? (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Icône du menu</p>
          <div className="flex flex-wrap gap-2">
            {PORTFOLIO_NAV_MENU_CONTROL_ICON_OPTIONS.map((option) => {
              const active = (navigation.menuControlIcon ?? 'menu') === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  title={option.description}
                  onClick={() => onChange({ menuControlIcon: option.value })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-2 border-t border-neutral-200/80 pt-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Bas du panneau ouvert
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={chipClass(showContact)}
            onClick={() => onChange({ dutenPanelShowContact: !showContact })}
          >
            Contact
          </button>
          <button
            type="button"
            className={chipClass(showSocial)}
            onClick={() => onChange({ dutenPanelShowSocial: !showSocial })}
          >
            Social links
          </button>
        </div>
      </div>

      {showSocial ? (
        <NavTriZoneSocialLinkPicker
          options={options}
          selectedIds={navigation.dutenPanelSocialLinkIds ?? []}
          onChange={(dutenPanelSocialLinkIds) => onChange({ dutenPanelSocialLinkIds })}
          maxLinks={5}
        />
      ) : null}

      <ToggleRow
        label="Bascule clair / sombre dans le panneau"
        description="Affiche une icône soleil / lune à côté du bouton menu."
        checked={showColorModeToggleInNav}
        onChange={(next) => onGlobalChange?.({ showColorModeToggleInNav: next })}
      />
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
  const showLogo = navigation.floatingPillShowLogo ?? false;
  const showContact = navigation.floatingPillShowContact ?? true;

  const chipClass = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
      active
        ? 'border-neutral-900 bg-neutral-900 text-white'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
    }`;

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
        Afficher dans la capsule
      </p>
      <p className="text-sm text-neutral-500">
        Le logo est masqué par défaut. Activez logo et/ou contact selon vos besoins.
      </p>
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
          Logo
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
          Contact
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
  const menuMode = normalizePortfolioNavFloatingPillMenuMode(navigation.contentMode);

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Menu de navigation
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Affichage des liens de section au centre de la capsule — texte ou icônes seules (pas les
          liens sociaux). Sur mobile : barre logo pleine largeur ou tiroir menu (réglage dans Général).
        </p>
      </div>
      <OptionGrid
        label="Style du menu"
        options={PORTFOLIO_NAV_FLOATING_PILL_MENU_MODE_OPTIONS}
        value={menuMode}
        onChange={(contentMode) => onChange({ contentMode })}
        columns={2}
      />
      <NavFloatingPillVisibilityToggles navigation={navigation} onChange={onChange} />
      <ToggleRow
        label="Bascule clair / sombre dans la capsule"
        description="Affiche une icône soleil / lune à droite du menu, avant le bouton contact."
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
  const showSocial = navigation.editorialBarShowSocial ?? false;

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Zone droite (Barre éditoriale)
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Liens sociaux, téléphone et e-mail — affichez ce que vous voulez, en même temps si besoin.
        </p>
      </div>

      <NavEditorialBarVisibilityToggles navigation={navigation} onChange={onChange} />

      {showSocial ? (
        <>
          <NavTriZoneSocialLinkPicker
            options={options}
            selectedIds={navigation.triZoneSocialLinkIds ?? []}
            onChange={(triZoneSocialLinkIds) => onChange({ triZoneSocialLinkIds })}
          />
          <NavTriZoneSocialLinkStyleEditor navigation={navigation} onChange={onChange} />
        </>
      ) : null}

      <NavEditorialBarContactChannelsEditor navigation={navigation} onChange={onChange} />
    </div>
  );
}

function NavTriZoneVisibilityToggles({
  navigation,
  onChange,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  const showSocial = navigation.triZoneShowSocial ?? false;
  const showPhone = navigation.triZoneShowPhone ?? false;
  const showMail = navigation.triZoneShowMail ?? false;

  const chipClass = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
      active
        ? 'border-neutral-900 bg-neutral-900 text-white'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
    }`;

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
        Afficher dans la barre
      </p>
      <p className="text-sm text-neutral-500">
        Activez un ou plusieurs éléments — liens sociaux, téléphone et e-mail peuvent coexister.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={chipClass(showSocial)}
          onClick={() =>
            onChange({
              triZoneShowSocial: !showSocial,
              linkIconsEnabled: !showSocial ? true : navigation.linkIconsEnabled,
            })
          }
        >
          Liens sociaux
        </button>
        <button
          type="button"
          className={chipClass(showPhone)}
          onClick={() =>
            onChange({
              triZoneShowPhone: !showPhone,
              contactButtonEnabled: !showPhone ? true : navigation.contactButtonEnabled,
            })
          }
        >
          Téléphone
        </button>
        <button
          type="button"
          className={chipClass(showMail)}
          onClick={() =>
            onChange({
              triZoneShowMail: !showMail,
              contactButtonEnabled: !showMail ? true : navigation.contactButtonEnabled,
            })
          }
        >
          E-mail
        </button>
      </div>
    </div>
  );
}

function NavTriZoneSideSlotEditor({
  navigation,
  options,
  onChange,
}: {
  navigation: PortfolioNavSettings;
  options: PortfolioNavChromeLink[];
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  const showSocial = navigation.triZoneShowSocial ?? false;

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Zone latérale (Nav · logo · social)
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Liens sociaux, téléphone et e-mail — affichez ce que vous voulez, en même temps si besoin.
        </p>
      </div>

      <NavTriZoneVisibilityToggles navigation={navigation} onChange={onChange} />

      {showSocial ? (
        <>
          <NavTriZoneSocialLinkPicker
            options={options}
            selectedIds={navigation.triZoneSocialLinkIds ?? []}
            onChange={(triZoneSocialLinkIds) => onChange({ triZoneSocialLinkIds })}
          />
          <NavTriZoneSocialLinkStyleEditor navigation={navigation} onChange={onChange} />
        </>
      ) : null}

      <NavEditorialBarContactChannelsEditor navigation={navigation} onChange={onChange} />
    </div>
  );
}

function NavLogoLeftContactPlacementEditor({
  navigation,
  onChange,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  const logoSide = navigation.logoLeftNavContactLogoSide ?? 'left';

  const modeButtonClass = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
      active
        ? 'border-neutral-900 bg-neutral-900 text-white'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
    }`;

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Placement logo / navigation
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Logo à gauche et menus + contact à droite, ou l&apos;inverse. Le bouton Contact reste
          toujours au bord extérieur (premier élément côté gauche, dernier côté droite).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={modeButtonClass(logoSide === 'left')}
          onClick={() => onChange({ logoLeftNavContactLogoSide: 'left' })}
        >
          Logo à gauche
        </button>
        <button
          type="button"
          className={modeButtonClass(logoSide === 'right')}
          onClick={() => onChange({ logoLeftNavContactLogoSide: 'right' })}
        >
          Logo à droite
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white px-2.5 py-2 shadow-sm">
        {logoSide === 'left' ? (
          <div className="flex w-full items-center justify-between gap-3">
            <span className="text-[11px] font-bold text-neutral-900">{PORTFOLIO_NAV_IN_BAR_BRAND_LABEL}</span>
            <div className="flex items-center gap-2 text-[8px] text-neutral-700">
              <span className="border-b border-neutral-900 pb-px">About</span>
              <span>Blog</span>
              <span className="inline-flex items-center gap-0.5 rounded-md bg-neutral-900 px-1.5 py-0.5 text-[7px] font-semibold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white/90" aria-hidden />
                Contact
              </span>
            </div>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[8px] text-neutral-700">
              <span className="inline-flex items-center gap-0.5 rounded-md bg-neutral-900 px-1.5 py-0.5 text-[7px] font-semibold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white/90" aria-hidden />
                Contact
              </span>
              <span className="border-b border-neutral-900 pb-px">About</span>
              <span>Blog</span>
            </div>
            <span className="text-[11px] font-bold text-neutral-900">{PORTFOLIO_NAV_IN_BAR_BRAND_LABEL}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            Bouton Contact
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Libellé, icône, cadre et mode d&apos;affichage — comme sur les autres designs de barre.
          </p>
        </div>
        <NavContactButtonStyleEditor navigation={navigation} onChange={onChange} />
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
  const leftKeys = navigation.splitNavLeftSectionKeys ?? [];
  const autoSplit = leftKeys.length === 0;

  const modeButtonClass = (active: boolean) =>
    `rounded-full border px-2.5 py-1 text-xs font-medium transition ${
      active
        ? 'border-neutral-900 bg-neutral-900 text-white'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
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
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Répartition gauche / droite
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Choisissez quels liens de section apparaissent à gauche ou à droite du logo centré.
          Laissez tout en automatique pour une répartition 50/50 selon l&apos;ordre des sections.
        </p>
      </div>

      {autoSplit ? (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-500">
          Répartition automatique active.
        </p>
      ) : (
        <button
          type="button"
          onClick={() => onChange({ splitNavLeftSectionKeys: [] })}
          className="text-sm text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline"
        >
          Réinitialiser (répartition automatique)
        </button>
      )}

      <div className="space-y-2">
        {PORTFOLIO_NAV_SECTION_META.map((section) => {
          const label = navigation.itemLabels[section.key] || section.title;
          const onLeft = leftKeys.includes(section.key);
          return (
            <div
              key={section.key}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200/80 bg-white px-3 py-2"
            >
              <span className="text-sm font-medium text-neutral-800">{label}</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className={modeButtonClass(!autoSplit && onLeft)}
                  onClick={() => setSide(section.key, 'left')}
                >
                  Gauche
                </button>
                <button
                  type="button"
                  className={modeButtonClass(!autoSplit && !onLeft)}
                  onClick={() => setSide(section.key, 'right')}
                >
                  Droite
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NavLayoutDesignGrid({
  value,
  navigation,
  onChange,
}: {
  value: PortfolioNavLayoutDesign;
  navigation: PortfolioNavSettings;
  onChange: (design: PortfolioNavLayoutDesign) => void;
}) {
  const palette = mergeNavPalette(DEFAULT_NAV_PALETTE, navigation.navPalette);
  const accent = resolveHeroPaletteColor(palette, 'principal');
  const strongText = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
        Designs navigation
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        Mise en page prÃªte Ã  l&apos;emploi : logo ou nom, liens de section et contact. Les marges
        latÃ©rales suivent le gutter global du portfolio.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {PORTFOLIO_NAV_LAYOUT_DESIGN_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                  : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
              }`}
            >
              <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{option.description}</p>
              <NavLayoutDesignPreview
                design={option.value}
                accent={accent}
                strongText={strongText}
                muted={muted}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavLookPresetGrid({
  value,
  navigation,
  onChange,
}: {
  value: PortfolioNavLookPreset | null;
  navigation: PortfolioNavSettings;
  onChange: (preset: PortfolioNavLookPreset) => void;
}) {
  const palette = mergeNavPalette(DEFAULT_NAV_PALETTE, navigation.navPalette);
  const bindings = mergeNavColorBindings(DEFAULT_NAV_COLOR_BINDINGS, navigation.navColorBindings);
  const accent = resolveHeroPaletteColor(palette, 'principal');
  const surface = resolveHeroPaletteColor(palette, 'neutre');
  const strongText = resolveHeroPaletteColor(palette, 'texteFort');
  const pageFill = resolveHeroPaletteColor(palette, 'fond');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const barFill = resolveHeroPaletteColor(palette, 'neutre');
  const barBorder = resolveHeroPaletteColor(palette, 'bordure');
  const hoverIcon = resolveHeroPaletteColor(palette, bindings.itemHoverIcon);
  const hoverText = resolveHeroPaletteColor(palette, bindings.itemHoverText);
  const hoverBackground = resolveHeroPaletteColor(palette, bindings.itemHoverBackground);

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
        Maquettes navigation
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        Structure rÃ©utilisable (classic + icons + active style). Survolez les pastilles grises pour
        prÃ©visualiser le hover â€” couleurs liÃ©es Ã  la palette Nav.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PORTFOLIO_NAV_LOOK_PRESET_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                  : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
              }`}
            >
              <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{option.description}</p>
              <NavLookPresetPreview
                preset={option.value}
                accent={accent}
                surface={surface}
                strongText={strongText}
                pageFill={pageFill}
                muted={muted}
                barFill={barFill}
                barBorder={barBorder}
                hoverIcon={hoverIcon}
                hoverText={hoverText}
                hoverBackground={hoverBackground}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

type NavSettingsTab = 'general' | 'design';

const NAV_SETTINGS_TABS: { id: NavSettingsTab; label: string; description: string }[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Visibility, navigation type, and when the menu appears.',
  },
  {
    id: 'design',
    label: 'Design',
    description: 'ModÃ¨les de mise en page : logo, liens de section, contact ou rÃ©seaux sociaux.',
  },
];

function NavFloatingOnlyNote() {
  return (
    <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
      These options apply to the floating nav bar (Default, Pages, and Split screen types). Switch the
      navigation type in General to use them.
    </p>
  );
}

function patchNavColorField(
  navigation: PortfolioNavSettings,
  slot: NavColorSlot,
  hex: string
): Partial<PortfolioNavSettings> {
  if (navigation.useNavPalette === false) {
    return { [navSlotHexField(slot)]: hex } as Partial<PortfolioNavSettings>;
  }
  return patchNavSlotColor(navigation, slot, hex);
}

/** Same Use-color-palette control as Hero â€” shown in Navigation color subsections. */
function NavUsePaletteToggle({
  navigation,
  onChange,
  description,
  enabledHint,
  disabledHint,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
  description: string;
  enabledHint?: string;
  disabledHint?: string;
}) {
  return (
    <SectionHeroPaletteToggle
      enabled={navigation.useNavPalette !== false}
      onChange={(useNavPalette) =>
        onChange(
          useNavPalette
            ? { useNavPalette, ...applyNavPaletteToSettings(navigation) }
            : { useNavPalette }
        )
      }
      title="Use global color palette"
      description={description}
      enabledHint={
        enabledHint ??
        'Palette mode â€” pick which Global token each color uses (edit tokens under Global â†’ Theme). Free hex pickers stay locked.'
      }
      disabledHint={
        disabledHint ??
        'Manual mode â€” color pickers set hex values directly and are no longer overwritten by the global palette.'
      }
    />
  );
}

/**
 * Palette on â†’ token binding only (hex locked).
 * Palette off â†’ free hex picker.
 */
function NavColorField({
  navigation,
  onChange,
  slot,
  label,
  description,
  value,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
  slot: NavColorSlot;
  label: string;
  description?: string;
  value: string;
}) {
  const paletteOn = navigation.useNavPalette !== false;

  if (!paletteOn) {
    return (
      <GlobalColorField
        label={label}
        description={description}
        value={value}
        onChange={(hex) => onChange(patchNavColorField(navigation, slot, hex))}
      />
    );
  }

  const palette = mergeNavPalette(DEFAULT_NAV_PALETTE, navigation.navPalette);
  const bindings = mergeNavColorBindings(DEFAULT_NAV_COLOR_BINDINGS, navigation.navColorBindings);
  const token = bindings[slot];
  const resolved = resolveHeroPaletteColor(palette, token);

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
          {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
        </div>
        <span
          className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-neutral-200"
          style={{ backgroundColor: resolved }}
          title={resolved}
          aria-hidden
        />
      </div>
      <select
        value={token}
        onChange={(event) =>
          onChange(
            patchNavColorBinding(navigation, slot, event.target.value as HeroPaletteTokenId)
          )
        }
        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
        aria-label={`${label} palette token`}
      >
        {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-neutral-500">
        Bound to token Â· edit hex under{' '}
        <span className="font-semibold text-neutral-700">Global â†’ Theme</span>
      </p>
    </div>
  );
}

function NavPalettePanel({
  navigation,
  onChange,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
}) {
  const palette = mergeNavPalette(DEFAULT_NAV_PALETTE, navigation.navPalette);
  const bindings = mergeNavColorBindings(DEFAULT_NAV_COLOR_BINDINGS, navigation.navColorBindings);
  const paletteOn = navigation.useNavPalette !== false;

  return (
    <div className="space-y-6">
      <NavUsePaletteToggle
        navigation={navigation}
        onChange={onChange}
        description="When on, Navigation colors follow the Global site palette. Turn off to edit colors manually in Bar & buttons, Reveal, and Extras."
        enabledHint="Edit the dark/light token pair under Global â†’ Theme. Bindings below pick which token each nav color uses."
        disabledHint="Global palette tokens still exist, but Navigation uses manual hex colors until you turn this back on."
      />

      <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-600">
        The site color palette lives in <span className="font-semibold">Global â†’ Theme</span> as a
        coupled dark / light pair. Navigation no longer has its own Mode sombre / Mode clair editor.
      </p>

      {paletteOn ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            Color bindings
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Pick which Global token each navigation color uses. Swatches preview the active mode.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PORTFOLIO_NAV_COLOR_SLOT_OPTIONS.map((slot) => {
              const resolved = resolveHeroPaletteColor(palette, bindings[slot.value]);
              return (
                <div
                  key={slot.value}
                  className="rounded-2xl border border-neutral-200/80 bg-white px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-neutral-800">{slot.label}</span>
                    <span
                      className="h-5 w-5 shrink-0 rounded-full border border-neutral-200"
                      style={{ backgroundColor: resolved }}
                      aria-hidden
                    />
                  </div>
                  <select
                    value={bindings[slot.value]}
                    onChange={(event) =>
                      onChange(
                        patchNavColorBinding(
                          navigation,
                          slot.value,
                          event.target.value as HeroPaletteTokenId
                        )
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
                  >
                    {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
                      <option key={token.value} value={token.value}>
                        {token.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-neutral-500">{slot.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-500">
          Palette is off â€” slot bindings are hidden. Turn it back on to bind colors to Global tokens,
          or edit hex fields under Bar & buttons / Reveal / Extras.
        </p>
      )}
    </div>
  );
}

function NavMenuGroupsEditor({
  groups,
  itemLabels,
  onChange,
}: {
  groups: PortfolioNavMenuGroup[];
  itemLabels: PortfolioNavItemLabels;
  onChange: (groups: PortfolioNavMenuGroup[]) => void;
}) {
  const assignedElsewhere = (groupId: string, sectionKey: PortfolioNavSectionKey) =>
    groups.some((group) => group.id !== groupId && group.sectionKeys.includes(sectionKey));

  const toggleSection = (groupId: string, sectionKey: PortfolioNavSectionKey) => {
    onChange(
      groups.map((group) => {
        if (group.id !== groupId) {
          return {
            ...group,
            sectionKeys: group.sectionKeys.filter((key) => key !== sectionKey),
          };
        }
        const has = group.sectionKeys.includes(sectionKey);
        return {
          ...group,
          sectionKeys: has
            ? group.sectionKeys.filter((key) => key !== sectionKey)
            : [...group.sectionKeys, sectionKey],
        };
      })
    );
  };

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Groupes de menu (dropdown)
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Regroupez plusieurs sections sous un même libellé. Chaque groupe devient un menu déroulant
          dans tous les designs de navigation.
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
          Aucun groupe pour le moment. Ajoutez un groupe et choisissez au moins 2 sections.
        </p>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950"
            >
              <div className="flex flex-wrap items-center gap-3">
                <label className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                    Libellé du menu
                  </span>
                  <input
                    type="text"
                    value={group.label}
                    maxLength={48}
                    onChange={(event) =>
                      onChange(
                        groups.map((entry) =>
                          entry.id === group.id
                            ? { ...entry, label: event.target.value }
                            : entry
                        )
                      )
                    }
                    placeholder="ex. Portfolio, Ressources…"
                    className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none ring-orange-500/30 focus:border-orange-400 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onChange(groups.filter((entry) => entry.id !== group.id))}
                  className="rounded-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  Supprimer
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {PORTFOLIO_NAV_SECTION_META.map((section) => {
                  const selected = group.sectionKeys.includes(section.key);
                  const disabled = !selected && assignedElsewhere(group.id, section.key);
                  const sectionLabel =
                    itemLabels[section.key]?.trim() || section.title;
                  return (
                    <button
                      key={section.key}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleSection(group.id, section.key)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        selected
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : disabled
                            ? 'cursor-not-allowed border-neutral-200 bg-white text-neutral-300'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      {sectionLabel}
                    </button>
                  );
                })}
              </div>
              {group.sectionKeys.length < 2 ? (
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Sélectionnez au moins 2 sections pour activer ce dropdown.
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          onChange([
            ...groups,
            {
              id: crypto.randomUUID(),
              label: 'Menu',
              sectionKeys: [],
            },
          ])
        }
        disabled={groups.length >= 8}
        className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Ajouter un groupe
      </button>
    </div>
  );
}

const NAV_MOBILE_LAYOUT_OPTIONS_FR = PORTFOLIO_NAV_MOBILE_LAYOUT_OPTIONS;

function NavigationPanel({
  navigation,
  onChange,
  navSocialLinkOptions = [],
  showColorModeToggleInNav = false,
  onGlobalChange,
}: {
  navigation: PortfolioNavSettings;
  onChange: (patch: Partial<PortfolioNavSettings>) => void;
  navSocialLinkOptions?: PortfolioNavChromeLink[];
  showColorModeToggleInNav?: boolean;
  onGlobalChange?: (patch: PortfolioGlobalSettingsPatch) => void;
}) {
  const [navTab, setNavTab] = useState<NavSettingsTab>('general');
  const navMode = navigation.navMode ?? 'default';
  const usesFloatingNavChrome =
    navMode === 'default' || navMode === 'pages' || navMode === 'split';
  const activeTabMeta = NAV_SETTINGS_TABS.find((tab) => tab.id === navTab) ?? NAV_SETTINGS_TABS[0];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap gap-2">
          {NAV_SETTINGS_TABS.map((tab) => {
            const selected = tab.id === navTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setNavTab(tab.id)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  selected
                    ? 'border-neutral-900 bg-neutral-900 font-semibold text-white'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-neutral-500">{activeTabMeta.description}</p>
      </div>

      {navTab === 'general' ? (
        <div className="space-y-6">
      <ToggleRow
        label="Show navigation"
        description="Menu that jumps between portfolio sections."
        checked={navigation.enabled}
        onChange={(enabled) => onChange({ enabled })}
      />

      <NavUsePaletteToggle
        navigation={navigation}
        onChange={onChange}
        description="When on, Navigation colors follow the semantic palette (Principal, Fond, Bordureâ€¦). Turn off to set each color manually."
      />

      {navigation.enabled ? (
        <>
        <OptionGrid
          label="Fond de la barre"
          options={PORTFOLIO_NAV_BAR_SURFACE_OPTIONS}
          value={navigation.navBarSurface ?? 'neutre'}
          onChange={(navBarSurface) => onChange({ navBarSurface })}
          columns={3}
        />
        <OptionGrid
          label="Hauteur de la barre"
          options={PORTFOLIO_NAV_BAR_HEIGHT_OPTIONS}
          value={navigation.navBarHeight ?? 'md'}
          onChange={(navBarHeight) => onChange({ navBarHeight })}
          columns={3}
        />
        <ToggleRow
          label="Bascule clair / sombre dans la barre"
          description="Affiche une icône soleil / lune dans la navigation pour basculer entre mode clair et sombre."
          checked={showColorModeToggleInNav}
          onChange={(next) => onGlobalChange?.({ showColorModeToggleInNav: next })}
        />

        {usesFloatingNavChrome ? (
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Mobile
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Deux comportements sur écran étroit (&lt; 1024 px) : barre logo pleine largeur ou
                tiroir menu compact. Les deux ouvrent le même panneau de liens.
              </p>
            </div>
            <OptionGrid
              label="Comportement mobile"
              options={NAV_MOBILE_LAYOUT_OPTIONS_FR}
              value={navigation.mobileLayout ?? 'brand-bar'}
              onChange={(mobileLayout) => onChange({ mobileLayout })}
              columns={2}
            />
            {(navigation.mobileLayout ?? 'brand-bar') === 'drawer' ? (
              <>
                <OptionGrid
                  label="Marque à côté du menu"
                  options={PORTFOLIO_NAV_MOBILE_BRAND_OPTIONS}
                  value={navigation.mobileBrand ?? 'none'}
                  onChange={(mobileBrand) => onChange({ mobileBrand })}
                  columns={3}
                />
                {(navigation.mobileBrand ?? 'none') === 'word' ? (
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                      Texte de marque
                    </span>
                    <input
                      type="text"
                      value={navigation.mobileBrandWord ?? ''}
                      onChange={(event) => onChange({ mobileBrandWord: event.target.value })}
                      placeholder="Prénom ou nom court"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                    />
                  </label>
                ) : null}
                <OptionGrid
                  label="Côté du tiroir"
                  options={PORTFOLIO_NAV_MOBILE_DRAWER_SIDE_OPTIONS}
                  value={navigation.mobileDrawerSide ?? 'right'}
                  onChange={(mobileDrawerSide) => onChange({ mobileDrawerSide })}
                  columns={2}
                />
              </>
            ) : null}
            {(navigation.mobileLayout ?? 'brand-bar') === 'brand-bar' ? (
              <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-500">
                Barre pleine largeur : logo à gauche, menu à droite (style éditorial). Le logo utilise
                le texte / image de marque de la navigation.
              </p>
            ) : null}
          </div>
        ) : null}
        </>
      ) : null}

      <OptionGrid
        label="Navigation type"
        options={PORTFOLIO_NAV_MODE_OPTIONS}
        value={navMode}
        onChange={(nextMode) => onChange({ navMode: nextMode })}
        columns={2}
      />

      {navMode === 'pages' ? (
        <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
          Pages mode shows one section at a time. Use the nav bar buttons to switch pages â€” there is no
          scrolling between sections. Bar design options below still apply.
        </p>
      ) : null}

      {navMode === 'per-page' ? (
        <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
          Per page mode shows dots and previous / next controls to move one section at a time while
          scrolling. Labels below still apply.
        </p>
      ) : null}

      {navMode === 'split' ? (
        <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
          Split screen applies from Portfolio onward on large screens: a fixed left frame
          (~40%) keeps the title centered and swaps it as you scroll the content on the
          right (~60%). Titles do not travel up or down with the page. The hero stays full
          width. Below large breakpoints the layout stacks like Default.
        </p>
      ) : null}

      <OptionGrid
        label="When to appear"
        options={PORTFOLIO_NAV_DISPLAY_OPTIONS}
        value={navigation.displayMode}
        onChange={(displayMode) => onChange({ displayMode })}
        columns={3}
      />

      {navigation.enabled && usesFloatingNavChrome ? (
        <OptionGrid
          label="Mode de visibilité de la barre"
          options={PORTFOLIO_NAV_VISIBILITY_MODE_OPTIONS}
          value={resolvePortfolioNavVisibilityMode(navigation.presence)}
          onChange={(presence) => onChange({ presence })}
          columns={2}
        />
      ) : null}

      <ToggleRow
        label="Hide when only one section"
        description="Do not show the menu if a single destination is available."
        checked={navigation.hideWhenSingle}
        onChange={(hideWhenSingle) => onChange({ hideWhenSingle })}
      />

      {navigation.enabled ? (
        <OptionGrid
          label="Indicateur actif"
          options={PORTFOLIO_NAV_ACTIVE_INDICATOR_OPTIONS}
          value={
            PORTFOLIO_NAV_ACTIVE_INDICATOR_OPTIONS.some(
              (option) => option.value === navigation.activeStyle
            )
              ? navigation.activeStyle
              : ''
          }
          onChange={(activeStyle) => onChange({ activeStyle })}
          columns={3}
        />
      ) : null}

      {navigation.enabled && navigation.navLayoutDesign === 'editorial-bar' ? (
        <OptionGrid
          label="Couleur du texte des boutons"
          options={PORTFOLIO_NAV_EDITORIAL_BAR_BUTTON_INK_OPTIONS}
          value={navigation.editorialBarButtonInk ?? 'principal'}
          onChange={(editorialBarButtonInk) => {
            const bindings = mergeNavColorBindings(
              DEFAULT_NAV_COLOR_BINDINGS,
              navigation.navColorBindings
            );
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
                ? applyNavPaletteToSettings({
                    ...navigation,
                    navColorBindings: nextBindings,
                  })
                : null),
            });
          }}
          columns={2}
        />
      ) : null}

      {navigation.enabled ? (
        <OptionGrid
          label="Taille du texte"
          options={PORTFOLIO_NAV_LABEL_FONT_SIZE_OPTIONS}
          value={navigation.labelFontSize ?? 'md'}
          onChange={(labelFontSize) => onChange({ labelFontSize })}
          columns={4}
        />
      ) : null}

      <NavMenuGroupsEditor
        groups={navigation.navMenuGroups ?? []}
        itemLabels={navigation.itemLabels}
        onChange={(navMenuGroups) => onChange({ navMenuGroups })}
      />

      <NavigationLabelsIconsPanel
        itemLabels={navigation.itemLabels}
        itemIcons={navigation.itemIcons}
        onChange={onChange}
      />

      <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
        Les sections visibles alimentent le menu. Réordonnez-les dans Global → Section display order.
      </p>
        </div>
      ) : null}


      {navTab === 'design' ? (
        <div className="space-y-6">
          {usesFloatingNavChrome ? (
            <NavLayoutDesignGrid
              value={navigation.navLayoutDesign ?? 'classic'}
              navigation={navigation}
              onChange={(design) => {
                onChange(portfolioNavLayoutDesignPatch(design, navigation));
                if (design === 'floating-pill') {
                  onGlobalChange?.({ showColorModeToggleInNav: true });
                  onChange({ mobileLayout: 'brand-bar' });
                }
              }}
            />
          ) : (
            <NavFloatingOnlyNote />
          )}
          {navigation.navLayoutDesign === 'editorial-bar' ? (
            <NavEditorialBarSlotEditor
              navigation={navigation}
              options={navSocialLinkOptions}
              onChange={onChange}
            />
          ) : null}
          {navigation.navLayoutDesign === 'floating-pill' ? (
            <NavFloatingPillMenuEditor
              navigation={navigation}
              onChange={onChange}
              showColorModeToggleInNav={showColorModeToggleInNav}
              onGlobalChange={onGlobalChange}
            />
          ) : null}
          {navigation.navLayoutDesign === 'nav-logo-social' ? (
            <NavTriZoneSideSlotEditor
              navigation={navigation}
              options={navSocialLinkOptions}
              onChange={onChange}
            />
          ) : null}
          {navigation.navLayoutDesign === 'center-logo-split' ? (
            <NavSplitLogoSectionEditor navigation={navigation} onChange={onChange} />
          ) : null}
          {navigation.navLayoutDesign === 'logo-left-nav-contact' ? (
            <NavLogoLeftContactPlacementEditor navigation={navigation} onChange={onChange} />
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
        </div>
      ) : null}
    </div>
  );
}

function SectionPanel({
  section,
  settings,
  onChange,
  onThemeChange,
  onGlobalChange,
  onColorModeChange,
  onGlobalPaletteChange,
  onGlobalPalettePairChange,
  onNavigationChange,
  onSaveCustomTheme,
  onRenameCustomTheme,
  onDuplicateTheme,
  onResetBuiltinTheme,
  onDeleteCustomTheme,
  availableTools,
  availableWorks,
  navSocialLinkOptions = [],
  panelSubSections,
  onPanelSubSectionChange,
}: {
  section: PortfolioSettingsSectionMeta;
  settings: PortfolioSettings;
  onChange: (
    sectionId: PortfolioSettingsContentKey,
    patch: Partial<PortfolioSettings[PortfolioSettingsContentKey]>
  ) => void;
  onThemeChange: (themeId: PortfolioThemeId) => void;
  onGlobalChange: (patch: PortfolioGlobalSettingsPatch) => void;
  onColorModeChange: (mode: PortfolioColorMode) => void;
  onGlobalPaletteChange: (patch: Partial<PortfolioHeroPalette>) => void;
  onGlobalPalettePairChange: (
    paletteDark: PortfolioHeroPalette,
    paletteLight?: PortfolioHeroPalette,
    family?: 'indigo' | 'classic' | 'verdant' | 'vive' | 'safran' | 'citron' | 'rouge' | 'ecarlate' | 'ardoise' | 'custom'
  ) => void;
  onNavigationChange: (patch: Partial<PortfolioNavSettings>) => void;
  onSaveCustomTheme: (themeId: string, name?: string) => boolean;
  onRenameCustomTheme: (themeId: string, name: string) => boolean;
  onDuplicateTheme: (themeId: PortfolioThemeId) => void;
  onResetBuiltinTheme: (themeId: PortfolioBuiltinThemeId) => void;
  onDeleteCustomTheme: (themeId: string) => void;
  availableTools: string[];
  availableWorks: { id: string; title: string; imageUrl: string }[];
  navSocialLinkOptions?: PortfolioNavChromeLink[];
  panelSubSections: PanelSubSections;
  onPanelSubSectionChange: <K extends keyof PanelSubSections>(
    sectionId: K,
    value: NonNullable<PanelSubSections[K]>
  ) => void;
}) {
  const sectionId = section.id;

  if (sectionId === 'theme') {
    return (
      <GlobalSettingsPanel
        themeId={settings.themeId}
        customThemes={settings.customThemes}
        settings={settings}
        global={settings.global}
        servicesSectionOrganization={settings.services.sectionOrganization}
        onThemeChange={onThemeChange}
        onGlobalChange={onGlobalChange}
        onColorModeChange={onColorModeChange}
        onGlobalPaletteChange={onGlobalPaletteChange}
        onGlobalPalettePairChange={onGlobalPalettePairChange}
        onSaveCustomTheme={onSaveCustomTheme}
        onRenameCustomTheme={onRenameCustomTheme}
        onDuplicateTheme={onDuplicateTheme}
        onResetBuiltinTheme={onResetBuiltinTheme}
        onDeleteCustomTheme={onDeleteCustomTheme}
        subSection={panelSubSections.theme ?? 'theme'}
        onSubSectionChange={(value) => onPanelSubSectionChange('theme', value)}
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
      />
    );
  }

  if (sectionId === 'work') {
    return (
      <WorkSettingsPanel
        work={settings.work}
        onChange={(patch) => onChange('work', patch)}
        subSection={panelSubSections.work ?? 'header'}
        onSubSectionChange={(value) => onPanelSubSectionChange('work', value)}
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
      />
    );
  }

  if (sectionId === 'gallery') {
    return (
      <GallerySettingsPanel
        gallery={settings.gallery}
        onChange={(patch) => onChange('gallery', patch)}
        subSection={panelSubSections.gallery ?? 'general'}
        onSubSectionChange={(value) => onPanelSubSectionChange('gallery', value)}
      />
    );
  }

  if (sectionId === 'faq') {
    return (
      <FaqSettingsPanel
        faq={settings.faq}
        onChange={(patch) => onChange('faq', patch)}
        subSection={panelSubSections.faq ?? 'header'}
        onSubSectionChange={(value) => onPanelSubSectionChange('faq', value)}
      />
    );
  }

  if (sectionId === 'team') {
    return (
      <TeamSettingsPanel
        team={settings.team}
        onChange={(patch) => onChange('team', patch)}
        subSection={panelSubSections.team ?? 'general'}
        onSubSectionChange={(value) => onPanelSubSectionChange('team', value)}
      />
    );
  }

  if (sectionId === 'contact') {
    return (
      <ContactSettingsPanel
        contact={settings.contact}
        onChange={(patch) => onChange('contact', patch)}
        subSection={panelSubSections.contact ?? 'header'}
        onSubSectionChange={(value) => onPanelSubSectionChange('contact', value)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <ToggleRow
        label="Show section"
        description={`Display the ${section.label.toLowerCase()} block on your public portfolio.`}
        checked={copy.enabled}
        onChange={(enabled) => onChange(sectionId, { enabled })}
      />

      {'title' in copy ? (
        <TextField
          label="Section title"
          value={copy.title}
          onChange={(title) => onChange(sectionId, { title })}
          placeholder={section.label}
        />
      ) : null}

      {'subtitle' in copy ? (
        <TextField
          label="Section subtitle"
          value={copy.subtitle}
          onChange={(subtitle) => onChange(sectionId, { subtitle })}
          placeholder="Optional supporting line under the title"
          multiline
        />
      ) : null}

      <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
        Content for this section is edited in Creator Studio â†’ Information. These settings control visibility and
        presentation on the portfolio page.
      </p>
    </div>
  );
}

type PortfolioSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  settings: PortfolioSettings;
  persistStatus?: 'idle' | 'saving' | 'saved' | 'error';
  onChange: (
    sectionId: PortfolioSettingsContentKey,
    patch: Partial<PortfolioSettings[PortfolioSettingsContentKey]>
  ) => void;
  onThemeChange: (themeId: PortfolioThemeId) => void;
  onGlobalChange: (patch: PortfolioGlobalSettingsPatch) => void;
  onColorModeChange: (mode: PortfolioColorMode) => void;
  onGlobalPaletteChange: (patch: Partial<PortfolioHeroPalette>) => void;
  onGlobalPalettePairChange: (
    paletteDark: PortfolioHeroPalette,
    paletteLight?: PortfolioHeroPalette,
    family?: 'indigo' | 'classic' | 'verdant' | 'vive' | 'safran' | 'citron' | 'rouge' | 'ecarlate' | 'ardoise' | 'custom'
  ) => void;
  onNavigationChange: (patch: Partial<PortfolioNavSettings>) => void;
  onSaveCustomTheme: (themeId: string, name?: string) => boolean;
  onRenameCustomTheme: (themeId: string, name: string) => boolean;
  onDuplicateTheme: (themeId: PortfolioThemeId) => void;
  onResetBuiltinTheme: (themeId: PortfolioBuiltinThemeId) => void;
  onDeleteCustomTheme: (themeId: string) => void;
  onReset: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  availableTools: string[];
  availableWorks?: { id: string; title: string; imageUrl: string }[];
  navSocialLinkOptions?: PortfolioNavChromeLink[];
};

export function PortfolioSettingsModal({
  open,
  onClose,
  settings,
  persistStatus = 'idle',
  onChange,
  onThemeChange,
  onGlobalChange,
  onColorModeChange,
  onGlobalPaletteChange,
  onGlobalPalettePairChange,
  onNavigationChange,
  onSaveCustomTheme,
  onRenameCustomTheme,
  onDuplicateTheme,
  onResetBuiltinTheme,
  onDeleteCustomTheme,
  onReset,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  availableTools,
  availableWorks = [],
  navSocialLinkOptions = [],
}: PortfolioSettingsModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<PortfolioSettingsSectionId>('theme');
  const [panelSubSections, setPanelSubSections] = useState<PanelSubSections>({});
  const [panelOpacity, setPanelOpacity] = useState(100);
  /** Temporarily hide the settings panel to inspect the live portfolio. */
  const [peekPreview, setPeekPreview] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPanelOpacity(readStoredModalOpacity());
    setActiveSection(readStoredActiveSection());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    window.localStorage.setItem(MODAL_OPACITY_STORAGE_KEY, String(panelOpacity));
  }, [mounted, panelOpacity]);

  useEffect(() => {
    if (!mounted) return;
    window.sessionStorage.setItem(MODAL_SECTION_STORAGE_KEY, activeSection);
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
  }, []);

  const setPanelSubSection = useCallback(
    <K extends keyof PanelSubSections>(sectionId: K, value: NonNullable<PanelSubSections[K]>) => {
      setPanelSubSections((prev) => ({ ...prev, [sectionId]: value }));
    },
    []
  );

  const handleSearchSelect = useCallback((entry: PortfolioSettingsSearchEntry) => {
    setActiveSection(entry.sectionId);
    if (!entry.subSection) return;
    if (entry.sectionId === 'theme') {
      setPanelSubSections((prev) => ({ ...prev, theme: entry.subSection as GlobalSettingsSubSection }));
    } else if (entry.sectionId === 'hero') {
      setPanelSubSections((prev) => ({ ...prev, hero: entry.subSection as HeroSettingsSubSection }));
    } else if (entry.sectionId === 'work') {
      setPanelSubSections((prev) => ({
        ...prev,
        work: normalizeWorkSettingsSubSection(entry.subSection),
      }));
    } else if (entry.sectionId === 'services') {
      setPanelSubSections((prev) => ({
        ...prev,
        services: normalizeServicesSubSection(entry.subSection, 'services'),
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
      setPanelSubSections((prev) => ({ ...prev, contact: entry.subSection as ContactSubSection }));
    } else if (entry.sectionId === 'footer') {
      setPanelSubSections((prev) => ({ ...prev, footer: entry.subSection as FooterSubSection }));
    }
  }, []);

  const visibleSettingsSections = useMemo(
    () =>
      PORTFOLIO_SETTINGS_SECTIONS.filter(
        (section) =>
          section.id !== 'aboutUs' || portfolioPresenceShowsAboutUs(settings.global.presenceKind)
      ),
    [settings.global.presenceKind]
  );

  useEffect(() => {
    if (!open) return;
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
  }, [open, handleClose, peekPreview]);

  if (!open || !mounted) return null;

  const activeMeta =
    visibleSettingsSections.find((section) => section.id === activeSection) ??
    visibleSettingsSections[0] ??
    PORTFOLIO_SETTINGS_SECTIONS[0];

  const previewMode = panelOpacity < 98;
  const backdropAlpha = previewMode ? 0.04 + (panelOpacity / 100) * 0.22 : 0.6;
  const backdropBlur = previewMode ? Math.max(2, Math.round((panelOpacity / 100) * 8)) : 4;
  const panelAlpha = panelOpacity / 100;

  return createPortal(
    <>
      {peekPreview ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[210] flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-full border border-neutral-200/90 bg-white/95 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.14)] backdrop-blur-md">
            <p className="pl-2 text-sm font-semibold text-neutral-800">Previewing portfolio</p>
            <button
              type="button"
              onClick={() => setPeekPreview(false)}
              className="inline-flex min-h-11 items-center rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-bold text-white"
            >
              Back to settings
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Close settings"
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
        className="absolute inset-0 hidden backdrop-blur-sm transition-[background-color,backdrop-filter] duration-200 lg:block"
        style={{
          backgroundColor: `rgba(10, 10, 10, ${backdropAlpha})`,
          backdropFilter: `blur(${backdropBlur}px)`,
          WebkitBackdropFilter: `blur(${backdropBlur}px)`,
        }}
        aria-label="Close settings"
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
                Portfolio settings
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
                  ? 'Saving to your accountâ€¦'
                  : persistStatus === 'saved'
                    ? 'Saved to your account'
                    : persistStatus === 'error'
                      ? 'Not saved â€” kept on this device, retryingâ€¦'
                      : 'Synced with your account'}
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
                aria-label="Close"
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
                  aria-label="Settings panel transparency"
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
            aria-label="Portfolio sections"
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
                          ? 'bg-white font-semibold text-neutral-950 shadow-sm ring-1 ring-neutral-200/80'
                          : 'font-medium text-neutral-600 hover:bg-white/70 hover:text-neutral-900'
                      }`}
                    >
                      {section.label}
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
                  <span>Upgrade</span>
                  <span aria-hidden className="text-xs font-bold opacity-70">
                    â†—
                  </span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            {activeSection !== 'hero' && activeSection !== 'theme' ? (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-neutral-950">{activeMeta.label}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">{activeMeta.description}</p>
              </div>
            ) : null}
            <PortfolioBackgroundLibraryProvider
              library={settings.global.backgroundImageLibrary ?? []}
              onLibraryChange={(backgroundImageLibrary) => onGlobalChange({ backgroundImageLibrary })}
            >
              <SectionPanel
                section={activeMeta}
                settings={settings}
                onChange={onChange}
                onThemeChange={onThemeChange}
                onGlobalChange={onGlobalChange}
                onColorModeChange={onColorModeChange}
                onGlobalPaletteChange={onGlobalPaletteChange}
                onGlobalPalettePairChange={onGlobalPalettePairChange}
                onNavigationChange={onNavigationChange}
                onSaveCustomTheme={onSaveCustomTheme}
                onRenameCustomTheme={onRenameCustomTheme}
                onDuplicateTheme={onDuplicateTheme}
                onResetBuiltinTheme={onResetBuiltinTheme}
                onDeleteCustomTheme={onDeleteCustomTheme}
                availableTools={availableTools}
                availableWorks={availableWorks}
                navSocialLinkOptions={navSocialLinkOptions}
                panelSubSections={panelSubSections}
                onPanelSubSectionChange={setPanelSubSection}
              />
            </PortfolioBackgroundLibraryProvider>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-200/80 px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onReset}
            className="min-h-11 text-sm font-semibold text-neutral-500 transition hover:text-neutral-800"
          >
            Reset defaults
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
              Done
            </button>
          </div>
        </div>
      </div>
      </div>
    </>,
    document.body
  );
}
