import {
  resolveContactSectionTitle,
  type PortfolioContactPremiumDesign,
  type PortfolioContactPresentationSettings,
} from '@/components/portfolio/portfolio-contact-settings';
import type { DesignLayoutElementOverride } from '@/components/portfolio/portfolio-design-layout-core';

type Presentation = PortfolioContactPresentationSettings;

/** image → portrait/visuals · text → headlines, taglines · labels → small captions ·
 *  form → form questions and button · effects → motion/interaction toggles. */
export type ContactLayoutGroup = 'image' | 'text' | 'details' | 'labels' | 'form' | 'effects';

export const CONTACT_LAYOUT_GROUP_TITLES: Record<ContactLayoutGroup, string> = {
  image: 'Image',
  text: 'Text',
  details: 'Details',
  labels: 'Headings',
  form: 'Form',
  effects: 'Effects',
};

type SpecBase = {
  key: string;
  label: string;
  group: ContactLayoutGroup;
  /** Panel-only: hide the control while this returns false. */
  showWhen?: (p: Presentation) => boolean;
};

export type ContactLayoutToggleSpec = SpecBase & {
  kind: 'toggle';
  defaultVisible: boolean | ((p: Presentation) => boolean);
};

export type ContactLayoutTextSpec = SpecBase & {
  kind: 'text';
  defaultText: (p: Presentation) => string;
  /** Panel placeholder when the default is "whatever the design already falls back to". */
  placeholder?: (p: Presentation) => string;
  /** false → always shown (e.g. a form button label). */
  hideable?: boolean;
  multiline?: boolean;
};

export type ContactLayoutOptionSpec = SpecBase & {
  kind: 'option';
  options: { value: string; label: string }[];
  defaultValue: string;
};

export type ContactLayoutElementSpec = ContactLayoutToggleSpec | ContactLayoutTextSpec | ContactLayoutOptionSpec;

const toggle = (key: string, label: string, group: ContactLayoutGroup = 'image'): ContactLayoutToggleSpec => ({
  kind: 'toggle',
  key,
  label,
  group,
  defaultVisible: true,
});

const heading = (key: string, label: string, text: string): ContactLayoutTextSpec => ({
  kind: 'text',
  key,
  label,
  group: 'labels',
  defaultText: () => text,
});

const formText = (key: string, label: string, text: string): ContactLayoutTextSpec => ({
  kind: 'text',
  key,
  label,
  group: 'form',
  defaultText: () => text,
  hideable: false,
});

/** Legacy dedicated fields (e.g. `editorialFocusHeadline`) stay the default text, so saved
 *  copy keeps rendering until the creator edits it here. */
const fromField =
  (read: (p: Presentation) => string | undefined, fallback: string) =>
  (p: Presentation) =>
    read(p)?.trim() || fallback;

const visibleWhen = (design: PortfolioContactPremiumDesign, key: string) => (p: Presentation) =>
  resolveContactLayoutVisible(p, design, key);

/** Per-design title. Empty → the design keeps the shared section title ("Contact" by default),
 *  which the panel shows as the placeholder. */
const titleSpec: ContactLayoutTextSpec = {
  kind: 'text',
  key: 'title',
  label: 'Title',
  group: 'text',
  defaultText: () => '',
  placeholder: (p) =>
    resolveContactSectionTitle({ titlePreset: p.titlePreset, titleCustom: p.titleCustom, title: '', cardDesign: p.cardDesign }),
  hideable: false,
};

