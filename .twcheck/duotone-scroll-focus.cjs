const {chromium}=require('@playwright/test');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const source=fs.readFileSync('components/portfolio/portfolio-experience-lists.tsx','utf8');
 const start=source.indexOf('    const element = focusRef.current;');
 const end=source.indexOf('  }, [active, scrollPart, reduceFocusMotion]);',start);
 const body=source.slice(start,end);
 const browser=await chromium.launch();
 try {
  const page=await browser.newPage({viewport:{width:900,height:800}});
  await page.setContent('<style>body{margin:0}#scroll{height:800px;overflow:auto}.panel{height:800px}</style><div id="scroll"><div class="panel">First</div><div class="panel">Second</div></div>');
  await page.evaluate(body=>{
   const effect=new Function('focusRef','active','scrollPart','reduceFocusMotion','getScrollParent',body);
   document.querySelectorAll('.panel').forEach(element=>effect({current:element},undefined,'all',false,()=>document.querySelector('#scroll')));
  },body);
  const read=()=>page.locator('.panel').evaluateAll(elements=>elements.map(el=>Number(el.style.getPropertyValue('--duotone-focus-light'))));
  let values=await read(); assert(values[0]>.99 && values[1]<.4,JSON.stringify(values));
  await page.locator('#scroll').evaluate(el=>el.scrollTop=400);
  await page.waitForFunction(()=>{const nodes=document.querySelectorAll('.panel');return Math.abs(Number(nodes[0].style.getPropertyValue('--duotone-focus-light'))-Number(nodes[1].style.getPropertyValue('--duotone-focus-light')))<.01;});
  values=await read();assert(Math.abs(values[0]-values[1])<.01 && values[0]>.65,JSON.stringify(values));
  await page.locator('#scroll').evaluate(el=>el.scrollTop=800);
  await page.waitForFunction(()=>Number(document.querySelector('.panel').style.getPropertyValue('--duotone-focus-light'))<.4);
  values=await read();assert(values[0]<.4 && values[1]>.99,JSON.stringify(values));
  console.log('PASS actual scroll effect: outgoing darkens, incoming brightens, symmetric smooth handoff in nested scrolling preview.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
