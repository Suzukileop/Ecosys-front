import { createElementTextStyle } from '@/components/portfolio/portfolio-element-text-style';
import {
  normalizeHeroElementStyles,
  syncHeroLegacyTypographyFromElementStyles,
  type PortfolioHeroElementStyles,
} from '@/components/portfolio/portfolio-hero-element-styles';
import {
  DEFAULT_HERO_COLOR_BINDINGS,
  DEFAULT_HERO_PALETTE,
  mergeHeroColorBindings,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_HERO_PROFILE_SETTINGS,
  type PortraitDesignOverride,
  type PortraitDesignOverridesMap,
  type PortfolioHeroProfileSettings,
} from '@/components/portfolio/portfolio-hero-profile-settings';
import type { PortfolioHeroPresentationSettings } from '@/components/portfolio/portfolio-hero-settings';

export type PortraitDesignId = 'cinema' | 'signal';

/** Bump when factory templates change structurally — stale overrides are discarded. */
export const PORTRAIT_DESIGN_FACTORY_REVISION = 6;

/** Noir / white palette locked to the reference portrait card. */
const NOIR = {
  card: '#17171B',
  ink: '#0A0A0A',
  border: '#2A2A30',
  white: '#FFFFFF',
  muted: '#A3A3A3',
} as const;

export type PortraitDesignDefinition = {
  id: PortraitDesignId;
  label: string;
  description: string;
  /** Distinct reading / interaction pattern */
  ergonomics: string;
  /** CSS tokens for the settings thumb preview */
  preview: {
    shell: string;
    photo: string;
    bar?: { edge: 'top' | 'bottom'; color: string; heightPct: number };
    name: { placement: string; color: string };
    specialty?: { placement: string; color: string };
    footer?: boolean;
    header?: boolean;
  };
  profile: Partial<PortfolioHeroProfileSettings>;
  nameStyle: {
    color: string;
    font: 'sans' | 'serif' | 'display';
    size: 'sm' | 'md' | 'lg' | 'xl';
    bold?: boolean;
    uppercase?: boolean;
  };
};

const TEMPLATE_SLICE_KEYS = [
  'showPortraitFrame',
  'portraitFrameColor',
  'portraitFrameWidth',
  'portraitFrameBorderOpacity',
  'portraitFrameBackgroundColor',
  'portraitFrameBackgroundOpacity',
  'portraitFramePaddingTop',
  'portraitFramePaddingBottom',
  'portraitFramePaddingLeft',
  'portraitFramePaddingRight',
  'portraitSize',
  'portraitSizeScale',
  'portraitRadius',
  'showCreatorName',
  'creatorNameInFrame',
  'creatorNameFramePlacement',
  'showSpecialtyInFrame',
  'specialtyFramePlacement',
  'portraitCaptionLayout',
  'portraitCaptionBarEnabled',
  'portraitCaptionBarEdge',
  'portraitCaptionBarColor',
  'portraitCaptionBarHeight',
  'portraitCaptionShowDot',
  'portraitSpecialtyUppercase',
  'portraitObjectFit',
  'portraitFocusX',
  'portraitFocusY',
  'portraitImageScale',
  'creatorNameColor',
  'creatorNameSize',
  'creatorNameFont',
] as const satisfies ReadonlyArray<keyof PortraitDesignOverride>;

/**
 * Reusable noir portrait cards — padded photo inside the frame, gap, then
 * name + specialty (never over the image).
 */
