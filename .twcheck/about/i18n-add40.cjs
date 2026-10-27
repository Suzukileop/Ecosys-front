const fs=require('fs'),path=require('path');
const T={
'Offset frame':{fr:'Cadre décalé',es:'Marco desplazado',pt:'Moldura deslocada',ar:'إطار مزاح',ru:'Смещённая рамка',zh:'错位边框'},
'A fine accent outline set back behind the portrait.':{fr:'Un fin contour d’accent en retrait derrière le portrait.',es:'Un fino contorno de acento desplazado detrás del retrato.',pt:'Um fino contorno de destaque deslocado atrás do retrato.',ar:'إطار رفيع بلون التمييز خلف الصورة وبإزاحة.',ru:'Тонкий акцентный контур со смещением позади портрета.',zh:'位于肖像后方、略微错开的细强调轮廓。'},
};
for(const l of ['fr','es','pt','ar','ru','zh']){const f=path.join(__dirname,'..','..','lib/i18n/messages',l+'.json');const raw=fs.readFileSync(f,'utf8');const eol=raw.includes('\r\n')?'\r\n':'\n';const j=JSON.parse(raw);
for(const [k,v] of Object.entries(T)) if(!(k in j)) j[k]=v[l];
fs.writeFileSync(f,JSON.stringify(j,null,2).replace(/\n/g,eol)+(raw.endsWith('\n')?eol:''));}
console.log('ok');
