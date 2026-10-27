const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','..','components/portfolio/portfolio-work-spec-controls.tsx');
let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error('need one: '+a.slice(0,70));s=s.replace(a,b);};
rep(`import { Choices } from './portfolio-stack-progress-controls';
import { DEFAULT_PROJECTS_SPEC_SETTINGS, PORTFOLIO_WORK_SPEC_COLUMNS_OPTIONS,`,`import type { CSSProperties } from 'react';
import { Choices } from './portfolio-stack-progress-controls';
import { ColorSwatchRow } from './portfolio-color-swatch-row';
import { resolveHeroPaletteColor } from './portfolio-hero-palette-settings';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';
import { PORTFOLIO_WORK_SPEC_COLOR_OPTIONS, PORTFOLIO_WORK_SPEC_META_COLOR_OPTIONS, PORTFOLIO_WORK_SPEC_META_DIVIDER_OPTIONS, PORTFOLIO_WORK_SPEC_META_DIVIDER_SIZE_OPTIONS } from './portfolio-work-settings';
import { DEFAULT_PROJECTS_SPEC_SETTINGS, PORTFOLIO_WORK_SPEC_COLUMNS_OPTIONS,`);
rep(`  const settings={...DEFAULT_PROJECTS_SPEC_SETTINGS,...work.projectsSpec};
  return <div className={styles.controls}>`,`  const settings={...DEFAULT_PROJECTS_SPEC_SETTINGS,...work.projectsSpec};
  const theme=useThumbnailTheme('work');
  const patch=(next:Partial<typeof settings>)=>onChange({projectsSpec:{...settings,...next}});
  const swatch={principal:resolveHeroPaletteColor(theme.palette,'principal'),secondaire:resolveHeroPaletteColor(theme.palette,'secondaire'),texteFort:resolveHeroPaletteColor(theme.palette,'texteFort'),muted:theme.muted};
  const colorOptions=PORTFOLIO_WORK_SPEC_COLOR_OPTIONS.map(option=>({value:option.value,label:t(option.label),color:swatch[option.value]}));
  const metaOptions=PORTFOLIO_WORK_SPEC_META_COLOR_OPTIONS.map(option=>({value:option.value,label:t(option.label),color:swatch[option.value]}));
  const percentSlider=(id:string,label:string,value:number,min:number,onValue:(next:number)=>void)=><div className="np-field np-text-size-slider block">
    <div className="flex items-center justify-between gap-3"><label htmlFor={id} className="np-field-label">{label}</label><span className="text-xs text-neutral-400">{value}%</span></div>
    <input id={id} type="range" min={min} max={100} step={5} value={value} className="pf-exp-centered-slider pf-exp-centered-slider--thick" style={{'--pf-exp-slider-fill':\`\${(value-min)/(100-min)*100}%\`} as CSSProperties} onChange={event=>onValue(Number(event.target.value))}/>
  </div>;
  return <div className={styles.controls}>`);
rep(`    <section className={styles.settingsGroup} aria-label={t('Appearance')}>
      <h4 className={styles.groupHeading}>{t('Appearance')}</h4>`,`    <section className={styles.settingsGroup} aria-label={t('Category and role')}>
      <h4 className={styles.groupHeading}>{t('Category and role')}</h4>
      <ColorSwatchRow label={t('Category color')} value={settings.categoryColor} onChange={categoryColor=>patch({categoryColor:categoryColor as typeof settings.categoryColor})} options={metaOptions}/>
      <ColorSwatchRow label={t('Role color')} value={settings.roleColor} onChange={roleColor=>patch({roleColor:roleColor as typeof settings.roleColor})} options={metaOptions}/>
      <Choices label={t('Separator')} options={PORTFOLIO_WORK_SPEC_META_DIVIDER_OPTIONS} columns={3} value={settings.metaDivider} onChange={metaDivider=>patch({metaDivider})}
        glyph={value=><svg width="64" height="40" viewBox="0 0 64 40" fill="currentColor" aria-hidden><rect x="14" y="8" width="36" height="3" rx="1" opacity=".5"/><rect x="14" y="29" width="36" height="3" rx="1" opacity=".5"/>{value==='short'?<rect x="26" y="19" width="12" height="2"/>:value==='long'?<rect x="14" y="19" width="36" height="2"/>:null}</svg>}/>
      {settings.metaDivider!=='none'?<>
        <ColorSwatchRow label={t('Separator color')} value={settings.metaDividerColor} onChange={metaDividerColor=>patch({metaDividerColor:metaDividerColor as typeof settings.metaDividerColor})} options={colorOptions}/>
        <Choices label={t('Separator size')} options={PORTFOLIO_WORK_SPEC_META_DIVIDER_SIZE_OPTIONS} columns={3} value={settings.metaDividerSize} onChange={metaDividerSize=>patch({metaDividerSize})}
          glyph={(_,index)=><svg width="64" height="40" viewBox="0 0 64 40" fill="currentColor" aria-hidden><rect x={32-[8,12,18][index]/2*1.5} y={20-[1,1.5,2][index]/2} width={[12,18,27][index]} height={[1,2,3][index]}/></svg>}/>
      </>:null}
    </section>
    <section className={styles.settingsGroup} aria-label={t('Appearance')}>
      <h4 className={styles.groupHeading}>{t('Appearance')}</h4>`);
rep(`    </section>
  </div>;
}`,`      {settings.sheetFrame!=='none'?<>
        <ColorSwatchRow label={t('Border color')} value={settings.frameColor} onChange={frameColor=>patch({frameColor:frameColor as typeof settings.frameColor})} options={[{value:'auto',label:t('Auto'),color:swatch.muted,auto:true},...colorOptions]}/>
        {percentSlider('spec-frame-opacity',t('Border opacity'),settings.frameOpacity,10,frameOpacity=>patch({frameOpacity}))}
      </>:null}
      <ColorSwatchRow label={t('Background color')} value={settings.frameFill} onChange={frameFill=>patch({frameFill:frameFill as typeof settings.frameFill})} options={[{value:'none',label:t('None'),color:swatch.muted,auto:true},...colorOptions]}/>
      {settings.frameFill!=='none'?percentSlider('spec-fill-opacity',t('Background opacity'),settings.frameFillOpacity,5,frameFillOpacity=>patch({frameFillOpacity})):null}
    </section>
  </div>;
}`);
fs.writeFileSync(f,s.replace(/\n/g,eol));console.log('ok');
