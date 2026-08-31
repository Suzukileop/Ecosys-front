import {
  normalizeHeroElementStyles,
  syncHeroLegacyTypographyFromElementStyles,
  type PortfolioHeroElementStyles,
  type PortfolioHeroStyleTarget,
} from '@/components/portfolio/portfolio-hero-element-styles';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import type { PortfolioHeroPresentationSettings } from '@/components/portfolio/portfolio-hero-settings';

/** Semantic color roles for the Hero section palette. */
export type HeroPaletteTokenId =
  | 'principal'
  | 'secondaire'
  | 'texteFort'
  | 'texteMuted'
  | 'texteFaint'
  | 'neutre'
  | 'fond'
  | 'bordure';

export type PortfolioHeroPalette = Record<HeroPaletteTokenId, string>;

/** Slots that can bind to a palette token (resolved into concrete hex fields). */
export type HeroColorSlot =
  | 'headline'
  | 'headlinePrefix'
  | 'headlineEmphasis'
  | 'headlineAccent'
  | 'description'
  | 'availabilityText'
  | 'availabilityBackground'
  | 'availabilityBorder'
  | 'availabilityDot'
  | 'ctaText'
  | 'ctaBackground'
  | 'ctaBorder'
  | 'toolsLabel'
  | 'toolsIconBackground'
  | 'toolsIconBorder'
  | 'toolsCardBackground'
  | 'toolsCardBorder'
  | 'toolsCardTitle'
  | 'toolsCardDescription'
  | 'toolsCardLevel'
  | 'creatorName'
  | 'metaValue'
  | 'metaLabel'
  | 'metaCardBackground'
  | 'metaFrameBorder'
  | 'metaAccentYears'
  | 'metaAccentProjects'
  | 'metaAccentLocation'
  | 'sectionBackground'
  | 'motif'
  | 'portraitFrame'
  | 'portraitMat'
  | 'portraitCaptionBar';

export type PortfolioHeroColorBindings = Record<HeroColorSlot, HeroPaletteTokenId>;

export const HERO_PALETTE_TOKEN_IDS: HeroPaletteTokenId[] = [
  'principal',
  'secondaire',
  'texteFort',
  'texteMuted',
  'texteFaint',
  'neutre',
  'fond',
  'bordure',
];

export const HERO_COLOR_SLOT_IDS: HeroColorSlot[] = [
  'headline',
  'headlinePrefix',
  'headlineEmphasis',
  'headlineAccent',
  'description',
  'availabilityText',
  'availabilityBackground',
  'availabilityBorder',
  'availabilityDot',
  'ctaText',
  'ctaBackground',
  'ctaBorder',
  'toolsLabel',
  'toolsIconBackground',
  'toolsIconBorder',
  'toolsCardBackground',
  'toolsCardBorder',
  'toolsCardTitle',
  'toolsCardDescription',
  'toolsCardLevel',
  'creatorName',
  'metaValue',
  'metaLabel',
  'metaCardBackground',
  'metaFrameBorder',
  'metaAccentYears',
  'metaAccentProjects',
  'metaAccentLocation',
  'sectionBackground',
  'motif',
  'portraitFrame',
  'portraitMat',
  'portraitCaptionBar',
];

export const PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS: {
  value: HeroPaletteTokenId;
  label: string;
  description: string;
}[] = [
  { value: 'principal', label: 'Principal', description: 'Primary accent (headline specialty, CTAs).' },
  { value: 'secondaire', label: 'Secondaire', description: 'Secondary accent (stats, badges).' },
  { value: 'texteFort', label: 'Texte fort', description: 'Strong body / titles.' },
  { value: 'texteMuted', label: 'Texte muted', description: 'Secondary copy and captions.' },
  { value: 'texteFaint', label: 'Texte faint', description: 'Quiet labels and hints.' },
  { value: 'neutre', label: 'Neutre', description: 'Neutral surfaces and chips.' },
  { value: 'fond', label: 'Fond', description: 'Section / panel background.' },
  { value: 'bordure', label: 'Bordure', description: 'Borders and hairlines.' },
];

