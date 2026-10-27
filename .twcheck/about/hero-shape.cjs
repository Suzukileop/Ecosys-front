const path=require('path');const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright-core'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await p.route('**/zz-harness',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:1440px;height:880px;border:0"></iframe></body>'}));
await p.goto('http://localhost:3000/zz-harness',{waitUntil:'domcontentloaded'});await p.waitForTimeout(9000);
const frame=p.frames().find(f=>f.url().includes('/portfolio/tester1'));
for(const shape of ['circle','offset']){
await p.evaluate(([shape])=>document.getElementById('f').contentWindow.postMessage({source:'skraft-portfolio-studio',type:'apply-settings',settings:{hero:{heroBannerDesign:'portrait-identity',heroPortraitShape:shape,enabled:true}}},location.origin),[shape]);
await p.waitForTimeout(8000);
const r=await frame.evaluate(()=>{const m=document.querySelector('.pf-identity-photo-mask');if(!m)return 'no mask';const cs=getComputedStyle(m);const r=m.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height),radius:cs.borderRadius.slice(0,40)};});
console.log(shape,JSON.stringify(r));}
await b.close();})();
