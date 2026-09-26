import {
  resolveFooterDescription,
  resolveFooterInternalLinksColumn,
  type PortfolioFooterCenteredIdentity,
  type PortfolioFooterDescriptionSource,
  type PortfolioFooterDesign,
  type PortfolioFooterDesignLayout,
  type PortfolioFooterLayoutElementOverride,
  type PortfolioFooterLinkItem,
  type PortfolioFooterPresentationSettings,
} from '@/components/portfolio/portfolio-footer-settings';

type Presentation = PortfolioFooterPresentationSettings;

/** A visible, linkable portfolio section — built by the public page from its own nav items
 *  (same order and labels as the site navigation), so hidden sections never appear. */
export type PortfolioFooterSectionLinkOption = { id: string; label: string; href: string };

/** identity → name/avatar/bio · wordmark → the giant decorative name (text, orientation, color)
 *  · text → headlines, buttons, notes · labels → small column headings. */
export type FooterLayoutGroup = 'identity' | 'wordmark' | 'text' | 'labels';

type FooterLayoutSpecBase = {
  key: string;
  label: string;
  group: FooterLayoutGroup;
  /** Panel-only: hide the control while this returns false (e.g. a sub-option of a toggle). */
  showWhen?: (p: Presentation) => boolean;
};

export type FooterLayoutToggleSpec = FooterLayoutSpecBase & {
  kind: 'toggle';
  defaultVisible: (p: Presentation) => boolean;
};

export type FooterLayoutTextSpec = FooterLayoutSpecBase & {
  kind: 'text';
  /** Empty string → the renderer's own fallback (e.g. the creator's name). */
  defaultText: (p: Presentation) => string;
  /** Panel placeholder when `defaultText` is empty. */
  placeholder?: string;
  hideable?: boolean;
  defaultVisible?: (p: Presentation) => boolean;
  multiline?: boolean;
};

export type FooterLayoutBioSpec = FooterLayoutSpecBase & {
  kind: 'bio';
  defaultVisible: (p: Presentation) => boolean;
  defaultSource: (p: Presentation) => PortfolioFooterDescriptionSource;
  defaultCustom: (p: Presentation) => string;
};

/** Writes straight to an existing presentation field (not the per-design store). */
export type FooterLayoutChoiceSpec = FooterLayoutSpecBase & {
  kind: 'choice';
  field: 'centeredIdentity';
  options: { value: PortfolioFooterCenteredIdentity; label: string }[];
};

/** A per-design choice stored in the design's own layout (`override.choice`). `swatch` makes the
 *  panel render color chips instead of text pills. */
export type FooterLayoutOptionSpec = FooterLayoutSpecBase & {
  kind: 'option';
  options: { value: string; label: string; swatch?: string }[];
  defaultValue: string;
};

export type FooterContactTargetMode = 'email' | 'phone' | 'link';

/** Where a contact button points — stored as `override.choice` (mode) + `override.text` (URL
 *  when mode is `link`, picked from the profile's contact links or typed). */
export type FooterLayoutTargetSpec = FooterLayoutSpecBase & {
  kind: 'target';
  defaultValue: FooterContactTargetMode;
};

export type FooterLayoutElementSpec =
  | FooterLayoutToggleSpec
  | FooterLayoutTextSpec
  | FooterLayoutBioSpec
  | FooterLayoutChoiceSpec
  | FooterLayoutOptionSpec
  | FooterLayoutTargetSpec;

/** The four text-ink tokens of the palette, strongest → quietest. */
export type FooterInkToken = 'texteFort' | 'neutre' | 'texteMuted' | 'texteFaint';

export const FOOTER_INK_TOKEN_OPTIONS: { value: FooterInkToken; label: string; swatch: string }[] = [
  { value: 'texteFort', label: 'Strong text', swatch: 'var(--pf-palette-texte-fort, #f5f5f5)' },
  { value: 'neutre', label: 'Neutral', swatch: 'var(--pf-palette-neutre, #171717)' },
  { value: 'texteMuted', label: 'Muted text', swatch: 'var(--pf-palette-texte-muted, #a3a3a3)' },
  { value: 'texteFaint', label: 'Faint text', swatch: 'var(--pf-palette-texte-faint, #737373)' },
];

