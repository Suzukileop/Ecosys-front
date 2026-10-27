import React from 'react';
import { createRoot } from 'react-dom/client';
import { MediaImage } from '../components/ui/MediaImage';
import { PortfolioDeferredMedia } from '../components/portfolio/PortfolioDeferredMedia';
const root=createRoot(document.getElementById('root')!);
(window as any).renderMedia=(kind='studio',src='/api/storage/initial.jpg')=>root.render(<div style={{position:'relative',width:280,height:210,background:'#222'}}>{kind==='studio'?<MediaImage src={src} widths={[384,640,828]} sizes="280px" priority alt="Portrait" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<PortfolioDeferredMedia src={src} alt="Portrait" eager sizes="280px"/>}</div>);
(window as any).renderMedia();
