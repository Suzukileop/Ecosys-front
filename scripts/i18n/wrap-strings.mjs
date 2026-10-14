#!/usr/bin/env node
/*
 * i18n codemod: wraps the interface text of Client Components in `t(…)`.
 *
 *   node scripts/i18n/wrap-strings.mjs <file|dir>… [--dry]
 *
 * What it converts, inside a component (a PascalCase function, or a `use…` hook):
 *   - JSX text:                     <p>Save changes</p>        → <p>{t('Save changes')}</p>
 *   - text mixed with values:       <p>{n} posts saved</p>     → <p>{t('{n} posts saved', { n })}</p>
 *   - wording attributes:           title="Delete" / placeholder="Search…" / aria-label="Close"
 *   - wording properties:           pushFlashFeedback({ title: 'Saved', description: '…' })
 *   - fallbacks:                    getApiErrorMessage(error, 'Please try again.')
 * and adds `const t = useT();` to each component that needs it (plus the import).
 *
 * Left as they are (reported, for a manual pass): files without 'use client', text outside any
 * component (module constants, helpers), text in a component that already has its own `t`.
 * The output keeps the code's formatting; run the type check and the linter after it.
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const backupDir = args.find((arg) => arg.startsWith('--backup='))?.slice('--backup='.length) ?? null;
const extended = args.includes('--extended');
/* Variables whose string is a value for code, not wording, even when capitalised. */
const NON_WORDING_VARIABLE = /(class(name)?|classes|href|url|src|path|route|id|key|type|mode|variant|status|state|kind|tone|color|colour|icon|format|locale|sort|tab|view|step|size|align|position|direction|unit|currency|code|slug|token|field|name|value|query|param|event|method|mime|ext|selector|pattern|regex|style|theme|font|layout|design|preset|variantId)$/i;

