import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  outputDir: './test-results/framework-adapters',
  testMatch: ['framework-adapters.spec.ts', 'pdf-frameworks.spec.ts'],
  use: {
    baseURL: 'http://127.0.0.1:4183',
    browserName: 'chromium',
    headless: true,
  },
  webServer: {
    command: 'pnpm exec vite --config framework-adapters.vite.config.ts',
    cwd: import.meta.dirname,
    url: 'http://127.0.0.1:4183',
    reuseExistingServer: !process.env.CI,
  },
});
