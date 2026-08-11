export type LandingEntrancePhase = 'loading' | 'flying' | 'settled' | 'revealed';

export type EntranceRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

export type EntranceAnchorRects = {
  no: EntranceRect;
  probleme: EntranceRect;
};

export function toEntranceRect(rect: DOMRect): EntranceRect {
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
  };
}

export function boxMotionStyle(rect: EntranceRect) {
  return {
    left: rect.x,
    top: rect.y,
    width: rect.width,
    height: rect.height,
  };
}