/**
 * Classic orange / teal — Mode sombre (rectifié).
 * Orange / teal inchangés ; fond / neutre / textes / bordure slate
 * pour un contraste moderne et des cartes nettes.
 */
export const DEFAULT_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#e2572e',
  secondaire: '#22c48f',
  texteFort: '#FAFAFA',
  texteMuted: '#94A3B8',
  texteFaint: '#64748B',
  neutre: '#1E293B',
  fond: '#0F172A',
  bordure: '#334155',
};

/**
 * Classic orange / teal — Mode clair (rectifié).
 * Orange brique / émeraude inchangés ; textes slate, cartes blanc pur.
 */
export const LIGHT_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#c2410c',
  secondaire: '#00875f',
  texteFort: '#0F172A',
  texteMuted: '#475569',
  texteFaint: '#94A3B8',
  neutre: '#FFFFFF',
  fond: '#F8FAFC',
  bordure: '#E2E8F0',
};

/**
 * Indigo / amber — Mode sombre (rectifié).
 * Indigo / ambre inchangés ; fond / neutre / textes / bordure slate.
 */
export const INDIGO_DARK_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#6366F1',
  secondaire: '#F59E0B',
  texteFort: '#F8FAFC',
  texteMuted: '#94A3B8',
  texteFaint: '#64748B',
  neutre: '#1E293B',
  fond: '#0F172A',
  bordure: '#334155',
};

/**
 * Indigo / amber — Mode clair (rectifié).
 * Indigo inchangé ; Secondaire orange vif ; textes / neutre / bordure slate.
 */
export const INDIGO_LIGHT_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#4338CA',
  secondaire: '#EA580C',
  texteFort: '#0F172A',
  texteMuted: '#475569',
  texteFaint: '#94A3B8',
  neutre: '#FFFFFF',
  fond: '#F8FAFC',
  bordure: '#E2E8F0',
};

/**
 * Verdant / Rose — Mode sombre (rectifié).
 * Lime / coral inchangés ; fond nuit + neutre / textes / bordure slate
 * pour encadrer les visuels sans dominante verte.
 */
export const VERDANT_DARK_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#43E00B',
  secondaire: '#FB7185',
  texteFort: '#F8FAFC',
  texteMuted: '#94A3B8',
  texteFaint: '#64748B',
  neutre: '#0F172A',
  fond: '#020617',
  bordure: '#1E293B',
};

/**
 * Verdant / Rose — Mode clair (rectifié).
 * Vert / rubis inchangés ; textes slate, cartes blanc pur, fond cassé propre.
 */
export const VERDANT_LIGHT_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#2A9608',
  secondaire: '#BE123C',
  texteFort: '#0F172A',
  texteMuted: '#475569',
  texteFaint: '#94A3B8',
  neutre: '#FFFFFF',
  fond: '#F8FAFC',
  bordure: '#E2E8F0',
};

/**
 * Palette vive — Mode clair (rectifié).
 * Principal violet / Secondaire magenta / Fond jaune inchangés ;
 * textes Zinc neutres, cartes blanc pur, bordure Zinc claire.
 */
export const VIVE_LIGHT_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#6C1BB9',
  secondaire: '#D01C82',
  texteFort: '#09090B',
  texteMuted: '#52525B',
  texteFaint: '#71717A',
  neutre: '#FFFFFF',
  /** Identité jaune conservée (le dégradé blanc→jaune se règle via fond de page si besoin). */
  fond: '#FEE685',
  bordure: '#E4E4E7',
};

/**
 * Palette vive — Mode sombre (paire couplée).
 * Fond chaud quasi-noir ; Texte fort reprend le jaune du mode clair.
 * Accents légèrement relevés pour rester vivants sur fond sombre.
 */
export const VIVE_DARK_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#8B3AD9',
  secondaire: '#E82896',
  /** Echo of light Fond — strong brand continuity */
  texteFort: '#FEE685',
  texteMuted: '#C9B56E',
  texteFaint: '#7D6E3F',
  neutre: '#1F1A10',
  fond: '#12100A',
  bordure: '#4A3F22',
};

