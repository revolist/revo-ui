import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'picker-context.spec.ts',
  use: {
    baseURL: 'http://127.0.0.1:4191',
    browserName: 'chromium',
    headless: true,
  },
  webServer: {
    command: 'pnpm exec vite --host 127.0.0.1 --port 4191 --strictPort',
    url: 'http://127.0.0.1:4191',
    reuseExistingServer: false,
  },
});
