/**
 * The interface's own typefaces, declared on every page from the root layout: Roboto is
 * `--font-app` (Tailwind `font-sans`) and Inter is used across the app chrome. The fourteen other
 * families portfolios can pick live in `portfolio-fonts.ts`, imported only by the route groups that
 * render portfolios, so the landing and sign-in pages no longer parse ~230 @font-face rules.
 */
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/600.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/800.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
