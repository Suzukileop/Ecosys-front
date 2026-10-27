'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';
import { WorkContentLabels } from './portfolio-work-content-labels';

import { useT } from '@/lib/i18n/I18nProvider';
import { Choices } from './portfolio-stack-progress-controls';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import { DEFAULT_PROJECTS_SHOWCASE_SETTINGS, PORTFOLIO_WORK_SHOWCASE_MEDIA_SIDE_OPTIONS, PORTFOLIO_WORK_SHOWCASE_NAV_HOVER_OPTIONS, PORTFOLIO_WORK_SHOWCASE_RADIUS_OPTIONS, type PortfolioWorkProjectsShowcaseRadius, type PortfolioWorkSectionSettings } from './portfolio-work-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-work-accordion-controls.module.css';

const radiusGlyph=(value:PortfolioWorkProjectsShowcaseRadius)=><svg width="56" height="38" viewBox="0 0 56 38" fill="none" aria-hidden><rect x="3" y="3" width="50" height="32" rx={value==='none'?0:value==='md'?6:13} stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/></svg>;
const chevrons=<><path d="M10 13l-4 4 4 4M46 13l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>;

export function WorkShowcaseControls({work,onChange}:{work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void}) {
  const t=useT();
  const settings={...DEFAULT_PROJECTS_SHOWCASE_SETTINGS,...work.projectsShowcase};
  return <div className={`${styles.controls} ${compactStyles.controls}`}>
    <SettingsControlSection title={t('Layout')} className={styles.settingsGroup}>
      
      <Choices label={t('Media placement')} options={PORTFOLIO_WORK_SHOWCASE_MEDIA_SIDE_OPTIONS} value={settings.mediaSide??'left'} onChange={mediaSide=>onChange({projectsShowcase:{...settings,mediaSide}})}
        glyph={value=>{const copyX=value==='left'?48:8;return <svg width="80" height="40" viewBox="0 0 80 40" fill="currentColor" aria-hidden><rect x={value==='left'?8:44} y="5" width="28" height="30" rx="2" opacity=".3"/><rect x={copyX} y="13" width="24" height="3" rx="1" opacity=".85"/><rect x={copyX} y="22" width="18" height="2" rx="1" opacity=".4"/></svg>;}}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Appearance')} className={styles.settingsGroup}>
      
      <NpToggleRow title={t('Italic last word')} checked={settings.titleItalic === true} onChange={titleItalic=>onChange({projectsShowcase:{...settings,titleItalic}})}/>
      <NpToggleRow title={t('Numbering')} checked={settings.showIndex!==false}
        onChange={showIndex=>onChange({projectsShowcase:{...settings,showIndex}})}/>
      <Choices label={t('Media radius')} options={PORTFOLIO_WORK_SHOWCASE_RADIUS_OPTIONS} columns={3} value={settings.mediaRadius??'xl'} onChange={mediaRadius=>onChange({projectsShowcase:{...settings,mediaRadius}})} glyph={radiusGlyph}/>
      <Choices label={t('Thumbnail radius')} options={PORTFOLIO_WORK_SHOWCASE_RADIUS_OPTIONS} columns={3} value={settings.thumbRadius??'none'} onChange={thumbRadius=>onChange({projectsShowcase:{...settings,thumbRadius}})} glyph={radiusGlyph}/>
    </SettingsControlSection>
    <WorkContentLabels work={work} onChange={onChange}/>
    <SettingsControlSection title={t('Navigation')} className={styles.settingsGroup}>
      
      <NpToggleRow title={t('Counter')} checked={settings.showCounter!==false}
        onChange={showCounter=>onChange({projectsShowcase:{...settings,showCounter}})}/>
      <Choices label={t('Arrows')} options={PORTFOLIO_WORK_SHOWCASE_NAV_HOVER_OPTIONS} columns={3} value={settings.navHover??'aura'} onChange={navHover=>onChange({projectsShowcase:{...settings,navHover}})}
        glyph={value=><svg width="56" height="34" viewBox="0 0 56 34" aria-hidden>{chevrons}{value==='circle'?<><circle cx="8" cy="17" r="7.5" stroke="currentColor" fill="none"/><circle cx="48" cy="17" r="7.5" stroke="currentColor" fill="none"/></>:value==='aura'?<circle cx="44" cy="15" r="7.5" stroke="currentColor" fill="none" strokeDasharray="3 2"/>:null}</svg>}/>
    </SettingsControlSection>
  </div>;
}