/**
 * Safran — Mode clair (rectifié).
 * Fond jaune / Principal violet / Secondaire émeraude inchangés ;
 * textes Stone chauds, neutre blanc pur, bordure Stone claire.
 */
export const SAFRAN_LIGHT_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#3D2B84',
  secondaire: '#0E7C6B',
  texteFort: '#1C1917',
  texteMuted: '#57534E',
  texteFaint: '#78716C',
  neutre: '#FFFFFF',
  fond: '#FCE96A',
  bordure: '#E7E5E4',
};

/**
 * Safran — Mode sombre (rectifié).
 * Principal jaune / Secondaire émeraude inchangés ; fond / neutre / textes /
 * bordure en Stone pour la profondeur et la lisibilité.
 */
export const SAFRAN_DARK_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#FCE96A',
  secondaire: '#17977F',
  texteFort: '#FAFAF9',
  texteMuted: '#D6D3D1',
  texteFaint: '#A8A29E',
  neutre: '#1C1917',
  fond: '#0C0A09',
  bordure: '#292524',
};

/**
 * Citron — Mode clair (rectifié).
 * Fond citron #C8E01A + Principal violet inchangé ; Secondaire bleu roi ;
 * textes / neutre / bordure en slate froid pour respirer hors du vert.
 */
export const CITRON_LIGHT_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#4C1D6B',
  secondaire: '#2563EB',
  texteFort: '#0F172A',
  texteMuted: '#475569',
  texteFaint: '#94A3B8',
  neutre: '#F8FAFC',
  fond: '#C8E01A',
  bordure: '#E2E8F0',
};

/**
 * Citron — Mode sombre (rectifié).
 * Principal / Secondaire inchangés ; fond / neutre / textes / bordure en slate
 * pour faire ressortir violet + orange sans dominante verte.
 */
export const CITRON_DARK_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#A78BFA',
  secondaire: '#F0985A',
  texteFort: '#F8FAFC',
  texteMuted: '#94A3B8',
  texteFaint: '#64748B',
  neutre: '#1E293B',
  fond: '#0F172A',
  bordure: '#334155',
};

/**
 * Rouge / Cyan — Mode clair (Pureté & Contraste).
 * Rouge CTA #DC2626 + cyan électrique #0EA5E9 ; neutres Zinc pour cartes blanches.
 */
export const ROUGE_LIGHT_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#DC2626',
  secondaire: '#0EA5E9',
  texteFort: '#09090B',
  texteMuted: '#52525B',
  texteFaint: '#71717A',
  neutre: '#FFFFFF',
  fond: '#F4F4F5',
  bordure: '#E4E4E7',
};

/**
 * Rouge / Cyan — Mode sombre (Cyber-Rouge Premium).
 * Rouge #EF4444 + cyan #38BDF8 sur noirs abyssaux ; textes Zinc froids.
 */
export const ROUGE_DARK_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#EF4444',
  secondaire: '#38BDF8',
  texteFort: '#FAFAFA',
  texteMuted: '#D4D4D8',
  texteFaint: '#A1A1AA',
  neutre: '#09090B',
  fond: '#020202',
  bordure: '#27272A',
};

/**
 * Écarlate / Émeraude — Mode clair (fond blanc pur).
 * Rouge #DF1C1C + émeraude #10B981 ; cartes gris clair sur blanc pur.
 */
export const ECARLATE_LIGHT_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#DF1C1C',
  secondaire: '#10B981',
  texteFort: '#171717',
  texteMuted: '#525252',
  texteFaint: '#737373',
  neutre: '#F5F5F5',
  fond: '#FFFFFF',
  bordure: '#E5E5E5',
};

/**
 * Écarlate / Émeraude — Mode sombre (fond noir pur).
 * Rouge électrique #FF3333 + menthe #34D399 ; cartes carbone sur noir.
 */
