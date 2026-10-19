'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import { MediaImage } from '@/components/ui/MediaImage';
import { galleryAspectStyle, galleryItemDisplayTitle, type PortfolioGalleryPresentationSettings } from '@/components/portfolio/portfolio-gallery-settings';
import type { ProfileGalleryItem } from '@/types/profile';
import { useT } from '@/lib/i18n/I18nProvider';

export function GalleryVisualIndex({ items, presentation, showTitle, onOpen }: {
  items: ProfileGalleryItem[];
  presentation: PortfolioGalleryPresentationSettings;
  showTitle: boolean;
  onOpen?: (item: ProfileGalleryItem) => void;
}) {
  const t = useT();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const hasItems = items.length > 0;
  useLayoutEffect(() => {
    const image = imageRef.current;
    const root = rootRef.current;
    if (!image || !root) return;
    const update = () => root.style.setProperty('--pf-index-image-height', `${image.getBoundingClientRect().height}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(image);
    return () => observer.disconnect();
  }, [hasItems]);
  const selectedIndex = Math.max(0, items.findIndex((item) => item.id === selectedId));
  const selected = items[selectedIndex];
  if (!selected) return null;
  const title = galleryItemDisplayTitle(selected.title) || t('Gallery media');
  const select = (index: number) => {
    const next = items[index];
    if (!next) return;
    setSelectedId(next.id);
    const list = listRef.current;
    const row = list?.children[index] as HTMLElement | undefined;
    if (!list || !row) return;
    const outer = list.getBoundingClientRect();
    const inner = row.getBoundingClientRect();
    // Scroll only the index; never move the visitor's page to follow a thumbnail.
    if (list.scrollWidth > list.clientWidth + 1) {
      if (inner.left < outer.left) list.scrollLeft -= outer.left - inner.left;
      else if (inner.right > outer.right) list.scrollLeft += inner.right - outer.right;
    } else {
      if (inner.top < outer.top) list.scrollTop -= outer.top - inner.top;
      else if (inner.bottom > outer.bottom) list.scrollTop += inner.bottom - outer.bottom;
    }
  };
  const preview = <PortfolioDeferredMedia key={selected.id} src={selected.mediaUrl} alt={title}
    kind={selected.mediaType === 'VIDEO' ? 'video' : 'image'}
    className="h-full w-full" objectFit={presentation.objectFit} objectPosition={presentation.objectPosition}
    fillParent eager highPriority controls={selected.mediaType === 'VIDEO'} autoPlayVideo={false}
    sizes="(max-width: 900px) 100vw, 65vw" />;

  return (
    <div ref={rootRef} className="pf-gallery-index" data-smart-fit={presentation.visualIndexSmartFit !== false ? 'true' : 'false'} data-dense={items.length > 7 ? 'true' : undefined} style={{
      '--pf-index-item-count': items.length,
      '--pf-index-ink': presentation.itemTitleColor,
      '--pf-index-rule': presentation.galleryPalette?.bordure || presentation.itemTitleColor,
      '--pf-index-radius': `${presentation.radius}px`,
      '--pf-index-gap': `${Math.max(24, presentation.gap)}px`,
    } as CSSProperties}>
      <div className="pf-gallery-index-layout" data-single={items.length === 1 ? 'true' : undefined}>
        <div className="pf-gallery-index-main">
          <div ref={imageRef} className="pf-gallery-index-image" style={presentation.imageAspect === 'auto' ? { aspectRatio: '16 / 10' } : galleryAspectStyle(presentation.imageAspect)}>
            {onOpen && selected.mediaType !== 'VIDEO' ? (
              <button type="button" className="pf-gallery-index-open" onClick={() => onOpen(selected)} aria-label={t('Open {title}', { title })}>{preview}</button>
            ) : preview}
          </div>
          <div className="pf-gallery-index-caption">
            <div className="pf-gallery-index-caption-copy" aria-live="polite" aria-atomic="true">
              {showTitle ? <h3>{title}</h3> : null}
              <p>{t('Image {number} of {total}', { number: selectedIndex + 1, total: items.length })}</p>
            </div>
            {items.length > 1 ? <div className="pf-gallery-index-arrows">
              <button type="button" disabled={selectedIndex === 0} onClick={() => select(selectedIndex - 1)} aria-label={t('Previous image')}>←</button>
              <button type="button" disabled={selectedIndex === items.length - 1} onClick={() => select(selectedIndex + 1)} aria-label={t('Next image')}>→</button>
            </div> : null}
          </div>
        </div>
        {items.length > 1 ? <nav className="pf-gallery-index-nav" aria-label={t('Gallery images')}>
          <ul ref={listRef} className="pf-gallery-index-list">
            {items.map((item, index) => {
              const label = galleryItemDisplayTitle(item.title) || t('Gallery media');
              return <li key={item.id}>
                <button type="button" className="pf-gallery-index-choice" aria-current={item.id === selected.id ? 'true' : undefined}
                  aria-label={t('Show {title}', { title: label })} onClick={() => select(index)}
                  onKeyDown={(event) => {
                    const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
                    if (!direction && event.key !== 'Home' && event.key !== 'End') return;
                    event.preventDefault();
                    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : Math.max(0, Math.min(items.length - 1, index + direction));
                    select(next);
                    (listRef.current?.children[next] as HTMLElement)?.querySelector('button')?.focus({ preventScroll: true });
                  }}>
                  <span className="pf-gallery-index-thumb">
                    {item.mediaType === 'VIDEO' ? <video src={item.mediaUrl} preload="metadata" muted playsInline aria-hidden="true" /> : <MediaImage src={item.mediaUrl} width={160} alt="" className="h-full w-full object-cover" />}
                    {item.mediaType === 'VIDEO' ? <span className="pf-gallery-index-play" aria-hidden="true">▶</span> : null}
                  </span>
                  <span className="pf-gallery-index-choice-copy">
                    {showTitle ? <span className="pf-gallery-index-choice-title">{label}</span> : null}
                    <span className="pf-gallery-index-kind">{item.mediaType === 'VIDEO' ? t('Video') : t('Photo')}</span>
                  </span>
                </button>
              </li>;
            })}
          </ul>
          {onOpen ? <button type="button" className="pf-gallery-index-view-all" onClick={() => onOpen(selected)}>{t('Open gallery')} <span aria-hidden="true">↗</span></button> : null}
        </nav> : null}
      </div>
    </div>
  );
}
