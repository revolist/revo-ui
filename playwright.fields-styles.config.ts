import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  testMatch: ['fields-styles.spec.ts', 'overlay-scroll.spec.ts'],
  outputDir: './test-results/fields-styles',
  workers: 1,
  use: { browserName: 'chromium' },
});
