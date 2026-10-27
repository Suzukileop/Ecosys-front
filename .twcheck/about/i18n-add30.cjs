const fs=require('fs'),path=require('path');
const T={
'Relaxed':{fr:'Détendue',es:'Relajado',pt:'Descontraído',ar:'مريح',ru:'Свободный',zh:'宽松'},
'Elements and roles sit close together.':{fr:'Les éléments et les rôles sont rapprochés.',es:'Los elementos y los puestos quedan juntos.',pt:'Os elementos e as funções ficam próximos.',ar:'العناصر والأدوار قريبة من بعضها.',ru:'Элементы и роли расположены плотно.',zh:'元素与职位之间间距紧凑。'},
'Balanced spacing (default).':{fr:'Espacement équilibré (par défaut).',es:'Espaciado equilibrado (predeterminado).',pt:'Espaçamento equilibrado (padrão).',ar:'تباعد متوازن (الافتراضي).',ru:'Сбалансированные отступы (по умолчанию).',zh:'均衡的间距（默认）。'},
'More room around each element.':{fr:'Plus de place autour de chaque élément.',es:'Más espacio alrededor de cada elemento.',pt:'Mais espaço ao redor de cada elemento.',ar:'مساحة أكبر حول كل عنصر.',ru:'Больше свободного места вокруг каждого элемента.',zh:'每个元素周围留出更多空间。'},
'Generous, gallery-like spacing.':{fr:'Espacement généreux, façon galerie.',es:'Espaciado generoso, estilo galería.',pt:'Espaçamento generoso, estilo galeria.',ar:'تباعد سخي بأسلوب المعارض.',ru:'Щедрые отступы, как в галерее.',zh:'宽裕的画廊式间距。'},
};
for(const l of ['fr','es','pt','ar','ru','zh']){const f=path.join(__dirname,'..','..','lib/i18n/messages',l+'.json');const raw=fs.readFileSync(f,'utf8');const eol=raw.includes('\r\n')?'\r\n':'\n';const j=JSON.parse(raw);
for(const [k,v] of Object.entries(T)) if(!(k in j)) j[k]=v[l];
fs.writeFileSync(f,JSON.stringify(j,null,2).replace(/\n/g,eol)+(raw.endsWith('\n')?eol:''));
for(const k of ['Airy','Tight','Standard','Vertical spacing','Title weight','Regular','Medium','Semibold','Bold']) if(!(k in j)) console.log(l,'missing',k);}
console.log('ok');
