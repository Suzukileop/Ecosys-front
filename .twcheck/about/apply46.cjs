const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error(rel+' need one: '+a.slice(0,70));s=s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
const H='components/portfolio/';
edit(H+'portfolio-work-settings.ts',rep=>{
rep(`  /** Manual title size in px (max, fluid on small screens); null = automatic responsive size. */
  titleSize: number | null;
};

export const DEFAULT_PROJECTS_CASCADE_SETTINGS`,`  /** Manual title size in px (max, fluid on small screens); null = automatic responsive size. */
  titleSize: number | null;
  /** Colour of the category: the muted text, or a palette token. */
  categoryColor: PortfolioWorkSpecMetaColor;
  /** Colour of the role: the muted text, or a palette token. */
  roleColor: PortfolioWorkSpecMetaColor;
};

export const DEFAULT_PROJECTS_CASCADE_SETTINGS`);
rep(`  linkStyle: 'text',
  titleSize: null,
};`,`  linkStyle: 'text',
  titleSize: null,
  categoryColor: 'muted',
  roleColor: 'muted',
};`);
rep(`    showCategory: typeof record.showCategory === 'boolean' ? record.showCategory : base.showCategory,
    showRole: typeof record.showRole === 'boolean' ? record.showRole : base.showRole,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    showTags: typeof record.showTags === 'boolean' ? record.showTags : base.showTags,`,`    showCategory: typeof record.showCategory === 'boolean' ? record.showCategory : base.showCategory,
    showRole: typeof record.showRole === 'boolean' ? record.showRole : base.showRole,
    categoryColor: pickSpecOption(record.categoryColor, SPEC_META_COLORS, base.categoryColor ?? 'muted'),
    roleColor: pickSpecOption(record.roleColor, SPEC_META_COLORS, base.roleColor ?? 'muted'),
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    showTags: typeof record.showTags === 'boolean' ? record.showTags : base.showTags,`);
});
edit(H+'portfolio-work-projects-cascade.tsx',rep=>{
rep(`  mergeProjectsCascadeSettings,
} from '@/components/portfolio/portfolio-work-settings';`,`  mergeProjectsCascadeSettings,
  workPaletteTokenColor,
} from '@/components/portfolio/portfolio-work-settings';`);
rep(`  const labelParts: string[] = [category, role].filter(Boolean) as string[];`,`  const labelParts: { text: string; color?: string }[] = [
    category
      ? {
          text: category,
          color:
            !settings.categoryColor || settings.categoryColor === 'muted'
              ? undefined
              : workPaletteTokenColor(settings.categoryColor),
        }
      : null,
    role
      ? {
          text: role,
          color: !settings.roleColor || settings.roleColor === 'muted' ? undefined : workPaletteTokenColor(settings.roleColor),
        }
      : null,
  ].filter((part): part is { text: string; color?: string } => part !== null);`);
rep(`              style={{ letterSpacing: '0.14em', opacity: 0.85, color: mutedColor }}
            >
              {labelParts.map((part, index) => (
                <span key={\`\${part}-\${index}\`} className="flex items-center gap-x-2.5">
                  {index > 0 ? (
                    <span aria-hidden style={{ opacity: 0.45 }}>
                      &middot;
                    </span>
                  ) : null}
                  <span>{part}</span>
                </span>
              ))}`,`              style={{ letterSpacing: '0.14em', color: mutedColor }}
            >
              {labelParts.map((part, index) => (
                <span key={\`\${part.text}-\${index}\`} className="flex items-center gap-x-2.5">
                  {index > 0 ? (
                    <span aria-hidden style={{ opacity: 0.4 }}>
                      &middot;
                    </span>
                  ) : null}
                  <span style={part.color ? { color: part.color } : { opacity: 0.85 }}>{part.text}</span>
                </span>
              ))}`);
});
edit(H+'portfolio-work-cascade-controls.tsx',rep=>{
rep(`import { Choices } from './portfolio-stack-progress-controls';`,`import { Choices } from './portfolio-stack-progress-controls';
import { ColorSwatchRow } from './portfolio-color-swatch-row';
import { resolveHeroPaletteColor } from './portfolio-hero-palette-settings';
import { PORTFOLIO_WORK_SPEC_META_COLOR_OPTIONS } from './portfolio-work-settings';`);
rep(`  const size=PORTFOLIO_WORK_CASCADE_CARD_HEIGHT_OPTIONS.find(option=>option.value===settings.cardHeight)!;`,`  const size=PORTFOLIO_WORK_CASCADE_CARD_HEIGHT_OPTIONS.find(option=>option.value===settings.cardHeight)!;
  const metaSwatch={muted:theme.muted,principal:resolveHeroPaletteColor(theme.palette,'principal'),secondaire:resolveHeroPaletteColor(theme.palette,'secondaire')};
  const metaOptions=PORTFOLIO_WORK_SPEC_META_COLOR_OPTIONS.map(option=>({value:option.value,label:t(option.label),color:metaSwatch[option.value]}));`);
rep(`    {settings.showLink?<section className={styles.settingsGroup} aria-label={t('Consult link')}>`,`    <section className={styles.settingsGroup} aria-label={t('Category and role')}>
      <h4 className={styles.groupHeading}>{t('Category and role')}</h4>
      <ColorSwatchRow label={t('Category color')} value={settings.categoryColor} onChange={categoryColor=>onChange({projectsCascade:{...settings,categoryColor:categoryColor as typeof settings.categoryColor}})} options={metaOptions}/>
      <ColorSwatchRow label={t('Role color')} value={settings.roleColor} onChange={roleColor=>onChange({projectsCascade:{...settings,roleColor:roleColor as typeof settings.roleColor}})} options={metaOptions}/>
    </section>
    {settings.showLink?<section className={styles.settingsGroup} aria-label={t('Consult link')}>`);
});
// more robust ink detection for the button previews
edit(H+'portfolio-work-grid-button.tsx',rep=>{
rep(`function inkLuminance(ink:string):number|null {
  const hex=ink.trim().replace('#','');
  if(!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null;
  const full=hex.length===3?hex.split('').map(c=>c+c).join(''):hex;
  const [r,g,b]=[0,2,4].map(i=>parseInt(full.slice(i,i+2),16)/255).map(v=>v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4);
  return 0.2126*r+0.7152*g+0.0722*b;
}`,`function inkLuminance(ink:string):number|null {
  const value=ink.trim();
  if(!value||value.startsWith('var(')||typeof document==='undefined') return null;
  // The canvas resolves any CSS colour (hex, rgb, hsl, color-mix, named); an unparsable one keeps the previous fill.
  const ctx=document.createElement('canvas').getContext('2d');
  if(!ctx) return null;
  ctx.fillStyle='#010203';
  ctx.fillStyle=value;
  ctx.fillRect(0,0,1,1);
  const [r8,g8,b8,a8]=ctx.getImageData(0,0,1,1).data;
  if(r8===1&&g8===2&&b8===3&&a8===255) return null;
  const [r,g,b]=[r8,g8,b8].map(v=>v/255).map(v=>v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4);
  return 0.2126*r+0.7152*g+0.0722*b;
}`);
});
console.log('ok');