export const CONTACT_DESIGN_LAYOUT_SPECS: Record<PortfolioContactPremiumDesign, ContactLayoutElementSpec[]> = {
  'editorial-focus': [
    {
      kind: 'text',
      key: 'headline',
      label: 'Headline',
      group: 'text',
      defaultText: fromField((p) => p.editorialFocusHeadline, "Let's build /\nSomething"),
      multiline: true,
      hideable: false,
    },
    heading('emailLabel', 'Email heading', 'Email'),
    heading('phoneLabel', 'Phone heading', 'Phone'),
    heading('addressLabel', 'Address heading', 'Address'),
    heading('socialLabel', 'Social heading', 'Social'),
  ],
  'split-grid': [
    {
      kind: 'text',
      key: 'marquee',
      label: 'Hover marquee',
      group: 'text',
      defaultText: fromField((p) => p.premiumMarqueeText, "Let's talk — Say hello — Reach out — "),
    },
    heading('locationLabel', 'Location heading', 'Location'),
    heading('phoneLabel', 'Phone heading', 'Call'),
  ],
  'liquid-distortion': [
    {
      kind: 'text',
      key: 'watermark',
      label: 'Watermark word',
      group: 'text',
      defaultText: fromField((p) => p.liquidDistortionWatermark, 'CONNECT'),
    },
    {
      kind: 'option',
      key: 'watermarkIntensity',
      label: 'Watermark intensity',
      group: 'text',
      options: [
        { value: 'subtle', label: 'Subtle' },
        { value: 'medium', label: 'Medium' },
        { value: 'bold', label: 'Bold' },
      ],
      defaultValue: 'subtle',
      showWhen: visibleWhen('liquid-distortion', 'watermark'),
    },
    heading('emailLabel', 'Email heading', 'Email'),
    heading('phoneLabel', 'Phone heading', 'Phone'),
    heading('addressLabel', 'Address heading', 'Address'),
    heading('socialLabel', 'Social heading', 'Social'),
  ],
  'sequential-reveal': [
    titleSpec,
    toggle('portrait', 'Image'),
    toggle('copyrightMark', '© mark', 'text'),
    {
      kind: 'text',
      key: 'tagline',
      label: 'Tagline',
      group: 'text',
      defaultText: fromField((p) => p.sequentialRevealTagline, "Share your idea, let's build something meaningful together."),
      multiline: true,
    },
    // Which channels exist is still General → Visibility (Email / Phone / Location); this only
    // decides whether this design shows them, and where.
    { kind: 'toggle', key: 'details', label: 'Contact details', group: 'details', defaultVisible: false },
    {
      kind: 'option',
      key: 'detailsPosition',
      label: 'Position',
      group: 'details',
      options: [
        { value: 'above', label: 'Above form' },
        { value: 'below', label: 'Below form' },
      ],
      defaultValue: 'above',
      showWhen: (p) =>
        resolveContactLayoutVisible(p, 'sequential-reveal', 'details') &&
        resolveContactLayoutVisible(p, 'sequential-reveal', 'form'),
    },
    { ...heading('detailEmailLabel', 'Email heading', 'Email'), group: 'details', showWhen: visibleWhen('sequential-reveal', 'details') },
    { ...heading('detailPhoneLabel', 'Phone heading', 'Phone'), group: 'details', showWhen: visibleWhen('sequential-reveal', 'details') },
    { ...heading('detailAddressLabel', 'Address heading', 'Address'), group: 'details', showWhen: visibleWhen('sequential-reveal', 'details') },
    {
      kind: 'toggle',
      key: 'form',
      label: 'Contact form',
      group: 'form',
      defaultVisible: (p) => p.showContactForm !== false,
    },
    { ...formText('firstNameLabel', 'First name field', 'First name'), showWhen: visibleWhen('sequential-reveal', 'form') },
    { ...formText('lastNameLabel', 'Last name field', 'Last name'), showWhen: visibleWhen('sequential-reveal', 'form') },
    { ...formText('emailFieldLabel', 'Email field', 'Email'), showWhen: visibleWhen('sequential-reveal', 'form') },
    { ...formText('messageLabel', 'Message field', 'Message'), showWhen: visibleWhen('sequential-reveal', 'form') },
    { ...formText('submitLabel', 'Button', 'Send'), showWhen: visibleWhen('sequential-reveal', 'form') },
    {
      kind: 'text',
      key: 'directEmail',
      label: 'Direct email line',
      group: 'form',
      defaultText: () => 'or write directly to',
      showWhen: visibleWhen('sequential-reveal', 'form'),
    },
  ],
  'studio-overlap': [
    titleSpec,
    toggle('portrait', 'Portrait'),
    toggle('arrow', 'Arrow'),
    heading('enquiriesLabel', 'Contact heading', '/ General enquiries'),
    heading('addressLabel', 'Address heading', '/ Address'),
  ],
  'borderless-grid': [
    titleSpec,
    {
      kind: 'text',
      key: 'subline',
      label: 'Second headline',
      group: 'text',
      defaultText: fromField((p) => p.borderlessGridSubline, 'Start a conversation.'),
    },
    toggle('spotlight', 'Hover spotlight', 'effects'),
  ],
  'broken-grid': [
    titleSpec,
    toggle('portrait', 'Portrait'),
    {
      kind: 'option',
      key: 'portraitShape',
      label: 'Portrait shape',
      group: 'image',
      options: [
        { value: 'circle', label: 'Circle' },
        { value: 'rounded', label: 'Rounded' },
        { value: 'square', label: 'Square' },
      ],
      defaultValue: 'circle',
      showWhen: visibleWhen('broken-grid', 'portrait'),
    },
  ],
  'numbered-narrative': [
    titleSpec,
    toggle('portrait', 'Portrait'),
    formText('question1', 'Question 1', "What's your name?"),
    formText('question2', 'Question 2', "What's your email?"),
    formText('question3', 'Question 3', 'Tell me about the project'),
    formText('submitLabel', 'Button', 'Send message'),
    heading('contactLabel', 'Contact heading', 'Contact details'),
    heading('businessLabel', 'Address heading', 'Business details'),
    heading('socialsLabel', 'Social heading', 'Socials'),
  ],
  'magnetic-overlap': [
    titleSpec,
    toggle('portrait', 'Image'),
    {
      kind: 'text',
      key: 'eyebrow',
      label: 'Eyebrow',
      group: 'text',
      defaultText: fromField((p) => p.magneticOverlapEyebrow, 'Say hey'),
    },
    {
      kind: 'option',
      key: 'socialBadges',
      label: 'Social badges',
      group: 'text',
      options: [
        { value: '0', label: 'None' },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: 'all', label: 'All' },
      ],
      defaultValue: '2',
    },
  ],
};