export type FooterDesignLayoutSpec = {
  sectionLinks?: { defaultSelection: (p: Presentation) => string[] };
  elements: FooterLayoutElementSpec[];
};

const KNOWN_SECTION_LINK_IDS = new Set([
  'hero',
  'info',
  'work',
  'services',
  'about',
  'aboutUs',
  'experience',
  'team',
  'gallery',
  'faq',
  'contact',
  'stack',
  'tools',
]);

function sectionAnchorId(href: string): string | null {
  const raw = href.trim();
  if (!raw.startsWith('#')) return null;
  const id = raw.slice(1);
  return KNOWN_SECTION_LINK_IDS.has(id) ? id : null;
}

/** What every Links-column design showed before this setting existed: these five sections,
 *  whenever they are visible on the page. */
const LEGACY_SECTION_LINKS = ['gallery', 'aboutUs', 'team', 'services', 'work'];

const legacySectionLinks = { defaultSelection: () => LEGACY_SECTION_LINKS };
const always = () => true;
const linksColumnTitle = (p: Presentation) => resolveFooterInternalLinksColumn(p).title;
const profileBioSource = (p: Presentation) => p.descriptionSource ?? 'bio';
const profileBioCustom = (p: Presentation) => p.descriptionCustom ?? '';

function nameToggle(defaultVisible: (p: Presentation) => boolean): FooterLayoutToggleSpec {
  return { kind: 'toggle', key: 'name', label: 'Name', group: 'identity', defaultVisible };
}

function heading(key: string, labelText: string, defaultText: string): FooterLayoutTextSpec {
  return { kind: 'text', key, label: labelText, group: 'labels', defaultText: () => defaultText };
}

function copy(key: string, labelText: string, defaultText: string): FooterLayoutTextSpec {
  return { kind: 'text', key, label: labelText, group: 'text', defaultText: () => defaultText };
}

function nameWatermark(key: string, labelText: string): FooterLayoutTextSpec {
  return {
    kind: 'text',
    key,
    label: labelText,
    group: 'wordmark',
    defaultText: () => '',
    placeholder: 'Your name',
  };
}

