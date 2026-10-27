const path=require('path');const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright-core'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await p.route('**/zz-harness',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:1440px;height:880px;border:0"></iframe></body>'}));
await p.goto('http://localhost:3000/zz-harness',{waitUntil:'domcontentloaded'});await p.waitForTimeout(9000);
const frame=p.frames().find(f=>f.url().includes('/portfolio/tester1'));
for(const vis of [{tools:true,tasks:true},{tools:false,tasks:false}]){
await p.evaluate(([vis])=>document.getElementById('f').contentWindow.postMessage({source:'skraft-portfolio-studio',type:'apply-settings',settings:{experience:{experienceDesign:'milestone',enabled:true,blockLabelVisibility:vis}}},location.origin),[vis]);
await p.waitForTimeout(9000);
const r=await frame.evaluate(()=>{const t=document.getElementById('experience').innerText;return {stack:/\bSTACK\b/i.test(t),resp:/RESPONSIBILITIES/i.test(t)};});
console.log(JSON.stringify(vis),JSON.stringify(r));}
await b.close();})();
