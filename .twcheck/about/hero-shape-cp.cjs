const path=require('path');const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright-core'));
(async()=>{const b=await chromium.launch();
for(const W of [1440,390]){
const p=await b.newPage({viewport:{width:W,height:900},reducedMotion:'reduce'});
await p.route('**/zz-harness',r=>r.fulfill({contentType:'text/html',body:`<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:${W}px;height:880px;border:0"></iframe></body>`}));
await p.goto('http://localhost:3000/zz-harness',{waitUntil:'domcontentloaded'});await p.waitForTimeout(8000);
const frame=p.frames().find(f=>f.url().includes('/portfolio/tester1'));
for(const shape of ['auto','circle','rectangle','arch','frame','offset','asymmetric']){
await p.evaluate(([shape])=>document.getElementById('f').contentWindow.postMessage({source:'skraft-portfolio-studio',type:'apply-settings',settings:{hero:{heroBannerDesign:'circle-portrait',heroPortraitShape:shape,enabled:true}}},location.origin),[shape]);
await p.waitForTimeout(shape==='auto'?10000:5000);
const r=await frame.evaluate(()=>{const els=[...document.querySelectorAll('[data-orbit-portrait]')].filter(e=>e.getBoundingClientRect().width>0);const m=els[0];if(!m)return 'none';const cs=getComputedStyle(m);const r=m.getBoundingClientRect();const col=m.closest('[data-orbit-column]').getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height),col:Math.round(col.width),rad:cs.borderRadius.slice(0,30),outline:m.parentElement.parentElement.previousElementSibling?1:0,ring:m.closest('[data-orbit-column]').querySelectorAll('.rounded-full.border').length,ovf:document.documentElement.scrollWidth>innerWidth};});
console.log(W,shape,JSON.stringify(r));}
await p.close();}
await b.close();})();
