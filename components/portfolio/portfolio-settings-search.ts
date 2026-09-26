import type { PortfolioSettingsSectionId } from '@/components/portfolio/portfolio-settings-types';
import { PORTFOLIO_SETTINGS_SECTIONS } from '@/components/portfolio/portfolio-settings-types';

export type PortfolioSettingsSearchEntry = {
  id: string;
  sectionId: PortfolioSettingsSectionId;
  subSection?: string;
  label: string;
  path: string;
  keywords: string[];
};

let searchEntrySeq = 0;

function entry(
  sectionId: PortfolioSettingsSectionId,
  label: string,
  keywords: string[],
  subSection?: string
): PortfolioSettingsSearchEntry {
  const sectionLabel =
    PORTFOLIO_SETTINGS_SECTIONS.find((section) => section.id === sectionId)?.label ?? sectionId;
  searchEntrySeq += 1;
  return {
    id: `${sectionId}:${subSection ?? '_'}:${label}:${searchEntrySeq}`,
    sectionId,
    subSection,
    label,
    path: subSection ? `${sectionLabel} · ${label}` : sectionLabel,
    keywords: [...keywords, sectionLabel, sectionId],
  };
}

const SECTION_SEARCH_KEYWORDS: Partial<Record<PortfolioSettingsSectionId, string[]>> = {
  stack: ['tech', 'pile', 'workflow', 'section'],
  tools: ['outils', 'workflow', 'section'],
  info: ['profile', 'details', 'about me', 'about'],
};

