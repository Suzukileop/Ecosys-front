#!/usr/bin/env node
/*
 * Marks wording kept in module-level constants with msg('…'), so the dictionary script finds it:
 *
 *   export const SIZE_OPTIONS = [{ value: 4, label: 'Small' }]   →   label: msg('Small')
 *
 *   node scripts/i18n/mark-constants.mjs <file|dir>… [--dry] [--props=label,description,…]
 *
 * Only properties named like wording (label, description, hint, title, placeholder, …) inside
 * top-level `const` initializers are touched, never function bodies. msg() returns its argument,
 * so this changes nothing at runtime: the screen that shows the text still calls t(option.label).
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const propsArg = args.find((arg) => arg.startsWith('--props='));
const PROPS = new RegExp(
  `^(${(propsArg ? propsArg.slice(8).split(',') : ['label', 'description', 'hint', 'title', 'placeholder', 'helper', 'helperText', 'caption', 'tooltip', 'subtitle', 'summary', 'emptyLabel', 'shortLabel', 'longLabel', 'groupLabel', 'sectionLabel', 'ariaLabel']).join('|')})$`,
);
const targets = args.filter((arg) => !arg.startsWith('--'));
const IMPORT_LINE = "import { msg } from '@/lib/i18n/config';";
const DO_NOT_TRANSLATE = new Set(['Skraft', 'News', 'GitHub', 'LinkedIn', 'Google', 'Stripe', 'PayPal', 'WhatsApp', 'JSON', 'PDF', 'URL', 'Pro', 'Enterprise', 'Premium']);

function isWording(text) {
  const value = text.trim();
  if (value.length < 2 || DO_NOT_TRANSLATE.has(value) || !/[A-Za-z]/.test(value)) return false;
  if (/^(https?:|mailto:|\/|#|\.)/.test(value)) return false;
  if (/^[a-z0-9_.:/-]+$/.test(value) || /^[A-Z0-9_]+$/.test(value)) return false;
  return true;
}

function walk(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return /\.(tsx?)$/.test(target) && !target.endsWith('.d.ts') ? [target] : [];
  return fs.readdirSync(target).flatMap((entry) => (entry === 'node_modules' ? [] : walk(path.join(target, entry))));
}

function processFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits = [];

  const wrapLiteral = (node) => {
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && isWording(node.text)) {
      edits.push({ start: node.getStart(sf), end: node.getEnd(), text: `msg(${node.getText(sf)})` });
    }
  };

  const visit = (node) => {
    /* Never inside functions: those strings belong to a component or a helper. */
    if (ts.isFunctionLike(node)) return;
    if (ts.isCallExpression(node) && node.expression.getText(sf) === 'msg') return;
    if (ts.isPropertyAssignment(node)) {
      const name = node.name.getText(sf).replace(/['"]/g, '');
      if (PROPS.test(name)) {
        const value = ts.isAsExpression(node.initializer) || ts.isSatisfiesExpression?.(node.initializer) ? node.initializer.expression : node.initializer;
        if (ts.isArrayLiteralExpression(value)) value.elements.forEach(wrapLiteral);
        else if (ts.isConditionalExpression(value)) [value.whenTrue, value.whenFalse].forEach(wrapLiteral);
        else wrapLiteral(value);
      }
    }
    ts.forEachChild(node, visit);
  };

  for (const statement of sf.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) if (decl.initializer) visit(decl.initializer);
    } else if (ts.isExportAssignment(statement)) {
      visit(statement.expression);
    }
  }
  if (edits.length === 0) return 0;

  if (!/import \{[^}]*\bmsg\b[^}]*\} from '@\/lib\/i18n\/config'/.test(source)) {
    const imports = sf.statements.filter(ts.isImportDeclaration);
    const directive = sf.statements[0] && ts.isExpressionStatement(sf.statements[0]) && ts.isStringLiteral(sf.statements[0].expression) ? sf.statements[0] : null;
    const anchor = imports.length ? imports[imports.length - 1].getEnd() : directive ? directive.getEnd() : 0;
    edits.push({ start: anchor, end: anchor, text: anchor === 0 ? `${IMPORT_LINE}\n` : `\n${IMPORT_LINE}` });
  }

  edits.sort((a, b) => b.start - a.start);
  let output = source;
  for (const edit of edits) output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  if (!dry) fs.writeFileSync(file, output);
  return edits.length - (output.includes(IMPORT_LINE) && !source.includes(IMPORT_LINE) ? 1 : 0);
}

let total = 0;
for (const file of targets.flatMap(walk)) {
  const count = processFile(file);
  if (count) {
    total += count;
    console.log(`${String(count).padStart(5)}  ${path.relative(process.cwd(), file)}`);
  }
}
console.log(`\n${total} strings marked${dry ? ' (dry run)' : ''}.`);