export const ECARLATE_DARK_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#FF3333',
  secondaire: '#34D399',
  texteFort: '#F5F5F5',
  texteMuted: '#A3A3A3',
  texteFaint: '#737373',
  neutre: '#171717',
  fond: '#000000',
  bordure: '#262626',
};

/**
 * Ardoise / Rouge / Bleu — Mode clair (défaut).
 * Fond oklch(86.9% 0.022 252.894) ≈ #d4dbe7 ; principal #f29107 + bleu #2563EB.
 */
export const ARDOISE_LIGHT_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#f29107',
  secondaire: '#2563EB',
  texteFort: '#0F172A',
  texteMuted: '#475569',
  texteFaint: '#94A3B8',
  neutre: '#FFFFFF',
  fond: '#D4DBE7',
  bordure: '#CBD5E1',
};

/**
 * Ardoise / Rouge / Bleu — Mode sombre.
 * Fond #030712 ; principal #f29107 + bleu #60A5FA ; neutres Gray.
 */
export const ARDOISE_DARK_HERO_PALETTE: PortfolioHeroPalette = {
  principal: '#f29107',
  secondaire: '#60A5FA',
  texteFort: '#F9FAFB',
  texteMuted: '#9CA3AF',
  texteFaint: '#6B7280',
  neutre: '#1F2937',
  fond: '#030712',
  bordure: '#374151',
};