export const PORTFOLIO_HERO_PORTRAIT_DESIGNS: PortraitDesignDefinition[] = [
  {
    id: 'cinema',
    label: 'Noir cinema',
    description: 'Larger noir card — same padding logic, roomier photo and title stack.',
    ergonomics: 'Watch-mode — big face window, credits in the lower mat.',
    preview: {
      shell: 'bg-[#17171B] ring-1 ring-[#2A2A30]',
      photo: 'rounded-[2rem] bg-gradient-to-br from-neutral-700 to-neutral-900',
      name: { placement: 'footer-left', color: NOIR.white },
      specialty: { placement: 'footer-left', color: NOIR.muted },
      footer: true,
    },
    profile: {
      showPortrait: true,
      showPortraitFrame: true,
      portraitFrameColor: NOIR.border,
      portraitFrameWidth: 4,
      portraitFrameBorderOpacity: 100,
      portraitFrameBackgroundColor: NOIR.card,
      portraitFrameBackgroundOpacity: 100,
      portraitFramePaddingTop: 12,
      portraitFramePaddingBottom: 14,
      portraitFramePaddingLeft: 12,
      portraitFramePaddingRight: 12,
      portraitSize: 'large',
      portraitRadius: 'round',
      showCreatorName: true,
      creatorNameInFrame: true,
      creatorNameFramePlacement: 'bottom-left',
      showSpecialtyInFrame: true,
      specialtyFramePlacement: 'bottom-left',
      portraitCaptionLayout: 'mat-footer',
      portraitCaptionBarEnabled: false,
      portraitCaptionBarEdge: 'bottom',
      portraitCaptionBarColor: NOIR.ink,
      portraitCaptionBarHeight: 52,
      portraitSpecialtyUppercase: false,
      portraitObjectFit: 'cover',
      portraitFocusX: 50,
      portraitFocusY: 16,
      portraitImageScale: 104,
    },
    nameStyle: { color: NOIR.white, font: 'sans', size: 'lg', bold: true },
  },
  {
    id: 'signal',
    label: 'Noir plate',
    description: 'Noir card with a deeper ink identity plate under the photo (still inset).',
    ergonomics: 'High contrast — photo window + raised black caption block inside the mat.',
    preview: {
      shell: 'bg-[#17171B] ring-1 ring-[#2A2A30]',
      photo: 'rounded-2xl bg-gradient-to-br from-zinc-600 to-stone-800',
      bar: { edge: 'bottom', color: NOIR.ink, heightPct: 20 },
      name: { placement: 'footer-left', color: NOIR.white },
      specialty: { placement: 'footer-left', color: NOIR.muted },
      footer: true,
    },
    profile: {
      showPortrait: true,
      showPortraitFrame: true,
      portraitFrameColor: NOIR.border,
      portraitFrameWidth: 4,
      portraitFrameBorderOpacity: 100,
      portraitFrameBackgroundColor: NOIR.card,
      portraitFrameBackgroundOpacity: 100,
      portraitFramePaddingTop: 14,
      portraitFramePaddingBottom: 14,
      portraitFramePaddingLeft: 14,
      portraitFramePaddingRight: 14,
      portraitSize: 'standard',
      portraitRadius: 'soft',
      showCreatorName: true,
      creatorNameInFrame: true,
      creatorNameFramePlacement: 'bottom-left',
      showSpecialtyInFrame: true,
      specialtyFramePlacement: 'bottom-left',
      portraitCaptionLayout: 'mat-footer',
      portraitCaptionBarEnabled: true,
      portraitCaptionBarEdge: 'bottom',
      portraitCaptionBarColor: NOIR.ink,
      portraitCaptionBarHeight: 56,
      portraitSpecialtyUppercase: false,
      portraitObjectFit: 'cover',
      portraitFocusX: 50,
      portraitFocusY: 18,
      portraitImageScale: 100,
    },
    nameStyle: { color: NOIR.white, font: 'sans', size: 'md', bold: true },
  },
];

export function getPortraitDesign(id: PortraitDesignId): PortraitDesignDefinition | undefined {
  return PORTFOLIO_HERO_PORTRAIT_DESIGNS.find((design) => design.id === id);
}

function isCurrentFactoryOverride(override?: PortraitDesignOverride | null): boolean {
  if (!override) return false;
  return override.factoryRevision === PORTRAIT_DESIGN_FACTORY_REVISION;
}

/** Snapshot current portrait settings into a template override slot. */
export function extractPortraitDesignOverride(
  presentation: PortfolioHeroPresentationSettings
): PortraitDesignOverride {
  const styles = normalizeHeroElementStyles(presentation.elementStyles, presentation);
  const slice: PortraitDesignOverride = {
    creatorNameBold: styles.creatorName.bold,
    creatorNameUppercase: styles.creatorName.uppercase,
    factoryRevision: PORTRAIT_DESIGN_FACTORY_REVISION,
  };
  for (const key of TEMPLATE_SLICE_KEYS) {
    const value = presentation[key];
    if (value !== undefined) {
      (slice as Record<string, unknown>)[key] = value;
    }
  }
  return slice;
}