export const FOOTER_DESIGN_LAYOUT_SPECS: Record<PortfolioFooterDesign, FooterDesignLayoutSpec> = {
  'centered-minimal': {
    sectionLinks: {
      defaultSelection: (p) =>
        (p.centeredLinks ?? [])
          .map((link) => sectionAnchorId(link.href))
          .filter((id): id is string => Boolean(id)),
    },
    elements: [
      { kind: 'toggle', key: 'identity', label: 'Identity', group: 'identity', defaultVisible: always },
      {
        kind: 'choice',
        key: 'identityMode',
        label: 'Identity style',
        group: 'identity',
        field: 'centeredIdentity',
        options: [
          { value: 'name', label: 'Name' },
          { value: 'avatar', label: 'Avatar' },
          { value: 'custom', label: 'Custom' },
        ],
        showWhen: (p) => resolveFooterLayoutVisible(p, 'centered-minimal', 'identity'),
      },
      {
        kind: 'text',
        key: 'identityText',
        label: 'Custom text',
        group: 'identity',
        defaultText: (p) =>
          p.centeredCustomText && p.centeredCustomText !== 'Logo' ? p.centeredCustomText : '',
        placeholder: 'Your name',
        hideable: false,
        showWhen: (p) =>
          p.centeredIdentity === 'custom' && resolveFooterLayoutVisible(p, 'centered-minimal', 'identity'),
      },
    ],
  },
  landing: {
    sectionLinks: legacySectionLinks,
    elements: [
      nameToggle((p) => p.showBrand !== false),
      { kind: 'toggle', key: 'avatar', label: 'Avatar', group: 'identity', defaultVisible: (p) => p.showAvatar === true },
      {
        kind: 'bio',
        key: 'bio',
        label: 'Bio',
        group: 'identity',
        defaultVisible: (p) => p.showDescription === true,
        defaultSource: profileBioSource,
        defaultCustom: profileBioCustom,
      },
      heading('contactLabel', 'Contact heading', 'Contact'),
      { kind: 'text', key: 'linksLabel', label: 'Links heading', group: 'labels', defaultText: linksColumnTitle },
    ],
  },
  compact: {
    elements: [
      nameToggle((p) => p.showBrand !== false),
      {
        kind: 'bio',
        key: 'bio',
        label: 'Bio',
        group: 'identity',
        defaultVisible: always,
        defaultSource: profileBioSource,
        defaultCustom: profileBioCustom,
      },
    ],
  },
  minimal: {
    elements: [
      nameToggle((p) => p.showBrand !== false),
      {
        kind: 'bio',
        key: 'bio',
        label: 'Bio',
        group: 'identity',
        defaultVisible: always,
        defaultSource: profileBioSource,
        defaultCustom: profileBioCustom,
      },
      {
        kind: 'toggle',
        key: 'avatar',
        label: 'Portrait',
        group: 'identity',
        defaultVisible: (p) => p.showAvatar === true,
      },
      {
        kind: 'text',
        key: 'ctaLabel',
        label: 'Button',
        group: 'text',
        defaultText: (p) => p.ctaButtonLabel?.trim() || 'Contact me',
      },
    ],
  },
  'contact-card': {
    sectionLinks: legacySectionLinks,
    elements: [
      nameToggle((p) => p.showBrand !== false),
      heading('connectLabel', 'Social heading', 'Connect'),
      { kind: 'text', key: 'linksLabel', label: 'Links heading', group: 'labels', defaultText: linksColumnTitle },
    ],
  },
  monumental: {
    sectionLinks: { defaultSelection: () => ['hero', ...LEGACY_SECTION_LINKS] },
    elements: [
      nameWatermark('watermark', 'Name watermark'),
      {
        kind: 'text',
        key: 'headline',
        label: 'Headline',
        group: 'text',
        defaultText: (p) => p.monumentalHeadline,
        multiline: true,
      },
      { ...copy('submitLabel', 'Button', 'Send Message'), hideable: false },
    ],
  },
  'hero-columns': {
    sectionLinks: legacySectionLinks,
    elements: [
      { kind: 'toggle', key: 'portrait', label: 'Portrait', group: 'identity', defaultVisible: always },
      { kind: 'toggle', key: 'initials', label: 'Initials', group: 'identity', defaultVisible: always },
      heading('navLabel', 'Navigation heading', '(NAVIGATION)'),
      heading('noteLabel', 'Note heading', '(ACKNOWLEDGEMENT)'),
      {
        kind: 'bio',
        key: 'note',
        label: 'Note',
        group: 'text',
        defaultVisible: always,
        defaultSource: () => 'custom',
        defaultCustom: (p) => p.heroColumnsManifesto,
      },
      heading('infoLabel', 'Info heading', '(INFO)'),
    ],
  },
  'split-form': {
    sectionLinks: legacySectionLinks,
    elements: [
      { kind: 'toggle', key: 'portrait', label: 'Portrait', group: 'identity', defaultVisible: always },
      { kind: 'toggle', key: 'mark', label: 'Brand mark', group: 'identity', defaultVisible: always },
      nameToggle(always),
      {
        kind: 'text',
        key: 'headline',
        label: 'Headline',
        group: 'text',
        defaultText: (p) => p.splitFormHeadline,
        multiline: true,
      },
      {
        kind: 'text',
        key: 'description',
        label: 'Intro',
        group: 'text',
        defaultText: (p) => p.splitFormDescription,
        multiline: true,
      },
      copy('projectQuestion', 'Project question', 'What are you looking for?'),
      { ...copy('submitLabel', 'Button', 'Send message'), hideable: false },
      heading('contactLabel', 'Contact heading', '/ Contact'),
      heading('navLabel', 'Navigation heading', 'Navigation'),
      heading('visitLabel', 'Address heading', 'Visit us'),
    ],
  },
  'timezone-editorial': {
    elements: [
      { kind: 'toggle', key: 'avatar', label: 'Avatar', group: 'identity', defaultVisible: always },
      nameWatermark('watermark', 'Name watermark'),
    ],
  },
  'inverted-wordmark': {
    sectionLinks: legacySectionLinks,
    elements: [
      nameWatermark('wordmark', 'Wordmark'),
      {
        kind: 'option',
        key: 'wordmarkOrientation',
        label: 'Orientation',
        group: 'wordmark',
        options: [
          { value: 'mirrored', label: 'Mirrored' },
          { value: 'normal', label: 'Normal' },
        ],
        defaultValue: 'mirrored',
        showWhen: (p) => resolveFooterLayoutVisible(p, 'inverted-wordmark', 'wordmark'),
      },
      {
        kind: 'option',
        key: 'wordmarkColor',
        label: 'Color',
        group: 'wordmark',
        options: FOOTER_INK_TOKEN_OPTIONS,
        defaultValue: 'texteFort',
        showWhen: (p) => resolveFooterLayoutVisible(p, 'inverted-wordmark', 'wordmark'),
      },
    ],
  },
  'services-reveal': {
    sectionLinks: legacySectionLinks,
    elements: [
      heading('connectLabel', 'Social heading', 'Connect'),
      heading('navLabel', 'Links heading', 'Services'),
      heading('addressLabel', 'Address heading', 'Address'),
      heading('contactLabel', 'Contact heading', 'Contact'),
    ],
  },
  'editorial-grid': {
    sectionLinks: legacySectionLinks,
    elements: [
      { kind: 'toggle', key: 'avatar', label: 'Avatar', group: 'identity', defaultVisible: always },
      { kind: 'toggle', key: 'year', label: 'Year', group: 'identity', defaultVisible: always },
      {
        kind: 'text',
        key: 'tagline',
        label: 'Tagline',
        group: 'text',
        defaultText: (p) => p.editorialGridTagline,
        multiline: true,
      },
      copy('ctaLabel', 'Button', 'Get in touch'),
    ],
  },
  'headline-reveal': {
    sectionLinks: legacySectionLinks,
    elements: [
      nameToggle(always),
      {
        kind: 'bio',
        key: 'bio',
        label: 'Bio',
        group: 'text',
        defaultVisible: always,
        defaultSource: () => 'bio',
        defaultCustom: profileBioCustom,
      },
      copy('ctaLabel', 'Button', 'Contact me'),
      {
        kind: 'target',
        key: 'ctaTarget',
        label: 'Button link',
        group: 'text',
        defaultValue: 'email',
        showWhen: (p) => resolveFooterLayoutVisible(p, 'headline-reveal', 'ctaLabel'),
      },
    ],
  },
  dispatch: {
    sectionLinks: legacySectionLinks,
    elements: [
      nameWatermark('wordmark', 'Wordmark'),
      copy('signupHeading', 'Capture heading', 'Stay in touch'),
      copy('signupNote', 'Capture note', "Leave your email and I'll get back to you."),
      {
        kind: 'option',
        key: 'accent',
        label: 'Accent',
        group: 'text',
        options: [
          { value: 'mint', label: 'Mint', swatch: '#9ce8c2' },
          { value: 'amber', label: 'Amber', swatch: '#f2c65c' },
          { value: 'violet', label: 'Violet', swatch: '#c3b5fd' },
          { value: 'contrast', label: 'Contrast', swatch: 'var(--pf-palette-texte-fort, #f5f5f5)' },
        ],
        defaultValue: 'mint',
      },
    ],
  },
};

