#!/usr/bin/env node
/*
 * Wraps the string branches of conditionals rendered as text with t():
 *
 *   {status === 'saving' ? 'Saving' : status === 'saved' ? 'Saved' : null}
 *     →  {status === 'saving' ? t('Saving') : status === 'saved' ? t('Saved') : null}
 *
 *   node scripts/i18n/wrap-conditionals.mjs <file|dir>… [--dry]
 *
 * Only conditionals that sit directly in a JSX child `{…}` or a wording attribute (title, label,
 * placeholder, aria-label, …) are touched — never className, values, keys or comparisons. Files
 * then need `const t = useT()` where it is missing; the type checker lists those.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const WORDING_ATTR = /^(title|label|placeholder|alt|aria-label|aria-description|description|hint|helperText|caption|tooltip|subtitle|emptyLabel|actionLabel|info|confirmLabel|cancelLabel|heading)$/;
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const targets = args.filter((arg) => !arg.startsWith('--')).map((target) => path.resolve(ROOT, target));

function isWording(value) {
  const text = value.trim();
  if (text.length < 2 || !/[A-Za-z]{2}/.test(text)) return false;
  if (/^[a-z0-9_.:/#-]+$/.test(text) || /^[A-Z0-9_]+$/.test(text)) return false;
  if (/^(https?:|mailto:|\/|#|\(min-|\(max-)/.test(text) || /^M[\d.\s,-]/.test(text)) return false;
  const tokens = text.split(/\s+/);
  if (tokens.every((token) => /[-:[\]/#!]/.test(token)) && !/[A-Z][a-z]+ [a-z]/.test(text)) return false;
  return /^[A-Z“"‘(…0-9À-Ý]/.test(text) || /\s/.test(text);
}

function walk(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return target.endsWith('.tsx') ? [target] : [];
  return fs.readdirSync(target).flatMap((entry) => (entry === 'node_modules' ? [] : walk(path.join(target, entry))));
}

let total = 0;
for (const file of targets.flatMap(walk)) {
  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const branches = (node) => {
    if (ts.isParenthesizedExpression(node)) return branches(node.expression);
    if (ts.isConditionalExpression(node)) return [...branches(node.whenTrue), ...branches(node.whenFalse)];
    if (ts.isBinaryExpression(node) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(node.operatorToken.kind)) {
      return node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ? branches(node.right) : [...branches(node.left), ...branches(node.right)];
    }
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && isWording(node.text)) return [node];
    return [];
  };
  const visit = (node) => {
    if (ts.isJsxExpression(node) && node.expression) {
      const parent = node.parent;
      const rendered = ts.isJsxElement(parent) || ts.isJsxFragment(parent) || (ts.isJsxAttribute(parent) && WORDING_ATTR.test(parent.name.getText(sf)));
      const expr = node.expression;
      const isChoice = ts.isConditionalExpression(expr) || (ts.isBinaryExpression(expr) && expr.operatorToken.kind !== ts.SyntaxKind.EqualsEqualsEqualsToken) || ts.isParenthesizedExpression(expr);
      if (rendered && isChoice) {
        for (const literal of branches(expr)) {
          const parentCall = literal.parent;
          if (ts.isCallExpression(parentCall)) continue;
          edits.push({ start: literal.getStart(sf), end: literal.getEnd(), text: `t(${literal.getText(sf)})` });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (!edits.length) continue;
  total += edits.length;
  console.log(`${String(edits.length).padStart(4)}  ${path.relative(ROOT, file)}${dry ? '  ' + edits.map((edit) => edit.text).join(' | ').slice(0, 160) : ''}`);
  if (dry) continue;
  let out = text;
  for (const edit of edits.sort((a, b) => b.start - a.start)) out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
  fs.writeFileSync(file, out);
}
console.log(`\n${total} branches${dry ? ' (dry run)' : ''}.`);
