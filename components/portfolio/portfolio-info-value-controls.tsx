'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { NpCollapsibleSection, NpToggleRow } from './portfolio-nav-panel-ui';
import { Choices } from './portfolio-stack-progress-controls';
import { HeaderSteppedSlider, HeaderColorRow } from './portfolio-header-style-controls';
import {
  PORTFOLIO_INFO_ABOUT_VALUE_STEPS_VALUES_LAYOUT_OPTIONS, PORTFOLIO_INFO_ABOUT_VALUE_STEPS_MARKER_OPTIONS,
  PORTFOLIO_INFO_ABOUT_VALUE_LIST_MARKER_STYLE_OPTIONS, PORTFOLIO_INFO_ABOUT_VALUE_STEPS_INTRO_STYLE_OPTIONS,
  PORTFOLIO_INFO_ABOUT_VALUE_STEPS_INTRO_SIZE_OPTIONS, INFO_HEADER_PALETTE_TOKEN_OPTIONS, infoHeaderPaletteTokenColor,
  resolveInfoAboutValueValuesLayout, resolveInfoPortraitGrayscale, type PortfolioInfoSectionSettings,
} from './portfolio-info-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-info-design-controls.module.css';

export function InfoValueControls({info,onChange}:{info:PortfolioInfoSectionSettings;onChange:(patch:Partial<PortfolioInfoSectionSettings>)=>void}) {
  const t=useT();
  const layout=resolveInfoAboutValueValuesLayout(info);
  const size=PORTFOLIO_INFO_ABOUT_VALUE_STEPS_INTRO_SIZE_OPTIONS.find(option=>option.value===(info.aboutValueStepsIntroSize??'md'))!;
  return <div className={`${styles.controls} ${compactStyles.controls} ${compactStyles.groupedSections}`}>
    <NpCollapsibleSection title={t('Portrait')}>
      <NpToggleRow title={t('Black & white portrait')} checked={resolveInfoPortraitGrayscale(info)} onChange={infoPortraitGrayscale=>onChange({infoPortraitGrayscale})}/>
    </NpCollapsibleSection>
    <NpCollapsibleSection title={t('Values display')}>
      <div className={styles.settingsGroup}>
      <Choices label={t('Values display')} options={PORTFOLIO_INFO_ABOUT_VALUE_STEPS_VALUES_LAYOUT_OPTIONS} value={layout} onChange={aboutValueValuesLayout=>onChange({aboutValueValuesLayout})}
        glyph={value=><svg width="68" height="40" viewBox="0 0 68 40" fill="currentColor" aria-hidden>
          {value==='numbered-grid'?<>{[0,1,2,3].map(i=><g key={i}><rect x={3+i%2*34} y={3+Math.floor(i/2)*20} width="28" height="15" rx="2" opacity=".12"/><text x={6+i%2*34} y={14+Math.floor(i/2)*20} fontSize="9">0{i+1}</text></g>)}</>:value==='value-steps'?<><rect x="41" y="3" width="24" height="34" opacity=".12"/>{[0,1,2].map(i=><g key={i}><text x="2" y={11+i*12} fontSize="9">0{i+1}</text><rect x="17" y={5+i*12} width="18" height="3"/></g>)}</>:<>{[0,1,2].map(i=><g key={i}>{value==='indexed-list'?<text x="3" y={11+i*12} fontSize="8">0{i+1}</text>:<circle cx="6" cy={8+i*12} r="2"/>}<rect x="17" y={6+i*12} width={43-i*5} height="3"/><path d={`M3 ${14+i*12}h62`} stroke="currentColor" opacity=".2"/></g>)}</>}
        </svg>}/>
      {layout==='value-steps'?<Choices label={t('Step marker')} options={PORTFOLIO_INFO_ABOUT_VALUE_STEPS_MARKER_OPTIONS} columns={3} value={info.aboutValueStepsMarker??'number'} onChange={aboutValueStepsMarker=>onChange({aboutValueStepsMarker})}
        glyph={value=><span aria-hidden style={{fontSize:24,lineHeight:1.2}}>{PORTFOLIO_INFO_ABOUT_VALUE_STEPS_MARKER_OPTIONS.find(option=>option.value===value)?.preview}</span>}/>:null}
      {layout==='editorial'?<Choices label={t('List bullets')} options={PORTFOLIO_INFO_ABOUT_VALUE_LIST_MARKER_STYLE_OPTIONS} columns={3} value={info.aboutValueListMarkerStyle??'dot'} onChange={aboutValueListMarkerStyle=>onChange({aboutValueListMarkerStyle})}
        glyph={value=><span aria-hidden style={{fontSize:24,lineHeight:1.2}}>{PORTFOLIO_INFO_ABOUT_VALUE_LIST_MARKER_STYLE_OPTIONS.find(option=>option.value===value)?.preview}</span>}/>:null}
      </div>
    </NpCollapsibleSection>
    <NpCollapsibleSection title={t('Intro text')}>
      <div className={styles.settingsGroup}>
      <NpToggleRow title={t('Show intro')} checked={info.aboutValueStepsIntroEnabled!==false} onChange={aboutValueStepsIntroEnabled=>onChange({aboutValueStepsIntroEnabled})}/>
      {info.aboutValueStepsIntroEnabled!==false?<>
        <label className="np-field block"><span className="np-field-label">{t('Intro text')}</span>
          <textarea value={[info.aboutValueStepsIntroParagraph1,info.aboutValueStepsIntroParagraph2].filter(Boolean).join('\n\n')} placeholder={t('Intro text — paragraph 1.\n\nIntro text — paragraph 2.')} rows={5} className="np-input min-h-32 resize-y leading-relaxed"
            onChange={event=>{const raw=event.target.value;const separator=raw.match(/\n{2,}/);onChange({aboutValueStepsIntroParagraph1:separator?raw.slice(0,separator.index):raw,aboutValueStepsIntroParagraph2:separator?raw.slice((separator.index??0)+separator[0].length):''});}}/>
        </label>
        <Choices label={t('Intro style')} options={PORTFOLIO_INFO_ABOUT_VALUE_STEPS_INTRO_STYLE_OPTIONS} columns={3} value={info.aboutValueStepsIntroStyle??'italic-serif'} onChange={aboutValueStepsIntroStyle=>onChange({aboutValueStepsIntroStyle})}
          glyph={value=><span aria-hidden style={{fontSize:26,fontFamily:value==='sans'?'sans-serif':'serif',fontStyle:value==='italic-serif'?'italic':'normal'}}>Aa</span>}/>
        <div className="np-text-size-slider"><HeaderSteppedSlider label={t('Intro size')} value={size.value} currentName={t(size.label)} steps={PORTFOLIO_INFO_ABOUT_VALUE_STEPS_INTRO_SIZE_OPTIONS.map((option,index)=>({value:option.value,tick:['S','M','L','XL'][index]}))} onChange={aboutValueStepsIntroSize=>onChange({aboutValueStepsIntroSize})}/></div>
        <HeaderColorRow label={t('Intro color')} value={info.aboutValueStepsIntroColor??'texteFort'} options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map(option=>({...option,label:t(option.label)}))} resolveColor={infoHeaderPaletteTokenColor} onChange={aboutValueStepsIntroColor=>onChange({aboutValueStepsIntroColor})}/>
      </>:null}
      </div>
    </NpCollapsibleSection>
  </div>;
}