function findElementSpec(design: PortfolioFooterDesign, key: string): FooterLayoutElementSpec | undefined {
  return FOOTER_DESIGN_LAYOUT_SPECS[design]?.elements.find((element) => element.key === key);
}

export function footerLayoutOverride(
  p: Presentation,
  design: PortfolioFooterDesign,
  key: string
): PortfolioFooterLayoutElementOverride | undefined {
  return p.designLayouts?.[design]?.elements?.[key];
}

export function resolveFooterLayoutVisible(p: Presentation, design: PortfolioFooterDesign, key: string): boolean {
  const spec = findElementSpec(design, key);
  if (!spec || spec.kind === 'choice' || spec.kind === 'option' || spec.kind === 'target') return true;
  if (spec.kind === 'text' && spec.hideable === false) return true;
  const override = footerLayoutOverride(p, design, key);
  if (typeof override?.visible === 'boolean') return override.visible;
  if (spec.kind === 'text') return spec.defaultVisible ? spec.defaultVisible(p) : true;
  return spec.defaultVisible(p);
}

/** Visible text for a `text` element — override, else the design default, else `fallback`.
 *  `null` when the element is hidden or everything is empty. */
export function resolveFooterLayoutText(
  p: Presentation,
  design: PortfolioFooterDesign,
  key: string,
  fallback = ''
): string | null {
  if (!resolveFooterLayoutVisible(p, design, key)) return null;
  const spec = findElementSpec(design, key);
  const defaultText = spec?.kind === 'text' ? spec.defaultText(p) : '';
  const text = footerLayoutOverride(p, design, key)?.text?.trim() || defaultText.trim() || fallback.trim();
  return text || null;
}

