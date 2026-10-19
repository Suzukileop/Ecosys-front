const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, '..', '..', 'components/portfolio/EditorialAboutUsSection.tsx');
let s = fs.readFileSync(f, 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';
s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => {
  if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 70));
  s = s.replace(a, b);
};
rep(`  founderLogo,
  presentation,
}: {
  quote: string;
  founderName: string;
  founderFunction: string;
  founderLogo: string;
  presentation: PortfolioAboutUsPresentationSettings;
}) {
  const showQuote = presentation.showQuote && Boolean(quote);`, `  founderLogo,
  presentation,
  large = false,
}: {
  quote: string;
  founderName: string;
  founderFunction: string;
  founderLogo: string;
  presentation: PortfolioAboutUsPresentationSettings;
  /** Roomier type for designs where the quote closes the section on its own (Classique). */
  large?: boolean;
}) {
  const showQuote = presentation.showQuote && Boolean(quote);`);
rep(`          className="max-w-2xl border-l-2 pl-5 text-lg font-medium italic leading-relaxed sm:text-xl"`, `          className={
            large
              ? 'max-w-3xl text-pretty border-l-2 pl-5 text-xl font-medium italic leading-snug sm:pl-6 sm:text-2xl'
              : 'max-w-2xl border-l-2 pl-5 text-lg font-medium italic leading-relaxed sm:text-xl'
          }`);
rep(`              <p className="text-base font-semibold" style={{ color: presentation.founderNameColor }}>`, `              <p
                className={large ? 'text-base font-semibold sm:text-lg' : 'text-base font-semibold'}
                style={{ color: presentation.founderNameColor }}
              >`);
rep(`              <p className="text-sm" style={{ color: presentation.founderFunctionColor }}>`, `              <p
                className={large ? 'mt-0.5 text-sm sm:text-[15px]' : 'text-sm'}
                style={{ color: presentation.founderFunctionColor }}
              >`);
const a = s.indexOf('  return (\n    <div className="space-y-8 sm:space-y-10">');
const b = s.indexOf('function AboutUsQuoteMark');
if (a < 0 || b < 0) throw new Error('bounds');
const body = fs.readFileSync(path.join(__dirname, 'stacked-body.txt'), 'utf8').replace(/\r\n/g, '\n');
s = s.slice(0, a) + body + s.slice(b);
fs.writeFileSync(f, s.replace(/\n/g, eol));
console.log('applied');
