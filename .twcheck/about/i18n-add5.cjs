const fs = require('fs');
const path = require('path');
const T = {
  'Headline': { fr: 'Grand titre', es: 'Titular', pt: 'Título principal', ar: 'العنوان الرئيسي', ru: 'Заголовок', zh: '主标题' },
  'Headline color': { fr: 'Couleur du grand titre', es: 'Color del titular', pt: 'Cor do título principal', ar: 'لون العنوان الرئيسي', ru: 'Цвет заголовка', zh: '主标题颜色' },
  'Headline size': { fr: 'Taille du grand titre', es: 'Tamaño del titular', pt: 'Tamanho do título principal', ar: 'حجم العنوان الرئيسي', ru: 'Размер заголовка', zh: '主标题大小' },
  'Desktop size; it steps down on smaller screens. Text size no longer changes the headline.': { fr: 'Taille sur ordinateur ; elle diminue sur les petits écrans. Le réglage Text size ne modifie plus ce titre.', es: 'Tamaño en escritorio; disminuye en pantallas pequeñas. Text size ya no cambia el titular.', pt: 'Tamanho no desktop; diminui em telas menores. Text size não altera mais o título.', ar: 'الحجم على الحاسوب؛ ويصغر على الشاشات الأصغر. لم يعد Text size يغيّر هذا العنوان.', ru: 'Размер на компьютере; на малых экранах уменьшается. Text size больше не влияет на заголовок.', zh: '桌面端大小；小屏幕上会自动缩小。Text size 不再影响此标题。' },
  'Automatic: follows the screen width and the Text size setting.': { fr: 'Automatique : suit la largeur de l’écran et le réglage Text size.', es: 'Automático: sigue el ancho de pantalla y el ajuste Text size.', pt: 'Automático: acompanha a largura da tela e o ajuste Text size.', ar: 'تلقائي: يتبع عرض الشاشة وإعداد Text size.', ru: 'Автоматически: зависит от ширины экрана и настройки Text size.', zh: '自动：跟随屏幕宽度和 Text size 设置。' },
  'Reset headline to automatic': { fr: 'Remettre le grand titre en automatique', es: 'Restablecer el titular a automático', pt: 'Redefinir o título principal para automático', ar: 'إعادة العنوان الرئيسي إلى الوضع التلقائي', ru: 'Вернуть заголовок к автоматическим настройкам', zh: '将主标题恢复为自动' },
};
for (const l of ['fr', 'es', 'pt', 'ar', 'ru', 'zh']) {
  const f = path.join(__dirname, '..', '..', 'lib/i18n/messages', l + '.json');
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const [k, v] of Object.entries(T)) if (!(k in j)) j[k] = v[l];
  fs.writeFileSync(f, JSON.stringify(Object.fromEntries(Object.entries(j).sort(([a], [b]) => a.localeCompare(b, 'en'))), null, 2) + '\n');
}
console.log('ok');
