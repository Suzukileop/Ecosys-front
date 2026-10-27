'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { NpCollapsibleSection, NpToggleRow } from './portfolio-nav-panel-ui';
import { Choices } from './portfolio-stack-progress-controls';
import { PORTFOLIO_INFO_ABOUT_SPLIT_PORTRAIT_SIDE_OPTIONS, resolveInfoPortraitGrayscale, type PortfolioInfoSectionSettings } from './portfolio-info-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-info-design-controls.module.css';
import { PortfolioSettingsPhotoField } from './portfolio-settings-photo-field';
import { usePortfolioDesignPreviewSource } from './PortfolioDesignLivePreview';

export function InfoSplitControls({info,onChange}:{info:PortfolioInfoSectionSettings;onChange:(patch:Partial<PortfolioInfoSectionSettings>)=>void}) {
  const t=useT();
  const previewSource=usePortfolioDesignPreviewSource();
  return <div className={`${styles.controls} ${compactStyles.controls} ${compactStyles.groupedSections}`}>
    <NpCollapsibleSection title={t('Portrait')}>
      <div className={styles.settingsGroup}>
      <Choices label={t('Portrait position')} options={PORTFOLIO_INFO_ABOUT_SPLIT_PORTRAIT_SIDE_OPTIONS} value={info.aboutSplitPortraitSide??'left'} onChange={aboutSplitPortraitSide=>onChange({aboutSplitPortraitSide})}
        glyph={value=><svg width="72" height="42" viewBox="0 0 72 42" fill="currentColor" aria-hidden>
          <rect x={value==='left'?3:45} y="3" width="24" height="36" rx="3" opacity=".18"/>
          <circle cx={value==='left'?15:57} cy="15" r="5"/>
          <path d={value==='left'?'M7 32v-3a8 8 0 0 1 16 0v3Z':'M49 32v-3a8 8 0 0 1 16 0v3Z'}/>
          {[10,19,28].map((y,i)=><rect key={y} x={value==='left'?34:3} y={y} width={i===0?34:26} height="3" rx="1" opacity={i===0?1:.5}/>)}
        </svg>}/>
      <NpToggleRow title={t('Black & white portrait')} checked={resolveInfoPortraitGrayscale(info)} onChange={infoPortraitGrayscale=>onChange({infoPortraitGrayscale})}/>
      <NpToggleRow title={t('Show name and role on portrait')} checked={info.aboutSplitPortraitCaptionEnabled!==false}
        onChange={aboutSplitPortraitCaptionEnabled=>onChange({aboutSplitPortraitCaptionEnabled})}/>
      </div>
    </NpCollapsibleSection>
    <NpCollapsibleSection title={t('Block titles')}>
      <div className={styles.settingsGroup}>
      <Choices<'standard'|'custom'> label={t('Block titles')} options={[{value:'standard',label:'Standard'},{value:'custom',label:'Custom'}]} value={info.aboutSplitLabelsMode??'standard'} onChange={aboutSplitLabelsMode=>onChange({aboutSplitLabelsMode})}
        glyph={value=><svg width="56" height="32" viewBox="0 0 56 32" fill="none" aria-hidden>{value==='standard'?<><path d="M6 8h44M6 16h32M6 24h38" stroke="currentColor" strokeWidth="3"/></>:<><rect x="3" y="5" width="50" height="23" rx="3" stroke="currentColor"/><path d="m20 22 2-6 13-12 4 4-13 12Z" fill="currentColor"/><path d="M10 22h6" stroke="currentColor" strokeWidth="2"/></>}</svg>}/>
      {info.aboutSplitLabelsMode==='custom'?<div className="flex flex-col gap-4">
        {(['Skills','Strengths','Languages'] as const).map((label,index)=>{
          const key=(['aboutSplitCustomSkillsLabel','aboutSplitCustomStrengthsLabel','aboutSplitCustomLanguagesLabel'] as const)[index];
          const visible=[info.showSkills!==false,info.showStrengths!==false,info.showLanguages!==false][index];
          if(!visible)return null;
          return <label key={key} className="np-field block"><span className="np-field-label">{t(label)}</span>
            <input className="np-input" value={info[key]??''} placeholder={t(label)} onChange={event=>onChange({[key]:event.target.value})}/></label>;
        })}
      </div>:null}
      </div>
    </NpCollapsibleSection>
  </div>;
}
