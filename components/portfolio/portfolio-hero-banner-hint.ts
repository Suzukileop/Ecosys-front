import {
  DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN,
  normalizePortfolioHeroBannerDesign,
  type PortfolioHeroBannerDesign,
} from '@/components/portfolio/portfolio-hero-banner-settings';

const HINT_PREFIX = 'pf-hero-banner:';
const COOKIE_PREFIX = 'pf_hb_';

function hintKey(creatorKey: string) {
  return `${HINT_PREFIX}${creatorKey}`;
}

function cookieName(creatorKey: string) {
  const safe = creatorKey.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
  return `${COOKIE_PREFIX}${safe}`;
}

function writeCookie(creatorKey: string, design: PortfolioHeroBannerDesign) {
  if (typeof document === 'undefined') return;
  try {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${cookieName(creatorKey)}=${design}; path=/; max-age=${maxAge}; samesite=lax`;
  } catch {
    // ignore
  }
}

function readCookie(creatorKey: string): PortfolioHeroBannerDesign | null {
  if (typeof document === 'undefined') return null;
  try {
    const name = cookieName(creatorKey);
    const parts = document.cookie.split(';');
    for (const part of parts) {
      const [rawKey, ...rest] = part.trim().split('=');
      if (rawKey !== name) continue;
      const value = rest.join('=');
      // Migrate legacy classic cookie away permanently.
      if (value === 'classic') {
        writeCookie(creatorKey, DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN);
        return DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN;
      }
      return normalizePortfolioHeroBannerDesign(value);
    }
  } catch {
    // ignore
  }
  return null;
}

/** Persist banner design under UUID and/or username for instant loading skeletons. */
export function writeHeroBannerDesignHint(
  creatorKeys: Array<string | null | undefined>,
  design: PortfolioHeroBannerDesign
) {
  if (typeof window === 'undefined') return;
  const normalized = normalizePortfolioHeroBannerDesign(design);
  for (const key of creatorKeys) {
    const trimmed = typeof key === 'string' ? key.trim() : '';
    if (!trimmed) continue;
    try {
      sessionStorage.setItem(hintKey(trimmed), normalized);
      localStorage.setItem(hintKey(trimmed), normalized);
      writeCookie(trimmed, normalized);
    } catch {
      // private mode / quota
    }
  }
}

export function readHeroBannerDesignHint(
  creatorKey: string
): PortfolioHeroBannerDesign | null {
  if (typeof window === 'undefined' || !creatorKey.trim()) return null;
  try {
    const fromSession = sessionStorage.getItem(hintKey(creatorKey));
    if (fromSession === 'classic') {
      writeHeroBannerDesignHint([creatorKey], DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN);
      return DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN;
    }
    if (fromSession) return normalizePortfolioHeroBannerDesign(fromSession);
    const fromLocal = localStorage.getItem(hintKey(creatorKey));
    if (fromLocal === 'classic') {
      writeHeroBannerDesignHint([creatorKey], DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN);
      return DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN;
    }
    if (fromLocal) return normalizePortfolioHeroBannerDesign(fromLocal);
    return readCookie(creatorKey);
  } catch {
    return readCookie(creatorKey);
  }
}

export function resolveHeroBannerDesignFromSettings(
  portfolioSettings: unknown
): PortfolioHeroBannerDesign | null {
  if (portfolioSettings == null || typeof portfolioSettings !== 'object' || Array.isArray(portfolioSettings)) {
    return null;
  }
  const hero = (portfolioSettings as { hero?: unknown }).hero;
  if (hero == null || typeof hero !== 'object' || Array.isArray(hero)) {
    return null;
  }
  const design = (hero as { heroBannerDesign?: unknown }).heroBannerDesign;
  if (design == null) return null;
  return normalizePortfolioHeroBannerDesign(design);
}
