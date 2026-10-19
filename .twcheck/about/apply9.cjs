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
  rep(`export function aboutUsDesignUsesSplitChrome(`, `/**
 * The three "Split" layouts share one structure (copy on one side, visuals on the other) and differ
 * by how the visuals are treated. The panel presents them as ONE design with a style switch; the
 * saved \`design\` value stays the variant's own id, so existing portfolios render unchanged.
 */
export type PortfolioAboutUsSplitVariant = 'split-overlap' | 'split-founder' | 'split-media-left';

export const PORTFOLIO_ABOUT_US_SPLIT_VARIANT_OPTIONS: {
  value: PortfolioAboutUsSplitVariant;
  label: string;
  description: string;
}[] = [
  { value: 'split-overlap', label: msg('Offset'), description: msg('One large photo, or two set offset.') },
  { value: 'split-founder', label: msg('Frames'), description: msg('Several framed images, founder under the button.') },
  { value: 'split-media-left', label: msg('Large photo'), description: msg('One big rounded photo, text and list beside it.') },
];

export function isAboutUsSplitVariant(
  design: PortfolioAboutUsDesign | undefined
): design is PortfolioAboutUsSplitVariant {
  return design === 'split-overlap' || design === 'split-founder' || design === 'split-media-left';
}

/** What the design picker lists: the three split variants collapse into a single "Split" entry. */
export const PORTFOLIO_ABOUT_US_DESIGN_CATALOG: {
  value: PortfolioAboutUsDesign;
  label: string;
  description: string;
}[] = (() => {
  const out: { value: PortfolioAboutUsDesign; label: string; description: string }[] = [];
  let splitAdded = false;
  for (const option of PORTFOLIO_ABOUT_US_DESIGN_OPTIONS) {
    if (!isAboutUsSplitVariant(option.value)) {
      out.push(option);
    } else if (!splitAdded) {
      splitAdded = true;
      out.push({
        value: 'split-overlap',
        label: msg('Split'),
        description: msg('Text on one side, photos on the other. Switch between offset, framed and large-photo styles.'),
      });
    }
  }
  return out;
})();

export function aboutUsDesignUsesSplitChrome(`);
});

