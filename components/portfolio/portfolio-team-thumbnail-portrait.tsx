import type { resolveThumbnailTheme } from './portfolio-thumbnail-theme';

/** Neutral portrait silhouette tinted exclusively with the portfolio's actual palette. */
export function TeamThumbnailPortrait({ theme, index, wide = false }: { theme: ReturnType<typeof resolveThumbnailTheme>; index: number; wide?: boolean }) {
  const mix = (amount: number) => `color-mix(in srgb,${theme.ink} ${amount}%,${theme.background})`;
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: mix([8, 15, 22][index % 3]), boxShadow: `inset 0 0 0 1px ${theme.border}` }}>
      <div style={{ position: 'absolute', inset: wide ? '15%' : '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: wide ? 24 : 20 }}>
        <span style={{ width: '45%', aspectRatio: '1', borderRadius: '50%', background: mix(42) }} />
        <span style={{ width: '85%', height: wide ? '42%' : '40%', borderRadius: '45% 45% 8px 8px', background: mix(32) }} />
      </div>
    </div>
  );
}
