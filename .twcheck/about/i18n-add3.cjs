const fs = require('fs');
const path = require('path');
const T = {
  'Split': { fr: 'Split', es: 'Dividido', pt: 'Dividido', ar: 'مقسوم', ru: 'Сплит', zh: '分栏' },
  'Split style': { fr: 'Style du split', es: 'Estilo del diseño dividido', pt: 'Estilo do design dividido', ar: 'نمط التقسيم', ru: 'Стиль сплита', zh: '分栏样式' },
  'Offset': { fr: 'Décalé', es: 'Desplazado', pt: 'Deslocado', ar: 'متداخل', ru: 'Со смещением', zh: '错位' },
  'Frames': { fr: 'Cadres', es: 'Marcos', pt: 'Molduras', ar: 'إطارات', ru: 'Рамки', zh: '相框' },
  'Large photo': { fr: 'Grande photo', es: 'Foto grande', pt: 'Foto grande', ar: 'صورة كبيرة', ru: 'Большое фото', zh: '大图' },
  'One large photo, or two set offset.': { fr: 'Une grande photo, ou deux décalées.', es: 'Una foto grande, o dos desplazadas.', pt: 'Uma foto grande, ou duas deslocadas.', ar: 'صورة كبيرة، أو صورتان متداخلتان.', ru: 'Одно большое фото или два со смещением.', zh: '一张大图，或两张错位摆放。' },
  'Several framed images, founder under the button.': { fr: 'Plusieurs images encadrées, fondateur sous le bouton.', es: 'Varias imágenes con marco, fundador bajo el botón.', pt: 'Várias imagens com moldura, fundador sob o botão.', ar: 'عدة صور بإطارات، والمؤسس تحت الزر.', ru: 'Несколько изображений в рамках, основатель под кнопкой.', zh: '多张带框图片，创始人位于按钮下方。' },
  'One big rounded photo, text and list beside it.': { fr: 'Une grande photo arrondie, texte et liste à côté.', es: 'Una foto grande redondeada, con texto y lista al lado.', pt: 'Uma foto grande arredondada, com texto e lista ao lado.', ar: 'صورة كبيرة بزوايا مدورة، والنص والقائمة بجانبها.', ru: 'Одно большое скруглённое фото, рядом текст и список.', zh: '一张圆角大图，文字和列表在旁边。' },
  'Text on one side, photos on the other. Switch between offset, framed and large-photo styles.': { fr: 'Texte d’un côté, photos de l’autre. Basculez entre les styles décalé, cadres et grande photo.', es: 'Texto a un lado, fotos al otro. Cambia entre los estilos desplazado, marcos y foto grande.', pt: 'Texto de um lado, fotos do outro. Alterne entre os estilos deslocado, molduras e foto grande.', ar: 'نص في جانب وصور في الآخر. بدّل بين الأنماط: متداخل وإطارات وصورة كبيرة.', ru: 'Текст с одной стороны, фото с другой. Переключайтесь между стилями: со смещением, рамки и большое фото.', zh: '一侧文字，另一侧图片。可在错位、相框和大图样式之间切换。' },
};
for (const l of ['fr', 'es', 'pt', 'ar', 'ru', 'zh']) {
  const f = path.join(__dirname, '..', '..', 'lib/i18n/messages', l + '.json');
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const [k, v] of Object.entries(T)) if (!(k in j)) j[k] = v[l];
  const s = Object.fromEntries(Object.entries(j).sort(([a], [b]) => a.localeCompare(b, 'en')));
  fs.writeFileSync(f, JSON.stringify(s, null, 2) + '\n');
}
console.log('ok');
