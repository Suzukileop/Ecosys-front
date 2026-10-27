const path=require('path');const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright-core'));
(async()=>{const b=await chromium.launch();const p=await b.newPage();
p.on('response',async r=>{try{const u=r.url();if(!/api|portfolio/.test(u))return;const ct=r.headers()['content-type']||'';if(!ct.includes('json'))return;const t=await r.text();if(!t.includes('experienceBlocks'))return;const j=JSON.parse(t);const find=(o)=>{if(!o||typeof o!=='object')return null;if(Array.isArray(o.experienceBlocks))return o.experienceBlocks;for(const v of Object.values(o)){const f=find(v);if(f)return f;}return null;};const eb=find(j);if(eb)console.log(u.slice(0,90),JSON.stringify(eb.map(x=>({t:(x.title||'').slice(0,25),mediaUrl:x.mediaUrl,mediaType:x.mediaType}))));}catch(e){}});
await p.goto('http://localhost:3000/portfolio/tester1',{waitUntil:'networkidle'});await p.waitForTimeout(4000);
const html=await p.content();const m=html.match(/"experienceBlocks":\[.*?\]\}?/s);if(m)console.log('inline',m[0].slice(0,100));
await b.close();})();
