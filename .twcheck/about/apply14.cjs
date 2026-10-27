const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, '..', '..', 'components/portfolio/EditorialAboutUsSection.tsx');
let s = fs.readFileSync(f, 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';
s = s.replace(/\r\n/g, '\n');
const a = `                <li key={\`\${index}-\${task}\`} className="min-w-0">
                  {numerals ? (
                    <span
                      className="block text-[calc(13px*var(--pf-about-scale,1))] font-medium tabular-nums tracking-wide"
                      style={{ color: accent }}
                      aria-hidden
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  ) : (
                    <span className="flex h-5 items-center">
                      <AboutUsTaskMarker presentation={presentation} index={index} />
                    </span>
                  )}
                  <span
                    className="mt-3 block text-[calc(1.5rem*var(--pf-about-scale,1))] font-normal leading-tight"
                    style={{ color: presentation.taskColor }}
                  >
                    {task}
                  </span>
                </li>`;
const b = `                // Numerals sit above the title, as a small index; any other bullet stands in front of it.
                <li key={\`\${index}-\${task}\`} className={numerals ? 'min-w-0' : 'flex min-w-0 items-start gap-3'}>
                  {numerals ? (
                    <span
                      className="block text-[calc(13px*var(--pf-about-scale,1))] font-medium tabular-nums tracking-wide"
                      style={{ color: accent }}
                      aria-hidden
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-start pt-[0.35rem]">
                      <AboutUsTaskMarker presentation={presentation} index={index} />
                    </span>
                  )}
                  <span
                    className={\`block text-[calc(1.5rem*var(--pf-about-scale,1))] font-normal leading-tight \${numerals ? 'mt-3' : ''}\`}
                    style={{ color: presentation.taskColor }}
                  >
                    {task}
                  </span>
                </li>`;
if (!s.includes(a)) throw new Error('missing');
fs.writeFileSync(f, s.replace(a, b).replace(/\n/g, eol));
console.log('ok');