export function resolvePortraitDesignPatch(
  id: PortraitDesignId,
  currentElementStyles: PortfolioHeroElementStyles | undefined,
  currentPresentation: PortfolioHeroPresentationSettings,
  override?: PortraitDesignOverride | null
): Partial<PortfolioHeroPresentationSettings> {
  const design = getPortraitDesign(id);
  if (!design) return {};

  const liveOverride = isCurrentFactoryOverride(override) ? override : null;

  // Chrome colors follow the hero palette (same token as the motif) so the
  // frame, mat, and caption plate stay linked to the section background motif.
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, currentPresentation.palette);
  const bindings = mergeHeroColorBindings(
    DEFAULT_HERO_COLOR_BINDINGS,
    currentPresentation.colorBindings
  );
  const paletteChrome: Partial<PortfolioHeroProfileSettings> = {
    portraitFrameColor: resolveHeroPaletteColor(palette, bindings.portraitFrame),
    portraitFrameBackgroundColor: resolveHeroPaletteColor(palette, bindings.portraitMat),
    portraitCaptionBarColor: resolveHeroPaletteColor(palette, bindings.portraitCaptionBar),
  };

  const mergedProfile = {
    ...design.profile,
    ...paletteChrome,
    ...(liveOverride ?? {}),
  };

  const nameColor = liveOverride?.creatorNameColor ?? design.nameStyle.color;
  const nameFont = liveOverride?.creatorNameFont ?? design.nameStyle.font;
  const nameSize = liveOverride?.creatorNameSize ?? design.nameStyle.size;
  const nameBold = liveOverride?.creatorNameBold ?? design.nameStyle.bold ?? true;
  const nameUpper =
    liveOverride?.creatorNameUppercase ?? design.nameStyle.uppercase ?? false;

  const baseStyles = normalizeHeroElementStyles(currentElementStyles, currentPresentation);
  const nextStyles: PortfolioHeroElementStyles = {
    ...baseStyles,
    creatorName: createElementTextStyle({
      ...baseStyles.creatorName,
      color: nameColor,
      font: nameFont,
      size: nameSize,
      bold: nameBold,
      uppercase: nameUpper,
      italic: false,
    }),
  };

  const profilePatch = { ...mergedProfile };
  delete (profilePatch as { creatorNameBold?: boolean }).creatorNameBold;
  delete (profilePatch as { creatorNameUppercase?: boolean }).creatorNameUppercase;

  return {
    ...profilePatch,
    ...syncHeroLegacyTypographyFromElementStyles(nextStyles),
    elementStyles: nextStyles,
    activePortraitDesignId: id,
  };
}

/**
 * Select a reusable template: snapshot the previous active template, then apply
 * factory defaults + saved overrides for the new id (auto-fits content & photo).
 */
export function selectPortraitDesign(
  id: PortraitDesignId,
  currentPresentation: PortfolioHeroPresentationSettings
): Partial<PortfolioHeroPresentationSettings> {
  const overrides: PortraitDesignOverridesMap = {
    ...(currentPresentation.portraitDesignOverrides ?? {}),
  };
  const previous = currentPresentation.activePortraitDesignId;
  if (previous && previous !== id && (previous === 'cinema' || previous === 'signal')) {
    overrides[previous] = extractPortraitDesignOverride(currentPresentation);
  }

  const stored = overrides[id];
  const usable = isCurrentFactoryOverride(stored) ? stored : null;
  if (stored && !usable) {
    delete overrides[id];
  }

  // Drop removed template slots if still present in saved data.
  delete (overrides as Record<string, unknown>).atelier;
  delete (overrides as Record<string, unknown>).polaroid;
  delete (overrides as Record<string, unknown>).masthead;

  const patch = resolvePortraitDesignPatch(
    id,
    currentPresentation.elementStyles,
    currentPresentation,
    usable
  );

  return {
    ...patch,
    portraitDesignOverrides: overrides,
  };
}

