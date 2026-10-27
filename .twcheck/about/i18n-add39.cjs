const fs=require('fs'),path=require('path');
const T={
'Portrait shape':{fr:'Forme du portrait',es:'Forma del retrato',pt:'Forma do retrato',ar:'شكل الصورة الشخصية',ru:'Форма портрета',zh:'肖像形状'},
'Rectangle':{fr:'Rectangle',es:'Rectángulo',pt:'Retângulo',ar:'مستطيل',ru:'Прямоугольник',zh:'矩形'},
'The straight-edged portrait (default).':{fr:'Le portrait aux bords droits (par défaut).',es:'El retrato de bordes rectos (predeterminado).',pt:'O retrato de bordas retas (padrão).',ar:'الصورة بحواف مستقيمة (الافتراضي).',ru:'Портрет с прямыми краями (по умолчанию).',zh:'直边肖像（默认）。'},
'Arch':{fr:'Arche',es:'Arco',pt:'Arco',ar:'قوس',ru:'Арка',zh:'拱形'},
'Rounded top, straight bottom.':{fr:'Haut arrondi, bas droit.',es:'Parte superior redondeada, inferior recta.',pt:'Topo arredondado, base reta.',ar:'أعلى مقوّس وأسفل مستقيم.',ru:'Закруглённый верх, прямой низ.',zh:'顶部圆润，底部平直。'},
'Circle':{fr:'Cercle',es:'Círculo',pt:'Círculo',ar:'دائرة',ru:'Круг',zh:'圆形'},
'Round portrait with a fine accent ring.':{fr:'Portrait rond avec un fin anneau d’accent.',es:'Retrato redondo con un fino anillo de acento.',pt:'Retrato redondo com um fino anel de destaque.',ar:'صورة دائرية بحلقة رفيعة بلون التمييز.',ru:'Круглый портрет с тонким акцентным кольцом.',zh:'圆形肖像，带细细的强调环。'},
'Inner frame':{fr:'Cadre intérieur',es:'Marco interior',pt:'Moldura interna',ar:'إطار داخلي',ru:'Внутренняя рамка',zh:'内框'},
'Rectangle with a fine accent frame inside.':{fr:'Rectangle avec un fin cadre d’accent à l’intérieur.',es:'Rectángulo con un fino marco de acento en el interior.',pt:'Retângulo com uma fina moldura de destaque por dentro.',ar:'مستطيل بإطار رفيع داخلي بلون التمييز.',ru:'Прямоугольник с тонкой акцентной рамкой внутри.',zh:'矩形，内部带细细的强调框。'},
'Asymmetric':{fr:'Asymétrique',es:'Asimétrico',pt:'Assimétrico',ar:'غير متماثل',ru:'Асимметричная',zh:'不对称'},
'Two opposite corners rounded.':{fr:'Deux coins opposés arrondis.',es:'Dos esquinas opuestas redondeadas.',pt:'Dois cantos opostos arredondados.',ar:'زاويتان متقابلتان مستديرتان.',ru:'Два противоположных угла закруглены.',zh:'两个对角圆角。'},
};
for(const l of ['fr','es','pt','ar','ru','zh']){const f=path.join(__dirname,'..','..','lib/i18n/messages',l+'.json');const raw=fs.readFileSync(f,'utf8');const eol=raw.includes('\r\n')?'\r\n':'\n';const j=JSON.parse(raw);
for(const [k,v] of Object.entries(T)) if(!(k in j)) j[k]=v[l];
fs.writeFileSync(f,JSON.stringify(j,null,2).replace(/\n/g,eol)+(raw.endsWith('\n')?eol:''));}
console.log('ok');
