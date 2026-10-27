const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');
function edit(rel, fn) {
  const f = path.join(root, rel);
  let s = fs.readFileSync(f, 'utf8');
  const eol = s.includes('\r\n') ? '\r\n' : '\n';
  s = s.replace(/\r\n/g, '\n');
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error(rel + ' missing: ' + a.slice(0, 90));
    s = s.replace(a, b);
  };
  fn(rep);
  fs.writeFileSync(f, s.replace(/\n/g, eol));
}

edit('components/portfolio/portfolio-services-pricing-shared.ts', (rep) => {
  rep(`/** Near-black or near-white, whichever has the higher WCAG contrast on \`hex\``, `function relativeLuminance(hex: string): number {
  const rgb = hexToRgbTuple(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two opaque hex colours. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * A softened version of \`ink\` for secondary text on \`bg\`: starts at \`target\` (1 = full ink) and only
 * strengthens as far as needed to reach \`min\` contrast. A fixed alpha cannot do this: white at 60% is
 * fine on near-black but unreadable on a mid-tone accent, which is where the featured card sits.
 */
export function softInk(ink: string, bg: string, target: number, min = 4.5): string {
  for (let alpha = target; alpha < 1.0001; alpha += 0.04) {
    const color = mixHex(ink, bg, Math.min(1, alpha));
    if (contrastRatio(color, bg) >= min) return color;
  }
  return ink;
}

/** Near-black or near-white, whichever has the higher WCAG contrast on \`hex\``);
});

edit('components/portfolio/portfolio-services-pricing-cards.tsx', (rep) => {
  rep(`  readableInk,
  withAlpha,
  type PricingCardData,`, `  readableInk,
  softInk,
  withAlpha,
  type PricingCardData,`);

  // ---- Grid card
  rep(`  const ink = featured ? fill.ink : tokens.ink;
  const muted = featured ? \`\${fill.ink}93\` : tokens.muted;
  const { period } = priceView(card, pricingStyle);
  const price = applyServicePriceLabels(card.price, pricingStyle.style);`, `  const ink = featured ? fill.ink : tokens.ink;
  // Secondary text on the featured card sits on a mid-tone accent: soften it only as far as stays readable.
  const muted = featured ? softInk(fill.ink, fill.blended, 0.8) : tokens.muted;
  const listInk = featured ? softInk(fill.ink, fill.blended, 0.92) : ink;
  const { period } = priceView(card, pricingStyle);
  const price = applyServicePriceLabels(card.price, pricingStyle.style);
  const isAmount = price.kind === 'amount';`);
  rep(`          className={\`text-xl font-black tracking-[-0.01em] sm:text-2xl \${featured && badge ? 'pr-20' : ''}\`}`, `          // One class, not \`text-xl sm:text-2xl\`: the Services font-size rules (#services .text-xl) outrank the
          // \`sm:\` size, which pinned the title at 20px on desktop.
          className={\`text-[length:calc(1.5rem*var(--pf-services-font-scale,1))] font-semibold leading-[1.2] tracking-[-0.015em] sm:text-[length:calc(1.625rem*var(--pf-services-font-scale,1))] \${featured && badge ? 'pr-20' : ''}\`}`);
  rep(`            <span
              className="text-[length:calc(2.5rem*var(--pf-services-font-scale,1))] font-black leading-none tracking-[-0.03em] sm:text-[length:calc(3.1rem*var(--pf-services-font-scale,1))]"
              style={{ color: ink }}
            >
              {price.text}
            </span>`, `            <span
              // A figure is the focal point; a word standing in for one ("On request", "Custom") is not.
              className={
                isAmount
                  ? 'text-[length:calc(2.5rem*var(--pf-services-font-scale,1))] font-bold leading-none tracking-[-0.03em] sm:text-[length:calc(3rem*var(--pf-services-font-scale,1))]'
                  : 'text-[length:calc(1.5rem*var(--pf-services-font-scale,1))] font-semibold leading-tight tracking-[-0.015em] sm:text-[length:calc(1.75rem*var(--pf-services-font-scale,1))]'
              }
              style={{ color: ink }}
            >
              {price.text}
            </span>`);
  rep(`                className="text-[0.95rem] font-normal leading-snug"
                textStyle={{ color: ink, opacity: 0.75 }}`, `                className="text-[0.95rem] font-normal leading-snug"
                textStyle={{ color: listInk, opacity: featured ? 1 : 0.8 }}`);
  rep(`              className="text-[0.95rem] font-normal leading-snug"
              style={{ color: ink, opacity: 0.6 }}`, `              className="text-[0.95rem] font-normal leading-snug"
              style={{ color: listInk, opacity: featured ? 1 : 0.8 }}`);

  // ---- Monolith: a word in place of the figure is not monumental
  rep(`          <span
            className="whitespace-nowrap text-[length:calc(clamp(2.25rem,13cqi,4.5rem)*var(--pf-services-font-scale,1))] font-black leading-[0.9] tracking-[-0.04em]"
            style={{ color: tokens.ink }}
          >`, `          <span
            className={
              price.kind === 'amount'
                ? 'whitespace-nowrap text-[length:calc(clamp(2.25rem,13cqi,4.5rem)*var(--pf-services-font-scale,1))] font-extrabold leading-[0.9] tracking-[-0.04em]'
                : 'text-[length:calc(clamp(1.75rem,9cqi,2.75rem)*var(--pf-services-font-scale,1))] font-semibold leading-[1.05] tracking-[-0.025em]'
            }
            style={{ color: tokens.ink }}
          >`);

  // ---- balanced columns helper
  rep(`function basis(columns: number, gapPx: number): string {`, `/**
 * Columns for \`count\` cards when the creator asked for at most \`cols\`: steps down while the last row
 * would hold a single card (4 cards at "3 per row" → 2 + 2, 5 at "4 per row" → 3 + 2). Counts with no
 * such split (7 at 3) keep the asked-for columns.
 */
function balancedColumns(count: number, cols: number): number {
  for (let c = cols; c >= 2; c -= 1) {
    if (count <= c || count % c !== 1) return c;
  }
  return cols;
}

function basis(columns: number, gapPx: number): string {`);
  rep(`    const colsDesktop = Math.max(1, Math.min(settings.cardsPerRow, 4, count));`, `    const colsDesktop = balancedColumns(count, Math.max(1, Math.min(settings.cardsPerRow, 4, count)));`);
  rep(`  const cols = Math.max(1, Math.min(settings.cardsPerRow, count));
  if (settings.centerLastRow && count > 1) {`, `  const cols = balancedColumns(count, Math.max(1, Math.min(settings.cardsPerRow, count)));
  if (settings.centerLastRow && count > 1) {`);

  // ---- Bento: no orphan in the two-column run
  rep(`            {cards.map((card, index) => (
              <BentoCard key={card.id} {...common(card, index)} wide={index === 0 && featuredIndex === 0 && count >= 3} />
            ))}`, `            {cards.map((card, index) => {
              const wide = index === 0 && featuredIndex === 0 && count >= 3;
              // After the wide featured card the rest run two by two: an odd one out spans both columns
              // instead of sitting alone on the left.
              const rest = count - (featuredIndex === 0 && count >= 3 ? 1 : 0);
              const spansRow = index === count - 1 && !wide && rest > 1 && rest % 2 === 1;
              return spansRow ? (
                <div key={card.id} className="flex md:col-span-2 [&>*]:w-full">
                  <BentoCard {...common(card, index)} wide={false} />
                </div>
              ) : (
                <BentoCard key={card.id} {...common(card, index)} wide={wide} />
              );
            })}`);
});
console.log('ok');
