export type PortfolioSmoothScrollSettings={smoothScrollEnabled:boolean;smoothScrollSoftness:number;smoothScrollWheelSpeed:number};
export const DEFAULT_SMOOTH_SCROLL:PortfolioSmoothScrollSettings={smoothScrollEnabled:false,smoothScrollSoftness:50,smoothScrollWheelSpeed:100};
export function normalizeScrollValue(value:unknown,fallback:number,min:number,max:number){return typeof value==='number'&&Number.isFinite(value)?Math.min(max,Math.max(min,Math.round(value))):fallback;}
