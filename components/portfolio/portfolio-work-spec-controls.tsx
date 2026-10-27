'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';
import { WorkButtonStylePreview } from './portfolio-work-button-style-preview';
import { WorkContentLabels } from './portfolio-work-content-labels';

import { useT } from '@/lib/i18n/I18nProvider';
import type { CSSProperties } from 'react';
import { Choices } from './portfolio-stack-progress-controls';
import { ColorSwatchRow } from './portfolio-color-swatch-row';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import { resolveHeroPaletteColor } from './portfolio-hero-palette-settings';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';
import { PORTFOLIO_WORK_SPEC_COLOR_OPTIONS, PORTFOLIO_WORK_SPEC_META_COLOR_OPTIONS, PORTFOLIO_WORK_SPEC_META_DIVIDER_OPTIONS, PORTFOLIO_WORK_SPEC_META_DIVIDER_SIZE_OPTIONS } from './portfolio-work-settings';
import { DEFAULT_PROJECTS_SPEC_SETTINGS, PORTFOLIO_WORK_SPEC_COLUMNS_OPTIONS, PORTFOLIO_WORK_SPEC_FRAME_OPTIONS, PORTFOLIO_WORK_SPEC_SHEET_GAP_OPTIONS, type PortfolioWorkSectionSettings } from './portfolio-work-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-work-ledger-controls.module.css';
import specStyles from './portfolio-work-spec-controls.module.css';