/** Named Hero palette presets users can switch between in settings. */
export const PORTFOLIO_HERO_PALETTE_PRESETS: {
  id:
    | 'indigo-dark'
    | 'indigo-light'
    | 'classic-dark'
    | 'classic-light'
    | 'verdant-dark'
    | 'verdant-light'
    | 'vive-dark'
    | 'vive-light'
    | 'safran-dark'
    | 'safran-light'
    | 'citron-dark'
    | 'citron-light'
    | 'rouge-dark'
    | 'rouge-light'
    | 'ecarlate-dark'
    | 'ecarlate-light'
    | 'ardoise-dark'
    | 'ardoise-light';
  label: string;
  description: string;
  family: 'indigo' | 'classic' | 'verdant' | 'vive' | 'safran' | 'citron' | 'rouge' | 'ecarlate' | 'ardoise';
  mode: 'dark' | 'light';
  palette: PortfolioHeroPalette;
}[] = [
  {
    id: 'indigo-dark',
    label: 'Mode sombre',
    description: 'Indigo #6366F1 / ambre #F59E0B — fond slate #0F172A.',
    family: 'indigo',
    mode: 'dark',
    palette: INDIGO_DARK_HERO_PALETTE,
  },
  {
    id: 'indigo-light',
    label: 'Mode clair',
    description: 'Indigo #4338CA / orange #EA580C — fond #F8FAFC (slate).',
    family: 'indigo',
    mode: 'light',
    palette: INDIGO_LIGHT_HERO_PALETTE,
  },
  {
    id: 'classic-dark',
    label: 'Classic dark',
    description: 'Orange #e2572e / teal #22c48f — fond slate #0F172A.',
    family: 'classic',
    mode: 'dark',
    palette: DEFAULT_HERO_PALETTE,
  },
  {
    id: 'classic-light',
    label: 'Classic light',
    description: 'Orange #c2410c / teal #00875f — fond #F8FAFC (slate).',
    family: 'classic',
    mode: 'light',
    palette: LIGHT_HERO_PALETTE,
  },
  {
    id: 'verdant-dark',
    label: 'Verdant sombre',
    description: 'Lime #43E00B / rose #FB7185 — fond nuit #020617.',
    family: 'verdant',
    mode: 'dark',
    palette: VERDANT_DARK_HERO_PALETTE,
  },
  {
    id: 'verdant-light',
    label: 'Verdant clair',
    description: 'Vert #2A9608 / rubis #BE123C — fond #F8FAFC (slate).',
    family: 'verdant',
    mode: 'light',
    palette: VERDANT_LIGHT_HERO_PALETTE,
  },
  {
    id: 'vive-dark',
    label: 'Vive sombre',
    description: 'Violet #8B3AD9 / fuchsia #E82896 — fond #12100A.',
    family: 'vive',
    mode: 'dark',
    palette: VIVE_DARK_HERO_PALETTE,
  },
  {
    id: 'vive-light',
    label: 'Vive clair',
    description: 'Violet #6C1BB9 / magenta #D01C82 — fond #FEE685 (Zinc + blanc).',
    family: 'vive',
    mode: 'light',
    palette: VIVE_LIGHT_HERO_PALETTE,
  },
  {
    id: 'safran-dark',
    label: 'Safran sombre',
    description: 'Jaune #FCE96A / émeraude #17977F — fond Stone #0C0A09.',
    family: 'safran',
    mode: 'dark',
    palette: SAFRAN_DARK_HERO_PALETTE,
  },
  {
    id: 'safran-light',
    label: 'Safran clair',
    description: 'Violet #3D2B84 / émeraude #0E7C6B — fond #FCE96A (Stone neutres).',
    family: 'safran',
    mode: 'light',
    palette: SAFRAN_LIGHT_HERO_PALETTE,
  },
  {
    id: 'citron-dark',
    label: 'Citron sombre',
    description: 'Violet #A78BFA / orange #F0985A — fond slate #0F172A.',
    family: 'citron',
    mode: 'dark',
    palette: CITRON_DARK_HERO_PALETTE,
  },
  {
    id: 'citron-light',
    label: 'Citron clair',
    description: 'Violet #4C1D6B / bleu #2563EB — fond #C8E01A (slate neutres).',
    family: 'citron',
    mode: 'light',
    palette: CITRON_LIGHT_HERO_PALETTE,
  },
  {
    id: 'rouge-dark',
    label: 'Rouge sombre',
    description: 'Rouge #EF4444 / cyan #38BDF8 — fond #020202 (Cyber-Rouge).',
    family: 'rouge',
    mode: 'dark',
    palette: ROUGE_DARK_HERO_PALETTE,
  },
  {
    id: 'rouge-light',
    label: 'Rouge clair',
    description: 'Rouge #DC2626 / cyan #0EA5E9 — fond #F4F4F5 (Zinc + blanc).',
    family: 'rouge',
    mode: 'light',
    palette: ROUGE_LIGHT_HERO_PALETTE,
  },
  {
    id: 'ecarlate-dark',
    label: 'Écarlate sombre',
    description: 'Rouge #FF3333 / menthe #34D399 — fond noir pur #000000.',
    family: 'ecarlate',
    mode: 'dark',
    palette: ECARLATE_DARK_HERO_PALETTE,
  },
  {
    id: 'ecarlate-light',
    label: 'Écarlate clair',
    description: 'Rouge #DF1C1C / émeraude #10B981 — fond blanc pur #FFFFFF.',
    family: 'ecarlate',
    mode: 'light',
    palette: ECARLATE_LIGHT_HERO_PALETTE,
  },
  {
    id: 'ardoise-dark',
    label: 'Ardoise sombre',
    description: 'Rouge #F87171 / bleu #60A5FA — fond #030712 (Gray).',
    family: 'ardoise',
    mode: 'dark',
    palette: ARDOISE_DARK_HERO_PALETTE,
  },
  {
    id: 'ardoise-light',
    label: 'Ardoise clair',
    description: 'Rouge #EF4444 / bleu #2563EB — fond #D4DBE7 (slate doux).',
    family: 'ardoise',
    mode: 'light',
    palette: ARDOISE_LIGHT_HERO_PALETTE,
  },
];

/** Best-effort match of the current palette to a named preset (for UI highlight). */
export function matchHeroPalettePresetId(
  palette: PortfolioHeroPalette | undefined | null
): (typeof PORTFOLIO_HERO_PALETTE_PRESETS)[number]['id'] | null {
  if (!palette) return null;
  const norm = (hex: string) => hex.trim().toLowerCase();
  for (const preset of PORTFOLIO_HERO_PALETTE_PRESETS) {
    const p = preset.palette;
    if (
      norm(palette.principal) === norm(p.principal) &&
      norm(palette.secondaire) === norm(p.secondaire) &&
      norm(palette.fond) === norm(p.fond) &&
      norm(palette.texteFort) === norm(p.texteFort)
    ) {
      return preset.id;
    }
  }
  return null;
}

