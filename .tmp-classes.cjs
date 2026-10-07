const fs=require('fs');
const files=['home/HomeNewsFeed.tsx','home/NewsComposer.tsx','home/NewsDiscoverRail.tsx','home/NewsFeedPostCard.tsx','home/NewsFeedPostParts.tsx','home/HomeNewsSkeleton.tsx','creator/ContentPostSocialBar.tsx','creator/ContentPostDetailsBlock.tsx','creator/ContentPostActionsMenu.tsx','creator/ContentPostClampedTitle.tsx','creator/ContentPostMetaLine.tsx','creator/ContentPostFeedMediaFrame.tsx','creator/PostCommentsSurface.tsx','creator/studio/ProfileSectionStickyAside.tsx'];
const set=new Map();
for(const f of files){ if(!fs.existsSync(f)){console.log('missing',f);continue;} const t=fs.readFileSync(f,'utf8');
  for(const m of t.matchAll(/[A-Za-z0-9:\-\[\]\/#\.%_(),]+/g)){ const c=m[0]; if(/^(dark:|hover:|focus:|focus-visible:|group-hover:|sm:|md:|lg:|placeholder:|disabled:|aria-)*(text|bg|border|ring|divide|from|to|via|fill|stroke|shadow|outline)-/.test(c) && /(neutral|#|black|white|orange|emerald|red|amber|rose|sky|blue|slate|gray|zinc|stone|green|yellow)/.test(c)) set.set(c,(set.get(c)||0)+1);} }
console.log([...set.entries()].sort().map(([c,n])=>c+' '+n).join('\n'));
