'use client';
import type {ReactNode} from 'react';

export function GalleryFramedGridSchematic(){
  return <svg viewBox="0 0 120 92" className="block h-auto w-full" aria-hidden="true">
    <g fill="currentColor" fillOpacity=".09" stroke="currentColor" strokeOpacity=".2" strokeWidth=".8">
      <rect x="6" y="6" width="32" height="45" rx="2"/><rect x="6" y="56" width="32" height="30" rx="2"/>
      <rect x="44" y="6" width="32" height="30" rx="2"/><rect x="44" y="41" width="32" height="45" rx="2"/>
      <rect x="82" y="6" width="32" height="38" rx="2"/><rect x="82" y="49" width="32" height="37" rx="2"/>
    </g>
    <path d="M10 10h11" stroke="var(--pf-palette-principal,#f97316)" strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}

/** First catalogue prototype: explain the layout rather than shrink sample photographs. */
export function GalleryFramedGridOption({label,description,actionLabel,currentLabel,selected,onTry,schematic,optionId='framed-grid'}:{label:string;description:string;actionLabel:string;currentLabel:string;selected:boolean;onTry:()=>void;schematic?:ReactNode;optionId?:string}){
  return <article className="w-full rounded-xl border p-4" data-gallery-layout-prototype={optionId} style={{borderColor:selected?'var(--pf-palette-principal,#f97316)':'color-mix(in srgb,currentColor 18%,transparent)'}}>
    <div className="grid grid-cols-[100px_minmax(0,1fr)] items-center gap-4">
      {schematic??<GalleryFramedGridSchematic/>}
      <div className="min-w-0"><h3 className="m-0 text-sm font-semibold leading-snug">{label}</h3><p className="mb-0 mt-2 text-xs leading-relaxed" style={{color:'color-mix(in srgb,currentColor 75%,transparent)'}}>{description}</p></div>
    </div>
    <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3" style={{borderColor:'color-mix(in srgb,currentColor 12%,transparent)'}}>
      <span className="text-[11px]" style={{opacity:.7}}>{selected?currentLabel:''}</span>
      <button type="button" aria-pressed={selected} aria-label={`${actionLabel} — ${label}`} onClick={onTry} className="inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors hover:bg-neutral-500/10 focus-visible:outline-2 focus-visible:outline-offset-2" style={{borderColor:'color-mix(in srgb,currentColor 25%,transparent)'}}>{actionLabel}<span aria-hidden="true">↗</span></button>
    </div>
  </article>;
}
