'use client';
import type {ReactNode} from 'react';
import {useT} from '@/lib/i18n/I18nProvider';

/** Selection stays in the catalogue; customization is a separate keyboard-accessible action. */
export function DesignCatalogueCard({label,selected,onSelect,onCustomize,children,previewBackground}:{label:string;selected:boolean;onSelect:()=>void;onCustomize?:()=>void;children:ReactNode;previewBackground?:string}){
 const t=useT();
 return <div className="group relative">
  <button type="button" aria-label={label} aria-pressed={selected} onClick={onSelect} className="w-full overflow-hidden rounded-xl border p-1.5 text-left transition-colors hover:bg-neutral-500/5 focus-visible:outline-2 focus-visible:outline-offset-2" style={{borderColor:selected?'var(--pf-palette-principal,#f97316)':'color-mix(in srgb,currentColor 18%,transparent)'}}>
   {/* Keep the iframe canvas square: Chromium's rounded clipping paints a light
       fringe across mismatched global/section themes. Only the outer card is rounded. */}
   <span className="relative block overflow-hidden" style={{backgroundColor:previewBackground}}>
    {children}
   </span>
   <span className="block py-3 pl-2 pr-36 text-sm font-medium">{label}</span>
  </button>
  {onCustomize ? <button type="button" aria-label={`${t('Settings')} — ${label}`} title={t('Settings')} onClick={onCustomize} className="absolute bottom-1.5 right-3 flex min-h-11 items-center gap-2 rounded-sm px-1 text-xs font-medium text-[var(--np-muted,#a1a1aa)] opacity-0 transition-opacity hover:text-[var(--np-text,#fafafa)] group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 [@media(hover:none)]:opacity-100">
   <span>{t('Customize')}</span><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>
  </button> : null}
 </div>;
}
