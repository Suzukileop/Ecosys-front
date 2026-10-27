const {chromium}=require('@playwright/test');const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage();
 const polish=fs.readFileSync('components/portfolio/portfolio-experience-reel-polish.module.css','utf8').replace(/:global\(([^)]+)\)/g,'$1');
 const globals=fs.readFileSync('app/globals.css','utf8');const start=globals.indexOf('.pf-reel-bento {');const end=globals.indexOf('/*',start+100);const grid=globals.slice(start,end);
 for(const width of [320,390,1200])for(const mode of ['watermark','signature','vertical']){
  await page.setViewportSize({width,height:900});
  await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;background:#080808;color:#eee;font:16px Arial}.section{position:relative;display:flex;flex-direction:column;padding:80px 6vw 48px;min-height:100svh}p{margin:0}h3{margin:0;overflow-wrap:anywhere}.pf-reel-bento{margin-top:40px}.pf-reel-bento-lead{display:flex;flex-direction:column}.meta{order:-1}.watermarkStatus,.verticalStatus{color:#222}${grid}${polish}</style><section class="section" data-status-mode="${mode}">${mode!=='signature'?`<p class="${mode==='watermark'?'watermarkStatus':'verticalStatus'}">Ongoing</p>`:''}<div class="pf-reel-bento"><div class="pf-reel-bento-lead"><h3>Automatisation du numéro de pension</h3><div class="meta"><p>2023 ${mode==='signature'?'· En cours':''}</p><p>Studio · Remote · Full-time</p></div></div><div class="pf-reel-bento-card"><p>Une description du projet suffisamment longue pour vérifier les retours à la ligne et le confort de lecture.</p><ul><li>Une première tâche</li><li>Une deuxième tâche</li></ul><div class="pf-reel-detail-footer">TypeScript · React · Java<br><a>Voir le projet ↗</a></div></div></div></section>`);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${mode} overflow at ${width}`);
  if(width<640){const box=await page.locator('.section').boundingBox();assert(box.height<900,`Mobile excessively tall: ${mode}`);}
 }
 console.log('PASS Reel: three status modes at 320/390/1200px, no horizontal overflow, compact mobile layout');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
