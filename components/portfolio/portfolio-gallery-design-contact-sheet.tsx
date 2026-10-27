'use client';

import type { CSSProperties, ReactNode } from 'react';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import { galleryAspectStyle, galleryEffectiveVerticalGap, galleryItemDisplayTitle, type PortfolioGalleryPresentationSettings } from './portfolio-gallery-settings';
import type { ProfileGalleryItem } from '@/types/profile';
import { useT } from '@/lib/i18n/I18nProvider';
import styles from './portfolio-gallery-design-contact-sheet.module.css';

export function GalleryContactSheet({ items, presentation, showTitle, onOpen, renderMedia }: {
  items: ProfileGalleryItem[];
  presentation: PortfolioGalleryPresentationSettings;
  showTitle: boolean;
  onOpen?: (item: ProfileGalleryItem) => void;
  renderMedia?: (item: ProfileGalleryItem, index: number) => ReactNode;
}) {
  const t = useT();
  if (!items.length) return null;
  return <div className={styles.root} style={{
    '--sheet-ink': presentation.itemTitleColor,
    '--sheet-rule': presentation.galleryPalette?.bordure || presentation.itemTitleColor,
    '--sheet-gap': `${presentation.gap}px`,
    '--sheet-row-gap': `${Math.max(24, galleryEffectiveVerticalGap(presentation))}px`,
    '--sheet-radius': `${presentation.radius}px`,
  } as CSSProperties}>
    <ul className={styles.grid}>
      {items.map((item, index) => {
        const title = galleryItemDisplayTitle(item.title) || t('Gallery media');
        const video = item.mediaType === 'VIDEO';
        const media = renderMedia ? renderMedia(item,index) : <PortfolioDeferredMedia src={item.mediaUrl} alt={title} kind={video ? 'video' : 'image'}
          className="h-full w-full" fillParent objectFit={presentation.objectFit} objectPosition={presentation.objectPosition}
          eager={index < 3} highPriority={index === 0} controls={video} autoPlayVideo={false}
          sizes="(max-width: 520px) 100vw, (max-width: 900px) 50vw, 33vw" />;
        return <li key={item.id} className={styles.item}>
          <figure>
            <div className={styles.image} style={presentation.imageAspect === 'auto' ? { aspectRatio: '4 / 3' } : galleryAspectStyle(presentation.imageAspect)}>
              {onOpen && !video ? <button className={styles.open} type="button" onClick={() => onOpen(item)} aria-label={t('Open {title}', { title })}>{media}</button> : media}
            </div>
            <figcaption className={styles.caption}>
              {showTitle ? <span className={styles.title}>{title}</span> : <span className={styles.title}>{video ? t('Video') : t('Photo')}</span>}
              <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            </figcaption>
          </figure>
        </li>;
      })}
    </ul>
    <div className={styles.footer}>
      <span>{t('{count} media', { count: items.length })}</span>
      {onOpen ? <button type="button" onClick={() => onOpen(items[0])}>{t('Open gallery')} <span aria-hidden="true">↗</span></button> : null}
    </div>
  </div>;
}