export const DEFAULT_HERO_COLOR_BINDINGS: PortfolioHeroColorBindings = {
  headline: 'texteFort',
  headlinePrefix: 'texteMuted',
  headlineEmphasis: 'texteFort',
  headlineAccent: 'principal',
  description: 'texteMuted',
  /** Follows the blinking availability dot (Secondaire). */
  availabilityText: 'secondaire',
  availabilityBackground: 'neutre',
  availabilityBorder: 'bordure',
  availabilityDot: 'secondaire',
  ctaText: 'texteFort',
  /** Follows the headline specialty accent (Principal). */
  ctaBackground: 'principal',
  ctaBorder: 'bordure',
  toolsLabel: 'texteFaint',
  /** Elevated chip fill — Neutre stays a step above Fond in both modes. */
  toolsIconBackground: 'neutre',
  toolsIconBorder: 'bordure',
  toolsCardBackground: 'neutre',
  toolsCardBorder: 'bordure',
  toolsCardTitle: 'texteFort',
  toolsCardDescription: 'texteMuted',
  toolsCardLevel: 'texteFaint',
  creatorName: 'texteFort',
  metaValue: 'texteFort',
  metaLabel: 'texteMuted',
  metaCardBackground: 'neutre',
  metaFrameBorder: 'bordure',
  metaAccentYears: 'principal',
  metaAccentProjects: 'secondaire',
  metaAccentLocation: 'principal',
  sectionBackground: 'fond',
  /** Motif, portrait frame/mat/caption, and stats borders each have their own
   * binding (all default to Bordure — change a slot’s token to detach it). */
  motif: 'bordure',
  portraitFrame: 'bordure',
  portraitMat: 'bordure',
  portraitCaptionBar: 'bordure',
};

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

type Hsl = { h: number; s: number; l: number };

function hexToHsl(hex: string): Hsl {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h, s, l };
}

function hslToHex({ h, s, l }: Hsl): string {
  const hueToRgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }
  const toHex = (channel: number) =>
    Math.round(Math.min(1, Math.max(0, channel)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const PALETTE_ACCENT_TOKENS: HeroPaletteTokenId[] = ['principal', 'secondaire'];

/**
 * Auto-derive the light-mode palette from a dark palette:
 * - accents keep their hue / saturation, lightness clamped so they stay
 *   readable on a white background;
 * - text, surface, and border tokens invert their lightness (light text on
 *   dark becomes dark text on light, dark surfaces become light surfaces).
 */
export function computeLightPalette(dark: Partial<PortfolioHeroPalette>): PortfolioHeroPalette {
  const source = mergeHeroPalette(DEFAULT_HERO_PALETTE, dark);
  const next = { ...source };
  for (const token of HERO_PALETTE_TOKEN_IDS) {
    const hsl = hexToHsl(source[token]);
    if (PALETTE_ACCENT_TOKENS.includes(token)) {
      next[token] = hslToHex({ ...hsl, l: Math.min(hsl.l, 0.46) });
    } else {
      next[token] = hslToHex({ ...hsl, l: 1 - hsl.l });
    }
  }
  return next;
}

export function mergeHeroPalette(base: PortfolioHeroPalette, patch: unknown): PortfolioHeroPalette {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const id of HERO_PALETTE_TOKEN_IDS) {
    next[id] = sanitizeHex(record[id], base[id]);
  }
  return next;
}

export function mergeHeroColorBindings(
  base: PortfolioHeroColorBindings,
  patch: unknown
): PortfolioHeroColorBindings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const slot of HERO_COLOR_SLOT_IDS) {
    const value = record[slot];
    if (typeof value === 'string' && (HERO_PALETTE_TOKEN_IDS as string[]).includes(value)) {
      next[slot] = value as HeroPaletteTokenId;
    }
  }
  return next;
}

