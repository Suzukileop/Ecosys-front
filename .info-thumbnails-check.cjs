const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const sharp = require('sharp');
const root = path.join(process.cwd(), 'components/portfolio');
const theme = { background: '#101010', ink: '#fafafa', muted: '#b8b8b8', accent: '#ef4444', border: '#303030' };
function load(file) {
  const source = fs.readFileSync(file, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS } }).outputText;
  const mod = new Module(file, module);
  mod.filename = file;
  mod.paths = module.paths;
  mod.require = (id) => {
    if (id.includes('i18n/I18nProvider')) return { useT: () => (s) => s === 'About me' ? 'À propos de moi' : s };
    if (id === './portfolio-thumbnail-theme') return { useThumbnailTheme: () => theme };
    if (id.startsWith('./')) return load(path.join(root, id + '.tsx'));
    return require(id);
  };
  mod._compile(compiled, file);
  return mod.exports;
}
(async () => {
  const portrait = (await sharp('public/portfolio-previews/info-designer-portrait.webp').png().toBuffer()).toString('base64');
  const names = ['classic', 'trait', 'split', 'banner', 'platform', 'about-portrait-skills', 'about-manifesto', 'about-terminal', 'about-index', 'about-value-steps'];
  const panels = [];
  for (const name of names) {
    const exports = load(path.join(root, `portfolio-info-${name.startsWith('about-') ? 'remaining' : name}-illustration.tsx`));
    const Component = Object.values(exports)[0];
    let svg = renderToStaticMarkup(React.createElement(Component, { design: name }));
    svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ').replaceAll('href="/portfolio-previews/info-designer-portrait.webp"', `xlink:href="data:image/png;base64,${portrait}"`);
    panels.push(await sharp(Buffer.from(svg)).resize(360, 225).png().toBuffer());
  }
  await sharp({ create: { width: 720, height: 1125, channels: 3, background: '#202020' } })
    .composite(panels.map((input, i) => ({ input, left: (i % 2) * 360, top: Math.floor(i / 2) * 225 })))
    .png().toFile('.info-catalogue-check.png');
  console.log('Rendered all ten Info catalogue previews.');
})();
