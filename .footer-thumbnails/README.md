# Footer catalogue screenshots

Generated from the real `EditorialPortfolioFooter` components with fixed example data, reduced motion, and light/dark palettes. No AI imagery or account data is used.

From the frontend directory in PowerShell:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='C:\Users\leopa\AppData\Local\ms-playwright'
node .footer-thumbnails/generate.cjs
```

Regenerate after changing footer designs. The script captures all 14 variants in both modes with portrait, biography, social links, address and hours wherever supported. Images are 1000px-wide WebP with the actual footer aspect ratio (no fixed-ratio letterboxing) under `public/portfolio-previews/footers`. Checks cover static loading, zero iframes, selection behavior, and Landing's portrait/bio/social content. The main live preview remains the source of truth for personalized content and animations.
