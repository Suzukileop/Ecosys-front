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

function entry(
  sectionId: PortfolioSettingsSectionId,
  label: string,
  keywords: string[],
  subSection?: string
): PortfolioSettingsSearchEntry {
  const sectionLabel =
    PORTFOLIO_SETTINGS_SECTIONS.find((section) => section.id === sectionId)?.label ?? sectionId;
  return {
    id: subSection ? `${sectionId}:${subSection}:${label}` : `${sectionId}:${label}`,
    sectionId,
    subSection,
    label,
    path: subSection ? `${sectionLabel} · ${label}` : sectionLabel,
    keywords: [...keywords, sectionLabel, sectionId],
  };
}

/** Searchable settings destinations (sections, subsections, and common controls). */
export const PORTFOLIO_SETTINGS_SEARCH_INDEX: PortfolioSettingsSearchEntry[] = [
  ...PORTFOLIO_SETTINGS_SECTIONS.map((section) =>
    entry(section.id, section.label, [section.description, section.label])
  ),

  // Global
  entry('theme', 'Theme & preferences', ['theme', 'preferences', 'shortcut', 'thème', 'préférences'], 'theme'),
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
    'Titles & motion',
    [
      'title',
      'subtitle',
      'description',
      'typography',
      'font',
      'alignment',
      'orientation',
      'sticky',
      'motion',
      'scroll',
      'titre',
      'sous-titre',
      'alignement',
      'police',
      'geist',
    ],
    'titles'
  ),
  entry('theme', 'Title alignment', ['title', 'alignment', 'align', 'titre', 'alignement'], 'titles'),
  entry(
    'theme',
    'Section subtitle typography',
    ['subtitle', 'description', 'sous-titre', 'typography', 'font', 'color', 'size'],
    'titles'
  ),
  entry(
    'theme',
    'Layout & width',
    ['width', 'content width', 'gutter', 'margins', 'largeur', 'layout', 'responsive'],
    'layout'
  ),
  entry(
    'theme',
    'Typography & title box',
    [
      'typography',
      'font',
      'subtitle',
      'chrome',
      'title box',
      'typo',
      'police',
      'body font',
      'maison neue',
      'plus jakarta',
      'geist',
      'caractères',
    ],
    'typography'
  ),
  entry(
    'theme',
    'Police principale',
    [
      'body font',
      'site font',
      'police',
      'plus jakarta',
      'geist',
      'maison neue',
      'montserrat',
      'raleway',
      'roboto',
      'caractères',
      'texte',
    ],
    'typography'
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
  entry('navigation', 'Navigation type', ['nav mode', 'per page', 'pages', 'default', 'type']),
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
    'Use color palette (Fond)',
    ['palette', 'manual', 'fond', 'background', 'manuel'],
    'background'
  ),
  entry(
    'hero',
    'Use color palette (elements)',
    [
      'palette',
      'manual',
      'manuel',
      'tokens',
      'titre',
      'description',
      'cta',
      'outils',
      'portrait',
      'stats',
      'disponibilité',
      'motifs',
    ],
    'title'
  ),
  entry(
    'hero',
    'Screen division',
    ['division', 'layout', 'flip', 'horizontal', 'vertical', 'stack', 'copy', 'visual', 'gauche', 'droite'],
    'general'
  ),
  entry(
    'hero',
    'Palette',
    ['palette', 'color', 'couleur', 'tokens', 'semantic', 'bound colors'],
    'palette'
  ),
  entry('hero', 'Background', ['fill', 'gradient', 'opacity', 'fond', 'arrière-plan'], 'background'),
  entry(
    'hero',
    'Motifs',
    [
      'motif',
      'motifs',
      'pattern',
      'patterns',
      'shape',
      'shapes',
      'geometric',
      'background pattern',
      'left',
      'right',
      'size',
      'placement',
      'responsive',
      'mobile',
      'desktop',
    ],
    'motifs'
  ),
  entry(
    'hero',
    'Availability badge',
    [
      'availability',
      'badge',
      'disponible',
      'disponibilité',
      'placement',
      'mobile',
      'tablet',
      'desktop',
      'top-center',
      'top left',
      'top right',
      'phrase',
      'dot',
      'typography',
    ],
    'availability'
  ),
  entry(
    'hero',
    'Titre',
    ['headline', 'title', 'prefix', 'accent', 'font', 'typography', 'titre', 'préfixe', 'free placement', 'alignment', 'desktop alignment', 'alignement'],
    'title'
  ),
  entry(
    'hero',
    'Description',
    ['description', 'pitch', 'paragraph', 'typography', 'alignment', 'desktop alignment', 'alignement'],
    'description'
  ),
  entry(
    'hero',
    'Outils',
    ['tools', 'tools label', 'preferred tools', 'outils', 'label', 'caption', 'icon', 'chip', 'alignment', 'desktop alignment', 'alignement'],
    'tools'
  ),
  entry(
    'hero',
    'CTA',
    ['contact button', 'cta', 'design', 'placement', 'surface', 'typography', 'bouton', 'alignment', 'desktop alignment', 'alignement'],
    'cta'
  ),
  entry(
    'hero',
    'Portrait',
    ['photo', 'image', 'frame', 'creator name', 'portrait', 'typography', 'status dot', 'blinking dot', 'point clignotant'],
    'portrait'
  ),
  entry(
    'hero',
    'Stat cards',
    ['stats', 'years', 'projects', 'location', 'badges', 'cartes', 'typography', 'accent'],
    'stats'
  ),

  // Portfolio / work
  entry(
    'work',
    'Use global color palette',
    ['palette', 'hero palette', 'sync colors', 'couleurs', 'palette hero'],
    'general'
  ),
  // Work
  entry(
    'work',
    'Use color palette',
    ['palette', 'manual', 'manuel', 'tokens', 'couleurs', 'désactiver palette'],
    'general'
  ),
  entry(
    'work',
    'Palette',
    ['palette', 'color', 'couleur', 'tokens', 'semantic', 'bound colors'],
    'palette'
  ),
  entry('work', 'General', ['visibility', 'marketplace', 'show portfolio'], 'general'),
  entry('work', 'Header', ['title', 'subtitle', 'fonts', 'colors'], 'header'),
  entry('work', 'Categories', ['filter', 'category', 'group', 'catégories', 'placement', 'typography'], 'categories'),
  entry(
    'work',
    'Cards',
    [
      'layout',
      'grid',
      'overlay',
      'design',
      'responsive',
      'cards',
      'cartes',
      'columns',
      'largeur',
      'width',
      'vertical',
      'centrage',
      'justify',
    ],
    'cards'
  ),
  entry(
    'work',
    'Media',
    [
      'media',
      'média',
      'image',
      'thumbnail',
      'vignette',
      'placement',
      'gauche',
      'droite',
      'haut',
      'bas',
      'taille',
      'ratio',
      'bordure',
      'border',
      'show media',
      'afficher média',
    ],
    'media'
  ),
  entry(
    'work',
    'Titre',
    ['title', 'project title', 'typography', 'placement', 'titre', 'overlay'],
    'title'
  ),
  entry(
    'work',
    'Description',
    ['description', 'body', 'typography', 'placement', 'texte'],
    'description'
  ),
  entry(
    'work',
    'Outils',
    [
      'tools',
      'logos',
      'icons',
      'outils',
      'placement',
      'typography',
      'fond',
      'icônes',
      'fit',
      'limiter',
    ],
    'tools'
  ),
  entry(
    'work',
    'CTA',
    ['view project', 'button', 'cta', 'bouton', 'placement', 'typography'],
    'cta'
  ),
  entry(
    'work',
    'Cadre des informations',
    ['info frame', 'content frame', 'border', 'padding', 'gap', 'cadre info', 'informations'],
    'cards'
  ),
  entry(
    'work',
    'Ombre / flotte',
    [
      'shadow',
      'float',
      'blur',
      'halo',
      'ombre',
      'flotte',
      'elevation',
      'lift',
      'intensité',
      'légèreté',
    ],
    'cards'
  ),
  entry('work', 'Background', ['fill', 'gradient', 'opacity', 'fond'], 'background'),

  // Stack
  entry('stack', 'Stack', ['stack', 'tech', 'pile', 'workflow', 'section']),
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
  entry('tools', 'Tools', ['tools', 'outils', 'workflow', 'section']),
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
  entry(
    'services',
    'Use global color palette',
    ['palette', 'hero palette', 'sync colors', 'couleurs', 'palette hero'],
    'general'
  ),
  entry(
    'services',
    'Use color palette',
    ['palette', 'manual', 'manuel', 'tokens', 'couleurs', 'désactiver palette'],
    'general'
  ),
  entry(
    'services',
    'Palette',
    ['palette', 'color', 'couleur', 'tokens', 'semantic', 'bound colors'],
    'palette'
  ),
  entry('services', 'General', ['visibility', 'show services', 'response time'], 'general'),
  entry('services', 'Header', ['title', 'subtitle', 'titre'], 'header'),
  entry(
    'services',
    'Cards',
    [
      'grid',
      'design',
      'services',
      'per row',
      'pricing',
      'tier',
      'offre',
      'tarif',
      'abonnement',
      'plan',
      'colonnes',
      'bandeau',
      'frame',
      'border',
      'radius',
      'padding',
      'card',
      'opacité',
      'opacity',
      'alignment',
      'placement',
      'spacing',
      'gap',
      'vertical',
      'espacement',
      'manual',
      'pixels',
      'preset',
      'tight',
      'medium',
      'large',
    ],
    'cards'
  ),
  entry('services', 'Titre', ['title', 'service title', 'card title', 'typography', 'titre'], 'title'),
  entry('services', 'Description', ['description', 'body', 'typography', 'texte'], 'description'),
  entry(
    'services',
    'Tasks',
    ['tasks', 'tâches', 'checklist', 'deliverables', 'typography', 'show tasks', 'bullet', 'puce', 'marker'],
    'tasks'
  ),
  entry('services', 'Prix', ['price', 'prix', 'placement', 'typography', 'currency', 'devise', 'euro', 'dollar', 'monnaie'], 'price'),
  entry('services', 'Livraison', ['delivery', 'livraison', 'typography'], 'delivery'),
  entry(
    'services',
    'CTA',
    ['commander', 'cta', 'bouton', 'button', 'order', 'placement', 'typography'],
    'cta'
  ),
  entry('services', 'Background', ['fill', 'gradient', 'fond'], 'background'),

  entry('info', 'Info', ['info', 'profile', 'details', 'about me', 'about'], undefined),
  entry('info', 'General', ['visibility', 'title', 'subtitle', 'about me', 'languages', 'level', 'étoiles', 'stars', 'niveau'], 'general'),
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
    'Use global color palette',
    ['palette', 'hero palette', 'sync colors', 'couleurs', 'palette hero'],
    'general'
  ),
  entry('experience', 'General', ['visibility', 'timeline', 'spacing', 'entry spacing', 'espacement', 'gap'], 'general'),
  entry(
    'experience',
    'Media',
    [
      'image',
      'photo',
      'video',
      'media',
      'sticky',
      'outside',
      'hors carte',
      'emplacement',
      'placement',
      'entry media',
      'taille',
      'size',
      'agrandir',
      'manuel',
      'proof',
      'liens',
      'sous média',
      'sous le média',
    ],
    'media'
  ),
  entry('experience', 'Palette', ['tokens', 'bindings', 'semantic colors'], 'palette'),
  entry('experience', 'Header', ['title', 'subtitle'], 'header'),
  entry('experience', 'Years', ['years', 'summary', 'années'], 'years'),
  entry('experience', 'Content', ['fields', 'labels', 'order', 'roles', 'tools', 'icon border', 'bento', 'photo', 'details', 'sous', 'status', 'finished', 'ongoing', 'badge', 'tasks', 'tâches', 'espacement'], 'content'),
  entry('experience', 'Style entry', ['title', 'organization', 'meta', 'description', 'status', 'finished', 'badge'], 'styleEntry'),
  entry('experience', 'Style years', ['years color', 'highlight'], 'styleYears'),
  entry('experience', 'Style blocks', ['tasks', 'proof', 'skills', 'tools', 'icon border', 'bordure', 'proof link', 'lien', 'puce'], 'styleBlocks'),
  entry(
    'experience',
    'Proof link style',
    ['proof', 'lien', 'link style', 'chrome', 'pill', 'underline', 'accent', 'puce'],
    'content'
  ),
  entry('experience', 'Frame', ['entry', 'story', 'details', 'tasks', 'proof', 'card'], 'frame'),
  entry('experience', 'Background', ['fill', 'gradient', 'fond'], 'background'),

  // FAQ
  entry(
    'faq',
    'Use global color palette',
    ['palette', 'hero palette', 'sync colors', 'couleurs', 'palette hero'],
    'general'
  ),
  entry('faq', 'General', ['visibility', 'accordion', 'spacing'], 'general'),
  entry('faq', 'Palette', ['tokens', 'bindings', 'semantic colors'], 'palette'),
  entry('faq', 'Header', ['title', 'subtitle'], 'header'),
  entry('faq', 'Frame', ['card', 'border', 'radius'], 'frame'),
  entry('faq', 'Items', ['questions', 'answers', 'icons'], 'items'),
  entry('faq', 'Style question', ['question', 'typography'], 'styleQuestion'),
  entry('faq', 'Style answer', ['answer', 'typography'], 'styleAnswer'),
  entry('faq', 'Style number', ['number', 'typography'], 'styleNumber'),
  entry('faq', 'Background', ['fill', 'gradient', 'fond'], 'background'),

  // Contact
  entry(
    'contact',
    'Use global color palette',
    ['palette', 'hero palette', 'sync colors', 'couleurs', 'palette hero'],
    'general'
  ),
  entry('contact', 'General', ['visibility', 'cta', 'design', 'icon', 'icone', 'border', 'size', 'couleur'], 'general'),
  entry(
    'contact',
    'Link / contact icons',
    [
      'icon',
      'icone',
      'border',
      'size',
      'couleur',
      'social',
      'badge',
      'lien',
      'contact icon',
      'background',
      'fond',
      'palette',
      'bordure',
    ],
    'general'
  ),
  entry(
    'experience',
    'Period rule',
    ['trait', 'horizontal', 'rule', 'opacity', 'opacite', 'bordure', 'bento', 'large', 'period'],
    'content'
  ),
  entry('contact', 'Header', ['title', 'subtitle'], 'header'),
  entry('contact', 'Typography', ['color', 'font', 'size', 'typography', 'channel', 'links', 'cta'], 'style'),
  entry('contact', 'Card frame', ['border', 'radius', 'frame'], 'frame'),
  entry('contact', 'Content', ['email', 'phone', 'social', 'channels'], 'content'),
  entry('contact', 'Background', ['fill', 'gradient', 'fond'], 'background'),

  // Footer
  entry(
    'footer',
    'Use global color palette',
    ['palette', 'hero palette', 'sync colors', 'couleurs', 'palette hero'],
    'general'
  ),
  entry('footer', 'General', ['visibility', 'design', 'colors'], 'general'),
  entry('footer', 'Content', ['brand', 'copyright', 'links', 'credit'], 'content'),
  entry('footer', 'Typography', ['color', 'font', 'size', 'typography', 'cta', 'meta'], 'typography'),
  entry('footer', 'Background', ['fill', 'gradient', 'pattern', 'fond'], 'background'),
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
    .slice(0, limit);
}