/** Searchable settings destinations (sections, subsections, and common controls). */
export const PORTFOLIO_SETTINGS_SEARCH_INDEX: PortfolioSettingsSearchEntry[] = [
  ...PORTFOLIO_SETTINGS_SECTIONS.map((section) =>
    entry(section.id, section.label, [
      section.description,
      section.label,
      ...(SECTION_SEARCH_KEYWORDS[section.id] ?? []),
    ])
  ),

  // Global
  entry('theme', 'Foundations', ['theme', 'preferences', 'shortcut', 'thème', 'préférences', 'basic', 'foundations'], 'theme'),
  entry(
    'theme',
    'Dark / light mode',
    [
      'appearance',
      'dark',
      'light',
      'sombre',
      'clair',
      'mode',
      'palette',
      'color mode',
      'night',
      'day',
    ],
    'theme'
  ),
  entry('theme', 'Theme palette', ['theme', 'color', 'colors', 'palette', 'custom theme', 'thème', 'couleur'], 'theme'),
  entry('theme', 'Keyboard shortcut', ['shortcut', 'ctrl', 'cmd', 'raccourci', 'settings'], 'theme'),
  entry(
    'theme',
    'Page background',
    [
      'background',
      'page background',
      'arrière-plan',
      'fond',
      'image',
      'wallpaper',
      'library',
      'bibliothèque',
    ],
    'background'
  ),
  entry(
    'theme',
    'Background image library',
    ['library', 'upload', 'images', '5', 'bibliothèque', 'galerie'],
    'background'
  ),
  entry(
    'theme',
    'Background pattern',
    ['pattern', 'motif', 'arrows', 'cubes', 'hexagons', 'texture', 'flèches', 'hexagones'],
    'background'
  ),
  entry('theme', 'Section order', ['order', 'reorder', 'section order', 'ordre', 'sections'], 'order'),
  entry(
    'theme',
    'Layout & width',
    ['width', 'content width', 'gutter', 'margins', 'largeur', 'layout', 'responsive'],
    'theme'
  ),

  // Navigation
  entry(
    'navigation',
    'Use color palette',
    ['palette', 'manual', 'manuel', 'tokens', 'couleurs', 'désactiver palette'],
    'general'
  ),
  entry(
    'navigation',
    'Hover effect',
    ['hover', 'survol', 'item hover', 'hover color', 'palette'],
    'style'
  ),
  entry(
    'navigation',
    'Use color palette (Bar & buttons)',
    ['palette', 'manual', 'bar', 'buttons', 'style', 'manuel'],
    'style'
  ),
  entry(
    'navigation',
    'Palette',
    ['palette', 'color', 'couleur', 'tokens', 'semantic', 'bound colors'],
    'palette'
  ),
  entry('navigation', 'Contact button', ['contact', 'cta', 'bouton', 'vertical'], undefined),
  entry(
    'navigation',
    'Contact display',
    ['contact', 'icon', 'button', 'label', 'affichage', 'chat'],
    undefined
  ),
  entry(
    'navigation',
    'Contact icon',
    ['contact', 'phone', 'handset', 'smartphone', 'ringing', 'icone', 'telephone'],
    undefined
  ),
  entry(
    'navigation',
    'Detach Contact',
    ['detach', 'detacher', 'free space', 'right', 'split', 'extras'],
    undefined
  ),
  entry(
    'navigation',
    'Contact button shape',
    ['contact', 'shape', 'forme', 'square', 'rounded', 'pill', 'corners', 'radius'],
    undefined
  ),
  entry(
    'navigation',
    'Contact colors',
    ['contact', 'background', 'border', 'blur', 'glass', 'shadow', 'couleur'],
    undefined
  ),
  entry(
    'navigation',
    'Link icons',
    ['mail', 'youtube', 'instagram', 'social', 'icons', 'free space', 'liens'],
    undefined
  ),
  entry(
    'navigation',
    'Link icons position',
    ['left', 'right', 'auto', 'extras', 'position', 'deplacer'],
    undefined
  ),
  entry(
    'navigation',
    'Emplacement des extras',
    [
      'extras',
      'placement',
      'free side',
      'côté libre',
      'before',
      'after',
      'avant',
      'après',
      'navigation',
      'cluster',
    ],
    undefined
  ),
  entry(
    'navigation',
    'Extra personnalisé',
    [
      'custom',
      'extra',
      'logo',
      'texte',
      'brand',
      'personnalisé',
      'chip',
      'icône',
      'lien',
    ],
    undefined
  ),
  entry(
    'navigation',
    'Link icon colors',
    ['link icon', 'background', 'mail', 'youtube', 'couleur', 'fond'],
    undefined
  ),
  entry('navigation', 'Show navigation', ['menu', 'visibility', 'afficher', 'navigation']),
  entry('navigation', 'Handle colors', ['handle', 'menu', 'chevron', 'illisible', 'contrast'], undefined),
  entry('navigation', 'Navigation type', ['nav mode', 'per page', 'default', 'type']),
  entry('navigation', 'When to appear', ['always', 'after scrolling', 'after hero', 'display', 'apparition']),
  entry('navigation', 'Glass / blur', ['glass', 'blur', 'frosted', 'flou', 'ombre'], undefined),
  entry('navigation', 'Bar shadow', ['shadow', 'halo', 'ombre', 'bar'], undefined),
  entry(
    'navigation',
    'Blur thickness',
    ['blur thickness', 'epaisseur', 'glass strength', 'intensity'],
    undefined
  ),
  entry(
    'navigation',
    'Shadow thickness',
    ['shadow thickness', 'epaisseur ombre', 'halo strength'],
    undefined
  ),
  entry('navigation', 'Button padding', ['button padding', 'pill', 'padding', 'bouton'], undefined),
  entry('navigation', 'Bar padding', ['bar padding', 'shell', 'padding'], undefined),
  entry('navigation', 'Hauteur de la barre', ['hauteur', 'bar height', 'compact', 'aéré', 'navbar'], undefined),
  entry(
    'navigation',
    'Comportement mobile',
    ['mobile', 'drawer', 'tiroir', 'phone', 'responsive', 'brand', 'barre', 'logo'],
    'general'
  ),
  entry(
    'navigation',
    'Barre logo pleine largeur',
    ['mobile', 'brand', 'bar', 'logo', 'slite', 'pleine largeur', 'header'],
    'general'
  ),
  entry(
    'navigation',
    'Tiroir menu mobile',
    ['drawer', 'tiroir', 'sidebar', 'mobile', 'menu'],
    'general'
  ),
  entry(
    'navigation',
    'Bascule clair / sombre dans la barre',
    ['toggle', 'theme', 'sun', 'moon', 'soleil', 'lune', 'mode', 'clair', 'sombre', 'dark', 'light'],
    undefined
  ),
  entry(
    'navigation',
    'Bascule clair / sombre capsule flottante',
    ['floating', 'pill', 'capsule', 'toggle', 'soleil', 'lune', 'mode'],
    'design'
  ),
  entry(
    'navigation',
    'Logo capsule flottante',
    ['floating', 'pill', 'capsule', 'logo', 'marque', 'brand'],
    'design'
  ),
  entry(
    'navigation',
    'Contact capsule flottante',
    ['floating', 'pill', 'capsule', 'contact', 'bouton', 'email'],
    'design'
  ),
  entry(
    'navigation',
    'Bascule clair / sombre menu plein écran',
    ['case', 'overlay', 'fullscreen', 'toggle', 'soleil', 'lune', 'mode'],
    'design'
  ),
  entry(
    'navigation',
    'Bascule clair / sombre panneau Duten',
    ['duten', 'panel', 'toggle', 'soleil', 'lune', 'mode'],
    'design'
  ),
  entry(
    'navigation',
    'Bascule clair / sombre demi-panneau',
    ['half', 'panel', 'drawer', 'toggle', 'soleil', 'lune', 'mode'],
    'design'
  ),

  // Hero
  entry('hero', 'General', ['visibility', 'title', 'subtitle', 'flip', 'division', 'layout', 'écran', 'général'], 'general'),
  entry(
    'hero',
    'Banner',
    [
      'banner',
      'design',
      'swiss',
      'editorial',
      'portrait',
      'identity',
      'editorial',
      'rail',
      'tools',
      'statement',
      'cta',
      'portrait',
      'balance',
      'left',
      'gauche',
      'hello',
      'lets talk',
      'circle',
      'cercle',
      'experience',
      'years',
      'split',
      'rond',
      'centre',
      'image',
      'avatar',
      'cover',
      'signature',
      'currently',
      'specialized',
      'layout',
      'swap',
      'interchange',
      'bio',
      'nom',
      'description',
      'portrait',
    ],
    'banner'
  ),
  entry(
    'hero',
    'Use color palette',
    ['palette', 'manual', 'manuel', 'tokens', 'couleurs', 'désactiver palette'],
    'general'
  ),
  entry(
    'hero',
    'Screen division',
    ['division', 'layout', 'flip', 'horizontal', 'vertical', 'stack', 'copy', 'visual', 'gauche', 'droite'],
    'general'
  ),

  // Work
  entry(
    'work',
    'Use color palette',
    ['palette', 'manual', 'manuel', 'tokens', 'couleurs', 'désactiver palette'],
    'general'
  ),
  entry('work', 'General', ['visibility', 'marketplace', 'show portfolio'], 'general'),
  entry('work', 'Header', ['title', 'subtitle', 'fonts', 'colors'], 'header'),
  entry(
    'work',
    'Design',
    ['layout', 'grid', 'design', 'responsive', 'board', 'accordion', 'frames', 'carousel'],
    'design'
  ),
  entry('work', 'Background', ['fill', 'gradient', 'opacity', 'fond'], 'background'),

  // Stack
  entry('stack', 'General', ['visibility', 'show stack', 'workflow rail', 'titre', 'sous-titre', 'alignement'], 'general'),
  entry('stack', 'Alignement titre', ['alignement', 'gauche', 'centre', 'droite', 'titre', 'header'], 'general'),
  entry('stack', 'Taille du titre', ['taille', 'titre', 'font', 'petite', 'moyenne', 'grande'], 'general'),
  entry('stack', 'Taille du sous-titre', ['taille', 'sous-titre', 'subtitle', 'font'], 'general'),
  entry('stack', 'Workflow rail', ['rail', 'tiles', 'logos', 'labels', 'workflow'], 'general'),
  entry('stack', 'Core stack tags', ['tags', 'chips', 'pastilles', 'kicker', 'core stack'], 'general'),
  entry('stack', 'Brand cards', ['brand', 'cards', 'cartes', 'description', 'use cases', 'niveau'], 'general'),
  entry('stack', 'Taille des tags', ['taille', 'agrandir', 'compacte', 'moyenne', 'grande', 'tags'], 'general'),
  entry('stack', 'Palette', ['palette', 'color', 'couleur', 'tiles'], 'palette'),
  entry('stack', 'Background', ['fill', 'gradient', 'fond'], 'background'),

  // Tools
  entry('tools', 'General', ['visibility', 'show tools', 'design', 'workflow rail', 'brand cards', 'brand index', 'brand row', 'brand float', 'titre', 'sous-titre', 'alignement'], 'general'),
  entry('tools', 'Alignement titre', ['alignement', 'gauche', 'centre', 'droite', 'titre', 'header'], 'general'),
  entry('tools', 'Sous-titre Tools', ['sous-titre', 'subtitle', 'aucun', 'personnalisé'], 'general'),
  entry('tools', 'Brand cards', ['cards', 'description', 'use cases', 'niveau', 'level', 'landbook', 'framer'], 'general'),
  entry('tools', 'Brand directory', ['directory', 'rows', 'list', 'webflow', 'framer', 'separators'], 'general'),
  entry('tools', 'Brand index', ['index', 'portfolio', 'logo', 'caps', 'uppercase', 'separators'], 'general'),
  entry('tools', 'Brand index pleine largeur', ['full width', 'pleine largeur', 'largeur', 'index'], 'general'),
  entry('tools', 'Brand row', ['row', 'grid', 'horizontal', 'compact', 'react', 'strip'], 'general'),
  entry('tools', 'Brand row cadres', ['frames', 'cadres', 'border', 'cellules', 'row'], 'general'),
  entry('tools', 'Brand row sans traits', ['none', 'sans traits', 'no border', 'row'], 'general'),
  entry('tools', 'Brand float', ['float', 'fluid', 'framer', 'landbook', 'glow', 'hover', 'tuiles'], 'general'),
  entry('tools', 'Brand float grille', ['fluid', 'auto-fill', 'colonnes', 'densité', 'float'], 'general'),
  entry('tools', 'Brand float sans cadre', ['plain', 'sans cadre', 'cadre', 'float'], 'general'),
  entry('tools', 'Colonnes brand row', ['colonnes', '2 par ligne', '3 par ligne', 'row'], 'general'),
  entry('tools', 'Alignement brand index', ['alignement', 'gauche', 'centre', 'droite', 'index'], 'general'),
  entry('tools', 'Brand directory niveau', ['niveau', 'tag', 'pourcentage', 'statistique', 'points', 'directory'], 'general'),
  entry('tools', 'Alignement brand directory', ['alignement', 'gauche', 'centre', 'droite', 'directory'], 'general'),
  entry('tools', 'Brand cards icône', ['icon', 'placement', 'gauche', 'showcase', 'cards'], 'general'),
  entry('tools', 'Colonnes brand grid', ['colonnes', '2 par ligne', '3 par ligne', 'cards', 'directory'], 'general'),
  entry('tools', 'Level stat bars', ['stat', 'bars', 'segments', 'proficiency', 'level', 'grid'], 'general'),
  entry('tools', 'Level progress rows', ['progress', 'bar', 'list', 'rows', 'level', 'landbook'], 'general'),
  entry('tools', 'Espacement lignes progress rows', ['espacement', 'lignes', 'rows', 'spacing', 'progress'], 'general'),
  entry('tools', 'Alignement liste progress rows', ['alignement', 'gauche', 'centre', 'droite', 'align'], 'general'),
  entry('tools', 'Colonnes progress rows écran large', ['colonnes', '2 par ligne', 'grid', 'large'], 'general'),
  entry('tools', 'Logos noir et blanc', ['grayscale', 'noir', 'blanc', 'monochrome', 'logo'], 'general'),
  entry('tools', 'Palette', ['palette', 'color', 'couleur', 'tiles'], 'palette'),
  entry('tools', 'Background', ['fill', 'gradient', 'fond'], 'background'),

  // Services
  entry('services', 'General', ['visibility', 'defaults'], 'general'),
  entry('services', 'Design', ['layout', 'style', 'design'], 'design'),
  entry('services', 'Background', ['fill', 'gradient', 'fond'], 'background'),
  entry('services', 'Header', ['title', 'subtitle', 'titre'], 'header'),

  entry('info', 'General', ['visibility', 'title', 'subtitle', 'about me', 'languages', 'level', 'étoiles', 'stars', 'niveau'], 'general'),
  entry('info', 'Header', ['title', 'subtitle', 'fonts', 'colors', 'header'], 'header'),
  entry(
    'info',
    'Design',
    [
      'design',
      'about me',
      'trait',
      'split',
      'manifesto',
      'about manifesto',
      'déclaration',
      'statement',
      'awwwards',
      'portrait',
      'education',
      'skills',
      'strengths',
      'languages',
      'tools',
      'framer',
      'asymétrique',
      'terminal',
      'console',
      'credits',
      'film',
      'value',
      'my value',
      'puces',
    ],
    'design'
  ),
  entry(
    'info',
    'Education design',
    ['education', 'timeline', 'editorial', 'panels', 'cascade', 'awwwards', 'webflow', 'framer'],
    'design'
  ),

  entry('aboutUs', 'General', ['visibility', 'about us', 'company', 'layout', 'title', 'subtitle', 'à propos', 'design', 'split', 'overlap', 'founder', 'liste', 'cadre', 'image gauche', 'media left', 'quote', 'citation', 'inverser', 'bordure', 'ombre', 'arrondi', 'fond', 'transparent', 'svg', 'illustration', 'globe', 'photo', 'image'], 'general'),

  // Experience
  entry(
    'experience',
    'General',
    [
      'general',
      'visibility',
      'show section',
      'tasks',
      'tasks display',
      'responsibilities',
      'engineering grid',
      'cinematic timeline',
      'editorial dash',
      'lined stack',
      'accordion stack',
      'architectural index',
      'index structural',
      'tools',
      'tools display',
      'outils',
      'affichage outils',
      'mineral pills',
      'editorial list',
      'kinetic marquee',
      'numbered index',
      'stack badges',
      'tech badges',
      'sticky vertical',
      'espacement sticky',
      'tâches',
      'arrow',
      'flèche',
      'link arrow',
      '↗',
    ],
    'general'
  ),
  entry(
    'experience',
    'Header',
    [
      'header',
      'header designs',
      'accent years',
      'centered',
      'serif lead',
      'title stack',
      'billboard',
      'marquee',
      'split heading',
      'masthead',
      'accent title',
      'editorial',
      'milestone',
      'table',
      'reel',
      'gallery',
      'spotlight',
      'loft',
      'press',
      'legacy',
      'badge',
      'font size',
      'radius',
      'advanced',
      'centered layout',
      'title',
      'sub-title',
      'subtitle',
      'alignment',
      'left',
      'right',
      'center',
      'weight',
      'opacity',
      'muted',
      'monumental',
      'compact',
      'max width',
      'line height',
      'aery',
      'divider',
      'ghost',
      'serif lead configuration',
      'label',
      'italic',
      'letter spacing',
      'tracking',
      'ink',
      'principal',
      'secondaire',
      'motion',
      'animation',
      'scroll',
      'marquee configuration',
      'outline',
      'fill',
      'speed',
      'edge fade',
      'separator',
      'velocity',
    ],
    'header'
  ),
  entry(
    'experience',
    'Design',
    [
      'design',
      'editorial',
      'milestone',
      'table',
      'cards',
      'ledger',
      'striped',
      'continuum',
      'timeline',
      'framer',
      'webflow',
      'layout',
      'experience design',
      'kinetic',
      'kinetic typo',
      'split',
      'typo',
      'brutalist',
      'nouveau',
      'card gap',
      'gap',
      'spacing',
      'espacement',
      'gutter',
    ],
    'design'
  ),
  entry(
    'experience',
    'Card gap',
    [
      'card gap',
      'gap',
      'spacing',
      'espacement',
      'gutter',
      'horizontal',
      'vertical',
      'cards',
      'grille',
    ],
    'design'
  ),

  // FAQ
  entry('faq', 'General', ['visibility', 'design', 'defaults', 'frame', 'border', 'cadre', 'padding', 'shadow', 'corners', 'radius', 'question color', 'answer color', 'text color', 'couleur'], 'general'),
  entry('faq', 'Design', ['layout', 'style', 'design'], 'design'),
  entry('faq', 'Header', ['title', 'subtitle', 'signal', 'query', 'dialogue'], 'header'),
  entry('faq', 'Background', ['fill', 'gradient', 'fond'], 'background'),

  // Contact
  entry('contact', 'General', ['visibility', 'design', 'defaults'], 'general'),
  entry(
    'experience',
    'Period rule',
    ['trait', 'horizontal', 'rule', 'opacity', 'opacite', 'bordure', 'bento', 'large', 'period'],
    'content'
  ),
  entry('contact', 'Design', ['layout', 'style', 'design'], 'design'),
  entry('contact', 'Background', ['fill', 'gradient', 'fond'], 'background'),
  entry('contact', 'Header', ['title', 'subtitle'], 'header'),

  // Footer
  entry('footer', 'General', ['visibility', 'design', 'defaults'], 'general'),
  entry('footer', 'Design', ['layout', 'style', 'design'], 'design'),
  entry('footer', 'Background', ['fill', 'gradient', 'fond'], 'background'),
  entry('footer', 'Header', ['title', 'subtitle'], 'header'),
];

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9&+\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ordered character match — rewards progressive typing even with skipped letters. */
function subsequenceScore(query: string, target: string): number {
  if (!query) return 0;
  let qi = 0;
  let streak = 0;
  let bestStreak = 0;
  let score = 0;
  for (let ti = 0; ti < target.length && qi < query.length; ti += 1) {
    if (target[ti] === query[qi]) {
      score += 2 + streak;
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
      qi += 1;
    } else {
      streak = 0;
    }
  }
  if (qi < query.length) return 0;
  return score + bestStreak * 3;
}

