const fs = require('fs');
const path = require('path');
const T = {
  'Centered': { fr: 'Centré', es: 'Centrado', pt: 'Centralizado', ar: 'متمركز', ru: 'По центру', zh: '居中' },
  'One centred column: round portrait, headline, large quote, the list as a single line.': { fr: 'Une colonne centrée : portrait rond, titre, grande citation, la liste sur une seule ligne.', es: 'Una columna centrada: retrato redondo, titular, cita grande y la lista en una sola línea.', pt: 'Uma coluna centralizada: retrato redondo, título, citação grande e a lista em uma só linha.', ar: 'عمود واحد متمركز: صورة دائرية وعنوان واقتباس كبير والقائمة في سطر واحد.', ru: 'Одна центральная колонка: круглый портрет, заголовок, крупная цитата и список в одну строку.', zh: '单列居中：圆形头像、标题、大号引言，列表排成一行。' },
  'Everything sits on one centred axis. The round portrait is the first photo (or the founder’s photo); the list runs as one line of words, with a dot between them unless you pick a bullet.': { fr: 'Tout est sur un même axe centré. Le portrait rond est la première photo (ou celle du fondateur) ; la liste forme une ligne de mots séparés par un point, sauf si vous choisissez une puce.', es: 'Todo está sobre un mismo eje centrado. El retrato redondo es la primera foto (o la del fundador); la lista forma una línea de palabras con un punto entre ellas, salvo que elijas una viñeta.', pt: 'Tudo fica em um mesmo eixo centralizado. O retrato redondo é a primeira foto (ou a do fundador); a lista forma uma linha de palavras com um ponto entre elas, a menos que escolha um marcador.', ar: 'كل شيء على محور واحد متمركز. الصورة الدائرية هي الصورة الأولى (أو صورة المؤسس)؛ وتظهر القائمة كسطر من الكلمات تفصل بينها نقطة ما لم تختر رمزًا.', ru: 'Всё расположено на одной центральной оси. Круглый портрет — первое фото (или фото основателя); список идёт одной строкой, слова разделены точкой, пока вы не выберете маркер.', zh: '所有内容位于同一条居中轴线上。圆形头像为第一张照片（或创始人照片）；列表排成一行，词语间以圆点分隔，除非选择其他符号。' },
};
for (const l of ['fr', 'es', 'pt', 'ar', 'ru', 'zh']) {
  const f = path.join(__dirname, '..', '..', 'lib/i18n/messages', l + '.json');
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const [k, v] of Object.entries(T)) if (!(k in j)) j[k] = v[l];
  fs.writeFileSync(f, JSON.stringify(Object.fromEntries(Object.entries(j).sort(([a], [b]) => a.localeCompare(b, 'en'))), null, 2) + '\n');
}
console.log('ok');
