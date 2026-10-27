const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error(rel+' need one: '+a.slice(0,70));s=s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
const H='components/portfolio/';
edit(H+'portfolio-hero-banner-settings.ts',rep=>{
rep(`export type PortfolioHeroEditorialOverlapWidth =`,`/** Portrait identity: shape the portrait is presented in. */
export type PortfolioHeroPortraitShape = 'rectangle' | 'arch' | 'circle' | 'frame' | 'asymmetric';

export const PORTFOLIO_HERO_PORTRAIT_SHAPE_OPTIONS: {
  value: PortfolioHeroPortraitShape;
  label: string;
  description: string;
}[] = [
  { value: 'rectangle', label: msg('Rectangle'), description: msg('The straight-edged portrait (default).') },
  { value: 'arch', label: msg('Arch'), description: msg('Rounded top, straight bottom.') },
  { value: 'circle', label: msg('Circle'), description: msg('Round portrait with a fine accent ring.') },
  { value: 'frame', label: msg('Inner frame'), description: msg('Rectangle with a fine accent frame inside.') },
  { value: 'asymmetric', label: msg('Asymmetric'), description: msg('Two opposite corners rounded.') },
];

export type PortfolioHeroEditorialOverlapWidth =`);
});
edit(H+'portfolio-hero-settings.ts',rep=>{
rep(`type PortfolioHeroPortraitIdentityBottomGap, type PortfolioHeroSelectedWorksIdentityLayout`,`type PortfolioHeroPortraitIdentityBottomGap, type PortfolioHeroPortraitShape, type PortfolioHeroSelectedWorksIdentityLayout`);
rep(`  heroPortraitIdentityBottomGap: PortfolioHeroPortraitIdentityBottomGap;`,`  heroPortraitIdentityBottomGap: PortfolioHeroPortraitIdentityBottomGap;
  /** Portrait identity only: shape of the portrait (rectangle, arch, circle, inner frame, asymmetric). */
  heroPortraitShape: PortfolioHeroPortraitShape;`);
rep(`  heroPortraitIdentityBottomGap: 'medium',`,`  heroPortraitIdentityBottomGap: 'medium',
  heroPortraitShape: 'rectangle',`);
rep(`    heroPortraitIdentityBottomGap:
      record.heroPortraitIdentityBottomGap === 'tight' ||`,`    heroPortraitShape:
      record.heroPortraitShape === 'rectangle' ||
      record.heroPortraitShape === 'arch' ||
      record.heroPortraitShape === 'circle' ||
      record.heroPortraitShape === 'frame' ||
      record.heroPortraitShape === 'asymmetric'
        ? record.heroPortraitShape
        : base.heroPortraitShape ?? 'rectangle',
    heroPortraitIdentityBottomGap:
      record.heroPortraitIdentityBottomGap === 'tight' ||`);
});
edit(H+'portfolio-hero-settings-panel.tsx',rep=>{
rep(`} from '@/components/portfolio/portfolio-hero-banner-settings';`,`  PORTFOLIO_HERO_PORTRAIT_SHAPE_OPTIONS,
} from '@/components/portfolio/portfolio-hero-banner-settings';`);
rep(`          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'portrait-identity' ? (
            <div className="space-y-4">
              <HeroToggleRow`,`          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'portrait-identity' ? (
            <div className="space-y-4">
              <HeroOptionGrid
                label={t('Portrait shape')}
                options={PORTFOLIO_HERO_PORTRAIT_SHAPE_OPTIONS}
                value={hero.heroPortraitShape ?? 'rectangle'}
                onChange={(heroPortraitShape) => onChange({ heroPortraitShape })}
              />
              <HeroToggleRow`);
});
edit(H+'hero-variants/PortfolioHeroPortraitIdentity.tsx',rep=>{
rep(`  const showImageBorder = data.presentation.heroImageBorder !== false;`,`  const showImageBorder = data.presentation.heroImageBorder !== false;
  const portraitShape = data.presentation.heroPortraitShape ?? 'rectangle';
  const shapeRadius =
    portraitShape === 'arch'
      ? '9999px 9999px 0 0'
      : portraitShape === 'circle'
        ? '50%'
        : portraitShape === 'asymmetric'
          ? '4.5rem 0.4rem 4.5rem 0.4rem'
          : undefined;`);
rep(`              style={{
                backgroundColor: neutre,
                border: showImageBorder`,`              style={{
                backgroundColor: neutre,
                borderRadius: shapeRadius,
                aspectRatio: portraitShape === 'circle' ? '1 / 1' : undefined,
                border: showImageBorder`);
rep(`                showBorder={showImageBorder}
                bordure={bordure}`,`                showBorder={showImageBorder}
                shape={portraitShape}
                bordure={bordure}`);
rep(`            showBorder={showImageBorder}
            bordure={bordure}`,`            showBorder={showImageBorder}
            shape={portraitShape}
            bordure={bordure}`);
rep(`  showBorder,
  bordure,
  principal,
  className,
}: {`,`  showBorder,
  shape,
  bordure,
  principal,
  className,
}: {`);
rep(`  showBorder: boolean;
  bordure: string;`,`  showBorder: boolean;
  shape: PortfolioHeroPortraitShape;
  bordure: string;`);
rep(`        style={{
          boxShadow: showBorder ?`,`        style={{
          borderRadius: shape === 'rectangle' || shape === 'frame' ? undefined : 'inherit',
          // Accent decorations live inside the photo: the entry reveal clips everything outside the box.
          border:
            shape === 'frame'
              ? \`1.5px solid color-mix(in srgb, \${principal} 80%, transparent)\`
              : undefined,
          inset: shape === 'frame' ? '0.9rem' : undefined,
          boxShadow: shape === 'circle'
            ? \`inset 0 0 0 0.45rem color-mix(in srgb, \${fond} 92%, transparent), inset 0 0 0 calc(0.45rem + 1.5px) color-mix(in srgb, \${principal} 80%, transparent)\`
            : showBorder ?`);
});
console.log('ok');
