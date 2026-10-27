const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','..','components/portfolio/portfolio-work-projects-duotone.tsx');
let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error('need one: '+a.slice(0,70));s=s.replace(a,b);};
// left panel: optional meta hiding
rep(`  look = DEFAULT_DUOTONE_LOOK,
  showThumbnail = false,
}: {
  item: MarketplaceContentItem;`,`  look = DEFAULT_DUOTONE_LOOK,
  showThumbnail = false,
  hideMeta = false,
}: {
  /** Slide mode: the role / category line lives at the top of the info card instead. */
  hideMeta?: boolean;
  item: MarketplaceContentItem;`);
rep(`      {!premium ? (
        <div className="my-4 h-px w-full shrink-0" style={{ backgroundColor: border }} aria-hidden />
      ) : null}

      {!premium && metaLine ? (`,`      {!premium && !hideMeta ? (
        <div className="my-4 h-px w-full shrink-0" style={{ backgroundColor: border }} aria-hidden />
      ) : null}

      {!premium && !hideMeta && metaLine ? (`);
// right panel: header with meta + counter
rep(`  flushTop = false,
  look = DEFAULT_DUOTONE_LOOK,
}: {
  look?: DuotoneLook;
  item: MarketplaceContentItem;
  ink: string;
  muted: string;
  accent: string;
  border: string;
  background: string;
  active?: boolean;`,`  flushTop = false,
  look = DEFAULT_DUOTONE_LOOK,
  slideCounter,
}: {
  look?: DuotoneLook;
  /** Slide mode: puts the role / category and the "03 / 04" counter at the top of the info card. */
  slideCounter?: { index: number; total: number };
  item: MarketplaceContentItem;
  ink: string;
  muted: string;
  accent: string;
  border: string;
  background: string;
  active?: boolean;`);
rep(`      >
        {(() => {
          const animate = active !== undefined;
          const layerProps =`,`      >
        {slideCounter ? (
          <div
            className="mb-6 flex items-baseline justify-between gap-4 border-b pb-4"
            style={{ borderColor: border, fontFamily: DUOTONE_SANS }}
          >
            <span className="min-w-0 truncate text-[0.9rem]" style={{ color: duotoneMetaInk(look, muted) }}>
              {metaLine}
            </span>
            <span className="flex shrink-0 items-baseline gap-1.5 text-[0.85rem] tracking-[0.06em]">
              <span className="font-semibold" style={{ color: accent }}>
                {String(slideCounter.index + 1).padStart(2, '0')}
              </span>
              <span style={{ color: muted }}>/ {String(slideCounter.total).padStart(2, '0')}</span>
            </span>
          </div>
        ) : null}
        {(() => {
          const animate = active !== undefined;
          const layerProps =`);
// slide roles: drop the absolute counter, hand data to the panels
rep(`        <div
          className="pointer-events-none absolute z-20 flex items-baseline gap-1.5"
          style={{ left: frameInset, bottom: frameInset }}
        >
          <span className="text-[0.85rem] font-semibold tracking-[0.06em]" style={{ color: accent, fontFamily: DUOTONE_SANS }}>
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-[0.85rem] tracking-[0.06em]" style={{ color: muted, fontFamily: DUOTONE_SANS }}>
            / {String(items.length).padStart(2, '0')}
          </span>
        </div>

`,``);
rep(`                          thumbnailHeight={thumbnailHeight}
                          look={look}
                        />
                      </div>
                    </div>
                    <div className="flex w-[50%] flex-1 flex-col justify-center">
                      <WorkDuotoneRightPanel
                        item={item}
                        ink={ink}
                        muted={muted}
                        accent={accent}
                        border={border}
                        background={background}
                        enhanced
                        look={look}
                      />`,`                          thumbnailHeight={thumbnailHeight}
                          look={look}
                          hideMeta
                        />
                      </div>
                    </div>
                    <div className="flex w-[50%] flex-1 flex-col justify-center">
                      <WorkDuotoneRightPanel
                        item={item}
                        ink={ink}
                        muted={muted}
                        accent={accent}
                        border={border}
                        background={background}
                        enhanced
                        look={look}
                        slideCounter={{ index, total: items.length }}
                      />`);
fs.writeFileSync(f,s.replace(/\n/g,eol));console.log('ok');
