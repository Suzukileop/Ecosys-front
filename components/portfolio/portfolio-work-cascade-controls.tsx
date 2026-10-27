'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';
import { WorkContentLabels } from './portfolio-work-content-labels';
import type { CSSProperties } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import { Choices } from './portfolio-stack-progress-controls';
import { ColorSwatchRow } from './portfolio-color-swatch-row';
import { resolveHeroPaletteColor } from './portfolio-hero-palette-settings';
import { PORTFOLIO_WORK_SPEC_META_COLOR_OPTIONS } from './portfolio-work-settings';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import { DEFAULT_PROJECTS_CASCADE_SETTINGS, PORTFOLIO_WORK_CASCADE_CARD_WIDTH_OPTIONS, PORTFOLIO_WORK_CASCADE_VERTICAL_GAP_OPTIONS, PORTFOLIO_WORK_CASCADE_IMAGE_RADIUS_OPTIONS, PORTFOLIO_WORK_CASCADE_CARD_HEIGHT_OPTIONS, type PortfolioWorkSectionSettings } from './portfolio-work-settings';
import { WorkButtonStylePreview } from './portfolio-work-button-style-preview';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-work-ledger-controls.module.css';
import choiceStyles from './portfolio-work-spec-controls.module.css';

export function WorkCascadeControls({work,onChange}:{work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void}) {
  const t=useT();
  const theme=useThumbnailTheme('work');
  const settings={...DEFAULT_PROJECTS_CASCADE_SETTINGS,...work.projectsCascade};
  const size=PORTFOLIO_WORK_CASCADE_CARD_HEIGHT_OPTIONS.find(option=>option.value===settings.cardHeight)!;
  const metaSwatch={muted:theme.muted,principal:resolveHeroPaletteColor(theme.palette,'principal'),secondaire:resolveHeroPaletteColor(theme.palette,'secondaire')};
  const metaOptions=PORTFOLIO_WORK_SPEC_META_COLOR_OPTIONS.map(option=>({value:option.value,label:t(option.label),color:metaSwatch[option.value]}));
  return <div className={`${styles.controls} ${compactStyles.controls} ${choiceStyles.controls}`}>
    <SettingsControlSection title={t('Layout')} className={styles.settingsGroup}>
      
      <Choices label={t('Card width')} options={PORTFOLIO_WORK_CASCADE_CARD_WIDTH_OPTIONS} columns={3} value={settings.cardWidth} onChange={cardWidth=>onChange({projectsCascade:{...settings,cardWidth}})} glyph={(_,index)=><svg width="62" height="40" viewBox="0 0 62 40" fill="none" aria-hidden><path d="M1 38h60" stroke="currentColor" opacity=".2"/><rect x={[19,10,2][index]} y="4" width={[24,42,58][index]} height="28" rx="2" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeOpacity=".7" strokeWidth="1.5"/></svg>}/>
      <Choices label={t('Vertical rhythm')} options={PORTFOLIO_WORK_CASCADE_VERTICAL_GAP_OPTIONS} columns={3} value={settings.verticalGap} onChange={verticalGap=>onChange({projectsCascade:{...settings,verticalGap}})} glyph={(_,index)=><svg width="38" height="34" viewBox="0 0 38 34" fill="currentColor" aria-hidden>{[-1,0,1].map(i=><rect key={i} x="4" y={15+i*[5,9,13][index]} width="30" height="3" rx="1"/>)}</svg>}/>
      <NpToggleRow title={t('Equal card height')} checked={settings.equalHeight} onChange={equalHeight=>onChange({projectsCascade:{...settings,equalHeight}})}/>
      <NpToggleRow title={t('Scroll cascade effect')} checked={settings.stackEffect!=='static'} onChange={enabled=>onChange({projectsCascade:{...settings,stackEffect:enabled?'cascade':'static'}})}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Thumbnail')} className={styles.settingsGroup}>
      
      <div className="np-text-size-slider"><HeaderSteppedSlider label={t('Thumbnail height')} value={size.value} currentName={t(size.label)} steps={PORTFOLIO_WORK_CASCADE_CARD_HEIGHT_OPTIONS.map((option,index)=>({value:option.value,tick:['S','M','L','XL'][index]}))} onChange={cardHeight=>onChange({projectsCascade:{...settings,cardHeight}})}/></div>
      <Choices label={t('Thumbnail radius')} options={PORTFOLIO_WORK_CASCADE_IMAGE_RADIUS_OPTIONS} columns={3} value={settings.imageRadius} onChange={imageRadius=>onChange({projectsCascade:{...settings,imageRadius}})} glyph={value=><svg width="56" height="38" viewBox="0 0 56 38" fill="none" aria-hidden><rect x="3" y="3" width="50" height="32" rx={value==='none'?0:value==='md'?6:13} stroke="currentColor" strokeOpacity=".7" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/></svg>}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Typography')} className={styles.settingsGroup}>
      
      <div className="np-field np-text-size-slider block">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="cascade-title-size" className="np-field-label">{t('Title size')}</label>
          <span className="text-xs text-neutral-400">{settings.titleSize==null?t('Auto'):`${settings.titleSize} px`}</span>
        </div>
        <input id="cascade-title-size" type="range" min={24} max={120} step={1} value={settings.titleSize??60} className="pf-exp-centered-slider pf-exp-centered-slider--thick"
          style={{'--pf-exp-slider-fill':`${((settings.titleSize??60)-24)/96*100}%`} as CSSProperties}
          onChange={event=>onChange({projectsCascade:{...settings,titleSize:Number(event.target.value)}})}/>
        <button type="button" className="mt-2 text-xs text-neutral-400 hover:text-white disabled:opacity-40" disabled={settings.titleSize==null}
          onClick={()=>onChange({projectsCascade:{...settings,titleSize:null}})}>{t('Auto')}</button>
      </div>
      <ColorSwatchRow label={t('Category color')} value={settings.categoryColor} onChange={categoryColor=>onChange({projectsCascade:{...settings,categoryColor:categoryColor as typeof settings.categoryColor}})} options={metaOptions}/>
      <ColorSwatchRow label={t('Role color')} value={settings.roleColor} onChange={roleColor=>onChange({projectsCascade:{...settings,roleColor:roleColor as typeof settings.roleColor}})} options={metaOptions}/>
    </SettingsControlSection>
    {settings.showLink?<SettingsControlSection title={t('Consult link')} className={styles.settingsGroup}>
      
      <WorkContentLabels work={work} onChange={onChange} scope="consult"/>
      <Choices<'text'|'underline'|'outline'|'solid'|'pill'> label={t('Button style')} hideOptionLabels columns={2}
        options={[{value:'text',label:msg('Animated text')},{value:'underline',label:'Underline'},{value:'outline',label:'Outline'},{value:'solid',label:'Solid'},{value:'pill',label:'Pill'}]}
        value={settings.linkStyle} onChange={linkStyle=>onChange({projectsCascade:{...settings,linkStyle}})}
        glyph={value=><WorkButtonStylePreview variant={value} label={settings.linkLabel?.trim()||t('View project')}/>}/>
      
    </SettingsControlSection>:null}
  </div>;
}
