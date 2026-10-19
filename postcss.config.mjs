import path from 'node:path';

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    // Tailwind v3's cascade order for variants (see the file). Next resolves plugins by name from a
    // bundled copy of this config, so a local plugin needs an absolute path; Next runs from the app root.
    [path.join(process.cwd(), 'postcss-tailwind-variants-last.cjs')]: {},
  },
};

export default config;
