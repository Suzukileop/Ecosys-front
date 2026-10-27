const fs=require('fs'),path=require('path');
const T={
'Category and role':{fr:'Catégorie et rôle',es:'Categoría y función',pt:'Categoria e função',ar:'الفئة والدور',ru:'Категория и роль',zh:'类别与角色'},
'Category color':{fr:'Couleur de la catégorie',es:'Color de la categoría',pt:'Cor da categoria',ar:'لون الفئة',ru:'Цвет категории',zh:'类别颜色'},
'Role color':{fr:'Couleur du rôle',es:'Color de la función',pt:'Cor da função',ar:'لون الدور',ru:'Цвет роли',zh:'角色颜色'},
'Separator':{fr:'Séparateur',es:'Separador',pt:'Separador',ar:'فاصل',ru:'Разделитель',zh:'分隔线'},
'Separator color':{fr:'Couleur du séparateur',es:'Color del separador',pt:'Cor do separador',ar:'لون الفاصل',ru:'Цвет разделителя',zh:'分隔线颜色'},
'Separator size':{fr:'Taille du séparateur',es:'Tamaño del separador',pt:'Tamanho do separador',ar:'حجم الفاصل',ru:'Размер разделителя',zh:'分隔线大小'},
'Border color':{fr:'Couleur de la bordure',es:'Color del borde',pt:'Cor da borda',ar:'لون الإطار',ru:'Цвет рамки',zh:'边框颜色'},
'Border opacity':{fr:'Opacité de la bordure',es:'Opacidad del borde',pt:'Opacidade da borda',ar:'شفافية الإطار',ru:'Прозрачность рамки',zh:'边框不透明度'},
'Background color':{fr:'Couleur du fond',es:'Color de fondo',pt:'Cor de fundo',ar:'لون الخلفية',ru:'Цвет фона',zh:'背景颜色'},
'Background opacity':{fr:'Opacité du fond',es:'Opacidad del fondo',pt:'Opacidade do fundo',ar:'شفافية الخلفية',ru:'Прозрачность фона',zh:'背景不透明度'},
'Short':{fr:'Court',es:'Corto',pt:'Curto',ar:'قصير',ru:'Короткий',zh:'短'},
'Long':{fr:'Long',es:'Largo',pt:'Longo',ar:'طويل',ru:'Длинный',zh:'长'},
'Small':{fr:'Petit',es:'Pequeño',pt:'Pequeno',ar:'صغير',ru:'Малый',zh:'小'},
'Large':{fr:'Grand',es:'Grande',pt:'Grande',ar:'كبير',ru:'Большой',zh:'大'},
'Muted':{fr:'Atténué',es:'Atenuado',pt:'Atenuado',ar:'خافت',ru:'Приглушённый',zh:'柔和'},
'No rule between category and role.':{fr:'Aucun trait entre la catégorie et le rôle.',es:'Sin línea entre la categoría y la función.',pt:'Sem linha entre a categoria e a função.',ar:'بلا خط بين الفئة والدور.',ru:'Без линии между категорией и ролью.',zh:'类别与角色之间无分隔线。'},
'A short rule, centered.':{fr:'Un petit trait, centré.',es:'Una línea corta, centrada.',pt:'Uma linha curta, centralizada.',ar:'خط قصير في المنتصف.',ru:'Короткая линия по центру.',zh:'居中的短线。'},
'A rule across the full width.':{fr:'Un trait sur toute la largeur.',es:'Una línea de ancho completo.',pt:'Uma linha de largura total.',ar:'خط بعرض كامل.',ru:'Линия на всю ширину.',zh:'贯穿全宽的线。'},
'A fine, short rule.':{fr:'Un trait fin et court.',es:'Una línea fina y corta.',pt:'Uma linha fina e curta.',ar:'خط رفيع وقصير.',ru:'Тонкая короткая линия.',zh:'细而短的线。'},
'Balanced thickness and length.':{fr:'Épaisseur et longueur équilibrées.',es:'Grosor y longitud equilibrados.',pt:'Espessura e comprimento equilibrados.',ar:'سماكة وطول متوازنان.',ru:'Сбалансированные толщина и длина.',zh:'粗细与长度均衡。'},
'A bolder, longer rule.':{fr:'Un trait plus épais et plus long.',es:'Una línea más gruesa y larga.',pt:'Uma linha mais grossa e longa.',ar:'خط أسمك وأطول.',ru:'Более толстая и длинная линия.',zh:'更粗更长的线。'},
};
const miss={};
for(const l of ['fr','es','pt','ar','ru','zh']){const f=path.join(__dirname,'..','..','lib/i18n/messages',l+'.json');const raw=fs.readFileSync(f,'utf8');const eol=raw.includes('\r\n')?'\r\n':'\n';const j=JSON.parse(raw);
for(const [k,v] of Object.entries(T)) if(!(k in j)) {j[k]=v[l];(miss[k]=miss[k]||[]).push(l);}
fs.writeFileSync(f,JSON.stringify(j,null,2).replace(/\n/g,eol)+(raw.endsWith('\n')?eol:''));}
console.log(Object.keys(miss).length,'keys added in some langs');
