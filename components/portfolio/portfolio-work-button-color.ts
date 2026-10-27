/** Tint the CTA ink only; do not fade its focus ring or interaction area. */
export function workButtonColor(ink:string,opacity=100):string {
  const percent=Number.isFinite(opacity)?Math.max(30,Math.min(100,opacity)):100;
  return percent===100?ink:`color-mix(in srgb, ${ink} ${percent}%, transparent)`;
}
