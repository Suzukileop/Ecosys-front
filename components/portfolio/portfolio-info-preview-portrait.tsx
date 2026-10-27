'use client';

import { useState } from 'react';
import { usePortfolioDesignPreviewSource } from './PortfolioDesignLivePreview';

const FALLBACK_PORTRAIT = '/portfolio-previews/info-designer-portrait.webp';

/** Use the creator's portrait first; share the generated fallback across the catalogue. */
export function InfoPreviewPortrait({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
  const source = usePortfolioDesignPreviewSource();
  const portrait = source?.profileAvatarUrl?.trim() || FALLBACK_PORTRAIT;
  const [failedPortrait, setFailedPortrait] = useState<string | null>(null);
  return <image
    href={failedPortrait === portrait ? FALLBACK_PORTRAIT : portrait}
    x={x} y={y} width={width} height={height}
    preserveAspectRatio="xMidYMid slice"
    onError={() => { if (portrait !== FALLBACK_PORTRAIT) setFailedPortrait(portrait); }}
  />;
}
