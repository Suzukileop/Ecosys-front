'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

/** Scale content typography, including design-specific sizes, without scaling media. */
export function WorkTextScale({size = 'medium', children}: {
  size?: 'small' | 'medium' | 'large' | 'xlarge'; children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    const scale = {small:0.875,medium:1,large:1.125,xlarge:1.25}[size];
    if (!root || scale === 1) return;
    const originals = new Map<HTMLElement, string>();
    let frame = 0;
    const restore = () => {
      originals.forEach((value, node) => {node.style.fontSize = value;});
      originals.clear();
    };
    const apply = () => {
      // Only nodes whose font-size itself animates are frozen while measuring. Freezing every
      // descendant cancelled whatever was mid-transition in the section — a carousel's slide, a
      // hover — so each re-run (any text change) made those moves jump instead of easing.
      const transitions = new Map<HTMLElement,string>();
      root.querySelectorAll<HTMLElement>('*').forEach(node => {
        if (node.closest('svg,style,script')) return;
        const property = getComputedStyle(node).transitionProperty;
        if (/\b(all|font-size)\b/.test(property)) {
          transitions.set(node,node.style.transition);
          node.style.transition='none';
        }
      });
      restore();
      // Measure every text node before writing: nested text never compounds the scale.
      const measured = Array.from(root.querySelectorAll<HTMLElement>('*'))
        .filter(node => !node.closest('svg,style,script') && Array.from(node.childNodes)
          .some(child => child.nodeType === Node.TEXT_NODE && child.textContent?.trim()))
        .map(node => ({node, size:parseFloat(getComputedStyle(node).fontSize)}));
      measured.forEach(({node,size:fontSize}) => {
        originals.set(node,node.style.fontSize);
        node.style.fontSize = `${fontSize * scale}px`;
      });
      // Read once before restoring transitions, so opening an accordion measures
      // its final typography rather than freezing an intermediate animated size.
      if (transitions.size > 0) {
        void root.offsetHeight;
        transitions.forEach((value,node)=>{node.style.transition=value;});
      }
    };
    const schedule = () => {cancelAnimationFrame(frame);frame=requestAnimationFrame(apply);};
    apply();
    let width = root.getBoundingClientRect().width;
    const resize = new ResizeObserver(() => {
      const next = root.getBoundingClientRect().width;
      if (next !== width) {width=next;schedule();}
    });
    resize.observe(root);
    window.addEventListener('resize',schedule);
    const mutations = new MutationObserver(schedule);
    mutations.observe(root,{childList:true,subtree:true,characterData:true});
    return () => {cancelAnimationFrame(frame);resize.disconnect();mutations.disconnect();window.removeEventListener('resize',schedule);restore();};
    // Not keyed on `children`: that is a new element on every parent render, so the whole pass
    // re-ran (restore + re-scale) on each render. Content changes reach it through the observer.
  },[size]);
  return <div ref={ref} className="min-w-0 w-full">{children}</div>;
}

export { WorkTextScale as SectionContentTextScale };
