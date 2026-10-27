const fs=require('fs'),path=require('path');
const T={
'Oversized, black-weight title, overlapping the image.':{fr:'Titre surdimensionné en graisse black, qui chevauche l’image.',es:'Título sobredimensionado en peso black, que se superpone a la imagen.',pt:'Título superdimensionado em peso black, sobreposto à imagem.',ar:'عنوان ضخم بخط عريض جدًا يتداخل مع الصورة.',ru:'Очень крупный сверхжирный заголовок, перекрывающий изображение.',zh:'超大黑体标题，与图片重叠。'},
'A calmer medium-weight title at a moderate size, under the image (default).':{fr:'Un titre plus calme en graisse medium, de taille modérée, sous l’image (par défaut).',es:'Un título más sereno en peso medio, de tamaño moderado, bajo la imagen (predeterminado).',pt:'Um título mais calmo em peso médio, de tamanho moderado, abaixo da imagem (padrão).',ar:'عنوان أهدأ بخط متوسط وحجم معتدل تحت الصورة (الافتراضي).',ru:'Спокойный заголовок средней жирности умеренного размера под изображением (по умолчанию).',zh:'更平静的中等字重标题，大小适中，位于图片下方（默认）。'},
};
for(const l of ['fr','es','pt','ar','ru','zh']){const f=path.join(__dirname,'..','..','lib/i18n/messages',l+'.json');const raw=fs.readFileSync(f,'utf8');const eol=raw.includes('\r\n')?'\r\n':'\n';const j=JSON.parse(raw);
for(const [k,v] of Object.entries(T)) if(!(k in j)) j[k]=v[l];
fs.writeFileSync(f,JSON.stringify(j,null,2).replace(/\n/g,eol)+(raw.endsWith('\n')?eol:''));}
console.log('ok');
