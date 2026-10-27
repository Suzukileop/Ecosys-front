'use client';
import type { ReactNode } from 'react';
import type { PortfolioStackDesign } from './portfolio-stack-settings';
import { useT } from '@/lib/i18n/I18nProvider';

/** Same mini-wireframe/picker-card mechanism as Experience's design grid (see ExperienceDesignWireframe). */
function StackMiniSlide({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden data-stack-design-skeleton="">
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

function StackMiniType({
  x,
  y,
  children,
  size = 8,
  anchor = 'start',
}: {
  x: number;
  y: number;
  children: string;
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text
      className="pf-stack-mini-type"
      x={x}
      y={y}
      fontSize={size}
      fontWeight={700}
      letterSpacing="0.1em"
      textAnchor={anchor}
    >
      {children}
    </text>
  );
}

export function StackDesignWireframe({ design }: { design: PortfolioStackDesign }) {
  const t = useT();
  switch (design) {
    case 'workflow-rail':
      return (
        <StackMiniSlide>
          <rect className="pf-stack-mini-ink" x="8" y="18" width="14" height="14" rx="4" />
          <rect className="pf-stack-mini-mute" x="9" y="38" width="12" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="31" y="18" width="14" height="14" rx="4" />
          <rect className="pf-stack-mini-mute" x="32" y="38" width="12" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="54" y="18" width="14" height="14" rx="4" />
          <rect className="pf-stack-mini-mute" x="55" y="38" width="12" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="77" y="18" width="14" height="14" rx="4" />
          <rect className="pf-stack-mini-mute" x="78" y="38" width="12" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="100" y="18" width="14" height="14" rx="4" />
          <rect className="pf-stack-mini-mute" x="101" y="38" width="12" height="2.2" rx="1.1" />
        </StackMiniSlide>
      );
    case 'stack-tags':
      return (
        <StackMiniSlide>
          {[10, 27, 44, 61, 78, 95].map(x=><g key={x}><rect className="pf-stack-mini-mute" x={x} y="30" width="15" height="10" rx="1"/><rect className="pf-stack-mini-ink" x={x+3} y="34" width="9" height="2" rx="1"/></g>)}
        </StackMiniSlide>
      );
    case 'brand-cards':
      return (
        <StackMiniSlide>
          {[18,39].flatMap(y=>[8,62].map(x=><g key={`${x}-${y}`}><rect className="pf-stack-mini-mute" x={x} y={y} width="50" height="17" rx="1"/><rect className="pf-stack-mini-ink" x={x+3} y={y+3} width="11" height="11" rx="2"/><rect className="pf-stack-mini-ink" x={x+18} y={y+6} width="17" height="2" rx="1"/><rect className="pf-stack-mini-accent" x={x+37} y={y+11} width="9" height="1"/></g>))}
        </StackMiniSlide>
      );
    case 'brand-index':
      return (
        <StackMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="21" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="8" y="37" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="8" y="53" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-ink" x="8" y="10" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="12" width="22" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="50" y="12" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="78" y="12" width="30" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="28" width="18" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="50" y="28" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="78" y="28" width="24" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="42" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="44" width="24" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="50" y="44" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="78" y="44" width="28" height="2" rx="1" />
        </StackMiniSlide>
      );
    case 'brand-row':
      return (
        <StackMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="9" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="41" y="9" width="1" height="54" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="74" y="9" width="1" height="54" rx="0.5" />
          <rect className="pf-stack-mini-ink" x="18" y="18" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="15" y="30" width="14" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="51" y="18" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="48" y="30" width="14" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="84" y="18" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="81" y="30" width="14" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="18" y="44" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="15" y="56" width="14" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="51" y="44" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="48" y="56" width="14" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="84" y="44" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="81" y="56" width="14" height="2.2" rx="1.1" />
        </StackMiniSlide>
      );
    case 'level-progress-rows':
      return (
        <StackMiniSlide>
          <rect className="pf-stack-mini-ink" x="8" y="9" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="11" width="26" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="8" y="21" width="104" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="21" width="76" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="32" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="34" width="20" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="8" y="44" width="104" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="44" width="52" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="55" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="57" width="24" height="2.4" rx="1.2" />
        </StackMiniSlide>
      );
    case 'level-category-rows':
      return (
        <StackMiniSlide>
          <rect className="pf-stack-mini-ink" x="8" y="9" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="10" width="18" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="42" y="10.4" width="14" height="1.6" rx="0.8" />
          <rect className="pf-stack-mini-mute" x="8" y="20" width="88" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="20" width="60" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="32" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="33" width="22" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="46" y="33.4" width="14" height="1.6" rx="0.8" />
          <rect className="pf-stack-mini-mute" x="8" y="43" width="88" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="43" width="40" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="55" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="56" width="16" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="40" y="56.4" width="14" height="1.6" rx="0.8" />
        </StackMiniSlide>
      );
    case 'level-table-rows':
      return (
        <StackMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="20" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="8" y="36" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="8" y="52" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-ink" x="8" y="9" width="7" height="7" rx="2" />
          <rect className="pf-stack-mini-mute" x="20" y="10.5" width="20" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-mute" x="46" y="10.5" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="94" y="9" width="14" height="7" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="25" width="7" height="7" rx="2" />
          <rect className="pf-stack-mini-mute" x="20" y="26.5" width="24" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-mute" x="52" y="26.5" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="94" y="25" width="14" height="7" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="41" width="7" height="7" rx="2" />
          <rect className="pf-stack-mini-mute" x="20" y="42.5" width="18" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-mute" x="44" y="42.5" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="94" y="41" width="14" height="7" rx="2" />
        </StackMiniSlide>
      );
    case 'level-circular-cards':
      return (
        <StackMiniSlide>
          <circle className="pf-stack-mini-ring" cx="24" cy="28" r="12" strokeWidth={2.5} />
          <circle className="pf-stack-mini-ink" cx="24" cy="28" r="4" />
          <rect className="pf-stack-mini-mute" x="14" y="46" width="20" height="2.2" rx="1.1" />
          <circle className="pf-stack-mini-ring" cx="60" cy="28" r="12" strokeWidth={2.5} />
          <circle className="pf-stack-mini-ink" cx="60" cy="28" r="4" />
          <rect className="pf-stack-mini-mute" x="50" y="46" width="20" height="2.2" rx="1.1" />
          <circle className="pf-stack-mini-ring" cx="96" cy="28" r="12" strokeWidth={2.5} />
          <circle className="pf-stack-mini-ink" cx="96" cy="28" r="4" />
          <rect className="pf-stack-mini-mute" x="86" y="46" width="20" height="2.2" rx="1.1" />
        </StackMiniSlide>
      );
    case 'level-star-cards':
      return (
        <StackMiniSlide>
          {[8,44,80].map(x=><g key={x}><rect className="pf-stack-mini-mute" x={x} y="28" width="32" height="14" rx="1"/><rect className="pf-stack-mini-ink" x={x+3} y="34" width="10" height="2" rx="1"/>{[17,20,23,26,29].map((offset,i)=><circle key={offset} className={i<4?'pf-stack-mini-accent':'pf-stack-mini-mute'} cx={x+offset} cy="35" r="1"/>)}</g>)}
        </StackMiniSlide>
      );
    case 'level-svg-rings':
      return (
        <StackMiniSlide>
          <circle className="pf-stack-mini-ring" cx="24" cy="32" r="16" strokeWidth={3} />
          <StackMiniType x={24} y={34} size={6} anchor="middle">
            {t('FO')}
          </StackMiniType>
          <circle className="pf-stack-mini-ring" cx="60" cy="32" r="16" strokeWidth={3} />
          <StackMiniType x={60} y={34} size={6} anchor="middle">
            {t('OR')}
          </StackMiniType>
          <circle className="pf-stack-mini-ring" cx="96" cy="32" r="16" strokeWidth={3} />
          <StackMiniType x={96} y={34} size={6} anchor="middle">
            {t('LU')}
          </StackMiniType>
        </StackMiniSlide>
      );
    case 'level-bento-categories':
      return (
        <StackMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="8" width="50" height="26" rx="3.5" />
          <rect className="pf-stack-mini-ink" x="14" y="14" width="7" height="7" rx="2" />
          <rect className="pf-stack-mini-mute" x="14" y="26" width="28" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-mute" x="62" y="8" width="50" height="14" rx="3.5" />
          <rect className="pf-stack-mini-mute" x="62" y="26" width="24" height="8" rx="3" />
          <rect className="pf-stack-mini-mute" x="90" y="26" width="22" height="8" rx="3" />
          <rect className="pf-stack-mini-mute" x="8" y="38" width="24" height="26" rx="3.5" />
          <rect className="pf-stack-mini-mute" x="36" y="38" width="24" height="26" rx="3.5" />
          <rect className="pf-stack-mini-mute" x="64" y="38" width="48" height="26" rx="3.5" />
          <rect className="pf-stack-mini-ink" x="70" y="44" width="7" height="7" rx="2" />
        </StackMiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}


