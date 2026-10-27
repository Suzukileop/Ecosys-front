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
  fn(rep);
  fs.writeFileSync(f, s.replace(/\n/g, eol));
}

edit('components/portfolio/portfolio-about-us-settings.ts', (rep) => {
  rep(`  | 'editorial'
  | 'panorama';`, `  | 'editorial'
  | 'panorama'
  | 'folio';`);
  rep(`    value === 'editorial' ||
    value === 'panorama'
  );`, `    value === 'editorial' ||
    value === 'panorama' ||
    value === 'folio'
  );`);
  rep(`    design === 'editorial' ||
    design === 'panorama'
  );`, `    design === 'editorial' ||
    design === 'panorama' ||
    design === 'folio'
  );`);
  rep(`    description: msg('Headline and lead, a full-width photo, then the list and the quote in columns.'),
  },
];`, `    description: msg('Headline and lead, a full-width photo, then the list and the quote in columns.'),
  },
  {
    value: 'folio',
    label: msg('Folio'),
    description: msg('A ruled page: portrait with its caption, headline, plain list, the quote as a closing line.'),
  },
];`);
  rep(`presentation.design === 'split-overlap' || presentation.design === 'editorial' || presentation.design === 'panorama'
    ? 'link'`, `presentation.design === 'split-overlap' ||
    presentation.design === 'editorial' ||
    presentation.design === 'panorama' ||
    presentation.design === 'folio'
    ? 'link'`);
  rep(`  if (design === 'panorama') {
    return {
      design,
      mediaSide: 'right',`, `  if (design === 'folio') {
    return {
      design,
      mediaSide: 'left',
      showQuote: true,
      showFounder: true,
      showFounderRating: false,
      showCta: true,
      ctaLabel: 'Contact',
      showTasks: true,
    };
  }
  if (design === 'panorama') {
    return {
      design,
      mediaSide: 'right',`);
});

edit('components/portfolio/EditorialAboutUsSection.tsx', (rep) => {
  rep(`function AboutUsMediaLeftSingleVisual(`, fs.readFileSync(path.join(__dirname, 'folio-design.txt'), 'utf8').replace(/\r\n/g, '\n') + `function AboutUsMediaLeftSingleVisual(`);
  rep(`  if (presentation.design === 'panorama') {
    return (
      <AboutUsPanoramaDesign`, `  if (presentation.design === 'folio') {
    return (
      <AboutUsFolioDesign
        aboutUs={aboutUs}
        presentation={presentation}
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
      />
    );
  }

  if (presentation.design === 'panorama') {
    return (
      <AboutUsPanoramaDesign`);
});

edit('components/portfolio/portfolio-about-us-settings-panel.tsx', (rep) => {
  rep(`  const isPanorama = aboutUs.design === 'panorama';
  const hasCustomHeadline = isEditorial || isPanorama;`, `  const isPanorama = aboutUs.design === 'panorama';
  const isFolio = aboutUs.design === 'folio';
  // Panorama and Folio have no left / right side: the photo is full-width or a fixed portrait column.
  const hasFixedMediaSide = isPanorama || isFolio;
  const hasCustomHeadline = isEditorial || isPanorama || isFolio;`);
  rep(`!isSplitQuote && !isEditorial && !isPanorama ? null : (`, `!isSplitQuote && !isEditorial && !isPanorama && !isFolio ? null : (`);
  rep(`isSplitQuote || isEditorial || isPanorama ? (`, `isSplitQuote || isEditorial || isPanorama || isFolio ? (`);
  rep(`(isPanorama ? 56 : ABOUT_US_EDITORIAL_TITLE_AUTO_PX)`, `(isFolio ? 60 : isPanorama ? 56 : ABOUT_US_EDITORIAL_TITLE_AUTO_PX)`);
  rep(`            {isPanorama
              ? t('The section title is the small label on the left;`, `            {isFolio
              ? t('The section title is the label on the top rule; a custom subtitle sits opposite it. The portrait is the first photo (or the founder’s photo), with the founder under it; the list is plain unless you pick a bullet.')
              : isPanorama
              ? t('The section title is the small label on the left;`);
  rep(`          {isPanorama ? null : (
`, `          {hasFixedMediaSide ? null : (
`);
});
console.log('ok');
