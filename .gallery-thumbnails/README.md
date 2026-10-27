# Gallery catalogue captures

Run `node .gallery-thumbnails/generate.cjs` from frontend with Playwright Chromium installed. Uses the nine actual gallery layouts, six abstract SVG example images, reduced motion and a light palette. Captures WebP at 1000px wide with natural aspect ratios. Includes scoped CSS-module styles for Contact sheet. Checks image loading, absence of iframes, and selection. Regenerate after design changes; account media is never changed.