export function resolveHeroPaletteColor(
  palette: PortfolioHeroPalette,
  token: HeroPaletteTokenId
): string {
  return sanitizeHex(palette[token], DEFAULT_HERO_PALETTE[token]);
}

const ELEMENT_STYLE_SLOTS: Partial<Record<HeroColorSlot, PortfolioHeroStyleTarget>> = {
  headline: 'headline',
  headlinePrefix: 'headlinePrefix',
  headlineEmphasis: 'headlineEmphasis',
  headlineAccent: 'headlineAccent',
  description: 'description',
  availabilityText: 'availabilityText',
  ctaText: 'cta',
  toolsLabel: 'toolsLabel',
  toolsCardTitle: 'toolsCardTitle',
  toolsCardDescription: 'toolsCardDescription',
  toolsCardLevel: 'toolsCardLevel',
  creatorName: 'creatorName',
  metaValue: 'metaValue',
  metaLabel: 'metaLabel',
};

/** Reverse of ELEMENT_STYLE_SLOTS — typography color pickers → palette slot. */
const STYLE_TARGET_COLOR_SLOTS: Partial<Record<PortfolioHeroStyleTarget, HeroColorSlot>> = {
  headline: 'headline',
  headlinePrefix: 'headlinePrefix',
  headlineEmphasis: 'headlineEmphasis',
  headlineAccent: 'headlineAccent',
  description: 'description',
  availabilityText: 'availabilityText',
  cta: 'ctaText',
  toolsLabel: 'toolsLabel',
  toolsCardTitle: 'toolsCardTitle',
  toolsCardDescription: 'toolsCardDescription',
  toolsCardLevel: 'toolsCardLevel',
  creatorName: 'creatorName',
  metaValue: 'metaValue',
  metaLabel: 'metaLabel',
};

export function heroStyleTargetColorSlot(
  target: PortfolioHeroStyleTarget
): HeroColorSlot | null {
  return STYLE_TARGET_COLOR_SLOTS[target] ?? null;
}

/**
 * Push palette + bindings into concrete hero hex fields / elementStyles.
 * Render paths keep reading hex — no runtime token lookup required.
 */
