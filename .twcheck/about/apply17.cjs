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
  rep(`  | 'panorama'
  | 'folio';`, `  | 'panorama'
  | 'folio'
  | 'centered';`);
  rep(`    value === 'panorama' ||
    value === 'folio'
  );`, `    value === 'panorama' ||
    value === 'folio' ||
    value === 'centered'
  );`);
  rep(`    design === 'panorama' ||
    design === 'folio'
  );`, `    design === 'panorama' ||
    design === 'folio' ||
    design === 'centered'
  );`);
  rep(`    description: msg('A ruled page: portrait with its caption, headline, plain list, the quote as a closing line.'),
  },
];`, `    description: msg('A ruled page: portrait with its caption, headline, plain list, the quote as a closing line.'),
  },
  {
    value: 'centered',
    label: msg('Centered'),
    description: msg('One centred column: round portrait, headline, large quote, the list as a single line.'),
  },
];`);
  rep(`    presentation.design === 'folio'
    ? 'link'`, `    presentation.design === 'folio' ||
    presentation.design === 'centered'
    ? 'link'`);
  rep(`  if (design === 'folio') {
    return {
      design,
      mediaSide: 'left',`, `  if (design === 'centered') {
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
  if (design === 'folio') {
    return {
      design,
      mediaSide: 'left',`);
});

edit('components/portfolio/EditorialAboutUsSection.tsx', (rep) => {
  rep(`function AboutUsMediaLeftSingleVisual(`, fs.readFileSync(path.join(__dirname, 'centered-design.txt'), 'utf8').replace(/\r\n/g, '\n') + `function AboutUsMediaLeftSingleVisual(`);
  rep(`  if (presentation.design === 'folio') {
    return (
      <AboutUsFolioDesign`, `  if (presentation.design === 'centered') {
    return (
      <AboutUsCenteredDesign aboutUs={aboutUs} presentation={presentation} sectionTitle={sectionTitle} />
    );
  }

  if (presentation.design === 'folio') {
    return (
      <AboutUsFolioDesign`);
});

edit('components/portfolio/portfolio-about-us-settings-panel.tsx', (rep) => {
  rep(`  const isFolio = aboutUs.design === 'folio';`, `  const isFolio = aboutUs.design === 'folio';
  const isCentered = aboutUs.design === 'centered';`);
  rep(`  const hasFixedMediaSide = isPanorama || isFolio;
  const hasCustomHeadline = isEditorial || isPanorama || isFolio;`, `  const hasFixedMediaSide = isPanorama || isFolio || isCentered;
  const hasCustomHeadline = isEditorial || isPanorama || isFolio || isCentered;`);
  rep(`!isSplitQuote && !isEditorial && !isPanorama && !isFolio ? null : (`, `!isSplitQuote && !isEditorial && !isPanorama && !isFolio && !isCentered ? null : (`);
  rep(`isSplitQuote || isEditorial || isPanorama || isFolio ? (`, `isSplitQuote || isEditorial || isPanorama || isFolio || isCentered ? (`);
  rep(`(isFolio ? 60 : isPanorama ? 56 : ABOUT_US_EDITORIAL_TITLE_AUTO_PX)`, `(isFolio ? 60 : isCentered ? 56 : isPanorama ? 56 : ABOUT_US_EDITORIAL_TITLE_AUTO_PX)`);
  rep(`            {isFolio
              ? t('The section title is the label on the top rule;`, `            {isCentered
              ? t('Everything sits on one centred axis. The round portrait is the first photo (or the founder’s photo); the list runs as one line of words, with a dot between them unless you pick a bullet.')
              : isFolio
              ? t('The section title is the label on the top rule;`);
});
console.log('ok');