function scoreEntry(queryRaw: string, item: PortfolioSettingsSearchEntry): number {
  const query = normalizeSearchText(queryRaw);
  if (!query) return 0;

  const label = normalizeSearchText(item.label);
  const path = normalizeSearchText(item.path);
  const blob = normalizeSearchText([item.label, item.path, ...item.keywords].join(' '));
  const tokens = query.split(' ').filter(Boolean);

  let score = 0;

  if (label === query) score += 200;
  else if (label.startsWith(query)) score += 140;
  else if (label.includes(query)) score += 90;

  if (path.startsWith(query)) score += 40;
  else if (path.includes(query)) score += 24;

  if (blob.includes(query)) score += 30;

  for (const token of tokens) {
    if (label.startsWith(token)) score += 28;
    else if (label.includes(token)) score += 16;
    else if (blob.includes(token)) score += 10;
    else {
      const sub = subsequenceScore(token, blob);
      if (sub === 0) return 0;
      score += Math.min(18, sub);
    }
  }

  score += Math.min(36, subsequenceScore(query.replace(/\s+/g, ''), label.replace(/\s+/g, '')));
  score += Math.min(20, subsequenceScore(query.replace(/\s+/g, ''), blob.replace(/\s+/g, '')));

  // Prefer deep links slightly when equally relevant
  if (item.subSection) score += 4;

  return score;
}

export function searchPortfolioSettings(
  query: string,
  limit = 8
): Array<PortfolioSettingsSearchEntry & { score: number }> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return PORTFOLIO_SETTINGS_SEARCH_INDEX.map((item) => ({
    ...item,
    score: scoreEntry(trimmed, item),
  }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .filter((item, index, list) => {
      const dest = `${item.sectionId}:${item.subSection ?? '_'}:${item.label}`;
      return list.findIndex((other) => `${other.sectionId}:${other.subSection ?? '_'}:${other.label}` === dest) === index;
    })
    .slice(0, limit);
}
