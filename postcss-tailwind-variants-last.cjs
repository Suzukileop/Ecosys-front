/**
 * PostCSS plugin, run after @tailwindcss/postcss: moves Tailwind's variant rules (sm:, hover:,
 * dark:, group-hover:, [&>svg]: …) to the end of the stylesheet.
 *
 * That is where Tailwind v3 emitted them: base utilities at `@tailwind utilities`, every variant
 * after the last rule of the file. globals.css was written against that cascade — `.pf-value-word--minor
 * { font-size: .8em }` loses to `lg:text-3xl` but beats `text-3xl` — and v4 emits variants together
 * with the base utilities. Only globals.css is touched: it is the one file with the marker rules below.
 */
// Marker rules around `@tailwind utilities` in globals.css (rules, as minifiers drop comments).
const START = '.tailwind-utilities-start';
const END = '.tailwind-utilities-end';

const unescape = (s) =>
  s.replace(/\\([0-9a-fA-F]{1,6}) ?/g, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/\\(.)/g, '$1');

/** True when the first class of the selector is a variant candidate ("md:flex", not "bg-[color:red]"). */
function isVariantRule(rule) {
  const m = /\.((?:\\[0-9a-fA-F]{1,6} ?|\\.|[\w-])+)/.exec(rule.selector);
  if (!m) return false;
  let depth = 0;
  for (const ch of unescape(m[1])) {
    if (ch === '[' || ch === '(') depth++;
    else if (ch === ']' || ch === ')') depth--;
    else if (ch === ':' && depth === 0) return true;
  }
  return false;
}

/** Detaches the variant rules under `node`; returns copies to append (wrapped in their at-rules). */
function extract(node) {
  if (node.type === 'rule') {
    if (!isVariantRule(node)) return [];
    node.remove();
    return [node];
  }
  if (node.type !== 'atrule' || !node.nodes || /keyframes|property/.test(node.name)) return [];
  const moved = [];
  for (const child of [...node.nodes]) moved.push(...extract(child));
  if (!moved.length) return [];
  const wrapper = node.clone({ nodes: [] });
  wrapper.append(moved);
  if (!node.nodes.length) node.remove();
  return [wrapper];
}

const plugin = () => ({
  postcssPlugin: 'tailwind-variants-last',
  OnceExit(root) {
    const nodes = root.nodes;
    const start = nodes.findIndex((n) => n.type === 'rule' && n.selector === START);
    if (start < 0) return;
    const end = nodes.findIndex((n, i) => i > start && n.type === 'rule' && n.selector === END);
    if (end < 0) throw new Error(`${END} marker missing`);
    const [startMarker, endMarker] = [nodes[start], nodes[end]];
    const region = nodes.slice(start + 1, end);
    const moved = [];
    for (const node of region) moved.push(...extract(node));
    startMarker.remove();
    endMarker.remove();
    root.append(moved);
  },
});
plugin.postcss = true;

module.exports = plugin;
