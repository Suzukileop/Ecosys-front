import React from 'react';
import {createRoot} from 'react-dom/client';
import {PortfolioDesignLivePreviewCard} from '../components/portfolio/PortfolioDesignLivePreview';
import {createDefaultPortfolioSettings} from '../components/portfolio/portfolio-settings-types';
const root=createRoot(document.getElementById('root')!);
(window as any).renderStatic=()=>root.render(<PortfolioDesignLivePreviewCard active label="Minimal centré" src="http://preview.test/frame/static" previewImageSrc="/portfolio-previews/footer-centered-minimal-v1.webp" settings={createDefaultPortfolioSettings()} onClick={()=>{(window as any).picked=true;}} cardClassName="" labelClassName=""/>);
root.render(<div style={{width:360}}>{Array.from({length:8},(_,i)=><PortfolioDesignLivePreviewCard key={i} active={i===0} label={'Design '+i} src={'http://preview.test/frame/'+i} settings={createDefaultPortfolioSettings()} onClick={()=>{}} cardClassName="" labelClassName="" thumbnail={<svg data-thumbnail="" viewBox="0 0 200 80"><rect width="80" height="20" fill="gray"/></svg>}/>)}</div>);
