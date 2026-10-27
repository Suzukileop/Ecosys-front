const fs=require('fs'),path=require('path');
const T={'Image border':{fr:'Bordure de l’image',es:'Borde de la imagen',pt:'Borda da imagem',ar:'إطار الصورة',ru:'Рамка изображения',zh:'图片边框'}};
for(const l of ['fr','es','pt','ar','ru','zh']){const f=path.join(__dirname,'..','..','lib/i18n/messages',l+'.json');const raw=fs.readFileSync(f,'utf8');const eol=raw.includes('\r\n')?'\r\n':'\n';const j=JSON.parse(raw);
for(const [k,v] of Object.entries(T)) if(!(k in j)) j[k]=v[l];
fs.writeFileSync(f,JSON.stringify(j,null,2).replace(/\n/g,eol)+(raw.endsWith('\n')?eol:''));}
console.log('ok');
