import { GeistSans } from 'geist/font/sans';

/**
 * Local Geist from the `geist` package (next/font/local under the hood).
 * Avoids next/font/google, which fails the production build when Google Fonts
 * is unreachable.
 *
 * CSS variable: `--font-geist-sans` (aliased to `--font-geist` in layout).
 */
export const geist = GeistSans;
