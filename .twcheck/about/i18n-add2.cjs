const fs = require('fs');
const path = require('path');
const T = {
  'List bullets': { fr: 'Puces de liste', es: 'Viñetas de lista', pt: 'Marcadores de lista', ar: 'رموز القائمة', ru: 'Маркеры списка', zh: '列表符号' },
  'Task list bullet': { fr: 'Puce de la liste', es: 'Viñeta de la lista', pt: 'Marcador da lista', ar: 'رمز عناصر القائمة', ru: 'Маркер списка', zh: '列表项符号' },
  'Use this design’s default bullet': { fr: 'Revenir à la puce par défaut du design', es: 'Volver a la viñeta predeterminada del diseño', pt: 'Voltar ao marcador padrão do design', ar: 'العودة إلى الرمز الافتراضي للتصميم', ru: 'Вернуть маркер по умолчанию для дизайна', zh: '恢复该设计的默认符号' },
};
for (const l of ['fr', 'es', 'pt', 'ar', 'ru', 'zh']) {
  const f = path.join(__dirname, '..', '..', 'lib/i18n/messages', l + '.json');
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const [k, v] of Object.entries(T)) if (!(k in j)) j[k] = v[l];
  const s = Object.fromEntries(Object.entries(j).sort(([a], [b]) => a.localeCompare(b, 'en')));
  fs.writeFileSync(f, JSON.stringify(s, null, 2) + '\n');
}
const j = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'lib/i18n/messages/fr.json'), 'utf8'));
console.log(['Disque', 'Point doux', 'Tiret', 'Flèche', 'Chevron', 'Coche', 'Coche ronde', 'Cible', 'Carré', 'Chiffres', 'Romains', 'Aucun'].filter((k) => !(k in j)).join(',') || 'all option labels already translated');
