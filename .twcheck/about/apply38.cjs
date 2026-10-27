const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b,all)=>{const c=s.split(a).length-1;if(all?c<1:c!==1)throw new Error(rel+' count '+c+': '+a.slice(0,70));s=all?s.split(a).join(b):s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
const H='components/portfolio/';
edit(H+'portfolio-hero-settings.ts',rep=>{
rep(`  heroImageGrayscale: boolean;
  heroLayoutFlipped: boolean;`,`  heroImageGrayscale: boolean;
  /** Thin line drawn around the portrait / hero image in the banner designs that have one (default on). */
  heroImageBorder: boolean;
  heroLayoutFlipped: boolean;`);
rep(`  heroImageGrayscale: false,`,`  heroImageGrayscale: false,
  heroImageBorder: true,`);
rep(`    heroImageGrayscale:
      typeof record.heroImageGrayscale === 'boolean'
        ? record.heroImageGrayscale
        : base.heroImageGrayscale ?? false,`,`    heroImageGrayscale:
      typeof record.heroImageGrayscale === 'boolean'
        ? record.heroImageGrayscale
        : base.heroImageGrayscale ?? false,
    heroImageBorder:
      typeof record.heroImageBorder === 'boolean' ? record.heroImageBorder : base.heroImageBorder ?? true,`);
});
edit(H+'portfolio-hero-settings-panel.tsx',rep=>{
rep(`                onChange={(heroImageGrayscale) => onChange({ heroImageGrayscale })}
              />`,`                onChange={(heroImageGrayscale) => onChange({ heroImageGrayscale })}
              />
              <NpToggleRow
                title={t('Image border')}
                checked={hero.heroImageBorder !== false}
                onChange={(heroImageBorder) => onChange({ heroImageBorder })}
              />`);
});
edit(H+'hero-variants/PortfolioHeroPortraitIdentity.tsx',rep=>{
rep(`  const imageBw = data.presentation.heroImageGrayscale === true;`,`  const imageBw = data.presentation.heroImageGrayscale === true;
  const showImageBorder = data.presentation.heroImageBorder !== false;`);
rep(`                border: \`1px solid color-mix(in srgb, \${bordure} 86%, transparent)\`,
                boxShadow:`,`                border: showImageBorder ? \`1px solid color-mix(in srgb, \${bordure} 86%, transparent)\` : undefined,
                boxShadow:`);
rep(`            imageBw={imageBw}
            bordure={bordure}`,`            imageBw={imageBw}
            showBorder={showImageBorder}
            bordure={bordure}`);
rep(`                imageBw={imageBw}
                bordure={bordure}`,`                imageBw={imageBw}
                showBorder={showImageBorder}
                bordure={bordure}`);
rep(`  imageBw,
  bordure,
  principal,
  className,
}: {`,`  imageBw,
  showBorder,
  bordure,
  principal,
  className,
}: {`);
rep(`  imageBw: boolean;
  bordure: string;
  principal: string;
  className: string;
}) {`,`  imageBw: boolean;
  showBorder: boolean;
  bordure: string;
  principal: string;
  className: string;
}) {`);
rep("          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${bordure} 58%, transparent)`,","          boxShadow: showBorder ? `inset 0 0 0 1px color-mix(in srgb, ${bordure} 58%, transparent)` : undefined,");
});
edit(H+'hero-variants/PortfolioHeroLeftPortrait.tsx',rep=>{
rep(`        border: \`1px solid \${borderSoft}\`,
        clipPath:`,`        border: data.presentation.heroImageBorder === false ? undefined : \`1px solid \${borderSoft}\`,
        clipPath:`);
});
edit(H+'hero-variants/PortfolioHeroEditorialRail.tsx',rep=>{
rep(`      imageBw={imageBw}
      neutre={neutre}
      borderSoft={borderSoft}
      principal={principal}
    />
  );`,`      imageBw={imageBw}
      neutre={neutre}
      borderSoft={borderSoft}
      principal={principal}
      showBorder={data.presentation.heroImageBorder !== false}
    />
  );`);
rep(`  neutre,
  borderSoft,
  principal,
}: {
  className: string;`,`  neutre,
  borderSoft,
  principal,
  showBorder,
}: {
  className: string;`);
rep(`  neutre: string;
  borderSoft: string;
  principal: string;
}) {
  return (
    <div
      className={\`pf-editorial-rail-photo`,`  neutre: string;
  borderSoft: string;
  principal: string;
  showBorder: boolean;
}) {
  return (
    <div
      className={\`pf-editorial-rail-photo`);
rep(`        backgroundColor: neutre,
        border: \`1px solid \${borderSoft}\`,
      }}
    >
      <div className="pf-editorial-rail-photo-shift`,`        backgroundColor: neutre,
        border: showBorder ? \`1px solid \${borderSoft}\` : undefined,
      }}
    >
      <div className="pf-editorial-rail-photo-shift`);
rep("        style={{ boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${borderSoft} 70%, transparent)` }}","        style={{ boxShadow: showBorder ? `inset 0 0 0 1px color-mix(in srgb, ${borderSoft} 70%, transparent)` : undefined }}");
});
edit(H+'hero-variants/PortfolioHeroSwissEditorial.tsx',rep=>{
rep(`    neutre,
    imageBw,
  };`,`    neutre,
    imageBw,
    showBorder: data.presentation.heroImageBorder !== false,
  };`);
rep(`  neutre,
  imageBw,
  className,
  radius,
}: {`,`  neutre,
  imageBw,
  showBorder,
  className,
  radius,
}: {`);
rep(`  imageBw: boolean;
  className: string;
  radius: string;
}) {`,`  imageBw: boolean;
  showBorder: boolean;
  className: string;
  radius: string;
}) {`);
rep("          boxShadow: `inset 0 0 0 1px ${SWISS_EDGE}`,","          boxShadow: showBorder ? `inset 0 0 0 1px ${SWISS_EDGE}` : undefined,");
});
console.log('ok');
