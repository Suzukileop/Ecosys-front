'use client';
import type { PortfolioStackHeaderDesign } from './portfolio-stack-settings';
import {useT} from '@/lib/i18n/I18nProvider';

/** Header-only anatomy, drawn at the same wide aspect ratio as the loaded preview. */
export function StackHeaderSkeleton({ design, word = 'STACK', title = 'Core stack', lead = 'Core', count = '08', compact = false }: { design: PortfolioStackHeaderDesign; word?: string; title?: string; lead?: string; count?: string; compact?: boolean }) {
  const t=useT();
  const labels:Record<string,string>={STACK:t('Core stack'),WORK:t('Selected work'),INFO:t('About me'),TOOLS:t('Tools'),SERVICES:t('Services'),EXPERIENCE:t('Experience'),TEAM:t('Our team'),GALLERY:t('Gallery'),CONTACT:t('Contact'),FAQ:t('Frequently asked questions')};
  title=labels[word]??t(title);
  lead=title.split(/\s+/)[0];
  word=(labels[word]??t(word)).toLocaleUpperCase(t.locale);
  const block = (x: number, y: number, w: number, h: number, soft = false, rx = 2) => <rect x={x} y={y} width={w} height={h} rx={rx} className={soft ? 'pf-stack-mini-mute' : 'pf-stack-mini-ink'} />;
  let content;
  switch (design) {
    case 'none': return null;
    case 'editorial':
      content = <>{block(48, 76, 62, 6, true)}{block(48, 108, 342, 35)}{block(48, 174, 400, 6, true)}{block(48, 194, 290, 6, true)}</>;
      break;
    case 'marquee':
      content = <><text x="-28" y="188" fontSize="94" fontWeight="700" className="pf-stack-mini-ink" letterSpacing="-3">{word} · {word}</text></>;
      break;
    case 'index':
      content = <>{block(48, 74, 54, 6, true)}{block(124, 76, 466, 2, true)}
        <text x="46" y="195" fontSize="88" fontWeight="300" className="pf-stack-mini-ink">{count}</text>
        {block(48, 216, 78, 5, true)}{block(186, 113, 2, 110, true)}{block(218, 128, 306, 29)}{block(218, 186, 344, 6, true)}{block(218, 207, 264, 6, true)}
      </>;
      break;
    case 'accent-count':
      content = <>{block(48, 75, 160, 32, false, 16)}{block(48, 145, 434, 22)}{block(48, 180, 342, 22)}{block(48, 230, 220, 5, true)}</>;
      break;
    case 'serif-lead':
      content = <>{block(48, 60, 62, 6, true)}
        <text x="48" y="135" fontSize="51" fontFamily="Georgia, serif" className="pf-stack-mini-ink">{title}</text>
        {block(48, 162, 444, 24)}{block(48, 225, 336, 6, true)}
      </>;
      break;
    case 'billboard':
      content = <><text x="320" y="169" textAnchor="middle" fontSize="133" fontWeight="800" letterSpacing="-6" className="pf-stack-mini-ring" strokeWidth="2">{word}</text>
        {block(48, 227, 270, 24)}{block(476, 239, 116, 5, true)}
      </>;
      break;
    case 'masthead':
      content = <>{block(48, 65, 450, 35)}{block(48, 125, 538, 35)}{block(48, 185, 368, 35)}</>;
      break;
    case 'split-heading':
      content = <><text x="48" y="158" fontSize="53" fontStyle="italic" className="pf-stack-mini-ink">{lead}</text>{block(174, 123, 226, 35)}{block(510, 126, 82, 6, true)}</>;
      break;
  }
  return <svg viewBox={compact ? '0 50 640 220' : '0 0 640 320'} className="pf-stack-mini" aria-hidden="true" data-stack-header-skeleton={design}>{content}</svg>;
}
