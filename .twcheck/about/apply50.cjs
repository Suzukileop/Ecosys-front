const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error(rel+' need one: '+a.slice(0,70));s=s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
const H='components/portfolio/';
edit(H+'portfolio-work-settings.ts',rep=>{
rep(`  consultStyle: 'link' | 'underline' | 'outline' | 'solid' | 'pill';
  /** Alternating row background tint, ledger-book style. */`,`  consultStyle: 'link' | 'underline' | 'outline' | 'solid' | 'pill';
  /** Colour of the role / category on each row: the muted text, or a palette token. */
  metaColor: PortfolioWorkSpecMetaColor;
  /** Alternating row background tint, ledger-book style. */`);
rep(`  consultStyle: 'link',
  stripedRows: false,
};`,`  consultStyle: 'link',
  metaColor: 'muted',
  stripedRows: false,
};`);
rep(`        : base.consultStyle ?? 'link',`,`        : base.consultStyle ?? 'link',
    metaColor: pickSpecOption(record.metaColor, SPEC_META_COLORS, base.metaColor ?? 'muted'),`);
});
edit(H+'portfolio-work-projects-ledger.tsx',rep=>{
rep(`  mergeProjectsLedgerSettings,
} from '@/components/portfolio/portfolio-work-settings';`,`  mergeProjectsLedgerSettings,
  workPaletteTokenColor,
} from '@/components/portfolio/portfolio-work-settings';`);
rep(`                className="pf-work-ledger-role-text text-[11px] font-medium uppercase tracking-[0.16em] sm:text-[12px]"
                style={{ opacity: 0.9 }}`,`                className="pf-work-ledger-role-text text-[11px] font-medium uppercase tracking-[0.16em] sm:text-[12px]"
                style={
                  metaInk
                    ? ({ opacity: 0.95, '--pf-ledger-muted': metaInk, '--pf-ledger-ink-active': metaInk } as CSSProperties)
                    : { opacity: 0.9 }
                }`);
rep(`  const consultStyle = settings.consultStyle ?? 'link';`,`  const consultStyle = settings.consultStyle ?? 'link';
  const metaInk = !settings.metaColor || settings.metaColor === 'muted' ? undefined : workPaletteTokenColor(settings.metaColor);`);
});
edit(H+'portfolio-work-ledger-controls.tsx',rep=>{
rep(`import { GridButtonChoicePreview } from './portfolio-work-grid-button';`,`import { GridButtonChoicePreview } from './portfolio-work-grid-button';
import { ColorSwatchRow } from './portfolio-color-swatch-row';
import { resolveHeroPaletteColor } from './portfolio-hero-palette-settings';
import { PORTFOLIO_WORK_SPEC_META_COLOR_OPTIONS } from './portfolio-work-settings';`);
rep(`  const consultLabel=settings.consultLabel?.trim()||t('Consult this project');`,`  const consultLabel=settings.consultLabel?.trim()||t('Consult this project');
  const metaSwatch={muted:theme.muted,principal:resolveHeroPaletteColor(theme.palette,'principal'),secondaire:resolveHeroPaletteColor(theme.palette,'secondaire')};
  const metaOptions=PORTFOLIO_WORK_SPEC_META_COLOR_OPTIONS.map(option=>({value:option.value,label:t(option.label),color:metaSwatch[option.value]}));`);
rep(`      <NpToggleRow title={t('Striped rows')}`,`      <ColorSwatchRow label={t('Category / role color')} value={settings.metaColor??'muted'} onChange={metaColor=>onChange({projectsLedger:{...settings,metaColor:metaColor as typeof settings.metaColor}})} options={metaOptions}/>
      <NpToggleRow title={t('Striped rows')}`);
});
console.log('ok');