edit('components/portfolio/portfolio-about-us-settings-panel.tsx', (rep) => {
  rep(`  PORTFOLIO_ABOUT_US_CTA_STYLE_OPTIONS,
  PORTFOLIO_ABOUT_US_DESIGN_OPTIONS,`, `  PORTFOLIO_ABOUT_US_CTA_STYLE_OPTIONS,
  PORTFOLIO_ABOUT_US_DESIGN_CATALOG,
  PORTFOLIO_ABOUT_US_DESIGN_OPTIONS,
  PORTFOLIO_ABOUT_US_SPLIT_VARIANT_OPTIONS,`);
  rep(`  defaultsForAboutUsDesign,
  DEFAULT_ABOUT_US_PRESENTATION,`, `  defaultsForAboutUsDesign,
  DEFAULT_ABOUT_US_PRESENTATION,
  isAboutUsSplitVariant,`);
  // selected design label
  rep(`  const selectedDesign = PORTFOLIO_ABOUT_US_DESIGN_OPTIONS.find((option) => option.value === aboutUs.design) ?? PORTFOLIO_ABOUT_US_DESIGN_OPTIONS[0];`,
    `  const isSplitFamily = isAboutUsSplitVariant(aboutUs.design);
  const selectedVariant = PORTFOLIO_ABOUT_US_SPLIT_VARIANT_OPTIONS.find((option) => option.value === aboutUs.design);
  const selectedDesign = isSplitFamily
    ? PORTFOLIO_ABOUT_US_DESIGN_CATALOG.find((option) => isAboutUsSplitVariant(option.value)) ?? PORTFOLIO_ABOUT_US_DESIGN_CATALOG[0]
    : PORTFOLIO_ABOUT_US_DESIGN_OPTIONS.find((option) => option.value === aboutUs.design) ?? PORTFOLIO_ABOUT_US_DESIGN_OPTIONS[0];`);
  // catalog
  rep(`{PORTFOLIO_ABOUT_US_DESIGN_OPTIONS.map((option) => (
                  <NpOptionCard key={option.value} selected={option.value === aboutUs.design}`, `{PORTFOLIO_ABOUT_US_DESIGN_CATALOG.map((option) => (
                  <NpOptionCard key={option.value} selected={isAboutUsSplitVariant(option.value) ? isSplitFamily : option.value === aboutUs.design}`);
  rep(`onClick={() => { onChange(defaultsForAboutUsDesign(option.value as PortfolioAboutUsDesign)); setDesignCatalogOpen(false); }} />`,
    `onClick={() => {
                    // Picking "Split" while already on one of its variants keeps that variant and every setting.
                    if (!(isAboutUsSplitVariant(option.value) && isSplitFamily)) {
                      onChange(defaultsForAboutUsDesign(option.value as PortfolioAboutUsDesign));
                    }
                    setDesignCatalogOpen(false);
                  }} />`);
  // picker row shows the variant
  rep(`<NpPickerRow label={t('Design')} value={t(selectedDesign.label)}`, `<NpPickerRow label={t('Design')} value={selectedVariant ? \`\${t(selectedDesign.label)} · \${t(selectedVariant.label)}\` : t(selectedDesign.label)}`);
  // variant switch, right at the top of Layout for the split family
  rep(`          <NpCollapsibleSection title={t('Layout')}>
      {usesSplitChrome ? (`, `          <NpCollapsibleSection title={t('Layout')}>
      {isSplitFamily ? (
        <NpOptionCardGroup label={t('Split style')} columns={3}>
          {PORTFOLIO_ABOUT_US_SPLIT_VARIANT_OPTIONS.map((option) => (
            <NpOptionCard
              key={option.value}
              compact
              selected={option.value === aboutUs.design}
              title={t(option.label)}
              illustration={<AboutUsSplitVariantIllustration variant={option.value} />}
              // Only the layout changes: toggles, colours, image side and the rest stay as they are.
              onClick={() => onChange({ design: option.value, mediaSide: resolveAboutUsMediaSide(aboutUs.design, aboutUs.mediaSide) })}
            />
          ))}
        </NpOptionCardGroup>
      ) : null}
      {usesSplitChrome ? (`);
  rep(`export type AboutUsSubSection =`, `/** Tiny schematic of each split style: copy lines on the left, the visual treatment on the right. */
function AboutUsSplitVariantIllustration({ variant }: { variant: 'split-overlap' | 'split-founder' | 'split-media-left' }) {
  return (
    <svg viewBox="0 0 64 36" className="h-9 w-16" aria-hidden>
      <rect x="4" y="9" width="18" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
      <rect x="4" y="15" width="24" height="2" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="4" y="20" width="20" height="2" rx="1" fill="currentColor" opacity="0.3" />
      {variant === 'split-overlap' ? (
        <>
          <rect x="38" y="5" width="20" height="14" rx="3" fill="currentColor" opacity="0.35" />
          <rect x="32" y="15" width="22" height="16" rx="3" fill="currentColor" opacity="0.7" />
        </>
      ) : null}
      {variant === 'split-founder' ? (
        <>
          <rect x="36" y="6" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <rect x="40" y="10" width="20" height="22" rx="3" fill="currentColor" opacity="0.6" />
          <circle cx="8" cy="29" r="3" fill="currentColor" opacity="0.6" />
        </>
      ) : null}
      {variant === 'split-media-left' ? <rect x="34" y="4" width="26" height="28" rx="6" fill="currentColor" opacity="0.65" /> : null}
    </svg>
  );
}

export type AboutUsSubSection =`);
});
console.log('ok');
