const path=require('path');const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright-core'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await p.route('**/zz-harness',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:1440px;height:880px;border:0"></iframe></body>'}));
await p.goto('http://localhost:3000/zz-harness',{waitUntil:'domcontentloaded'});await p.waitForTimeout(9000);
const frame=p.frames().find(f=>f.url().includes('/portfolio/tester1'));
const cases=[{},{categoryColor:'principal',roleColor:'secondaire'}];
for(const c of cases){
await p.evaluate(([c])=>document.getElementById('f').contentWindow.postMessage({source:'skraft-portfolio-studio',type:'apply-settings',settings:{work:{sectionDesign:'projects-cascade',enabled:true,projectsCascade:c}}},location.origin),[c]);
await p.waitForTimeout(10000);
const r=await frame.evaluate(()=>{const s=document.getElementById('work');const p=[...s.querySelectorAll('p')].find(e=>/WEB|MOBILE|web|mobile/i.test(e.textContent)&&e.textContent.includes('·'));if(!p)return 'no meta';return [...p.querySelectorAll('span > span')].filter(e=>e.textContent.trim()&&e.textContent.trim()!=='·').map(e=>e.textContent.trim()+' '+getComputedStyle(e).color);});
console.log(JSON.stringify(c),JSON.stringify(r));}
await b.close();})();
