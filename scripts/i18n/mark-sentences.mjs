#!/usr/bin/env node
/*
 * Marks user-facing sentences in a plain module (lib/ helpers, message tables) with msg('…'):
 * string literals with a space that end like a sentence (. ? ! …), outside imports, console calls,
 * throws and calls that already translate. The code that shows them must still pass them to
 * t() / tr() — msg() only lets the dictionary script find them.
 *
 *   node scripts/i18n/mark-sentences.mjs <file>… [--dry] [--loose]
 *
 * --loose also takes short capitalised labels without a final stop ("Saved", "Not found").
 */
import fs from 'node:fs';
import ts from 'typescript';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const loose = args.includes('--loose');
const files = args.filter((arg) => !arg.startsWith('--'));
const IMPORT_LINE = "import { msg } from '@/lib/i18n/config';";
const SKIP_CALLS = /^(msg|t|tr|t\.rich|t\.plural|console\.\w+|require|fetch|new \w+|\w+\.(includes|startsWith|endsWith|split|replace|test|match|get|set|has|getItem|setItem|querySelector|querySelectorAll|addEventListener))$/;

function isSentence(text) {
  const value = text.trim();
  if (!/[A-Za-z]{2,}/.test(value) || /^(https?:|\/|#|\.)/.test(value) || /\$\{/.test(value)) return false;
  if (/\s/.test(value) && /[.?!…:]$/.test(value)) return true;
  return loose && /^[A-Z][a-z]+(\s+[a-zA-Z’'-]+)*$/.test(value);
}

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits = [];
  const skipped = (node) => {
    for (let current = node.parent; current; current = current.parent) {
      if (ts.isCallExpression(current) || ts.isNewExpression(current)) {
        const callee = (ts.isNewExpression(current) ? 'new ' : '') + current.expression.getText(sf);
        if (SKIP_CALLS.test(callee)) return true;
      }
      if (ts.isImportDeclaration(current) || ts.isExportDeclaration(current) || ts.isThrowStatement(current) || ts.isTypeNode(current)) return true;
      if (ts.isPropertyAssignment(current) && current.name === node) return true;
      if (ts.isJsxAttribute(current)) return true;
      if (ts.isBinaryExpression(current) && /^(===|!==|==|!=)$/.test(current.operatorToken.getText(sf))) return true;
    }
    return false;
  };
  const visit = (node) => {
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && isSentence(node.text) && !skipped(node)) {
      edits.push({ start: node.getStart(sf), end: node.getEnd(), text: `msg(${node.getText(sf)})` });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (edits.length && !/import \{[^}]*\bmsg\b[^}]*\} from '@\/lib\/i18n\/config'/.test(source)) {
    const imports = sf.statements.filter(ts.isImportDeclaration);
    const anchor = imports.length ? imports[imports.length - 1].getEnd() : 0;
    edits.push({ start: anchor, end: anchor, text: anchor ? `\n${IMPORT_LINE}` : `${IMPORT_LINE}\n` });
  }
  edits.sort((a, b) => b.start - a.start);
  let output = source;
  for (const edit of edits) output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  if (!dry && edits.length) fs.writeFileSync(file, output);
  console.log(`${String(edits.length).padStart(4)}  ${file}`);
}
