import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  // Fixture servers, PDF behavior and exhaustive captures have dedicated configurations.
  testIgnore: [
    'framework-adapters.spec.ts',
    'pdf-frameworks.spec.ts',
    'pdf-viewer.spec.ts',
    'gallery-capture.spec.ts',
    'tooltip.spec.ts',
    'cdn.spec.ts',
    'fields-styles.spec.ts',
  ],
  outputDir: './test-results/gallery',
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
    timeout: 300000,
    command:
      process.env.UI_SKIP_BUILD === '1'
        ? 'pnpm preview --host 127.0.0.1 --port 4179 --strictPort'
        : 'pnpm build:demo && pnpm preview --host 127.0.0.1 --port 4179 --strictPort',
    url: 'http://127.0.0.1:4179',
    reuseExistingServer: !process.env.CI,
  },
});
