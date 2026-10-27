import React from 'react';
import {PortfolioHeroIdentityIndex} from '../components/portfolio/hero-variants/PortfolioHeroIdentityIndex';
import {resolveHeroGreeting,mergeHeroHeadlineSettings,DEFAULT_HERO_HEADLINE_SETTINGS} from '../components/portfolio/portfolio-hero-headline-settings';
import {mergeGlobalSettings} from '../components/portfolio/portfolio-global-settings';
import {PortfolioSmoothScroll} from '../components/portfolio/portfolio-smooth-scroll';
import {heroSectionBackgroundFields,patchHeroSectionBackground} from '../components/portfolio/portfolio-hero-section-background';
import {mergeHeroPresentation,DEFAULT_HERO_PRESENTATION} from '../components/portfolio/portfolio-hero-settings';
import {applyActivePortfolioPalette} from '../components/portfolio/portfolio-color-mode';
import {sectionFamilyPalette} from '../components/portfolio/portfolio-section-palette-family';
import {HeroSettingsPanel} from '../components/portfolio/portfolio-hero-settings-panel';
import {StackSettingsPanel} from '../components/portfolio/portfolio-stack-settings-panel';
import {InfoSettingsPanel} from '../components/portfolio/portfolio-info-settings-panel';
import {ServicesSettingsPanel} from '../components/portfolio/portfolio-services-settings-panel';
import {AboutUsSettingsPanel} from '../components/portfolio/portfolio-about-us-settings-panel';
import {createDefaultPortfolioSettings} from '../components/portfolio/portfolio-settings-types';
import {DEFAULT_STACK_PRESENTATION} from '../components/portfolio/portfolio-stack-settings';
import {DEFAULT_INFO_PRESENTATION} from '../components/portfolio/portfolio-info-settings';
import {DEFAULT_SERVICES_PRESENTATION} from '../components/portfolio/portfolio-services-settings';
import {DEFAULT_ABOUT_US_PRESENTATION} from '../components/portfolio/portfolio-about-us-settings';
import {ToolsSettingsPanel} from '../components/portfolio/portfolio-tools-settings-panel';
import {DEFAULT_TOOLS_PRESENTATION} from '../components/portfolio/portfolio-tools-settings';
import {WorkSettingsPanel} from '../components/portfolio/portfolio-work-settings-panel';
import {DEFAULT_WORK_PRESENTATION} from '../components/portfolio/portfolio-work-settings';
import {ExperienceSettingsPanel} from '../components/portfolio/portfolio-experience-settings-panel';
import {DEFAULT_EXPERIENCE_PRESENTATION} from '../components/portfolio/portfolio-experience-settings';
import {FaqSettingsPanel} from '../components/portfolio/portfolio-faq-settings-panel';
import {ContactSettingsPanel} from '../components/portfolio/portfolio-contact-settings-panel';
import {FooterSettingsPanel} from '../components/portfolio/portfolio-footer-settings-panel';
import {DEFAULT_FAQ_PRESENTATION} from '../components/portfolio/portfolio-faq-settings';
import {DEFAULT_CONTACT_PRESENTATION} from '../components/portfolio/portfolio-contact-settings';
import {DEFAULT_FOOTER_PRESENTATION} from '../components/portfolio/portfolio-footer-settings';
import {TeamSettingsPanel} from '../components/portfolio/portfolio-team-settings-panel';
import {GallerySettingsPanel} from '../components/portfolio/portfolio-gallery-settings-panel';
import {DEFAULT_TEAM_PRESENTATION} from '../components/portfolio/portfolio-team-settings';
import {flushSync} from 'react-dom';
import {TeamPortraitThumbnailFrame} from '../components/portfolio/portfolio-team-portrait-thumbnail-frame';
import {TeamSpotlightThumbnailFrame} from '../components/portfolio/portfolio-team-spotlight-thumbnail-frame';
import {TeamSplitScreenThumbnailFrame} from '../components/portfolio/portfolio-team-split-screen-thumbnail-frame';
import {TeamEditorialRhythmThumbnailFrame} from '../components/portfolio/portfolio-team-editorial-rhythm-thumbnail-frame';
import {TeamDirectoryThumbnailFrame} from '../components/portfolio/portfolio-team-directory-thumbnail-frame';
import {GalleryFloatingThumbnailFrame} from '../components/portfolio/portfolio-gallery-floating-thumbnail-frame';
import {GalleryFramedGridOption} from '../components/portfolio/gallery-framed-grid-option';
import {LayoutOptionSchematic} from '../components/portfolio/layout-option-schematic';
import {PORTFOLIO_TEAM_LAYOUT_OPTIONS} from '../components/portfolio/portfolio-team-settings';
import {PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS} from '../components/portfolio/portfolio-experience-settings';
import {GalleryDesignThumbnail} from '../components/portfolio/portfolio-gallery-design-thumbnail';
import {createRoot} from 'react-dom/client';
import {EditorialGallerySection} from '../components/portfolio/portfolio-section-gallery';
import {DEFAULT_GALLERY_PRESENTATION,PORTFOLIO_GALLERY_DESIGN_OPTIONS,mergeGalleryPresentation} from '../components/portfolio/portfolio-gallery-settings';
const root=createRoot(document.getElementById('root')!);
(window as any).renderIdentityStatus=(show=true,available=true)=>{
 const presentation={...DEFAULT_HERO_PRESENTATION,heroBannerDesign:'identity-index',showAvailabilityBadge:show,heroIdentityIndexSpecialtyLabel:'Expertise',heroIdentityIndexAvailabilityLabel:'Statut',heroIdentityIndexExperienceLabel:'Parcours',availabilityLabel:'Ouvert aux projets',availabilityUnavailableLabel:'Non disponible'};
 flushSync(()=>root.render(<div id="hero" data-availability-hidden={show?undefined:'true'}><PortfolioHeroIdentityIndex data={{presentation,fullName:'Alex Morgan',specialite:'Developer',isAvailable:available,yearsOfExperience:8,stats:[],description:'Profile preview',socialLinks:[],tools:[],navItems:[]} as any}/></div>));
};
function IdentitySettingsFixture(){
 const [hero,setHero]=React.useState({...createDefaultPortfolioSettings().hero,heroBannerDesign:'identity-index' as const});
 return <div style={{width:400}}><HeroSettingsPanel hero={hero} availableTools={[]} subSection="banner" onChange={patch=>setHero(previous=>({...previous,...patch}))}/></div>;
}
(window as any).renderIdentitySettings=()=>flushSync(()=>root.render(<IdentitySettingsFixture/>));
(window as any).checkGreetings=()=>{
 const designs=['editorial-rail','statement-cta','portrait-balance','left-portrait','circle-portrait','experience-split','editorial-overlap','studio-split','work-duo'];
 const overrides=Object.fromEntries(designs.map(design=>[design,design+' Bonjour {name}, {specialty}']));
 const merged=mergeHeroHeadlineSettings(DEFAULT_HERO_HEADLINE_SETTINGS,{heroGreetingOverrides:overrides});
 return {results:designs.map(heroBannerDesign=>resolveHeroGreeting({...merged,heroBannerDesign},'original','Alex','Designer')),empty:resolveHeroGreeting({heroBannerDesign:'editorial-rail',heroGreetingOverrides:{'editorial-rail':'  '}},'original','Alex'),bounded:mergeHeroHeadlineSettings(merged,{heroGreetingOverrides:{'editorial-rail':'x'.repeat(800),invalid:99}}),saved:mergeHeroPresentation(DEFAULT_HERO_PRESENTATION,{heroGreetingOverrides:overrides}).heroGreetingOverrides};
};
function GreetingFixture(){
 const [hero,setHero]=React.useState({...createDefaultPortfolioSettings().hero,heroBannerDesign:'editorial-rail' as const});
 return <div style={{width:400}}><HeroSettingsPanel hero={hero} availableTools={[]} subSection="banner" onChange={patch=>setHero(previous=>({...previous,...patch}))}/></div>;
}
(window as any).renderGreeting=()=>flushSync(()=>root.render(<GreetingFixture/>));
(window as any).checkScrollSettings=()=>{const base=createDefaultPortfolioSettings().global;return {defaults:base,valid:mergeGlobalSettings(base,{smoothScrollEnabled:true,smoothScrollSoftness:80,smoothScrollWheelSpeed:125}),invalid:mergeGlobalSettings(base,{smoothScrollSoftness:Infinity,smoothScrollWheelSpeed:900})};};
(window as any).renderSmoothScroll=(enabled=true,pages=false)=>flushSync(()=>root.render(<div><PortfolioSmoothScroll enabled={enabled} softness={80} wheelSpeed={100} pages={pages}/>{pages?<div data-pf-pages-scroll="active" style={{height:500,overflowY:'auto'}}><div style={{height:4000}}>Pages content</div></div>:<div style={{height:4000}}>Long portfolio</div>}</div>));
function HeroBackgroundFixture(){
 const [hero,setHero]=React.useState(createDefaultPortfolioSettings().hero);
 return <div style={{width:400}}><HeroSettingsPanel hero={hero} availableTools={[]} subSection="background" onChange={patch=>setHero(previous=>({...previous,...patch}))}/></div>;
}
(window as any).renderHeroBackground=()=>flushSync(()=>root.render(<HeroBackgroundFixture/>));
(window as any).checkHeroBackground=()=>{
 let hero={...DEFAULT_HERO_PRESENTATION,heroSectionBackgroundFill:'gradient' as const,heroSectionBackgroundGradientAngle:37,heroSectionBackgroundGradientFrom:'#123456'};
 const original=heroSectionBackgroundFields(hero);
 const off={...hero,...patchHeroSectionBackground(hero,{sectionBackgroundEnabled:false})};
 const on={...off,...patchHeroSectionBackground(off,{sectionBackgroundEnabled:true})};
 const saved=mergeHeroPresentation(DEFAULT_HERO_PRESENTATION,{...on,heroSectionBackgroundEdgeFade:true,paletteFamily:'indigo'});
 const settings=createDefaultPortfolioSettings();settings.hero={...settings.hero,...saved};
 const resolved=applyActivePortfolioPalette(settings);
 return {original,off:heroSectionBackgroundFields(off),on:heroSectionBackgroundFields(on),saved,actualPalette:resolved.hero.palette,expectedPalette:sectionFamilyPalette('indigo',settings.global.colorMode??'dark')};
};
function LastHeadersFixture({section}:{section:string}){
 const [value,setValue]=React.useState<any>({enabled:true,title:section,subtitle:'',...({info:DEFAULT_INFO_PRESENTATION,stack:DEFAULT_STACK_PRESENTATION,contact:{...DEFAULT_CONTACT_PRESENTATION,cardDesign:'editorial'},footer:DEFAULT_FOOTER_PRESENTATION} as any)[section]});
 const [tab,setTab]=React.useState<any>('header');
 const props={subSection:tab,onSubSectionChange:setTab,onChange:(patch:any)=>setValue((previous:any)=>({...previous,...patch}))};
 return <div style={{width:400}}>{section==='info'?<InfoSettingsPanel info={value} {...props}/>:section==='stack'?<StackSettingsPanel stack={value} {...props}/>:section==='contact'?<ContactSettingsPanel contact={value} {...props}/>:<FooterSettingsPanel footer={value} {...props}/>}</div>;
}
(window as any).renderLastHeaders=(section:string)=>flushSync(()=>root.render(<LastHeadersFixture key={section} section={section}/>));
function ThreeHeadersFixture({section}:{section:string}){
 const [value,setValue]=React.useState<any>({enabled:true,title:section,subtitle:'',...({gallery:DEFAULT_GALLERY_PRESENTATION,team:DEFAULT_TEAM_PRESENTATION,experience:DEFAULT_EXPERIENCE_PRESENTATION,work:DEFAULT_WORK_PRESENTATION,tools:DEFAULT_TOOLS_PRESENTATION,services:DEFAULT_SERVICES_PRESENTATION} as any)[section]});
 const [tab,setTab]=React.useState<any>('header');
 const props={subSection:tab,onSubSectionChange:setTab,onChange:(patch:any)=>setValue((previous:any)=>({...previous,...patch}))};
 return <div style={{width:400}}>{section==='gallery'?<GallerySettingsPanel gallery={value} {...props}/>:section==='team'?<TeamSettingsPanel team={value} {...props}/>:section==='work'?<WorkSettingsPanel work={value} {...props}/>:section==='tools'?<ToolsSettingsPanel tools={value} {...props}/>:section==='services'?<ServicesSettingsPanel services={value} {...props}/>:<ExperienceSettingsPanel experience={value} {...props}/>}</div>;
}
(window as any).renderThreeHeaders=(section:string)=>flushSync(()=>root.render(<ThreeHeadersFixture key={section} section={section}/>));
function FaqHeaderSettingsFixture(){
 const [faq,setFaq]=React.useState({...DEFAULT_FAQ_PRESENTATION,enabled:true,title:'FAQ',subtitle:''});
 const [tab,setTab]=React.useState<'design'|'header'|'background'>('header');
 return <div style={{width:400}}><FaqSettingsPanel faq={faq} subSection={tab} onSubSectionChange={setTab} onChange={patch=>setFaq(previous=>({...previous,...patch}))}/></div>;
}
(window as any).renderFaqHeaderSettings=()=>flushSync(()=>root.render(<FaqHeaderSettingsFixture/>));
function RemainingSettingsFixture({section}:{section:string}){
 const [value,setValue]=React.useState<any>({enabled:true,title:section,subtitle:'',...({hero:createDefaultPortfolioSettings().hero,stack:DEFAULT_STACK_PRESENTATION,info:DEFAULT_INFO_PRESENTATION,services:DEFAULT_SERVICES_PRESENTATION,about:DEFAULT_ABOUT_US_PRESENTATION} as any)[section]});
 const props={onChange:(patch:any)=>setValue((previous:any)=>({...previous,...patch})),subSection:'design' as const};
 return <div style={{width:400}}>{section==='hero'?<HeroSettingsPanel hero={value} {...props} subSection="banner" availableTools={[]}/>:section==='stack'?<StackSettingsPanel stack={value} {...props}/>:section==='info'?<InfoSettingsPanel info={value} {...props}/>:section==='services'?<ServicesSettingsPanel services={value} {...props}/>:<AboutUsSettingsPanel aboutUs={value} {...props}/>}</div>;
}
(window as any).renderRemainingSettings=(section:string)=>flushSync(()=>root.render(<RemainingSettingsFixture key={section} section={section}/>));
function ToolsSettingsFixture(){
 const [tools,setTools]=React.useState({...DEFAULT_TOOLS_PRESENTATION,enabled:true,title:'Tools',subtitle:''});
 return <div style={{width:400}}><ToolsSettingsPanel tools={tools} subSection="design" onChange={patch=>setTools(previous=>({...previous,...patch}))}/></div>;
}
(window as any).renderToolsSettings=()=>flushSync(()=>root.render(<ToolsSettingsFixture/>));
function WorkSettingsFixture(){
 const [work,setWork]=React.useState({...DEFAULT_WORK_PRESENTATION,enabled:true,title:'Portfolio',subtitle:''});
 return <div style={{width:400}}><WorkSettingsPanel work={work} subSection="design" onChange={patch=>setWork(previous=>({...previous,...patch}))}/></div>;
}
(window as any).renderWorkSettings=()=>flushSync(()=>root.render(<WorkSettingsFixture/>));
function ExperienceSettingsFixture(){
 const [experience,setExperience]=React.useState({...DEFAULT_EXPERIENCE_PRESENTATION,enabled:true,title:'Experience',subtitle:''});
 return <div style={{width:400}}><ExperienceSettingsPanel experience={experience} subSection="design" onChange={patch=>setExperience(previous=>({...previous,...patch}))}/></div>;
}
(window as any).renderExperienceSettings=()=>flushSync(()=>root.render(<ExperienceSettingsFixture/>));
function OtherSettingsFixture({section}:{section:string}){
 const [value,setValue]=React.useState<any>({enabled:true,title:section,subtitle:'',...({faq:DEFAULT_FAQ_PRESENTATION,contact:DEFAULT_CONTACT_PRESENTATION,footer:DEFAULT_FOOTER_PRESENTATION} as any)[section]});
 const props={subSection:'design' as const,onChange:(patch:any)=>setValue((previous:any)=>({...previous,...patch}))};
 return <div style={{width:400}}>{section==='faq'?<FaqSettingsPanel faq={value} {...props}/>:section==='contact'?<ContactSettingsPanel contact={value} {...props}/>:<FooterSettingsPanel footer={value} {...props}/>}</div>;
}
(window as any).renderOtherSettings=(section:string)=>flushSync(()=>root.render(<OtherSettingsFixture key={section} section={section}/>));
function TeamSettingsFixture(){
 const [team,setTeam]=React.useState({...DEFAULT_TEAM_PRESENTATION,enabled:true,title:'Team',subtitle:''});
 return <div style={{width:400}}><TeamSettingsPanel team={team} subSection="design" onChange={patch=>setTeam(previous=>({...previous,...patch}))}/></div>;
}
(window as any).renderTeamSettings=()=>flushSync(()=>root.render(<TeamSettingsFixture/>));
function GallerySettingsFixture(){
 const [gallery,setGallery]=React.useState({...DEFAULT_GALLERY_PRESENTATION,enabled:true,title:'Gallery',subtitle:''});
 return <div style={{width:400}}><GallerySettingsPanel gallery={gallery} subSection="design" onChange={patch=>setGallery(previous=>({...previous,...patch}))}/></div>;
}
(window as any).renderGallerySettings=()=>flushSync(()=>root.render(<GallerySettingsFixture/>));
(window as any).renderTeamPortraitFrame=(width=360,design='portrait-rail')=>{const Preview=({'portrait-rail':TeamPortraitThumbnailFrame,polaroid:()=> <TeamPortraitThumbnailFrame design="polaroid"/>,'profile-cards':()=> <TeamPortraitThumbnailFrame design="profile-cards"/>,'cover-cards':()=> <TeamPortraitThumbnailFrame design="cover-cards"/>,'avatar-cards':()=> <TeamPortraitThumbnailFrame design="avatar-cards"/>,'float-cards':()=> <TeamPortraitThumbnailFrame design="float-cards"/>,'floating-canvas':()=> <TeamPortraitThumbnailFrame design="floating-canvas"/>,spotlight:TeamSpotlightThumbnailFrame,'split-screen':TeamSplitScreenThumbnailFrame,'editorial-rhythm':TeamEditorialRhythmThumbnailFrame,directory:TeamDirectoryThumbnailFrame} as any)[design];flushSync(()=>root.render(<button style={{width,display:'block'}} onClick={()=>{(window as any).picked=design;}}><Preview/></button>));};
(window as any).renderFloatingFrame=(width=360,design:'floating-canvas'|'caption-carousel'|'hero-mosaic'|'tall-row'|'editorial-split'|'visual-index'|'contact-sheet'='floating-canvas')=>root.render(<button style={{width,display:'block'}} onClick={()=>{(window as any).picked=design;}}><GalleryFloatingThumbnailFrame design={design}/></button>);
(window as any).designs=PORTFOLIO_GALLERY_DESIGN_OPTIONS.map(x=>x.value);
(window as any).retiredDesignChecks=()=>({
 migrated:mergeGalleryPresentation(DEFAULT_GALLERY_PRESENTATION,{design:'cinema-strip',mediaOrder:['keep-this-media'],gap:32}),
 legacyBase:mergeGalleryPresentation({...DEFAULT_GALLERY_PRESENTATION,design:'cinema-strip'} as any,null),
 current:mergeGalleryPresentation(DEFAULT_GALLERY_PRESENTATION,{design:'hero-mosaic'}).design,
});
const items=['Architecture','Formes et matières','Équilibre','Étude chromatique','Perspective','Composition'].map((title,i)=>({id:String(i),sortOrder:i,title,mediaUrl:'/portfolio-previews/gallery-study-'+(i%4+1)+'.svg',mediaType:'IMAGE' as const}));
(window as any).renderGallery=(design:any)=>{document.body.style.margin='0';document.body.style.background='#faf6ee';root.render(<div style={{padding:48,background:'#faf6ee',color:'#201a10','--pf-palette-fond':'#faf6ee','--pf-palette-neutre':'#f1ede5','--pf-palette-texte-fort':'#201a10','--pf-palette-texte-muted':'#6b6047','--pf-palette-principal':'#e2572e'} as React.CSSProperties}><EditorialGallerySection items={items} presentation={{...DEFAULT_GALLERY_PRESENTATION,design,showTitle:true}}/></div>);};
(window as any).renderGallery('framed-grid');
(window as any).renderAllSchematics=(dark=false,width=360)=>root.render(<div style={{width,padding:12,color:dark?'#fafafa':'#171717',background:dark?'#111111':'#ffffff'}}>{[{section:'gallery',options:PORTFOLIO_GALLERY_DESIGN_OPTIONS},{section:'team',options:PORTFOLIO_TEAM_LAYOUT_OPTIONS},{section:'experience',options:PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS}].flatMap(({section,options})=>options.map(option=><GalleryFramedGridOption key={section+option.value} optionId={section+'-'+option.value} label={option.label} description={option.description} actionLabel="Essayer" currentLabel="Actuel" selected={false} schematic={<LayoutOptionSchematic section={section as any} design={option.value}/>} onTry={()=>{(window as any).chosen=section+'-'+option.value;}}/>))}</div>);
(window as any).renderPrototype=(dark=false,width=360)=>root.render(<div style={{width,padding:12,color:dark?'#fafafa':'#171717',background:dark?'#111111':'#ffffff'}}><GalleryFramedGridOption label="Grille encadrée" description="Une grille irrégulière qui suit les proportions des images. Les titres apparaissent au survol." actionLabel="Essayer" currentLabel="Actuel" selected onTry={()=>{(window as any).tried=true;}}/></div>);
(window as any).renderCatalog=()=>root.render(<div style={{width:360}}>{PORTFOLIO_GALLERY_DESIGN_OPTIONS.map(x=><button key={x.value} onClick={()=>{(window as any).picked=x.value;}}><GalleryDesignThumbnail design={x.value} priority/>{x.label}</button>)}</div>);
