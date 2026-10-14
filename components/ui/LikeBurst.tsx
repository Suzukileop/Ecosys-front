import type { CSSProperties } from 'react';

const LIKE_PARTICLES = [0, 60, 120, 180, 240, 300].map((deg, i) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  const distance = i % 2 ? 15 : 18;
  return {
    dx: `${(Math.cos(rad) * distance).toFixed(1)}px`,
    dy: `${(Math.sin(rad) * distance).toFixed(1)}px`,
    /* Ink: the burst takes the heart's own colour (currentColor), softer on every other particle. */
    opacity: i % 2 ? 0.45 : 1,
  };
});

/**
 * Ring + particle burst played once when a like lands. Render it inside a `relative` box sized to
 * the heart icon and change `burstKey` to replay it.
 */
export function LikeBurst({ burstKey }: { burstKey: number }) {
  return (
    <span key={burstKey} className="pointer-events-none absolute inset-0 motion-reduce:hidden" aria-hidden>
      <span className="absolute -inset-[5px] animate-like-ring rounded-full border-solid border-current" />
      {LIKE_PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 h-[4px] w-[4px] animate-like-particle rounded-full"
          style={{ '--like-dx': p.dx, '--like-dy': p.dy, backgroundColor: 'currentColor', opacity: p.opacity } as CSSProperties}
        />
      ))}
    </span>
  );
}
