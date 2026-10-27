'use client';

import { InfoPreviewPortrait } from './portfolio-info-preview-portrait';
import { useT } from '@/lib/i18n/I18nProvider';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';

export type RemainingInfoDesign = 'about-portrait-skills' | 'about-manifesto' | 'about-terminal' | 'about-index' | 'about-value-steps';

/** One identifying typographic gesture per layout; secondary content stays abstract. */
export function InfoRemainingIllustration({ design }: { design: RemainingInfoDesign }) {
  const theme = useThumbnailTheme('info');
  const t = useT();
  const serif = "'Playfair Display', Georgia, serif";
  const mono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  const portrait = (x: number, y: number, w: number, h: number) => <InfoPreviewPortrait x={x} y={y} width={w} height={h} />;
  let content;
  switch (design) {
    case 'about-portrait-skills':
      content = <>{portrait(370, 44, 226, 288)}
        <text x="44" y="110" fill={theme.ink} fontFamily={serif} fontSize="46" letterSpacing="-1">Design</text>
        <text x="44" y="174" fill={theme.ink} fontFamily={serif} fontSize="46" letterSpacing="-1">Digital</text>
        <text x="44" y="238" fill={theme.ink} fontFamily={serif} fontSize="46" letterSpacing="-1">Branding</text>
        <text x="44" y="312" fill={theme.muted} fontSize="19">Figma · React</text>
        
        <text x="370" y="360" fill={theme.muted} fontSize="17">Alex · Designer indépendant</text>
      </>;
      break;
    case 'about-manifesto':
      content = <><text x="44" y="111" fill={theme.ink} fontFamily={serif} fontSize="66" letterSpacing="-2">{t('About me')}</text>
        <path d="M44 151H154" stroke={theme.accent} strokeWidth="3" />
        <text x="44" y="218" fill={theme.muted} fontSize="21">Créer avec intention.</text><text x="44" y="249" fill={theme.muted} fontSize="18">Simplifier sans uniformiser.</text><text x="44" y="280" fill={theme.muted} fontSize="18">Concevoir pour les gens.</text>
        <path d="M358 205V318" stroke={theme.border} />
        <text x="394" y="218" fill={theme.ink} fontSize="23">Clarté</text><text x="394" y="266" fill={theme.ink} fontSize="23">Curiosité</text><text x="394" y="314" fill={theme.ink} fontSize="23">Précision</text>
      </>;
      break;
    case 'about-terminal':
      content = <><rect x="40" y="42" width="560" height="316" rx="10" fill={`color-mix(in srgb, ${theme.ink} 3%, ${theme.background})`} stroke={theme.border} />
        {[64, 83, 102].map((x, i) => <circle key={x} cx={x} cy="65" r="4" fill={i === 2 ? theme.accent : theme.muted} opacity={i === 2 ? 1 : 0.4} />)}
        <path d="M40 88H600" stroke={theme.border} />
        <text x="64" y="139" fill={theme.accent} fontFamily={mono} fontSize="27">&gt; about --bio</text>
        <text x="64" y="180" fill={theme.muted} fontSize="20">Designer indépendant basé à Paris.</text><text x="64" y="209" fill={theme.muted} fontSize="20">Je relie créativité et technologie.</text>
        <text x="64" y="260" fill={theme.ink} fontFamily={mono} fontSize="27">&gt; skills //</text>
        <text x="64" y="299" fill={theme.muted} fontSize="20">React · Figma · TypeScript</text><rect x="64" y="321" width="11" height="17" fill={theme.accent} />
      </>;
      break;
    case 'about-index':
      content = <><text x="44" y="88" fill={theme.accent} fontFamily={mono} fontSize="22">[ 01 ]</text>
        <text x="196" y="96" fill={theme.ink} fontSize="43" fontWeight="600" letterSpacing="-1.3">{t('About me')}</text>
        <text x="196" y="143" fill={theme.muted} fontSize="19">Design, technologie et sens du détail.</text><text x="196" y="173" fill={theme.muted} fontSize="18">Des idées aux expériences concrètes.</text>
        <path d="M44 218H596" stroke={theme.border} />
        <text x="196" y="253" fill={theme.ink} fontSize="20">Paris, France</text><text x="394" y="253" fill={theme.ink} fontSize="20">Indépendant</text>
        <text x="196" y="334" fill={theme.ink} fontSize="45" fontWeight="600">EN</text>
        <text x="324" y="334" fill={theme.ink} fontSize="45" fontWeight="600">FR</text>
        <text x="452" y="334" fill={theme.muted} fontSize="45" fontWeight="600">ES</text>
      </>;
      break;
    case 'about-value-steps':
      content = <>{[82, 192, 302].map((y, i) => <g key={y}>
        <text x="44" y={y + 16} fill={i === 0 ? theme.accent : theme.ink} fontSize="44" fontWeight="500" letterSpacing="-1.4">0{i + 1}</text>
        <text x="154" y={y + 5} fill={theme.ink} fontSize="26" fontWeight="600">{['Comprendre', 'Explorer', 'Créer'][i]}</text><text x="154" y={y + 34} fill={theme.muted} fontSize="19">{['Écouter vos besoins et définir le cap.', 'Faire émerger les bonnes idées.', 'Donner vie à une solution utile.'][i]}</text>
        {i < 2 ? <path d={`M44 ${y + 65}H596`} stroke={theme.border} /> : null}
      </g>)}</>;
      break;
  }
  return <svg viewBox="0 0 640 400" className="block h-full w-full" aria-hidden="true" data-info-remaining-illustration={design} style={{ background: theme.background, fontFamily: 'var(--font-app, ui-sans-serif), system-ui, sans-serif' }}>{content}</svg>;
}
