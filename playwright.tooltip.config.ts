import { resolve } from 'node:path';
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'tooltip.spec.ts',
  outputDir: './test-results/tooltip',
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5197',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: {
    cwd: import.meta.dirname,
    command: 'pnpm exec vite --config tooltip.vite.config.ts',
    url: 'http://127.0.0.1:5197/tests/browser/fixtures/tooltip/index.html',
    reuseExistingServer: false,
  },
});
