import React from 'react';
import { createRoot } from 'react-dom/client';
import { PortfolioDeferredMedia } from '../components/portfolio/PortfolioDeferredMedia';
const root = createRoot(document.getElementById('root')!);
(window as any).renderMedia = (src = '/api/storage/ok.jpg') => root.render(<div style={{position:'relative',width:300,height:300}}><PortfolioDeferredMedia src={src} alt="Portrait test" eager sizes="300px" /></div>);
(window as any).renderMedia();
