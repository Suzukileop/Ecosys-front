import React from 'react';
import { createRoot } from 'react-dom/client';
import { TeamEditorialRhythm } from '../components/portfolio/portfolio-team-design-editorial-rhythm';
import { DEFAULT_TEAM_PRESENTATION } from '../components/portfolio/portfolio-team-settings';
const root=createRoot(document.getElementById('root')!);
(window as any).renderTeam=(count=4, options:any={})=>{
  const dark=options.activeColorMode==='dark';
  document.body.style.background=dark?'#0a0a0a':'white';
  root.render(<div className="pf-theme-root" data-pf-color-transitions="true" style={{'--pf-palette-principal':'#be421c'} as any}>
    <TeamEditorialRhythm members={Array.from({length:count},(_,i)=>({id:`m-${i}`,sortOrder:i,
      name:options.longText?'UnNomTrèsLongSansEspacesPourVérifierLeRetourÀLaLigne':['Léa Martin','Alexandre Rakoto','Camille Dubois','Morgan'][i%4],
      responsibility:options.longText?'Direction artistique et accompagnement stratégique international des équipes créatives. '.repeat(3):'Design & développement',
      imageUrl:i===2?'':`http://portrait.test/${i}.jpg`,
      socialLinks:i===2?[]:[{id:`link-${i}`,platform:'WEBSITE',url:`https://example.com/${i}`}]
    }))} presentation={{...DEFAULT_TEAM_PRESENTATION,layout:'editorial-rhythm',
      nameColor:dark?'#f5f5f5':'#171717',responsibilityColor:dark?'#aaa':'#737373',...options,
      teamPalette:{...DEFAULT_TEAM_PRESENTATION.teamPalette,fond:dark?'#0a0a0a':'#fff'}
    }}/>
  </div>);
};
(window as any).renderTeam();
