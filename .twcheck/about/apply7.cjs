const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, '..', '..', 'components/portfolio/EditorialAboutUsSection.tsx');
let s = fs.readFileSync(f, 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';
s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('missing ' + a.slice(0, 80)); s = s.replace(a, b); };
rep(`    '--cta-ink': ink,
    color: ink,
    outlineColor: accent,
  } as CSSProperties;
  const hairline = 'color-mix(in srgb, var(--cta-ink) 32%, transparent)';`, `    '--cta-ink': ink,
    '--cta-hair': \`color-mix(in srgb, \${ink} 32%, transparent)\`,
    outlineColor: accent,
  } as CSSProperties;
  // Colours live in classes (not inline) so the hover / focus utilities below can override them.
  const ink0 = '[color:var(--cta-ink)]';`);
rep(`className={\`group \${className} inline-flex w-fit max-w-full items-center gap-2.5 border-b pb-1.5 text-[15px] font-medium tracking-wide transition-[gap] duration-300 hover:gap-3.5 focus-visible:gap-3.5 \${focus}\`}`, `className={\`group \${className} \${ink0} inline-flex w-fit max-w-full items-center gap-2.5 border-b pb-1.5 text-[15px] font-medium tracking-wide transition-[gap] duration-300 hover:gap-3.5 focus-visible:gap-3.5 \${focus}\`}`);
rep(`className={\`\${className} inline-flex w-fit max-w-full items-center justify-center rounded-full border px-7 py-3 text-[15px] font-medium tracking-wide transition-colors duration-300`, `className={\`\${className} \${ink0} [border-color:var(--cta-hair)] inline-flex w-fit max-w-full items-center justify-center rounded-full border px-7 py-3 text-[15px] font-medium tracking-wide transition-colors duration-300`);
rep(`        style={{ ...vars, borderColor: hairline }}
      >
        {label}
      </a>`, `        style={vars}
      >
        {label}
      </a>`);
rep(`className={\`group \${className} inline-flex w-fit max-w-full items-center gap-3.5 text-[15px] font-medium tracking-wide \${focus}\`}`, `className={\`group \${className} \${ink0} inline-flex w-fit max-w-full items-center gap-3.5 text-[15px] font-medium tracking-wide \${focus}\`}`);
rep(`className="grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors duration-300`, `className="grid h-10 w-10 shrink-0 place-items-center rounded-full border [border-color:var(--cta-hair)] transition-colors duration-300`);
rep(`          style={{ borderColor: hairline }}
        >
          <AboutUsCtaArrow`, `        >
          <AboutUsCtaArrow`);
rep(`className={\`group \${className} relative inline-flex w-fit max-w-full items-center pb-2 text-[15px] font-medium tracking-wide \${focus}\`}`, `className={\`group \${className} \${ink0} relative inline-flex w-fit max-w-full items-center pb-2 text-[15px] font-medium tracking-wide \${focus}\`}`);
rep(`<span aria-hidden className="absolute inset-x-0 bottom-0 h-px" style={{ backgroundColor: hairline }} />`, `<span aria-hidden className="absolute inset-x-0 bottom-0 h-px [background-color:var(--cta-hair)]" />`);
fs.writeFileSync(f, s.replace(/\n/g, eol));
console.log('ok');
