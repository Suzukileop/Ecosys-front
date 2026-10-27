'use client';

import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faTextHeight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useT } from '@/lib/i18n/I18nProvider';
import type { PortfolioInfoSectionSettings } from './portfolio-info-settings';
import type { InfoBioCase } from './portfolio-info-bio';

const CASES: { value: InfoBioCase; label: string }[] = [
  { value: 'original', label: 'Original' },
  { value: 'sentence', label: 'Sentence case' },
  { value: 'lowercase', label: 'Lowercase' },
  { value: 'uppercase', label: 'Uppercase' },
  { value: 'title', label: 'Title case' },
];

export function InfoBioToolbar({ info, onChange }: {
  info: Pick<PortfolioInfoSectionSettings, 'bioBold' | 'bioItalic' | 'bioCase' | 'bioLineHeight'>;
  onChange: (patch: Partial<Pick<PortfolioInfoSectionSettings, 'bioBold' | 'bioItalic' | 'bioCase' | 'bioLineHeight'>>) => void;
}) {
  const t = useT();
  const root = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<'case' | 'spacing' | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!menu) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setMenu(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenu(null); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [menu]);

  return <div ref={root} className="np-bio-format">
    <p className="np-field-label">{t('Format')}</p>
    <div className="flex items-center gap-1" role="group" aria-label={t('Format')}>
      <button type="button" className="np-bio-format-button" aria-label={t('Bold')} title={t('Bold')} aria-pressed={info.bioBold === true} onClick={() => onChange({ bioBold: !info.bioBold })}><FontAwesomeIcon icon={faBold} aria-hidden /></button>
      <button type="button" className="np-bio-format-button" aria-label={t('Italic')} title={t('Italic')} aria-pressed={info.bioItalic === true} onClick={() => onChange({ bioItalic: !info.bioItalic })}><FontAwesomeIcon icon={faItalic} aria-hidden /></button>
      <span className="mx-1 h-4 w-px bg-[var(--np-sep)]" aria-hidden />
      {(['case', 'spacing'] as const).map(kind => <div key={kind} className="relative">
        <button type="button" className="np-bio-format-button" aria-label={t(kind === 'case' ? 'Change case' : 'Line spacing')} title={t(kind === 'case' ? 'Change case' : 'Line spacing')} aria-expanded={menu === kind} aria-haspopup="dialog" onClick={event => { trigger.current = event.currentTarget; setMenu(menu === kind ? null : kind); }}>
          {kind === 'case' ? <span className="text-[17px] font-medium" aria-hidden>Aa</span> : <FontAwesomeIcon icon={faTextHeight} aria-hidden />}
        </button>
        {menu === kind ? <div className="np-bio-format-menu" role="dialog" aria-label={t(kind === 'case' ? 'Change case' : 'Line spacing')}>
          <p className="px-3 pb-2 pt-1 text-[11px] text-[var(--np-muted)]">{t(kind === 'case' ? 'Change case' : 'Line spacing')}</p>
          {(kind === 'case' ? CASES : [{ value: 'default', label: 'Default' }, ...[1, 1.25, 1.5, 1.75, 2, 2.5].map(value => ({ value: String(value), label: String(value) }))]).map(option => {
            const selected = kind === 'case' ? (info.bioCase ?? 'original') === option.value : String(info.bioLineHeight ?? 'default') === option.value;
            return <button key={option.value} type="button" className="np-bio-format-menu-option" aria-pressed={selected} onClick={() => {
              onChange(kind === 'case' ? { bioCase: option.value as InfoBioCase } : { bioLineHeight: option.value === 'default' ? undefined : Number(option.value) });
              setMenu(null); trigger.current?.focus();
            }}><span>{t(option.label)}</span>{selected ? <FontAwesomeIcon icon={faCheck} className="h-3 w-3" aria-hidden /> : null}</button>;
          })}
        </div> : null}
      </div>)}
    </div>
  </div>;
}
