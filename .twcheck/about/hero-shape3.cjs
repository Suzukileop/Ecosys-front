const path=require('path');const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright-core'));
const design=process.argv[2];
(async()=>{const b=await chromium.launch();
for(const W of [1440,390]){
const p=await b.newPage({viewport:{width:W,height:900},reducedMotion:'reduce'});
await p.route('**/zz-harness',r=>r.fulfill({contentType:'text/html',body:`<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:${W}px;height:880px;border:0"></iframe></body>`}));
await p.goto('http://localhost:3000/zz-harness',{waitUntil:'domcontentloaded'});await p.waitForTimeout(8000);
const frame=p.frames().find(f=>f.url().includes('/portfolio/tester1'));
for(const shape of ['circle']){
await p.evaluate(([shape,design])=>document.getElementById('f').contentWindow.postMessage({source:'skraft-portfolio-studio',type:'apply-settings',settings:{hero:{heroBannerDesign:design,heroPortraitShape:shape,enabled:true}}},location.origin),[shape,design]);
await p.waitForTimeout(12000);
const r=await frame.evaluate(()=>{const sec=document.body;const ph=[...document.querySelectorAll('.pf-editorial-rail-photo')].filter(e=>e.getBoundingClientRect().width>50)[0];if(ph){const r=ph.getBoundingClientRect();const cs=getComputedStyle(ph);return {rail:1,w:Math.round(r.width),h:Math.round(r.height),rad:cs.borderRadius.slice(0,26),bar:!!ph.querySelector(':scope > span[aria-hidden]'),out:!!ph.parentElement.querySelector(':scope > span[aria-hidden]'),ovf:document.documentElement.scrollWidth>innerWidth};}const v=null;const imgs=[...sec.querySelectorAll('img')].filter(i=>i.getBoundingClientRect().width>100);if(!imgs.length)return {v,none:1};const img=imgs.sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width)[0];let e=img.parentElement;let box=e;while(e&&e!==sec){const cs=getComputedStyle(e);if(cs.overflow==='hidden'&&e.getBoundingClientRect().width>100){box=e;break;}e=e.parentElement;}const r=box.getBoundingClientRect();return {v,w:Math.round(r.width),h:Math.round(r.height),rad:getComputedStyle(box).borderRadius.slice(0,26),ovf:document.documentElement.scrollWidth>innerWidth};});
console.log(W,design,shape,JSON.stringify(r));}
await p.close();}
await b.close();})();
