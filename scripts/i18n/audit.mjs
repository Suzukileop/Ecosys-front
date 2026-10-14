#!/usr/bin/env node
/*
 * Finds interface text that is not translated yet: English wording outside t(…) / msg(…).
 *
 *   node scripts/i18n/audit.mjs                 count per file, worst first
 *   node scripts/i18n/audit.mjs <file|dir>…     every remaining string with its line
 *
 * Heuristic, so it errs on the side of reporting: ids, CSS classes, URLs, enum values, imports,
 * object keys, comparisons and developer-only messages (console, throw) are left out.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DEFAULT_DIRS = ['app', 'components', 'lib', 'context', 'hooks', 'stores'];
const SKIP_FILES = /(\/|\\)(lib(\/|\\)i18n|scripts)(\/|\\)|\.d\.ts$|\.test\.|\.spec\./;

const NON_WORDING_ATTR =
  /^(className|class|style|href|src|srcSet|id|key|type|name|role|htmlFor|target|rel|method|action|accept|autoComplete|inputMode|enterKeyHint|lang|dir|viewBox|d|fill|stroke|strokeLinecap|strokeLinejoin|xmlns|as|variant|size|tone|placement|align|side|mode|icon|color|tag|data-[\w-]+|aria-(controls|labelledby|describedby|hidden|live|current|haspopup|expanded|selected|checked|pressed|orientation|owns|activedescendant|busy|modal|invalid|disabled|level|sort|autocomplete|relevant|atomic)|sizes|loading|decoding|fetchPriority|crossOrigin|referrerPolicy|sandbox|allow|frameBorder|scrolling|wrap|pattern|form|formAction|encType|download|media|poster|preload|controlsList|capture|kind|srcLang|default|shape|coords|useMap|scope|headers|span|start|step|min|max|minLength|maxLength|cols|rows|tabIndex|spellCheck|translate|hidden|draggable|contentEditable|suppressHydrationWarning|testId|transform|gradientTransform|x|y|x1|x2|y1|y2|cx|cy|r|rx|ry|points|offset|stopColor|stopOpacity|fillRule|clipRule|clipPath|mask|filter|opacity|strokeWidth|strokeDasharray|strokeDashoffset|textAnchor|dominantBaseline|fontSize|fontWeight|fontFamily|letterSpacing|preserveAspectRatio|gradientUnits|patternUnits|width|height)$/;

const DO_NOT_TRANSLATE = new Set(['Skraft', 'News', 'GitHub', 'LinkedIn', 'Google', 'Stripe', 'PayPal', 'WhatsApp', 'JSON', 'PDF', 'URL', 'OK', 'Pro', 'Enterprise', 'Premium']);

/* A Tailwind / CSS class list: every token looks like a utility (has -, :, [, / or is a known bare one). */
function isClassList(value) {
  const tokens = value.split(/\s+/).filter(Boolean);
  const bare = /^(flex|grid|block|inline|hidden|relative|absolute|fixed|sticky|truncate|italic|uppercase|lowercase|capitalize|underline|rounded|border|shadow|transition|group|peer|container|static|contents|grow|shrink|antialiased|transform|filter|outline|ring|isolate|invisible|visible|collapse|table|sr-only|not-sr-only|prose)$/;
  return tokens.length > 0 && tokens.every((token) => /[-:[\]/#]/.test(token) || bare.test(token)) && !/[A-Z][a-z]+ [a-z]/.test(value);
}

function isWording(text) {
  const value = text.trim();
  if (value.length < 2 || DO_NOT_TRANSLATE.has(value)) return false;
  if (value === 'use client' || value === 'use server' || isClassList(value)) return false;
  if (/^\(?(max|min)-(width|height):/.test(value) || /^[\w-]+\/[\w-]+$/.test(value)) return false;
  if (!/[A-Za-z]/.test(value)) return false;
  if (/^(https?:|mailto:|tel:|data:|blob:|\/|#|\.|@|\$|&|\?|=)/.test(value)) return false;
  if (/^[a-z0-9_.:/-]+$/.test(value)) return false; // ids, keys, css tokens, paths
  if (/^[A-Z0-9_]+$/.test(value)) return false; // ENUM_VALUES
  if (/^[\w.-]+\.(png|jpe?g|svg|webp|gif|mp4|webm|json|pdf|css|js|ts|tsx|woff2?)$/i.test(value)) return false;
  if (/^(rgba?|hsla?|var|calc|url|linear-gradient|radial-gradient|translate|scale|rotate|cubic-bezier|inset)\(/.test(value)) return false;
  if (/^#[0-9a-f]{3,8}$/i.test(value)) return false;
  if (/^[\w-]+(\s+[\w:/[\]().%#,&>*~+!-]+)+$/.test(value) && /(^|\s)([a-z]+:)?[a-z]+-[\w[\]./#%-]+/.test(value) && !/[A-Z][a-z]+ [a-z]/.test(value)) return false; // class lists
  if (/^(application|image|video|audio|text|font)\/[\w.+*-]+/.test(value)) return false; // mime types
  if (/^[\w-]+=/.test(value)) return false;
  if (/\$\{|\{\{/.test(value) && !/\s[a-z]+\s/.test(value)) return false;
  return /\s/.test(value) ? /[A-Za-z]{2,}/.test(value) : /^[A-Z][a-z]{1,}/.test(value);
}

const IGNORED_CALLS = /^(t|tr|trPlural|t\.rich|t\.plural|msg|console\.\w+|require|import|fetch|api\.(get|post|put|patch|delete)|localStorage\.\w+|sessionStorage\.\w+|\w+\.(getItem|setItem|removeItem|addEventListener|removeEventListener|querySelector|querySelectorAll|getElementById|closest|matches|setAttribute|getAttribute|removeAttribute|hasAttribute|startsWith|endsWith|includes|split|replace|replaceAll|indexOf|join|padStart|padEnd|toLocaleString|toLocaleDateString|toLocaleTimeString|get|set|has|delete|append|searchParams\.\w+|dispatchEvent)|new (Error|TypeError|RangeError|Event|CustomEvent|URL|URLSearchParams|RegExp|Intl\.\w+|Date|Set|Map|Blob|File)|useStoredChoice|useSearchParams|searchParams\.get|params\.get|cn|clsx|twMerge|cva|z\.\w+|dynamic|matchMedia|Symbol|Intl\.\w+|encodeURIComponent|decodeURIComponent|JSON\.parse|structuredClone|setTimeout|setInterval|keyof|redirect|notFound|router\.(push|replace|prefetch)|window\.(open|location\.assign|location\.replace))$/;

function walk(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return /\.(tsx?|mjs)$/.test(target) ? [target] : [];
  return fs.readdirSync(target).flatMap((entry) => (entry === 'node_modules' || entry.startsWith('.') ? [] : walk(path.join(target, entry))));
}

function audit(file) {
  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const found = [];
  const line = (node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

  const ignoredContext = (node) => {
    for (let current = node.parent; current; current = current.parent) {
      if (ts.isCallExpression(current) || ts.isNewExpression(current)) {
        const callee = (ts.isNewExpression(current) ? 'new ' : '') + current.expression.getText(sf);
        if (IGNORED_CALLS.test(callee)) return true;
      }
      if (ts.isImportDeclaration(current) || ts.isExportDeclaration(current) || ts.isTypeNode(current) || ts.isEnumMember(current)) return true;
      if (ts.isThrowStatement(current)) return true;
      if (ts.isCaseClause(current) && current.expression === node) return true;
      if (ts.isBinaryExpression(current) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.InKeyword].includes(current.operatorToken.kind)) return true;
      if (ts.isJsxAttribute(current)) return NON_WORDING_ATTR.test(current.name.getText(sf));
      if (ts.isPropertyAssignment(current) && current.name === node) return true;
      if (ts.isElementAccessExpression(current) && current.argumentExpression === node) return true;
      if (ts.isTaggedTemplateExpression(current)) return true;
      if (ts.isFunctionLike(current) || ts.isBlock(current) || ts.isSourceFile(current)) return false;
    }
    return false;
  };

  const report = (node, value) => {
    if (!isWording(value) || ignoredContext(node)) return;
    found.push({ line: line(node), text: value.replace(/\s+/g, ' ').trim().slice(0, 100) });
  };

  const visit = (node) => {
    if (ts.isJsxText(node)) {
      const value = node.getText(sf).replace(/\s+/g, ' ').trim();
      if (value && /[A-Za-z]{2,}/.test(value) && !DO_NOT_TRANSLATE.has(value)) found.push({ line: line(node), text: value.slice(0, 100) });
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      report(node, node.text);
    } else if (ts.isTemplateExpression(node)) {
      const literal = [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join('{}');
      report(node, literal);
    }
    if (!ts.isTemplateExpression(node)) ts.forEachChild(node, visit);
    else node.templateSpans.forEach((span) => ts.forEachChild(span.expression, visit));
  };
  visit(sf);
  return found;
}

const args = process.argv.slice(2);
const targets = (args.length ? args : DEFAULT_DIRS).map((target) => path.resolve(ROOT, target)).filter(fs.existsSync);
const files = targets.flatMap(walk).filter((file) => !SKIP_FILES.test(file));
const results = files.map((file) => ({ file: path.relative(ROOT, file), found: audit(file) })).filter((entry) => entry.found.length);

if (args.length) {
  for (const entry of results) {
    console.log(`\n${entry.file} (${entry.found.length})`);
    for (const item of entry.found) console.log(`  ${String(item.line).padStart(5)}  ${item.text}`);
  }
} else {
  results.sort((a, b) => b.found.length - a.found.length);
  for (const entry of results) console.log(`${String(entry.found.length).padStart(5)}  ${entry.file}`);
}
const total = results.reduce((sum, entry) => sum + entry.found.length, 0);
console.log(`\n${total} untranslated strings in ${results.length} files.`);
