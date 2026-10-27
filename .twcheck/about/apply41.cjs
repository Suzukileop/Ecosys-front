const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error(rel+' need one: '+a.slice(0,70));s=s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
const H='components/portfolio/';
edit(H+'portfolio-hero-banner-settings.ts',rep=>{
rep(`export type PortfolioHeroPortraitShape = 'rectangle'`,`export type PortfolioHeroPortraitShape = 'auto' | 'rectangle'`);
rep(`}[] = [
  { value: 'rectangle', label: msg('Rectangle')`,`}[] = [
  { value: 'auto', label: msg('Design default'), description: msg('Keep the shape this design was built with.') },
  { value: 'rectangle', label: msg('Rectangle')`);
rep(`msg('The straight-edged portrait (default).')`,`msg('The straight-edged portrait.')`);
});
edit(H+'portfolio-hero-settings.ts',rep=>{
rep(`  heroPortraitShape: 'rectangle',`,`  heroPortraitShape: 'auto',`);
rep(`      record.heroPortraitShape === 'rectangle' ||`,`      record.heroPortraitShape === 'auto' ||
      record.heroPortraitShape === 'rectangle' ||`);
rep(`        : base.heroPortraitShape ?? 'rectangle',`,`        : base.heroPortraitShape ?? 'auto',`);
});
edit(H+'hero-variants/PortfolioHeroPortraitIdentity.tsx',rep=>{
rep(`  const portraitShape = data.presentation.heroPortraitShape ?? 'rectangle';`,`  // Portrait identity's own shape is the rectangle: "design default" means the same.
  const portraitShape =
    data.presentation.heroPortraitShape && data.presentation.heroPortraitShape !== 'auto'
      ? data.presentation.heroPortraitShape
      : 'rectangle';`);
});
edit(H+'portfolio-hero-settings-panel.tsx',rep=>{
// remove the identity-only grid, add one shared grid for all portrait designs
rep(`              <HeroOptionGrid
                label={t('Portrait shape')}
                options={PORTFOLIO_HERO_PORTRAIT_SHAPE_OPTIONS}
                value={hero.heroPortraitShape ?? 'rectangle'}
                onChange={(heroPortraitShape) => onChange({ heroPortraitShape })}
              />
`,``);
rep(`              <NpCollapsibleSection title={t('Layout options')}>
`,`              <NpCollapsibleSection title={t('Layout options')}>
              {HERO_PORTRAIT_SHAPE_DESIGNS.has(selectedBannerDesign) ? (
                <HeroOptionGrid
                  label={t('Portrait shape')}
                  options={
                    selectedBannerDesign === 'portrait-identity'
                      ? PORTFOLIO_HERO_PORTRAIT_SHAPE_OPTIONS.filter((option) => option.value !== 'auto')
                      : PORTFOLIO_HERO_PORTRAIT_SHAPE_OPTIONS
                  }
                  value={
                    selectedBannerDesign === 'portrait-identity' && (hero.heroPortraitShape ?? 'auto') === 'auto'
                      ? 'rectangle'
                      : hero.heroPortraitShape ?? 'auto'
                  }
                  onChange={(heroPortraitShape) => onChange({ heroPortraitShape })}
                />
              ) : null}
`);
rep(`function HeroOptionGrid<T extends string>({`,`/** Banner designs that show a portrait and honor the "Portrait shape" option. */
const HERO_PORTRAIT_SHAPE_DESIGNS: ReadonlySet<string> = new Set([
  'portrait-identity',
  'editorial-rail',
  'circle-portrait',
  'editorial-overlap',
  'bowl-intro',
]);

function HeroOptionGrid<T extends string>({`);
});
console.log('ok');
