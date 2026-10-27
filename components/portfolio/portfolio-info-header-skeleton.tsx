'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import type { PortfolioInfoHeaderDesign } from './portfolio-info-settings';
import { StackHeaderSkeleton } from './portfolio-stack-header-skeleton';

export function InfoHeaderSkeleton({ design, compact = false }: { design: PortfolioInfoHeaderDesign; compact?: boolean }) {
  const t = useT();
  if (design !== 'chapter' && design !== 'cover') {
    return <StackHeaderSkeleton design={design} word="INFO" title={t('About me')} lead="My" count="04" compact={compact} />;
  }
  return <svg viewBox={compact ? '0 50 640 220' : '0 0 640 320'} className="pf-stack-mini" aria-hidden="true" data-info-header-skeleton={design}>
    {design === 'chapter' ? <>
      <text x="48" y="115" fontFamily="Georgia, serif" fontStyle="italic" fontSize="53" className="pf-stack-mini-ink">02 /</text>
      <text x="48" y="196" fontFamily="Georgia, serif" fontStyle="italic" fontSize="61" className="pf-stack-mini-ink">{t('Expertise')}</text>
      <rect x="48" y="232" width="106" height="3" className="pf-stack-mini-ink" />
    </> : <g>
      <rect x="114" y="62" width="412" height="34" className="pf-stack-mini-ink" />
      <rect x="66" y="125" width="508" height="34" className="pf-stack-mini-ink" />
      <rect x="182" y="188" width="276" height="34" className="pf-stack-mini-ink" />
    </g>}
  </svg>;
}
