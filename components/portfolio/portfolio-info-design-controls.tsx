'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { NpCollapsibleSection, NpToggleRow } from './portfolio-nav-panel-ui';
import { Choices } from './portfolio-stack-progress-controls';
import { InfoTraitControls } from './portfolio-info-trait-controls';
import { InfoSplitControls } from './portfolio-info-split-controls';
import { InfoBannerControls } from './portfolio-info-banner-controls';
import { InfoPlatformControls } from './portfolio-info-platform-controls';
import { InfoPortraitControls } from './portfolio-info-portrait-controls';
import { InfoManifestoControls } from './portfolio-info-manifesto-controls';
import { InfoValueControls } from './portfolio-info-value-controls';
import type { PortfolioInfoSectionSettings } from './portfolio-info-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-info-design-controls.module.css';

export function InfoDesignControls({info,onChange}:{info:PortfolioInfoSectionSettings;onChange:(patch:Partial<PortfolioInfoSectionSettings>)=>void}) {
  const t=useT();
  switch(info.design ?? 'about-me') {
    case 'about-me-trait': return <InfoTraitControls info={info} onChange={onChange}/>;
    case 'about-split': return <InfoSplitControls info={info} onChange={onChange}/>;
    case 'about-banner': return <InfoBannerControls info={info} onChange={onChange}/>;
    case 'about-platform': return <InfoPlatformControls info={info} onChange={onChange}/>;
    case 'about-portrait-skills': return <InfoPortraitControls info={info} onChange={onChange}/>;
    case 'about-manifesto': return <InfoManifestoControls info={info} onChange={onChange}/>;
    case 'about-value-steps': return <InfoValueControls info={info} onChange={onChange}/>;
    case 'about-terminal': return <div className={`${styles.controls} ${compactStyles.controls} ${compactStyles.groupedSections}`}>
      <NpCollapsibleSection title={t('Appearance')}>
        <NpToggleRow title={t('Always dark')} checked={info.aboutTerminalAlwaysDark===true} onChange={aboutTerminalAlwaysDark=>onChange({aboutTerminalAlwaysDark})}/>
      </NpCollapsibleSection>
    </div>;
    // About me and its Index layout share one design: the only design-specific setting is which layout to draw.
    case 'about-me':
    case 'about-index': return <div className={`${styles.controls} ${compactStyles.controls} ${compactStyles.groupedSections}`}>
      <NpCollapsibleSection title={t('Layout')}>
        <div className={styles.settingsGroup}>
          <Choices<'classic'|'index'> label={t('Layout')} options={[{value:'classic',label:'Classic'},{value:'index',label:'Index'}]}
            value={info.design==='about-index'?'index':'classic'}
            // Only the design id changes: the title, subtitle, visibility switches and colours you set are kept.
            onChange={layout=>onChange({design:layout==='index'?'about-index':'about-me'})}
            glyph={value=><svg width="56" height="32" viewBox="0 0 56 32" fill="currentColor" aria-hidden>{value==='classic'
              ?<><rect x="3" y="4" width="23" height="11" rx="2" opacity=".28"/><rect x="30" y="4" width="23" height="11" rx="2" opacity=".28"/><rect x="3" y="18" width="23" height="11" rx="2" opacity=".28"/><rect x="30" y="18" width="23" height="11" rx="2" opacity=".28"/></>
              :<><rect x="3" y="5" width="6" height="2" rx="1"/><rect x="15" y="5" width="38" height="2" rx="1" opacity=".5"/><rect x="3" y="15" width="6" height="2" rx="1"/><rect x="15" y="15" width="30" height="2" rx="1" opacity=".5"/><rect x="3" y="25" width="6" height="2" rx="1"/><rect x="15" y="25" width="34" height="2" rx="1" opacity=".5"/></>}</svg>}/>
        </div>
      </NpCollapsibleSection>
    </div>;
  }
}
