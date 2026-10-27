import React,{useState} from 'react';
import {useNavigationSection} from '../components/portfolio/use-navigation-section';
import {patchNavPalette} from '../components/portfolio/portfolio-nav-palette-settings';
import {DEFAULT_HERO_PALETTE} from '../components/portfolio/portfolio-hero-palette-settings';
import {createRoot} from 'react-dom/client';
import {PortfolioFloatingNav} from '../components/portfolio/portfolio-section-nav';
import {createDefaultPortfolioSettings} from '../components/portfolio/portfolio-settings-types';
const root=createRoot(document.getElementById('root')!);
function Harness({options}:any){const [active,setActive]=useState('tools');const settings={...createDefaultPortfolioSettings().navigation,enabled:true,navMode:options.mode,navLayoutDesign:'editorial-bar',displayMode:'always',hideWhenSingle:false,contactButtonEnabled:options.button,linkIconsEnabled:false};const painted=options.palette?{...settings,...patchNavPalette(settings,active==='contact'?DEFAULT_HERO_PALETTE:{...DEFAULT_HERO_PALETTE,texteFort:'#201a10',texteMuted:'#6b6047',fond:'#faf6ee',neutre:'#ffffff'})}:settings;return <><PortfolioFloatingNav settings={painted as any} items={[{id:'tools',label:'Tools',icon:'wrench'},{id:'contact',label:'Contact',icon:'mail'}]} activeId={active} onNavigate={setActive} monochrome={false}/><output id="selection">{active}</output><section id="tools"/><section id="contact"/></>;}
(window as any).renderNav=(options:any={mode:'pages',button:true})=>root.render(<Harness key={JSON.stringify(options)} options={options}/>);
(window as any).renderNav();
const scrollIds=['hero','info','contact'];
function ScrollHarness(){const active=useNavigationSection(scrollIds,true);return <><div data-portfolio-nav-clearance-box="" style={{position:'fixed',top:0,height:60}}/><output id="scroll-selection" style={{position:'fixed'}}>{active}</output>{scrollIds.map(id=><section key={id} id={id} style={{height:900}}>{id}</section>)}</>;}
(window as any).renderScroll=()=>root.render(<ScrollHarness/>);
