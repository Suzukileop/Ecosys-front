const path=require('path');const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright-core'));
(async()=>{const b=await chromium.launch();
for(const W of [1440,768]){
const p=await b.newPage({viewport:{width:W,height:900},reducedMotion:'reduce'});
await p.route('**/zz-harness',r=>r.fulfill({contentType:'text/html',body:`<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:${W}px;height:880px;border:0"></iframe></body>`}));
await p.goto('http://localhost:3000/zz-harness',{waitUntil:'domcontentloaded'});await p.waitForTimeout(9000);
const frame=p.frames().find(f=>f.url().includes('/portfolio/tester1'));
for(const shape of ['auto','offset','frame']){
await p.evaluate(([shape])=>document.getElementById('f').contentWindow.postMessage({source:'skraft-portfolio-studio',type:'apply-settings',settings:{hero:{heroBannerDesign:'editorial-overlap',heroPortraitShape:shape,enabled:true}}},location.origin),[shape]);
await p.waitForTimeout(shape==='auto'?10000:9000);
const r=await frame.evaluate(()=>{const hero=document.querySelector('[data-hero-variant]');const ms=[...document.querySelectorAll('.pf-overlap-media')].filter(e=>e.getBoundingClientRect().width>0);const m=ms[0];if(!m)return 'no media '+(hero&&hero.dataset.heroVariant);const cs=getComputedStyle(m);const r=m.getBoundingClientRect();const pan=[...document.querySelectorAll('.pf-overlap-panel')].find(e=>e.getBoundingClientRect().width>0).getBoundingClientRect();return {v:hero.dataset.heroVariant,w:Math.round(r.width),h:Math.round(r.height),right:Math.round(r.right),panelLeft:Math.round(pan.left),radius:cs.borderRadius.slice(0,40),overlay:!!m.querySelector('span'),outline:!!(m.parentElement.querySelector(':scope > span')),ovf:document.documentElement.scrollWidth>innerWidth+1};});
console.log(W,shape,JSON.stringify(r));}
await p.close();}
await b.close();})();
