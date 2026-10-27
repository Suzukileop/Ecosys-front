import React,{Suspense} from 'react';
import {ContactDesignThumbnail} from '../components/portfolio/portfolio-contact-design-thumbnail';
import {portfolioEditorialGutterX} from '../components/portfolio/portfolio-editorial-layout';
import {createRoot} from 'react-dom/client';
import {EditorialContactSection} from '../components/portfolio/portfolio-section-contact';
import {DEFAULT_CONTACT_PRESENTATION} from '../components/portfolio/portfolio-contact-settings';
import {portfolioPaletteCssVars} from '../components/portfolio/portfolio-color-mode';
import {DEFAULT_HERO_PALETTE} from '../components/portfolio/portfolio-hero-palette-settings';
import {applyHeroPaletteToContact} from '../components/portfolio/portfolio-section-palette';
const root=createRoot(document.getElementById('root')!);
(window as any).designs=['editorial-focus','split-grid','liquid-distortion','sequential-reveal','studio-overlap','broken-grid','numbered-narrative','magnetic-overlap'];
(window as any).renderContact=(design:any,mode:'light'|'dark')=>{
const palette={...DEFAULT_HERO_PALETTE,...(mode==='light'?{fond:'#faf6ee',neutre:'#f1ede5',texteFort:'#201a10',texteMuted:'#6b6047',texteFaint:'#81755f',bordure:'#ded8cd'}:{fond:'#141414',neutre:'#202020',texteFort:'#f5f0e8',texteMuted:'#bbb4a7',texteFaint:'#aaa397',bordure:'#363636'})};
document.body.style.margin='0';document.body.style.background=palette.fond;
const presentation=applyHeroPaletteToContact({...DEFAULT_CONTACT_PRESENTATION,cardDesign:design,activeColorMode:mode,showSocialLinks:true,showLocation:true,sectionBackgroundEnabled:false,photoUrl:'/portfolio-previews/neutral-editorial.svg'},palette);
root.render(<Suspense fallback={<div data-pending=""/>}><div className={portfolioEditorialGutterX('medium')} style={{...portfolioPaletteCssVars(palette),background:palette.fond,color:palette.texteFort}}><EditorialContactSection pageNavigation email="hello@studio.design" phone="+33 6 12 34 56 78" locationLabel="Paris, France" links={['Instagram','GitHub'].map(label=>({id:label,label,url:'https://'+label.toLowerCase()+'.com',type:'SOCIAL',platform:label.toUpperCase()}))} ctaHref="mailto:hello@studio.design" heroImageUrl="/portfolio-previews/neutral-editorial.svg" heroImageAlt="" sectionTitle="Let's build something together." presentation={presentation} globalColorMode={mode} paletteCssVars={portfolioPaletteCssVars(palette)} contentGutter="medium" topSpacingClass="" bottomSpacingClass=""/></div></Suspense>);
};
(window as any).renderContact('editorial-focus','light');
(window as any).renderCatalog=(mode:'light'|'dark')=>root.render(<div style={{width:360}}>{(window as any).designs.map((design:any)=><button key={design} onClick={()=>{(window as any).picked=design;}}><ContactDesignThumbnail design={design} mode={mode} priority/>{design}</button>)}</div>);
