const fs=require('fs'),path=require('path');
const T={
'Design default':{fr:'Selon le design',es:'Según el diseño',pt:'Conforme o design',ar:'حسب التصميم',ru:'По умолчанию для дизайна',zh:'跟随设计'},
'Keep the shape this design was built with.':{fr:'Garde la forme d’origine de ce design.',es:'Mantiene la forma original de este diseño.',pt:'Mantém a forma original deste design.',ar:'يحتفظ بالشكل الأصلي لهذا التصميم.',ru:'Сохраняет исходную форму этого дизайна.',zh:'保留此设计原有的形状。'},
'The straight-edged portrait.':{fr:'Le portrait aux bords droits.',es:'El retrato de bordes rectos.',pt:'O retrato de bordas retas.',ar:'الصورة بحواف مستقيمة.',ru:'Портрет с прямыми краями.',zh:'直边肖像。'},
};
for(const l of ['fr','es','pt','ar','ru','zh']){const f=path.join(__dirname,'..','..','lib/i18n/messages',l+'.json');const raw=fs.readFileSync(f,'utf8');const eol=raw.includes('\r\n')?'\r\n':'\n';const j=JSON.parse(raw);
for(const [k,v] of Object.entries(T)) if(!(k in j)) j[k]=v[l];
fs.writeFileSync(f,JSON.stringify(j,null,2).replace(/\n/g,eol)+(raw.endsWith('\n')?eol:''));}
console.log('ok');
