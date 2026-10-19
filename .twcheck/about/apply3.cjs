const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, '..', '..', 'components/portfolio/EditorialAboutUsSection.tsx');
let s = fs.readFileSync(f, 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';
s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => {
  if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 80));
  s = s.replace(a, b);
};

// 1. Pair: bigger frames that really overlap (the design's name), front one on top.
rep(
  `className="absolute right-0 top-0 z-[1] h-[48%] w-[40%] rounded-[1.7rem] object-cover"`,
  `className="absolute right-0 top-0 z-[1] h-[54%] w-[48%] rounded-[1.7rem] object-cover"`
);
rep(
  `className="absolute bottom-0 left-0 z-[2] h-[52%] w-[48%] rounded-[1.7rem] object-cover"`,
  `className="absolute bottom-0 left-0 z-[2] h-[58%] w-[58%] rounded-[1.7rem] object-cover"`
);

// 2. Copy first on a phone for this design (the headline must open the section).
const startFn = s.indexOf('function AboutUsSplitOverlapDesign');
const endFn = s.indexOf('function AboutUsMediaLeftSingleVisual');
let fn = s.slice(startFn, endFn);
const frep = (a, b) => {
  if (!fn.includes(a)) throw new Error('missing in fn: ' + a.slice(0, 80));
  fn = fn.replace(a, b);
};
frep(
  `  const mediaLeft = aboutUsMediaIsLeft(presentation);
`,
  `  const mediaLeft = aboutUsMediaIsLeft(presentation);
  // Below \`lg\` the copy always comes first, so the headline opens the section instead of sitting
  // under a screen of pictures; from \`lg\` the chosen side applies.
  const copyOrder = mediaLeft ? 'max-lg:order-1 lg:order-2' : 'order-1';
  const mediaOrder = mediaLeft ? 'max-lg:order-2 lg:order-1' : 'order-2';
`
);
frep(`\${aboutUsSplitOrderClass('copy', mediaLeft)}\`}>`, `\${copyOrder}\`}>`);
frep(`\${aboutUsSplitOrderClass('media', mediaLeft)}\`}>`, `\${mediaOrder}\`}>`);
frep(`relative min-h-[22rem] lg:min-h-full`, `relative min-h-[20rem] sm:min-h-[26rem] lg:min-h-full`);
frep(`<div className="h-full min-h-[22rem] lg:absolute lg:inset-0">`, `<div className="h-full min-h-[20rem] sm:min-h-[26rem] lg:absolute lg:inset-0">`);

// 3. Type scale and rhythm.
frep(
  `max-w-[36rem] text-lg leading-[1.8] sm:text-[1.2rem] \${title || eyebrow ? 'mt-6' : ''}`,
  `max-w-[36rem] text-pretty text-[1.0625rem] leading-[1.7] sm:text-lg \${title || eyebrow ? 'mt-5 sm:mt-6' : ''}`
);
frep(
  `<ul className={\`max-w-[36rem] space-y-5 \${description || title ? 'mt-8' : eyebrow ? 'mt-8' : ''}\`}>`,
  `<ul className={\`max-w-[36rem] space-y-3.5 \${description || title ? 'mt-8' : eyebrow ? 'mt-8' : ''}\`}>`
);
frep(
  `className="flex items-start gap-3.5 text-lg leading-relaxed sm:text-[1.2rem]"`,
  `className="flex items-start gap-3 text-base leading-relaxed sm:text-[1.0625rem]"`
);
frep(
  `className="mt-10 inline-flex items-center justify-center rounded-full px-9 py-4 text-base font-semibold transition hover:opacity-90"`,
  `className="mt-9 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-[15px] font-semibold transition hover:opacity-90 sm:mt-10"`
);
s = s.slice(0, startFn) + fn + s.slice(endFn);

// 4. Accent check: smaller, aligned with the first line of its (now 17px) text.
rep(
  `className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center"
      style={{ color }}`,
  `className="mt-px inline-flex h-6 w-6 shrink-0 items-center justify-center"
      style={{ color }}`
);
fs.writeFileSync(f, s.replace(/\n/g, eol));
console.log('applied');
