const Module = require('module'); const path = require('path'); const fs = require('fs'); const ts = require('typescript');
const root = path.resolve(__dirname, '..', '..');
const orig = Module._resolveFilename;
Module._resolveFilename = function (req, parent, ...r) {
  if (req.startsWith('@/')) req = path.join(root, req.slice(2));
  if (/\.(css|svg|png)$/.test(req)) return path.join(__dirname, 'stub.cjs');
  try { return orig.call(this, req, parent, ...r); } catch (e) { for (const x of ['.ts', '.tsx', '/index.ts']) { const p = (path.isAbsolute(req) ? req : path.resolve(path.dirname(parent.filename), req)) + x; if (fs.existsSync(p)) return p; } throw e; }
};
fs.writeFileSync(path.join(__dirname, 'stub.cjs'), 'module.exports={};');
const REQ = /^(?:const|var) \w+ = (?:__importDefault\(|__importStar\()?require\([^\n]*\);?$/gm;
for (const ext of ['.ts', '.tsx']) Module._extensions[ext] = function (m, f) {
  const out = ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: f });
  const reqs = []; let code = out.outputText.replace(REQ, (x) => { reqs.push(x); return ''; });
  const h = code.lastIndexOf('Object.defineProperty(exports, "__esModule"'); const cut = h >= 0 ? code.indexOf('\n', h) + 1 : 0;
  m._compile(code.slice(0, cut) + reqs.join('\n') + '\n' + code.slice(cut), f);
};
require(path.join(root, 'lib/i18n/config'));
const m = require(path.join(root, 'components/portfolio/portfolio-about-us-settings'));
const stored = { design: 'split-overlap', showQuote: true, showFounder: true, taskBulletStyle: 'arrow', ctaStyle: 'outline' };
const out = m.pickAboutUsPresentationSettings(stored);
console.log(JSON.stringify({ design: out.design, showQuote: out.showQuote, showFounder: out.showFounder, taskBulletStyle: out.taskBulletStyle, ctaStyle: out.ctaStyle }));
