const path=require('path');const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright-core'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await p.route('**/zz-harness',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:1440px;height:880px;border:0"></iframe></body>'}));
await p.goto('http://localhost:3000/zz-harness',{waitUntil:'domcontentloaded'});await p.waitForTimeout(9000);
const frame=p.frames().find(f=>f.url().includes('/portfolio/tester1'));
for(const shape of ['offset']){
await p.evaluate(([shape])=>document.getElementById('f').contentWindow.postMessage({source:'skraft-portfolio-studio',type:'apply-settings',settings:{hero:{heroBannerDesign:'portrait-identity',heroPortraitShape:shape,enabled:true}}},location.origin),[shape]);
await p.waitForTimeout(12000);
const r=await frame.evaluate(()=>{const m=document.querySelector('.pf-identity-photo-mask');const inner=m.querySelector('.pf-identity-photo-inner');const ov=inner.querySelector('div[aria-hidden]');const bar=inner.querySelector('span[aria-hidden]');const out=m.parentElement.querySelector(':scope > span[aria-hidden]');const mr=m.getBoundingClientRect();const o=out&&out.getBoundingClientRect();return {innerRadius:getComputedStyle(inner).borderRadius,ovRadius:ov&&getComputedStyle(ov).borderRadius,bar:!!bar,outline:o?{dx:Math.round(o.left-mr.left),dy:Math.round(o.top-mr.top),w:Math.round(o.width)}:null};});
console.log(shape,JSON.stringify(r));}
await b.close();})();
