import React,{useState} from 'react';
import {FooterHeaderEditorialHeader} from '../components/portfolio/footer-portfolio-header-designs/FooterHeaderEditorialHeader';
import {FooterHeaderIndexHeader} from '../components/portfolio/footer-portfolio-header-designs/FooterHeaderIndexHeader';
import {FooterHeaderSerifLeadHeader} from '../components/portfolio/footer-portfolio-header-designs/FooterHeaderSerifLeadHeader';
import {FooterHeaderBillboardHeader} from '../components/portfolio/footer-portfolio-header-designs/FooterHeaderBillboardHeader';
import {FooterHeaderMastheadHeader} from '../components/portfolio/footer-portfolio-header-designs/FooterHeaderMastheadHeader';
import {FooterHeaderHeroHeader} from '../components/portfolio/footer-portfolio-header-designs/FooterHeaderHeroHeader';
import {FooterHeaderNameHeader} from '../components/portfolio/footer-portfolio-header-designs/FooterHeaderNameHeader';
import {FooterHeaderTimezoneHeader} from '../components/portfolio/footer-portfolio-header-designs/FooterHeaderTimezoneHeader';
const Headers={FooterHeaderEditorialHeader,FooterHeaderIndexHeader,FooterHeaderSerifLeadHeader,FooterHeaderBillboardHeader,FooterHeaderMastheadHeader,FooterHeaderHeroHeader,FooterHeaderNameHeader,FooterHeaderTimezoneHeader};
import {portfolioEditorialGutterX} from '../components/portfolio/portfolio-editorial-layout';
import {DEFAULT_FOOTER_PRESENTATION} from '../components/portfolio/portfolio-footer-settings';
import {createRoot} from 'react-dom/client';
import {PortfolioPagesSlideViewport} from '../components/portfolio/portfolio-pages-transition';
import {PortfolioFooterMiniBar} from '../components/portfolio/portfolio-footer-mini-bar';
const root=createRoot(document.getElementById('root')!);
function App(){const [page,setPage]=useState('Hero');return <><nav>{['Hero','Tools','Contact'].map(name=><button key={name} onClick={()=>setPage(name)}>{name}</button>)}</nav><div style={{height:600}}><PortfolioPagesSlideViewport pageId={page} direction={1}><div style={{minHeight:'100%',display:'flex',flexDirection:'column'}}><div style={{flex:1,minHeight:page==='Tools'?120:1400}}>{page}{page==='Contact'?<div data-large-footer="">Full footer</div>:null}</div><div style={{flexShrink:0}}><PortfolioFooterMiniBar design="inverted-wordmark" creatorName="Studio" colorMode="light"/></div></div></PortfolioPagesSlideViewport></div></>;}
root.render(<App/>);
const Delayed=React.lazy(()=>new Promise<any>(resolve=>{(window as any).releaseSection=()=>resolve({default:()=> <div data-delayed-section="">Loaded section</div>});}));
function LazyApp(){const [page,setPage]=useState('ready');return <React.Suspense fallback={<div data-global-skeleton="">Global skeleton</div>}><nav data-persistent-nav=""><button onClick={()=>setPage('delayed')}>Load delayed section</button></nav><div style={{height:600}}><PortfolioPagesSlideViewport pageId={page} direction={1}>{page==='ready'?<div data-ready-section="">Ready section</div>:<Delayed/>}</PortfolioPagesSlideViewport></div></React.Suspense>;}
(window as any).renderLazy=()=>root.render(<LazyApp/>);
(window as any).renderFooterHeaders=(gutter:any,maxWidth:number)=>{const shell=`mx-auto w-full ${portfolioEditorialGutterX(gutter)}`;root.render(<><div data-global-reference="" className={shell} style={{maxWidth}}><div data-reference-inner=""/></div>{Object.entries(Headers).filter(([name])=>name.startsWith('FooterHeader')).map(([name,Component])=><div key={name} data-header-shell={name} className={shell} style={{maxWidth}}><Component title="Studio" presentation={DEFAULT_FOOTER_PRESENTATION}/></div>)}</>);};
