import type { ReactNode } from 'react';
import { msg } from '@/lib/i18n/config';
import { SERVICE_ICON_FILLED } from '@/components/portfolio/portfolio-services-icon-filled';

/**
 * The icon set of the Services "Icon Cards" design. Hand-drawn 24×24 stroke icons (no icon
 * library is installed in this repo), rendered with `stroke="currentColor"` so the badge decides
 * the colour. `auto` is not an icon: it means "guess from the service title" (see
 * `resolveServiceIconKey`).
 */
export type ServiceIconKey =
  | 'bolt'
  | 'heart'
  | 'globe'
  | 'smile'
  | 'star'
  | 'sparkles'
  | 'pen'
  | 'code'
  | 'camera'
  | 'video'
  | 'palette'
  | 'chart'
  | 'megaphone'
  | 'rocket'
  | 'shield'
  | 'layers'
  | 'message'
  | 'music'
  | 'target'
  | 'compass'
  | 'briefcase'
  | 'users'
  | 'lightbulb'
  | 'search'
  | 'mail'
  | 'calendar'
  | 'money'
  | 'cart'
  | 'gift'
  | 'trophy'
  | 'book'
  | 'graduation'
  | 'mic'
  | 'headphones'
  | 'monitor'
  | 'smartphone'
  | 'cloud'
  | 'lock'
  | 'wrench'
  | 'scissors'
  | 'home'
  | 'pin'
  | 'truck'
  | 'leaf'
  | 'coffee'
  | 'utensils'
  | 'dumbbell';

/**
 * Icons beyond the hand-drawn set are stored as self-contained strings, so the public page never
 * loads the (large) icon catalogue:
 *  - `lib:<name>|<w>|<h>|<path>`: a catalogue glyph (filled, Font Awesome Free), path data inline;
 *  - `img:<url>`: the creator's own uploaded picture.
 */
export type ServiceCustomIcon = `lib:${string}` | `img:${string}`;
/** Any icon a service can end up showing. */
export type ServiceIconRef = ServiceIconKey | ServiceCustomIcon;

export type ServiceIconChoice = ServiceIconRef | 'auto';

/** Outline draws every icon as strokes; Filled as solid shapes. */
export type ServiceIconStyle = 'outline' | 'filled';

/** Largest picture a creator may upload as a service icon. */
export const SERVICE_ICON_UPLOAD_MAX_BYTES = 200 * 1024;

