'use client';

import type { CSSProperties } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { resolveCreatorToolLogoHex } from '@/components/creator/studio/creator-profile-tools-catalog';

/**
 * Overlapping circular tool logos (avatar-stack style).
 * Border should match the section surface so overlaps read as clean cut-outs.
 */
export function PortfolioToolsStackedIcons({
  tools,
  toolIcons,
  sizePx = 36,
  overlapPx,
  borderColor = '#0a0a0a',
  borderWidth = 2,
  borderRadius = '9999px',
  shellBackground,
  className = '',
  maxTools,
}: {
  tools: string[];
  /** Optional custom logos keyed by tool display name. */
  toolIcons?: Record<string, string>;
  sizePx?: number;
  /** Horizontal overlap in px; defaults to ~35% of size. */
  overlapPx?: number;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: CSSProperties['borderRadius'];
  shellBackground?: string;
  className?: string;
  maxTools?: number;
}) {
  const items = Array.from(new Set(tools.map((item) => item.trim()).filter(Boolean)));
  const list = typeof maxTools === 'number' ? items.slice(0, Math.max(0, maxTools)) : items;
  if (list.length === 0) return null;

  const size = Math.max(12, Math.round(sizePx));
  const overlap =
    typeof overlapPx === 'number' && Number.isFinite(overlapPx)
      ? Math.max(0, Math.round(overlapPx))
      : Math.max(6, Math.round(size * 0.35));
  const bw = Math.max(0, Math.round(borderWidth));
  const logoSize = Math.max(10, size - bw * 2 - 4);

  return (
    <div className={`flex items-center ${className}`.trim()} role="list">
      {list.map((tool, index) => {
        const brandHex = resolveCreatorToolLogoHex(tool);
        const shellStyle: CSSProperties = {
          width: size,
          height: size,
          marginLeft: index === 0 ? 0 : -overlap,
          zIndex: index + 1,
          borderWidth: bw,
          borderStyle: bw > 0 ? 'solid' : undefined,
          borderColor: bw > 0 ? borderColor : undefined,
          backgroundColor: shellBackground,
          borderRadius,
          boxSizing: 'border-box',
        };
        return (
          <div
            key={`${tool}-${index}`}
            role="listitem"
            title={tool}
            aria-label={tool}
            className="relative flex shrink-0 items-center justify-center overflow-hidden"
            style={shellStyle}
          >
            <CreatorToolLogo
              label={tool}
              iconUrl={toolIcons?.[tool] ?? null}
              size={logoSize}
              className="rounded-full !bg-transparent"
              brandColor={brandHex ?? undefined}
              bgColor={shellBackground}
            />
          </div>
        );
      })}
    </div>
  );
}
