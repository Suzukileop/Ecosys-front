const fs=require('fs'),path=require('path');
const T={
'A light, airy title.':{fr:'Un titre léger et aéré.',es:'Un título ligero y aireado.',pt:'Um título leve e arejado.',ar:'عنوان خفيف ومتنفّس.',ru:'Лёгкий, воздушный заголовок.',zh:'轻盈、通透的标题。'},
'A calm, editorial title.':{fr:'Un titre calme, de style éditorial.',es:'Un título sereno, de estilo editorial.',pt:'Um título calmo, de estilo editorial.',ar:'عنوان هادئ بأسلوب تحريري.',ru:'Спокойный заголовок в редакционном стиле.',zh:'沉静的编辑风格标题。'},
'Firm without being heavy (default).':{fr:'Affirmé sans être lourd (par défaut).',es:'Firme sin ser pesado (predeterminado).',pt:'Firme sem ser pesado (padrão).',ar:'قوي دون أن يكون ثقيلًا (الافتراضي).',ru:'Уверенный, но не тяжёлый (по умолчанию).',zh:'有力而不厚重（默认）。'},
'A strong, poster-like title.':{fr:'Un titre fort, façon affiche.',es:'Un título contundente, estilo cartel.',pt:'Um título forte, estilo cartaz.',ar:'عنوان قوي بأسلوب الملصقات.',ru:'Мощный заголовок в стиле афиши.',zh:'醒目的海报式标题。'},
};
for(const l of ['fr','es','pt','ar','ru','zh']){const f=path.join(__dirname,'..','..','lib/i18n/messages',l+'.json');const raw=fs.readFileSync(f,'utf8');const eol=raw.includes('\r\n')?'\r\n':'\n';const j=JSON.parse(raw);
for(const [k,v] of Object.entries(T)) if(!(k in j)) j[k]=v[l];
fs.writeFileSync(f,JSON.stringify(j,null,2).replace(/\n/g,eol)+(raw.endsWith('\n')?eol:''));}
console.log('ok');