const LIB_PATH_RE = /^[MmLlHhVvCcSsQqTtAaZz0-9eE+\-.,\s]+$/;
const IMG_URL_RE = /^(https?:\/\/|\/)[^\s"'<>\\]+$/;

export function buildLibraryIcon(name: string, width: number, height: number, path: string): ServiceCustomIcon {
  return `lib:${name}|${width}|${height}|${path}`;
}

export function buildImageIcon(url: string): ServiceCustomIcon {
  return `img:${url}`;
}

export function parseLibraryIcon(ref: string): { name: string; width: number; height: number; path: string } | null {
  if (!ref.startsWith('lib:')) return null;
  const [name, w, h, ...rest] = ref.slice(4).split('|');
  const path = rest.join('|');
  const width = Number(w);
  const height = Number(h);
  if (!/^[a-z0-9-]{1,40}$/.test(name ?? '') || !(width > 0 && width <= 1024) || !(height > 0 && height <= 1024)) return null;
  if (path.length === 0 || path.length > 4000 || !LIB_PATH_RE.test(path)) return null;
  return { name, width, height, path };
}

export function parseImageIcon(ref: string): string | null {
  if (!ref.startsWith('img:')) return null;
  const url = ref.slice(4);
  return url.length <= 600 && IMG_URL_RE.test(url) ? url : null;
}

const PATHS: Record<ServiceIconKey, ReactNode> = {
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  heart: (
    <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4.5 7.2 4.5c2 0 3.5 1.1 4.8 2.8 1.3-1.7 2.8-2.8 4.8-2.8 3.3 0 5.6 3.1 4.4 6.6-1.7 4.8-9.2 9.4-9.2 9.4Z" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14.2c1 1.5 2.4 2.3 4 2.3s3-.8 4-2.3M9 9.5h.01M15 9.5h.01" />
    </>
  ),
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  sparkles: (
    <path d="M10 3.5 11.6 8 16 9.5l-4.4 1.6L10 15.5l-1.6-4.4L4 9.5 8.4 8 10 3.5ZM18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14Z" />
  ),
  pen: <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3ZM14.5 7.5l3 3" />,
  code: <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" />,
  camera: (
    <>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.7l1.6-2.5h6.4L16.8 7h2.7A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-9Z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10.5 5-3v9l-5-3" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7Z" />
      <path d="M7.5 11h.01M10 7.5h.01M14.5 7.5h.01" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  megaphone: <path d="M3 10v4a1 1 0 0 0 1 1h3l7 4V5L7 9H4a1 1 0 0 0-1 1ZM18 9a4 4 0 0 1 0 6M7 15l1.5 5h2.5L10 15.5" />,
  rocket: (
    <>
      <path d="M14.5 4.5c2.6-1 4.8-1 5.5-.5.5.7.5 2.9-.5 5.5-1 2.7-3.6 5.4-6.5 7.5l-4-4c2.1-2.9 4.8-5.5 5.5-8.5Z" />
      <path d="M9 12.5 6 12l-2.5 2.5L8 16M11.5 15l.5 3-2.5 2.5L8 16M15.5 8.5h.01M4.5 19.5 7 17" />
    </>
  ),
  shield: <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3ZM9 12l2.2 2.2L15.5 10" />,
  layers: <path d="m12 3 9 5-9 5-9-5 9-5ZM3 12.5l9 5 9-5M3 17l9 5 9-5" />,
  message: <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v10a1.5 1.5 0 0 1-1.5 1.5H9l-5 4V5.5ZM8.5 9.5h7M8.5 12.5h4.5" />,
  music: (
    <>
      <path d="M9 18V5.5l11-2V16" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="17.5" cy="16" r="2.5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12.5h18" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.5 3.5 5.2" />
    </>
  ),
  lightbulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3Z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </>
  ),
  money: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.8 9.2c-.5-1-1.6-1.6-2.8-1.6-1.6 0-2.8.9-2.8 2.1 0 2.9 5.6 1.5 5.6 4.4 0 1.2-1.2 2.2-2.8 2.2-1.3 0-2.4-.6-2.9-1.7M12 6v1.6M12 16.3V18" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2.5 3.5H5l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21 7.5H6.2" />
    </>
  ),
  gift: (
    <>
      <rect x="3.5" y="8.5" width="17" height="4" rx="1" />
      <path d="M5 12.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7.5M12 8.5V21M12 8.5c-1.2-2.6-3-4-4.5-4a2 2 0 0 0 0 4M12 8.5c1.2-2.6 3-4 4.5-4a2 2 0 0 1 0 4" />
    </>
  ),
  trophy: <path d="M8 4h8v6a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4.5M16 6h3a3 3 0 0 1-3 4.5M12 14v4M8.5 21h7M9.5 18h5" />,
  book: <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v14H6.5A1.5 1.5 0 0 0 5 18.5v-14ZM5 18.5A1.5 1.5 0 0 0 6.5 20H19v-3M9 7.5h6" />,
  graduation: <path d="M2.5 9 12 4.5 21.5 9 12 13.5 2.5 9ZM6.5 11v5c1.5 1.5 3.4 2.2 5.5 2.2s4-.7 5.5-2.2v-5M21.5 9v5" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" />
    </>
  ),
  headphones: <path d="M4 17v-4.5a8 8 0 0 1 16 0V17M4 15.5h2.5a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4.5ZM20 15.5h-2.5a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1H19a1 1 0 0 0 1-1v-4.5Z" />,
  monitor: (
    <>
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <path d="M8.5 21h7M12 17v4" />
    </>
  ),
  smartphone: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  cloud: <path d="M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.5h.1a3.75 3.75 0 0 1 0 7.5H7Z" />,
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5v-3a4 4 0 0 1 8 0v3M12 14.5v2" />
    </>
  ),
  wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8Z" />,
  scissors: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M8.2 7.3 20 18M8.2 16.7 20 6" />
    </>
  ),
  home: <path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1v-9.5Z" />,
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  truck: (
    <>
      <path d="M2.5 6h11v10.5h-11V6ZM13.5 9.5h4l3 3.5v3.5h-7" />
      <circle cx="6.5" cy="18.5" r="1.8" />
      <circle cx="16.5" cy="18.5" r="1.8" />
    </>
  ),
  leaf: <path d="M5 20c-.5-9 5-15 15-15 0 10-6 15.5-15 15ZM5 20l8.5-8.5" />,
  coffee: <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9ZM16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5V6M12 3.5V6" />,
  utensils: <path d="M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3M17 21V3c-2.2 1.2-3.5 3.6-3.5 7v3H17" />,
  dumbbell: <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />,
};

