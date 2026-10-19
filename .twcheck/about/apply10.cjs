const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');
function edit(rel, fn) {
  const f = path.join(root, rel);
  let s = fs.readFileSync(f, 'utf8');
  const eol = s.includes('\r\n') ? '\r\n' : '\n';
  s = s.replace(/\r\n/g, '\n');
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error(rel + ' missing: ' + a.slice(0, 80));
    s = s.replace(a, b);
  };
  fn(rep);
  fs.writeFileSync(f, s.replace(/\n/g, eol));
}

edit('components/portfolio/portfolio-about-us-settings.ts', (rep) => {
  rep(`  | 'split-card'
  | 'split-quote';`, `  | 'split-card'
  | 'split-quote'
  | 'editorial';`);
  rep(`    value === 'split-card' ||
    value === 'split-quote'
  );
}`, `    value === 'split-card' ||
    value === 'split-quote' ||
    value === 'editorial'
  );
}`);
  rep(`    design === 'split-card' ||
    design === 'split-quote'
  );
}`, `    design === 'split-card' ||
    design === 'split-quote' ||
    design === 'editorial'
  );
}`);
  rep(`  {
    value: 'split-quote',
    label: msg('Split quote'),
    description: msg('Texte et carte citation d’un côté, quatre illustrations SVG de l’autre.'),
  },
];`, `  {
    value: 'split-quote',
    label: msg('Split quote'),
    description: msg('Texte et carte citation d’un côté, quatre illustrations SVG de l’autre.'),
  },
  {
    value: 'editorial',
    label: msg('Editorial'),
    description: msg('Huge headline, a wide photo with the quote, a numbered list set between hairlines.'),
  },
];`);
  rep(`  return presentation.design === 'split-overlap' ? 'link' : 'solid';`, `  return presentation.design === 'split-overlap' || presentation.design === 'editorial' ? 'link' : 'solid';`);
  rep(`  if (design === 'split-quote') {
    return {
      design,`, `  if (design === 'editorial') {
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
  if (design === 'split-quote') {
    return {
      design,`);
});

edit('components/portfolio/EditorialAboutUsSection.tsx', (rep) => {
  rep(`function AboutUsMediaLeftSingleVisual(`, fs.readFileSync(path.join(__dirname, 'editorial-design.txt'), 'utf8').replace(/\r\n/g, '\n') + `function AboutUsMediaLeftSingleVisual(`);
  rep(`  if (presentation.design === 'split-quote') {
    return (
      <AboutUsSplitQuoteDesign`, `  if (presentation.design === 'editorial') {
    return (
      <AboutUsEditorialDesign
        aboutUs={aboutUs}
        presentation={presentation}
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
      />
    );
  }

  if (presentation.design === 'split-quote') {
    return (
      <AboutUsSplitQuoteDesign`);
});

edit('components/portfolio/portfolio-about-us-settings-panel.tsx', (rep) => {
  rep(`  const isSplitQuote = aboutUs.design === 'split-quote';`, `  const isSplitQuote = aboutUs.design === 'split-quote';
  const isEditorial = aboutUs.design === 'editorial';`);
  rep(`{usesSplitChrome && !isSplitQuote ? null : (`, `{usesSplitChrome && !isSplitQuote && !isEditorial ? null : (`);
  rep(`{isSplitOverlap || isSplitMediaLeft || isSplitCard || isSplitQuote ? (`, `{isSplitOverlap || isSplitMediaLeft || isSplitCard || isSplitQuote || isEditorial ? (`);
  rep(`            {isSplitQuote
              ? t('Pick Photo or SVG on the right (or left). The photo comes from Information → About us.')`, `            {isEditorial
              ? t('The section title is the small label above the headline; a custom subtitle sits opposite it. The first photo, quote, list and founder come from Information → About us. Flip the photo left or right.')
              : isSplitQuote
              ? t('Pick Photo or SVG on the right (or left). The photo comes from Information → About us.')`);
});
console.log('ok');
