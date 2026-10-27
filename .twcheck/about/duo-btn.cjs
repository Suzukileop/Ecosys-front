const path=require('path');const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright-core'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await p.route('**/zz-harness',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:1440px;height:880px;border:0"></iframe></body>'}));
await p.goto('http://localhost:3000/zz-harness',{waitUntil:'domcontentloaded'});await p.waitForTimeout(9000);
const frame=p.frames().find(f=>f.url().includes('/portfolio/tester1'));
for(const mode of ['sticky','scroll','slide'])for(const linkStyle of ['outline','solid']){
await p.evaluate(([mode,linkStyle])=>document.getElementById('f').contentWindow.postMessage({source:'skraft-portfolio-studio',type:'apply-settings',settings:{work:{sectionDesign:'projects-duotone',enabled:true,projectsDuotone:{scrollMode:mode,linkStyle}}}},location.origin),[mode,linkStyle]);
await p.waitForTimeout(10000);
const r=await frame.evaluate(()=>[...document.querySelectorAll('#work a[data-variant]')].filter(a=>a.getBoundingClientRect().width>0).slice(0,2).map(a=>{const r=a.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height)+' parent '+Math.round(a.parentElement.getBoundingClientRect().width);}));
console.log(mode,linkStyle,JSON.stringify(r));}
await b.close();})();
