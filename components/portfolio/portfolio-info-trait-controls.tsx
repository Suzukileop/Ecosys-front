'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { NpCollapsibleSection, NpToggleRow } from './portfolio-nav-panel-ui';
import { Choices } from './portfolio-stack-progress-controls';
import { PORTFOLIO_INFO_EDUCATION_DISPLAY_OPTIONS, resolveInfoPortraitGrayscale, type PortfolioInfoSectionSettings } from './portfolio-info-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-info-design-controls.module.css';

export function InfoTraitControls({info,onChange}:{info:PortfolioInfoSectionSettings;onChange:(patch:Partial<PortfolioInfoSectionSettings>)=>void}) {
  const t=useT();
  return <div className={`${styles.controls} ${compactStyles.controls} ${compactStyles.groupedSections}`}>
    <NpCollapsibleSection title={t('Headline text')}>
      <div className={styles.settingsGroup}>
      <NpToggleRow title={t('Show large headline')} checked={info.aboutMeTraitHeadlineEnabled!==false} onChange={aboutMeTraitHeadlineEnabled=>onChange({aboutMeTraitHeadlineEnabled})}/>
      {info.aboutMeTraitHeadlineEnabled!==false?<label className="np-field block">
        <span className="np-field-label">{t('Headline text')}</span>
        <textarea value={info.aboutMeTraitHeadlineCustomText??''} placeholder={t('Turning Hard\nProblems Into\nSimple Software')} rows={3}
          className="np-input min-h-24 resize-y leading-relaxed" onChange={event=>onChange({aboutMeTraitHeadlineCustomText:event.target.value})}/>
      </label>:null}
      </div>
    </NpCollapsibleSection>
    <NpCollapsibleSection title={t('Portrait')}>
      <NpToggleRow title={t('Black & white portrait')} checked={resolveInfoPortraitGrayscale(info)} onChange={infoPortraitGrayscale=>onChange({infoPortraitGrayscale})}/>
    </NpCollapsibleSection>
    {info.showEducation!==false?<NpCollapsibleSection title={t('Education')}>
      <div className={styles.settingsGroup}>
      <Choices label={t('Education design')} options={PORTFOLIO_INFO_EDUCATION_DISPLAY_OPTIONS} value={info.educationDisplayStyle??'editorial'}
        onChange={educationDisplayStyle=>onChange({educationDisplayStyle})}
        glyph={value=><svg width="68" height="38" viewBox="0 0 68 38" fill="currentColor" aria-hidden>
          {value==='timeline'?<><path d="M10 4v30" stroke="currentColor" opacity=".4"/>{[7,18,29].map(y=><g key={y}><circle cx="10" cy={y} r="3"/><rect x="21" y={y-2} width="35" height="3" rx="1"/><rect x="21" y={y+3} width="23" height="2" opacity=".4"/></g>)}</>:value==='editorial'?<>{[5,16,27].map((y,i)=><g key={y}><rect x="4" y={y} width="12" height="5" opacity=".4"/><rect x="23" y={y} width={38-i*5} height="3"/><path d={`M4 ${y+8}h60`} stroke="currentColor" opacity=".25"/></g>)}</>:value==='panels'?<>{[3,36].map(x=><g key={x}><rect x={x} y="3" width="28" height="32" rx="3" fillOpacity=".12" stroke="currentColor"/><path d={`M${x+5} 13h18m-18 7h13m-13 6h16`} stroke="currentColor" strokeWidth="2"/></g>)}</>:<>{[0,1,2].map(i=><rect key={i} x={4+i*13} y={3+i*8} width="34" height="17" rx="2" fillOpacity=".15" stroke="currentColor"/>)}</>}
        </svg>}/>
      {(info.educationDisplayStyle??'editorial')==='cascade'?<NpToggleRow title={t('Cascade scroll animation')} checked={info.educationCascadeScrollShift===true} onChange={educationCascadeScrollShift=>onChange({educationCascadeScrollShift})}/>:null}
      </div>
    </NpCollapsibleSection>:null}
  </div>;
}
