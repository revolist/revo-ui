import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../../tests/shared-ui',
  // Cross-package fixtures have their own source server and explicit configuration.
  testIgnore: ['product-feedback.spec.ts', 'framework-adapters.spec.ts', 'pdf-frameworks.spec.ts', 'pdf-viewer.spec.ts', 'gallery-capture.spec.ts', 'tooltip.spec.ts', 'fields-styles.spec.ts'],
  outputDir: './test-results',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4179',
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'pnpm build && pnpm preview --host 127.0.0.1 --port 4179 --strictPort',
    url: 'http://127.0.0.1:4179',
    reuseExistingServer: !process.env.CI,
  },
});