function findSpec(design: PortfolioContactPremiumDesign, key: string): ContactLayoutElementSpec | undefined {
  return CONTACT_DESIGN_LAYOUT_SPECS[design]?.find((spec) => spec.key === key);
}

export function contactLayoutOverride(
  p: Presentation,
  design: PortfolioContactPremiumDesign,
  key: string
): DesignLayoutElementOverride | undefined {
  return p.designLayouts?.[design]?.elements?.[key];
}

export function resolveContactLayoutVisible(p: Presentation, design: PortfolioContactPremiumDesign, key: string): boolean {
  const spec = findSpec(design, key);
  if (!spec || spec.kind === 'option') return true;
  if (spec.kind === 'text' && spec.hideable === false) return true;
  const override = contactLayoutOverride(p, design, key);
  if (typeof override?.visible === 'boolean') return override.visible;
  if (spec.kind !== 'toggle') return true;
  return typeof spec.defaultVisible === 'function' ? spec.defaultVisible(p) : spec.defaultVisible;
}

/** Override, else the design default; `null` when hidden or empty. */
export function resolveContactLayoutText(p: Presentation, design: PortfolioContactPremiumDesign, key: string): string | null {
  if (!resolveContactLayoutVisible(p, design, key)) return null;
  const spec = findSpec(design, key);
  const defaultText = spec?.kind === 'text' ? spec.defaultText(p) : '';
  return contactLayoutOverride(p, design, key)?.text?.trim() || defaultText.trim() || null;
}

export function resolveContactLayoutOption(p: Presentation, design: PortfolioContactPremiumDesign, key: string): string {
  const spec = findSpec(design, key);
  if (spec?.kind !== 'option') return '';
  const choice = contactLayoutOverride(p, design, key)?.choice;
  return choice && spec.options.some((option) => option.value === choice) ? choice : spec.defaultValue;
}

export type ContactDesignLayoutResolver = {
  isVisible: (key: string) => boolean;
  text: (key: string) => string | null;
  option: (key: string) => string;
};

export function createContactDesignLayoutResolver(
  p: Presentation,
  design: PortfolioContactPremiumDesign
): ContactDesignLayoutResolver {
  return {
    isVisible: (key) => resolveContactLayoutVisible(p, design, key),
    text: (key) => resolveContactLayoutText(p, design, key),
    option: (key) => resolveContactLayoutOption(p, design, key),
  };
}

export function patchContactLayoutElement(
  p: Presentation,
  design: PortfolioContactPremiumDesign,
  key: string,
  patch: DesignLayoutElementOverride
): Pick<Presentation, 'designLayouts'> {
  const layout = p.designLayouts?.[design] ?? {};
  return {
    designLayouts: {
      ...(p.designLayouts ?? {}),
      [design]: {
        ...layout,
        elements: { ...(layout.elements ?? {}), [key]: { ...(layout.elements?.[key] ?? {}), ...patch } },
      },
    },
  };
}
