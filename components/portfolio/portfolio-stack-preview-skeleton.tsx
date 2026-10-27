'use client';

import type { CSSProperties, ReactNode } from 'react';
import { resolveThumbnailTheme, useThumbnailTheme } from './portfolio-thumbnail-theme';
import type { PortfolioSettings } from './portfolio-settings-types';
import styles from './portfolio-stack-preview-skeleton.module.css';

/** Hero-like neutral silhouettes, with opaque theme-aware surfaces instead of a gray veil. */
export function StackPreviewSkeleton({ children, section = 'stack', settings }: { children: ReactNode; settings?: PortfolioSettings | null; section?: 'stack' | 'info' | 'work' | 'tools' | 'services' | 'experience' | 'team' | 'gallery' | 'faq' | 'footer' }) {
  const sourceTheme = useThumbnailTheme(section);
  const theme = settings ? resolveThumbnailTheme(settings.global, settings[section]) : sourceTheme;
  const mix = (n: number) => `color-mix(in srgb, ${theme.ink} ${n}%, ${theme.background})`;
  return <span aria-hidden="true" data-stack-preview-skeleton={theme.mode} className={styles.canvas} style={{
    '--stack-skeleton-background': theme.background,
    '--stack-skeleton-strong': mix(section==='stack' ? (theme.mode==='dark'?30:22) : (theme.mode === 'dark' ? 22 : 20)),
    '--stack-skeleton-soft': mix(section==='stack' ? (theme.mode==='dark'?18:13) : (theme.mode === 'dark' ? 13 : 11)),
    '--stack-skeleton-border': mix(10),
  } as CSSProperties}>{children}</span>;
}
