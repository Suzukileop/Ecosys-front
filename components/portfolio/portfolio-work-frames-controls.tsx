'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';
import { WorkContentLabels } from './portfolio-work-content-labels';

import type { CSSProperties } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';
import { Choices } from './portfolio-stack-progress-controls';
import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import {
  DEFAULT_PROJECTS_FRAMES_SETTINGS, PORTFOLIO_WORK_FRAMES_THUMBNAIL_SIZE_OPTIONS,
  PORTFOLIO_WORK_FRAMES_IMAGE_SIDE_OPTIONS, PORTFOLIO_WORK_FRAMES_RADIUS_OPTIONS,
  PORTFOLIO_WORK_FRAMES_CARD_GAP_OPTIONS, PORTFOLIO_WORK_FRAMES_TITLE_STYLE_OPTIONS,
  type PortfolioWorkSectionSettings,
} from './portfolio-work-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import framesStyles from './portfolio-work-accordion-controls.module.css';

export function WorkFramesControls({work,onChange}:{work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void}) {
  const t=useT();
  const settings={...DEFAULT_PROJECTS_FRAMES_SETTINGS,...work.projectsFrames};
  const size=PORTFOLIO_WORK_FRAMES_THUMBNAIL_SIZE_OPTIONS.find(option=>option.value===(settings.thumbnailSize??'xl'))!;
  return <div className={`${styles.controls} ${framesStyles.controls}`}>
    <SettingsControlSection title={t('Layout')} className={styles.settingsGroup}>
      
      <Choices label={t('Image placement')} options={PORTFOLIO_WORK_FRAMES_IMAGE_SIDE_OPTIONS} value={settings.imageSide??'left'} onChange={imageSide=>onChange({projectsFrames:{...settings,imageSide}})}
        glyph={value=><svg width="76" height="42" viewBox="0 0 76 42" fill="currentColor" aria-hidden><rect x={value==='left'?3:43} y="5" width="30" height="32" rx="2" opacity=".3"/><rect x={value==='left'?43:3} y="14" width="28" height="3" rx="1" opacity=".85"/><rect x={value==='left'?43:3} y="24" width="22" height="2" rx="1" opacity=".4"/></svg>}/>
      <NpToggleRow title={t('Zig-zag layout')} checked={settings.alternateSides===true} onChange={alternateSides=>onChange({projectsFrames:{...settings,alternateSides}})}/>
      <Choices label={t('Vertical spacing')} options={PORTFOLIO_WORK_FRAMES_CARD_GAP_OPTIONS} columns={3} value={settings.cardGap??'tight'} onChange={cardGap=>onChange({projectsFrames:{...settings,cardGap}})}
        glyph={(_,index)=><svg width="38" height="34" viewBox="0 0 38 34" fill="currentColor" aria-hidden>{[-1,0,1].map(i=><rect key={i} x="4" y={15+i*[5,9,13][index]} width="30" height="3" rx="1"/>)}</svg>}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Thumbnail')} className={styles.settingsGroup}>
      
      <div className="np-text-size-slider"><HeaderSteppedSlider label={t('Thumbnail size')} value={size.value} currentName={t(size.label)}
        steps={PORTFOLIO_WORK_FRAMES_THUMBNAIL_SIZE_OPTIONS.map((option,index)=>({value:option.value,tick:['M','L','XL','XXL','50/50'][index]}))}
        onChange={thumbnailSize=>onChange({projectsFrames:{...settings,thumbnailSize}})}/></div>
      <Choices label={t('Corner radius')} options={PORTFOLIO_WORK_FRAMES_RADIUS_OPTIONS} columns={3} value={settings.radius??'xl'} onChange={radius=>onChange({projectsFrames:{...settings,radius}})}
        glyph={value=><svg width="54" height="36" viewBox="0 0 54 36" fill="none" aria-hidden><rect x="2" y="2" width="50" height="32" rx={value==='none'?0:value==='md'?5:12} stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity=".12"/></svg>}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Title')} className={styles.settingsGroup}>
      
      <Choices label={t('Title style')} options={PORTFOLIO_WORK_FRAMES_TITLE_STYLE_OPTIONS} value={settings.titleStyle??'simple'} onChange={titleStyle=>onChange({projectsFrames:{...settings,titleStyle}})}
        glyph={value=><svg width="76" height="36" viewBox="0 0 76 36" fill="currentColor" aria-hidden>
          <text x="38" y="28" textAnchor="middle" fontFamily="var(--font-app, ui-sans-serif), system-ui, sans-serif" fontSize={value==='display'?30:23} fontWeight={value==='display'?900:500} letterSpacing={value==='display'?'-1':'-.3'}>Aa</text>
        </svg>}/>
      <div className="np-field np-text-size-slider block">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="frames-title-size" className="np-field-label">{t('Title size')}</label>
          <span className="text-xs text-neutral-400">{settings.titleSize==null?t('Auto'):`${settings.titleSize} px`}</span>
        </div>
        <input id="frames-title-size" type="range" min={24} max={120} step={1}
          value={settings.titleSize??(settings.titleStyle==='display'?96:52)} className="pf-exp-centered-slider pf-exp-centered-slider--thick"
          style={{'--pf-exp-slider-fill':`${((settings.titleSize??(settings.titleStyle==='display'?96:52))-24)/96*100}%`} as CSSProperties}
          onChange={event=>onChange({projectsFrames:{...settings,titleSize:Number(event.target.value)}})}/>
        <button type="button" className="mt-2 text-xs text-neutral-400 hover:text-white disabled:opacity-40"
          disabled={settings.titleSize==null} onClick={()=>onChange({projectsFrames:{...settings,titleSize:null}})}>{t('Auto')}</button>
      </div>
    </SettingsControlSection>
    
    {settings.showConsult!==false?<SettingsControlSection title={t('Consult link')} className={styles.settingsGroup}>
      
      <WorkContentLabels work={work} onChange={onChange} scope="consult"/>
    </SettingsControlSection>:null}
  </div>;
}
