import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  testMatch: [
    'fields-styles.spec.ts',
    'overlay-scroll.spec.ts',
    'dropdown-long-text.spec.ts',
    'dropdown-height.spec.ts',
  ],
  outputDir: './test-results/fields-styles',
  workers: 1,
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    {
      name: 'webkit',
      testMatch: ['dropdown-long-text.spec.ts', 'dropdown-height.spec.ts'],
      use: { browserName: 'webkit' },
    },
  ],
});
