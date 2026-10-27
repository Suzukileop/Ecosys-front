const fs = require('fs');
const path = require('path');
const T = {
  'Panorama': { fr: 'Panorama', es: 'Panorama', pt: 'Panorama', ar: 'بانوراما', ru: 'Панорама', zh: '全景' },
  'Headline and lead, a full-width photo, then the list and the quote in columns.': { fr: 'Titre et chapô, photo pleine largeur, puis la liste et la citation en colonnes.', es: 'Titular y entradilla, una foto a todo el ancho, luego la lista y la cita en columnas.', pt: 'Título e texto de abertura, uma foto em largura total, depois a lista e a citação em colunas.', ar: 'عنوان ونص تمهيدي، صورة بعرض كامل، ثم القائمة والاقتباس في أعمدة.', ru: 'Заголовок и подводка, фото на всю ширину, затем список и цитата в колонках.', zh: '标题与导语、通栏照片，然后是分栏的列表和引言。' },
  'The section title is the small label on the left; a custom subtitle closes the page on the right. The first photo, list, quote and founder come from Information → About us.': { fr: 'Le titre de la section est la petite étiquette à gauche ; un sous-titre personnalisé clôt la page à droite. La première photo, la liste, la citation et le fondateur viennent de Information → About us.', es: 'El título de la sección es la pequeña etiqueta de la izquierda; un subtítulo personalizado cierra la página a la derecha. La primera foto, la lista, la cita y el fundador vienen de Información → About us.', pt: 'O título da seção é o pequeno rótulo à esquerda; um subtítulo personalizado fecha a página à direita. A primeira foto, a lista, a citação e o fundador vêm de Informações → About us.', ar: 'عنوان القسم هو التسمية الصغيرة على اليسار، ويُختتم الصفحة عنوان فرعي مخصص على اليمين. الصورة الأولى والقائمة والاقتباس والمؤسس تأتي من المعلومات ← About us.', ru: 'Название раздела — маленькая подпись слева; свой подзаголовок завершает страницу справа. Первое фото, список, цитата и основатель берутся из «Информация → About us».', zh: '栏目标题是左侧的小标签；自定义副标题显示在右侧页脚。第一张照片、列表、引言和创始人来自“信息 → About us”。' },
};
for (const l of ['fr', 'es', 'pt', 'ar', 'ru', 'zh']) {
  const f = path.join(__dirname, '..', '..', 'lib/i18n/messages', l + '.json');
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const [k, v] of Object.entries(T)) if (!(k in j)) j[k] = v[l];
  fs.writeFileSync(f, JSON.stringify(Object.fromEntries(Object.entries(j).sort(([a], [b]) => a.localeCompare(b, 'en'))), null, 2) + '\n');
}
console.log('ok');
