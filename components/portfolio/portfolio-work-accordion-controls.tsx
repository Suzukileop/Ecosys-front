'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';
import { WorkContentLabels } from './portfolio-work-content-labels';
import type { CSSProperties } from 'react';

import { useT } from '@/lib/i18n/I18nProvider';
import { Choices } from './portfolio-stack-progress-controls';
import { DEFAULT_PROJECTS_ACCORDION_SETTINGS, PORTFOLIO_WORK_ACCORDION_PREVIEW_SIDE_OPTIONS, type PortfolioWorkSectionSettings } from './portfolio-work-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import accordionStyles from './portfolio-work-accordion-controls.module.css';

export function WorkAccordionControls({work,onChange}:{work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void}) {
  const t=useT();
  const settings={...DEFAULT_PROJECTS_ACCORDION_SETTINGS,...work.projectsAccordion};
  return <div className={`${styles.controls} ${accordionStyles.controls}`}>
    <SettingsControlSection title={t('Layout')} className={styles.settingsGroup}>
      
      <Choices<'editorial'|'compact'> label="Style d’affichage"
        options={[{value:'editorial',label:'Éditorial épuré'},{value:'compact',label:'Cartes compactes'}]}
        value={settings.displayStyle??'editorial'} onChange={displayStyle=>onChange({projectsAccordion:{...settings,displayStyle}})}
        glyph={value=><svg width="88" height="48" viewBox="0 0 88 48" fill="currentColor" aria-hidden>
          {value==='compact'?<>
            <rect x="6" y="3" width="76" height="25" rx="4" opacity=".14"/>
            <rect x="6" y="33" width="76" height="12" rx="3" opacity=".1"/>
          </>:<path d="M6 29h76M6 45h76" stroke="currentColor" opacity=".2"/>}
          <rect x="14" y="9" width="42" height="4" rx="1" opacity=".9"/>
          <rect x="14" y="18" width="56" height="2" rx="1" opacity=".35"/>
          <rect x="14" y="37" width="42" height="3" rx="1" opacity=".5"/>
        </svg>}/>
    <Choices label={t('Preview placement')} options={PORTFOLIO_WORK_ACCORDION_PREVIEW_SIDE_OPTIONS} value={settings.previewSide??'right'}
      onChange={previewSide=>onChange({projectsAccordion:{...settings,previewSide}})}
      glyph={value=><svg width="88" height="48" viewBox="0 0 88 48" fill="currentColor" aria-hidden>
        <rect x={value==='left'?7:49} y="7" width="32" height="34" rx="2" opacity=".3"/>
        <rect x={value==='left'?49:7} y="15" width="28" height="3" rx="1" opacity=".85"/>
        <rect x={value==='left'?49:7} y="25" width="22" height="2" rx="1" opacity=".4"/>
      </svg>}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Thumbnail')} className={styles.settingsGroup}>
      
      <Choices<'cover'|'contain'> label={t('Image fit')} options={[{value:'cover',label:'Cover'},{value:'contain',label:'Contain'}]}
        value={settings.previewFit??'cover'} onChange={previewFit=>onChange({projectsAccordion:{...settings,previewFit}})}
        glyph={value=><svg width="80" height="48" viewBox="0 0 80 48" fill="currentColor" aria-hidden><rect x="8" y="3" width="64" height="42" rx="3" opacity=".15"/><rect x={value==='contain'?14:8} y={value==='contain'?12:3} width={value==='contain'?52:64} height={value==='contain'?24:42} rx="2" opacity=".65"/></svg>}/>
      <label className="np-field block">
        <span className="np-field-label flex items-center justify-between gap-3"><span>{t('Thumbnail size')}</span><output className={accordionStyles.value}>{settings.previewSize??100}%</output></span>
        <input type="range" min={50} max={100} step={5} value={settings.previewSize??100}
          className="np-range w-full" aria-label={t('Thumbnail size')}
          style={{'--np-fill':`${((settings.previewSize??100)-50)*2}%`} as CSSProperties}
          onChange={event=>onChange({projectsAccordion:{...settings,previewSize:Number(event.target.value)}})}/>
      </label>
      <Choices<'none'|'rounded'|'arch'|'cut'> label={t('Thumbnail shape')} columns={4}
        options={[{value:'none',label:'None'},{value:'rounded',label:'Rounded'},{value:'arch',label:'Arch'},{value:'cut',label:'Beveled'}]}
        value={settings.previewShape??'cut'} onChange={previewShape=>onChange({projectsAccordion:{...settings,previewShape}})}
        glyph={value=><svg width="52" height="44" viewBox="0 0 52 44" aria-hidden fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeOpacity=".7" strokeWidth="1.5">
          {value==='cut'?<path d="M8 5H35L45 15V39H8Z"/>:value==='arch'?<path d="M8 39V23a18 18 0 0 1 36 0v16Z"/>:<rect x="8" y="5" width="36" height="34" rx={value==='rounded'?8:0}/>}
        </svg>}/>
    </SettingsControlSection>
    <WorkContentLabels work={work} onChange={onChange}/>
    {settings.showConsult!==false?<SettingsControlSection title={t('Consult link')} className={styles.settingsGroup}>
      
      <WorkContentLabels work={work} onChange={onChange} scope="consult"/>
    </SettingsControlSection>:null}
  </div>;
}
