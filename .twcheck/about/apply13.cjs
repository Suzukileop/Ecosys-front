const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');
function edit(rel, fn) {
  const f = path.join(root, rel);
  let s = fs.readFileSync(f, 'utf8');
  const eol = s.includes('\r\n') ? '\r\n' : '\n';
  s = s.replace(/\r\n/g, '\n');
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error(rel + ' missing: ' + a.slice(0, 90));
    s = s.replace(a, b);
  };
  fn(rep, () => s, (v) => { s = v; });
  fs.writeFileSync(f, s.replace(/\n/g, eol));
}

edit('components/portfolio/portfolio-about-us-settings.ts', (rep) => {
  rep(`  | 'split-quote'
  | 'editorial';`, `  | 'split-quote'
  | 'editorial'
  | 'panorama';`);
  rep(`    value === 'split-quote' ||
    value === 'editorial'
  );`, `    value === 'split-quote' ||
    value === 'editorial' ||
    value === 'panorama'
  );`);
  rep(`    design === 'split-quote' ||
    design === 'editorial'
  );`, `    design === 'split-quote' ||
    design === 'editorial' ||
    design === 'panorama'
  );`);
  rep(`  {
    value: 'editorial',
    label: msg('Editorial'),
    description: msg('Huge headline, a wide photo with the quote, a numbered list set between hairlines.'),
  },
];`, `  {
    value: 'editorial',
    label: msg('Editorial'),
    description: msg('Huge headline, a wide photo with the quote, a numbered list set between hairlines.'),
  },
  {
    value: 'panorama',
    label: msg('Panorama'),
    description: msg('Headline and lead, a full-width photo, then the list and the quote in columns.'),
  },
];`);
  rep(`presentation.design === 'split-overlap' || presentation.design === 'editorial' ? 'link' : 'solid';`, `presentation.design === 'split-overlap' || presentation.design === 'editorial' || presentation.design === 'panorama'
    ? 'link'
    : 'solid';`);
  rep(`  if (design === 'editorial') {
    return {
      design,
      mediaSide: 'left',`, `  if (design === 'panorama') {
    return {
      design,
      mediaSide: 'right',
      showQuote: true,
      showFounder: true,
      showFounderRating: false,
      showCta: true,
      ctaLabel: 'Contact',
      showTasks: true,
    };
  }
  if (design === 'editorial') {
    return {
      design,
      mediaSide: 'left',`);
  // generalised headline helper (Editorial + Panorama)
  rep(`export const ABOUT_US_EDITORIAL_TITLE_PX_MIN = 32;`, `/**
 * Inline style for a design's headline when the creator customised it (Design → Layout → Headline):
 * their colour, and their size as the desktop size — it steps down with the viewport (never below
 * 28px, or the value itself when smaller) so a large number cannot overflow a phone. Unset = {}.
 */
export function aboutUsCustomTitleStyle(
  presentation: Pick<PortfolioAboutUsPresentationSettings, 'editorialTitleColor' | 'editorialTitleSizePx' | 'titleColor'>
): { color: string; fontSize?: string } {
  const px = presentation.editorialTitleSizePx;
  return {
    color: presentation.editorialTitleColor ?? presentation.titleColor,
    ...(px
      ? { fontSize: \`clamp(\${Math.max(Math.min(px, 28), Math.round(px * 0.42))}px, \${((px / 1100) * 100).toFixed(2)}vw, \${px}px)\` }
      : null),
  };
}

export const ABOUT_US_EDITORIAL_TITLE_PX_MIN = 32;`);
});

edit('components/portfolio/EditorialAboutUsSection.tsx', (rep, get, set) => {
  rep(`  aboutUsChrome,
  aboutUsContentPlacementClass,`, `  aboutUsChrome,
  aboutUsContentPlacementClass,
  aboutUsCustomTitleStyle,`);
  // Editorial uses the shared helper now
  let s = get();
  const a = s.indexOf('  // Manual headline colour / size (Design → Layout → Headline).');
  const b = s.indexOf('  const gridCols = !twoColumns');
  if (a < 0 || b < 0) throw new Error('editorial title block');
  s = s.slice(0, a) + `  // Manual headline colour / size (Design → Layout → Headline); ignores Text size on purpose.\n  const editorialTitleStyle: CSSProperties = aboutUsCustomTitleStyle(presentation);\n\n` + s.slice(b);
  set(s);
  rep(`function AboutUsMediaLeftSingleVisual(`, fs.readFileSync(path.join(__dirname, 'panorama-design.txt'), 'utf8').replace(/\r\n/g, '\n') + `function AboutUsMediaLeftSingleVisual(`);
  rep(`  if (presentation.design === 'editorial') {
    return (
      <AboutUsEditorialDesign`, `  if (presentation.design === 'panorama') {
    return (
      <AboutUsPanoramaDesign
        aboutUs={aboutUs}
        presentation={presentation}
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
      />
    );
  }

  if (presentation.design === 'editorial') {
    return (
      <AboutUsEditorialDesign`);
});

edit('components/portfolio/portfolio-about-us-settings-panel.tsx', (rep, get, set) => {
  rep(`  const isEditorial = aboutUs.design === 'editorial';`, `  const isEditorial = aboutUs.design === 'editorial';
  const isPanorama = aboutUs.design === 'panorama';
  const hasCustomHeadline = isEditorial || isPanorama;`);
  rep(`{usesSplitChrome && !isSplitQuote && !isEditorial ? null : (`, `{usesSplitChrome && !isSplitQuote && !isEditorial && !isPanorama ? null : (`);
  rep(`isSplitQuote || isEditorial ? (`, `isSplitQuote || isEditorial || isPanorama ? (`);
  rep(`      {isEditorial ? (
        <div className="space-y-4">
          <p className="pf-stack-block-label">{t('Headline')}</p>`, `      {hasCustomHeadline ? (
        <div className="space-y-4">
          <p className="pf-stack-block-label">{t('Headline')}</p>`);
  rep(`value={aboutUs.editorialTitleSizePx ?? ABOUT_US_EDITORIAL_TITLE_AUTO_PX}`, `value={aboutUs.editorialTitleSizePx ?? (isPanorama ? 56 : ABOUT_US_EDITORIAL_TITLE_AUTO_PX)}`);
  rep(`            {isEditorial
              ? t('The section title is the small label above the headline;`, `            {isPanorama
              ? t('The section title is the small label on the left; a custom subtitle closes the page on the right. The first photo, list, quote and founder come from Information → About us.')
              : isEditorial
              ? t('The section title is the small label above the headline;`);
  // hide the image-side picker for Panorama
  let s = get();
  const start = s.indexOf(`          <div>
            <p className="pf-stack-block-label">{t('Image')}</p>`);
  const end = s.indexOf(`          {isSplitQuote ? (
            <div>
              <p className="pf-stack-block-label">
                {t('Photo or SVG')}`);
  if (start < 0 || end < 0 || end < start) throw new Error('image block');
  s = s.slice(0, start) + `          {isPanorama ? null : (\n` + s.slice(start, end) + `          )}\n` + s.slice(end);
  set(s);
});
console.log('ok');
