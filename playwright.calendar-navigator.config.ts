import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'calendar-navigator.spec.ts',
  use: { browserName: 'chromium', headless: true },
});