export function resolveFooterLayoutBioSource(
  p: Presentation,
  design: PortfolioFooterDesign,
  key: string
): PortfolioFooterDescriptionSource {
  const spec = findElementSpec(design, key);
  const override = footerLayoutOverride(p, design, key);
  if (override?.source) return override.source;
  return spec?.kind === 'bio' ? spec.defaultSource(p) : 'bio';
}

export function resolveFooterLayoutBioCustom(p: Presentation, design: PortfolioFooterDesign, key: string): string {
  const spec = findElementSpec(design, key);
  const override = footerLayoutOverride(p, design, key);
  if (typeof override?.text === 'string') return override.text;
  return spec?.kind === 'bio' ? spec.defaultCustom(p) : '';
}

export function resolveFooterLayoutBio(
  p: Presentation,
  design: PortfolioFooterDesign,
  key: string,
  profileBio: string | null | undefined,
  maxLength = 2000
): string | null {
  if (!resolveFooterLayoutVisible(p, design, key)) return null;
  return resolveFooterDescription({
    source: resolveFooterLayoutBioSource(p, design, key),
    custom: resolveFooterLayoutBioCustom(p, design, key),
    bio: profileBio,
    maxLength,
  });
}

/** Saved value of an `option` element, or its default when unset/unknown. */
export function resolveFooterLayoutOption(p: Presentation, design: PortfolioFooterDesign, key: string): string {
  const spec = findElementSpec(design, key);
  if (spec?.kind !== 'option') return '';
  const choice = footerLayoutOverride(p, design, key)?.choice;
  return choice && spec.options.some((option) => option.value === choice) ? choice : spec.defaultValue;
}

export type FooterContactTarget = { mode: FooterContactTargetMode; url: string };

/** The URL is creator-typed and rendered as a public `href`: allow web/mail/tel/in-page targets
 *  only, so a `javascript:` or `data:` value can never reach visitors. Bare domains get https. */
function sanitizeFooterContactUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return '';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return '';
  if (url.startsWith('/') || url.startsWith('#')) return url;
  return `https://${url}`;
}

export function resolveFooterLayoutTarget(
  p: Presentation,
  design: PortfolioFooterDesign,
  key: string
): FooterContactTarget {
  const spec = findElementSpec(design, key);
  const override = footerLayoutOverride(p, design, key);
  const choice = override?.choice;
  const mode: FooterContactTargetMode =
    choice === 'email' || choice === 'phone' || choice === 'link'
      ? choice
      : spec?.kind === 'target'
        ? spec.defaultValue
        : 'email';
  return { mode, url: sanitizeFooterContactUrl(override?.text ?? '') };
}

