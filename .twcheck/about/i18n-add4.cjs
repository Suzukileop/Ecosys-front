const fs = require('fs');
const path = require('path');
const HINT = 'The section title is the small label above the headline; a custom subtitle sits opposite it. The first photo, quote, list and founder come from Information → About us. Flip the photo left or right.';
const DESC = 'Huge headline, a wide photo with the quote, a numbered list set between hairlines.';
const T = {
  'Editorial': { fr: 'Éditorial', es: 'Editorial', pt: 'Editorial', ar: 'تحريري', ru: 'Редакционный', zh: '杂志风' },
  [DESC]: { fr: 'Titre géant, grande photo avec la citation, liste numérotée entre des filets.', es: 'Titular enorme, una foto ancha con la cita y una lista numerada entre líneas finas.', pt: 'Título enorme, uma foto larga com a citação e uma lista numerada entre linhas finas.', ar: 'عنوان ضخم وصورة عريضة مع الاقتباس وقائمة مرقمة بين خطوط رفيعة.', ru: 'Огромный заголовок, широкое фото с цитатой и нумерованный список между тонкими линиями.', zh: '超大标题、配引言的宽幅照片，以及细线分隔的编号列表。' },
  [HINT]: { fr: 'Le titre de la section est la petite étiquette au-dessus du grand titre ; un sous-titre personnalisé se place en face. La première photo, la citation, la liste et le fondateur viennent de Information → About us. Inversez la photo à gauche ou à droite.', es: 'El título de la sección es la pequeña etiqueta sobre el titular; un subtítulo personalizado va frente a ella. La primera foto, la cita, la lista y el fundador vienen de Información → About us. Cambia la foto a izquierda o derecha.', pt: 'O título da seção é o pequeno rótulo acima do título principal; um subtítulo personalizado fica do lado oposto. A primeira foto, a citação, a lista e o fundador vêm de Informações → About us. Inverta a foto para esquerda ou direita.', ar: 'عنوان القسم هو التسمية الصغيرة فوق العنوان الكبير، ويظهر العنوان الفرعي المخصص في الجهة المقابلة. الصورة الأولى والاقتباس والقائمة والمؤسس تأتي من المعلومات ← About us. اقلب الصورة يمينًا أو يسارًا.', ru: 'Название раздела — маленькая подпись над заголовком; свой подзаголовок стоит напротив. Первое фото, цитата, список и основатель берутся из «Информация → About us». Переверните фото влево или вправо.', zh: '栏目标题是大标题上方的小标签；自定义副标题显示在对侧。第一张照片、引言、列表和创始人来自“信息 → About us”。可将照片翻转到左侧或右侧。' },
};
for (const l of ['fr', 'es', 'pt', 'ar', 'ru', 'zh']) {
  const f = path.join(__dirname, '..', '..', 'lib/i18n/messages', l + '.json');
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const [k, v] of Object.entries(T)) if (!(k in j)) j[k] = v[l];
  fs.writeFileSync(f, JSON.stringify(Object.fromEntries(Object.entries(j).sort(([a], [b]) => a.localeCompare(b, 'en'))), null, 2) + '\n');
}
console.log('ok');