/**
 * Freestyle portrait — plain photo, no noir template chrome.
 * Snapshots the previous template so re-selecting it restores fine-tunes.
 */
export function clearPortraitDesign(
  currentPresentation: PortfolioHeroPresentationSettings
): Partial<PortfolioHeroPresentationSettings> {
  const overrides: PortraitDesignOverridesMap = {
    ...(currentPresentation.portraitDesignOverrides ?? {}),
  };
  const previous = currentPresentation.activePortraitDesignId;
  if (previous === 'cinema' || previous === 'signal') {
    overrides[previous] = extractPortraitDesignOverride(currentPresentation);
  }

  const freestyle = DEFAULT_HERO_PROFILE_SETTINGS;

  return {
    activePortraitDesignId: null,
    portraitDesignOverrides: overrides,
    // Plain photo: no template mat / inset / caption chrome.
    showPortraitFrame: false,
    portraitFrameWidth: 0,
    portraitFrameBorderOpacity: freestyle.portraitFrameBorderOpacity,
    portraitFrameBackgroundOpacity: 0,
    portraitFramePaddingTop: 0,
    portraitFramePaddingBottom: 0,
    portraitFramePaddingLeft: 0,
    portraitFramePaddingRight: 0,
    portraitSize: freestyle.portraitSize,
    portraitSizeScale: freestyle.portraitSizeScale,
    portraitRadius: freestyle.portraitRadius,
    portraitCaptionLayout: 'none',
    portraitCaptionBarEnabled: false,
    showSpecialtyInFrame: false,
    creatorNameInFrame: false,
    showCreatorName: freestyle.showCreatorName,
    portraitObjectFit: freestyle.portraitObjectFit,
    portraitFocusX: freestyle.portraitFocusX,
    portraitFocusY: freestyle.portraitFocusY,
    portraitImageScale: freestyle.portraitImageScale,
  };
}

/** Reset the active (or given) template to factory defaults and clear its override. */
export function resetPortraitDesign(
  id: PortraitDesignId,
  currentPresentation: PortfolioHeroPresentationSettings
): Partial<PortfolioHeroPresentationSettings> {
  const overrides: PortraitDesignOverridesMap = {
    ...(currentPresentation.portraitDesignOverrides ?? {}),
  };
  delete overrides[id];
  const patch = resolvePortraitDesignPatch(
    id,
    currentPresentation.elementStyles,
    currentPresentation,
    null
  );
  return {
    ...patch,
    portraitDesignOverrides: overrides,
  };
}

/**
 * Persist live portrait fine-tunes into the active template slot so every
 * pre-used design stays independently configurable.
 */
export function syncActivePortraitDesignOverride(
  presentation: PortfolioHeroPresentationSettings,
  patch: Partial<PortfolioHeroPresentationSettings>
): Partial<PortfolioHeroPresentationSettings> {
  const active = presentation.activePortraitDesignId ?? patch.activePortraitDesignId ?? null;
  if (!active || (active !== 'cinema' && active !== 'signal')) return patch;

  const merged = { ...presentation, ...patch } as PortfolioHeroPresentationSettings;
  const overrides: PortraitDesignOverridesMap = {
    ...(presentation.portraitDesignOverrides ?? {}),
    ...(patch.portraitDesignOverrides ?? {}),
    [active]: extractPortraitDesignOverride(merged),
  };

  return {
    ...patch,
    activePortraitDesignId: active,
    portraitDesignOverrides: overrides,
  };
}

/** @deprecated Use selectPortraitDesign — kept for call-site compatibility. */
export function applyPortraitDesign(
  id: PortraitDesignId,
  currentElementStyles: PortfolioHeroElementStyles | undefined,
  currentPresentation: PortfolioHeroPresentationSettings
): Partial<PortfolioHeroPresentationSettings> {
  return selectPortraitDesign(id, {
    ...currentPresentation,
    elementStyles: currentElementStyles ?? currentPresentation.elementStyles,
  });
}
