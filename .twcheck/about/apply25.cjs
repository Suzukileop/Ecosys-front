const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','..','components/portfolio/portfolio-experience-settings-panel.tsx');
let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const block=`          <NpCollapsibleSection title={t('Style')}>
          <SectionColorModeControl
            label={t('Color mode')}
            value={experience.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          />
          <TextSizeSlider label={t('Text size')} options={PORTFOLIO_EXPERIENCE_PREMIUM_FONT_SIZE_OPTIONS} value={experience.premiumFontSize ?? 'medium'} onChange={(premiumFontSize) => onChange({ premiumFontSize })} />
          </NpCollapsibleSection>
`;
if(s.split(block).length!==2)throw new Error('block count');
s=s.replace(block,'');
const anchor=`          </NpCollapsibleSection>
        </div></div>
      ) : !experience.enabled ? (`;
if(!s.includes(anchor))throw new Error('anchor');
s=s.replace(anchor,`          </NpCollapsibleSection>
${block}        </div></div>
      ) : !experience.enabled ? (`);
fs.writeFileSync(f,s.replace(/\n/g,eol));console.log('ok');