/** Bound to one design — what every Footer design component receives as its `layout` prop. */
export type FooterDesignLayoutResolver = {
  isVisible: (key: string) => boolean;
  text: (key: string, fallback?: string) => string | null;
  bio: (key: string, profileBio: string | null | undefined, maxLength?: number) => string | null;
  option: (key: string) => string;
  target: (key: string) => FooterContactTarget;
};

export function createFooterDesignLayoutResolver(
  p: Presentation,
  design: PortfolioFooterDesign
): FooterDesignLayoutResolver {
  return {
    isVisible: (key) => resolveFooterLayoutVisible(p, design, key),
    text: (key, fallback) => resolveFooterLayoutText(p, design, key, fallback),
    bio: (key, profileBio, maxLength) => resolveFooterLayoutBio(p, design, key, profileBio, maxLength),
    option: (key) => resolveFooterLayoutOption(p, design, key),
    target: (key) => resolveFooterLayoutTarget(p, design, key),
  };
}

export function footerDesignHasSectionLinks(design: PortfolioFooterDesign): boolean {
  return Boolean(FOOTER_DESIGN_LAYOUT_SPECS[design]?.sectionLinks);
}

export function resolveFooterSelectedSectionIds(p: Presentation, design: PortfolioFooterDesign): string[] {
  const spec = FOOTER_DESIGN_LAYOUT_SPECS[design]?.sectionLinks;
  if (!spec) return [];
  return p.designLayouts?.[design]?.sectionLinks ?? spec.defaultSelection(p);
}

/** Links saved by the retired link-column editors that don't point at a portfolio section
 *  (e.g. an external URL) — kept after the selected sections so no saved link is lost. */
function legacyCustomLinks(p: Presentation, design: PortfolioFooterDesign): PortfolioFooterLinkItem[] {
  const stored =
    design === 'centered-minimal' ? p.centeredLinks ?? [] : resolveFooterInternalLinksColumn(p, {}).links;
  return stored.filter((link) => !sectionAnchorId(link.href));
}

/** Selected sections that are currently visible, in page order, then legacy custom links. */
export function resolveFooterSectionNavLinks(
  p: Presentation,
  design: PortfolioFooterDesign,
  options: PortfolioFooterSectionLinkOption[] = []
): PortfolioFooterLinkItem[] {
  if (!footerDesignHasSectionLinks(design)) return [];
  const selected = new Set(resolveFooterSelectedSectionIds(p, design));
  const sectionLinks = options
    .filter((option) => selected.has(option.id))
    .map((option) => ({ id: `section-${option.id}`, label: option.label, href: option.href }));
  const taken = new Set(sectionLinks.map((link) => link.href));
  return [...sectionLinks, ...legacyCustomLinks(p, design).filter((link) => !taken.has(link.href.trim()))];
}

function withDesignLayout(
  p: Presentation,
  design: PortfolioFooterDesign,
  update: (layout: PortfolioFooterDesignLayout) => PortfolioFooterDesignLayout
): Pick<Presentation, 'designLayouts'> {
  const current = p.designLayouts?.[design] ?? {};
  return { designLayouts: { ...(p.designLayouts ?? {}), [design]: update(current) } };
}

export function patchFooterLayoutElement(
  p: Presentation,
  design: PortfolioFooterDesign,
  key: string,
  patch: PortfolioFooterLayoutElementOverride
): Pick<Presentation, 'designLayouts'> {
  return withDesignLayout(p, design, (layout) => ({
    ...layout,
    elements: { ...(layout.elements ?? {}), [key]: { ...(layout.elements?.[key] ?? {}), ...patch } },
  }));
}

export function patchFooterSectionLink(
  p: Presentation,
  design: PortfolioFooterDesign,
  sectionId: string,
  selected: boolean
): Pick<Presentation, 'designLayouts'> {
  const current = resolveFooterSelectedSectionIds(p, design).filter((id) => id !== sectionId);
  const next = selected ? [...current, sectionId] : current;
  return withDesignLayout(p, design, (layout) => ({ ...layout, sectionLinks: next }));
}
