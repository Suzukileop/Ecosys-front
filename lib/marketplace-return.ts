const RETURN_STORAGE_KEY = 'marketplace:products-return';
const RESTORE_FLAG_KEY = 'marketplace:products-restore';

export type MarketplaceReturnPoint = {
  key: string;
  y: number;
  url: string;
};

export function saveMarketplaceReturnPoint(point: MarketplaceReturnPoint) {
  try {
    window.sessionStorage.setItem(RETURN_STORAGE_KEY, JSON.stringify(point));
  } catch {
    // storage unavailable
  }
}

export function readMarketplaceReturnPoint(): MarketplaceReturnPoint | null {
  try {
    const raw = window.sessionStorage.getItem(RETURN_STORAGE_KEY);
    if (!raw) return null;
    const point = JSON.parse(raw) as Partial<MarketplaceReturnPoint>;
    if (typeof point.key !== 'string' || typeof point.y !== 'number' || typeof point.url !== 'string') return null;
    return point as MarketplaceReturnPoint;
  } catch {
    return null;
  }
}

export function requestMarketplaceRestore() {
  try {
    window.sessionStorage.setItem(RESTORE_FLAG_KEY, '1');
  } catch {
    // storage unavailable
  }
}

export function hasMarketplaceRestoreRequest(): boolean {
  try {
    return window.sessionStorage.getItem(RESTORE_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearMarketplaceRestoreRequest() {
  try {
    window.sessionStorage.removeItem(RESTORE_FLAG_KEY);
  } catch {
    // storage unavailable
  }
}
