'use client';

/** Kept in sync with `--pf-color-mode-duration` in globals.css (+ small buffer). */
export const PORTFOLIO_COLOR_MODE_TRANSITION_MS = 650;

function portfolioThemeRootEl(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.querySelector('.pf-theme-root');
}

/**
 * Apply a color-mode repaint with a soft symmetric opacity pass
 * (gentle dip, then fade-in to final — no brutal pop at the end).
 */
export function runPortfolioColorModeTransition(update: () => void): void {
  const root = portfolioThemeRootEl();
  if (root) {
    root.classList.remove('pf-color-mode-crossfade');
    void root.offsetHeight;
    root.classList.add('pf-color-mode-crossfade');
    window.setTimeout(() => {
      root.classList.remove('pf-color-mode-crossfade');
    }, PORTFOLIO_COLOR_MODE_TRANSITION_MS);
  }
  update();
}
