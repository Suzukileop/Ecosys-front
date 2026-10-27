'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import { WorkContentLabels } from './portfolio-work-content-labels';

import { useT } from '@/lib/i18n/I18nProvider';
import { Choices } from './portfolio-stack-progress-controls';
import { CardsStyleControls } from './portfolio-cards-style-controls';
import { DEFAULT_CARDS_STYLE } from './portfolio-cards-style';
import { WorkButtonStylePreview } from './portfolio-work-button-style-preview';
import { DEFAULT_PROJECTS_GRID_SETTINGS, type PortfolioWorkSectionSettings } from './portfolio-work-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-work-ledger-controls.module.css';
import gridStyles from './portfolio-work-grid-controls.module.css';

export function WorkGridControls({work,onChange}:{work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void}) {
  const t=useT();
  const settings={...DEFAULT_PROJECTS_GRID_SETTINGS,...work.projectsGrid};
  return <div className={`${styles.controls} ${compactStyles.controls}`}>
    <SettingsControlSection title={t('Layout')} className={`${styles.settingsGroup} ${gridStyles.layout}`}>
      
      <NpToggleRow title={t('Carousel navigation')} checked={settings.carouselEnabled === true} onChange={carouselEnabled=>onChange({projectsGrid:{...settings,carouselEnabled}})}/>
      <Choices<'2'|'3'|'4'> label={t('Columns on large screens')} columns={3} options={[{value:'2',label:'2 columns'},{value:'3',label:'3 columns'},{value:'4',label:'4 columns'}]}
        value={String(settings.columnsPerRow??2) as '2'|'3'|'4'} onChange={value=>onChange({projectsGrid:{...settings,columnsPerRow:value==='4'?4:value==='3'?3:2}})}
        glyph={value=><svg width="64" height="32" viewBox="0 0 64 32" fill="currentColor" aria-hidden>{Array.from({length:Number(value)},(_,i)=><rect key={i} x={i*64/Number(value)+2} y="4" width={64/Number(value)-4} height="24" rx="2" opacity=".65"/>)}</svg>}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Appearance')} className={`${styles.settingsGroup} ${gridStyles.cardControls}`}>
      
      <CardsStyleControls collapsible={false} value={work.cardsStyle??DEFAULT_CARDS_STYLE} onChange={cardsStyle=>onChange({cardsStyle})} palette={work.workPalette}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Consult link')} className={styles.settingsGroup}>
      
      <WorkContentLabels work={work} onChange={onChange} scope="consult"/>
      <Choices<'underline'|'outline'|'solid'|'pill'> label={t('Button style')} hideOptionLabels
        options={[{value:'underline',label:'Underline'},{value:'outline',label:'Outline'},{value:'solid',label:'Solid'},{value:'pill',label:'Pill'}]}
        value={settings.consultStyle??'underline'} onChange={consultStyle=>onChange({projectsGrid:{...settings,consultStyle}})}
        glyph={value=><WorkButtonStylePreview variant={value}
          label={settings.consultLabel?.trim()||t('View project')}/>}/>
      
    </SettingsControlSection>
  </div>;
}
