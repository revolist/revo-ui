import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'named-framework-adapters.spec.ts',
  outputDir: './test-results/named-framework-adapters',
  use: { baseURL: 'http://127.0.0.1:4188', browserName: 'chromium' },
  webServer: {
    command:
      'pnpm exec vite --config framework-adapters.vite.config.ts --port 4188',
    cwd: import.meta.dirname,
    url: 'http://127.0.0.1:4188/named.html',
    reuseExistingServer: !process.env.CI,
  },
});