export function WorkSpecControls({work,onChange}:{work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void}) {
  const t=useT();
  const settings={...DEFAULT_PROJECTS_SPEC_SETTINGS,...work.projectsSpec};
  const theme=useThumbnailTheme('work');
  const patch=(next:Partial<typeof settings>)=>onChange({projectsSpec:{...settings,...next}});
  const swatch={principal:resolveHeroPaletteColor(theme.palette,'principal'),secondaire:resolveHeroPaletteColor(theme.palette,'secondaire'),texteFort:resolveHeroPaletteColor(theme.palette,'texteFort'),muted:theme.muted};
  const colorOptions=PORTFOLIO_WORK_SPEC_COLOR_OPTIONS.map(option=>({value:option.value,label:t(option.label),color:swatch[option.value]}));
  const metaOptions=PORTFOLIO_WORK_SPEC_META_COLOR_OPTIONS.map(option=>({value:option.value,label:t(option.label),color:swatch[option.value]}));
  const percentSlider=(id:string,label:string,value:number,min:number,onValue:(next:number)=>void)=><div className="np-field np-text-size-slider block">
    <div className="flex items-center justify-between gap-3"><label htmlFor={id} className="np-field-label">{label}</label><span className="text-xs text-neutral-400">{value}%</span></div>
    <input id={id} type="range" min={min} max={100} step={5} value={value} className="pf-exp-centered-slider pf-exp-centered-slider--thick" style={{'--pf-exp-slider-fill':`${(value-min)/(100-min)*100}%`} as CSSProperties} onChange={event=>onValue(Number(event.target.value))}/>
  </div>;
  return <div className={`${styles.controls} ${compactStyles.controls} ${specStyles.controls}`}>
    <SettingsControlSection title={t('Layout')} className={styles.settingsGroup}>
      
      <Choices label={t('Columns (wide screen)')} options={PORTFOLIO_WORK_SPEC_COLUMNS_OPTIONS} value={settings.showThumbnail?'1':String(settings.columnsPerRow??1) as '1'|'2'} onChange={value=>onChange({projectsSpec:{...settings,columnsPerRow:value==='2'?2:1,...(value==='2'?{showThumbnail:false}:{})}})}
        glyph={value=><svg width="64" height="32" viewBox="0 0 64 32" fill="currentColor" aria-hidden>{Array.from({length:Number(value)},(_,i)=><g key={i}><rect x={i*64/Number(value)+3} y="3" width={64/Number(value)-6} height="26" rx="2" opacity=".12"/><path d={`M${i*64/Number(value)+8} 12h${64/Number(value)-16}m-${64/Number(value)-16} 8h${64/Number(value)-20}`} stroke="currentColor" strokeWidth="1.5" opacity=".8"/></g>)}</svg>}/>
      {settings.showThumbnail?<p className="np-subtle">{t('Thumbnail on: display forced to')} {t('1 per row')}{t(', image outside on the left.')}</p>:null}
      <Choices label={t('Spacing between projects')} options={PORTFOLIO_WORK_SPEC_SHEET_GAP_OPTIONS} columns={4} value={settings.sheetGap??'xl'} onChange={sheetGap=>onChange({projectsSpec:{...settings,sheetGap}})}
        glyph={(_,index)=><svg width="38" height="34" viewBox="0 0 38 34" fill="currentColor" aria-hidden>{[-1,0,1].map(i=><rect key={i} x="4" y={15+i*[4,7,10,13][index]} width="30" height="3" rx="1"/>)}</svg>}/>
    </SettingsControlSection>
<SettingsControlSection title={t('Appearance')} className={styles.settingsGroup}>
      
      <NpToggleRow title={t('Numbering')} checked={settings.showIndex!==false} onChange={showIndex=>patch({showIndex})}/>
      <ColorSwatchRow label={t('Category and role color')} value={settings.categoryColor} onChange={categoryColor=>patch({categoryColor:categoryColor as typeof settings.categoryColor,roleColor:categoryColor as typeof settings.roleColor})} options={metaOptions}/>
<Choices label={t('Separator')} options={PORTFOLIO_WORK_SPEC_META_DIVIDER_OPTIONS} columns={3} value={settings.metaDivider} onChange={metaDivider=>patch({metaDivider})}
        glyph={value=><svg width="64" height="32" viewBox="0 0 64 32" fill="none" aria-hidden>{value==='none'?<path d="m26 22 12-12" stroke="currentColor" opacity=".45"/>:<path d={value==='short'?'M22 16h20':'M8 16h48'} stroke="currentColor" strokeWidth="2"/>}</svg>}/>
{settings.metaDivider!=='none'?<>
        <ColorSwatchRow label={t('Separator color')} value={settings.metaDividerColor} onChange={metaDividerColor=>patch({metaDividerColor:metaDividerColor as typeof settings.metaDividerColor})} options={colorOptions}/>
        <Choices label={t('Separator size')} options={PORTFOLIO_WORK_SPEC_META_DIVIDER_SIZE_OPTIONS} columns={3} value={settings.metaDividerSize} onChange={metaDividerSize=>patch({metaDividerSize})}
          glyph={(_,index)=><svg width="64" height="40" viewBox="0 0 64 40" fill="currentColor" aria-hidden><rect x={32-[8,12,18][index]/2*1.5} y={20-[1,1.5,2][index]/2} width={[12,18,27][index]} height={[1,2,3][index]}/></svg>}/>
      </>:null}
      <Choices label={t('Framing')} options={PORTFOLIO_WORK_SPEC_FRAME_OPTIONS} value={settings.sheetFrame??'none'} onChange={sheetFrame=>onChange({projectsSpec:{...settings,sheetFrame}})}
        glyph={value=><svg width="64" height="40" viewBox="0 0 64 40" fill="none" aria-hidden><rect x="4" y="3" width="56" height="34" rx="2" stroke={value==='none'?'none':'currentColor'} strokeWidth={value==='solid'?3:1} fill="currentColor" fillOpacity=".08"/>{value==='accent'?<path d="M4 3v34" stroke="currentColor" strokeWidth="4"/>:null}<path d="M13 12h32m-32 8h38m-38 8h28" stroke="currentColor" strokeWidth="2"/></svg>}/>
      {settings.sheetFrame!=='none'?<>
        <ColorSwatchRow label={t('Border color')} value={settings.frameColor} onChange={frameColor=>patch({frameColor:frameColor as typeof settings.frameColor})} options={[{value:'auto',label:t('Auto'),color:swatch.muted,auto:true},...colorOptions]}/>
        {percentSlider('spec-frame-opacity',t('Border opacity'),settings.frameOpacity,10,frameOpacity=>patch({frameOpacity}))}
      </>:null}
      <ColorSwatchRow label={t('Background color')} value={settings.frameFill} onChange={frameFill=>patch({frameFill:frameFill as typeof settings.frameFill})} options={[{value:'none',label:t('None'),color:swatch.muted,auto:true},...colorOptions]}/>
      {settings.frameFill!=='none'?percentSlider('spec-fill-opacity',t('Background opacity'),settings.frameFillOpacity,5,frameFillOpacity=>patch({frameFillOpacity})):null}
    </SettingsControlSection>
    <WorkContentLabels work={work} onChange={onChange}/>
    {settings.showConsult!==false?<SettingsControlSection title={t('Consult link')} className={styles.settingsGroup}>
        
        <WorkContentLabels work={work} onChange={onChange} scope="consult"/>
        
        <Choices<'underline'|'outline'|'solid'|'pill'> label={t('Button style')} hideOptionLabels columns={2}
          options={[{value:'underline',label:'Underline'},{value:'outline',label:'Outline'},{value:'solid',label:'Solid'},{value:'pill',label:'Pill'}]}
          value={settings.consultDesign??'underline'} onChange={consultDesign=>patch({consultDesign})}
          glyph={value=><WorkButtonStylePreview variant={value} label={settings.consultLabel?.trim()||t('Consult this project')}/>} />
      </SettingsControlSection>:null}
  </div>;
}
