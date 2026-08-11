/**
 * Map browser client coordinates into SVG user/viewBox units.
 *
 * Prefer this over `getScreenCTM()` + `createSVGPoint()`. Chromium returns a
 * wrong CTM when an ancestor uses `filter` / `backdrop-filter` (e.g. the
 * settings modal below 98% opacity), which makes motif/portrait drags jump
 * by huge percentages for tiny pointer moves.
 *
 * For editors that set `preserveAspectRatio="none"` (recommended), mapping is a
 * simple linear scale of the element box — matches what you see on screen.
 * Otherwise defaults to `xMidYMid meet` letterboxing.
 */
export function clientPointToSvgUser(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number
): { x: number; y: number } | null {
  const rect = svg.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const vb = svg.viewBox.baseVal;
  const vbX = Number.isFinite(vb.x) ? vb.x : 0;
  const vbY = Number.isFinite(vb.y) ? vb.y : 0;
  const vbW = vb.width > 0 ? vb.width : 100;
  const vbH = vb.height > 0 ? vb.height : 100;

  const par = svg.preserveAspectRatio.baseVal;
  // SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_NONE === 1
  // Also treat missing/0 as stretch when the SVG attribute is explicitly "none"
  // (some engines report UNKNOWN until laid out).
  const attr = svg.getAttribute('preserveAspectRatio');
  const isNone =
    (par && par.align === 1) ||
    (typeof attr === 'string' && attr.trim().toLowerCase() === 'none');

  if (isNone) {
    return {
      x: vbX + ((clientX - rect.left) / rect.width) * vbW,
      y: vbY + ((clientY - rect.top) / rect.height) * vbH,
    };
  }

  const scaleX = rect.width / vbW;
  const scaleY = rect.height / vbH;
  // SVG_MEETORSLICE_SLICE === 2
  const scale = par && par.meetOrSlice === 2 ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
  const contentW = vbW * scale;
  const contentH = vbH * scale;
  const offsetX = (rect.width - contentW) / 2;
  const offsetY = (rect.height - contentH) / 2;

  return {
    x: vbX + (clientX - rect.left - offsetX) / scale,
    y: vbY + (clientY - rect.top - offsetY) / scale,
  };
}
