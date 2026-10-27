'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';
import { WorkContentLabels } from './portfolio-work-content-labels';

import { useT } from '@/lib/i18n/I18nProvider';
import { Choices } from './portfolio-stack-progress-controls';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import { DEFAULT_PROJECTS_PRESS_SETTINGS, PORTFOLIO_WORK_PRESS_EYEBROW_SIZE_OPTIONS, PORTFOLIO_WORK_CARD_RADIUS_OPTIONS, type PortfolioWorkSectionSettings } from './portfolio-work-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import pressStyles from './portfolio-work-press-controls.module.css';

export function WorkPressControls({work,onChange}:{work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void}) {
  const t=useT();
  const settings={...DEFAULT_PROJECTS_PRESS_SETTINGS,...work.projectsPress};
  const size=PORTFOLIO_WORK_PRESS_EYEBROW_SIZE_OPTIONS.find(option=>option.value===(settings.eyebrowSize??'md'))!;
  return <div className={pressStyles.controls}>
    <WorkContentLabels work={work} onChange={onChange}/>
    <SettingsControlSection title={t('Eyebrow')} className={pressStyles.group}>
      
      <div className="np-text-size-slider"><HeaderSteppedSlider label={t('Eyebrow size')} value={size.value} currentName={t(size.label)} steps={PORTFOLIO_WORK_PRESS_EYEBROW_SIZE_OPTIONS.map((option,index)=>({value:option.value,tick:['S','M','L'][index]}))} onChange={eyebrowSize=>onChange({projectsPress:{...settings,eyebrowSize}})}/></div>
      <NpToggleRow title={t('Sticky')} checked={settings.eyebrowSticky!==false} onChange={eyebrowSticky=>onChange({projectsPress:{...settings,eyebrowSticky}})}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Thumbnail')} className={pressStyles.group}>
      
      <Choices label={t('Thumbnail radius')} options={PORTFOLIO_WORK_CARD_RADIUS_OPTIONS} columns={3} value={settings.thumbnailRadius??'md'} onChange={thumbnailRadius=>onChange({projectsPress:{...settings,thumbnailRadius}})}
        glyph={(_,index)=><svg width="56" height="38" viewBox="0 0 56 38" fill="none" aria-hidden><rect x="3" y="3" width="50" height="32" rx={[0,3,7,11,16][index]} stroke="currentColor" strokeOpacity=".7" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/></svg>}/>
    </SettingsControlSection>
  </div>;
}
