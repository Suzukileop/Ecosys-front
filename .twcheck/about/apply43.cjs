const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error(rel+' need one: '+a.slice(0,70));s=s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
const H='components/portfolio/';
edit(H+'portfolio-work-settings.ts',rep=>{
rep(`export function mergeProjectsPressSettings(`,`/** Press intro text: at most this many words. */
export const PROJECTS_PRESS_INTRO_MAX_WORDS = 200;

/** Cuts \`text\` after its \`max\`-th word, keeping the whitespace and line breaks before it. */
export function limitWords(text: string, max: number): string {
  let count = 0;
  const re = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    count += 1;
    if (count === max) return text.slice(0, match.index + match[0].length);
  }
  return text;
}

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function mergeProjectsPressSettings(`);
rep(`    introText: typeof record.introText === 'string' ? record.introText : base.introText,`,`    introText:
      typeof record.introText === 'string'
        ? limitWords(record.introText, PROJECTS_PRESS_INTRO_MAX_WORDS)
        : base.introText,`);
});
edit(H+'portfolio-work-press-controls.tsx',rep=>{
rep(`import { DEFAULT_PROJECTS_PRESS_SETTINGS, `,`import { DEFAULT_PROJECTS_PRESS_SETTINGS, PROJECTS_PRESS_INTRO_MAX_WORDS, countWords, limitWords, `);
rep(`onChange={event=>onChange({projectsPress:{...settings,introText:event.target.value}})}/>
      </label>`,`onChange={event=>onChange({projectsPress:{...settings,introText:limitWords(event.target.value,PROJECTS_PRESS_INTRO_MAX_WORDS)}})}/>
        <span className="np-field-label" style={{opacity:1,textAlign:'right'}}>{countWords(settings.introText)} / {PROJECTS_PRESS_INTRO_MAX_WORDS} {t('words')}</span>
      </label>`);
});
console.log('ok');
