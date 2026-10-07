import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against an app that is already up (frontend + backend):
 *   npm run dev            (and the Spring backend)
 *   npm run test:e2e
 *
 * E2E_BASE_URL   target, default http://localhost:3000
 * E2E_EMAIL / E2E_PASSWORD   a dedicated test account; signed-in specs are skipped without them.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