export function applyHeroPaletteToPresentation(
  presentation: PortfolioHeroPresentationSettings
): Partial<PortfolioHeroPresentationSettings> {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, presentation.palette);
  const bindings = mergeHeroColorBindings(DEFAULT_HERO_COLOR_BINDINGS, presentation.colorBindings);
  const color = (slot: HeroColorSlot) => resolveHeroPaletteColor(palette, bindings[slot]);

  const styles = normalizeHeroElementStyles(presentation.elementStyles, presentation);
  const nextStyles = { ...styles } as PortfolioHeroElementStyles;
  for (const [slot, target] of Object.entries(ELEMENT_STYLE_SLOTS) as [
    HeroColorSlot,
    PortfolioHeroStyleTarget,
  ][]) {
    nextStyles[target] = { ...nextStyles[target], color: color(slot) };
  }
  // Filled Contact / secondary label contrast is resolved at render time
  // (heroCtaLabelStyle vs the real fill). Do not force white here — that made
  // light-mode secondary pills paint white-on-neutre when ctaText was legacy-bound.
  if (bindings.ctaText === 'neutre') {
    const fill = color('ctaBackground');
    const fond = palette.fond;
    // Only lift to white when the fill is actually dark (filled dark/accent pills).
    if (typeof fill === 'string' && /^#[0-9a-fA-F]{6}$/.test(fill)) {
      const raw = fill.slice(1);
      const r = parseInt(raw.slice(0, 2), 16) / 255;
      const g = parseInt(raw.slice(2, 4), 16) / 255;
      const b = parseInt(raw.slice(4, 6), 16) / 255;
      const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      if (lum < 0.45) {
        nextStyles.cta = { ...nextStyles.cta, color: '#ffffff' };
      } else if (typeof fond === 'string' && /^#[0-9a-fA-F]{6}$/.test(fond)) {
        // Light fill — use strong text for outline / secondary chrome.
        nextStyles.cta = { ...nextStyles.cta, color: palette.texteFort };
      }
    }
  }

  // The rendered motifs live in heroMotifs[] (each instance stores its own hex).
  // Prefer per-layer paletteToken; otherwise shapes/patterns use Motif, glow uses Principal.
  const motifHex = color('motif');
  const glowHex = color('headlineAccent');
  const heroMotifs =
    presentation.heroMotifs && presentation.heroMotifs.length > 0
      ? presentation.heroMotifs.map((motif) => {
          const token = motif.paletteToken;
          if (token) {
            return {
              ...motif,
              color: resolveHeroPaletteColor(palette, token),
            };
          }
          return motif.kind === 'glow'
            ? { ...motif, color: glowHex }
            : { ...motif, color: motifHex };
        })
      : undefined;

  return {
    palette,
    colorBindings: bindings,
    elementStyles: nextStyles,
    ...(heroMotifs ? { heroMotifs } : {}),
    leftMotifColor: motifHex,
    ...syncHeroLegacyTypographyFromElementStyles(nextStyles),
    availabilityTextColor: color('availabilityText'),
    availabilityBackgroundColor: color('availabilityBackground'),
    availabilityBorderColor: color('availabilityBorder'),
    availabilityDotColor: color('availabilityDot'),
    ctaBackgroundColor: color('ctaBackground'),
    ctaBorderColor: color('ctaBorder'),
    toolsIconBackgroundColor: color('toolsIconBackground'),
    toolsIconBorderColor: color('toolsIconBorder'),
    toolsCardBackgroundColor: color('toolsCardBackground'),
    toolsCardBorderColor: color('toolsCardBorder'),
    metaCardBackgroundColor: color('metaCardBackground'),
    metaFrameBorderColor: color('metaFrameBorder'),
    metaYearsAccentColor: color('metaAccentYears'),
    metaProjectsAccentColor: color('metaAccentProjects'),
    metaLocationAccentColor: color('metaAccentLocation'),
    metaAccentColor: color('metaAccentYears'),
    heroSectionBackgroundColor: color('sectionBackground'),
    motifColor: color('motif'),
    portraitFrameColor: color('portraitFrame'),
    portraitFrameBackgroundColor: color('portraitMat'),
    portraitCaptionBarColor: color('portraitCaptionBar'),
  };
}

/** Patch palette tokens, then sync bound hex fields. */
export function patchHeroPalette(
  presentation: PortfolioHeroPresentationSettings,
  palettePatch: Partial<PortfolioHeroPalette>
): Partial<PortfolioHeroPresentationSettings> {
  const palette = mergeHeroPalette(presentation.palette ?? DEFAULT_HERO_PALETTE, {
    ...presentation.palette,
    ...palettePatch,
  });
  return applyHeroPaletteToPresentation({
    ...presentation,
    palette,
  });
}

/** Change which token a slot uses, then sync that slot’s hex. */
export function patchHeroColorBinding(
  presentation: PortfolioHeroPresentationSettings,
  slot: HeroColorSlot,
  token: HeroPaletteTokenId
): Partial<PortfolioHeroPresentationSettings> {
  const colorBindings = mergeHeroColorBindings(
    presentation.colorBindings ?? DEFAULT_HERO_COLOR_BINDINGS,
    {
      ...(presentation.colorBindings ?? DEFAULT_HERO_COLOR_BINDINGS),
      [slot]: token,
    }
  );
  return applyHeroPaletteToPresentation({
    ...presentation,
    colorBindings,
  });
}

/**
 * Change the palette token a single slot is bound to, then sync hex fields.
 * Prefer this over locking several slots onto one token.
 */
export function patchHeroSlotColor(
  presentation: PortfolioHeroPresentationSettings,
  slot: HeroColorSlot,
  hex: string
): Partial<PortfolioHeroPresentationSettings> {
  const bindings = mergeHeroColorBindings(
    DEFAULT_HERO_COLOR_BINDINGS,
    presentation.colorBindings
  );
  return patchHeroPalette(presentation, { [bindings[slot]]: hex });
}
