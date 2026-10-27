const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','..','components/portfolio/portfolio-experience-lists.tsx');
let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error('need one: '+a.slice(0,70));s=s.replace(a,b);};
rep(`  const hasCopy = Boolean(description) || tasks.length > 0;

  return (
    <>
      {description ? (
        <p
          className={\`\${leadSteps ? 'pf-exp-lead-reveal ' : ''}m-0 p-0 text-left text-[1.05rem] leading-[1.85]\`}
          style={{ color: mutedColor, fontFamily: REEL_SANS }}`,`  const hasCopy = Boolean(description) || tasks.length > 0;
  // Defaults: description = secondary colour, tasks = strong ink. A colour the creator picked for the body
  // text (anything but the stock body colours) is kept for both, as before.
  const bodyIsStock = [DEFAULT_EXPERIENCE_BODY_COLOR, DEFAULT_EXPERIENCE_BODY_COLOR_DARK].some(
    (stock) => bodyColor.trim().toLowerCase() === stock.trim().toLowerCase()
  );
  const descriptionInk = bodyIsStock ? mutedColor : bodyColor;
  const taskInk = bodyIsStock ? titleColor : bodyColor;

  return (
    <>
      {description ? (
        <p
          className={\`\${leadSteps ? 'pf-exp-lead-reveal ' : ''}m-0 p-0 text-left text-[1.05rem] leading-[1.85]\`}
          style={{ color: descriptionInk, fontFamily: REEL_SANS }}`);
rep(`            display={flags.tasksDisplay}
            bodyColor={titleColor}
            mutedColor={mutedColor}
            isDark={flags.isDark}
            label=""
            size="lg"
            legibleMarkers`,`            display={flags.tasksDisplay}
            bodyColor={taskInk}
            mutedColor={mutedColor}
            isDark={flags.isDark}
            label=""
            size="lg"
            legibleMarkers`);
fs.writeFileSync(f,s.replace(/\n/g,eol));console.log('ok');
