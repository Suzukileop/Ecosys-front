import type { CSSProperties } from 'react';

/**
 * Thème panneau droit — style CapCut (noir / dégradé gris foncé / accent cyan).
 */
export const PANEL = {
  accent: '#22d3ee',
  accentDim: '#06b6d4',
  /** Barre latérale navigation (CapCut) — noir pur */
  navBg: '#000000',
  /** Zone contenu adjacente — gris très foncé */
  contentBg: '#1a1a1a',
  navActiveBg: '#2d2d2d',
  navHoverBg: '#141414',
  bgDeep: '#0f0f0f',
  bgShell: '#181818',
  bgCard: '#252525',
  bgCardHover: '#2e2e2e',
  bgInput: '#2b2b2b',
  bgElevated: '#333333',
  border: '#2a2a2a',
  borderMuted: '#333333',
  borderInput: '#3a3a3a',
  /** Bordure sections TEXTE (styles, police, couleur…) — inline, pas Tailwind. */
  sectionBorder: 'rgba(255, 255, 255, 0.08)',
  sectionBg: '#1f1f1f',
  shellGradient: 'linear-gradient(180deg, #121212 0%, #181818 45%, #1c1c1c 100%)',
  headerGradient: 'linear-gradient(180deg, #141414 0%, #181818 100%)',
} as const;

/** Style boîte section panneau TEXTE (évite les classes Tailwind non générées depuis lib/). */
export const textSectionBoxStyle: CSSProperties = {
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: PANEL.sectionBorder,
  backgroundColor: PANEL.sectionBg,
};

export const panelClasses = {
  shell:
    'flex h-full overflow-hidden relative border-r border-[#2a2a2a]',
  collapsed:
    'flex flex-col h-full bg-black border-r border-[#2a2a2a] items-center py-3 gap-3',
  navRail:
    'flex w-[68px] shrink-0 flex-col border-r border-[#1a1a1a]',
  navBtnActive:
    'mx-1.5 flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2.5 text-[10px] font-medium text-white transition-colors',
  navBtnInactive:
    'mx-1.5 flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2.5 text-[10px] font-medium text-neutral-500 transition-colors hover:bg-[#141414] hover:text-neutral-300',
  contentShell: 'flex min-w-0 flex-1 flex-col',
  seqNav:
    'flex items-center justify-between border-b border-[#2a2a2a] px-3 py-2.5 shrink-0',
  scroll:
    'flex-1 overflow-y-auto overscroll-contain p-3 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
  contentFlex:
    'flex min-h-0 flex-1 flex-col overflow-hidden px-3 pt-3 pb-3',
  sectionTitle:
    'text-[10px] font-semibold uppercase tracking-wider text-neutral-400',
  sectionLabel: 'text-[10px] text-neutral-500 shrink-0',
  card: 'rounded-lg border border-[#333333] bg-[#252525] p-2.5 space-y-2',
  cardInset: 'rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] p-2.5 space-y-2',
  /** Layout sections TEXTE — bordure via textSectionBoxStyle (inline). */
  cardSection: 'rounded-lg p-2.5 space-y-2',
  infoBox:
    'rounded-lg border border-[#2a2a2a] bg-gradient-to-b from-[#1a1a1a] to-[#141414] p-2.5',
  textarea:
    'w-full resize-none rounded-lg border border-[#3a3a3a] bg-[#252525] p-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-cyan-500/70 focus:outline-none focus:ring-1 focus:ring-cyan-500/25 leading-snug',
  select:
    'w-full rounded-lg border border-[#3a3a3a] bg-[#2b2b2b] px-2.5 py-1.5 text-xs text-white focus:border-cyan-500/70 focus:outline-none',
  input:
    'w-full rounded-lg border border-[#3a3a3a] bg-[#252525] px-2.5 py-1.5 text-xs text-white focus:border-cyan-500/70 focus:outline-none',
  toggleActive:
    'rounded-md px-2 py-1 text-xs font-semibold transition-colors select-none bg-cyan-500 text-[#0f0f0f]',
  toggleInactive:
    'rounded-md px-2 py-1 text-xs font-semibold transition-colors select-none bg-[#333333] text-neutral-400 hover:bg-[#404040] hover:text-white',
  presetActive:
    'rounded-lg py-1.5 px-1 text-center transition-colors border border-cyan-400 bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/30',
  presetInactive:
    'rounded-lg py-1.5 px-1 text-center transition-colors border border-[#3a3a3a] bg-[#252525] text-neutral-400 hover:border-[#505050] hover:bg-[#2e2e2e]',
  pillActive:
    'rounded-full px-3 py-1 text-xs font-medium bg-[#404040] text-white',
  pillInactive:
    'rounded-full px-3 py-1 text-xs font-medium border border-[#404040] text-neutral-500 hover:text-neutral-300',
  actionBtn:
    'w-full rounded-lg py-2.5 px-3 text-sm font-semibold text-white bg-[#333333] hover:bg-[#404040] transition-colors border border-[#3a3a3a]',
  actionBtnSecondary:
    'w-full rounded-lg py-2.5 px-3 text-sm text-neutral-200 bg-[#252525] hover:bg-[#2e2e2e] transition-colors border border-[#333333]',
  collapseBtn:
    'rounded-r-lg bg-[#333333] hover:bg-[#404040] text-white px-1.5 py-2 text-sm transition-colors',
  floatCollapse:
    'absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-30 rounded-r-lg bg-[#333333] hover:bg-[#404040] text-white px-1.5 py-2 text-xs shadow-lg transition-colors border border-[#404040]',
  navBtn:
    'rounded-md px-2 py-1 text-neutral-400 hover:text-white hover:bg-[#252525] disabled:opacity-30 transition-colors text-sm',
  value: 'text-[10px] text-neutral-500 w-9 text-right tabular-nums',
  link: 'text-[10px] text-neutral-500 hover:text-cyan-400 transition-colors',
} as const;
