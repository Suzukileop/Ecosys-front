#!/usr/bin/env node
/*
 * Dictionary upkeep for lib/i18n/messages/<locale>.json (English source strings are the keys).
 *
 *   node scripts/i18n/i18n.mjs check                      missing / unused keys per language
 *   node scripts/i18n/i18n.mjs missing <out.tsv>          numbered list of keys some language lacks
 *   node scripts/i18n/i18n.mjs merge <out.tsv> <tr.tsv>   add translations: rows "id<TAB>fr<TAB>es<TAB>pt<TAB>ar<TAB>ru<TAB>zh[<TAB>en]"
 *                                                         (en: only for source text still written in French)
 *   node scripts/i18n/i18n.mjs prune                      drop keys no longer used in the code
 *
 * Keys are read from the code: the string argument of t('…'), t.rich('…'), msg('…') and the plural
 * ("other") form of t.plural(n, 'one', 'other'). A plural translation cell holds its CLDR forms as
 * "one=…|few=…|many=…|other=…"; any other cell is a plain string. An empty cell is skipped.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MESSAGES = path.join(ROOT, 'lib', 'i18n', 'messages');
const LOCALES = ['fr', 'es', 'pt', 'ar', 'ru', 'zh'];
const SOURCES = ['app', 'components', 'lib', 'context', 'hooks', 'stores'];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : walk(full);
    return /\.(tsx?|mjs)$/.test(entry.name) && !entry.name.endsWith('.d.ts') ? [full] : [];
  });
}

/** key → { plural: bool, one?: string, files: Set } */
function extractKeys() {
  const keys = new Map();
  const add = (key, info, file) => {
    const entry = keys.get(key) ?? { plural: false, files: new Set() };
    if (info.plural) {
      entry.plural = true;
      entry.one = info.one;
    }
    entry.files.add(path.relative(ROOT, file));
    keys.set(key, entry);
  };
  for (const file of SOURCES.flatMap((dir) => walk(path.join(ROOT, dir)))) {
    const text = fs.readFileSync(file, 'utf8');
    if (!/\b(t|tr|msg|trPlural)(\.rich|\.plural)?\(/.test(text)) continue;
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const literal = (node) => (node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : null);
    const visit = (node) => {
      if (ts.isCallExpression(node)) {
        const callee = node.expression.getText(sf);
        if (callee === 't' || callee === 't.rich' || callee === 'msg' || callee === 'tr') {
          const key = literal(node.arguments[0]);
          if (key) add(key, {}, file);
        } else if (callee === 't.plural' || callee === 'trPlural') {
          const one = literal(node.arguments[1]);
          const other = literal(node.arguments[2]);
          if (other) add(other, { plural: true, one }, file);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  return keys;
}

function readMessages(locale) {
  const file = path.join(MESSAGES, `${locale}.json`);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
}

function writeMessages(locale, messages) {
  const sorted = Object.fromEntries(Object.entries(messages).sort(([a], [b]) => a.localeCompare(b, 'en')));
  fs.writeFileSync(path.join(MESSAGES, `${locale}.json`), `${JSON.stringify(sorted, null, 2)}\n`);
}

function isTranslated(entry, plural) {
  if (plural) return entry && typeof entry === 'object' && Boolean(entry.other);
  return typeof entry === 'string' && entry.length > 0;
}

const [command, ...rest] = process.argv.slice(2);
const keys = extractKeys();

if (command === 'check' || !command) {
  console.log(`${keys.size} keys in the code.`);
  for (const locale of LOCALES) {
    const messages = readMessages(locale);
    const missing = [...keys].filter(([key, info]) => !isTranslated(messages[key], info.plural)).length;
    const unused = Object.keys(messages).filter((key) => !keys.has(key)).length;
    console.log(`  ${locale}: ${keys.size - missing} translated, ${missing} missing, ${unused} unused`);
  }
} else if (command === 'missing') {
  const out = rest[0];
  if (!out) throw new Error('missing <out.tsv>');
  const all = LOCALES.map(readMessages);
  const rows = [...keys]
    .filter(([key, info]) => all.some((messages) => !isTranslated(messages[key], info.plural)))
    .map(([key, info], index) => [index + 1, info.plural ? `plural|${info.one ?? ''}` : 's', key]);
  const escape = (value) => String(value).replace(/\t/g, '\\t').replace(/\n/g, '\\n');
  fs.writeFileSync(out, rows.map((row) => row.map(escape).join('\t')).join('\n') + '\n');
  console.log(`${rows.length} keys to translate → ${out}`);
} else if (command === 'merge') {
  const [listFile, translationsFile] = rest;
  const unescape = (value) => value.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  const list = new Map(
    fs
      .readFileSync(listFile, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const [id, kind, key] = line.split('\t');
        return [id, { plural: kind.startsWith('plural'), key: unescape(key) }];
      }),
  );
  const TARGETS = [...LOCALES, 'en'];
  const all = Object.fromEntries(TARGETS.map((locale) => [locale, readMessages(locale)]));
  let added = 0;
  const problems = [];
  for (const line of fs.readFileSync(translationsFile, 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [id, ...cells] = line.split('\t');
    const item = list.get(id.trim());
    if (!item) {
      problems.push(`unknown id ${id}`);
      continue;
    }
    TARGETS.forEach((locale, index) => {
      const cell = cells[index] !== undefined ? unescape(cells[index].trim()) : '';
      if (!cell) return;
      let value = cell;
      if (item.plural) {
        value = Object.fromEntries(
          cell.split('|').map((form) => {
            const at = form.indexOf('=');
            return [form.slice(0, at).trim(), form.slice(at + 1)];
          }),
        );
        if (!value.other) {
          problems.push(`${id} ${locale}: plural without "other"`);
          return;
        }
      }
      /* Every {placeholder} of the source must survive the translation. */
      const wanted = new Set((item.key.match(/\{\w+\}/g) ?? []).concat(item.plural ? ['{count}'] : []));
      const texts = typeof value === 'string' ? [value] : Object.values(value);
      for (const placeholder of wanted) {
        if (placeholder === '{count}' && item.plural) continue;
        if (!texts.every((text) => text.includes(placeholder))) problems.push(`${id} ${locale}: lost ${placeholder}`);
      }
      all[locale][item.key] = value;
      added += 1;
    });
  }
  for (const locale of TARGETS) writeMessages(locale, all[locale]);
  console.log(`${added} translations merged.`);
  if (problems.length) console.log(problems.map((problem) => `  ! ${problem}`).join('\n'));
} else if (command === 'prune') {
  for (const locale of LOCALES) {
    const messages = readMessages(locale);
    const kept = Object.fromEntries(Object.entries(messages).filter(([key]) => keys.has(key)));
    writeMessages(locale, kept);
    console.log(`  ${locale}: ${Object.keys(messages).length - Object.keys(kept).length} removed`);
  }
} else {
  console.error(`unknown command ${command}`);
  process.exit(1);
}
