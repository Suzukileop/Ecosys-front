/** Stable viewport geometry: animate the child, measure its untransformed wrapper. */
export function experienceScrollProgress(top: number, height: number, viewportHeight: number, compact = false) {
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const ease = (value: number) => value * value * (3 - 2 * value);
  const centerOffset = top + height / 2 - viewportHeight / 2;
  const travel = Math.max(1, (height + viewportHeight) / 2);
  const phase = clamp(Math.abs(centerOffset) / travel);
  // Same viewport-centred curve for adjacent blocks: outgoing and incoming stay coordinated.
  const fade = ease(clamp((phase - 0.2) / 0.8));
  const distance = compact ? 36 : 140;
  return { opacity: 1 - fade, x: Math.sign(centerOffset) * fade * distance };
}
