import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // eslint-plugin-react (bundled by eslint-config-next) still relies on the
    // removed `context.getFilename()` API for React version auto-detection
    // under ESLint 10. Pinning the version explicitly skips that code path.
    // https://github.com/vercel/next.js/issues/89764
    settings: {
      react: { version: '19.2.8' },
    },
  },
];

export default eslintConfig;