/* A Tailwind / CSS class list: every token looks like a utility. */
function isClassList(value) {
  const tokens = value.trim().split(/\s+/).filter(Boolean);
  const bare = /^(flex|grid|block|inline|hidden|relative|absolute|fixed|sticky|truncate|italic|uppercase|lowercase|capitalize|underline|rounded|border|shadow|transition|group|peer|container|static|contents|grow|shrink|antialiased|transform|filter|outline|ring|isolate|invisible|visible|collapse|table|sr-only|prose)$/;
  return tokens.length > 0 && tokens.every((token) => /[-:[\]/#]/.test(token) || bare.test(token)) && !/[A-Z][a-z]+ [a-z]/.test(value);
}

/* String values a file uses as logic: compared, switched on, used as keys or state values. */
function collectLogicLiterals(sf) {
  const found = new Set();
  const literalText = (node) => (node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : null);
  const visit = (node) => {
    if (ts.isBinaryExpression(node) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.InKeyword].includes(node.operatorToken.kind)) {
      [literalText(node.left), literalText(node.right)].forEach((text) => text && found.add(text));
    }
    if (ts.isCaseClause(node)) {
      const text = literalText(node.expression);
      if (text) found.add(text);
    }
    if (ts.isPropertyAssignment(node) || ts.isPropertySignature(node)) {
      const text = literalText(node.name);
      if (text) found.add(text);
    }
    if (ts.isElementAccessExpression(node)) {
      const text = literalText(node.argumentExpression);
      if (text) found.add(text);
    }
    if (ts.isLiteralTypeNode(node)) {
      const text = literalText(node.literal);
      if (text) found.add(text);
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(sf);
      if (/(^|\.)(includes|indexOf|has|get|set|delete|startsWith|endsWith|useState|useStoredChoice|useReducer|push|replace|getItem|setItem|filter|find)$/.test(callee)) {
        node.arguments.forEach((arg) => {
          const text = literalText(arg);
          if (text) found.add(text);
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}
const targets = args.filter((arg) => !arg.startsWith('--'));
if (targets.length === 0) {
  console.error('usage: wrap-strings.mjs <file|dir>… [--dry]');
  process.exit(1);
}

/* Names that read the same in every language. */
const DO_NOT_TRANSLATE = new Set(['Skraft', 'Skraft.', 'Skraft Pro', 'News', 'GitHub', 'LinkedIn', 'Google', 'Stripe', 'PayPal', 'WhatsApp', 'JSON', 'PDF', 'URL']);

const IMPORT_LINE = "import { useT } from '@/lib/i18n/I18nProvider';";

/* Attributes / properties whose string is wording a person reads. */
const WORDING_NAME =
  /^(title|subtitle|placeholder|aria-label|aria-description|aria-valuetext|alt|label|description|hint|helperText|caption|heading|tooltip|message|body|eyebrow|kicker|emptyText|emptyTitle|emptyBody|emptyMessage|confirmText|cancelText|text|prompt|summary|note|cta|ctaLabel|[a-z]+(Label|Title|Description|Hint|Text|Message|Placeholder|Caption|Heading|Tooltip|Body|Prompt|Cta))$/;
/* Calls whose string arguments are wording (by position). */
const WORDING_CALLS = { getApiErrorMessage: [1], confirm: [0], alert: [0] };

/* Natural language, not a token: a letter, and a space or a leading capital ("Email", "Save"). */
function isWording(text, { jsxText = false } = {}) {
  const value = text.trim();
  if (!/[A-Za-zÀ-ɏ]/.test(value)) return false;
  /* Text between tags is almost always wording, even one lowercase word ("or", "and"). */
  if (DO_NOT_TRANSLATE.has(value)) return false;
  /* CSS values and media queries (box-shadow, clip-path, sizes…) are code, not wording. */
  if (/^(inset|rgba?|hsla?|clamp|calc|min|max|var|url|color-mix|linear-gradient|radial-gradient|conic-gradient|polygon|circle|ellipse|cubic-bezier|translate|scale|rotate)\b|^\((min|max)-(width|height)|^&\w+;$/.test(value)) return false;
  if (jsxText) return !/^[a-z]$/i.test(value) && !/^(https?:|mailto:)/.test(value);
  if (/^(https?:|mailto:|\/|#|\.|@\w)/.test(value)) return false;
  if (/^[a-z0-9_-]+$/.test(value)) return false; // ids, keys, css-ish tokens
  if (/^[A-Z0-9_]+$/.test(value) && value.length > 1 && !/\s/.test(value)) return false; // ENUM_VALUES
  if (/^[\w.-]+\.(png|jpe?g|svg|webp|mp4|json|pdf)$/i.test(value)) return false;
  return /\s/.test(value) || /^[A-Z][a-z]/.test(value) || /[a-z][.!?…]$/.test(value);
}

/* JSX text as the browser renders it (JSX trims lines and joins them with one space). */
function renderJsxText(raw) {
  const lines = raw.split(/\r?\n/);
  const kept = [];
  lines.forEach((line, index) => {
    let value = line.replace(/\t/g, ' ');
    if (index > 0) value = value.replace(/^\s+/, '');
    if (index < lines.length - 1) value = value.replace(/\s+$/, '');
    if (value) kept.push(value);
  });
  return decodeEntities(kept.join(' '));
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', mdash: '—', ndash: '–', hellip: '…', middot: '·', copy: '©', reg: '®', trade: '™', times: '×', rarr: '→', larr: '←' };
function decodeEntities(text) {
  return text.replace(/&(#x?[0-9a-f]+|\w+);/gi, (match, name) => {
    if (name[0] === '#') {
      const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return ENTITIES[name] ?? match;
  });
}

function quote(text) {
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n')}'`;
}

function isPascal(name) {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}
function isHookName(name) {
  return /^use[A-Z]/.test(name);
}

/* The component (or hook) a node belongs to: the outermost named function that can call hooks. */
function owningComponent(node) {
  let found = null;
  for (let current = node.parent; current; current = current.parent) {
    if (ts.isFunctionDeclaration(current) && current.name && (isPascal(current.name.text) || isHookName(current.name.text))) {
      found = current;
    } else if (
      (ts.isArrowFunction(current) || ts.isFunctionExpression(current)) &&
      componentNameOfExpression(current)
    ) {
      found = current;
    } else if (ts.isClassDeclaration(current) || ts.isClassExpression(current)) {
      return null;
    }
  }
  return found;
}

/* `const Foo = () => …`, `const Foo = memo(() => …)`, `forwardRef(function Foo …)`. */
function componentNameOfExpression(fn) {
  if (ts.isFunctionExpression(fn) && fn.name && isPascal(fn.name.text)) return fn.name.text;
  let current = fn.parent;
  while (current && ts.isCallExpression(current)) {
    const callee = current.expression.getText();
    if (!/^(React\.)?(memo|forwardRef)$/.test(callee)) return null;
    current = current.parent;
  }
  if (current && ts.isVariableDeclaration(current) && ts.isIdentifier(current.name)) {
    const name = current.name.text;
    if (isPascal(name) || isHookName(name)) return name;
  }
  return null;
}

/* Names bound directly by a scope node: a function's parameters, a block's declarations. */
function bindsName(scope, name) {
  const binds = (binding) => {
    if (ts.isIdentifier(binding)) return binding.text === name;
    if (ts.isObjectBindingPattern(binding) || ts.isArrayBindingPattern(binding)) {
      return binding.elements.some((element) => !ts.isOmittedExpression(element) && binds(element.name));
    }
    return false;
  };
  if (ts.isFunctionLike(scope)) {
    if (scope.parameters?.some((param) => binds(param.name))) return true;
    if (scope.name && !ts.isFunctionDeclaration(scope) && ts.isIdentifier(scope.name) && scope.name.text === name) return true;
  }
  const statements = ts.isBlock(scope) || ts.isSourceFile(scope) ? scope.statements : null;
  if (statements) {
    for (const statement of statements) {
      if (ts.isVariableStatement(statement) && statement.declarationList.declarations.some((decl) => binds(decl.name))) return true;
      if (ts.isFunctionDeclaration(statement) && statement.name?.text === name) return true;
    }
  }
  if ((ts.isForOfStatement(scope) || ts.isForInStatement(scope) || ts.isForStatement(scope)) && scope.initializer && ts.isVariableDeclarationList(scope.initializer)) {
    if (scope.initializer.declarations.some((decl) => binds(decl.name))) return true;
  }
  if (ts.isCatchClause(scope) && scope.variableDeclaration && binds(scope.variableDeclaration.name)) return true;
  return false;
}

/* Would `t` at `node` resolve to something other than the component's translator? */
function nameShadowed(node, component, name) {
  for (let current = node.parent; current && current !== component.parent; current = current.parent) {
    if (bindsName(current, name)) {
      /* The component's own `const t = useT()` is the translator itself. */
      if (current === component.body && alreadyHasUseT(component)) continue;
      return true;
    }
  }
  return false;
}

function alreadyHasUseT(component) {
  return /\bconst\s+t\s*=\s*useT\(\)/.test(component.getText());
}

/* A placeholder name for an embedded value: `{count}` → count, `{user.name}` → name, `{posts.length}` → postsLength. */
function placeholderName(expression, used) {
  let base = 'value';
  if (ts.isIdentifier(expression)) base = expression.text;
  else if (ts.isPropertyAccessExpression(expression)) {
    const last = expression.name.text;
    base = last === 'length' && ts.isIdentifier(expression.expression) ? `${expression.expression.text}Length` : last;
  } else if (ts.isCallExpression(expression)) {
    const callee = expression.expression;
    base = ts.isIdentifier(callee) ? callee.text : ts.isPropertyAccessExpression(callee) ? callee.name.text : 'value';
  }
  base = base.replace(/[^A-Za-z0-9]/g, '') || 'value';
  let name = base;
  for (let n = 2; used.has(name); n += 1) name = `${base}${n}`;
  used.add(name);
  return name;
}

/* An embedded value simple enough to become a placeholder: names, property chains, plain calls, numbers. */
function isSimpleValue(expression) {
  if (!expression) return false;
  if (ts.isIdentifier(expression) || ts.isNumericLiteral(expression)) return true;
  if (ts.isPropertyAccessExpression(expression)) return isSimpleValue(expression.expression) || expression.expression.kind === ts.SyntaxKind.ThisKeyword;
  if (ts.isElementAccessExpression(expression)) return isSimpleValue(expression.expression);
  if (ts.isCallExpression(expression)) return isSimpleValue(expression.expression) && expression.arguments.every((arg) => isSimpleValue(arg) || ts.isStringLiteral(arg) || ts.isNumericLiteral(arg));
  if (ts.isNonNullExpression(expression) || ts.isParenthesizedExpression(expression)) return isSimpleValue(expression.expression);
  return false;
}

function processFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  const report = { file, edits: 0, skipped: [] };
  const firstStatement = source.trimStart();
  if (!/^(['"])use client\1/.test(firstStatement)) {
    report.notClient = true;
    return report;
  }
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const logicLiterals = extended ? collectLogicLiterals(sf) : null;
  const edits = []; // { start, end, text }
  const needT = new Set(); // components

  const line = (node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

  const take = (node, replacement, preview, range) => {
    const component = owningComponent(node);
    if (!component) {
      report.skipped.push(`${line(node)}: outside a component: ${preview}`);
      return false;
    }
    if (nameShadowed(node, component, 't')) {
      report.skipped.push(`${line(node)}: \`t\` means something else here: ${preview}`);
      return false;
    }
    needT.add(component);
    edits.push({ start: range?.start ?? node.getStart(sf), end: range?.end ?? node.getEnd(), text: replacement });
    report.edits += 1;
    return true;
  };

  const inTCall = (node) => {
    const parent = node.parent;
    return (
      parent &&
      ts.isCallExpression(parent) &&
      /^(t|t\.plural|t\.rich|msg)$/.test(parent.expression.getText(sf))
    );
  };

  /* Children of one element: plain text + simple values → one sentence; anything else → text pieces. */
  const handleChildren = (children) => {
    const meaningful = children.filter((child) => !(ts.isJsxText(child) && child.containsOnlyTriviaWhiteSpaces));
    const texts = meaningful.filter(ts.isJsxText);
    if (texts.length === 0) return;
    /* Strings in value slots: {busy ? 'Saving…' : 'Save'}, {error && 'Try again'}. */
    for (const child of meaningful) {
      if (ts.isJsxExpression(child) && child.expression && !isSimpleValue(child.expression)) {
        wrapStringExpression(child.expression);
      }
    }
    const allText = texts.map((text) => renderJsxText(text.getFullText(sf))).join(' ');
    if (!isWording(allText, { jsxText: true })) return;

    const sentenceable = meaningful.every(
      (child) =>
        ts.isJsxText(child) ||
        (ts.isJsxExpression(child) && child.expression && isSimpleValue(child.expression) && !ts.isNumericLiteral(child.expression)),
    );
    const hasValues = meaningful.some((child) => ts.isJsxExpression(child));

    if (sentenceable && hasValues) {
      const used = new Set();
      const vars = [];
      let template = '';
      meaningful.forEach((child, index) => {
        if (ts.isJsxText(child)) {
          let piece = decodeEntities(child.getFullText(sf).replace(/\r?\n\s*/g, (m, offset) => ' '));
          piece = piece.replace(/\s+/g, ' ');
          if (index === 0) piece = piece.replace(/^\s+/, '');
          if (index === meaningful.length - 1) piece = piece.replace(/\s+$/, '');
          template += piece;
        } else {
          const name = placeholderName(child.expression, used);
          vars.push(`${name}: ${child.expression.getText(sf)}`.replace(/^(\w+): \1$/, '$1'));
          template += `{${name}}`;
        }
      });
      template = template.replace(/\s+/g, ' ').trim();
      const first = meaningful[0];
      const last = meaningful[meaningful.length - 1];
      const component = owningComponent(first);
      if (!component || nameShadowed(first, component, 't')) {
        report.skipped.push(`${line(first)}: sentence not converted: ${template.slice(0, 60)}`);
        return;
      }
      needT.add(component);
      /* Keep the whitespace outside the sentence (line breaks before / after it) as it was. */
      const firstRaw = first.getFullText(sf);
      const lastRaw = last.getFullText(sf);
      edits.push({
        start: ts.isJsxText(first) ? first.pos + firstRaw.search(/\S/) : first.getStart(sf),
        end: ts.isJsxText(last) ? last.pos + lastRaw.replace(/\s+$/, '').length : last.getEnd(),
        text: `{t(${quote(template)}, { ${vars.join(', ')} })}`,
      });
      report.edits += 1;
      return;
    }

    for (const text of texts) {
      const rendered = renderJsxText(text.getFullText(sf));
      if (!isWording(rendered, { jsxText: true })) continue;
      /* Replace only the words: the whitespace around them (line breaks, a space before a value)
         stays in the JSX and keeps rendering as before. */
      const raw = text.getFullText(sf);
      const start = text.pos + raw.search(/\S/);
      const end = text.pos + raw.replace(/\s+$/, '').length;
      const value = rendered.trim();
      take(text, `{t(${quote(value)})}`, value.slice(0, 60), { start, end });
    }
  };

  const visit = (node) => {
    if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
      handleChildren([...node.children]);
    }

    if (ts.isJsxAttribute(node) && node.initializer) {
      const name = node.name.getText(sf);
      if (WORDING_NAME.test(name)) {
        const init = node.initializer;
        if (ts.isStringLiteral(init) && isWording(init.text)) {
          take(init, `{t(${quote(init.text)})}`, init.text.slice(0, 60));
        } else if (ts.isJsxExpression(init) && init.expression) {
          wrapStringExpression(init.expression);
        }
      }
    }

    if (ts.isPropertyAssignment(node) && WORDING_NAME.test(node.name.getText(sf).replace(/['"]/g, ''))) {
      /* Only inside a component (module constants are left for a manual pass). */
      if (owningComponent(node)) wrapStringExpression(node.initializer);
    }

    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && WORDING_CALLS[node.expression.text]) {
      for (const index of WORDING_CALLS[node.expression.text]) {
        const arg = node.arguments[index];
        if (arg && owningComponent(node)) wrapStringExpression(arg);
      }
    }

    /* --extended: wording held in a component's variables, returns and state setters. A value the
       file also compares or uses as a key is logic, not text, and stays as it is. */
    if (extended && owningComponent(node)) {
      if (
        ts.isVariableDeclaration(node) &&
        node.initializer &&
        !(ts.isIdentifier(node.name) && NON_WORDING_VARIABLE.test(node.name.text))
      ) {
        wrapStringExpression(node.initializer, logicLiterals);
      } else if (ts.isReturnStatement(node) && node.expression) {
        wrapStringExpression(node.expression, logicLiterals);
      } else if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) {
        wrapStringExpression(node.body, logicLiterals);
      } else if (ts.isCallExpression(node) && /^set[A-Z]\w*$/.test(node.expression.getText(sf))) {
        node.arguments.forEach((arg) => wrapStringExpression(arg, logicLiterals));
      }
    }

    ts.forEachChild(node, visit);
  };

  /* 'Literal', cond ? 'A' : 'B', and `Template ${x}` (→ placeholders). */
  function wrapStringExpression(expression, skip = null) {
    if (!expression || inTCall(expression)) return;
    if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
      if (skip?.has(expression.text) || isClassList(expression.text)) return;
      if (isWording(expression.text)) take(expression, `t(${quote(expression.text)})`, expression.text.slice(0, 60));
    } else if (ts.isConditionalExpression(expression)) {
      wrapStringExpression(expression.whenTrue, skip);
      wrapStringExpression(expression.whenFalse, skip);
    } else if (ts.isParenthesizedExpression(expression)) {
      wrapStringExpression(expression.expression, skip);
    } else if (
      ts.isBinaryExpression(expression) &&
      [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken].includes(
        expression.operatorToken.kind,
      )
    ) {
      wrapStringExpression(expression.right, skip);
    } else if (ts.isTemplateExpression(expression)) {
      if (skip) return; /* --extended leaves templates (often URLs, keys, class names) alone */
      const spans = expression.templateSpans;
      if (!spans.every((span) => isSimpleValue(span.expression))) return;
      const used = new Set();
      const vars = [];
      let template = expression.head.text;
      for (const span of spans) {
        const name = placeholderName(span.expression, used);
        vars.push(`${name}: ${span.expression.getText(sf)}`.replace(/^(\w+): \1$/, '$1'));
        template += `{${name}}${span.literal.text}`;
      }
      if (!isWording(template.replace(/\{\w+\}/g, ''))) return;
      take(expression, `t(${quote(template)}, { ${vars.join(', ')} })`, template.slice(0, 60));
    }
  }

  visit(sf);
  if (edits.length === 0) return report;

  /* `const t = useT();` at the top of each component that now needs it. */
  for (const component of needT) {
    if (alreadyHasUseT(component)) continue;
    const body = component.body;
    if (!body) continue;
    if (ts.isBlock(body)) {
      const indent = (source.slice(0, body.statements[0]?.getStart(sf) ?? body.getStart(sf) + 1).match(/[ \t]*$/) ?? [''])[0] || '  ';
      edits.push({ start: body.getStart(sf) + 1, end: body.getStart(sf) + 1, text: `\n${indent}const t = useT();` });
    } else {
      /* `=> (<jsx/>)`: becomes a block that returns it. */
      edits.push({ start: body.getStart(sf), end: body.getStart(sf), text: '{\n  const t = useT();\n  return ' });
      edits.push({ start: body.getEnd(), end: body.getEnd(), text: ';\n}' });
    }
  }

  if (!source.includes(IMPORT_LINE)) {
    const imports = sf.statements.filter(ts.isImportDeclaration);
    const anchor = imports.length ? imports[imports.length - 1].getEnd() : sf.statements[0].getEnd();
    edits.push({ start: anchor, end: anchor, text: `\n${IMPORT_LINE}` });
  }

  /* Apply from the end; drop edits nested in an already-replaced range. */
  edits.sort((a, b) => b.start - a.start || b.end - a.end);
  let output = source;
  let floor = Infinity;
  for (const edit of edits) {
    if (edit.end > floor && edit.start !== edit.end) continue;
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
    if (edit.start !== edit.end) floor = edit.start;
  }
  if (!dry) {
    /* A copy of the original under --backup, in case a conversion needs undoing. */
    if (backupDir) {
      const backup = path.join(backupDir, path.relative(process.cwd(), file));
      fs.mkdirSync(path.dirname(backup), { recursive: true });
      fs.writeFileSync(backup, source);
    }
    fs.writeFileSync(file, output);
  }
  return report;
}

function collect(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return target.endsWith('.tsx') ? [target] : [];
  return fs
    .readdirSync(target)
    .filter((entry) => entry !== 'node_modules' && !entry.startsWith('.'))
    .flatMap((entry) => collect(path.join(target, entry)));
}

const files = targets.flatMap(collect);
let total = 0;
const notClient = [];
for (const file of files) {
  const report = processFile(file);
  if (report.notClient) {
    notClient.push(file);
    continue;
  }
  total += report.edits;
  if (report.edits || report.skipped.length) {
    console.log(`${report.edits.toString().padStart(4)}  ${file}`);
    for (const note of report.skipped) console.log(`        skipped ${note}`);
  }
}
console.log(`\n${total} strings wrapped in ${files.length - notClient.length} client files${dry ? ' (dry run)' : ''}.`);
if (notClient.length) console.log(`${notClient.length} files without 'use client' left for a manual pass.`);
