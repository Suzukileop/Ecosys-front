'use client';
import type { ReactNode } from 'react';
import type { PortfolioToolsDesign } from './portfolio-tools-settings';
import { useT } from '@/lib/i18n/I18nProvider';

/** Same mini-wireframe/picker-card mechanism as Stack's design grid (see StackDesignWireframe). */
function ToolsMiniSlide({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

function ToolsMiniType({
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


export function ToolsDesignWireframe({ design }: { design: PortfolioToolsDesign }) {
  const t = useT();
  switch (design) {
    case 'workflow-rail':
      return (
        <ToolsMiniSlide>
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
        </ToolsMiniSlide>
      );
    case 'brand-cards':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="8" width="48" height="56" rx="4" />
          <rect className="pf-stack-mini-ink" x="14" y="15" width="12" height="12" rx="3" />
          <rect className="pf-stack-mini-mute" x="14" y="34" width="28" height="3" rx="1.4" />
          <rect className="pf-stack-mini-mute" x="14" y="41" width="32" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="14" y="49" width="16" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-mute" x="64" y="8" width="48" height="56" rx="4" />
          <rect className="pf-stack-mini-ink" x="70" y="15" width="12" height="12" rx="3" />
          <rect className="pf-stack-mini-mute" x="70" y="34" width="28" height="3" rx="1.4" />
          <rect className="pf-stack-mini-mute" x="70" y="41" width="24" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="70" y="49" width="16" height="2.2" rx="1.1" />
        </ToolsMiniSlide>
      );
    case 'brand-directory':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="21" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="8" y="37" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="8" y="53" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-ink" x="8" y="10" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="10" width="26" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="22" y="15.5" width="18" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="96" y="9" width="16" height="7" rx="3.5" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="26" width="22" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="22" y="31.5" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="96" y="25" width="16" height="7" rx="3.5" />
          <rect className="pf-stack-mini-ink" x="8" y="42" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="42" width="20" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="22" y="47.5" width="18" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="96" y="41" width="16" height="7" rx="3.5" />
        </ToolsMiniSlide>
      );
    case 'brand-index':
      return (
        <ToolsMiniSlide>
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
        </ToolsMiniSlide>
      );
    case 'brand-row':
      return (
        <ToolsMiniSlide>
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
        </ToolsMiniSlide>
      );
    case 'brand-float':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="7" y="7" width="33" height="28" rx="5" />
          <rect className="pf-stack-mini-ink" x="17" y="14" width="13" height="13" rx="4" />
          <rect className="pf-stack-mini-mute" x="43" y="7" width="33" height="28" rx="5" />
          <rect className="pf-stack-mini-ink" x="53" y="14" width="13" height="13" rx="4" />
          <rect className="pf-stack-mini-mute" x="79" y="7" width="33" height="28" rx="5" />
          <rect className="pf-stack-mini-ink" x="89" y="14" width="13" height="13" rx="4" />
          <rect className="pf-stack-mini-mute" x="7" y="39" width="33" height="26" rx="5" />
          <rect className="pf-stack-mini-ink" x="17" y="45" width="13" height="13" rx="4" />
          <rect className="pf-stack-mini-mute" x="43" y="39" width="33" height="26" rx="5" />
          <rect className="pf-stack-mini-ink" x="53" y="45" width="13" height="13" rx="4" />
          <rect className="pf-stack-mini-mute" x="79" y="39" width="33" height="26" rx="5" />
          <rect className="pf-stack-mini-ink" x="89" y="45" width="13" height="13" rx="4" />
        </ToolsMiniSlide>
      );
    case 'level-stat-bars':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="7" y="7" width="33" height="34" rx="5" />
          <rect className="pf-stack-mini-ink" x="14" y="13" width="10" height="10" rx="3" />
          <rect className="pf-stack-mini-mute" x="14" y="27" width="19" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="14" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-accent" x="19" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-accent" x="24" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-mute" x="29" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-mute" x="43" y="7" width="33" height="34" rx="5" />
          <rect className="pf-stack-mini-ink" x="50" y="13" width="10" height="10" rx="3" />
          <rect className="pf-stack-mini-mute" x="50" y="27" width="19" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="50" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-accent" x="55" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-mute" x="60" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-mute" x="65" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-mute" x="79" y="7" width="33" height="34" rx="5" />
          <rect className="pf-stack-mini-ink" x="86" y="13" width="10" height="10" rx="3" />
          <rect className="pf-stack-mini-mute" x="86" y="27" width="19" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="86" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-accent" x="91" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-accent" x="96" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-accent" x="101" y="31.5" width="3.5" height="3" rx="1" />
        </ToolsMiniSlide>
      );
    case 'level-progress-rows':
      return (
        <ToolsMiniSlide>
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
        </ToolsMiniSlide>
      );
    case 'level-category-rows':
      return (
        <ToolsMiniSlide>
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
        </ToolsMiniSlide>
      );
    case 'level-table-rows':
      return (
        <ToolsMiniSlide>
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
        </ToolsMiniSlide>
      );
    case 'level-circular-cards':
      return (
        <ToolsMiniSlide>
          <circle className="pf-stack-mini-ring" cx="24" cy="28" r="12" strokeWidth={2.5} />
          <circle className="pf-stack-mini-ink" cx="24" cy="28" r="4" />
          <rect className="pf-stack-mini-mute" x="14" y="46" width="20" height="2.2" rx="1.1" />
          <circle className="pf-stack-mini-ring" cx="60" cy="28" r="12" strokeWidth={2.5} />
          <circle className="pf-stack-mini-ink" cx="60" cy="28" r="4" />
          <rect className="pf-stack-mini-mute" x="50" y="46" width="20" height="2.2" rx="1.1" />
          <circle className="pf-stack-mini-ring" cx="96" cy="28" r="12" strokeWidth={2.5} />
          <circle className="pf-stack-mini-ink" cx="96" cy="28" r="4" />
          <rect className="pf-stack-mini-mute" x="86" y="46" width="20" height="2.2" rx="1.1" />
        </ToolsMiniSlide>
      );
    case 'level-star-cards':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="10" width="104" height="22" rx="4" />
          <rect className="pf-stack-mini-mute" x="16" y="18" width="26" height="3" rx="1.5" />
          <circle className="pf-stack-mini-accent" cx="70" cy="19.5" r="2.2" />
          <circle className="pf-stack-mini-accent" cx="78" cy="19.5" r="2.2" />
          <circle className="pf-stack-mini-accent" cx="86" cy="19.5" r="2.2" />
          <circle className="pf-stack-mini-mute" cx="94" cy="19.5" r="2.2" />
          <circle className="pf-stack-mini-mute" cx="102" cy="19.5" r="2.2" />
          <rect className="pf-stack-mini-mute" x="8" y="40" width="104" height="22" rx="4" />
          <rect className="pf-stack-mini-mute" x="16" y="48" width="22" height="3" rx="1.5" />
          <circle className="pf-stack-mini-accent" cx="70" cy="49.5" r="2.2" />
          <circle className="pf-stack-mini-accent" cx="78" cy="49.5" r="2.2" />
          <circle className="pf-stack-mini-accent" cx="86" cy="49.5" r="2.2" />
          <circle className="pf-stack-mini-accent" cx="94" cy="49.5" r="2.2" />
          <circle className="pf-stack-mini-mute" cx="102" cy="49.5" r="2.2" />
        </ToolsMiniSlide>
      );
    case 'level-svg-rings':
      return (
        <ToolsMiniSlide>
          <circle className="pf-stack-mini-ring" cx="24" cy="32" r="16" strokeWidth={3} />
          <ToolsMiniType x={24} y={34} size={6} anchor="middle">
            {t('FO')}
          </ToolsMiniType>
          <circle className="pf-stack-mini-ring" cx="60" cy="32" r="16" strokeWidth={3} />
          <ToolsMiniType x={60} y={34} size={6} anchor="middle">
            {t('OR')}
          </ToolsMiniType>
          <circle className="pf-stack-mini-ring" cx="96" cy="32" r="16" strokeWidth={3} />
          <ToolsMiniType x={96} y={34} size={6} anchor="middle">
            {t('LU')}
          </ToolsMiniType>
        </ToolsMiniSlide>
      );
    case 'level-bento-categories':
      return (
        <ToolsMiniSlide>
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
        </ToolsMiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}


