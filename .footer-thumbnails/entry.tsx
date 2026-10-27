import React,{Suspense} from 'react';
import {applyHeroPaletteToFooter} from '../components/portfolio/portfolio-section-palette';
import {FooterDesignThumbnail} from '../components/portfolio/portfolio-footer-design-thumbnail';
import {createRoot} from 'react-dom/client';
import {EditorialPortfolioFooter} from '../components/portfolio/portfolio-section-footer';
import {DEFAULT_FOOTER_PRESENTATION,PORTFOLIO_FOOTER_DESIGN_OPTIONS} from '../components/portfolio/portfolio-footer-settings';
import {portfolioPaletteCssVars} from '../components/portfolio/portfolio-color-mode';
import {DEFAULT_HERO_PALETTE} from '../components/portfolio/portfolio-hero-palette-settings';
const root=createRoot(document.getElementById('root')!);
(window as any).designs=PORTFOLIO_FOOTER_DESIGN_OPTIONS.map(x=>x.value);
(window as any).renderFooter=(design:any,mode:'light'|'dark')=>{
const palette={...DEFAULT_HERO_PALETTE,...(mode==='light'?{fond:'#faf6ee',neutre:'#f1ede5',texteFort:'#201a10',texteMuted:'#6b6047',texteFaint:'#81755f',bordure:'#ded8cd'}:{fond:'#141414',neutre:'#202020',texteFort:'#f5f0e8',texteMuted:'#bbb4a7',texteFaint:'#aaa397',bordure:'#363636'})};
document.body.style.margin='0';document.body.style.background=palette.fond;
root.render(<Suspense fallback={<div data-pending=""/>}><div style={{...portfolioPaletteCssVars(palette),background:palette.fond,color:palette.texteFort}}><EditorialPortfolioFooter creatorName="Alex Morgan" creatorId="preview" avatarUrl="/portfolio-previews/neutral-editorial.svg" bio="Designer et développeur indépendant. Je crée des expériences numériques claires, utiles et soignées." email="hello@alexmorgan.studio" phone="+33 6 12 34 56 78" locationLabel="Paris, France" hoursLabel="Mon–Fri, 9:00–18:00" links={['TIKTOK','FACEBOOK','YOUTUBE','GITHUB'].map(platform=>({id:platform,label:platform,url:'https://'+platform.toLowerCase()+'.com',type:'SOCIAL',platform}))} contentClassName="mx-auto w-full px-12" presentation={applyHeroPaletteToFooter({...DEFAULT_FOOTER_PRESENTATION,design,activeColorMode:mode,sectionBackgroundEnabled:false,showAvatar:true,showDescription:true,showLocation:true,showHours:true},palette)} globalColorMode={mode} contentGutter="medium" motionProfile="none" sectionPalette={palette} profileVisits={0} sectionLinkOptions={['Work','Services','Team','Gallery'].map(label=>({id:label.toLowerCase(),label,href:'#'+label.toLowerCase()}))}/></div></Suspense>);
};
(window as any).renderFooter('centered-minimal','light');
(window as any).renderCatalog=(mode:'light'|'dark')=>root.render(<div style={{width:360}}>{PORTFOLIO_FOOTER_DESIGN_OPTIONS.map(x=><button key={x.value} onClick={()=>{(window as any).picked=x.value;}}><FooterDesignThumbnail design={x.value} mode={mode} priority/>{x.label}</button>)}</div>);
