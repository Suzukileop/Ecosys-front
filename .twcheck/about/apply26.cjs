const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','..','components/portfolio/portfolio-experience-settings-panel.tsx');
let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const a=`          <NpCollapsibleSection title={t('Layout options')}>
          <SettingsRowsScope title={t('Layout options')}>
          {isTable ? (`;
const b=`          </SettingsRowsScope>
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Details')}>`;
if(s.split(a).length!==2||s.split(b).length!==2)throw new Error('anchors');
s=s.replace(a,`          {/* Kinetic has no layout option of its own: no empty section. */}
          {design === 'kinetic' ? null : (
          <NpCollapsibleSection title={t('Layout options')}>
          <SettingsRowsScope title={t('Layout options')}>
          {isTable ? (`);
s=s.replace(b,`          </SettingsRowsScope>
          </NpCollapsibleSection>
          )}
          <NpCollapsibleSection title={t('Details')}>`);
fs.writeFileSync(f,s.replace(/\n/g,eol));console.log('ok');
