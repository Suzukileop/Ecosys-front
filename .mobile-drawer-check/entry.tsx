import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {PortfolioFloatingNav} from '../components/portfolio/portfolio-section-nav';
import {createDefaultPortfolioSettings,mergePortfolioSettings} from '../components/portfolio/portfolio-settings-types';
const root=createRoot(document.getElementById('root')!);
(window as any).mergeNav=(design:string)=>mergePortfolioSettings({navigation:{mobileDrawerDesign:design}}).navigation.mobileDrawerDesign;
function Harness({options}:any){const [active,setActive]=useState('info');const settings={...createDefaultPortfolioSettings().navigation,enabled:true,navMode:'pages',navLayoutDesign:'editorial-bar',displayMode:'always',hideWhenSingle:false,linkIconsEnabled:false,mobileLayout:'drawer',mobileDrawerDesign:options.design,mobileDrawerSide:options.side,itemTextColor:options.dark?'#fafafa':'#201a10',barBackgroundColor:options.dark?'#111111':'#faf6ee',navBarSurface:'neutre',navPalette:{...createDefaultPortfolioSettings().navigation.navPalette,fond:options.dark?'#111111':'#faf6ee',neutre:options.dark?'#171717':'#ffffff',texteFort:options.dark?'#fafafa':'#201a10'}};const labels=['Home','Info','Work','Workflow & creative tools','Services','Experience','Team','Gallery','Contact'];return <><PortfolioFloatingNav settings={settings as any} items={labels.map((label,i)=>({id:i===8?'contact':i===1?'info':'section'+i,label,icon:'grid'})) as any} activeId={active} onNavigate={setActive} monochrome={false} brandName="Leopard Studio"/><output id="selection">{active}</output></>;}
(window as any).renderNav=(options:any={design:'editorial',side:'right'})=>root.render(<Harness key={JSON.stringify(options)} options={options}/>);
(window as any).renderNav();
