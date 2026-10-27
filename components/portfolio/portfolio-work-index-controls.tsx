'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';

import {useT} from '@/lib/i18n/I18nProvider';
import {Choices} from './portfolio-stack-progress-controls';
import {NpToggleRow} from './portfolio-nav-panel-ui';
import {DEFAULT_PROJECTS_INDEX_SETTINGS, type PortfolioWorkSectionSettings} from './portfolio-work-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-work-accordion-controls.module.css';

export function WorkIndexControls({work,onChange}:{work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void}) {
  const t=useT();
  const settings={...DEFAULT_PROJECTS_INDEX_SETTINGS,...work.projectsIndex};
  return <div className={`${styles.controls} ${compactStyles.controls}`}>
    <SettingsControlSection title={t('Layout')} className={styles.settingsGroup}>
      
      <Choices<'vertical'|'horizontal'> label={t('Scroll direction')}
        options={[{value:'vertical',label:'Vertical'},{value:'horizontal',label:'Horizontal'}]}
        value={settings.scrollDirection??'vertical'} onChange={scrollDirection=>onChange({projectsIndex:{...settings,scrollDirection}})}
        glyph={value=><svg width="76" height="36" viewBox="0 0 76 36" fill="none" aria-hidden>
          <path d={value==='vertical'?'M38 5v26m-6-6 6 6 6-6':'M13 18h50m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Appearance')} className={styles.settingsGroup}>
      
      <NpToggleRow title={t('Index marker')} checked={settings.showNumber!==false}
        onChange={showNumber=>onChange({projectsIndex:{...settings,showNumber}})}/>
      <Choices label={t('Media border')} columns={4}
        options={[{value:'0',label:'None'},{value:'1',label:'1 px'},{value:'2',label:'2 px'},{value:'3',label:'3 px'}]}
        value={String(settings.mediaBorderWidth??1)}
        onChange={value=>onChange({projectsIndex:{...settings,mediaBorderWidth:Number(value)}})}
        glyph={value=><svg width="54" height="44" viewBox="0 0 54 44" fill="none" aria-hidden>
          <rect x="7" y="6" width="40" height="32" fill="currentColor" opacity=".12"/>
          <rect x="7" y="6" width="40" height="32" stroke="currentColor" strokeWidth={Number(value)||1} strokeDasharray={value==='0'?'3 4':undefined} opacity={value==='0'?.3:.8}/>
        </svg>}/>
    </SettingsControlSection>
  </div>;
}
