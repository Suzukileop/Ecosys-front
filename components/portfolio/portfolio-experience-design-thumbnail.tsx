import type {PortfolioExperienceDesign} from './portfolio-experience-settings';

// x, y, width, height, opacity, optional radius. Shared canvas keeps the catalogue compact.
type Mark = [number, number, number, number, number, number?];
const layouts:Record<Exclude<PortfolioExperienceDesign,'kinetic'>,Mark[]>={
  editorial:[[52,52,94,12,.3],[234,48,510,32,.55],[234,108,150,8,.22],[234,140,418,10,.17],[234,166,360,10,.17],[234,212,76,22,.17,11],[324,212,90,22,.17,11],[52,286,94,10,.25],[234,280,390,26,.4]],
  milestone:[[52,58,114,42,.5],[218,52,2,256,.2,1],[211,66,16,16,.5,8],[254,44,694,126,.07,12],[282,66,384,24,.5],[282,108,250,10,.22],[282,136,480,8,.17],[52,222,114,42,.4],[211,230,16,16,.4,8],[254,208,694,112,.07,12],[282,230,330,24,.45],[282,272,420,8,.17]],
  table:[[52,48,94,8,.25],[240,48,120,8,.25],[620,48,130,8,.25],[846,48,100,8,.25],[52,80,896,1,.14],[52,110,108,12,.3],[240,106,310,22,.5],[620,110,158,12,.25],[858,110,72,12,.25],[240,158,422,10,.17],[240,184,356,10,.17],[240,224,72,22,.17,11],[326,224,90,22,.17,11],[52,272,896,1,.14],[52,300,108,12,.25],[240,296,272,22,.4],[620,300,158,12,.22]],
  cards:[[52,44,430,276,.07,12],[518,44,430,276,.07,12],[78,72,120,8,.25],[544,72,120,8,.25],[78,106,300,30,.5],[544,106,274,30,.5],[78,162,230,10,.25],[544,162,250,10,.25],[78,202,354,8,.17],[544,202,328,8,.17],[78,226,300,8,.17],[544,226,290,8,.17],[78,274,68,20,.17,10],[158,274,82,20,.17,10],[544,274,68,20,.17,10],[624,274,82,20,.17,10]],
  reel:[[844,42,84,8,.16],[112,98,338,42,.55],[112,152,268,42,.55],[112,228,146,10,.25],[548,112,340,172,.07,12],[574,138,250,10,.22],[574,168,222,10,.17],[574,198,256,10,.17],[574,242,68,20,.17,10]],
  duotone:[[52,48,420,30,.5],[52,110,132,8,.25],[52,156,140,110,.15,5],[222,158,230,10,.22],[222,184,196,10,.17],[52,300,84,10,.25],[548,44,400,276,.07,12],[580,80,300,12,.25],[580,118,270,10,.17],[580,146,310,10,.17],[580,234,68,22,.17,11],[662,234,80,22,.17,11]],
  gallery:[[52,44,430,192,.16,8],[518,44,430,192,.16,8],[52,260,290,20,.5],[518,260,260,20,.5],[52,300,180,8,.25],[518,300,180,8,.25]],
  loft:[[52,46,224,118,.16,6],[316,60,132,8,.25],[316,92,412,24,.5],[316,138,242,8,.22],[52,188,896,1,.14],[52,212,224,108,.16,6],[316,224,132,8,.25],[316,256,362,24,.5],[316,300,242,8,.22]],
  press:[[52,44,172,120,.16,5],[266,48,200,8,.25],[266,80,540,28,.5],[266,130,310,8,.22],[266,162,68,18,.17,9],[52,212,172,108,.16,5],[266,216,200,8,.25],[266,248,470,28,.5],[266,298,310,8,.22]],
  legacy:[[52,44,504,180,.16,6],[52,248,128,20,.22,10],[52,286,400,30,.5],[628,76,260,34,.5],[628,136,206,12,.25],[628,176,260,10,.17],[628,204,220,10,.17],[628,256,150,28,.22,14]],
};

// Accent only small metadata/chip marks, never the dominant title or media blocks.
const accents:Record<Exclude<PortfolioExperienceDesign,'kinetic'>,readonly [number,number]>={
  editorial:[5,6],milestone:[2,8],table:[11,12],cards:[12,14],reel:[0,8],
  duotone:[10,11],gallery:[4,5],loft:[1,6],press:[4,6],legacy:[1,7],
};

/** Static layout diagrams: theme-aware, no image requests or loading animation. */
export function ExperienceDesignThumbnail({design}:{design:PortfolioExperienceDesign}){
  if(design==='kinetic')return (
    <svg viewBox="0 0 1000 365" aria-hidden="true" focusable="false" data-experience-schematic="kinetic" className="block h-auto w-full rounded-lg">
      <rect width="1000" height="365" rx="16" fill="currentColor" fillOpacity=".045" />
      {/* Period, then the dominant role title; the lower row keeps metadata left and tools right. */}
      <rect x="52" y="48" width="126" height="8" rx="4" fill="currentColor" fillOpacity=".25" />
      <rect x="52" y="100" width="640" height="48" rx="5" fill="currentColor" fillOpacity=".55" />
      <rect x="52" y="208" width="226" height="14" rx="4" fill="currentColor" fillOpacity=".3" />
      <g fill="currentColor" fillOpacity=".17">
        <rect x="52" y="264" width="12" height="3" rx="1.5" />
        <rect x="80" y="260" width="306" height="10" rx="3" />
        <rect x="52" y="304" width="12" height="3" rx="1.5" />
        <rect x="80" y="300" width="354" height="10" rx="3" />
        <rect x="706" y="296" width="66" height="24" rx="12" fill="#f97316" fillOpacity=".9" data-thumbnail-accent="orange" />
        <rect x="784" y="296" width="82" height="24" rx="12" fill="#3b82f6" fillOpacity=".9" data-thumbnail-accent="blue" />
        <rect x="878" y="296" width="70" height="24" rx="12" />
      </g>
    </svg>
  );
  return <svg viewBox="0 0 1000 365" aria-hidden="true" focusable="false" data-experience-schematic={design} className="block h-auto w-full rounded-lg">
    <rect width="1000" height="365" rx="16" fill="currentColor" fillOpacity=".045" />
    {layouts[design].map(([x,y,width,height,opacity,radius=3],i)=>{
      const accent=i===accents[design][0]?'orange':i===accents[design][1]?'blue':undefined;
      return <rect key={i} x={x} y={y} width={width} height={height} rx={radius} fill={accent==='orange'?'#f97316':accent==='blue'?'#3b82f6':'currentColor'} fillOpacity={accent ? .9 : opacity} data-thumbnail-accent={accent} />;
    })}
  </svg>;
}
