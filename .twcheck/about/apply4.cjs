const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, '..', '..', 'components/portfolio/EditorialAboutUsSection.tsx');
let s = fs.readFileSync(f, 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';
s = s.replace(/\r\n/g, '\n');
const a = `              <a
                {...ctaLink}
                className="mt-9 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-[15px] font-semibold transition hover:opacity-90 sm:mt-10"
                data-pf-no-color-transition=""
                style={{ backgroundColor: accent, color: aboutUsReadableInk(accent) }}
              >
                {ctaLabel}
              </a>`;
const b = `              // An editorial text link, not a filled pill: ink text, a hairline in the accent colour
              // underneath, and an arrow that steps forward on hover / focus. The accent stays the
              // one small signature touch (rule + arrow) rather than a block of colour.
              <a
                {...ctaLink}
                className="group mt-9 inline-flex items-center gap-2.5 border-b pb-1.5 text-[15px] font-medium tracking-wide transition-[gap] duration-300 hover:gap-3.5 focus-visible:gap-3.5 focus-visible:outline-2 focus-visible:outline-offset-4 sm:mt-10"
                data-pf-no-color-transition=""
                style={{ color: presentation.titleColor, borderColor: accent, outlineColor: accent }}
              >
                {ctaLabel}
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" aria-hidden style={{ color: accent }}>
                  <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>`;
if (!s.includes(a)) throw new Error('missing');
s = s.replace(a, b);
fs.writeFileSync(f, s.replace(/\n/g, eol));
console.log('ok');
