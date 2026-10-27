const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(!s.includes(a))throw new Error(rel+' missing '+a.slice(0,60));s=s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
edit('components/portfolio/portfolio-work-settings.ts',rep=>{
rep(`export type PortfolioWorkProjectsFramesCardGap = 'tight' | 'md' | 'xl';`,`export type PortfolioWorkProjectsFramesCardGap = 'tight' | 'md' | 'xl';
export type PortfolioWorkProjectsFramesTitleStyle = 'display' | 'simple';`);
rep(`  cardGap: PortfolioWorkProjectsFramesCardGap;
};`,`  cardGap: PortfolioWorkProjectsFramesCardGap;
  /** "display": oversized black-weight title; "simple": a medium-weight title at a moderate size. */
  titleStyle: PortfolioWorkProjectsFramesTitleStyle;
};`);
rep(`  cardGap: 'tight',
};`,`  cardGap: 'tight',
  titleStyle: 'display',
};`);
rep(`      : base.cardGap;
  return {`,`      : base.cardGap;
  const titleStyle =
    record.titleStyle === 'display' || record.titleStyle === 'simple' ? record.titleStyle : base.titleStyle;
  return {`);
rep(`    radius,
    cardGap,
  };`,`    radius,
    cardGap,
    titleStyle,
  };`);
rep(`export const PORTFOLIO_WORK_FRAMES_CARD_GAP_OPTIONS:`,`export const PORTFOLIO_WORK_FRAMES_TITLE_STYLE_OPTIONS: {
  value: PortfolioWorkProjectsFramesTitleStyle;
  label: string;
  description: string;
}[] = [
  { value: 'display', label: msg('Display'), description: msg('Oversized, black-weight title (default).') },
  { value: 'simple', label: msg('Simple'), description: msg('A calmer medium-weight title at a moderate size.') },
];

export const PORTFOLIO_WORK_FRAMES_CARD_GAP_OPTIONS:`);
});
edit('components/portfolio/portfolio-work-settings-panel.tsx',rep=>{
rep(`PORTFOLIO_WORK_FRAMES_CARD_GAP_OPTIONS, `,`PORTFOLIO_WORK_FRAMES_CARD_GAP_OPTIONS, PORTFOLIO_WORK_FRAMES_TITLE_STYLE_OPTIONS, `);
rep(`                      cardGap,
                    },
                  })
                }
              />
            </div>`,`                      cardGap,
                    },
                  })
                }
              />

              <WorkSlider
                label={t('Title style')}
                options={PORTFOLIO_WORK_FRAMES_TITLE_STYLE_OPTIONS}
                value={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).titleStyle ?? 'display'}
                onChange={(titleStyle) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      titleStyle,
                    },
                  })
                }
              />
            </div>`);
});
edit('components/portfolio/portfolio-work-projects-frames.tsx',rep=>{
rep(`  const titleWords = item.title.trim()`,`  const simpleTitle = board.titleStyle === 'simple';
  const titleWords = item.title.trim()`);
rep(`      className="pf-frames-title relative z-10 font-black leading-[0.92] tracking-[-0.045em] text-[clamp(2.1rem,11vw,3.25rem)] transition-[color,-webkit-text-stroke-width] duration-500 ease-out sm:text-[clamp(2.4rem,9vw,3.75rem)] md:text-[clamp(2.75rem,6vw,4.25rem)] lg:text-[clamp(3.25rem,6.5vw,6rem)] [color:var(--pf-frames-ink)] group-hover/frame:text-transparent group-hover/frame:[-webkit-text-stroke:1.5px_var(--pf-frames-ink)] group-focus-visible/frame:text-transparent group-focus-visible/frame:[-webkit-text-stroke:1.5px_var(--pf-frames-ink)]"`,`      className={`+'`'+`pf-frames-title relative z-10 transition-[color,-webkit-text-stroke-width] duration-500 ease-out [color:var(--pf-frames-ink)] \${
        simpleTitle
          ? 'font-medium leading-[1.08] tracking-[-0.025em] text-[clamp(1.75rem,7vw,2.25rem)] md:text-[clamp(2rem,3.6vw,2.75rem)] lg:text-[clamp(2.25rem,3.4vw,3.25rem)]'
          : 'font-black leading-[0.92] tracking-[-0.045em] text-[clamp(2.1rem,11vw,3.25rem)] sm:text-[clamp(2.4rem,9vw,3.75rem)] md:text-[clamp(2.75rem,6vw,4.25rem)] lg:text-[clamp(3.25rem,6.5vw,6rem)] group-hover/frame:text-transparent group-hover/frame:[-webkit-text-stroke:1.5px_var(--pf-frames-ink)] group-focus-visible/frame:text-transparent group-focus-visible/frame:[-webkit-text-stroke:1.5px_var(--pf-frames-ink)]'
      }`+'`'+`}`);
rep(`        backgroundColor: \`\${muted}22\`,
        clipPath: framesClipPath(revealed),`,`        clipPath: framesClipPath(revealed),`);
});
console.log('ok');
