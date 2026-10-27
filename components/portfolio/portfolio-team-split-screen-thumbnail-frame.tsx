'use client';
import { TeamThumbnailPortrait } from './portfolio-team-thumbnail-portrait';
import { useThumbnailTheme, teamThumbnailPresentation } from './portfolio-thumbnail-theme';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TeamSplitScreen } from './portfolio-team-design-split-screen';
import { DEFAULT_TEAM_PRESENTATION } from './portfolio-team-settings';
import { useT } from '@/lib/i18n/I18nProvider';

const shell = '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="preview"></div></body></html>';
const names = ['Alex Morgan', 'Sam Taylor', 'Robin Lee'];

/** Real split-screen roster and portrait geometry, with no remote media or application chrome. */
export function TeamSplitScreenThumbnailFrame() {
  const t = useT();
  const root = useRef<HTMLSpanElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState(360);
  const [height, setHeight] = useState(656);

  useEffect(() => {
    if (!root.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const content = target?.firstElementChild;
    if (!content) return;
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      const next = Math.ceil(content.getBoundingClientRect().height);
      if (next > 0) setHeight(previous => Math.abs(previous - next) > 1 ? next : previous);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    measure();
    void target.ownerDocument.fonts.ready.then(measure);
    return () => { disposed = true; observer.disconnect(); };
  }, [target]);

 const theme=useThumbnailTheme('team',target);
  return <span ref={root} className="relative block w-full overflow-hidden rounded-lg" style={{ aspectRatio: `1280 / ${height}` }}>
    <iframe ref={frame} title={t('Split screen')} aria-hidden="true" tabIndex={-1} sandbox="allow-same-origin" srcDoc={shell}
      className="absolute inset-0 block border-0" style={{ width: 1280, height: Math.max(900, height), transform: `scale(${width / 1280})`, transformOrigin: 'top left', pointerEvents: 'none' }}
      onLoad={() => {
        const doc = frame.current?.contentDocument;
        if (!doc) return;
        for (const node of document.querySelectorAll('link[rel="stylesheet"],style')) doc.head.appendChild(node.cloneNode(true));
        const style = doc.createElement('style');
        style.textContent = 'html,body{margin:0;overflow:hidden;background:#fff;color:#222;font-family:Arial,sans-serif}*{animation:none!important;transition:none!important}#preview{--pf-palette-principal:#555;--pf-palette-fond:#fff;--pf-palette-texte-fort:#222;--pf-team-font-scale:1}';
        doc.head.appendChild(style);
        setTarget(doc.getElementById('preview'));
      }} />
    {target && createPortal(<div inert style={{ width: 1280, padding: 40, boxSizing: 'border-box' }}>
      <TeamSplitScreen members={names.map((name, index) => ({ id: `split-preview-${index}`, sortOrder: index, name, responsibility: t('Design'), imageUrl: '', socialLinks: [] }))}
        presentation={teamThumbnailPresentation({ ...DEFAULT_TEAM_PRESENTATION, layout: 'split-screen', activeColorMode: 'light', showImage: true, showName: true, showResponsibility: true, showSocials: false, sectionBackgroundColor: '#ffffff', nameColor: '#222222', responsibilityColor: '#666666', teamPalette: { ...DEFAULT_TEAM_PRESENTATION.teamPalette, fond: '#ffffff' } }, theme)}
        renderPortrait={(_, index) => <TeamThumbnailPortrait theme={theme} index={index} wide />}/>
    </div>, target)}
  </span>;
}
