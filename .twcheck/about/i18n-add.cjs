const fs = require('fs');
const path = require('path');
const T = {
  'Button style': { fr: 'Style du bouton', es: 'Estilo del botón', pt: 'Estilo do botão', ar: 'نمط الزر', ru: 'Стиль кнопки', zh: '按钮样式' },
  'Arrow link': { fr: 'Lien fléché', es: 'Enlace con flecha', pt: 'Link com seta', ar: 'رابط بسهم', ru: 'Ссылка со стрелкой', zh: '箭头链接' },
  'Round arrow': { fr: 'Flèche ronde', es: 'Flecha redonda', pt: 'Seta redonda', ar: 'سهم دائري', ru: 'Круглая стрелка', zh: '圆形箭头' },
  'Filled pill in the accent colour.': { fr: 'Pastille pleine à la couleur d’accent.', es: 'Píldora rellena con el color de acento.', pt: 'Pílula preenchida com a cor de destaque.', ar: 'زر ممتلئ بلون التمييز.', ru: 'Заливка акцентным цветом.', zh: '使用强调色填充的胶囊按钮。' },
  'Text, a fine accent rule and an arrow.': { fr: 'Texte, un fin trait d’accent et une flèche.', es: 'Texto, una línea fina de acento y una flecha.', pt: 'Texto, uma linha fina de destaque e uma seta.', ar: 'نص وخط رفيع بلون التمييز وسهم.', ru: 'Текст, тонкая акцентная линия и стрелка.', zh: '文字、细细的强调线和箭头。' },
  'Hairline pill that fills on hover.': { fr: 'Pastille filiforme qui se remplit au survol.', es: 'Píldora de trazo fino que se rellena al pasar el cursor.', pt: 'Pílula de contorno fino que se preenche ao passar o cursor.', ar: 'زر بحدّ رفيع يمتلئ عند التمرير.', ru: 'Тонкий контур, заливается при наведении.', zh: '细线胶囊，悬停时填充。' },
  'Label and a small circle with an arrow.': { fr: 'Libellé et un petit cercle avec une flèche.', es: 'Etiqueta y un pequeño círculo con flecha.', pt: 'Rótulo e um pequeno círculo com seta.', ar: 'نص ودائرة صغيرة بداخلها سهم.', ru: 'Надпись и маленький круг со стрелкой.', zh: '文字加一个带箭头的小圆圈。' },
  'Plain text; an accent line draws across.': { fr: 'Texte simple ; un trait d’accent se déploie.', es: 'Texto simple; una línea de acento se extiende.', pt: 'Texto simples; uma linha de destaque se estende.', ar: 'نص بسيط؛ يمتدّ خط التمييز تحته.', ru: 'Простой текст; акцентная линия растягивается.', zh: '纯文字；强调线会延展。' },
};
for (const l of ['fr', 'es', 'pt', 'ar', 'ru', 'zh']) {
  const f = path.join(__dirname, '..', '..', 'lib/i18n/messages', l + '.json');
  const raw = fs.readFileSync(f, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const j = JSON.parse(raw);
  for (const [k, v] of Object.entries(T)) if (!(k in j)) j[k] = v[l];
  // keep the file's key order convention: sorted like the existing ones (they are locale-sorted)
  const keys = Object.keys(j);
  const sorted = [...keys].sort((a, b) => a.localeCompare(b, 'en'));
  const orderedAlready = keys.every((k, i) => i === 0 || keys[i - 1].localeCompare(k, 'en') <= 0 || true);
  fs.writeFileSync(f, JSON.stringify(j, null, 2).replace(/\n/g, eol) + (raw.endsWith('\n') ? eol : ''));
  console.log(l, Object.keys(j).length);
}