export const SERVICE_ICON_OPTIONS: { value: ServiceIconKey; label: string }[] = [
  { value: 'bolt', label: msg('Bolt') },
  { value: 'heart', label: msg('Heart') },
  { value: 'globe', label: msg('Globe') },
  { value: 'smile', label: msg('Smile') },
  { value: 'star', label: msg('Star') },
  { value: 'sparkles', label: msg('Sparkles') },
  { value: 'pen', label: msg('Pen') },
  { value: 'code', label: msg('Code') },
  { value: 'camera', label: msg('Camera') },
  { value: 'video', label: msg('Video') },
  { value: 'palette', label: msg('Palette') },
  { value: 'chart', label: msg('Chart') },
  { value: 'megaphone', label: msg('Megaphone') },
  { value: 'rocket', label: msg('Rocket') },
  { value: 'shield', label: msg('Shield') },
  { value: 'layers', label: msg('Layers') },
  { value: 'message', label: msg('Message') },
  { value: 'music', label: msg('Music') },
  { value: 'target', label: msg('Target') },
  { value: 'compass', label: msg('Compass') },
  { value: 'briefcase', label: msg('Briefcase') },
  { value: 'users', label: msg('Team') },
  { value: 'lightbulb', label: msg('Idea') },
  { value: 'search', label: msg('Search') },
  { value: 'mail', label: msg('Mail') },
  { value: 'calendar', label: msg('Calendar') },
  { value: 'money', label: msg('Money') },
  { value: 'cart', label: msg('Shop') },
  { value: 'gift', label: msg('Gift') },
  { value: 'trophy', label: msg('Trophy') },
  { value: 'book', label: msg('Book') },
  { value: 'graduation', label: msg('Teaching') },
  { value: 'mic', label: msg('Microphone') },
  { value: 'headphones', label: msg('Headphones') },
  { value: 'monitor', label: msg('Monitor') },
  { value: 'smartphone', label: msg('Mobile') },
  { value: 'cloud', label: msg('Cloud') },
  { value: 'lock', label: msg('Lock') },
  { value: 'wrench', label: msg('Repair') },
  { value: 'scissors', label: msg('Scissors') },
  { value: 'home', label: msg('Home') },
  { value: 'pin', label: msg('Location') },
  { value: 'truck', label: msg('Delivery') },
  { value: 'leaf', label: msg('Leaf') },
  { value: 'coffee', label: msg('Coffee') },
  { value: 'utensils', label: msg('Food') },
  { value: 'dumbbell', label: msg('Fitness') },
];

const ICON_KEYS = new Set<string>(SERVICE_ICON_OPTIONS.map((option) => option.value));

export function isServiceIconChoice(value: unknown): value is ServiceIconChoice {
  if (value === 'auto') return true;
  if (typeof value !== 'string') return false;
  return ICON_KEYS.has(value) || parseLibraryIcon(value) !== null || parseImageIcon(value) !== null;
}

/** Title keywords (English + French) → icon, tried in order; the first match wins. */
const KEYWORD_ICONS: [RegExp, ServiceIconKey][] = [
  [/mobile|\bios\b|android|smartphone/i, 'smartphone'],
  [/e-?commerce|\bshop|boutique|\bvente|\bstore/i, 'cart'],
  [/fitness|\bsport|\bgym|musculation|yoga|personal train/i, 'dumbbell'],
  [/cuisine|cook|\bchef|food|traiteur|catering|restaura|recette|p[aâ]tiss/i, 'utensils'],
  [/caf[eé]|coffee|barista/i, 'coffee'],
  [/coiff|\bhair|barber|couture|\btailor\b/i, 'scissors'],
  [/livraison|delivery|logisti|transport|d[eé]m[eé]nag|shipping/i, 'truck'],
  [/immobili|real estate|maison|\bhouse|d[eé]co|interior|int[eé]rieur/i, 'home'],
  [/formation|cours\b|course|teach|tutor|enseign|lesson|le[cç]on|training/i, 'graduation'],
  [/\blivres?\b|\bbook|e-?book|[eé]dition|publish/i, 'book'],
  [/voice|\bvoix|doublage|narrat/i, 'mic'],
  [/\bdj\b|casque|headphone|beat/i, 'headphones'],
  [/r[eé]par|repair|install|plomb|[eé]lectric|bricol|d[eé]pann/i, 'wrench'],
  [/cyber|password|privacy|rgpd|gdpr|encrypt/i, 'lock'],
  [/cloud|devops|serveur|server|\bsaas/i, 'cloud'],
  [/email|e-mail|newsletter|mailing/i, 'mail'],
  [/compta|account|financ|\btax|fiscal|budget|invest|paie|payroll/i, 'money'],
  [/[eé]v[eé]nement|\bevent|wedding|mariage|agenda|booking|r[eé]serv|planning/i, 'calendar'],
  [/recrut|recruit|\brh\b|\bhr\b|\bteam|[eé]quipe/i, 'users'],
  [/recherche|research|veille|benchmark/i, 'search'],
  [/id[eé]e|idea|innovation|brainstorm|cr[eé]ativ/i, 'lightbulb'],
  [/tourism|travel|voyage|guide|visite|\blocal\b/i, 'pin'],
  [/[eé]colog|\bbio\b|garden|jardin|nature|green|durable|sustainab/i, 'leaf'],
  [/cadeau|gift/i, 'gift'],
  [/award|concours|comp[eé]tition|winner|prix\b/i, 'trophy'],
  [/[eé]cran|monitor|desktop|informatique|ordinateur|computer/i, 'monitor'],
  [/business|entreprise|freelance|juridique|legal|avocat|admin/i, 'briefcase'],
  [/vid[eé]o|motion|film|montage|\bclips?\b|anim|after ?effects?|premiere/i, 'video'],
  [/photo|shoot|portrait|\bimages?\b/i, 'camera'],
  [/logo|brand|marque|identit|design|graphi|illustr|\bui\b|\bux\b/i, 'palette'],
  [/\bweb|site|d[eé]velop|\bdev\b|\bcode|coding|programm|\bapps?\b|application|software|logiciel|int[eé]grat|c\+\+|python|java/i, 'code'],
  [/seo|growth|croissance|analytics|data|ads|perform/i, 'chart'],
  [/social|community|communaut|market|pub|campagn|influen/i, 'megaphone'],
  [/r[eé]dac|writ|copy|blog|article|content|contenu|traduc/i, 'pen'],
  [/music|musique|audio|son\b|sound|podcast|mix/i, 'music'],
  [/conseil|consult|strat[eé]g|coach|audit|accompagn/i, 'compass'],
  [/s[eé]curit|security|maintenance|support|h[eé]berg|hosting/i, 'shield'],
  [/launch|lancement|startup|mvp|go.?to/i, 'rocket'],
  [/chat|message|translation|langu|customer|client/i, 'message'],
  [/print|packag|impression|maquette|template|mockup/i, 'layers'],
  [/inter?national|global|monde|world|export/i, 'globe'],
];

