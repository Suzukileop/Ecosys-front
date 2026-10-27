'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';
import { WorkContentLabels } from './portfolio-work-content-labels';
import { WorkButtonStylePreview } from './portfolio-work-button-style-preview';
import type { CSSProperties } from 'react';

import { useT } from '@/lib/i18n/I18nProvider';
import { Choices } from './portfolio-stack-progress-controls';
import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import { DEFAULT_PROJECTS_BOARD_SETTINGS, PORTFOLIO_WORK_PROJECTS_BOARD_THUMBNAIL_SIZE_OPTIONS, type PortfolioWorkSectionSettings } from './portfolio-work-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-work-ledger-controls.module.css';
import { DEFAULT_HERO_PALETTE, mergeHeroPalette, resolveHeroPaletteColor } from './portfolio-hero-palette-settings';
import { usePortfolioDesignPreviewSource } from './PortfolioDesignLivePreview';
import { resolveThumbnailTheme } from './portfolio-thumbnail-theme';
import { resolveWorkReadingPresentation } from './portfolio-work-resolved-palette';

export function WorkBoardControls({work,onChange}:{work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void}) {
  const t=useT();
  const board={...DEFAULT_PROJECTS_BOARD_SETTINGS,...work.projectsBoard};
  const singleThumbnail=board.showThumbnail&&(board.columnsPerRow??2)===1;
  const bareImage=singleThumbnail&&board.singleColumnImageFit==='contain';
  const previewSource=usePortfolioDesignPreviewSource();
  const palette=previewSource
    ? resolveWorkReadingPresentation(work,previewSource.settings.global,resolveThumbnailTheme(previewSource.settings.global,work).palette).presentation.workPalette!
    : mergeHeroPalette(DEFAULT_HERO_PALETTE,work.workPalette);
  const size=PORTFOLIO_WORK_PROJECTS_BOARD_THUMBNAIL_SIZE_OPTIONS.find(option=>option.value===(board.thumbnailSize??'standard'))??PORTFOLIO_WORK_PROJECTS_BOARD_THUMBNAIL_SIZE_OPTIONS[0];
  return <div className={`${styles.controls} ${compactStyles.controls}`}>
    <SettingsControlSection title={t('Layout')} className={styles.settingsGroup}>
      
      <Choices<'1'|'2'|'3'|'4'> label={t('Cards per row (desktop)')} columns={4}
        options={[1,2,3,4].map(value=>({value:String(value) as '1'|'2'|'3'|'4',label:String(value)}))}
        value={String(board.columnsPerRow??2) as '1'|'2'|'3'|'4'} onChange={value=>onChange({projectsBoard:{...board,columnsPerRow:Number(value) as 1|2|3|4}})}
        glyph={value=><svg width="52" height="30" viewBox="0 0 52 30" fill="currentColor" aria-hidden>{Array.from({length:Number(value)},(_,index)=><rect key={index} x={index*52/Number(value)} y="3" width={52/Number(value)-3} height="24" rx="2"/>)}</svg>}/>
      {singleThumbnail?<div className="np-text-size-slider"><HeaderSteppedSlider label={t('Thumbnail size')}
        steps={PORTFOLIO_WORK_PROJECTS_BOARD_THUMBNAIL_SIZE_OPTIONS.map(option=>({value:option.value,tick:t(option.label)}))}
        value={size.value} currentName={t(size.label)} onChange={thumbnailSize=>onChange({projectsBoard:{...board,thumbnailSize}})}/></div>:null}
      {singleThumbnail?<Choices<'cover'|'contain'> label={t('Image fit')} options={[{value:'cover',label:'Fill frame'},{value:'contain',label:'Entire image'}]} value={board.singleColumnImageFit??'cover'} onChange={singleColumnImageFit=>onChange({projectsBoard:{...board,singleColumnImageFit}})}
        glyph={value=><svg width="70" height="42" viewBox="0 0 70 42" fill="none" aria-hidden><rect x="3" y="3" width="64" height="36" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x={value==='contain'?17:4} y="4" width={value==='contain'?36:62} height="34" fill="currentColor" fillOpacity=".18"/><path d={value==='contain'?'m19 30 9-13 9 8 7-10 7 15Z':'m5 33 17-19 14 11 13-16 16 24Z'} fill="currentColor" opacity=".65"/></svg>}/>:null}
    </SettingsControlSection>
    {!bareImage?<SettingsControlSection title={t('Appearance')} className={styles.settingsGroup}>
      
      <Choices<'principal'|'secondaire'|'neutre'> label={t('Information background')} columns={3} options={[{value:'principal',label:'Primary'},{value:'secondaire',label:'Secondary'},{value:'neutre',label:'Neutral'}]} value={board.infoBackground??'neutre'} onChange={infoBackground=>onChange({projectsBoard:{...board,infoBackground}})}
        glyph={value=><svg width="54" height="38" viewBox="0 0 54 38" aria-hidden><rect x="2" y="2" width="50" height="34" rx="4" fill={resolveHeroPaletteColor(palette,value)} stroke="currentColor" strokeOpacity=".35"/></svg>}/>
      <label className="np-field block">
        <span className="flex items-center justify-between gap-4"><span className="np-field-label">{t('Opacity')}</span><output className="text-xs tabular-nums text-[var(--np-muted)]">{board.infoBackgroundOpacity??100}%</output></span>
        <input type="range" min={0} max={100} step={5} value={board.infoBackgroundOpacity??100} aria-label={t('Information background')+' — '+t('Opacity')} className="np-range mt-3 w-full" style={{'--np-fill':`${board.infoBackgroundOpacity??100}%`} as CSSProperties} onChange={event=>onChange({projectsBoard:{...board,infoBackgroundOpacity:Number(event.target.value)}})}/>
      </label>
      <Choices<'0'|'1'|'2'|'3'> label={t('Border width')} columns={4} options={[{value:'0',label:'None'},{value:'1',label:'1 px'},{value:'2',label:'2 px'},{value:'3',label:'3 px'}]} value={String(board.borderWidth??1) as '0'|'1'|'2'|'3'} onChange={value=>onChange({projectsBoard:{...board,borderWidth:Number(value)}})} glyph={value=><svg width="54" height="36" viewBox="0 0 54 36" fill="none" aria-hidden><rect x="5" y="5" width="44" height="26" rx="4" stroke="currentColor" strokeWidth={Number(value)||1} strokeDasharray={value==='0'?'3 4':undefined} opacity={value==='0'?.3:1}/></svg>}/>
      {(board.borderWidth??1)>0?<Choices<'bordure'|'principal'|'secondaire'|'texteFort'> label={t('Border color')} columns={4} options={[{value:'bordure',label:'Default'},{value:'principal',label:'Primary'},{value:'secondaire',label:'Secondary'},{value:'texteFort',label:'Strong text'}]} value={board.borderColorToken??'bordure'} onChange={borderColorToken=>onChange({projectsBoard:{...board,borderColorToken}})} glyph={value=><svg width="44" height="32" viewBox="0 0 44 32" aria-hidden><circle cx="22" cy="16" r="10" fill={resolveHeroPaletteColor(palette,value)} stroke="currentColor" strokeOpacity=".3"/></svg>}/>:null}
    </SettingsControlSection>:null}
    {board.showConsultOnHover?<SettingsControlSection title={t('Case study link')} className={styles.settingsGroup}>
      
      <WorkContentLabels work={work} onChange={onChange} scope="consult"/>
      <Choices<'underline'|'outline'|'solid'|'pill'> label={t('Button style')} hideOptionLabels columns={2}
        options={[{value:'underline',label:'Underline'},{value:'outline',label:'Outline'},{value:'solid',label:'Solid'},{value:'pill',label:'Pill'}]}
        value={board.consultStyle??'underline'} onChange={consultStyle=>onChange({projectsBoard:{...board,consultStyle}})}
        glyph={value=><WorkButtonStylePreview variant={value} label={board.consultLabel?.trim()||t('View project')}/>}/>
      <Choices<'always'|'hover'> label={t('Display')} options={[{value:'always',label:'Always visible'},{value:'hover',label:'On hover'}]} value={board.consultDisplay??'always'} onChange={consultDisplay=>onChange({projectsBoard:{...board,consultDisplay}})}
        glyph={value=><svg width="56" height="30" viewBox="0 0 56 30" fill="none" aria-hidden><path d="M8 15h32m-7-6 7 6-7 6" stroke="currentColor" strokeWidth="2" strokeDasharray={value==='hover'?'4 3':undefined}/></svg>}/>
      
    </SettingsControlSection>:null}
  </div>;
}
