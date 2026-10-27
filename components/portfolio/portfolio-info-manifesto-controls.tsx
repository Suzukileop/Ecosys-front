'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { NpCollapsibleSection, NpToggleRow } from './portfolio-nav-panel-ui';
import { Choices } from './portfolio-stack-progress-controls';
import { DEFAULT_INFO_SUBTITLE, PORTFOLIO_INFO_ABOUT_MANIFESTO_PORTRAIT_FRAME_OPTIONS, resolveInfoPortraitGrayscale, type PortfolioInfoSectionSettings } from './portfolio-info-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-info-design-controls.module.css';

export function InfoManifestoControls({info,onChange}:{info:PortfolioInfoSectionSettings;onChange:(patch:Partial<PortfolioInfoSectionSettings>)=>void}) {
  const t=useT();
  return <div className={`${styles.controls} ${compactStyles.controls} ${compactStyles.groupedSections}`}>
    <NpCollapsibleSection title={t('Statement text')}>
      <div className={styles.settingsGroup}>
      <label className="np-field block"><span className="np-field-label">{t('Statement text')}</span>
        <textarea value={info.subtitle} placeholder={DEFAULT_INFO_SUBTITLE} rows={3} className="np-input min-h-24 resize-y leading-relaxed" onChange={event=>onChange({subtitle:event.target.value})}/>
      </label>
      </div>
    </NpCollapsibleSection>
    <NpCollapsibleSection title={t('Portrait')}>
      <div className={styles.settingsGroup}>
      <Choices label={t('Portrait frame')} options={PORTFOLIO_INFO_ABOUT_MANIFESTO_PORTRAIT_FRAME_OPTIONS} columns={3} value={info.aboutManifestoPortraitFrame??'square'} onChange={aboutManifestoPortraitFrame=>onChange({aboutManifestoPortraitFrame})}
        glyph={value=><svg width="56" height="44" viewBox="0 0 56 44" fill="currentColor" aria-hidden>
          {value==='monogram'?<text x="28" y="31" textAnchor="middle" fontFamily="serif" fontSize="27">Aa</text>:<>
            {value==='circle'||value==='instagram'?<circle cx="28" cy="22" r={value==='instagram'?16:19} opacity=".15"/>:<rect x={value==='rectangle'?14:9} y="3" width={value==='rectangle'?28:38} height="38" opacity=".15"/>}
            {value==='instagram'?<circle cx="28" cy="22" r="20" fill="none" stroke="currentColor" strokeWidth="2"/>:null}
            <circle cx="28" cy="17" r="6"/><path d="M18 34v-4a10 10 0 0 1 20 0v4Z"/>
          </>}
        </svg>}/>
      {info.aboutManifestoPortraitFrame!=='monogram'?<NpToggleRow title={t('Black & white portrait')} checked={resolveInfoPortraitGrayscale(info)} onChange={infoPortraitGrayscale=>onChange({infoPortraitGrayscale})}/>:null}
      </div>
    </NpCollapsibleSection>
    <NpCollapsibleSection title={t('Animation')}>
      <NpToggleRow title={t('Scroll focus')} checked={info.aboutManifestoBlocksScrollFocus===true} onChange={aboutManifestoBlocksScrollFocus=>onChange({aboutManifestoBlocksScrollFocus})}/>
    </NpCollapsibleSection>
  </div>;
}
