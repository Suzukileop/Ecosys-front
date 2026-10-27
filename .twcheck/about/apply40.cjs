const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error(rel+' need one: '+a.slice(0,70));s=s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
const H='components/portfolio/';
edit(H+'portfolio-hero-banner-settings.ts',rep=>{
rep(`export type PortfolioHeroPortraitShape = 'rectangle' | 'arch' | 'circle' | 'frame' | 'asymmetric';`,`export type PortfolioHeroPortraitShape = 'rectangle' | 'arch' | 'circle' | 'frame' | 'offset' | 'asymmetric';`);
rep(`  { value: 'asymmetric', label: msg('Asymmetric'), description: msg('Two opposite corners rounded.') },
];`,`  { value: 'offset', label: msg('Offset frame'), description: msg('A fine accent outline set back behind the portrait.') },
  { value: 'asymmetric', label: msg('Asymmetric'), description: msg('Two opposite corners rounded.') },
];`);
});
edit(H+'portfolio-hero-settings.ts',rep=>{
rep(`      record.heroPortraitShape === 'frame' ||`,`      record.heroPortraitShape === 'frame' ||
      record.heroPortraitShape === 'offset' ||`);
});
edit(H+'hero-variants/PortfolioHeroPortraitIdentity.tsx',rep=>{
rep(`            <div
              className="pf-identity-photo-mask relative aspect-[4/5] w-[min(100%,30rem)] max-h-[min(62vh,36rem)] shrink-0 justify-self-start overflow-hidden"`,`            <OffsetOutline enabled={portraitShape === 'offset'} principal={principal}>
            <div
              className="pf-identity-photo-mask relative aspect-[4/5] w-[min(100%,30rem)] max-h-[min(62vh,36rem)] shrink-0 justify-self-start overflow-hidden"`);
rep(`                className="pf-identity-photo-inner absolute inset-0 h-full w-full"
              />
            </div>

            <div aria-hidden />`,`                className="pf-identity-photo-inner absolute inset-0 h-full w-full"
              />
            </div>
            </OffsetOutline>

            <div aria-hidden />`);
rep(`function IdentityPortrait({`,`/**
 * "Offset frame" portrait: a fine accent outline set back behind the photo. It sits outside the photo box
 * because the entry reveal clips everything that overflows it.
 */
function OffsetOutline({
  enabled,
  principal,
  children,
}: {
  enabled: boolean;
  principal: string;
  children: ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <div className="relative w-[min(100%,30rem)] justify-self-start">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          transform: 'translate(0.9rem, 0.9rem)',
          border: \`1.5px solid color-mix(in srgb, \${principal} 85%, transparent)\`,
        }}
      />
      {children}
    </div>
  );
}

function IdentityPortrait({`);
rep(`import { useLayoutEffect, useMemo, useRef, type MouseEvent } from 'react';`,`import { useLayoutEffect, useMemo, useRef, type MouseEvent, type ReactNode } from 'react';`);
// circle fix: the overlay must follow the circular / arched / asymmetric radius, and the accent bar is square
rep(`  return (
    <div className={\`relative \${className}\`.trim()}>
      {avatarUrl ? (`,`  return (
    <div
      className={\`relative \${className}\`.trim()}
      style={{ borderRadius: shape === 'circle' ? '50%' : undefined, overflow: shape === 'circle' ? 'hidden' : undefined }}
    >
      {avatarUrl ? (`);
rep(`          borderRadius: shape === 'rectangle' || shape === 'frame' ? undefined : 'inherit',`,`          borderRadius: shape === 'circle' ? '50%' : undefined,`);
});
console.log('ok');
