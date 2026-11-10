import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'cdn.spec.ts',
  outputDir: './test-results/cdn',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5199',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node tests/browser/cdn-server.mjs',
    url: 'http://127.0.0.1:5199',
    reuseExistingServer: false,
  },
});
