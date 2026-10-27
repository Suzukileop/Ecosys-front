const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, '..', '..', 'components/portfolio/EditorialAboutUsSection.tsx');
let s = fs.readFileSync(f, 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';
s = s.replace(/\r\n/g, '\n');
const a = `      {showQuote ? (
        <p
          className={\`max-w-[48rem] text-pretty border-t text-[calc(1.5rem*var(--pf-about-scale,1))] font-normal leading-[1.3] sm:text-[calc(1.875rem*var(--pf-about-scale,1))] \${chrome.divider} \${
            hasLeft || hasRight || label || aside ? 'mt-12 pt-8 lg:mt-14' : ''
          }\`}
          style={{ color: presentation.quoteColor }}
        >
          {quote}
        </p>
      ) : null}`;
const b = `      {showQuote ? (
        // The rule spans the whole page; only the line of text is held to a reading width.
        <div className={\`border-t \${chrome.divider} \${hasLeft || hasRight || label || aside ? 'mt-12 pt-8 lg:mt-14' : ''}\`}>
          <p
            className="max-w-[48rem] text-pretty text-[calc(1.5rem*var(--pf-about-scale,1))] font-normal leading-[1.3] sm:text-[calc(1.875rem*var(--pf-about-scale,1))]"
            style={{ color: presentation.quoteColor }}
          >
            {quote}
          </p>
        </div>
      ) : null}`;
if (!s.includes(a)) throw new Error('missing');
fs.writeFileSync(f, s.replace(a, b).replace(/\n/g, eol));
const T = {
  'Folio': { fr: 'Folio', es: 'Folio', pt: 'Folio', ar: 'فوليو', ru: 'Фолио', zh: '页面' },
  'A ruled page: portrait with its caption, headline, plain list, the quote as a closing line.': { fr: 'Une page à filets : portrait et sa légende, titre, liste sobre, la citation en ligne de clôture.', es: 'Una página con filetes: retrato con su pie, titular, lista sencilla y la cita como línea final.', pt: 'Uma página com filetes: retrato com legenda, título, lista simples e a citação como linha final.', ar: 'صفحة بخطوط رفيعة: صورة شخصية مع تعليقها، عنوان، قائمة بسيطة، والاقتباس كسطر ختامي.', ru: 'Страница с линиями: портрет с подписью, заголовок, простой список и цитата как завершающая строка.', zh: '细线分隔的页面：人像及说明、标题、简洁列表，引言作为收尾句。' },
  'The section title is the label on the top rule; a custom subtitle sits opposite it. The portrait is the first photo (or the founder’s photo), with the founder under it; the list is plain unless you pick a bullet.': { fr: 'Le titre de la section est l’étiquette sur le filet du haut ; un sous-titre personnalisé se place en face. Le portrait est la première photo (ou celle du fondateur), avec le fondateur dessous ; la liste est sobre sauf si vous choisissez une puce.', es: 'El título de la sección es la etiqueta sobre el filete superior; un subtítulo personalizado va frente a ella. El retrato es la primera foto (o la del fundador), con el fundador debajo; la lista es sencilla salvo que elijas una viñeta.', pt: 'O título da seção é o rótulo sobre o filete superior; um subtítulo personalizado fica do lado oposto. O retrato é a primeira foto (ou a do fundador), com o fundador abaixo; a lista é simples, a menos que escolha um marcador.', ar: 'عنوان القسم هو التسمية على الخط العلوي، ويظهر العنوان الفرعي المخصص في الجهة المقابلة. الصورة الشخصية هي الصورة الأولى (أو صورة المؤسس) ويظهر المؤسس تحتها؛ والقائمة بسيطة ما لم تختر رمزًا.', ru: 'Название раздела — подпись на верхней линии; свой подзаголовок стоит напротив. Портрет — первое фото (или фото основателя), основатель под ним; список простой, пока вы не выберете маркер.', zh: '栏目标题是顶部细线上的标签；自定义副标题显示在对侧。人像为第一张照片（或创始人照片），创始人信息在其下方；除非选择符号，列表保持简洁。' },
};
for (const l of ['fr', 'es', 'pt', 'ar', 'ru', 'zh']) {
  const jf = path.join(__dirname, '..', '..', 'lib/i18n/messages', l + '.json');
  const j = JSON.parse(fs.readFileSync(jf, 'utf8'));
  for (const [k, v] of Object.entries(T)) if (!(k in j)) j[k] = v[l];
  fs.writeFileSync(jf, JSON.stringify(Object.fromEntries(Object.entries(j).sort(([x], [y]) => x.localeCompare(y, 'en'))), null, 2) + '\n');
}
console.log('ok');
