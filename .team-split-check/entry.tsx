import React from 'react';
import { createRoot } from 'react-dom/client';
import { TeamSplitScreen } from '../components/portfolio/portfolio-team-design-split-screen';
import { DEFAULT_TEAM_PRESENTATION, mergeTeamPresentation } from '../components/portfolio/portfolio-team-settings';
const root = createRoot(document.getElementById('root')!);
(window as any).mergeTeam = (patch: any) => mergeTeamPresentation(DEFAULT_TEAM_PRESENTATION, JSON.parse(JSON.stringify(patch)));
const names = ['Léa Martin', 'Alexandre Rakotondramananjara', 'Camille Dubois', 'Morgan', 'UnNomExtrêmementLongSansEspacePourVérifierLeRetourÀLaLigne', 'Jules Bernard'];
(window as any).renderTeam = (count = 5, options: any = {}) => {
  const dark = options.activeColorMode === 'dark';
  document.body.style.background = dark ? '#0a0a0a' : '#fff';
  root.render(<div className="pf-theme-root" data-pf-color-transitions="true" style={{ paddingInline: '32px', '--pf-palette-principal': '#b74116', '--pf-team-font-scale': options.fontScale ?? 1 } as any}>
    <TeamSplitScreen members={Array.from({ length: count }, (_, i) => ({
      id: `member-${i}`, sortOrder: i, name: names[i % names.length],
      responsibility: i === 3 ? '' : options.longRole && i === 1 ? 'Direction artistique, stratégie de marque internationale et accompagnement des équipes créatives. '.repeat(4) : 'Design & développement',
      imageUrl: i === 3 ? '' : `http://portrait.test/${i}.jpg`,
      socialLinks: i === 2 ? [] : [{ id:`link-${i}`,platform:'WEBSITE',url:`https://example.com/member-${i}` }],
    }))} presentation={{ ...DEFAULT_TEAM_PRESENTATION, layout: 'split-screen', activeColorMode:dark?'dark':'light',
      nameColor:dark?'#f5f5f5':'#171717', responsibilityColor:dark?'#a3a3a3':'#737373', ...options,
      teamPalette:{...DEFAULT_TEAM_PRESENTATION.teamPalette, fond:dark?'#0a0a0a':'#ffffff'},
    }} contentGutter="wide" />
  </div>);
};
(window as any).renderTeam();
