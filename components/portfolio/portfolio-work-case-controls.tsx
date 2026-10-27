'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';
import { WorkContentLabels } from './portfolio-work-content-labels';
import type { CSSProperties } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';
import { Choices } from './portfolio-stack-progress-controls';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import { DEFAULT_PROJECTS_CASE_SETTINGS, PORTFOLIO_WORK_SPEC_SHEET_GAP_OPTIONS, PORTFOLIO_WORK_SPEC_FRAME_OPTIONS, PORTFOLIO_WORK_CASE_THUMBNAIL_HEIGHT_OPTIONS, type PortfolioWorkSectionSettings } from './portfolio-work-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-work-accordion-controls.module.css';

const CONSULT_MODE_OPTIONS:{value:'hover'|'footer';label:string}[]=[{value:'footer',label:'Always visible'},{value:'hover',label:'On hover'}];

export function WorkCaseControls({work,onChange}:{work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void}) {
  const t=useT();
  const settings={...DEFAULT_PROJECTS_CASE_SETTINGS,...work.projectsCase};
  const size=PORTFOLIO_WORK_CASE_THUMBNAIL_HEIGHT_OPTIONS.find(option=>option.value===(settings.thumbnailHeight??'xl'))!;
  return <div className={`${styles.controls} ${compactStyles.controls}`}>
<SettingsControlSection title={t('Layout')} className={styles.settingsGroup}>
<NpToggleRow title={t('Zig-zag layout')} checked={settings.zigzagEnabled!==false} onChange={zigzagEnabled=>onChange({projectsCase:{...settings,zigzagEnabled}})}/>
<Choices label={t('Spacing between projects')} options={PORTFOLIO_WORK_SPEC_SHEET_GAP_OPTIONS} columns={4} value={settings.sheetGap??'xl'} onChange={sheetGap=>onChange({projectsCase:{...settings,sheetGap}})} glyph={(_,index)=><svg width="38" height="34" viewBox="0 0 38 34" fill="currentColor" aria-hidden>{[-1,0,1].map(i=><rect key={i} x="4" y={15+i*[4,7,10,13][index]} width="30" height="3" rx="1"/>)}</svg>}/>
</SettingsControlSection>
<SettingsControlSection title={t('Thumbnail')} className={styles.settingsGroup}>
      
      <div className="np-text-size-slider"><HeaderSteppedSlider label={t('Thumbnail height')} value={size.value} currentName={t(size.label)} steps={PORTFOLIO_WORK_CASE_THUMBNAIL_HEIGHT_OPTIONS.map((option,index)=>({value:option.value,tick:['S','M','L','XL'][index]}))} onChange={thumbnailHeight=>onChange({projectsCase:{...settings,thumbnailHeight,showThumbnail:true}})}/></div>
      <Choices label={t('Framing')} options={PORTFOLIO_WORK_SPEC_FRAME_OPTIONS} value={settings.sheetFrame??'thin'} onChange={sheetFrame=>onChange({projectsCase:{...settings,sheetFrame}})} glyph={value=><svg width="64" height="40" viewBox="0 0 64 40" fill="none" aria-hidden><rect x="4" y="3" width="56" height="34" rx="2" stroke={value==='none'?'none':'currentColor'} strokeWidth={value==='solid'?3:1} fill="currentColor" fillOpacity=".08"/>{value==='accent'?<path d="M4 3v34" stroke="currentColor" strokeWidth="4"/>:null}<path d="M13 12h32m-32 8h38m-38 8h28" stroke="currentColor" strokeWidth="2"/></svg>}/>
    </SettingsControlSection>
<SettingsControlSection title={t('Title')} className={styles.settingsGroup}>
<NpToggleRow title={t('Numbering')} checked={settings.showIndex!==false} onChange={showIndex=>onChange({projectsCase:{...settings,showIndex}})}/>
<NpToggleRow title={t('Plain title')} checked={settings.plainTitle===true} onChange={plainTitle=>onChange({projectsCase:{...settings,plainTitle}})}/>
<div className="np-field np-text-size-slider block">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="case-title-size" className="np-field-label">{t('Title size')}</label>
          <span className="text-xs text-neutral-400">{settings.titleSize==null?t('Auto'):`${settings.titleSize} px`}</span>
        </div>
        <input id="case-title-size" type="range" min={24} max={120} step={1} value={settings.titleSize??64} className="pf-exp-centered-slider pf-exp-centered-slider--thick"
          style={{'--pf-exp-slider-fill':`${((settings.titleSize??64)-24)/96*100}%`} as CSSProperties}
          onChange={event=>onChange({projectsCase:{...settings,titleSize:Number(event.target.value)}})}/>
        <button type="button" className="mt-2 text-xs text-neutral-400 hover:text-white disabled:opacity-40" disabled={settings.titleSize==null}
          onClick={()=>onChange({projectsCase:{...settings,titleSize:null}})}>{t('Auto')}</button>
      </div>
</SettingsControlSection>
<WorkContentLabels work={work} onChange={onChange}/>
{settings.showConsult!==false?<SettingsControlSection title={t('Consult link')} className={styles.settingsGroup}>
      
      <WorkContentLabels work={work} onChange={onChange} scope="consult"/>
      <Choices label={t('Consult display')} options={CONSULT_MODE_OPTIONS} value={settings.consultMode??'footer'} onChange={consultMode=>onChange({projectsCase:{...settings,consultMode}})} glyph={value=><svg width="64" height="40" viewBox="0 0 64 40" fill="none" aria-hidden><rect x="4" y="3" width="56" height="34" rx="2" stroke="currentColor" strokeOpacity=".4" fill="currentColor" fillOpacity=".08"/>{value==='hover'?<circle cx="32" cy="20" r="9" fill="currentColor" fillOpacity=".7"/>:<path d="M10 30h20" stroke="currentColor" strokeWidth="2"/>}</svg>}/>
      
    </SettingsControlSection>:null}
</div>;
}