/** Fallback rotation when nothing matches — the four icons of the reference first. */
const ROTATION: ServiceIconKey[] = ['bolt', 'heart', 'globe', 'smile', 'star', 'sparkles', 'target', 'rocket'];

export function resolveServiceIconKey(choice: ServiceIconChoice | undefined, title: string, index: number): ServiceIconRef {
  if (choice && choice !== 'auto') return choice;
  for (const [pattern, key] of KEYWORD_ICONS) {
    if (pattern.test(title)) return key;
  }
  return ROTATION[index % ROTATION.length];
}

/** Catalogue glyphs are solid; the Outline style traces their silhouette instead. */
export function libraryPaint(viewBoxWidth: number, variant: ServiceIconStyle) {
  return variant === 'filled'
    ? ({ fill: 'currentColor' } as const)
    : ({
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: (viewBoxWidth / 24) * 1.7,
        strokeLinejoin: 'round',
        strokeLinecap: 'round',
      } as const);
}

/** The icon's strokes, to drop inside any `<svg viewBox="0 0 24 24">` (the settings tiles reuse it). */
export function serviceIconPaths(key: ServiceIconKey): ReactNode {
  return PATHS[key];
}

/** The solid twin of a hand-drawn icon, for the Filled style. */
export function serviceIconFilled(key: ServiceIconKey): { width: number; height: number; path: string } | null {
  const twin = SERVICE_ICON_FILLED[key];
  return twin ? { width: twin[0], height: twin[1], path: twin[2] } : null;
}

export function ServiceIcon({
  name,
  className,
  size,
  strokeWidth = 2,
  variant = 'outline',
}: {
  name: ServiceIconRef;
  variant?: ServiceIconStyle;
  className?: string;
  /** Width and height in px (otherwise size it with `className`). */
  size?: number;
  strokeWidth?: number;
}) {
  const image = parseImageIcon(name);
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className={className} width={size} height={size} style={{ objectFit: 'contain' }} />;
  }
  const library = parseLibraryIcon(name);
  if (library) {
    return (
      <svg
        viewBox={`0 0 ${library.width} ${library.height}`}
        className={className}
        width={size}
        height={size}
        {...libraryPaint(library.width, variant)}
        aria-hidden
      >
        <path d={library.path} />
      </svg>
    );
  }
  const filled = variant === 'filled' ? serviceIconFilled(name as ServiceIconKey) : null;
  if (filled) {
    return (
      <svg
        viewBox={`0 0 ${filled.width} ${filled.height}`}
        className={className}
        width={size}
        height={size}
        fill="currentColor"
        aria-hidden
      >
        <path d={filled.path} />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name as ServiceIconKey]}
    </svg>
  );
}
